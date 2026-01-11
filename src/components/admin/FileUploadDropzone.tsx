'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileWithPreview extends File {
  preview: string;
}

interface FileUploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  folderPath: string;
}

export default function FileUploadDropzone({ onFilesSelected, folderPath }: FileUploadDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files) as FileWithPreview[];
      
      // Create previews for image files
      const filesWithPreviews = droppedFiles.map(file => {
        if (file.type.startsWith('image/')) {
          return Object.assign(file, {
            preview: URL.createObjectURL(file)
          });
        }
        return file;
      });

      setFiles(prev => [...prev, ...filesWithPreviews]);
      onFilesSelected([...files, ...droppedFiles]);
    }
  }, [files, onFilesSelected]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files) as FileWithPreview[];
      
      // Create previews for image files
      const filesWithPreviews = selectedFiles.map(file => {
        if (file.type.startsWith('image/')) {
          return Object.assign(file, {
            preview: URL.createObjectURL(file)
          });
        }
        return file;
      });

      setFiles(prev => [...prev, ...filesWithPreviews]);
      onFilesSelected([...files, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-blue-500 bg-blue-900/20'
            : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <div className="flex flex-col items-center justify-center">
          <svg
            className="w-12 h-12 text-gray-400 mb-4"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-gray-300 mb-1">Drag and drop files here</p>
          <p className="text-sm text-gray-400 mb-2">or click to select files</p>
          <p className="text-xs text-gray-500">Supports images and other file types</p>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          multiple
          onChange={handleFileInput}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt,.zip"
        />
      </div>

      {/* Preview of selected files */}
      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-300 mb-3">Selected Files ({files.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <AnimatePresence>
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="relative group"
                >
                  <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                    {file.type.startsWith('image/') ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full p-2">
                        <div className="text-center">
                          <svg
                            className="w-8 h-8 text-gray-500 mx-auto mb-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <p className="text-xs text-gray-400 truncate">{file.name.substring(0, 15)}...</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 truncate px-1">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="flex justify-between items-center pt-4">
          <p className="text-sm text-gray-400">
            Total: {(files.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024).toFixed(2)} MB
          </p>
          <button
            onClick={() => {
              setFiles([]);
              onFilesSelected([]);
            }}
            className="text-sm text-red-400 hover:text-red-300"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}