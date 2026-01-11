import { NextRequest } from 'next/server';
import { b2Service } from '@/utils/b2/service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filePath: string }> }
) {
  try {
    const { filePath } = await params;
    
    if (!filePath) {
      return Response.json(
        { error: 'filePath is required' },
        { status: 400 }
      );
    }

    // Decode the file path
    const decodedFilePath = decodeURIComponent(filePath);

    try {
      // Get content type from B2 first to check if file exists
      const fileInfo = await b2Service.getFileInfo(decodedFilePath);
      
      // Download the file from B2
      const fileBuffer = await b2Service.downloadFile(decodedFilePath);
      
      // Create response with file content
      return new Response(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': fileInfo.contentType,
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        },
      });
    } catch (error: any) {
      if (error.name === 'NotFound' || error.Code === 'NoSuchKey') {
        return Response.json(
          { error: 'File not found in B2 storage' },
          { status: 404 }
        );
      }
      console.error('Error fetching file from B2:', error);
      return Response.json(
        { error: 'Error fetching file from storage' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in file download API:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}