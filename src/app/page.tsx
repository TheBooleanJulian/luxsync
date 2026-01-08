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
    // Try to fetch from database first
    const galleries = await getGalleries();
    
    // If we have galleries in the database, show the gallery listing
    if (galleries && galleries.length > 0) {
      return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-center mb-8">LuxSync Gallery</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleries.map((gallery) => (
              <div 
                key={gallery.id} 
                className="border border-gray-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer bg-white"
                onClick={() => {
                  // Redirect to the specific gallery page
                  window.location.href = `/gallery/${encodeURIComponent(gallery.folder_name)}`;
                }}
              >
                <h2 className="text-xl font-semibold mb-2">{gallery.title}</h2>
                <p className="text-gray-600 mb-1">{gallery.event_date}</p>
                <p className="text-sm text-gray-500">ID: {gallery.folder_name}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }
  } catch (error: any) {
    console.error('Database access failed, falling back to B2 storage:', error);
  }
  
  // If database is empty or failed, try to sync from B2
  try {
    console.log('Database empty or failed, attempting to sync from B2...');
    const { syncGalleriesToDatabase } = await import('@/utils/sync/gallery-sync');
    await syncGalleriesToDatabase();
    
    // Try to fetch galleries again after sync
    const syncedGalleries = await getGalleries();
    
    if (syncedGalleries && syncedGalleries.length > 0) {
      console.log('Successfully synced galleries from B2, showing gallery list:', syncedGalleries.length);
      
      return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-center mb-8">LuxSync Gallery</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {syncedGalleries.map((gallery) => (
              <div 
                key={gallery.id} 
                className="border border-gray-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer bg-white"
                onClick={() => {
                  // Redirect to the specific gallery page
                  window.location.href = `/gallery/${encodeURIComponent(gallery.folder_name)}`;
                }}
              >
                <h2 className="text-xl font-semibold mb-2">{gallery.title}</h2>
                <p className="text-gray-600 mb-1">{gallery.event_date}</p>
                <p className="text-sm text-gray-500">ID: {gallery.folder_name}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }
  } catch (syncError) {
    console.error('Sync failed, falling back to B2 directly:', syncError);
  }
  
  // If sync also fails, try B2 directly
  try {
    console.log('Attempting to load galleries from B2 storage directly...');
    const { getGalleriesFromB2 } = await import('@/utils/b2/gallery-parser');
    const b2Galleries = await getGalleriesFromB2();
    
    if (b2Galleries && b2Galleries.length > 0) {
      console.log(`Loaded ${b2Galleries.length} galleries from B2`);
      
      return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-center mb-8">LuxSync Gallery</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {b2Galleries.map((gallery) => (
              <div 
                key={gallery.id || gallery.folder_name} 
                className="border border-gray-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer bg-white"
                onClick={() => {
                  // Redirect to the specific gallery page
                  window.location.href = `/gallery/${encodeURIComponent(gallery.folder_name)}`;
                }}
              >
                <h2 className="text-xl font-semibold mb-2">{gallery.title}</h2>
                <p className="text-gray-600 mb-1">{gallery.event_date}</p>
                <p className="text-sm text-gray-500">ID: {gallery.folder_name}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }
  } catch (b2Error: any) {
    console.error('Error loading from B2 directly:', b2Error);
  }
  
  // If everything fails
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-3xl font-bold text-center mb-8">LuxSync Gallery</h1>
      <p className="text-red-500">No galleries found in database or B2 storage</p>
      <p>Make sure your B2 credentials are configured correctly in the environment variables.</p>
    </div>
  );
}