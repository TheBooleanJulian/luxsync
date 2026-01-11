import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { galleryId, newTitle } = await request.json();

    if (!galleryId || !newTitle) {
      return Response.json(
        { error: 'galleryId and newTitle are required' },
        { status: 400 }
      );
    }

    const supabase = createClient(true); // Use service role for write operations

    const { data, error } = await supabase
      .from('galleries')
      .update({ title: newTitle })
      .eq('id', galleryId)
      .select()
      .single();

    if (error) {
      console.error('Error updating gallery title:', error);
      return Response.json(
        { error: error.message || 'Failed to update gallery title' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: 'Gallery title updated successfully',
      gallery: data,
    });
  } catch (error) {
    console.error('Error in update-title API:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}