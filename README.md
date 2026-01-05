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

2. Create a `.env.local` file with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
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