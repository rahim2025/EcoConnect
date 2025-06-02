/**
 * Utility functions for file size management
 */

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Check if file size is within acceptable limits
 * @param {File} file - File to check
 * @param {number} maxSize - Maximum size in bytes (default 10MB)
 * @returns {Object} - Validation result with isValid and message
 */
export const validateFileSizeDetailed = (file, maxSize = 10 * 1024 * 1024) => {
  if (!file) {
    return { isValid: false, message: 'No file provided' };
  }
  
  if (file.size > maxSize) {
    return {
      isValid: false,
      message: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(maxSize)})`
    };
  }
  
  return { isValid: true, message: 'File size is acceptable' };
};

/**
 * Check if file size is within acceptable limits
 * @param {File} file - File to check
 * @param {number} maxSize - Maximum size in bytes (default 10MB)
 * @returns {boolean} - true if valid, false if invalid
 */
export const validateFileSize = (file, maxSize = 10 * 1024 * 1024) => {
  if (!file) return false;
  return file.size <= maxSize;
};

/**
 * Check if file type is in the allowed list
 * @param {File} file - File to check
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @returns {boolean} - true if valid, false if invalid
 */
export const validateFileType = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/webp']) => {
  if (!file) return false;
  return allowedTypes.includes(file.type);
};

/**
 * Get image dimensions from file
 * @param {File} file - Image file
 * @returns {Promise<Object>} - Image dimensions
 */
export const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }
    
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.width,
        height: img.height,
        aspectRatio: img.width / img.height
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};
