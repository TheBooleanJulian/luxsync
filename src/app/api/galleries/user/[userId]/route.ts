import { NextRequest } from 'next/server';
import { getGalleriesByUserHandle } from '@/utils/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    if (!userId) {
      return Response.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Try to get galleries from the database first
    let galleries;
    try {
      galleries = await getGalleriesByUserHandle(userId);
    } catch (dbError) {
      console.error('Error fetching galleries from database:', dbError);
      // Fallback to an empty array if database fails
      galleries = [];
    }
    
    return Response.json({ galleries });
  } catch (error) {
    console.error('Error in galleries by user API:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}