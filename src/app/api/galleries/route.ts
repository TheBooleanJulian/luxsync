import { NextRequest } from 'next/server';
import { getGalleries } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const galleries = await getGalleries();

    return Response.json({
      galleries,
      message: 'Galleries retrieved successfully'
    });
  } catch (error) {
    console.error('Error in galleries API:', error);
    return Response.json(
      { error: 'Failed to retrieve galleries from database' },
      { status: 500 }
    );
  }
}