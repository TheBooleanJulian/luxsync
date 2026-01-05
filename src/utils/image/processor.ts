import imageSize from 'image-size';
import { Readable } from 'stream';

export interface ImageDimensions {
  width: number;
  height: number;
  type: string;
}

/**
 * Get image dimensions from a buffer
 */
export function getImageDimensions(buffer: Buffer): ImageDimensions {
  try {
    const dimensions = imageSize(buffer);
    return {
      width: dimensions.width || 0,
      height: dimensions.height || 0,
      type: dimensions.type || 'unknown',
    };
  } catch (error) {
    console.error('Error getting image dimensions:', error);
    throw new Error('Invalid image file');
  }
}

/**
 * Validate image file type
 */
export function isValidImageType(buffer: Buffer, allowedTypes: string[] = ['jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff']): boolean {
  try {
    const dimensions = imageSize(buffer);
    return allowedTypes.includes(dimensions.type || '');
  } catch (error) {
    return false;
  }
}

/**
 * Validate image size (in bytes)
 */
export function isValidImageSize(buffer: Buffer, maxSizeInBytes: number = 10 * 1024 * 1024): boolean { // Default 10MB
  return buffer.length <= maxSizeInBytes;
}