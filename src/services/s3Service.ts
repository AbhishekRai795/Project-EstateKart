// TODO: AWS S3 Service Integration
// This file will contain all S3-related operations

// import AWS from 'aws-sdk';

// Configure AWS SDK
// AWS.config.update({
//   accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
//   region: process.env.REACT_APP_AWS_REGION
// });

// const s3 = new AWS.S3();

// Interface for upload progress callback
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Interface for S3 upload result
export interface S3UploadResult {
  url: string;
  key: string;
  bucket: string;
}

/**
 * Upload a file to S3 bucket
 * @param file - File to upload
 * @param folder - S3 folder path (e.g., 'properties/user123')
 * @param onProgress - Progress callback function
 * @returns Promise with S3 URL and metadata
 */
export const uploadToS3 = async (
  file: File,
  folder: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<S3UploadResult> => {
  // TODO: Implement S3 upload
  // const timestamp = Date.now();
  // const randomString = Math.random().toString(36).substring(2, 15);
  // const fileExtension = file.name.split('.').pop();
  // const fileName = `${folder}/${timestamp}-${randomString}.${fileExtension}`;

  // const uploadParams = {
  //   Bucket: process.env.REACT_APP_S3_BUCKET_NAME!,
  //   Key: fileName,
  //   Body: file,
  //   ContentType: file.type,
  //   ACL: 'public-read',
  //   Metadata: {
  //     'original-name': file.name,
  //     'upload-timestamp': timestamp.toString(),
  //     'file-size': file.size.toString()
  //   }
  // };

  // const upload = s3.upload(uploadParams);

  // if (onProgress) {
  //   upload.on('httpUploadProgress', (progress) => {
  //     const percentage = Math.round((progress.loaded / progress.total) * 100);
  //     onProgress({
  //       loaded: progress.loaded,
  //       total: progress.total,
  //       percentage
  //     });
  //   });
  // }

  // const result = await upload.promise();
  
  // return {
  //   url: result.Location,
  //   key: result.Key,
  //   bucket: result.Bucket
  // };

  // TEMPORARY: Return mock data for development
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        url: URL.createObjectURL(file),
        key: `temp/${file.name}`,
        bucket: 'temp-bucket'
      });
    }, 1000);
  });
};

/**
 * Delete a file from S3 bucket
 * @param key - S3 object key
 * @returns Promise
 */
export const deleteFromS3 = async (key: string): Promise<void> => {
  // TODO: Implement S3 delete
  // const deleteParams = {
  //   Bucket: process.env.REACT_APP_S3_BUCKET_NAME!,
  //   Key: key
  // };

  // await s3.deleteObject(deleteParams).promise();
  
  console.log(`TODO: Delete S3 object with key: ${key}`);
};

/**
 * Get signed URL for private S3 objects
 * @param key - S3 object key
 * @param expiresIn - URL expiration time in seconds (default: 3600)
 * @returns Signed URL
 */
export const getSignedUrl = async (key: string, expiresIn: number = 3600): Promise<string> => {
  // TODO: Implement signed URL generation
  // const params = {
  //   Bucket: process.env.REACT_APP_S3_BUCKET_NAME!,
  //   Key: key,
  //   Expires: expiresIn
  // };

  // return s3.getSignedUrl('getObject', params);
  
  return `https://temp-signed-url.com/${key}`;
};

/**
 * List objects in S3 bucket with prefix
 * @param prefix - S3 prefix (folder path)
 * @returns Array of S3 objects
 */
export const listS3Objects = async (prefix: string) => {
  // TODO: Implement S3 list objects
  // const params = {
  //   Bucket: process.env.REACT_APP_S3_BUCKET_NAME!,
  //   Prefix: prefix
  // };

  // const result = await s3.listObjectsV2(params).promise();
  // return result.Contents || [];
  
  return [];
};

/**
 * Update S3 object metadata
 * @param key - S3 object key
 * @param metadata - New metadata
 * @returns Promise
 */
export const updateS3Metadata = async (key: string, metadata: Record<string, string>): Promise<void> => {
  // TODO: Implement metadata update
  // const copyParams = {
  //   Bucket: process.env.REACT_APP_S3_BUCKET_NAME!,
  //   CopySource: `${process.env.REACT_APP_S3_BUCKET_NAME}/${key}`,
  //   Key: key,
  //   Metadata: metadata,
  //   MetadataDirective: 'REPLACE'
  // };

  // await s3.copyObject(copyParams).promise();
  
  console.log(`TODO: Update metadata for S3 object: ${key}`, metadata);
};

/**
 * Extract S3 key from full S3 URL
 * @param url - Full S3 URL
 * @returns S3 object key
 */
export const extractS3KeyFromUrl = (url: string): string => {
  // Handle different S3 URL formats:
  // https://bucket-name.s3.region.amazonaws.com/folder/file.jpg
  // https://s3.region.amazonaws.com/bucket-name/folder/file.jpg
  
  const urlParts = url.split('/');
  
  if (url.includes('.s3.') || url.includes('s3.amazonaws.com')) {
    // Find the index where the key starts
    const bucketIndex = url.includes('.s3.') ? 3 : 4;
    return urlParts.slice(bucketIndex).join('/');
  }
  
  // Fallback for other formats
  return urlParts.slice(-2).join('/');
};

// Environment variables that need to be set:
// REACT_APP_AWS_ACCESS_KEY_ID=your_access_key
// REACT_APP_AWS_SECRET_ACCESS_KEY=your_secret_key
// REACT_APP_AWS_REGION=your_region (e.g., us-east-1)
// REACT_APP_S3_BUCKET_NAME=your_bucket_name