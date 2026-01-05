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
  
  const { data, error } = await supabase
    .from('galleries')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching galleries:', error);
    throw error;
  }
  
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

export const createGallery = async (galleryData: { title: string; event_date: string; folder_name: string; cover_image_url?: string }) => {
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