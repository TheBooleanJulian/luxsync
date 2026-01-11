'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface FileData {
  fileName: string;
  b2Path: string;
  size: number;
  type: string;
  url?: string;
}

interface FileThumbnailGridProps {
  onSelectFile: (file: FileData) => void;
  selectedFile?: FileData;
}

export default function FileThumbnailGrid({ onSelectFile, selectedFile }: FileThumbnailGridProps) {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/list-files');
        const data = await response.json();
        
        if (data.success) {
          // Add type information to files
          const filesWithType = data.files.map((file: any) => ({
            ...file,
            type: getFileType(file.fileName),
          }));
          
          setFiles(filesWithType);
        } else {
          setError(data.message || 'Failed to load files');
        }
      } catch (err) {
        setError('An error occurred while loading files');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const getFileType = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) {
      return 'image';
    }
    return 'file';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-700 rounded-md p-4">
        <p className="text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {files.map((file, index) => (
          <div
            key={`${file.b2Path}-${index}`}
            onClick={() => onSelectFile(file)}
            className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
              selectedFile?.b2Path === file.b2Path
                ? 'border-blue-500 ring-2 ring-blue-500/30'
                : 'border-gray-600 hover:border-gray-500'
            }`}
          >
            <div className="aspect-square bg-gray-800 flex items-center justify-center">
              {file.type === 'image' ? (
                <img
                  src={file.url || `/api/admin/download/${encodeURIComponent(file.b2Path)}`}
                  alt={file.fileName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // If image fails to load, show fallback icon
                    (e.target as HTMLImageElement).onerror = null;
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = e.target.parentElement;
                    if (parent) {
                      const fallbackIcon = document.createElement('div');
                      fallbackIcon.className = 'flex items-center justify-center h-full';
                      fallbackIcon.innerHTML = `
                        <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      `;
                      parent.appendChild(fallbackIcon);
                    }
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-2 text-center">
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
                  <p className="text-xs text-gray-400 truncate w-full">{file.fileName.substring(0, 12)}...</p>
                </div>
              )}
            </div>
            <div className="p-2 bg-gray-700">
              <p className="text-xs text-gray-300 truncate">{file.fileName}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
        ))}
      </div>
      
      {files.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No files found in the system</p>
        </div>
      )}
    </div>
  );
}