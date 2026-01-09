import { NextRequest } from 'next/server';
import { b2Service } from '@/utils/b2/service';
import { createClient } from '@/utils/supabase/server';
import sizeOf from 'image-size';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting upload request');
    
    // Check if admin is authenticated (in a real app, you'd verify a session token)
    if (!process.env.ADMIN_PASSWORD) {
      return Response.json(
        { success: false, message: 'Admin password not configured' },
        { status: 500 }
      );
    }

    let formData;
    try {
      // Parse form data for file uploads
      console.log('Attempting to parse form data');
      formData = await request.formData();
      console.log('Form data parsed successfully');
    } catch (error) {
      // Handle the case where form data parsing fails (e.g., payload too large)
      console.error('Error parsing form data:', error);
      return Response.json(
        { success: false, message: 'Request payload too large. The server has a size limit (typically 4.5MB on free hosting tiers). Please reduce file sizes or contact the administrator to adjust server settings.' },
        { status: 413 }
      );
    }
    
    const files = formData.getAll('files') as File[];
    const folderPath = formData.get('folderPath') as string || '';

    console.log(`Processing ${files.length} files for upload to path: ${folderPath}`);

    if (files.length === 0) {
      return Response.json(
        { success: false, message: 'No files provided' },
        { status: 400 }
      );
    }

    // Use the B2 service
    const { b2Service } = await import('@/utils/b2/service');

    let processedFiles = 0;
    const errors: string[] = [];

    for (const file of files) {
      try {
        // Convert File to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Get image dimensions if it's an image
        let width, height;
        try {
          const dimensions = sizeOf(buffer);
          width = dimensions.width;
          height = dimensions.height;
        } catch (error) {
          // Not an image or couldn't read dimensions
          width = null;
          height = null;
        }

        // Generate a unique filename to hash the original name
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
        const hashedFileName = `${randomUUID()}.${fileExtension}`;
        
        // Construct the full B2 path
        const b2Path = `B2 LuxSync/${folderPath}/${hashedFileName}`.replace('//', '/');

        // Upload to B2 using the service
        await b2Service.uploadFile(buffer, hashedFileName, folderPath, file.type);

        // Calculate file hash (using a simple approach, in real app use proper hashing)
        const fileHash = await calculateFileHash(buffer);

        // Store metadata in Supabase using service role for write operations
        const supabase = createClient(true); // Use service role for write operations
        
        // First, ensure gallery exists
        const galleryName = folderPath.split('/')[0]; // Extract gallery name from path
        let gallery = null;
        
        // Try to find existing gallery
        const { data: existingGallery, error: galleryError } = await supabase
          .from('galleries')
          .select('*')
          .eq('folder_name', galleryName)
          .single();
          
        if (galleryError) {
          console.error('Error finding gallery:', galleryError);
          errors.push(`Failed to find or create gallery ${galleryName}: ${galleryError.message}`);
        } else if (existingGallery) {
          console.log(`Found existing gallery:`, existingGallery);
          gallery = existingGallery;
        } else {
          // Create new gallery if it doesn't exist
          const galleryTitle = galleryName.replace(/[_-]/g, ' ');
          const dateMatch = galleryName.match(/^(\d{4}[-_]\d{2}[-_]\d{2})/);
          const eventDate = dateMatch ? dateMatch[1].replace(/_/g, '-') : new Date().toISOString().split('T')[0];
          
          console.log(`Creating new gallery with title: ${galleryTitle}, date: ${eventDate}, folder_name: ${galleryName}`);
          
          const { data: newGallery, error: createError } = await supabase
            .from('galleries')
            .insert([{
              title: galleryTitle,
              event_date: eventDate,
              folder_name: galleryName,
            }])
            .select()
            .single();
            
          if (createError) {
            console.error('Error creating gallery:', createError);
            errors.push(`Failed to create gallery ${galleryName}: ${createError.message}`);
          } else {
            console.log(`Successfully created gallery:`, newGallery);
            gallery = newGallery;
          }
        }

        // Find or create user based on folder path
        const userHandle = folderPath.split('/')[1] || 'unknown'; // Extract user from path
        let user = null;
        
        const { data: existingUser, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('handle', userHandle)
          .single();
          
        if (userError) {
          console.error('Error finding user:', userError);
          errors.push(`Failed to find or create user ${userHandle}: ${userError.message}`);
        } else if (existingUser) {
          console.log(`Found existing user:`, existingUser);
          user = existingUser;
        } else {
          // Create new user if it doesn't exist
          console.log(`Creating new user with handle: ${userHandle}`);
          
          const { data: newUser, error: createUserError } = await supabase
            .from('users')
            .insert([{
              handle: userHandle,
              display_name: userHandle,
            }])
            .select()
            .single();
            
          if (createUserError) {
            console.error('Error creating user:', createUserError);
            errors.push(`Failed to create user ${userHandle}: ${createUserError.message}`);
          } else {
            console.log(`Successfully created user:`, newUser);
            user = newUser;
          }
        }

        // Insert photo record
        if (gallery) {
          const publicUrl = b2Service.getPublicUrl(b2Path);
          
          console.log(`Inserting photo record for file: ${file.name}, gallery_id: ${gallery.id}, user_tag_id: ${user?.id}`);
          
          const { error: photoError, data: photoData } = await supabase
            .from('photos')
            .insert([{
              gallery_id: gallery.id,
              user_tag_id: user?.id,
              b2_file_key: b2Path,
              public_url: publicUrl,
              width,
              height,
            }])
            .select(); // Return inserted data for verification
            
          if (photoError) {
            console.error('Error inserting photo:', photoError);
            errors.push(`Failed to save metadata for ${file.name}: ${photoError.message}`);
          } else {
            console.log(`Successfully inserted photo record:`, photoData);
          }
        } else {
          console.error('Gallery not found, skipping photo insertion');
          errors.push(`Could not find or create gallery for ${file.name}`);
        }

        processedFiles++;
      } catch (fileError: any) {
        console.error('Error processing file:', file.name, fileError);
        errors.push(`Failed to upload ${file.name}: ${fileError.message || 'Unknown error'}`);
      }
    }

    const message = `Upload completed. ${processedFiles} files processed.`;
    return Response.json({
      success: true,
      message,
      processedFiles,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return Response.json(
      { success: false, message: 'An error occurred during upload' },
      { status: 500 }
    );
  }
}

// Simple file hash calculation (in a real app, use proper crypto)
async function calculateFileHash(buffer: Buffer): Promise<string> {
  // This is a very simplified approach
  // In a real application, you'd use crypto to generate a proper hash
  return randomUUID(); // Using randomUUID() as a placeholder
}