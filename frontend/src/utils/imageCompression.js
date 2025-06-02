/**
 * Compresses an image file
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @param {Number} options.maxWidth - Maximum width of the output image
 * @param {Number} options.maxHeight - Maximum height of the output image
 * @param {Number} options.quality - Image quality, 0 to 1
 * @param {String} options.outputFormat - Output format ('image/jpeg', 'image/png', 'image/webp')
 * @returns {Promise<string>} - Base64 representation of the compressed image
 */
export const compressImage = (file, options = {}) => {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    outputFormat = 'image/jpeg'
  } = options;
  
  return new Promise((resolve, reject) => {
    // Validate file
    if (!file || !(file instanceof File)) {
      reject(new Error('Invalid file provided'));
      return;
    }

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }

    // Check file size (limit to 50MB as absolute maximum)
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxFileSize) {
      reject(new Error('File size too large (max 50MB)'));
      return;
    }
    
    // Create a FileReader to read the file
    const reader = new FileReader();
    
    // Set up FileReader onload event
    reader.onload = (readerEvent) => {
      // Create an image to store the image data
      const img = new Image();
      
      // Set up image onload event
      img.onload = () => {
        // Determine new dimensions
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = Math.round(height * maxWidth / width);
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = Math.round(width * maxHeight / height);
          height = maxHeight;
        }
          // Create a canvas to render the compressed image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        // Draw the image on the canvas with better quality settings
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get base64 representation of the compressed image
        const base64String = canvas.toDataURL(outputFormat, quality);
        
        // Check if compression actually reduced file size
        const originalSize = file.size;
        const compressedSize = base64String.length * 0.75; // Approximate size from base64
        
        console.log(`Image compression: ${originalSize} bytes -> ${Math.round(compressedSize)} bytes (${Math.round((1 - compressedSize/originalSize) * 100)}% reduction)`);
        
        resolve(base64String);
      };
      
      // Set up image error event
      img.onerror = (error) => {
        reject(error);
      };
      
      // Load the image from the FileReader data
      img.src = readerEvent.target.result;
    };
    
    // Set up FileReader error event
    reader.onerror = (error) => {
      reject(error);
    };
    
    // Read the file as a Data URL
    reader.readAsDataURL(file);
  });
};
