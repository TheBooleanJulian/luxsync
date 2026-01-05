import { NextRequest } from 'next/server';
import { b2Service } from '@/utils/b2/service';
import { createClient } from '@/utils/supabase/server';
import { Photo } from '@/types/database';
import { getImageDimensions } from '@/utils/image/processor';

export async function POST(request: NextRequest) {
  try {
    // Note: In a real implementation, you'd process multipart form data
    // For this example, we'll assume JSON input with base64 encoded image data
    const body = await request.json();
    
    const { 
      imageBuffer: base64ImageBuffer, // base64 encoded image data
      fileName,
      galleryId,
      userId,
      contentType = 'image/jpeg'
    } = body;

    if (!base64ImageBuffer || !fileName || !galleryId) {
      return Response.json(
        { error: 'Missing required fields: imageBuffer, fileName, galleryId' },
        { status: 400 }
      );
    }

    // Upload to B2
    const uploadResult = await b2Service.uploadFile(
      Buffer.from(base64ImageBuffer, 'base64'),
      fileName,
      `galleries/${galleryId}`, // Organize by gallery ID
      contentType
    );

    // Connect to Supabase
    const supabase = createClient();

    // Get image dimensions from the buffer
    const imageBuffer = Buffer.from(base64ImageBuffer, 'base64'); 
    const dimensions = getImageDimensions(imageBuffer);
    const width = dimensions.width;
    const height = dimensions.height;

    // Insert photo record into Supabase
    const { data: photo, error } = await supabase
      .from('photos')
      .insert([{
        gallery_id: galleryId,
        user_tag_id: userId || null,
        b2_file_key: uploadResult.fileKey,
        public_url: uploadResult.publicUrl,
        width,
        height
      }])
      .select()
      .single();

    if (error) {
      console.error('Error inserting photo to Supabase:', error);
      return Response.json(
        { error: 'Failed to save photo metadata to database' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      photo: photo,
      message: 'Photo uploaded successfully'
    });
  } catch (error) {
    console.error('Error in photo upload API:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: GET route to list photos for a gallery
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get galleryId from query params
    const { searchParams } = new URL(request.url);
    const galleryId = searchParams.get('galleryId');
    
    if (!galleryId) {
      return Response.json(
        { error: 'galleryId is required' },
        { status: 400 }
      );
    }

    // Fetch photos from the database
    const { data: photos, error } = await supabase
      .from('photos')
      .select('*')
      .eq('gallery_id', galleryId);

    if (error) {
      console.error('Error fetching photos from Supabase:', error);
      return Response.json(
        { error: 'Failed to fetch photos' },
        { status: 500 }
      );
    }

    return Response.json({ photos });
  } catch (error) {
    console.error('Error in photos API:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}