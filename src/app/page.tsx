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
    console.error('Error loading home page from database:', error);
    
    // If database access fails, try to load from B2 storage as a fallback
    try {
      console.log('Attempting to load galleries from B2 storage as fallback...');
      const { getGalleriesFromB2 } = await import('@/utils/b2/gallery-parser');
      const b2Galleries = await getGalleriesFromB2();
      
      if (b2Galleries && b2Galleries.length > 0) {
        const firstGallery = b2Galleries[0];
        
        // Get photos for the first gallery from B2
        const { getPhotosForGallery } = await import('@/utils/b2/gallery-parser');
        const photos = await getPhotosForGallery(firstGallery.folder_name);
        
        console.log(`Loaded ${photos.length} photos from B2 for gallery ${firstGallery.title}`);
        
        return <HomePageClient 
          initialPhotos={photos} 
          initialGallery={firstGallery} 
          initialError={null} 
        />;
      }
    } catch (b2Error: any) {
      console.error('Error loading from B2 fallback:', b2Error);
    }
    
    // If both database and B2 fail, return error
    return <HomePageClient 
      initialPhotos={[]} 
      initialGallery={null} 
      initialError={`Failed to load galleries or photos from database: ${error.message || error}`} 
    />;
  }
}