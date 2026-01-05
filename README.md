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
- Full-screen photo viewer with zoom and navigation
- Single-button download functionality for individual photos
- Gallery download as ZIP archive
- Gallery headers with date and title extraction
- Photo dimensions fetched from B2 metadata
- Portrait orientation (3:2 aspect ratio) by default
- Responsive design with multiple column layout based on screen size
- Error handling and loading states
- Keyboard navigation support (Escape key to close modal)

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
│   ├── api/                # API routes
│   │   ├── galleries/      # Gallery-related API endpoints
│   │   │   └── download/[galleryId]/route.ts  # Gallery ZIP download
│   │   └── photos/         # Photo-related API endpoints
│   │       └── gallery/[galleryId]/route.ts   # Fetch photos by gallery
├── components/             # Reusable React components
│   ├── MasonryGallery.tsx  # Responsive masonry grid component
│   └── modal/              # Modal components
│       └── PhotoModal.tsx  # Full-screen photo viewer
├── types/                  # TypeScript type definitions
│   └── database.ts         # Database schema type definitions
└── utils/                  # Utility functions
    ├── b2/                 # Backblaze B2 utilities
    │   ├── client.ts       # B2 client configuration
    │   ├── gallery-parser.ts  # Parse gallery structure from B2
    │   └── service.ts      # B2 service with upload/download operations
    └── supabase/           # Supabase utilities
        └── server.ts       # Supabase server-side client
```

## Key Components

- **MasonryGallery**: Responsive masonry grid component that displays photos with preserved aspect ratios
- **PhotoModal**: Full-screen photo viewer with download and navigation capabilities
- **Supabase Client**: Server-side Supabase client for database operations
- **Database Types**: TypeScript interfaces matching the Supabase schema
- **B2 Storage Service**: Backblaze B2 integration for photo storage with S3-compatible API
- **Gallery Parser**: Parses folder structure to extract gallery information and photo metadata
- **Image Processing**: Utilities for extracting image dimensions from B2 metadata
- **API Routes**: Server-side endpoints for fetching galleries and photos, and downloading galleries as ZIP archives