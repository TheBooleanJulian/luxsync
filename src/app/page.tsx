'use client';

import { useState, useEffect } from 'react';
import MasonryGallery from '@/components/MasonryGallery';
import PhotoModal from '@/components/modal/PhotoModal';
import { Photo } from '@/types/database';
import { getGalleries, getPhotosByGallery } from '@/utils/supabase/server';

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [currentGallery, setCurrentGallery] = useState<{ title: string; date: string; folderName: string } | null>(null);

  useEffect(() => {
    const fetchGalleriesAndPhotos = async () => {
      try {
        // First, get the list of galleries from the database
        const galleries = await getGalleries();
        
        if (galleries && galleries.length > 0) {
          // Get photos for the first gallery from the database
          const firstGallery = galleries[0];
          
          // Set gallery information
          setCurrentGallery({
            date: firstGallery.event_date,
            title: firstGallery.title,
            folderName: firstGallery.folder_name
          });
          
          // Get photos for this gallery
          const photos = await getPhotosByGallery(firstGallery.id);
          
          if (photos) {
            setPhotos(photos);
          } else {
            setError('No photos found in the selected gallery');
          }
        } else {
          setError('No galleries found in database');
        }
      } catch (err: any) {
        console.error('Error fetching galleries or photos:', err);
        setError(`Failed to load galleries or photos from database: ${err.message || err}`);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleriesAndPhotos();
  }, []);

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
      const galleryFolderName = encodeURIComponent(currentGallery.folderName);
      const downloadUrl = `/api/galleries/download/${galleryFolderName}`;
      
      // Trigger download by redirecting to the API endpoint
      window.location.href = downloadUrl;
    } catch (error) {
      console.error('Error downloading gallery:', error);
      alert('Failed to download gallery');
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold text-center mb-8">LuxSync Gallery</h1>
        <p>Loading photos...</p>
      </main>
    );
  }

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
            <p className="text-gray-600">{currentGallery.date}</p>
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