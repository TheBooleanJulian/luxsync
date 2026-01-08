import { getGalleryByFolderName, getPhotosByGallery } from '@/utils/supabase/server';
import GalleryPageClient from './GalleryPageClient';

interface GalleryPageProps {
  params: {
    folderName: string;
  };
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const folderName = decodeURIComponent(params.folderName);
  
  try {
    // Try to get gallery from database first
    const gallery = await getGalleryByFolderName(folderName);
    
    if (!gallery) {
      // If not found in database, try to get from B2
      const { getGalleriesFromB2 } = await import('@/utils/b2/gallery-parser');
      const b2Galleries = await getGalleriesFromB2();
      const b2Gallery = b2Galleries.find(g => g.folder_name === folderName);
      
      if (!b2Gallery) {
        return (
          <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-3xl font-bold mb-8">Gallery Not Found</h1>
            <p>Gallery with name "{folderName}" does not exist.</p>
          </div>
        );
      }
      
      // Get photos for the B2 gallery
      const { getPhotosForGallery } = await import('@/utils/b2/gallery-parser');
      const photos = await getPhotosForGallery(folderName);
      
      return (
        <GalleryPageClient 
          initialPhotos={photos} 
          initialGallery={b2Gallery} 
          initialError={null} 
        />
      );
    }
    
    // Get photos for the gallery from database
    const photos = await getPhotosByGallery(gallery.id);
    
    return (
      <GalleryPageClient 
        initialPhotos={photos} 
        initialGallery={gallery} 
        initialError={null} 
      />
    );
  } catch (error) {
    console.error('Error loading gallery:', error);
    return (
      <GalleryPageClient 
        initialPhotos={[]} 
        initialGallery={null} 
        initialError={'Error loading gallery'} 
      />
    );
  }
}