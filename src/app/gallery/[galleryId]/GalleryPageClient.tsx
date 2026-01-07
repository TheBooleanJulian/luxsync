'use client';

import { useState, useEffect } from 'react';
import MasonryGallery from '@/components/MasonryGallery';
import PhotoModal from '@/components/modal/PhotoModal';
import { Photo } from '@/types/database';
import JSZip from 'jszip';

interface GalleryPageClientProps {
  photos: Photo[];
  gallery: any; // Gallery object from Supabase
}

export default function GalleryPageClient({ photos, gallery }: GalleryPageClientProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [pin, setPin] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);
  const [pinError, setPinError] = useState('');
  const [isGalleryDownloading, setIsGalleryDownloading] = useState(false);
  const [isPhotoDownloading, setIsPhotoDownloading] = useState(false);
  
  // Check if gallery requires PIN access
  useEffect(() => {
    if (gallery.access_pin) {
      setShowPinInput(true);
    }
  }, [gallery.access_pin]);

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
  };

  const handleModalClose = () => {
    setSelectedPhoto(null);
  };

  const handleDownload = async (photo: Photo) => {
    setIsPhotoDownloading(true);
    try {
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = photo.public_url;
      link.download = photo.id.split('/').pop() || 'photo.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsPhotoDownloading(false);
    }
  };

  const handleDownloadGallery = async () => {
    setIsGalleryDownloading(true);
    try {
      // Simulate gallery download
      // In a real implementation, this would zip and download all gallery photos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a zip of all gallery photos
      const zip = new JSZip();
      const promises = [];
      
      for (const photo of photos) {
        const response = await fetch(photo.public_url);
        const blob = await response.blob();
        const fileName = photo.id.split('/').pop() || 'photo.jpg';
        zip.file(fileName, blob);
      }
      
      const content = await zip.generateAsync({type:"blob"});
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `${gallery.title}_gallery.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error downloading gallery:', error);
    } finally {
      setIsGalleryDownloading(false);
    }
  };

  // Function to handle PIN submission
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/gallery/validate-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          folderName: gallery.folder_name,
          pin: pin,
        }),
      });
      
      const data = await response.json();
      
      if (data.valid) {
        setShowPinInput(false);
        setPinError('');
      } else {
        setPinError('Incorrect PIN. Please try again.');
      }
    } catch (error) {
      console.error('Error validating PIN:', error);
      setPinError('Error validating PIN. Please try again.');
    }
  };

  // Show PIN input if gallery is protected
  if (showPinInput) {
    return (
      <main className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-6">Gallery Access</h1>
          <p className="text-center text-gray-600 mb-6">This gallery is protected. Please enter the PIN to continue.</p>
          
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))} // Only allow numbers
                placeholder="Enter 4-digit PIN"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-xl tracking-widest"
                autoFocus
              />
            </div>
            
            {pinError && (
              <p className="text-red-500 text-center">{pinError}</p>
            )}
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors"
              disabled={pin.length !== 4}
            >
              Access Gallery
            </button>
          </form>
        </div>
      </main>
    );
  }
  
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">LuxSync Gallery</h1>
        <h2 className="text-2xl font-semibold text-gray-800">{gallery.title}</h2>
        <p className="text-gray-600">{gallery.event_date}</p>
        <p className="text-gray-500 text-sm mt-1">Gallery ID: {gallery.folder_name}</p>
        <div className="mt-4">
          <button
            onClick={handleDownloadGallery}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center mx-auto"
            disabled={isGalleryDownloading}
          >
            {isGalleryDownloading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Downloading...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Gallery
              </>
            )}
          </button>
        </div>
      </div>
      
      {photos.length > 0 ? (
        <MasonryGallery photos={photos} onPhotoClick={handlePhotoClick} />
      ) : (
        <div className="text-center py-12">
          <p>No photos found in this gallery.</p>
          <p>Check your B2 storage for images in the gallery.</p>
        </div>
      )}
      
      {selectedPhoto && (
        <PhotoModal 
          photo={selectedPhoto} 
          onClose={handleModalClose} 
          onDownload={handleDownload} 
        />
      )}
    </main>
  );
}