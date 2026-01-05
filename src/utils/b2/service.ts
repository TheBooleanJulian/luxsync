import { createB2Client } from './client';
import { 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand,
  HeadObjectCommand 
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME!;
const B2_BASE_PATH = process.env.B2_BASE_PATH || 'B2 LuxSync'; // Default subfolder path in your bucket


export interface B2UploadResult {
  fileKey: string;
  publicUrl: string;
  size: number;
  contentType: string;
}

export interface B2FileInfo {
  size: number;
  contentType: string;
  lastModified: Date;
}

export class B2Service {
  private client = createB2Client();

  /**
   * Upload a file to Backblaze B2
   */
  async uploadFile(
    file: Buffer | string | Blob,
    fileName: string,
    folderPath: string = '',
    contentType?: string
  ): Promise<B2UploadResult> {
    try {
      const fullFolderPath = B2_BASE_PATH + (folderPath ? `/${folderPath}` : '');
      const fileKey = `${fullFolderPath}/${fileName}`;
      
      const command = new PutObjectCommand({
        Bucket: B2_BUCKET_NAME,
        Key: fileKey,
        Body: file,
        ContentType: contentType || 'application/octet-stream',
      });

      await this.client.send(command);

      // Return the public URL (B2 provides public URLs in the format: https://fXXXXX.backblazeb2.com/file/bucket-name/file-key)
      const publicUrl = this.getPublicUrl(fileKey);
      
      // Get file info to return size
      const fileInfo = await this.getFileInfo(fileKey);
      
      return {
        fileKey,
        publicUrl,
        size: fileInfo.size,
        contentType: contentType || 'application/octet-stream',
      };
    } catch (error) {
      console.error('Error uploading file to B2:', error);
      throw error;
    }
  }

  /**
   * Get a signed URL for downloading a file (for private files)
   */
  async getSignedUrl(fileKey: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: B2_BUCKET_NAME,
        Key: fileKey,
      });

      return await getSignedUrl(this.client, command, { expiresIn });
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw error;
    }
  }

  /**
   * Get public URL for a file (for public buckets)
   */
  getPublicUrl(fileKey: string): string {
    // Assuming you have a public bucket URL configured
    // Format: https://fXXXXX.backblazeb2.com/file/bucket-name/file-key
    const publicUrl = process.env.B2_PUBLIC_URL;
    if (publicUrl) {
      return `${publicUrl}/file/${B2_BUCKET_NAME}/${fileKey}`;
    }
    
    // Alternative: if you have the bucket endpoint, construct the URL
    const endpoint = process.env.B2_ENDPOINT;
    if (endpoint) {
      return `${endpoint}/file/${B2_BUCKET_NAME}/${fileKey}`;
    }
    
    // Default fallback (you should configure one of the above)
    throw new Error('B2_PUBLIC_URL or B2_ENDPOINT must be configured for public URLs');
  }

  /**
   * Get file information (size, content type, etc.)
   */
  async getFileInfo(fileKey: string): Promise<B2FileInfo> {
    try {
      const command = new HeadObjectCommand({
        Bucket: B2_BUCKET_NAME,
        Key: fileKey,
      });

      const response = await this.client.send(command);
      
      return {
        size: response.ContentLength || 0,
        contentType: response.ContentType || 'application/octet-stream',
        lastModified: response.LastModified || new Date(),
      };
    } catch (error) {
      console.error('Error getting file info:', error);
      throw error;
    }
  }

  /**
   * Download a file from B2
   */
  async downloadFile(fileKey: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: B2_BUCKET_NAME,
        Key: fileKey,
      });

      const response = await this.client.send(command);
      
      // Convert the response body to a buffer
      const body = response.Body;
      if (body instanceof Buffer) {
        return body;
      }
      
      // Handle different response body types
      if (body && typeof body === 'object' && 'transformToByteArray' in body) {
        // @ts-ignore - transformToByteArray is available on S3 stream
        const bytes = await body.transformToByteArray();
        return Buffer.from(bytes);
      }
      
      throw new Error('Unable to read file from B2');
    } catch (error) {
      console.error('Error downloading file from B2:', error);
      throw error;
    }
  }

  /**
   * Delete a file from B2
   */
  async deleteFile(fileKey: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: B2_BUCKET_NAME,
        Key: fileKey,
      });

      await this.client.send(command);
    } catch (error) {
      console.error('Error deleting file from B2:', error);
      throw error;
    }
  }

  /**
   * Check if a file exists in B2
   */
  async fileExists(fileKey: string): Promise<boolean> {
    try {
      await this.getFileInfo(fileKey);
      return true;
    } catch (error) {
      if ((error as any).name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }
}

// Create a singleton instance
export const b2Service = new B2Service();

export default b2Service;