'use client';

import { useState, useEffect } from 'react';
import MasonryGallery from '@/components/MasonryGallery';
import PhotoModal from '@/components/modal/PhotoModal';
import { Photo, Gallery } from '@/types/database';
import JSZip from 'jszip';

interface UserVanityClientProps {
  userId: string;
}

export default function UserVanityClient({ userId }: UserVanityClientProps) {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeGallery, setActiveGallery] = useState<string | null>(null);
  const [userGalleriesPhotos, setUserGalleriesPhotos] = useState<Record<string, Photo[]>>({});
  const [userHandle, setUserHandle] = useState<string | null>(null);
  const [isGalleryDownloading, setIsGalleryDownloading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchUserGalleries = async () => {
      try {
        setUserHandle(userId);
        
        // Fetch user galleries via API route
        const response = await fetch(`/api/galleries/user/${encodeURIComponent(userId)}`);
        const data = await response.json();
        
        if (data.galleries && Array.isArray(data.galleries)) {
          setGalleries(data.galleries);
          
          // If we have galleries, set the first one as active
          if (data.galleries.length > 0) {
            setActiveGallery(data.galleries[0].id);
          }
        } else {
          setError('No galleries found for this user');
        }
      } catch (err: any) {
        console.error('Error fetching user galleries:', err);
        setError(`Failed to load galleries for user ${userId}: ${err.message || err}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserGalleries();
  }, [userId]);

  // Fetch photos for a specific gallery when active gallery changes
  useEffect(() => {
    const fetchGalleryPhotos = async () => {
      if (!activeGallery || userGalleriesPhotos[activeGallery]) {
        return; // Already loaded or no active gallery
      }

      try {
        // Get user ID first
        const userResponse = await fetch(`/api/photos/user/${encodeURIComponent(userId)}`);
        const userData = await userResponse.json();
        
        // Get photos for this specific gallery that belong to this user
        const galleryResponse = await fetch(`/api/photos/gallery/${activeGallery}`);
        const galleryData = await galleryResponse.json();
        
        if (galleryData.photos && Array.isArray(galleryData.photos)) {
          // Filter to only show photos tagged to this user
          const userPhotos = galleryData.photos.filter((photo: Photo) => 
            photo.user_tag_id === userId || 
            (photo.b2_file_key && photo.b2_file_key.includes(`/${userId}/`))
          );
          
          setUserGalleriesPhotos(prev => ({
            ...prev,
            [activeGallery]: userPhotos
          }));
        }
      } catch (err: any) {
        console.error('Error fetching gallery photos:', err);
      }
    };

    fetchGalleryPhotos();
  }, [activeGallery, userId, userGalleriesPhotos]);

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
  };

  const handleModalClose = () => {
    setSelectedPhoto(null);
  };

  const handleDownload = async (photo: Photo) => {
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = photo.public_url;
    link.download = photo.id.split('/').pop() || 'photo.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadGallery = async (galleryId: string, galleryTitle: string) => {
    setIsGalleryDownloading(prev => ({ ...prev, [galleryId]: true }));
    try {
      // Get the photos for this specific gallery
      const photos = userGalleriesPhotos[galleryId] || [];
      
      if (photos.length === 0) {
        console.error('No photos found for gallery:', galleryId);
        return;
      }
      
      // Create a zip of all gallery photos for this user
      const zip = new JSZip();
      
      for (const photo of photos) {
        const response = await fetch(photo.public_url);
        const blob = await response.blob();
        const fileName = photo.b2_file_key.split('/').pop() || 'photo.jpg';
        zip.file(fileName, blob);
      }
      
      const content = await zip.generateAsync({type: "blob"});
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `${galleryTitle.replace(/\s+/g, '_')}_gallery.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error downloading gallery:', error);
    } finally {
      setIsGalleryDownloading(prev => ({ ...prev, [galleryId]: false }));
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold text-center mb-8">LuxSync Gallery</h1>
        <p>Loading galleries for {userId}...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold text-center mb-8">LuxSync Gallery</h1>
        <p className="text-red-500">{error}</p>
      </main>
    );
  }

  const activeGalleryData = galleries.find(g => g.id === activeGallery);
  const activeGalleryPhotos = userGalleriesPhotos[activeGallery || ''] || [];

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">LuxSync Gallery</h1>
        <h2 className="text-2xl font-semibold text-gray-800">Photos for {userHandle}</h2>
        <p className="text-gray-600">User: {userHandle}</p>
      </div>

      {/* Gallery Navigation */}
      <div className="mb-8">
        <div className="flex flex-wrap justify-center gap-2">
          {galleries.map(gallery => (
            <button
              key={gallery.id}
              onClick={() => setActiveGallery(gallery.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeGallery === gallery.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              {gallery.title}
            </button>
          ))}
        </div>
      </div>

      {/* Active Gallery Header */}
      {activeGalleryData && (
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">{activeGalleryData.title}</h3>
          <p className="text-gray-600">{activeGalleryData.event_date}</p>
          <div className="mt-2">
            <button
              onClick={() => handleDownloadGallery(activeGalleryData.id, activeGalleryData.title)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center mx-auto"
              disabled={isGalleryDownloading[activeGalleryData.id] || false}
            >
              {isGalleryDownloading[activeGalleryData.id] ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Downloading...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Gallery
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Gallery Photos */}
      {activeGalleryPhotos.length > 0 ? (
        <MasonryGallery photos={activeGalleryPhotos} onPhotoClick={handlePhotoClick} />
      ) : (
        <div className="text-center py-12">
          <p>No photos found for user {userHandle} in this gallery.</p>
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