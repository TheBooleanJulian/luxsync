import { createServerClient } from '@supabase/ssr'

export const createClient = () => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Return empty array for server components
          return [];
        },
        setAll(cookiesToSet) {
          // Do nothing in server components
        },
      },
    }
  );
};



// Add database interaction functions
export const getGalleries = async () => {
  const supabase = createClient();
  
  console.log('Attempting to fetch galleries from Supabase...');
  
  // First, let's check if the galleries table exists
  const { data: tableCheck, error: tableError } = await supabase
    .from('galleries')
    .select('id')
    .limit(1);
    
  if (tableError) {
    console.error('Table check failed:', tableError);
    console.error('Table error details:', {
      code: tableError.code,
      message: tableError.message,
      hint: tableError.hint,
      details: tableError.details
    });
    
    // Check if it's a schema cache issue
    if (tableError.code === '42P01' || tableError.message.includes('does not exist')) {
      console.error('The galleries table does not exist in the database');
      
      // Log that we're checking for table existence
      console.log('Confirming galleries table does not exist in database');
    }
    
    throw tableError;
  }
  
  console.log('Table exists, fetching all galleries...');
  
  const { data, error } = await supabase
    .from('galleries')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching galleries:', error);
    throw error;
  }
  
  console.log('Successfully fetched galleries:', data.length);
  return data;
};

export const getPhotosByGallery = async (galleryId: string) => {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('gallery_id', galleryId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching photos:', error);
    throw error;
  }
  
  return data;
};

export const getGalleryByFolderName = async (folderName: string) => {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('galleries')
    .select('*')
    .eq('folder_name', folderName)
    .single();
    
  if (error) {
    console.error('Error fetching gallery:', error);
    throw error;
  }
  
  return data;
};

export const createGallery = async (galleryData: { title: string; event_date: string; folder_name: string; cover_image_url?: string; access_pin?: string }) => {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('galleries')
    .insert([galleryData])
    .select()
    .single();
    
  if (error) {
    console.error('Error creating gallery:', error);
    throw error;
  }
  
  return data;
};

export const createPhoto = async (photoData: { gallery_id: string; user_tag_id?: string; b2_file_key: string; public_url: string; width?: number; height?: number }) => {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('photos')
    .insert([photoData])
    .select()
    .single();
    
  if (error) {
    console.error('Error creating photo:', error);
    throw error;
  }
  
  return data;
};

export const validateGalleryAccess = async (folderName: string, pin: string) => {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('galleries')
    .select('access_pin')
    .eq('folder_name', folderName)
    .single();
    
  if (error) {
    console.error('Error validating gallery access:', error);
    return false;
  }
  
  // If no access_pin is set, gallery is public
  if (!data.access_pin) {
    return true;
  }
  
  // Check if provided pin matches stored pin
  return data.access_pin === pin;
};

export const getPhotosByUserHandle = async (userHandle: string) => {
  const supabase = createClient();
  
  // First get the user by handle
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('handle', userHandle)
    .single();
    
  if (userError) {
    console.error('Error fetching user:', userError);
    throw userError;
  }
  
  // Then get photos tagged to this user
  const { data: photos, error: photosError } = await supabase
    .from('photos')
    .select('*')
    .eq('user_tag_id', user.id)
    .order('created_at', { ascending: false });
    
  if (photosError) {
    console.error('Error fetching photos by user:', photosError);
    throw photosError;
  }
  
  return photos;
};

export const deleteGallery = async (galleryId: string) => {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('galleries')
    .delete()
    .eq('id', galleryId);
  
  if (error) {
    console.error('Error deleting gallery:', error);
    throw error;
  }
  
  return { success: true };
};

export const getUserByHandle = async (handle: string) => {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('handle', handle)
    .single();
  
  if (error) {
    console.error('Error fetching user by handle:', error);
    throw error;
  }
  
  return data;
};

