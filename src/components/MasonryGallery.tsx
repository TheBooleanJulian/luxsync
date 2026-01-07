'use client';

import React from 'react';
import Image from 'next/image';
import { Photo } from '@/types/database';

interface MasonryGalleryProps {
  photos: Photo[];
  onPhotoClick?: (photo: Photo) => void;
}

const MasonryGallery: React.FC<MasonryGalleryProps> = ({ photos, onPhotoClick }) => {
  return (
    <div className="w-full max-w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="cursor-pointer overflow-hidden rounded-lg shadow-lg transition-transform duration-300 hover:scale-[1.02] aspect-[3/4]"
            onClick={() => onPhotoClick?.(photo)}
          >
            <div 
              className="relative w-full h-full overflow-hidden bg-gray-100"
            >
              <Image
                src={photo.optimized_url || photo.public_url}
                alt={`Gallery photo ${(photo.b2_file_key || photo.id).split('/').pop()}`}
                className="h-full w-full object-cover"
                loading="lazy"
                width={photo.width ? Math.min(photo.width, 600) : 600}
                height={photo.height ? Math.min(photo.height, 800) : 800}
                style={{ objectFit: 'cover' }}
                unoptimized={false}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MasonryGallery;