import { S3Client } from '@aws-sdk/client-s3';

// Create a B2 client configured for Backblaze B2 (S3-compatible)
export const createB2Client = () => {
  return new S3Client({
    region: process.env.B2_REGION || 'us-west-004', // Default B2 region, change as needed
    endpoint: process.env.B2_ENDPOINT, // e.g., 'https://s3.us-west-004.backblazeb2.com'
    credentials: {
      accessKeyId: process.env.B2_APPLICATION_KEY_ID!,
      secretAccessKey: process.env.B2_APPLICATION_KEY!,
    },
    forcePathStyle: true, // Required for B2
  });
};

export default createB2Client;