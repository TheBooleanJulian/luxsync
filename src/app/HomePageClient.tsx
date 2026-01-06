'use client';

import { useState } from 'react';
import MasonryGallery from '@/components/MasonryGallery';
import PhotoModal from '@/components/modal/PhotoModal';
import { Photo, Gallery } from '@/types/database';

interface HomePageClientProps {
  initialPhotos: Photo[];
  initialGallery: Gallery | null;
  initialError: string | null;
}

export default function HomePageClient({ initialPhotos, initialGallery, initialError }: HomePageClientProps) {
  const [photos] = useState<Photo[]>(initialPhotos);
  const [error] = useState<string | null>(initialError);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [currentGallery] = useState<Gallery | null>(initialGallery);

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
  };

  const handleModalClose = () => {
    setSelectedPhoto(null);
  };

  const handleDownload = (photo: Photo) => {
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = photo.public_url;
    link.download = photo.id.split('/').pop() || 'photo.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadGallery = async () => {
    if (!currentGallery) {
      alert('No gallery selected');
      return;
    }
    
    try {
      // Create download URL using the gallery folder name
      const galleryFolderName = encodeURIComponent(currentGallery.folder_name);
      const downloadUrl = `/api/galleries/download/${galleryFolderName}`;
      
      // Trigger download by redirecting to the API endpoint
      window.location.href = downloadUrl;
    } catch (error) {
      console.error('Error downloading gallery:', error);
      alert('Failed to download gallery');
    }
  };

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold text-center mb-8">LuxSync Gallery</h1>
        <p className="text-red-500">{error}</p>
        <p>Make sure your B2 credentials are configured correctly in the environment variables.</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">LuxSync Gallery</h1>
        {currentGallery && (
          <>
            <h2 className="text-2xl font-semibold text-gray-800">{currentGallery.title}</h2>
            <p className="text-gray-600">{currentGallery.event_date}</p>
            <p className="text-gray-500 text-sm mt-1">Gallery ID: {currentGallery.folder_name}</p>
          </>
        )}
        <div className="mt-4">
          <button
            onClick={handleDownloadGallery}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center mx-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Gallery
          </button>
        </div>
      </div>
      
      {photos.length > 0 ? (
        <MasonryGallery photos={photos} onPhotoClick={handlePhotoClick} />
      ) : (
        <div className="text-center py-12">
          <p>No photos found in the gallery.</p>
          <p>Check your B2 storage for images in the 'B2 LuxSync' subfolder.</p>
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