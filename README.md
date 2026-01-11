# LuxSync

LuxSync is a secure photo gallery platform that seamlessly integrates Backblaze B2 storage with Supabase database management. It provides a password-protected admin panel for file management, automated metadata synchronization, and a user-friendly gallery interface.

## Features

- Password-protected admin panel for file management
- Secure file upload, move, rename, and delete operations
- Automated metadata extraction and database synchronization
- Human-friendly file browsing interface
- Gallery navigation system with clickable tabs
- Comprehensive debugging and monitoring tools
- Health and status dashboard with quick access to all pages

## Debugging Tools

LuxSync includes several debugging tools to help monitor and verify database writes:

1. **Database Debug Page** (`/admin/db-debug`): View all data in the Supabase database including galleries, photos, and users
2. **System Log Viewer** (`/admin/logs`): Monitor application logs and debug upload processes
3. **Sync Verification Tool** (`/api/admin/sync-verify`): Analyze and synchronize data between B2 and Supabase
4. **Status Dashboard** (`/status`): Health and status monitoring with quick access to all application pages

These tools help ensure that uploaded files are properly written to the Supabase database.

## Supabase Setup and Configuration

To properly connect your LuxSync application to Supabase:

1. **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL (e.g., `https://xxxxxx.supabase.co`)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key (for client-side reads)
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for server-side write operations)

2. **Key Usage**:
   - Anonymous key: Used for client-side read operations and server-side read operations
   - Service role key: Used for server-side write operations (inserts, updates, deletes)

3. **Permissions**:
   - The service role key bypasses Row Level Security (RLS) and has full database access
   - This is required for server-side operations like uploading files and writing metadata

2. **Database Tables** (automatically created by migrations):
   - `users`: id, handle, display_name, instagram, created_at
   - `galleries`: id, title, event_date, folder_name, cover_image_url, access_pin, created_at
   - `photos`: id, gallery_id, user_tag_id, b2_file_key, public_url, optimized_url, width, height, created_at

3. **Connection Method**:
   - The application uses the official Supabase JavaScript client
   - No need for direct PostgreSQL connections in your application code
   - The Supabase client handles authentication and security automatically

## How to Get Your Supabase Credentials

To find your Supabase credentials:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/projects)
2. Select your project
3. Navigate to **Project Settings** > **API**
4. Copy the following values:
   - **Project URL** → Use as `NEXT_PUBLIC_SUPABASE_URL`
   - **Anonymous Key** → Use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Key** → Use as `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **Important Security Note**: The Service Role Key bypasses Row Level Security (RLS) and should only be used on the server-side in your application.

## How to Configure Backblaze B2

To configure your Backblaze B2 bucket:

1. Create a B2 bucket in your [Backblaze account](https://secure.backblaze.com/b2_buckets.htm)
2. Create an application key with read/write permissions for your bucket
3. Set the following environment variables:
   - `B2_BUCKET_NAME`: Your B2 bucket name
   - `B2_APPLICATION_KEY_ID`: Your B2 application key ID
   - `B2_APPLICATION_KEY`: Your B2 application key
   - `B2_ACCOUNT_ID`: Your B2 account ID
   - `B2_PUBLIC_URL`: Your B2 download URL (e.g., `https://f003.backblazeb2.com`)
   - `B2_BASE_PATH`: Subfolder in your bucket (default: `B2 LuxSync`)

The application expects files to be organized in the format: `B2_BASE_PATH/gallery-name/username/filename.jpg`

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Backblaze B2 Configuration
B2_BUCKET_NAME=your_b2_bucket_name
B2_APPLICATION_KEY_ID=your_b2_application_key_id
B2_APPLICATION_KEY=your_b2_application_key
B2_ACCOUNT_ID=your_b2_account_id
B2_PUBLIC_URL=https://f003.backblazeb2.com
B2_BASE_PATH=B2 LuxSync

