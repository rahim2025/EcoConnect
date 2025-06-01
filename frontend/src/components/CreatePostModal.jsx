import { useState, useRef } from 'react';
import { X, Image, Tag, Eye, Plus } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { compressImage } from '../utils/imageCompression';

const CreatePostModal = ({ isOpen, onClose, onSubmit }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [visibility, setVisibility] = useState('public');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { authUser } = useAuthStore();
  const fileInputRef = useRef(null);
  
  if (!isOpen) return null;
    const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      // Compress image before upload
      const compressedImage = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.7
      });
      
      setImage(file);
      setImagePreview(compressedImage);
    } catch (error) {
      console.error('Error compressing image:', error);
      
      // Fallback to original image if compression fails
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(file);
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };
  
  const handleTagInputKeyPress = (e) => {
    // Add tag when Enter or comma is pressed
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    
    let imageBase64 = '';
    if (image) {
      imageBase64 = imagePreview;
    }
    
    try {
      await onSubmit({
        content,
        image: imageBase64,
        tags,
        visibility
      });
      
      // Reset form
      setContent('');
      setImage(null);
      setImagePreview('');
      setTags([]);
      setVisibility('public');
      
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-base-200 flex justify-between items-center">
          <h2 className="text-lg font-bold">Create Post</h2>
          <button 
            className="btn btn-sm btn-ghost btn-circle"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-5">
            {/* User Info */}
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={authUser?.profilePic || "/avatar.png"} 
                alt={authUser?.fullName} 
                className="w-10 h-10 rounded-full object-cover" 
              />
              <div>
                <h3 className="font-medium">{authUser?.fullName}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <Eye className="w-3 h-3" />
                  <select 
                    className="text-xs bg-transparent border-none p-0 pr-4 focus:ring-0"
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                  >
                    <option value="public">Public</option>
                    <option value="followers">Followers only</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <textarea
              placeholder="Share your eco-friendly idea or inspiration..."
              className="textarea textarea-bordered w-full resize-none h-32"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            ></textarea>
            
            {/* Image Preview */}
            {imagePreview && (
              <div className="relative mt-4 border rounded-lg overflow-hidden">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-60 object-contain bg-base-200" 
                />
                <button 
                  type="button"
                  className="absolute top-2 right-2 btn btn-sm btn-circle btn-error"
                  onClick={handleRemoveImage}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {/* Tags Section */}
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4" />
                <h4 className="font-medium text-sm">Tags</h4>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, index) => (
                  <div key={index} className="badge badge-accent gap-1">
                    #{tag}
                    <button 
                      type="button"
                      className="btn btn-xs btn-ghost btn-circle"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Add tags... (e.g. recycling, sustainability)" 
                  className="input input-bordered input-sm flex-1"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagInputKeyPress}
                />
                <button 
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim()}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Press Enter or comma (,) after each tag
              </p>
            </div>
          </div>
          
          {/* Actions Footer */}
          <div className="p-5 border-t border-base-200">
            <div className="flex flex-wrap gap-2 mb-4">
              <button 
                type="button"
                className="btn btn-sm btn-outline gap-2"
                onClick={() => fileInputRef.current.click()}
              >
                <Image className="w-4 h-4" />
                Add Photo
              </button>
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button 
                type="button"
                className="btn btn-outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn btn-primary"
                disabled={!content.trim() || isSubmitting}
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;