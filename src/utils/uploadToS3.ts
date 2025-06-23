import { s3Client, getS3BucketName } from '../config/awsConfig';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from 'uuid';

interface UploadResult {
  success: boolean;
  objectKey?: string;
  error?: string;
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const uploadToS3 = async (base64String: string): Promise<UploadResult> => {
  try {
    const matches = base64String.match(/^data:(.+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return {
        success: false,
        error: 'Invalid base64 string format. Expected: data:image/type;base64,data'
      };
    }

    const contentType = matches[1];
    const base64Data = matches[2];

    if (!ALLOWED_MIME_TYPES.includes(contentType)) {
      return {
        success: false,
        error: `Unsupported file type: ${contentType}. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
      };
    }

    const buffer = Buffer.from(base64Data, 'base64');
    
    if (buffer.length > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File size too large. Maximum allowed: ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      };
    }

    const fileExtension = contentType.split('/')[1];
    const fileName = `profile-images/${uuidv4()}.${fileExtension}`;

    const params = {
      Bucket: getS3BucketName(),
      Key: fileName,
      Body: buffer,
      ContentType: contentType,
      Metadata: {
        'original-content-type': contentType,
        'uploaded-at': new Date().toISOString(),
        'file-size': buffer.length.toString()
      }
    };

    await s3Client.send(new PutObjectCommand(params));
    
    return {
      success: true,
      objectKey: fileName
    };

  } catch (error) {
    console.error('S3 upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error'
    };
  }
};

// Generate signed URL from object key
export const generateSignedUrl = async (objectKey: string, expiresIn: number = 604800): Promise<string> => {
  try {
    const signedUrl = await getSignedUrl(s3Client, new GetObjectCommand({ 
      Bucket: getS3BucketName(), 
      Key: objectKey 
    }), { expiresIn });
    
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate signed URL');
  }
};

// Generate signed URLs for all user photos
export const generateUserPhotoUrls = async (user: any): Promise<any> => {
  const photoFields = ['photo1_key', 'photo2_key', 'photo3_key', 'photo4_key'];
  const userWithUrls = { ...user };
  
  for (const field of photoFields) {
    if (user[field]) {
      try {
        const signedUrl = await generateSignedUrl(user[field]);
        // Store both key and URL
        userWithUrls[field] = user[field]; // Keep the original key
        userWithUrls[field.replace('_key', '')] = signedUrl; // Add the signed URL
      } catch (error) {
        console.error(`Error generating signed URL for ${field}:`, error);
        userWithUrls[field] = user[field]; // Keep the original key
        userWithUrls[field.replace('_key', '')] = null; // No URL available
      }
    } else {
      userWithUrls[field] = null; // No key
      userWithUrls[field.replace('_key', '')] = null; // No URL
    }
  }
  
  return userWithUrls;
};

export const validateBase64Image = (base64String: string): { isValid: boolean; error?: string } => {
  try {
    const matches = base64String.match(/^data:(.+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return {
        isValid: false,
        error: 'Invalid base64 string format'
      };
    }

    const contentType = matches[1];
    const base64Data = matches[2];

    if (!ALLOWED_MIME_TYPES.includes(contentType)) {
      return {
        isValid: false,
        error: `Unsupported file type: ${contentType}`
      };
    }

    const buffer = Buffer.from(base64Data, 'base64');
    
    if (buffer.length > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size too large: ${(buffer.length / (1024 * 1024)).toFixed(2)}MB`
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid base64 data'
    };
  }
};

export default uploadToS3;