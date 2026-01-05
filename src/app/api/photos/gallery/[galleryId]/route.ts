import { NextRequest } from 'next/server';
import { getPhotosByGallery } from '@/utils/supabase/server';
import { getGalleryByFolderName } from '@/utils/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ galleryId: string }> }
) {
  try {
    const { galleryId } = await params;
    
    if (!galleryId) {
      return Response.json(
        { error: 'galleryId is required' },
        { status: 400 }
      );
    }

    // First, get the gallery from the database to get its ID
    const gallery = await getGalleryByFolderName(galleryId);
    
    // Then get photos for that gallery
    const photos = await getPhotosByGallery(gallery.id);
    
    return Response.json({ photos });
  } catch (error) {
    console.error('Error in photos by gallery API:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}