'use client';

import { useState } from 'react';
import MasonryGallery from '@/components/MasonryGallery';
import PhotoModal from '@/components/modal/PhotoModal';
import { Photo } from '@/types/database';

interface GalleryPageClientProps {
  photos: Photo[];
  gallery: any; // Gallery object from Supabase
}

export default function GalleryPageClient({ photos, gallery }: GalleryPageClientProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

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

  const handleDownloadGallery = () => {
    // This would download all photos in the current gallery
    alert('Gallery download functionality would be implemented here');
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">LuxSync Gallery</h1>
        <h2 className="text-2xl font-semibold text-gray-800">{gallery.title}</h2>
        <p className="text-gray-600">{gallery.event_date}</p>
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