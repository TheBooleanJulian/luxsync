'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Photo } from '@/types/database';

interface MasonryGalleryProps {
  photos: Photo[];
  onPhotoClick?: (photo: Photo) => void;
}

const ResponsiveMasonry = dynamic(
  () => import('react-responsive-masonry').then((mod) => mod.ResponsiveMasonry),
  { ssr: false, loading: () => <div className="flex justify-center items-center h-64 w-full">Loading gallery...</div> }
);

const MasonryGallery: React.FC<MasonryGalleryProps> = ({ photos, onPhotoClick }) => {
  return (
    <div className="w-full max-w-full">
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
                <Image
                  src={photo.optimized_url || photo.public_url}
                  alt={`Gallery photo ${(photo.b2_file_key || photo.id).split('/').pop()}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  width={photo.width || 600}
                  height={photo.height || 800}
                  style={{ objectFit: 'cover' }}
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