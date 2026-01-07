import { NextRequest } from 'next/server';
import { b2Service } from '@/utils/b2/service';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    if (!process.env.ADMIN_PASSWORD) {
      return Response.json(
        { success: false, message: 'Admin password not configured' },
        { status: 500 }
      );
    }

    // In a real application, you would verify a session token or cookie
    // For now, we'll allow the request to continue but in production you'd check for session tokens

    const { b2Service } = await import('@/utils/b2/service');
    
    // Get all files from B2
    const { objects } = await b2Service.listObjects();
    
    // Get mapping from database to get original filenames
    const supabase = createClient();
    
    // Get all photos with their mappings
    const { data: photos, error: photosError } = await supabase
      .from('photos')
      .select('b2_file_key, public_url, width, height')
      .order('created_at', { ascending: false });
    
    if (photosError) {
      console.error('Error fetching photos:', photosError);
      return Response.json(
        { success: false, message: 'Error fetching photos from database' },
        { status: 500 }
      );
    }
    
    // Create a mapping from b2_file_key to original filename
    const fileMapping: Record<string, any> = {};
    if (photos) {
      photos.forEach(photo => {
        const fileName = photo.b2_file_key.split('/').pop() || '';
        fileMapping[fileName] = {
          b2Path: photo.b2_file_key,
          publicUrl: photo.public_url,
          width: photo.width,
          height: photo.height
        };
      });
    }
    
    // Format the files for the response
    const formattedFiles = objects.map((obj: any) => {
      const fileName = obj.Key?.split('/').pop() || obj.Key || '';
      const originalInfo = fileMapping[fileName] || {};
      
      return {
        fileName,
        b2Path: obj.Key,
        publicUrl: originalInfo.publicUrl || '',
        size: obj.Size,
        uploadTimestamp: obj.LastModified,
        originalInfo
      };
    });
    
    return Response.json({
      success: true,
      files: formattedFiles
    });
  } catch (error) {
    console.error('Error listing files:', error);
    return Response.json(
      { success: false, message: 'An error occurred while listing files' },
      { status: 500 }
    );
  }
}