import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getGalleryByFolderName } from '@/utils/supabase/server';
import { getPhotosByGallery } from '@/utils/supabase/server';

import MasonryGallery from '@/components/MasonryGallery';
import { Photo } from '@/types/database';

interface GalleryPageProps {
  params: {
    galleryId: string;
  };
}

export async function generateMetadata({ params }: { params: { galleryId: string } }): Promise<Metadata> {
  try {
    const galleryId = decodeURIComponent(params.galleryId);
    const gallery = await getGalleryByFolderName(galleryId);
    
    if (!gallery) {
      return {};
    }

    // Get the first photo as the cover image if no specific cover is set
    const photos = await getPhotosByGallery(gallery.id);
    const coverImage = gallery.cover_image_url || (photos.length > 0 ? photos[0].public_url : '');

    return {
      title: `${gallery.title} | LuxSync Gallery`,
      description: `View photos from the ${gallery.title} event on ${gallery.event_date}`,
      openGraph: {
        title: gallery.title,
        description: `Photos from the ${gallery.title} event on ${gallery.event_date}`,
        type: 'website',
        url: `https://luxsync.vercel.app/gallery/${encodeURIComponent(gallery.folder_name)}`,
        images: coverImage ? [
          {
            url: coverImage,
            width: 1200,
            height: 630,
            alt: gallery.title,
          }
        ] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: gallery.title,
        description: `Photos from the ${gallery.title} event on ${gallery.event_date}`,
        images: coverImage,
      },
    };
  } catch (error) {
    console.error('Error generating metadata for gallery:', error);
    return {};
  }
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const galleryId = decodeURIComponent(params.galleryId);
  
  try {
    // Fetch gallery and photos server-side
    const gallery = await getGalleryByFolderName(galleryId);
    
    if (!gallery) {
      notFound();
    }
    
    const photos = await getPhotosByGallery(gallery.id);
    
    // Render gallery directly
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">LuxSync Gallery</h1>
          <h2 className="text-2xl font-semibold text-gray-800">{gallery.title}</h2>
          <p className="text-gray-600">{gallery.event_date}</p>
          <div className="mt-4">
            <button
              onClick={() => alert('Gallery download functionality would be implemented here')}
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
          <MasonryGallery photos={photos} onPhotoClick={(photo) => alert('Photo click functionality would be implemented here')} />
        ) : (
          <div className="text-center py-12">
            <p>No photos found in this gallery.</p>
            <p>Check your B2 storage for images in the gallery.</p>
          </div>
        )}
      </main>
    );
  } catch (error) {
    console.error('Error loading gallery:', error);
    return (
      <main className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold text-center mb-8">LuxSync Gallery</h1>
        <p className="text-red-500">Error loading gallery</p>
      </main>
    );
  }
}

