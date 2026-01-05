export interface User {
  id: string;
  handle: string;
  display_name: string;
  instagram?: string;
}

export interface Gallery {
  id: string;
  title: string;
  event_date: string; // ISO date string
  folder_name: string;
  cover_image_url: string;
}

export interface Photo {
  id: string;
  gallery_id: string;
  user_tag_id?: string | null;
  b2_file_key: string;
  public_url: string;
  optimized_url?: string;
  width: number;
  height: number;
}