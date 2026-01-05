'use client';

import { useState, useEffect } from 'react';
import MasonryGallery from '@/components/MasonryGallery';
import { Photo } from '@/types/database';
import { getPhotosForGallery } from '@/utils/b2/gallery-parser';

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGalleriesAndPhotos = async () => {
      try {
        // First, get the list of galleries
        const response = await fetch('/api/galleries');
        const data = await response.json();
        
        if (data.galleries && data.galleries.length > 0) {
          // Use the first gallery in the list
          const firstGallery = data.galleries[0];
          const galleryPhotos = await getPhotosForGallery(firstGallery.folderName);
          setPhotos(galleryPhotos);
        } else {
          setError('No galleries found in B2 storage');
        }
      } catch (err: any) {
        console.error('Error fetching galleries or photos:', err);
        setError(`Failed to load galleries or photos from B2 storage: ${err.message || err}`);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleriesAndPhotos();
  }, []);

  const handlePhotoClick = (photo: Photo) => {
    console.log('Photo clicked:', photo);
    // In a real app, this might open a modal or navigate to a detail page
    alert(`Photo clicked: ${photo.id}`);
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
      <h1 className="text-3xl font-bold text-center mb-8">LuxSync Gallery</h1>
      {photos.length > 0 ? (
        <MasonryGallery photos={photos} onPhotoClick={handlePhotoClick} />
      ) : (
        <div className="text-center py-12">
          <p>No photos found in the gallery.</p>
          <p>Check your B2 storage for images in the 'B2 LuxSync' subfolder.</p>
        </div>
      )}
    </main>
  );
}