# Admin Password
ADMIN_PASSWORD=your_secure_admin_password
```

## Setting Up the Admin Password

To protect your admin panel:

1. Set the `ADMIN_PASSWORD` environment variable to a secure password
2. Access the admin panel at `/admin` and use this password to log in
3. The admin panel allows you to:
   - Upload files to B2 storage
   - Move, rename, and delete files
   - Manage galleries and users
   - View database contents and logs
   - Perform sync operations

## Troubleshooting Database Issues

If you notice that the database remains empty after uploading files to B2:

1. **Verify Environment Variables**:
   - Ensure all required Supabase environment variables are set correctly
   - Check that your service role key has proper permissions
   - Verify your Supabase project URL is correct

2. **Check Database Write Permissions**:
   - Ensure `SUPABASE_SERVICE_ROLE_KEY` is properly configured
   - The service role key is required for write operations (uploads, inserts)
   - The anonymous key is used for read-only operations
   - If database remains empty after uploads, verify the service role key has write permissions

2. **Check the Database Debug Page** (`/admin/db-debug`):
   - Navigate to the admin panel
   - Click on the "Debug" tab
   - Click "Open Database Debug Page"
   - Verify if galleries, photos, and users tables are populated

3. **Analyze the Sync Status**:
   - Go to the admin panel
   - Click on the "Sync" tab
   - Click "Analyze Sync Status (GET)" to see the comparison between B2 and database
   - Review any discrepancies reported

4. **Force Sync if Needed**:
   - If the database is empty despite files in B2
   - Click "Force Sync All Files (POST)" in the Sync tab
   - This will scan all B2 files and create corresponding database entries

5. **Monitor Upload Logs**:
   - Use the "Logs" tab in admin panel
   - Check for successful photo insertions in the logs
   - Look for messages like "Successfully inserted photo record" - Client Photo Gallery Platform

A Next.js-based photo gallery platform that integrates with Supabase for database management and Backblaze B2 for image storage.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Animations**: Framer Motion
- **Layout**: react-responsive-masonry
- **Backend/DB**: Supabase (PostgreSQL), Supabase Auth
- **Storage**: Backblaze B2 (S3-compatible)
- **Infrastructure**: Vercel (Frontend Hosting)

## Core Features

LuxSync provides a comprehensive solution for photographers to share galleries with clients:

- **Masonry Grid Layout**: Responsive photo galleries with proper aspect ratio preservation
- **Folder Structure Parsing**: Automatically parses [YYYY-MM-DD] [Project Title] and [User Handle] folder structures
- **Supabase Integration**: User and gallery management with PostgreSQL database
- **Backblaze B2 Storage**: High-performance image storage with S3-compatible API
- **Full-Screen Photo Viewer**: With zoom, navigation, and download capabilities
- **Gallery Download**: ZIP archive downloads of entire galleries
- **PIN Protection**: 4-digit PIN access control for private galleries
- **Client Favorites**: Heart button functionality with filename copying for selection
- **Dynamic Metadata**: Open Graph tags for rich social media previews
- **Image Optimization**: Optimized thumbnails for grid display with full-resolution for modal viewing

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
- PIN-protected galleries for privacy (4-digit PIN access control)
- Client favorites with heart button and filename copying functionality
- Fixed masonry layout rendering with proper breakpoints for responsive columns
- Dynamic Open Graph metadata for social sharing with proper image previews
- Image optimization with Next.js Image component for bandwidth saving
- Responsive breakpoints: 1 column (≤350px), 2 columns (≤750px), 3 columns (≤900px), 4 columns (>1200px)
- Local storage for client preferences and favorites
- Social media integration with rich previews for Telegram, Discord, and other platforms

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
- access_pin (string, optional)
- created_at (timestamp with time zone)

### photos
- id (string)
- gallery_id (string)
- user_tag_id (string, nullable)
- b2_file_key (string)
- public_url (string)
- optimized_url (string, optional)
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

# Image Optimization (Optional)
# NEXT_PUBLIC_BASE_URL=your_domain_url  # For image optimization
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

## Usage

### For Photographers

1. **Upload Photos**: Organize your photos in Backblaze B2 using the folder structure: `B2 LuxSync/[YYYY-MM-DD] [Project Title]/[User Handle]/[Photos]`
2. **Create Galleries**: The system automatically creates galleries based on folder names
3. **Set PINs**: Add 4-digit PINs to galleries for private content
4. **Share Links**: Provide clients with gallery links for selection

### For Clients

1. **Browse Galleries**: View photos in responsive masonry layout
2. **Favorite Photos**: Click the heart button in photo modal to favorite photos
3. **Copy Filenames**: Use the "Copy Filenames" button to get a list of selected photos
4. **Download**: Download individual photos or entire galleries
5. **Social Sharing**: Share gallery links with rich previews on social platforms

## Key Components

- **MasonryGallery**: Responsive masonry grid component that displays photos with preserved aspect ratios
- **PhotoModal**: Full-screen photo viewer with download, navigation, and favorite capabilities
- **Supabase Client**: Server-side Supabase client for database operations
- **Database Types**: TypeScript interfaces matching the Supabase schema
- **B2 Storage Service**: Backblaze B2 integration for photo storage with S3-compatible API
- **Gallery Parser**: Parses folder structure to extract gallery information and photo metadata
- **Image Processing**: Utilities for extracting image dimensions from B2 metadata
- **API Routes**: Server-side endpoints for fetching galleries and photos, and downloading galleries as ZIP archives
- **PIN Protection**: 4-digit PIN access control for private galleries
- **Favorites Panel**: Client favorites with heart button and filename copying functionality

## PIN Protection

LuxSync supports PIN-protected galleries for privacy. Gallery owners can set a 4-digit PIN for private galleries (such as boudoir or unreleased shoots). When a gallery has an access PIN set:

1. Visitors must enter the correct 4-digit PIN to view the gallery
2. The PIN is validated server-side for security
3. Incorrect PINs show an error message
4. The PIN input form is displayed before the gallery content
5. PIN-protected galleries are still discoverable in lists but require authentication to view content

## Client Favorites

LuxSync includes a client favorites feature to help clients select specific photos for editing:

1. Heart button in the photo modal to favorite/unfavorite photos
2. Favorites are stored in browser's localStorage
3. Favorites panel appears in the top-right corner when photos are favorited
4. Copy Filenames button extracts filenames from favorited photos and copies them to clipboard
5. Clients can paste the list directly into Telegram or other communication platforms
6. Clear all button to reset favorites
7. Favorites persist between sessions

## Masonry Layout

The masonry grid layout uses responsive breakpoints to optimize the viewing experience:

- 1 column for screens up to 350px wide
- 2 columns for screens between 351px and 750px wide
- 3 columns for screens between 751px and 900px wide
- 4 columns for screens 901px and wider

This layout ensures optimal viewing experience across all device sizes.

## Admin Panel

LuxSync includes a password-protected admin panel for managing your galleries:

- **URL**: `/admin`
- **Features**: Upload, move, rename, and delete files/folders in B2 LuxSync
- **Metadata Management**: Write important metadata to Supabase including filename, dimensions, and hash IDs
- **File Hashing**: Automatically hashes filenames when uploading to B2, which are then recorded in Supabase for secure file retrieval

### Setup Admin Password

Add the following to your `.env.local` file:

```env
ADMIN_PASSWORD=your_secure_admin_password
```

### Usage

1. Navigate to `/admin` in your browser
2. Enter the admin password when prompted
3. Use the dashboard to manage your galleries:
   - **Upload Tab**: Upload files to specific folder paths
   - **Manage Tab**: Move, rename, or delete existing files/folders
   - **Metadata Tab**: Sync all metadata from B2 to Supabase

### Server Configuration for Large Files

There are two types of file size limits to be aware of:

#### Deployment Limits
- Static file deployment: 100MB for Hobby accounts, 1GB for Pro accounts
- These limits apply when deploying your application code, not when uploading photos through the admin panel

#### Runtime Upload Limits
- By default, serverless functions (like those on Vercel) have size limits that may restrict large file uploads (typically 4.5MB on Vercel's free tier)
- These limits apply when using the admin panel to upload photos to B2 storage

For larger runtime uploads:

- **On Vercel**: Consider upgrading your plan or configuring larger function limits
- **Alternative hosting**: Ensure your hosting provider supports larger request body sizes
- **File size limits**: The admin panel allows up to 25MB per file with a 50MB total batch limit, but server configuration may impose additional restrictions
- **Alternative approach**: For very large files, consider using the Backblaze B2 CLI tool or direct upload to B2 storage instead of using the admin panel

## Open Graph Metadata

LuxSync generates dynamic Open Graph metadata for rich social media previews:

- Title: "[Gallery Title] | LuxSync"
- Description: "Gallery from [Event Date]"
- Image: Gallery cover image or first photo in the gallery
- Twitter card: Summary large image format

This enables rich previews when sharing gallery links on Telegram, Discord, Twitter, and other social platforms.