export const createUser = async (userData: { handle: string; display_name?: string; instagram?: string }) => {
  const supabase = createClient();
  
  // Generate a unique ID for the user
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const { data, error } = await supabase
    .from('users')
    .insert([{ id: userId, ...userData }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating user:', error);
    throw error;
  }
  
  return data;
};

export const getPhotosByUserHandleFromB2 = async (userHandle: string) => {
  console.log('Fetching photos for user handle from B2:', userHandle);
  
  // This function will fetch photos from B2 storage based on the user handle (subfolder name)
  // This is a fallback for when we don't have the user in the database
  const { getPhotosForGallery } = await import('@/utils/b2/gallery-parser');
  
  // In the B2 structure, user photos are in subfolders named after the user handle
  // So we need to find all galleries that have photos from this user
  const { getGalleriesFromB2 } = await import('@/utils/b2/gallery-parser');
  
  try {
    const galleries = await getGalleriesFromB2();
    console.log('Found galleries from B2:', galleries.length);
    
    let allUserPhotos: any[] = [];
    
    for (const gallery of galleries) {
      console.log('Processing gallery:', gallery.folder_name);
      
      // Get photos for this gallery
      const photos = await getPhotosForGallery(gallery.folder_name);
      console.log(`Found ${photos.length} photos in gallery ${gallery.folder_name}`);
      
      // Filter photos that belong to this user handle
      const userPhotos = photos.filter(photo => {
        // Extract user handle from the photo path (format: B2_BASE_PATH/gallery/userHandle/image.jpg)
        const pathParts = photo.b2_file_key.split('/');
        if (pathParts.length >= 3) {
          const extractedUserHandle = pathParts[2]; // The user handle is the third part
          return extractedUserHandle === userHandle;
        }
        return false;
      });
      
      console.log(`Found ${userPhotos.length} photos for user ${userHandle} in gallery ${gallery.folder_name}`);
      allUserPhotos = [...allUserPhotos, ...userPhotos];
    }
    
    console.log(`Total user photos found: ${allUserPhotos.length}`);
    return allUserPhotos;
  } catch (error) {
    console.error('Error in getPhotosByUserHandleFromB2:', error);
    throw error;
  }
};

export const getGalleriesByUserHandle = async (userHandle: string) => {
  const supabase = createClient();
  
  // First get the user by handle
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('handle', userHandle)
    .single();
    
  if (userError) {
    console.error('Error fetching user:', userError);
    throw userError;
  }
  
  // Then get all photos tagged to this user
  const { data: userPhotos, error: photosError } = await supabase
    .from('photos')
    .select('gallery_id')
    .eq('user_tag_id', user.id)
    .order('created_at', { ascending: false });
    
  if (photosError) {
    console.error('Error fetching user photos:', photosError);
    throw photosError;
  }
  
  // Get unique gallery IDs
  const galleryIds = [...new Set(userPhotos.map(photo => photo.gallery_id))];
  
  // Get gallery details for each gallery ID
  let galleries = [];
  if (galleryIds.length > 0) {
    const { data: galleryData, error: galleryError } = await supabase
      .from('galleries')
      .select('*')
      .in('id', galleryIds)
      .order('event_date', { ascending: false });
      
    if (galleryError) {
      console.error('Error fetching galleries:', galleryError);
      throw galleryError;
    }
    
    galleries = galleryData;
  }
  
  return galleries;
};

export const getPhotosByUserHandleAndGallery = async (userHandle: string, galleryId: string) => {
  const supabase = createClient();
  
  // First get the user by handle
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('handle', userHandle)
    .single();
    
  if (userError) {
    console.error('Error fetching user:', userError);
    throw userError;
  }
  
  // Then get photos tagged to this user in the specific gallery
  const { data: photos, error: photosError } = await supabase
    .from('photos')
    .select('*')
    .eq('user_tag_id', user.id)
    .eq('gallery_id', galleryId)
    .order('created_at', { ascending: false });
    
  if (photosError) {
    console.error('Error fetching user photos for gallery:', photosError);
    throw photosError;
  }
  
  return photos;
};