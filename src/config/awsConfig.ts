import { S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

interface AwsCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}

// Get environment-specific AWS credentials based on NODE_ENV
const getAwsCredentials = (): AwsCredentials => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  switch (nodeEnv) {
    case 'development':
      return {
        accessKeyId: process.env.DEV_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.DEV_AWS_SECRET_ACCESS_KEY!,
        region: process.env.DEV_AWS_REGION!,
      };
    case 'staging':
      return {
        accessKeyId: process.env.STG_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.STG_AWS_SECRET_ACCESS_KEY!,
        region: process.env.STG_AWS_REGION!,
      };
    case 'production':
      return {
        accessKeyId: process.env.PRODUCTION_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.PRODUCTION_AWS_SECRET_ACCESS_KEY!,
        region: process.env.PRODUCTION_AWS_REGION!,
      };
    default:
      throw new Error(`Unknown environment: ${nodeEnv}`);
  }
};

// Get environment-specific S3 bucket name
const getS3BucketName = (): string => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  switch (nodeEnv) {
    case 'development':
      return process.env.DEV_S3_BUCKET!;
    case 'staging':
      return process.env.STG_S3_BUCKET!;
    case 'production':
      return process.env.PRODUCTION_S3_BUCKET!;
    default:
      throw new Error(`Unknown environment: ${nodeEnv}`);
  }
};

const credentials = getAwsCredentials();

const s3Client = new S3Client({
  region: credentials.region,
  credentials: {
    accessKeyId: credentials.accessKeyId,
    secretAccessKey: credentials.secretAccessKey,
  },
});

export {
  s3Client,
  getS3BucketName,
  getAwsCredentials,
  AwsCredentials,
};