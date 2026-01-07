import { NextRequest } from 'next/server';
import { b2Service } from '@/utils/b2/service';
import { createClient } from '@/utils/supabase/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    // Check if admin is authenticated
    if (!process.env.ADMIN_PASSWORD) {
      return Response.json(
        { success: false, message: 'Admin password not configured' },
        { status: 500 }
      );
    }

    const { action, sourcePath, targetPath } = await request.json();

    if (!action || !sourcePath) {
      return Response.json(
        { success: false, message: 'Action and sourcePath are required' },
        { status: 400 }
      );
    }

    if (action !== 'delete' && !targetPath) {
      return Response.json(
        { success: false, message: 'targetPath is required for move/rename actions' },
        { status: 400 }
      );
    }

    // Use the B2 service
    const { b2Service } = await import('@/utils/b2/service');
    const supabase = createClient();

    let message = '';

    if (action === 'move' || action === 'rename') {
      if (!targetPath) {
        return Response.json(
          { success: false, message: 'targetPath is required for move/rename actions' },
          { status: 400 }
        );
      }

      // For move/rename, we need to:
      // 1. Download the file from source
      // 2. Upload it to the target location
      // 3. Delete the original file
      // 4. Update the database records

      try {
        // Download the file from source
        const fileBuffer = await b2Service.downloadFile(sourcePath);

        // Extract extension and filename
        const parts = sourcePath.split('/');
        const fileName = parts[parts.length - 1];
        const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
        const newFileName = targetPath.split('/').pop() || fileName;

        // Upload to new location
        await b2Service.uploadFile(fileBuffer, newFileName, targetPath.split('/').slice(0, -1).join('/'));

        // Update database records to point to the new location
        const { error: updateError } = await supabase
          .from('photos')
          .update({ 
            b2_file_key: targetPath,
            public_url: b2Service.getPublicUrl(targetPath)
          })
          .eq('b2_file_key', sourcePath);

        if (updateError) {
          console.error('Error updating database:', updateError);
          return Response.json(
            { success: false, message: `File moved but database update failed: ${updateError.message}` },
            { status: 500 }
          );
        }

        // Delete the original file
        await b2Service.deleteFile(sourcePath);

        message = `File successfully ${action === 'move' ? 'moved' : 'renamed'} from ${sourcePath} to ${targetPath}`;
      } catch (error: any) {
        console.error(`Error during ${action}:`, error);
        return Response.json(
          { success: false, message: `Error during ${action}: ${error.message}` },
          { status: 500 }
        );
      }
    } else if (action === 'delete') {
      try {
        // Delete the file from B2
        await b2Service.deleteFile(sourcePath);

        // Remove the record from the database
        const { error: deleteError } = await supabase
          .from('photos')
          .delete()
          .eq('b2_file_key', sourcePath);

        if (deleteError) {
          console.error('Error deleting from database:', deleteError);
          return Response.json(
            { success: false, message: `File deleted from B2 but database record removal failed: ${deleteError.message}` },
            { status: 500 }
          );
        }

        message = `File successfully deleted: ${sourcePath}`;
      } catch (error: any) {
        console.error('Error during delete:', error);
        return Response.json(
          { success: false, message: `Error during delete: ${error.message}` },
          { status: 500 }
        );
      }
    } else {
      return Response.json(
        { success: false, message: 'Invalid action. Use "move", "rename", or "delete".' },
        { status: 400 }
      );
    }

    return Response.json({ success: true, message });
  } catch (error) {
    console.error('Manage error:', error);
    return Response.json(
      { success: false, message: 'An error occurred during the operation' },
      { status: 500 }
    );
  }
}