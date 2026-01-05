'use client';

import MasonryGallery from '@/components/MasonryGallery';
import { Photo } from '@/types/database';

export default function Home() {
  // Sample photo data for testing
  const samplePhotos: Photo[] = [
    {
      id: '1',
      gallery_id: 'gallery-1',
      user_tag_id: null,
      b2_file_key: 'sample-key-1',
      public_url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=600',
      width: 600,
      height: 400,
    },
    {
      id: '2',
      gallery_id: 'gallery-1',
      user_tag_id: null,
      b2_file_key: 'sample-key-2',
      public_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600',
      width: 600,
      height: 800,
    },
    {
      id: '3',
      gallery_id: 'gallery-1',
      user_tag_id: null,
      b2_file_key: 'sample-key-3',
      public_url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600',
      width: 600,
      height: 400,
    },
    {
      id: '4',
      gallery_id: 'gallery-1',
      user_tag_id: null,
      b2_file_key: 'sample-key-4',
      public_url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600',
      width: 600,
      height: 600,
    },
  ];

  const handlePhotoClick = (photo: Photo) => {
    console.log('Photo clicked:', photo);
    // In a real app, this might open a modal or navigate to a detail page
    alert(`Photo clicked: ${photo.id}`);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">LuxSync Gallery</h1>
      <MasonryGallery photos={samplePhotos} onPhotoClick={handlePhotoClick} />
    </main>
  );
}