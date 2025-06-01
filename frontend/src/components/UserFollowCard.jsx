import { useState } from 'react';
import { UserPlus, X, Loader, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useChatStore } from '../store/useChatStore';

const UserFollowCard = ({ user, onClose }) => {
  const { authUser, followUser, unfollowUser } = useAuthStore();
  const { createMockFollowNotification } = useNotificationStore();
  const { setSelectedUser } = useChatStore();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Check if the current user is following this user
  // Handle both array of objects and array of strings
  const isFollowing = authUser?.following?.some(following => {
    const followingId = typeof following === 'object' ? following._id : following;
    return followingId === user._id;
  });
  
  // Handle starting a chat with this user
  const handleStartChat = () => {
    setSelectedUser(user);
    navigate('/chat');
  };
    const handleFollow = async () => {
    setIsLoading(true);
    try {
      const success = await followUser(user._id);
      
      // For demo purposes, we'll create a mock notification when someone follows a user
      // In a real app, this would be handled by the backend/socket
      // Note: We're sending the notification to the user being followed, not the current user
      if (success) {
        // Do not create a notification for the current user - they're the one doing the following
        // The notification should be received by the user being followed
      }
    } catch (error) {
      console.error("Error following user:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUnfollow = async () => {
    setIsLoading(true);
    try {
      await unfollowUser(user._id);
    } catch (error) {
      console.error("Error unfollowing user:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-base-100 rounded-lg shadow-sm p-4 relative">
      {/* Close button */}
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 p-1 hover:bg-base-200 rounded-full"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      
      {/* User avatar and name */}
      <div className="flex flex-col items-center mb-3">
        <Link to={`/profile/${user._id}`}>
          <img 
            src={user.profilePic || "/avatar.png"} 
            alt={user.fullName}
            className="w-16 h-16 rounded-full object-cover mb-2" 
          />
        </Link>
        <Link to={`/profile/${user._id}`} className="font-medium text-center">
          {user.fullName}
        </Link>
      </div>      {/* Bio or Mutual Connections */}
      {user.mutualConnections ? (
        <p className="text-xs text-center text-primary mb-3">
          <span className="font-medium">{user.mutualConnections}</span> mutual {user.mutualConnections === 1 ? 'connection' : 'connections'}
        </p>
      ) : user.bio ? (
        <p className="text-xs text-center text-gray-500 mb-3 line-clamp-2">
          {user.bio}
        </p>
      ) : null}
      
      {/* Matching interests if available */}
      {user.matchingInterests && user.matchingInterests.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1 mb-3">
          {user.matchingInterests.slice(0, 2).map(interest => (
            <span key={interest} className="badge badge-sm badge-outline badge-primary">
              {interest}
            </span>
          ))}
          {user.matchingInterests.length > 2 && (
            <span className="badge badge-sm badge-outline">
              +{user.matchingInterests.length - 2}
            </span>
          )}
        </div>
      )}
      
      {/* Chat button */}
      {user._id !== authUser?._id && (
        <button 
          onClick={handleStartChat}
          className="btn btn-sm btn-outline w-full mb-3 flex items-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          Message
        </button>
      )}
      
      {/* Follow button */}
      {user._id !== authUser?._id && (
        isFollowing ? (
          <button
            onClick={handleUnfollow}
            className="btn btn-outline btn-sm w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              "Unfollow"
            )}
          </button>
        ) : (
          <button 
            onClick={handleFollow}
            className="btn btn-primary btn-sm w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-1" />
                Follow
              </>
            )}
          </button>
        )
      )}
    </div>
  );
};

export default UserFollowCard;
