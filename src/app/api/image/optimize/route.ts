import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const width = searchParams.get('width');
    const quality = searchParams.get('quality') || '80';

    if (!url) {
      return Response.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // For external images, Next.js will handle optimization through the remotePatterns in next.config.js
    // We'll redirect to the original URL with width and quality parameters if the image service supports it
    // For B2, we can't add query parameters to the image URL, so we return the original URL
    // Next.js Image component will handle optimization based on the width prop
    
    return Response.json({
      optimizedUrl: url,
      width: width ? parseInt(width) : 600,
      message: 'Next.js will optimize this image based on the width prop and remotePatterns in next.config.js'
    });
  } catch (error) {
    console.error('Error in image optimization API:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}