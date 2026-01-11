-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  handle TEXT UNIQUE NOT NULL,
  display_name TEXT,
  instagram TEXT
);

-- Insert default users if they don't exist (for testing purposes)
INSERT INTO users (id, handle, display_name, instagram) 
SELECT 'user-1', 'xymiku', 'xymiku', '@xymiku' 
WHERE NOT EXISTS (SELECT 1 FROM users WHERE handle = 'xymiku');

-- Create galleries table
CREATE TABLE IF NOT EXISTS galleries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  event_date DATE,
  folder_name TEXT UNIQUE NOT NULL,
  cover_image_url TEXT,
  access_pin TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create photos table
CREATE TABLE IF NOT EXISTS photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
  user_tag_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  b2_file_key TEXT NOT NULL,
  public_url TEXT NOT NULL,
  optimized_url TEXT,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_photos_gallery_id ON photos(gallery_id);
CREATE INDEX IF NOT EXISTS idx_photos_user_tag_id ON photos(user_tag_id);
CREATE INDEX IF NOT EXISTS idx_galleries_folder_name ON galleries(folder_name);

-- Add unique constraint to prevent duplicate b2_file_key entries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_b2_file_key'
  ) THEN
    ALTER TABLE photos ADD CONSTRAINT unique_b2_file_key UNIQUE (b2_file_key);
  END IF;
END $$;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' AND c.relname = 'galleries'
      AND p.polname = 'Enable read access for all users'
  ) THEN
    CREATE POLICY "Enable read access for all users" ON galleries
      FOR SELECT TO authenticated, anon
      USING (true);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' AND c.relname = 'photos'
      AND p.polname = 'Enable read access for all users'
  ) THEN
    CREATE POLICY "Enable read access for all users" ON photos
      FOR SELECT TO authenticated, anon
      USING (true);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' AND c.relname = 'users'
      AND p.polname = 'Enable read access for all users'
  ) THEN
    CREATE POLICY "Enable read access for all users" ON users
      FOR SELECT TO authenticated, anon
      USING (true);
  END IF;
END$$;