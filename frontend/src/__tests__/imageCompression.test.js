import { describe, it, expect, vi, beforeEach } from 'vitest';
import { compressImage } from '../utils/imageCompression';

// Mock canvas and context
const mockCtx = {
  drawImage: vi.fn()
};

const mockCanvas = {
  getContext: vi.fn().mockReturnValue(mockCtx),
  toDataURL: vi.fn().mockReturnValue('compressed-base64-string'),
  width: 0,
  height: 0
};

global.document.createElement = vi.fn((element) => {
  if (element === 'canvas') return mockCanvas;
  return {};
});

// Mock Image constructor
global.Image = class {
  constructor() {
    setTimeout(() => {
      this.onload && this.onload();
    });
  }
  width = 1000;
  height = 800;
};

// Mock FileReader
global.FileReader = class {
  constructor() {
    this.result = 'data:image/jpeg;base64,abc123';
  }
  readAsDataURL() {
    setTimeout(() => {
      this.onload && this.onload({ target: { result: this.result } });
    });
  }
};

describe('Image Compression Utility', () => {
  const mockFile = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('compresses an image with default options', async () => {
    const result = await compressImage(mockFile);
    
    // Canvas should be created
    expect(document.createElement).toHaveBeenCalledWith('canvas');
    
    // Image should be drawn on the canvas
    expect(mockCtx.drawImage).toHaveBeenCalled();
    
    // Should return compressed base64 string
    expect(result).toBe('compressed-base64-string');
    
    // toDataURL should be called with correct parameters
    expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.8);
  });

  it('compresses an image with custom options', async () => {
    const options = {
      maxWidth: 800,
      maxHeight: 600,
      quality: 0.6
    };
    
    await compressImage(mockFile, options);
    
    // Canvas size should be set to maintain aspect ratio and respect maxWidth/maxHeight
    expect(mockCanvas.width).toBeLessThanOrEqual(options.maxWidth);
    expect(mockCanvas.height).toBeLessThanOrEqual(options.maxHeight);
    
    // toDataURL should be called with the custom quality
    expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', options.quality);
  });

  it('handles errors properly', async () => {
    // Mock an error in FileReader
    global.FileReader = class {
      constructor() {}
      readAsDataURL() {
        setTimeout(() => {
          this.onerror && this.onerror(new Error('Mock error'));
        });
      }
    };
    
    await expect(compressImage(mockFile)).rejects.toThrow();
  });
});
