import { getGalleries, getPhotosByGallery } from '@/utils/supabase/server';
import HomePageClient from './HomePageClient';

import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  // Default metadata for the main page
  return {
    title: 'LuxSync - Client Photo Gallery',
    description: 'A photo gallery platform for clients to view and download their photos',
    openGraph: {
      title: 'LuxSync Gallery',
      description: 'Browse and download your photos from LuxSync',
      type: 'website',
      url: 'https://luxsync.vercel.app',
    },
  };
}

export default async function Home() {
  // Fetch data server-side
  try {
    const galleries = await getGalleries();
    
    if (galleries && galleries.length > 0) {
      const firstGallery = galleries[0];
      
      // Get photos for the first gallery
      const photos = await getPhotosByGallery(firstGallery.id);
      
      return <HomePageClient 
        initialPhotos={photos} 
        initialGallery={firstGallery} 
        initialError={null} 
      />;
    } else {
      return <HomePageClient 
        initialPhotos={[]} 
        initialGallery={null} 
        initialError={'No galleries found in database'} 
      />;
    }
  } catch (error: any) {
    console.error('Error loading home page:', error);
    return <HomePageClient 
      initialPhotos={[]} 
      initialGallery={null} 
      initialError={`Failed to load galleries or photos from database: ${error.message || error}`} 
    />;
  }
}