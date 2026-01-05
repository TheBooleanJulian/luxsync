import { b2Service } from './service';
import { Photo } from '@/types/database';

export interface GalleryFolder {
  id: string;
  title: string;
  eventDate: string;
  folderName: string;
  coverImage?: string;
}

/**
 * Parse gallery folders from B2 storage
 */
export async function getGalleriesFromB2(): Promise<GalleryFolder[]> {
  try {
    console.log('Attempting to fetch galleries from B2');
    console.log('B2_PUBLIC_URL:', process.env.B2_PUBLIC_URL);
    console.log('B2_BUCKET_NAME:', process.env.B2_BUCKET_NAME);
    console.log('B2_BASE_PATH:', process.env.B2_BASE_PATH);
    
    // List all objects in the base path
    const result = await b2Service.listObjects('', 1000);
    
    // Extract unique gallery folders from the object keys
    const galleryFolders = new Set<string>();
    
    result.objects.forEach(obj => {
      if (obj.Key) {
        // Extract the first directory level after B2_BASE_PATH
        // e.g. if key is "B2 LuxSync/galleries/2026-01-05 Miku Expo/Ruki/photo.jpg"
        // we want to extract "2026-01-05 Miku Expo"
        const pathParts = obj.Key.split('/');
        if (pathParts.length >= 3) { // At least B2_BASE_PATH/gallery/user/image
          const galleryName = pathParts[1]; // The gallery folder name
          if (galleryName) {
            galleryFolders.add(galleryName);
          }
        }
      }
    });
    
    // Convert to GalleryFolder objects
    const galleries: GalleryFolder[] = Array.from(galleryFolders).map(folderName => {
      // Extract date and title from folder name (format: YYYY-MM-DD Title)
      const dateMatch = folderName.match(/^(\d{4}-\d{2}-\d{2})\s+(.+)$/);
      
      if (dateMatch) {
        return {
          id: folderName, // Using folder name as ID for now
          title: dateMatch[2].trim(),
          eventDate: dateMatch[1],
          folderName: folderName,
          coverImage: getCoverImageForGallery(result.objects, folderName),
        };
      } else {
        // If no date in folder name, use the full name as title
        return {
          id: folderName,
          title: folderName,
          eventDate: new Date().toISOString().split('T')[0], // Use current date as fallback
          folderName: folderName,
          coverImage: getCoverImageForGallery(result.objects, folderName),
        };
      }
    });
    
    return galleries;
  } catch (error) {
    console.error('Error getting galleries from B2:', error);
    throw error;
  }
}

/**
 * Get photos for a specific gallery from B2
 */
export async function getPhotosForGallery(galleryFolder: string): Promise<Photo[]> {
  try {
    console.log('Attempting to fetch photos for gallery:', galleryFolder);
    console.log('B2_PUBLIC_URL:', process.env.B2_PUBLIC_URL);
    console.log('B2_BUCKET_NAME:', process.env.B2_BUCKET_NAME);
    console.log('B2_BASE_PATH:', process.env.B2_BASE_PATH);
    
    // List all objects in the specific gallery folder
    const result = await b2Service.listObjects(`${galleryFolder}/`, 1000);
    
    // Extract photos from the objects
    const photos: Photo[] = [];
    
    for (const obj of result.objects) {
      if (obj.Key && obj.Size && obj.LastModified) {
        // Extract user handle from path (format: B2_BASE_PATH/gallery/user/image.jpg)
        const pathParts = obj.Key.split('/');
        if (pathParts.length >= 3) {
          const galleryName = pathParts[1];
          const userHandle = pathParts[2];
          const fileName = pathParts[pathParts.length - 1];
          
          // Skip if this is not an image file
          if (isImageFile(fileName)) {
            // Extract dimensions from metadata or filename
            const dimensionMatch = fileName.match(/_(\d+)x(\d+)\./);
            
            // Default to 3:2 portrait orientation
            let width = 600;
            let height = 900;
            
            // If dimensions are in filename, use those
            if (dimensionMatch) {
              width = parseInt(dimensionMatch[1]);
              height = parseInt(dimensionMatch[2]);
            } else {
              // Try to get dimensions from B2 metadata
              try {
                const metadata = await b2Service.getObjectMetadata(obj.Key);
                
                // Check if width and height are stored in B2 metadata
                if (metadata.metadata && metadata.metadata.width && metadata.metadata.height) {
                  width = parseInt(metadata.metadata.width);
                  height = parseInt(metadata.metadata.height);
                }
              } catch (metadataError) {
                console.error('Error fetching metadata for image:', obj.Key, metadataError);
                // Use default dimensions if metadata fetch fails
              }
            }
            
            const originalUrl = `${process.env.B2_PUBLIC_URL}/file/${process.env.B2_BUCKET_NAME}/${obj.Key}`;
            
            photos.push({
              id: obj.Key, // Using the full key as ID
              gallery_id: galleryName,
              user_tag_id: userHandle, // This would map to a user in your DB
              b2_file_key: obj.Key,
              public_url: originalUrl, // Original resolution
              optimized_url: originalUrl, // For now, same as original - in production, this would be a CDN or service URL
              width,
              height,
            });
          }
        }
      }
    }
    
    return photos;
  } catch (error) {
    console.error('Error getting photos for gallery from B2:', error);
    throw error;
  }
}

/**
 * Get cover image for a gallery
 */
function getCoverImageForGallery(objects: any[], galleryName: string): string | undefined {
  for (const obj of objects) {
    if (obj.Key && obj.Key.startsWith(`B2 LuxSync/${galleryName}/`)) {
      const pathParts = obj.Key.split('/');
      if (pathParts.length >= 3 && isImageFile(pathParts[pathParts.length - 1])) {
        // Return the first image found in the gallery as cover
        return `${process.env.B2_PUBLIC_URL}/file/${process.env.B2_BUCKET_NAME}/${obj.Key}`;
      }
    }
  }
  return undefined;
}

/**
 * Check if a file is an image
 */
function isImageFile(fileName: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'];
  const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return imageExtensions.includes(ext);
}