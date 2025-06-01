/**
 * Compresses an image file
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @param {Number} options.maxWidth - Maximum width of the output image
 * @param {Number} options.maxHeight - Maximum height of the output image
 * @param {Number} options.quality - Image quality, 0 to 1
 * @returns {Promise<string>} - Base64 representation of the compressed image
 */
export const compressImage = (file, options = {}) => {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8
  } = options;
  
  return new Promise((resolve, reject) => {
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
        
        // Draw the image on the canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get base64 representation of the compressed image
        const base64String = canvas.toDataURL('image/jpeg', quality);
        
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
