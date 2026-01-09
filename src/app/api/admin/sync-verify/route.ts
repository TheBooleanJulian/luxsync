import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { b2Service } from '@/utils/b2/service';

export async function GET(request: NextRequest) {
  try {
    console.log('Starting database sync verification...');
    
    // Get Supabase client
    const supabase = createClient(); // Use regular client for read operations in GET request
    
    // Fetch all galleries from Supabase
    const { data: dbGalleries, error: galleriesError } = await supabase
      .from('galleries')
      .select('*');
    
    if (galleriesError) {
      console.error('Error fetching galleries from database:', galleriesError);
      return Response.json(
        { 
          success: false, 
          message: 'Error fetching galleries from database',
          error: galleriesError.message 
        },
        { status: 500 }
      );
    }
    
    // Fetch all photos from Supabase
    const { data: dbPhotos, error: photosError } = await supabase
      .from('photos')
      .select('*');
    
    if (photosError) {
      console.error('Error fetching photos from database:', photosError);
      return Response.json(
        { 
          success: false, 
          message: 'Error fetching photos from database',
          error: photosError.message 
        },
        { status: 500 }
      );
    }
    
    // Fetch all users from Supabase
    const { data: dbUsers, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) {
      console.error('Error fetching users from database:', usersError);
      return Response.json(
        { 
          success: false, 
          message: 'Error fetching users from database',
          error: usersError.message 
        },
        { status: 500 }
      );
    }
    
    // Fetch all objects from B2
    const b2ListResponse: any = await b2Service.listObjects('B2 LuxSync/');
    const b2Objects = (b2ListResponse.objects || []).map((obj: any) => ({
      fileName: obj.Key || '',
      size: obj.Size || 0,
      lastModified: obj.LastModified,
    })).filter((obj: any) => obj.fileName); // Filter out objects without keys
    
    console.log(`Found ${b2Objects.length} objects in B2`);
    
    // Analyze the sync status
    const analysis = {
      database: {
        galleries: dbGalleries?.length || 0,
        photos: dbPhotos?.length || 0,
        users: dbUsers?.length || 0,
      },
      b2: {
        objects: b2Objects.length,
        galleryFolders: [...new Set(
          b2Objects
            .filter((obj: any) => obj.fileName.includes('/'))
            .map((obj: any) => obj.fileName.split('/')[1])
            .filter((folder: any) => folder && !folder.endsWith('.bzEmpty'))
        )],
      },
      discrepancies: [] as string[],
    };
    
    // Compare galleries
    if (dbGalleries && dbGalleries.length === 0) {
      analysis.discrepancies.push('No galleries found in database');
    } else if (analysis.b2.galleryFolders.length > 0 && dbGalleries && dbGalleries.length === 0) {
      analysis.discrepancies.push('B2 has gallery folders but database is empty');
    } else {
      // Check if all B2 galleries exist in database
      const dbGalleryNames = dbGalleries?.map((g: any) => g.folder_name) || [];
      const missingFromDb = analysis.b2.galleryFolders.filter((folder: any) => !dbGalleryNames.includes(folder));
      if (missingFromDb.length > 0) {
        analysis.discrepancies.push(`Missing galleries in DB: ${missingFromDb.join(', ')}`);
      }
    }
    
    // Check if photos table is empty
    if (dbPhotos && dbPhotos.length === 0) {
      analysis.discrepancies.push('No photos found in database');
    }
    
    // Check if users table is empty
    if (dbUsers && dbUsers.length === 0) {
      analysis.discrepancies.push('No users found in database');
    }
    
    // Find potential orphaned photos (photos pointing to non-existent galleries/users)
    if (dbPhotos && dbPhotos.length > 0 && dbGalleries && dbGalleries.length > 0) {
      const dbGalleryIds = dbGalleries?.map((g: any) => g.id) || [];
      const orphanedPhotos = dbPhotos?.filter((photo: any) => !dbGalleryIds.includes(photo.gallery_id)) || [];
      if (orphanedPhotos.length > 0) {
        analysis.discrepancies.push(`Found ${orphanedPhotos.length} photos with non-existent galleries`);
      }
    }
    
    console.log('Database sync analysis completed:', analysis);
    
    return Response.json({
      success: true,
      analysis,
      details: {
        galleries: dbGalleries,
        photos: dbPhotos,
        users: dbUsers,
        sampleB2Objects: b2Objects.slice(0, 10), // First 10 B2 objects as sample
      }
    });
    
  } catch (error) {
    console.error('Sync verification error:', error);
    return Response.json(
      { 
        success: false, 
        message: 'An error occurred during sync verification',
        error: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Starting forced database sync from B2...');
    
    const supabase = createClient(true); // Use service role for write operations in POST request
    
    // Fetch all objects from B2
    const b2ListResponse: any = await b2Service.listObjects('B2 LuxSync/');
    const b2Objects = (b2ListResponse.objects || []).map((obj: any) => ({
      fileName: obj.Key || '',
      size: obj.Size || 0,
      lastModified: obj.LastModified,
    })).filter((obj: any) => obj.fileName); // Filter out objects without keys
    
    console.log(`Found ${b2Objects.length} objects in B2 for sync`);
    
    // Extract unique gallery names from B2 paths
    const galleryPaths = [...new Set(
      b2Objects
        .filter((obj: any) => obj.fileName.includes('/') && !obj.fileName.endsWith('.bzEmpty'))
        .map((obj: any) => obj.fileName.split('/')[1])
    )].filter(Boolean); // Filter out any undefined values
    
    console.log(`Found ${galleryPaths.length} unique galleries in B2:`, galleryPaths);
    
    // Process each gallery
    let galleriesProcessed = 0;
    let photosProcessed = 0;
    const errors: string[] = [];
    
    for (const galleryNameUnk of galleryPaths) {
      if (!galleryNameUnk) continue; // Skip if undefined
      const galleryName = galleryNameUnk as string;
      try {
        // Check if gallery exists in DB
        const { data: existingGallery, error: galleryError } = await supabase
          .from('galleries')
          .select('*')
          .eq('folder_name', galleryName)
          .single();
        
        let galleryId: string;
        
        if (galleryError) {
          // Create new gallery
          const galleryTitle = galleryName.replace(/[_-]/g, ' ');
          const dateMatch = galleryName.match(/^(\d{4}[-_]\d{2}[-_]\d{2})/);
          const eventDate = dateMatch ? dateMatch[1].replace(/_/g, '-') : new Date().toISOString().split('T')[0];
          
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
            continue;
          }
          
          galleryId = newGallery.id;
          console.log(`Created new gallery: ${galleryName} (${galleryId})`);
        } else {
          galleryId = existingGallery.id;
          console.log(`Found existing gallery: ${galleryName} (${galleryId})`);
        }
        
        galleriesProcessed++;
        
        // Find objects belonging to this gallery
        const galleryObjects = b2Objects.filter((obj: any) => 
          obj.fileName.startsWith(`B2 LuxSync/${galleryName}/`) && 
          !obj.fileName.endsWith('.bzEmpty')
        );
        
        console.log(`Processing ${galleryObjects.length} objects for gallery: ${galleryName}`);
        
        // Process each object in this gallery
        for (const obj of galleryObjects) {
          try {
            // Extract user from path (second part after gallery name)
            const pathParts = (obj as any).fileName.split('/');
            if (pathParts.length >= 3) {
              const userHandle = pathParts[2];
              
              // Check if user exists
              const { data: existingUser, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('handle', userHandle)
                .single();
              
              let userId: string | null = null;
              
              if (!userError && existingUser) {
                userId = existingUser.id;
              } else {
                // Create user if doesn't exist
                const { data: newUser, error: createUserError } = await supabase
                  .from('users')
                  .insert([{
                    handle: userHandle,
                    display_name: userHandle,
                  }])
                  .select()
                  .single();
                  
                if (!createUserError && newUser) {
                  userId = newUser.id;
                  console.log(`Created new user: ${userHandle} (${userId})`);
                } else if (createUserError) {
                  console.error('Error creating user:', createUserError);
                  // Continue without user association
                }
              }
              
              // Check if photo already exists in DB
              const { data: existingPhoto, error: photoError } = await supabase
                .from('photos')
                .select('*')
                .eq('b2_file_key', (obj as any).fileName)
                .single();
              
              if (!photoError && existingPhoto) {
                console.log(`Photo already exists in DB: ${(obj as any).fileName}`);
                continue; // Skip if already exists
              }
              
              // Insert photo record
              const publicUrl = b2Service.getPublicUrl((obj as any).fileName);
              
              const { error: insertError } = await supabase
                .from('photos')
                .insert([{
                  gallery_id: galleryId,
                  user_tag_id: userId,
                  b2_file_key: (obj as any).fileName,
                  public_url: publicUrl,
                  width: null, // Would need to extract from B2 metadata if available
                  height: null,
                }]);
                
              if (insertError) {
                console.error('Error inserting photo:', insertError);
                errors.push(`Failed to insert photo ${(obj as any).fileName}: ${insertError.message}`);
              } else {
                photosProcessed++;
                console.log(`Inserted photo: ${(obj as any).fileName}`);
              }
            }
          } catch (photoError: any) {
            console.error('Error processing photo:', (obj as any).fileName, photoError);
            errors.push(`Failed to process photo ${(obj as any).fileName}: ${photoError.message}`);
          }
        }
      } catch (galleryError: any) {
        console.error('Error processing gallery:', galleryName, galleryError);
        errors.push(`Failed to process gallery ${galleryName}: ${galleryError.message}`);
      }
    }
    
    console.log(`Sync completed. Galleries: ${galleriesProcessed}, Photos: ${photosProcessed}`);
    
    return Response.json({
      success: true,
      message: `Sync completed. Processed ${galleriesProcessed} galleries and ${photosProcessed} photos.`,
      galleriesProcessed,
      photosProcessed,
      errors: errors.length > 0 ? errors : undefined,
    });
    
  } catch (error) {
    console.error('Forced sync error:', error);
    return Response.json(
      { 
        success: false, 
        message: 'An error occurred during forced sync',
        error: (error as Error).message 
      },
      { status: 500 }
    );
  }
}