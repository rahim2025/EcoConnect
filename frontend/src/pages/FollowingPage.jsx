import { useState, useEffect } from 'react';
import { useAuthStore } from "../store/useAuthStore";
import { UserPlus, Users, Search, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from "../components/Sidebar";

const FollowingPage = () => {
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeTab, setActiveTab] = useState('following');
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    authUser, 
    followUser, 
    unfollowUser, 
    getFollowers, 
    getFollowing, 
    searchUsers 
  } = useAuthStore();
  
  useEffect(() => {
    loadConnections();
    loadSuggestedUsers();
  }, []);
  
  const loadConnections = async () => {
    setIsLoading(true);
    try {
      const followersData = await getFollowers();
      const followingData = await getFollowing();
      setFollowers(followersData);
      setFollowing(followingData);
    } catch (error) {
      console.error("Error loading connections:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadSuggestedUsers = async () => {
    try {
      // Search for users with similar interests as the current user
      if (authUser?.interests?.length > 0) {
        const interestQueries = authUser.interests.map(async (interest) => {
          return await searchUsers(interest);
        });
        
        const results = await Promise.all(interestQueries);
        
        // Flatten results, remove duplicates and current user
        const allSuggestions = results.flat().filter((user, index, self) => 
          // Remove duplicates
          index === self.findIndex(u => u._id === user._id) && 
          // Remove current user
          user._id !== authUser._id &&
          // Remove users already followed
          !authUser.following.includes(user._id)
        );
        
        // Limit to 10 suggestions
        setSuggestedUsers(allSuggestions.slice(0, 10));
      } else {
        // If no interests, just get some random users
        const randomUsers = await searchUsers("");
        setSuggestedUsers(
          randomUsers
            .filter(user => 
              user._id !== authUser._id && 
              !authUser.following.includes(user._id)
            )
            .slice(0, 10)
        );
      }
    } catch (error) {
      console.error("Error loading suggested users:", error);
    }
  };
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results.filter(user => user._id !== authUser._id));
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };
  
  const handleFollow = async (userId) => {
    const success = await followUser(userId);
    if (success) {
      // Refresh connections and suggested users
      loadConnections();
      loadSuggestedUsers();
      // Clear search results if any
      if (searchResults.length > 0) {
        handleSearch();
      }
    }
  };
  
  const handleUnfollow = async (userId) => {
    const success = await unfollowUser(userId);
    if (success) {
      // Refresh connections and suggested users
      loadConnections();
      loadSuggestedUsers();
      // Clear search results if any
      if (searchResults.length > 0) {
        handleSearch();
      }
    }
  };
  
  // Render a user card with follow/unfollow button
  const UserCard = ({ user, isFollowed }) => (
    <div className="flex justify-between items-center p-4 border-b border-base-200 hover:bg-base-200/50">
      <Link to={`/profile/${user._id}`} className="flex items-center gap-3">
        <img 
          src={user.profilePic || "/avatar.png"}
          alt={user.fullName}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold">{user.fullName}</p>
          {user.bio && <p className="text-xs line-clamp-1 text-gray-500 mt-1">{user.bio}</p>}
        </div>
      </Link>
      {user._id !== authUser?._id && (
        isFollowed ? (
          <button 
            onClick={() => handleUnfollow(user._id)}
            className="btn btn-sm btn-outline"
          >
            Unfollow
          </button>
        ) : (
          <button 
            onClick={() => handleFollow(user._id)}
            className="btn btn-sm btn-primary"
          >
            <UserPlus className="w-4 h-4 mr-1" />
            Follow
          </button>
        )
      )}
    </div>
  );
  
  return (
    <div className="min-h-screen bg-base-200 pb-10 pt-20">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-3">
            <Sidebar />
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-9">
            <div className="bg-base-100 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-base-200">
                <h1 className="text-2xl font-bold">Connections</h1>
                <p className="text-gray-500">
                  Follow other eco-enthusiasts and see their content in your feed
                </p>
              </div>
              
              {/* Search Bar */}
              <div className="p-6 border-b border-base-200">
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="Search users by name, location, or interests..."
                    className="input input-bordered w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button 
                    className="btn btn-primary"
                    onClick={handleSearch}
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Tabs */}
              <div className="flex border-b border-base-200 overflow-x-auto">
                <button 
                  className={`px-6 py-4 font-medium flex items-center gap-2 border-b-2 transition-colors ${
                    activeTab === 'following' ? 'border-primary' : 'border-transparent'
                  }`}
                  onClick={() => setActiveTab('following')}
                >
                  <UserPlus className="w-5 h-5" />
                  Following ({following.length})
                </button>
                <button 
                  className={`px-6 py-4 font-medium flex items-center gap-2 border-b-2 transition-colors ${
                    activeTab === 'followers' ? 'border-primary' : 'border-transparent'
                  }`}
                  onClick={() => setActiveTab('followers')}
                >
                  <Users className="w-5 h-5" />
                  Followers ({followers.length})
                </button>
                <button 
                  className={`px-6 py-4 font-medium flex items-center gap-2 border-b-2 transition-colors ${
                    activeTab === 'discover' ? 'border-primary' : 'border-transparent'
                  }`}
                  onClick={() => setActiveTab('discover')}
                >
                  <UserPlus className="w-5 h-5" />
                  Discover Users
                </button>
              </div>
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="p-4 bg-base-200">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Search Results</h3>
                    <button 
                      className="text-sm underline"
                      onClick={() => setSearchResults([])}
                    >
                      Clear
                    </button>
                  </div>
                  <div className="bg-base-100 rounded-lg">
                    {searchResults.map(user => (
                      <UserCard 
                        key={user._id} 
                        user={user} 
                        isFollowed={authUser?.following?.includes(user._id)} 
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Tab Content */}
              <div className="p-4">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin">
                      <RefreshCw className="w-8 h-8 opacity-50" />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Following Tab */}
                    {activeTab === 'following' && (
                      <>
                        {following.length === 0 ? (
                          <div className="text-center py-12">
                            <p className="mb-3 text-gray-500">You're not following anyone yet.</p>
                            <button 
                              className="btn btn-primary"
                              onClick={() => setActiveTab('discover')}
                            >
                              Discover Users to Follow
                            </button>
                          </div>
                        ) : (
                          <div className="bg-base-100 rounded-lg">
                            {following.map(user => (
                              <UserCard key={user._id} user={user} isFollowed={true} />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                    
                    {/* Followers Tab */}
                    {activeTab === 'followers' && (
                      <>
                        {followers.length === 0 ? (
                          <div className="text-center py-12">
                            <p className="text-gray-500">You don't have any followers yet.</p>
                          </div>
                        ) : (
                          <div className="bg-base-100 rounded-lg">
                            {followers.map(user => (
                              <UserCard 
                                key={user._id} 
                                user={user} 
                                isFollowed={authUser?.following?.includes(user._id)} 
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                    
                    {/* Discover Tab */}
                    {activeTab === 'discover' && (
                      <>
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-semibold">Suggested Users</h3>
                          <button 
                            className="text-sm underline flex items-center gap-1"
                            onClick={loadSuggestedUsers}
                          >
                            <RefreshCw className="w-3 h-3" />
                            Refresh
                          </button>
                        </div>
                        
                        {suggestedUsers.length === 0 ? (
                          <div className="text-center py-12 bg-base-100 rounded-lg">
                            <p className="text-gray-500">No suggested users found.</p>
                          </div>
                        ) : (
                          <div className="bg-base-100 rounded-lg">
                            {suggestedUsers.map(user => (
                              <UserCard 
                                key={user._id} 
                                user={user} 
                                isFollowed={authUser?.following?.includes(user._id)} 
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowingPage;
