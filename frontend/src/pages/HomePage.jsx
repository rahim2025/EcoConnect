// filepath: c:\Users\moham\Desktop\eco friendly\frontend\src\pages\HomePage.jsx
import { useState, useEffect } from 'react';
import { useAuthStore } from "../store/useAuthStore";
import { usePostStore } from "../store/usePostStore";
import { Link } from 'react-router-dom';
import { 
  Leaf, 
  PlusCircle, 
  Search, 
  Users, 
  UserPlus,
  MessageCircle,
  CalendarDays,
  Award,
  User,
  TreePine
} from 'lucide-react';

import EcoPost from "../components/EcoPost";
import CreatePostModal from "../components/CreatePostModal";
import UserFollowCard from "../components/UserFollowCard";

const HomePage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  
  const { authUser, searchUsers } = useAuthStore();
  const { 
    fetchPosts, 
    posts, 
    loading, 
    createPost, 
    likePost, 
    commentOnPost, 
    deletePost,
    searchPosts,
    filterPosts,
    filterType
  } = usePostStore();
  
  useEffect(() => {
    fetchPosts();
    
    // Get suggested users
    const getSuggestedUsers = async () => {
      if (authUser) {
        try {
          const users = await searchUsers('');
          const filtered = users
            .filter(u => u._id !== authUser._id && !authUser.following?.includes(u._id))
            .slice(0, 3);
          setSuggestedUsers(filtered);
        } catch (err) {
          console.error('Error fetching suggested users:', err);
        }
      }
    };
    
    getSuggestedUsers();
  }, [fetchPosts, authUser, searchUsers]);
  
  const handlePostSubmit = async (postData) => {
    await createPost(postData);
  };
  
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchPosts(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };
  
  const displayPosts = searchResults.length > 0 ? searchResults : posts;
  
  return (
    <div className="min-h-screen bg-base-200 pb-10">
      {/* Welcome Banner */}
      <div className="w-full bg-gradient-to-br from-green-700 via-emerald-600 to-teal-500 pt-20 pb-16 px-4 text-white relative overflow-hidden">
        <div className="absolute opacity-10 -top-20 -left-10">
          <TreePine className="w-64 h-64" />
        </div>
        <div className="absolute opacity-10 -bottom-16 right-10">
          <Leaf className="w-40 h-40 rotate-45" />
        </div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center">
            <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <span className="font-medium">🌿 EcoConnect Community</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Inspire and act for a greener world!</h1>
            <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
              Join our growing community of environmental enthusiasts making a difference through eco-friendly actions, ideas, and collaborations.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <button 
                className="btn btn-lg bg-white text-green-700 hover:bg-green-100 border-none gap-2 shadow-lg"
                onClick={() => setShowCreateModal(true)}
              >
                <PlusCircle className="w-6 h-6" />
                Share Your Eco Idea
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="bg-base-100 shadow-md relative z-10">
        <div className="container mx-auto max-w-6xl px-4">
          <nav className="flex overflow-x-auto hide-scrollbar py-2">
            <Link to="/" className="flex items-center gap-2 px-5 py-3 font-medium text-primary border-b-2 border-primary">
              <Leaf className="w-5 h-5" />
              <span>Feed</span>
            </Link>
            <Link to="/following" className="flex items-center gap-2 px-5 py-3 font-medium text-base-content/70 hover:text-primary transition-colors">
              <UserPlus className="w-5 h-5" />
              <span>Connect</span>
            </Link>
            <Link to="/events" className="flex items-center gap-2 px-5 py-3 font-medium text-base-content/70 hover:text-primary transition-colors">
              <CalendarDays className="w-5 h-5" />
              <span>Events</span>
            </Link>
            <Link to="/leaderboard" className="flex items-center gap-2 px-5 py-3 font-medium text-base-content/70 hover:text-primary transition-colors">
              <Award className="w-5 h-5" />
              <span>Eco Points</span>
            </Link>
            <Link to="/chat" className="flex items-center gap-2 px-5 py-3 font-medium text-base-content/70 hover:text-primary transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span>Chat</span>
            </Link>
            <Link to="/profile" className="flex items-center gap-2 px-5 py-3 font-medium text-base-content/70 hover:text-primary transition-colors">
              <User className="w-5 h-5" />
              <span>Profile</span>
            </Link>
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-3">
            {/* User Profile Card */}
            <div className="bg-base-100 rounded-xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-base-200">
                <div className="flex items-center gap-3">
                  <img 
                    src={authUser?.profilePic || "/avatar.png"}
                    alt={authUser?.fullName || "Profile"} 
                    className="w-12 h-12 rounded-full object-cover" 
                  />
                  <div>
                    <h3 className="font-bold">{authUser?.fullName}</h3>
                    <p className="text-xs text-gray-500">@{authUser?.email ? authUser.email.split('@')[0] : "user"}</p>
                  </div>
                </div>
              </div>
              
              {/* Eco Points Summary */}
              <div className="p-5 border-b border-base-200">
                <h3 className="text-sm uppercase font-bold text-gray-500 mb-2">Eco Points</h3>
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500 text-white p-2 rounded-full">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{authUser?.ecoPoints || 0}</p>
                    <p className="text-xs text-gray-500">Keep posting and interacting!</p>
                  </div>
                </div>
              </div>
              
              {/* Connections Stats */}
              <div className="p-5">
                <h3 className="text-sm uppercase font-bold text-gray-500 mb-3">Connections</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/following" className="bg-base-200 p-3 rounded-lg hover:bg-base-300">
                    <p className="text-center font-bold">{authUser?.following?.length || 0}</p>
                    <p className="text-xs text-center text-gray-500">Following</p>
                  </Link>
                  <Link to="/following?tab=followers" className="bg-base-200 p-3 rounded-lg hover:bg-base-300">
                    <p className="text-center font-bold">{authUser?.followers?.length || 0}</p>
                    <p className="text-xs text-center text-gray-500">Followers</p>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Suggested Users */}
            {suggestedUsers.length > 0 && (
              <div className="bg-base-100 rounded-xl shadow-sm overflow-hidden mt-6">
                <div className="p-5 border-b border-base-200 flex justify-between items-center">
                  <h3 className="font-bold">Eco-Minded People</h3>
                  <Link to="/following?tab=discover" className="text-xs text-primary">
                    See All
                  </Link>
                </div>
                <div className="p-4 space-y-4">
                  {suggestedUsers.map(user => (
                    <UserFollowCard 
                      key={user._id} 
                      user={user} 
                      onClose={() => {
                        setSuggestedUsers(suggestedUsers.filter(u => u._id !== user._id));
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Popular Tags */}
            <div className="bg-base-100 rounded-xl shadow-sm p-5 mt-6">
              <h3 className="font-bold mb-4">Trending Topics</h3>
              <div className="flex flex-wrap gap-2">
                <Link to="/?tag=sustainability" className="badge badge-lg">
                  #sustainability
                </Link>
                <Link to="/?tag=recycling" className="badge badge-lg">
                  #recycling
                </Link>
                <Link to="/?tag=zerowaste" className="badge badge-lg">
                  #zerowaste
                </Link>
                <Link to="/?tag=climateaction" className="badge badge-lg">
                  #climateaction
                </Link>
                <Link to="/?tag=ecofriendly" className="badge badge-lg">
                  #ecofriendly
                </Link>
              </div>
            </div>
          </div>
          
          {/* Middle - Posts Feed */}
          <div className="lg:col-span-6">
            {/* Search Bar */}
            <div className="bg-base-100 rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="p-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="Search for eco-friendly posts..."
                    className="input input-bordered flex-1"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>
            
            {searchResults.length > 0 && (
              <div className="mb-4 p-4 bg-base-100 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold">Search Results</h3>
                  <button 
                    onClick={handleClearSearch}
                    className="btn btn-sm btn-ghost"
                  >
                    Clear
                  </button>
                </div>
                <p className="text-sm text-base-content/70">Found {searchResults.length} results for "{searchQuery}"</p>
              </div>
            )}
            
            {/* Post Creation Card */}
            <div className="bg-base-100 rounded-xl shadow-sm p-5 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src={authUser?.profilePic || "/avatar.png"} 
                  alt="Profile" 
                  className="w-12 h-12 rounded-full object-cover" 
                />
                <button 
                  className="input input-bordered flex-grow text-left text-base-content/70"
                  onClick={() => setShowCreateModal(true)}
                >
                  Share your eco-friendly idea or action...
                </button>
              </div>
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <button 
                    className="btn btn-sm btn-ghost"
                    onClick={() => setShowCreateModal(true)}
                  >
                    📷 Photo
                  </button>
                  <button 
                    className="btn btn-sm btn-ghost"
                    onClick={() => setShowCreateModal(true)}
                  >
                    🏷️ Tag
                  </button>
                </div>
                <button 
                  className="btn btn-sm btn-primary px-6"
                  onClick={() => setShowCreateModal(true)}
                >
                  Share
                </button>
              </div>
            </div>
            
            {/* Posts Feed */}
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Leaf className="w-6 h-6 text-primary" />
                  <span>Recent Eco Posts</span>
                </h2>
                <div className="flex gap-2">
                  <button 
                    className={`btn btn-sm ${filterType === 'all' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => filterPosts('all')}
                  >
                    All
                  </button>
                  <button 
                    className={`btn btn-sm ${filterType === 'following' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => filterPosts('following')}
                  >
                    Following
                  </button>
                </div>
              </div>
              
              {loading ? (
                <div className="flex flex-col gap-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="bg-base-100 rounded-xl shadow-sm p-5">
                      <div className="flex gap-3 items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-base-300 animate-pulse"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-base-300 rounded w-1/4 mb-2 animate-pulse"></div>
                          <div className="h-3 bg-base-300 rounded w-1/6 animate-pulse"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-base-300 rounded animate-pulse"></div>
                        <div className="h-4 bg-base-300 rounded animate-pulse"></div>
                        <div className="h-4 bg-base-300 rounded w-3/4 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : displayPosts.length === 0 ? (
                <div className="bg-base-100 rounded-xl shadow-sm p-8 text-center">
                  <h3 className="text-xl font-bold mb-2">No posts yet</h3>
                  <p className="mb-4">Be the first to share your eco-friendly ideas and inspirations!</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowCreateModal(true)}
                  >
                    Create Your First Post
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {displayPosts.map((post) => (
                    <EcoPost
                      key={post._id}
                      post={post}
                      onLike={likePost}
                      onComment={commentOnPost}
                      onDelete={deletePost}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Right Sidebar */}
          <div className="lg:col-span-3">
            {/* Upcoming Events */}
            <div className="bg-base-100 rounded-xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-base-200 flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  <span>Upcoming Eco Events</span>
                </h3>
                <Link to="/events" className="text-xs text-primary">
                  View All
                </Link>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  <div className="bg-base-200 rounded-lg p-3">
                    <h4 className="font-medium">Beach Clean-up Day</h4>
                    <p className="text-xs text-base-content/70 mt-1">This Saturday, 9:00 AM</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs">12 participants</span>
                      <Link to="/events/beachcleanup" className="text-xs text-primary">Details</Link>
                    </div>
                  </div>
                  <div className="bg-base-200 rounded-lg p-3">
                    <h4 className="font-medium">Tree Planting Initiative</h4>
                    <p className="text-xs text-base-content/70 mt-1">Next Sunday, 10:00 AM</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs">28 participants</span>
                      <Link to="/events/treeplanting" className="text-xs text-primary">Details</Link>
                    </div>
                  </div>
                  <Link to="/events/create" className="btn btn-outline btn-sm w-full">
                    <PlusCircle className="w-4 h-4" />
                    Create New Event
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Eco Leaderboard */}
            <div className="bg-base-100 rounded-xl shadow-sm overflow-hidden mt-6">
              <div className="p-5 border-b border-base-200 flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  <span>Eco Leaderboard</span>
                </h3>
                <Link to="/leaderboard" className="text-xs text-primary">
                  Full Leaderboard
                </Link>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {[1, 2, 3].map((rank) => (
                    <div key={rank} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-xs font-medium">{rank}</span>
                        </div>
                        <div className="avatar">
                          <div className="w-8 h-8 rounded-full">
                            <img src="/avatar.png" alt="User" />
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-sm">Eco Warrior {rank}</p>
                        </div>
                      </div>
                      <div className="font-medium text-sm">
                        {1000 - (rank * 100)} pts
                      </div>
                    </div>
                  ))}
                </div>
                
                <Link to="/leaderboard" className="btn btn-sm btn-outline w-full mt-4">
                  View Your Ranking
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Create Post Modal */}
      {showCreateModal && (
        <CreatePostModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handlePostSubmit}
        />
      )}
    </div>
  );
};

export default HomePage;
