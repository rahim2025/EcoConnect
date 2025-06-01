import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { MessageSquare, UserPlus, Check, RefreshCw } from 'lucide-react';

const FollowersFollowingWidget = ({ maxUsers = 3, showFollowButton = true }) => {
  const [activeTab, setActiveTab] = useState('following');
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const { authUser, getFollowers, getFollowing, followUser, unfollowUser } = useAuthStore();
  
  useEffect(() => {
    loadUsers();
  }, []);
  
  const loadUsers = async () => {
    setLoading(true);
    try {
      const followersData = await getFollowers();
      const followingData = await getFollowing();
      setFollowers(followersData);
      setFollowing(followingData);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFollow = async (userId) => {
    await followUser(userId);
    loadUsers(); // Refresh the lists
  };
  
  const handleUnfollow = async (userId) => {
    await unfollowUser(userId);
    loadUsers(); // Refresh the lists
  };
  
  // Determine which users to display based on the active tab
  const displayUsers = activeTab === 'following' ? following.slice(0, maxUsers) : followers.slice(0, maxUsers);
  const hasMore = activeTab === 'following' ? following.length > maxUsers : followers.length > maxUsers;
  
  return (
    <div className="bg-base-100 rounded-xl shadow-sm overflow-hidden">
      <div className="border-b border-base-200">
        <div className="grid grid-cols-2">
          <button
            className={`py-3 font-medium text-center transition-colors ${
              activeTab === 'following' ? 'border-b-2 border-primary' : ''
            }`}
            onClick={() => setActiveTab('following')}
          >
            Following ({following.length})
          </button>
          <button
            className={`py-3 font-medium text-center transition-colors ${
              activeTab === 'followers' ? 'border-b-2 border-primary' : ''
            }`}
            onClick={() => setActiveTab('followers')}
          >
            Followers ({followers.length})
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin">
              <RefreshCw className="w-6 h-6 opacity-50" />
            </div>
          </div>
        ) : displayUsers.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            {activeTab === 'following' 
              ? "You're not following anyone yet." 
              : "You don't have any followers yet."}
            {activeTab === 'following' && (
              <div className="mt-2">
                <Link to="/following" className="btn btn-primary btn-sm">
                  Find People
                </Link>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {displayUsers.map(user => (
                <div key={user._id} className="flex justify-between items-center">
                  <Link to={`/profile/${user._id}`} className="flex items-center gap-3">
                    <img 
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium">{user.fullName}</p>
                      {user.bio && <p className="text-xs text-gray-500 line-clamp-1">{user.bio}</p>}
                    </div>
                  </Link>
                  
                  {showFollowButton && user._id !== authUser?._id && (
                    activeTab === 'followers' && !authUser?.following?.includes(user._id) ? (
                      <button 
                        onClick={() => handleFollow(user._id)}
                        className="btn btn-primary btn-xs"
                      >
                        <UserPlus className="w-3 h-3" />
                      </button>
                    ) : activeTab === 'following' ? (
                      <button 
                        onClick={() => handleUnfollow(user._id)}
                        className="btn btn-outline btn-xs"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    ) : (
                      <Link to={`/chat?userId=${user._id}`} className="btn btn-ghost btn-xs">
                        <MessageSquare className="w-3 h-3" />
                      </Link>
                    )
                  )}
                </div>
              ))}
            </div>
            
            {hasMore && (
              <div className="mt-4 text-center">
                <Link 
                  to={`/following?tab=${activeTab}`}
                  className="text-sm text-primary hover:underline"
                >
                  View All
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FollowersFollowingWidget;