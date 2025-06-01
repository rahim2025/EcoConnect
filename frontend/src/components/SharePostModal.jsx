import { useState } from 'react';
import {
  X,
  Link as LinkIcon,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Copy,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

const SharePostModal = ({ isOpen, onClose, post }) => {
  const [copied, setCopied] = useState(false);
  
  if (!isOpen) return null;
  
  const shareUrl = `${window.location.origin}/post/${post._id}`;
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleShare = (platform) => {
    let shareLink;
    const postTitle = `Check out this eco-friendly post by ${post.user.fullName}`;
    const postContent = post.content.substring(0, 100) + (post.content.length > 100 ? '...' : '');
    
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(postTitle)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'email':
        shareLink = `mailto:?subject=${encodeURIComponent(postTitle)}&body=${encodeURIComponent(postContent + '\n\n' + shareUrl)}`;
        break;
      default:
        return;
    }
    
    window.open(shareLink, '_blank');
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60">
      <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-4 border-b border-base-200 flex justify-between items-center">
          <h3 className="text-lg font-medium">Share this post</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="bg-base-200 p-3 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <img
                src={post.user.profilePic || "/avatar.png"}
                alt={post.user.fullName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-medium">{post.user.fullName}</p>
              </div>
            </div>
            <p className="line-clamp-3">{post.content}</p>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <button
              onClick={() => handleShare('facebook')}
              className="flex flex-col items-center gap-2"
            >
              <div className="p-3 rounded-full bg-base-200 hover:bg-blue-500 hover:text-white transition-colors">
                <Facebook size={24} />
              </div>
              <span className="text-xs">Facebook</span>
            </button>
            
            <button
              onClick={() => handleShare('twitter')}
              className="flex flex-col items-center gap-2"
            >
              <div className="p-3 rounded-full bg-base-200 hover:bg-blue-400 hover:text-white transition-colors">
                <Twitter size={24} />
              </div>
              <span className="text-xs">Twitter</span>
            </button>
            
            <button
              onClick={() => handleShare('linkedin')}
              className="flex flex-col items-center gap-2"
            >
              <div className="p-3 rounded-full bg-base-200 hover:bg-blue-700 hover:text-white transition-colors">
                <Linkedin size={24} />
              </div>
              <span className="text-xs">LinkedIn</span>
            </button>
            
            <button
              onClick={() => handleShare('email')}
              className="flex flex-col items-center gap-2"
            >
              <div className="p-3 rounded-full bg-base-200 hover:bg-red-500 hover:text-white transition-colors">
                <Mail size={24} />
              </div>
              <span className="text-xs">Email</span>
            </button>
          </div>
          
          <div className="relative">
            <div className="flex items-center">
              <div className="flex-grow bg-base-200 rounded-l-lg px-4 py-3 text-sm truncate">
                {shareUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className="bg-base-200 hover:bg-base-300 px-4 py-3 rounded-r-lg"
              >
                {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharePostModal;
