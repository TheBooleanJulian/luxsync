'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveMasonry } from 'react-responsive-masonry';
import { Photo } from '@/types/database';

interface MasonryGalleryProps {
  photos: Photo[];
  onPhotoClick?: (photo: Photo) => void;
}

const MasonryGallery: React.FC<MasonryGalleryProps> = ({ photos, onPhotoClick }) => {
  return (
    <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1200: 4 }}>
      <div className="space-y-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="cursor-pointer overflow-hidden rounded-lg shadow-lg"
            onClick={() => onPhotoClick?.(photo)}
          >
            <div 
              className="relative overflow-hidden"
              style={{ aspectRatio: photo.width && photo.height ? `${photo.width}/${photo.height}` : '4/3' }}
            >
              <img
                src={photo.public_url}
                alt={`Gallery photo ${photo.id}`}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    </ResponsiveMasonry>
  );
};

export default MasonryGallery;