// Image validation utilities for property uploads

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate image file type
 * @param file - File to validate
 * @returns Validation result
 */
export const validateImageType = (file: File): ImageValidationResult => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not supported. Please use JPG, PNG, WebP, or GIF.`
    };
  }

  return { isValid: true };
};

/**
 * Validate image file size
 * @param file - File to validate
 * @param maxSizeMB - Maximum size in MB (default: 5MB)
 * @returns Validation result
 */
export const validateImageSize = (file: File, maxSizeMB: number = 5): ImageValidationResult => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds the maximum limit of ${maxSizeMB}MB.`
    };
  }

  return { isValid: true };
};

/**
 * Validate image dimensions
 * @param file - File to validate
 * @param minWidth - Minimum width in pixels
 * @param minHeight - Minimum height in pixels
 * @returns Promise with validation result
 */
export const validateImageDimensions = (
  file: File,
  minWidth: number = 800,
  minHeight: number = 600
): Promise<ImageValidationResult> => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      
      if (img.width < minWidth || img.height < minHeight) {
        resolve({
          isValid: false,
          error: `Image dimensions ${img.width}x${img.height} are too small. Minimum required: ${minWidth}x${minHeight}.`
        });
      } else {
        resolve({ isValid: true });
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        isValid: false,
        error: 'Unable to read image file. Please ensure it\'s a valid image.'
      });
    };

    img.src = url;
  });
};

/**
 * Comprehensive image validation
 * @param file - File to validate
 * @param options - Validation options
 * @returns Promise with validation result
 */
export const validateImage = async (
  file: File,
  options: {
    maxSizeMB?: number;
    minWidth?: number;
    minHeight?: number;
  } = {}
): Promise<ImageValidationResult> => {
  const { maxSizeMB = 5, minWidth = 800, minHeight = 600 } = options;

  // Validate file type
  const typeValidation = validateImageType(file);
  if (!typeValidation.isValid) {
    return typeValidation;
  }

  // Validate file size
  const sizeValidation = validateImageSize(file, maxSizeMB);
  if (!sizeValidation.isValid) {
    return sizeValidation;
  }

  // Validate dimensions
  const dimensionValidation = await validateImageDimensions(file, minWidth, minHeight);
  if (!dimensionValidation.isValid) {
    return dimensionValidation;
  }

  return { isValid: true };
};

/**
 * Generate optimized filename for S3 upload
 * @param originalName - Original filename
 * @param userId - User ID for folder organization
 * @returns Optimized filename with path
 */
export const generateS3FileName = (originalName: string, userId: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const fileExtension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  
  // Sanitize original name
  const sanitizedName = originalName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();

  return `properties/${userId}/${timestamp}-${randomString}-${sanitizedName}`;
};

/**
 * Compress image before upload (client-side)
 * @param file - Image file to compress
 * @param quality - Compression quality (0-1)
 * @param maxWidth - Maximum width
 * @param maxHeight - Maximum height
 * @returns Promise with compressed file
 */
export const compressImage = (
  file: File,
  quality: number = 0.8,
  maxWidth: number = 1920,
  maxHeight: number = 1080
): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Fallback to original
          }
        },
        file.type,
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
};