# LuxSync - Client Photo Gallery Platform

A Next.js-based photo gallery platform that integrates with Supabase for database management and Backblaze B2 for image storage.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Animations**: Framer Motion
- **Layout**: react-responsive-masonry
- **Backend/DB**: Supabase (PostgreSQL), Supabase Auth
- **Storage**: Backblaze B2 (S3-compatible)
- **Infrastructure**: Vercel (Frontend Hosting)

## Features

- Responsive masonry grid layout for photo galleries
- Automatic parsing of folder structures ([YYYY-MM-DD] [Project Title] and [User Handle] subfolders)
- Supabase integration for user and gallery management
- Backblaze B2 integration for image storage
- Single-button download functionality

## Database Schema

### users
- id (string)
- handle (string)
- display_name (string)
- instagram (string, optional)

### galleries
- id (string)
- title (string)
- event_date (string)
- folder_name (string)
- cover_image_url (string)

### photos
- id (string)
- gallery_id (string)
- user_tag_id (string, nullable)
- b2_file_key (string)
- public_url (string)
- width (number)
- height (number)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file with your Supabase and Backblaze B2 credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backblaze B2 Configuration
B2_APPLICATION_KEY_ID=your_b2_application_key_id
B2_APPLICATION_KEY=your_b2_application_key
B2_BUCKET_NAME=hatsune-b2  # Your bucket name
B2_BASE_PATH=B2 LuxSync  # Subfolder path in your bucket (optional, defaults to 'B2 LuxSync')
B2_ENDPOINT=https://s3.us-west-004.backblazeb2.com  # Update with your B2 endpoint
B2_REGION=us-west-004  # Update with your B2 region
B2_PUBLIC_URL=https://fXXXXX.backblazeb2.com  # Your B2 public URL
```

3. Run the development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000

## Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/            # Reusable React components
│   └── MasonryGallery.tsx # Responsive masonry grid component
├── types/                 # TypeScript type definitions
│   └── database.ts        # Database schema type definitions
└── utils/                 # Utility functions
    └── supabase/
        └── server.ts      # Supabase server-side client
```

## Key Components

- **MasonryGallery**: Responsive masonry grid component that displays photos with preserved aspect ratios
- **Supabase Client**: Server-side Supabase client for database operations
- **Database Types**: TypeScript interfaces matching the Supabase schema
- **B2 Storage Service**: Backblaze B2 integration for photo storage with S3-compatible API
- **Image Processing**: Utilities for extracting image dimensions and validating file types
- **Photo Upload API**: API routes for handling photo uploads to B2 and metadata storage in Supabase