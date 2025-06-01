import { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreVertical, 
  Trash2, 
  Send,
  MoreHorizontal,
  AlertTriangle,
  Flag,
  EyeOff,
  MessageSquare
} from 'lucide-react';
import ReportPostModal from './ReportPostModal';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import { usePostStore } from '../store/usePostStore';
import { useChatStore } from '../store/useChatStore';
import SharePostModal from './SharePostModal';

const EcoPost = ({ post, onLike, onComment, onDelete }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [showCommentOptions, setShowCommentOptions] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);  const { authUser } = useAuthStore();
  const { deleteComment } = usePostStore();
  const { setSelectedUser } = useChatStore();
  const navigate = useNavigate();
  
  // Check if post is hidden due to reports
  const isHidden = post.isHidden;
  // Check if post has pending reports
  const hasPendingReports = post.reports?.some(report => report.status === 'pending');
  // Check if current user is an admin
  const isAdmin = authUser?.isAdmin;
    // Check if the current user has liked this post
  const isLiked = post.likes && Array.isArray(post.likes) && authUser?._id && post.likes.some((like) => {
    if (typeof like === 'object' && like !== null) {
      return like._id === authUser._id;
    } else {
      return like === authUser._id;
    }
  });
  const isOwnPost = post.user?._id === authUser?._id;
  
  // Handle starting a chat with the post author
  const handleStartChat = () => {
    if (!authUser) {
      toast.error("You must be logged in to send messages");
      return;
    }
    
    if (isOwnPost) {
      toast.error("You can't message yourself");
      return;
    }
    
    setSelectedUser(post.user);
    navigate('/chat');
  };
  
  const handleLike = () => {
    if (!authUser || !authUser._id) {
      toast.error("You must be logged in to like posts");
      return;
    }
    
    // Call the onLike function and provide feedback to the user
    onLike(post._id);
    
    // We won't use toast here since the UI will update to show the change
  };
  
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(post._id, commentText);
      setCommentText('');
    }
  };

  const handleDeleteComment = async (commentId) => {
    await deleteComment(post._id, commentId);
    setShowCommentOptions(null);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
      return diffDay === 1 ? '1 day ago' : `${diffDay} days ago`;
    } else if (diffHour > 0) {
      return diffHour === 1 ? '1 hour ago' : `${diffHour} hours ago`;
    } else if (diffMin > 0) {
      return diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`;
    } else {
      return 'Just now';
    }
  };
  return (
    <div className={`bg-base-100 rounded-xl shadow-sm mb-6 overflow-hidden ${
      isHidden ? 'border-2 border-amber-400' : 
      hasPendingReports && isAdmin ? 'border-2 border-yellow-300' : ''
    }`}>
      {isHidden && (
        <div className="bg-amber-50 p-3 flex items-center gap-2">
          <EyeOff className="w-5 h-5 text-amber-600" />
          <p className="text-amber-800 text-sm">
            This post has been hidden by moderators due to community guideline violations.
            {isAdmin && ' Only admins and moderators can see it.'}
          </p>
        </div>
      )}
      
      {!isHidden && hasPendingReports && isAdmin && (
        <div className="bg-yellow-50 p-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <p className="text-yellow-800 text-sm">
            This post has been reported and is awaiting review.
          </p>
        </div>
      )}
      
      {/* Post Header */}
      <div className="p-5 pb-3">
        <div className="flex justify-between">
          <Link to={`/profile/${post.user?._id}`} className="flex gap-3">
            <img 
              src={post.user?.profilePic || "/avatar.png"} 
              alt={post.user?.fullName} 
              className="w-12 h-12 rounded-full object-cover" 
            />
            <div>
              <h3 className="font-bold">{post.user?.fullName}</h3>
              <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
            </div>
          </Link>
          
          <div className="relative">
            <button 
              className="btn btn-sm btn-ghost btn-circle" 
              onClick={() => setShowOptions(!showOptions)}
            >
              <MoreVertical className="w-5 h-5" />
            </button>
              {showOptions && (              <div className="absolute right-0 mt-2 w-48 bg-base-100 rounded-md shadow-lg z-10 border border-base-200">
                {isOwnPost && (
                  <button 
                    className="flex w-full items-center px-4 py-2 text-sm text-red-500 hover:bg-base-200" 
                    onClick={() => {
                      onDelete(post._id);
                      setShowOptions(false);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete post
                  </button>
                )}
                {!isOwnPost && (
                  <>
                    <button 
                      className="flex w-full items-center px-4 py-2 text-sm hover:bg-base-200" 
                      onClick={() => {
                        handleStartChat();
                        setShowOptions(false);
                      }}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" /> Message user
                    </button>
                    <button 
                      className="flex w-full items-center px-4 py-2 text-sm text-amber-600 hover:bg-base-200" 
                      onClick={() => {
                        setShowReportModal(true);
                        setShowOptions(false);
                      }}
                    >
                      <Flag className="w-4 h-4 mr-2" /> Report post
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Post Content */}
      <div className="px-5">
        <p className="mb-4">{post.content}</p>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, index) => (
              <span key={index} className="badge badge-accent">#{tag}</span>
            ))}
          </div>
        )}
      </div>
      
      {/* Post Image */}
      {post.image && (
        <div className="w-full">
          <img 
            src={post.image} 
            alt="Post" 
            className="w-full object-cover max-h-96" 
          />
        </div>
      )}
      
      {/* Post Stats */}
      <div className="px-5 py-2 text-sm text-gray-500 border-t border-base-200">
        <div className="flex gap-4">
          <span>{post.likes?.length || 0} {post.likes?.length === 1 ? 'like' : 'likes'}</span>
          <span>{post.comments?.length || 0} {post.comments?.length === 1 ? 'comment' : 'comments'}</span>
        </div>
      </div>
      
      {/* Post Actions */}
      <div className="grid grid-cols-3 border-t border-base-200">        <button 
          className={`btn btn-ghost rounded-none flex items-center justify-center gap-2 py-3 ${isLiked ? 'text-primary' : ''}`}
          onClick={handleLike}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-primary' : ''}`} /> {isLiked ? 'Unlike' : 'Like'}
        </button>
        <button 
          className="btn btn-ghost rounded-none flex items-center justify-center gap-2 py-3"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle className="w-5 h-5" /> Comment
        </button>        <button 
          className="btn btn-ghost rounded-none flex items-center justify-center gap-2 py-3"
          onClick={() => setShowShareModal(true)}
        >
          <Share2 className="w-5 h-5" /> Share
        </button>
      </div>
      
      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-base-200 p-5">
          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="flex gap-3 mb-4">
            <img 
              src={authUser?.profilePic || "/avatar.png"} 
              alt={authUser?.fullName} 
              className="w-8 h-8 rounded-full object-cover" 
            />
            <div className="flex-1 flex gap-2">
              <input 
                type="text" 
                placeholder="Write a comment..." 
                className="input input-bordered flex-1 text-sm h-10"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button 
                type="submit" 
                className="btn btn-primary h-10 min-h-0 px-3"
                disabled={!commentText.trim()}
              >
                <Send size={18} />
              </button>
            </div>
          </form>
          
          {/* Comments List */}
          {post.comments?.length > 0 ? (
            <div className="space-y-4">
              {post.comments.map((comment) => (
                <div key={comment._id} className="flex gap-3">                  <img 
                    src={comment.user?.profilePic || "/avatar.png"} 
                    alt={comment.user?.fullName} 
                    className="w-8 h-8 rounded-full object-cover" 
                  />
                  <div className="flex-1">
                    <div className="bg-base-200 p-3 rounded-lg relative">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm">{comment.user?.fullName}</h4>
                        {(comment.user?._id === authUser?._id || isOwnPost) && (
                          <div className="relative">
                            <button 
                              onClick={() => setShowCommentOptions(showCommentOptions === comment._id ? null : comment._id)}
                              className="p-1 hover:bg-base-300 rounded-full"
                            >
                              <MoreHorizontal size={16} />
                            </button>
                            
                            {showCommentOptions === comment._id && (
                              <div className="absolute right-0 mt-1 w-36 bg-base-100 rounded-md shadow-lg z-10 border border-base-200">
                                <button 
                                  className="flex w-full items-center px-3 py-2 text-sm text-red-500 hover:bg-base-200" 
                                  onClick={() => handleDeleteComment(comment._id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-sm">{comment.text}</p>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex gap-3">
                      <span>{formatDate(comment.createdAt)}</span>
                      <button className="hover:text-primary">Like</button>
                      <button className="hover:text-primary">Reply</button>
                    </div>
                  </div>
                  {comment.user?._id === authUser?._id && (
                    <div className="relative">
                      <button 
                        className="btn btn-sm btn-ghost btn-circle" 
                        onClick={() => setShowCommentOptions(comment._id)}
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      {showCommentOptions === comment._id && (
                        <div className="absolute right-0 mt-2 w-48 bg-base-100 rounded-md shadow-lg z-10 border border-base-200">
                          <button 
                            className="flex w-full items-center px-4 py-2 text-sm text-red-500 hover:bg-base-200" 
                            onClick={() => handleDeleteComment(comment._id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete comment
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-3">No comments yet. Be the first to comment!</p>
          )}
        </div>
      )}
      
      {/* Share Modal */}
      <SharePostModal 
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        post={post}
      />
      
      {/* Report Modal */}
      <ReportPostModal 
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        post={post}
      />
    </div>
  );
};

export default EcoPost;