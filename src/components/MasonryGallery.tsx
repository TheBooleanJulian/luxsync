'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveMasonry } from 'react-responsive-masonry';
import { Photo } from '@/types/database';

interface MasonryGalleryProps {
  photos: Photo[];
  onPhotoClick?: (photo: Photo) => void;
}

const MasonryGallery: React.FC<MasonryGalleryProps> = ({ photos, onPhotoClick }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render the masonry until client-side hydration is complete
  if (!isMounted) {
    return (
      <div className="flex justify-center items-center h-64 w-full">
        <p className="text-gray-500">Loading gallery...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1200: 4 }}>
        <div className="space-y-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="cursor-pointer overflow-hidden rounded-lg shadow-lg transition-transform duration-300 hover:scale-[1.02]"
              onClick={() => onPhotoClick?.(photo)}
            >
              <div 
                className="relative overflow-hidden bg-gray-100"
                style={{ aspectRatio: photo.width && photo.height ? `${photo.width}/${photo.height}` : '2/3' }}
              >
                <img
                  src={photo.public_url}
                  alt={`Gallery photo ${photo.id}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </ResponsiveMasonry>
    </div>
  );
};

export default MasonryGallery;