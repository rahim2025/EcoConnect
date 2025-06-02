import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { usePostStore } from "../store/usePostStore";
import { useEventStore } from "../store/useEventStore";
import { useChatStore } from "../store/useChatStore";
import { Camera, Mail, User, MapPin, Edit2, Award, Save, UserPlus, Users, Search, PlusCircle, UserMinus, CalendarDays, ArrowRight, ShoppingBag, MessageSquare } from "lucide-react";
import PointsSummary from "../components/PointsSummary";
import UserBadges from "../components/UserBadges";
import EcoPost from "../components/EcoPost";
import CreatePostModal from "../components/CreatePostModal";
import { useParams, useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import { compressImage } from "../utils/imageCompression";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile, followUser, unfollowUser, searchUsers, getFollowers, getFollowing } = useAuthStore();
  const { fetchUserPosts, createPost, likePost, commentOnPost, deletePost } = usePostStore();
  const { setSelectedUser } = useChatStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [interests, setInterests] = useState([]);
  const [interestInput, setInterestInput] = useState("");
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [userEvents, setUserEvents] = useState({
    organized: [],
    participating: []
  });
  const [loadingEvents, setLoadingEvents] = useState(false);
  
  // For viewing other users' profiles
  const { id: userId } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (authUser) {
      setBio(authUser.bio || "");
      setLocation(authUser.location || "");
      setInterests(authUser.interests || []);
    }
  }, [authUser]);

  useEffect(() => {
    // Load followers and following when component mounts
    const loadConnections = async () => {
      const followersData = await getFollowers();
      const followingData = await getFollowing();
      setFollowers(followersData);
      setFollowing(followingData);
    };
    loadConnections();
  }, [getFollowers, getFollowing]);

  useEffect(() => {
    // Load user's posts when component mounts
    const loadPosts = async () => {
      if (authUser) {
        setLoadingPosts(true);
        try {
          const postsData = await fetchUserPosts(authUser._id);
          setPosts(postsData);
        } catch (error) {
          console.error("Error loading posts:", error);
        } finally {
          setLoadingPosts(false);
        }
      }
    };
    loadPosts();
  }, [authUser, fetchUserPosts]);
  
  // Fetch user events
  const { fetchUserEvents, formatEventDate } = useEventStore();
  
  useEffect(() => {
    // Load user's events when events tab is selected
    const loadEvents = async () => {
      if (authUser && activeTab === "events") {
        setLoadingEvents(true);
        try {
          const eventsData = await fetchUserEvents(userId || authUser._id);
          setUserEvents(eventsData);
        } catch (error) {
          console.error("Error loading events:", error);
        } finally {
          setLoadingEvents(false);
        }
      }
    };
    loadEvents();
  }, [authUser, userId, fetchUserEvents, activeTab]);

  // Fetch user profile based on userId param
  useEffect(() => {
    const fetchUserProfile = async () => {
      // Check if viewing own profile
      if (!userId || (authUser && userId === authUser._id?.toString())) {
        if (authUser) {
          setProfileUser(authUser);
          setIsFollowing(false);
          setProfileError(null);
        }
        return;
      }
      
      console.log(`Fetching profile for user ID: ${userId}`);
      
      setIsLoadingProfile(true);
      setProfileError(null);        try {
          const response = await axiosInstance.get(`/profile/${userId}`);
          console.log("Profile data received:", response.data);
        
        if (!response.data || !response.data._id) {
          console.error("Invalid profile data received:", response.data);
          setProfileError("Could not load user profile data correctly");
          return;
        }
        
        setProfileUser(response.data);
        console.log(`Successfully loaded profile for: ${response.data.fullName} (${response.data._id})`);
        
        // Check if the logged-in user follows this profile
        if (authUser) {
          // Instead of checking followers, we should check if the current user has the profile user in their following array
          const followingArray = authUser.following || [];
          const isFollowingUser = followingArray.some(following => {
            const followingId = typeof following === 'object' ? following._id : following;
            return followingId?.toString() === response.data._id?.toString();
          });
          
          console.log(`Is current user following this profile? ${isFollowingUser} (based on authUser's following list)`);
          setIsFollowing(isFollowingUser);
        }
        
        // Load the user's posts
        setLoadingPosts(true);
        try {
          const postsResponse = await axiosInstance.get(`/posts/user/${userId}`);
          setPosts(postsResponse.data);
        } catch (error) {
          console.error("Error fetching user posts:", error);
        } finally {
          setLoadingPosts(false);
        }
        
      } catch (error) {
        console.error("Error fetching user profile:", error);
        if (error.response?.status === 404) {
          setProfileError("This user profile doesn't exist.");
        } else if (error.response?.status === 400) {
          setProfileError("Invalid user ID format.");
        } else {
          setProfileError("Failed to load user profile. Please try again later.");
        }
        setProfileUser(null);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    
    if (authUser) {
      fetchUserProfile();
    }
  }, [userId, authUser]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (limit to 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert("File size too large. Please choose an image smaller than 10MB.");
      return;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert("Please select a valid image file (JPEG, PNG, or WebP).");
      return;
    }

    try {
      // Compress the image before upload
      const compressedImage = await compressImage(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.8
      });
      
      setSelectedImg(compressedImage);
      await updateProfile({ profilePic: compressedImage });
    } catch (error) {
      console.error('Error compressing image:', error);
      
      // Fallback to original image if compression fails (for smaller images)
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Image = reader.result;
        setSelectedImg(base64Image);
        await updateProfile({ profilePic: base64Image });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddInterest = () => {
    if (interestInput.trim() && !interests.includes(interestInput.trim())) {
      setInterests([...interests, interestInput.trim()]);
      setInterestInput("");
    }
  };

  const handleRemoveInterest = (interest) => {
    setInterests(interests.filter(item => item !== interest));
  };

  const handleSaveProfile = async () => {
    await updateProfile({
      bio,
      location,
      interests
    });
    setEditMode(false);
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const results = await searchUsers(searchQuery.trim());
      setSearchResults(results);
    }
  };

  const handleFollowUser = async (userIdToFollow) => {
    console.log(`Attempting to follow user: ${userIdToFollow}`);
    const success = await followUser(userIdToFollow);
    
    if (success) {
      console.log(`Successfully followed user: ${userIdToFollow}`);
      
      // Update following state if viewing the user's profile
      if (!isOwnProfile && profileUser && (profileUser._id === userIdToFollow)) {
        console.log("Updating current profile's following status to true");
        setIsFollowing(true);
        
        // Refresh current profile data to get updated followers count
        try {
          const response = await axiosInstance.get(`/profile/${userIdToFollow}`);
          if (response.data && response.data._id) {
            setProfileUser(response.data);
            console.log("Profile data refreshed after follow");
          }
        } catch (error) {
          console.error("Error refreshing profile after follow:", error);
        }
      }
      
      // Also refresh the auth user data to get the updated following list
      try {
        const userRes = await axiosInstance.get("/profile/me");
        if (userRes.data) {
          // Update the store's authUser
          useAuthStore.getState().setUser(userRes.data);
        }
      } catch (error) {
        console.error("Error refreshing auth user data:", error);
      }
      
      // Refresh search results if search was performed
      if (searchQuery) {
        handleSearch();
      }
      
      // Refresh connections
      const followersData = await getFollowers();
      const followingData = await getFollowing();
      setFollowers(followersData);
      setFollowing(followingData);
    }
  };

  const handleUnfollowUser = async (userIdToUnfollow) => {
    console.log(`Attempting to unfollow user: ${userIdToUnfollow}`);
    const success = await unfollowUser(userIdToUnfollow);
    
    if (success) {
      console.log(`Successfully unfollowed user: ${userIdToUnfollow}`);
      
      // Update following state if viewing the user's profile
      if (!isOwnProfile && profileUser && (profileUser._id === userIdToUnfollow)) {
        console.log("Updating current profile's following status to false");
        setIsFollowing(false);
        
        // Refresh current profile data to get updated followers count
        try {
          const response = await axiosInstance.get(`/profile/${userIdToUnfollow}`);
          if (response.data && response.data._id) {
            setProfileUser(response.data);
            console.log("Profile data refreshed after unfollow");
          }
        } catch (error) {
          console.error("Error refreshing profile after unfollow:", error);
        }
      }
      
      // Also refresh the auth user data to get the updated following list
      try {
        const userRes = await axiosInstance.get("/profile/me");
        if (userRes.data) {
          // Update the store's authUser
          useAuthStore.getState().setUser(userRes.data);
        }
      } catch (error) {
        console.error("Error refreshing auth user data:", error);
      }
      
      // Refresh search results if search was performed
      if (searchQuery) {
        handleSearch();
      }
      
      // Refresh connections
      const followersData = await getFollowers();
      const followingData = await getFollowing();
      setFollowers(followersData);
      setFollowing(followingData);
    }
  };

  const handlePostSubmit = async (postData) => {
    try {
      const newPost = await createPost(postData);
      setPosts([newPost, ...posts]);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  // Handle starting a chat with this user
  const handleStartChat = () => {
    setSelectedUser(profileUser);
    navigate('/chat');
  };

  // Check if the profile being viewed is the user's own profile
  // MongoDB IDs need to be compared as strings
  const isOwnProfile = !userId || (authUser && userId === authUser._id?.toString());
  console.log(`Is own profile? ${isOwnProfile}. userId: ${userId}, authUser._id: ${authUser?._id}`);
  
  // Determine which user object to display (own user or the profile being viewed)
  const displayUser = isOwnProfile ? authUser : (profileUser || {});
  
  // Show loading state while fetching another user's profile
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen pt-20 pb-10 flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary mb-4"></div>
          <p className="text-base-content/70">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show error state if profile not found
  if (profileError) {
    return (
      <div className="min-h-screen pt-20 pb-10 flex justify-center items-center">
        <div className="bg-base-300 rounded-xl p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">
            <span className="inline-block border-4 border-red-500 rounded-full w-16 h-16 flex items-center justify-center">!</span>
          </div>
          <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
          <p className="mb-6 text-base-content/70">{profileError}</p>
          <p className="mb-4 text-sm text-base-content/60">
            User ID: {userId}
            <br />
            This user profile could not be found. It may have been deleted or it may not exist.
          </p>
          <div className="flex justify-center gap-4">
            <button onClick={() => navigate(-1)} className="btn btn-outline">
              Go Back
            </button>
            <button onClick={() => navigate('/following')} className="btn btn-primary">
              Find Users
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="max-w-3xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">
              {isOwnProfile ? 'My Profile' : `${displayUser?.fullName}'s Profile`}
            </h1>
            <p className="mt-2">
              {isOwnProfile ? 'Your profile information' : `View ${displayUser?.fullName}'s profile`}
            </p>
            
            {/* Add Follow/Unfollow and Chat buttons for other users' profiles */}
            {!isOwnProfile && displayUser && (
              <div className="mt-4 flex justify-center gap-3">
                {isFollowing ? (
                  <button 
                    onClick={() => handleUnfollowUser(displayUser._id)}
                    className="btn btn-outline btn-sm"
                  >
                    <UserMinus className="w-4 h-4 mr-1" /> Unfollow
                  </button>
                ) : (
                  <button 
                    onClick={() => handleFollowUser(displayUser._id)}
                    className="btn btn-primary btn-sm"
                  >
                    <UserPlus className="w-4 h-4 mr-1" /> Follow
                  </button>
                )}
                <button 
                  onClick={handleStartChat}
                  className="btn btn-outline btn-sm"
                >
                  <MessageSquare className="w-4 h-4 mr-1" /> Message
                </button>
              </div>
            )}
          </div>

          {/* avatar upload section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || displayUser?.profilePic || "/avatar.png"}
                alt={`${displayUser?.fullName}'s profile`}
                className="size-32 rounded-full object-cover border-4"
              />
              {isOwnProfile && (
                <label
                  htmlFor="avatar-upload"
                  className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            )}
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>
          
          {/* Profile Tabs */}
          <div className="tabs tabs-boxed">
            <button 
              className={`tab ${activeTab === "profile" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              Profile Info
            </button>
            <button 
              className={`tab ${activeTab === "posts" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("posts")}
            >
              {isOwnProfile ? "My Posts" : "Posts"}
            </button>
            <button 
              className={`tab ${activeTab === "events" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("events")}
            >
              {isOwnProfile ? "My Events" : "Events"}
            </button>
            {isOwnProfile && (
              <button 
                className={`tab ${activeTab === "connections" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("connections")}
              >
                Connections
              </button>
            )}
          </div>
          
          {/* Profile Info Tab Content */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">Personal Information</h2>
                {isOwnProfile && (
                  <button 
                    onClick={() => setEditMode(!editMode)}
                    className="btn btn-sm btn-outline flex items-center gap-2"
                  >
                    {editMode ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                    {editMode ? "Save" : "Edit"}
                  </button>
                )}
              </div>
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </div>
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{displayUser?.fullName}</p>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </div>
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{displayUser?.email}</p>
              </div>
              
              {/* Bio */}
              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400">Bio</div>
                {isOwnProfile && editMode ? (
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-4 py-2.5 bg-base-200 rounded-lg border"
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                ) : (
                  <p className="px-4 py-2.5 bg-base-200 rounded-lg border min-h-16">
                    {displayUser?.bio || "No bio added yet"}
                  </p>
                )}
              </div>
              
              {/* Location */}
              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </div>
                {isOwnProfile && editMode ? (
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2.5 bg-base-200 rounded-lg border"
                    placeholder="Where are you located?"
                  />
                ) : (
                  <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                    {displayUser?.location || "No location added"}
                  </p>
                )}
              </div>
              
              {/* Interests */}
              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400">Interests</div>
                {isOwnProfile && editMode ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={interestInput}
                        onChange={(e) => setInterestInput(e.target.value)}
                        className="flex-1 px-4 py-2 bg-base-200 rounded-lg border"
                        placeholder="Add an interest"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                      />
                      <button 
                        onClick={handleAddInterest}
                        className="btn btn-primary"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {interests.map((interest, index) => (
                        <div key={index} className="badge badge-secondary gap-2">
                          {interest}
                          <button onClick={() => handleRemoveInterest(interest)}>×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-2.5 bg-base-200 rounded-lg border min-h-12">
                    <div className="flex flex-wrap gap-2">
                      {displayUser?.interests?.length > 0 ? (
                        displayUser.interests.map((interest, index) => (
                          <div key={index} className="badge badge-secondary">{interest}</div>
                        ))
                      ) : (
                        <p className="text-zinc-500">No interests added</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {editMode && (
                <div className="flex justify-end">
                  <button 
                    onClick={handleSaveProfile}
                    className="btn btn-primary"
                    disabled={isUpdatingProfile}
                  >
                    {isUpdatingProfile ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              )}
              
              {/* Eco Points Summary */}
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">Eco Points</h2>
                  <div className="flex gap-2">
                    <Link to="/badges" className="btn btn-primary btn-sm">
                      <ShoppingBag className="w-4 h-4 mr-1" /> Badge Shop
                    </Link>
                    <Link to="/leaderboard" className="btn btn-ghost btn-sm">
                      View Leaderboard
                    </Link>
                  </div>
                </div>
                <PointsSummary userId={displayUser?._id} />
              </div>
              
              {/* User Badges */}
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">My Badges</h2>
                  <Link to="/badges" className="btn btn-ghost btn-sm">
                    View All
                  </Link>
                </div>
                <div className="bg-base-200 p-4 rounded-lg">
                  <UserBadges userId={displayUser?._id} editable={isOwnProfile} />
                </div>
              </div>
            </div>
          )}

          {/* My Posts Tab Content */}
          {activeTab === "posts" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">
                  {isOwnProfile ? "My Posts" : `${displayUser?.fullName}'s Posts`}
                </h2>
                {isOwnProfile && (
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <PlusCircle className="w-5 h-5" />
                    Create Post
                  </button>
                )}
              </div>
              {loadingPosts ? (
                <p>Loading posts...</p>
              ) : posts.length === 0 ? (
                <p>No posts yet. Create your first post!</p>
              ) : (
                <div className="space-y-4">
                  {posts.map(post => (
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
          )}

          {/* Connections Tab Content */}
          {activeTab === "connections" && (
            <div>
              <div className="mt-6 bg-base-300 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium">Connections</h2>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => {setShowFollowers(true); setShowFollowing(false);}}
                      className={`btn btn-sm ${showFollowers ? 'btn-primary' : 'btn-outline'}`}
                    >
                      <Users className="w-4 h-4" />
                      Followers {followers.length > 0 && `(${followers.length})`}
                    </button>
                    <button 
                      onClick={() => {setShowFollowing(true); setShowFollowers(false);}}
                      className={`btn btn-sm ${showFollowing ? 'btn-primary' : 'btn-outline'}`}
                    >
                      <UserPlus className="w-4 h-4" />
                      Following {following.length > 0 && `(${following.length})`}
                    </button>
                  </div>
                </div>

                {/* Search Users */}
                <div className="mb-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="input input-bordered w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button onClick={handleSearch} className="btn btn-primary">
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="mt-4 bg-base-200 rounded-lg p-2 divide-y divide-base-300">
                      <h3 className="px-3 py-2 text-sm font-medium">Search Results</h3>
                      {searchResults.map(user => (
                        <div key={user._id} className="flex items-center justify-between px-3 py-2">
                          <div 
                            className="flex items-center gap-3 cursor-pointer hover:bg-base-300 p-2 rounded-lg flex-1"
                            onClick={() => navigate(`/profile/${user._id}`)}
                          >
                            <img 
                              src={user.profilePic || "/avatar.png"} 
                              alt={user.fullName}
                              className="w-10 h-10 rounded-full object-cover" 
                            />
                            <div>
                              <p className="font-medium">{user.fullName}</p>
                              {user.location && <p className="text-xs text-zinc-400">{user.location}</p>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/profile/${user._id}`);
                              }}
                              className="btn btn-ghost btn-xs"
                            >
                              View Profile
                            </button>
                            
                            {user._id !== authUser?._id && (
                              // Check if the current user is following this user
                              authUser?.following?.some(following => {
                                const followingId = typeof following === 'object' ? following._id : following;
                                return followingId === user._id;
                              }) ? (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnfollowUser(user._id);
                                  }}
                                  className="btn btn-outline btn-xs"
                                >
                                  Unfollow
                                </button>
                              ) : (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleFollowUser(user._id);
                                  }}
                                  className="btn btn-primary btn-xs"
                                >
                                  Follow
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Followers List */}
                {showFollowers && (
                  <div className="bg-base-200 rounded-lg p-2 divide-y divide-base-300">
                    <h3 className="px-3 py-2 text-sm font-medium">Followers</h3>
                    {followers.length === 0 ? (
                      <p className="px-3 py-4 text-center text-zinc-500">You don't have any followers yet</p>
                    ) : (
                      followers.map(user => (
                        <div key={user._id} className="flex items-center justify-between px-3 py-2">
                          <div 
                            className="flex items-center gap-3 cursor-pointer hover:bg-base-300 p-2 rounded-lg flex-1"
                            onClick={() => navigate(`/profile/${user._id}`)}
                          >
                            <img 
                              src={user.profilePic || "/avatar.png"} 
                            />
                            <div>
                              <p className="font-medium">{user.fullName}</p>
                              {user.bio && <p className="text-xs text-zinc-400 line-clamp-1">{user.bio}</p>}
                            </div>
                          </div>
                          {authUser?.following?.includes(user._id) ? (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnfollowUser(user._id);
                              }}
                              className="btn btn-outline btn-xs"
                            >
                              Unfollow
                            </button>
                          ) : (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFollowUser(user._id);
                              }}
                              className="btn btn-primary btn-xs"
                            >
                              Follow
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
                
                {/* Following List */}
                {showFollowing && (
                  <div className="bg-base-200 rounded-lg p-2 divide-y divide-base-300">
                    <h3 className="px-3 py-2 text-sm font-medium">Following</h3>
                    {following.length === 0 ? (
                      <p className="px-3 py-4 text-center text-zinc-500">You're not following anyone yet</p>
                    ) : (
                      following.map(user => (
                        <div key={user._id} className="flex items-center justify-between px-3 py-2">
                          <div 
                            className="flex items-center gap-3 cursor-pointer hover:bg-base-300 p-2 rounded-lg flex-1"
                            onClick={() => navigate(`/profile/${user._id}`)}
                          >
                            <img 
                              src={user.profilePic || "/avatar.png"} 
                              alt={user.fullName}
                              className="w-10 h-10 rounded-full object-cover" 
                            />
                            <div>
                              <p className="font-medium">{user.fullName}</p>
                              {user.bio && <p className="text-xs text-zinc-400 line-clamp-1">{user.bio}</p>}
                            </div>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnfollowUser(user._id);
                            }}
                            className="btn btn-outline btn-xs"
                          >
                            Unfollow
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Events Tab Content */}
          {activeTab === "events" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-primary" />
                  {isOwnProfile ? "My Eco Events" : `${displayUser?.fullName}'s Events`}
                </h2>
                <button 
                  onClick={() => navigate('/events')}
                  className="btn btn-primary btn-sm"
                >
                  Find Events
                </button>
              </div>
              
              {loadingEvents ? (
                <div className="flex flex-col items-center justify-center min-h-[200px]">
                  <div className="loading loading-spinner loading-md text-primary"></div>
                  <p className="mt-4 text-base-content/70">Loading events...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Events I'm Organizing */}
                  <div>
                    <h3 className="text-md font-medium mb-3">
                      {isOwnProfile 
                        ? `Events I'm Organizing (${userEvents.organized?.length || 0})` 
                        : `Events ${displayUser?.fullName} is Organizing (${userEvents.organized?.length || 0})`}
                    </h3>
                    
                    {userEvents.organized?.length === 0 ? (
                      <div className="bg-base-200 rounded-lg p-6 text-center">
                        <CalendarDays className="w-12 h-12 mb-2 mx-auto text-primary/50" />
                        <p className="mb-4">You're not organizing any events yet.</p>
                        <button 
                          onClick={() => navigate('/events')}
                          className="btn btn-primary btn-sm"
                        >
                          <PlusCircle className="w-4 h-4" /> Create an Event
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userEvents.organized.map(event => {
                          const eventDate = formatEventDate(event.date);
                          return (
                            <div key={event._id} className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow">
                              <div className="card-body p-4">
                                <div className="flex justify-between items-start">
                                  <h3 className="card-title text-base line-clamp-1">{event.title}</h3>
                                  <span className={`badge ${
                                    event.status === 'upcoming' ? 'badge-info' : 
                                    event.status === 'ongoing' ? 'badge-success' : 
                                    event.status === 'completed' ? 'badge-primary' : 
                                    'badge-error'
                                  }`}>
                                    {event.status}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-2 text-sm">
                                  <CalendarDays className="w-4 h-4" />
                                  <span>{eventDate.fromNow}</span>
                                </div>
                                
                                <div className="flex items-center gap-2 text-sm">
                                  <Users className="w-4 h-4" />
                                  <span>{event.participants?.length || 0} participants</span>
                                </div>
                                
                                <div className="card-actions justify-end mt-2">
                                  <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => navigate(`/events/${event._id}`)}
                                  >
                                    Manage
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  {/* Events I'm Participating In */}
                  <div>
                    <h3 className="text-md font-medium mb-3">
                      {isOwnProfile 
                        ? `Events I'm Participating In (${userEvents.participating?.length || 0})` 
                        : `Events ${displayUser?.fullName} is Participating In (${userEvents.participating?.length || 0})`}
                    </h3>
                    
                    {userEvents.participating?.length === 0 ? (
                      <div className="bg-base-200 rounded-lg p-6 text-center">
                        <Users className="w-12 h-12 mb-2 mx-auto text-primary/50" />
                        <p className="mb-4">You're not participating in any events yet.</p>
                        <button 
                          onClick={() => navigate('/events')}
                          className="btn btn-primary btn-sm"
                        >
                          Find Events to Join
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userEvents.participating.map(event => {
                          const eventDate = formatEventDate(event.date);
                          return (
                            <div key={event._id} className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow">
                              <div className="card-body p-4">
                                <div className="flex justify-between items-start">
                                  <h3 className="card-title text-base line-clamp-1">{event.title}</h3>
                                  <span className={`badge ${
                                    event.status === 'upcoming' ? 'badge-info' : 
                                    event.status === 'ongoing' ? 'badge-success' : 
                                    event.status === 'completed' ? 'badge-primary' : 
                                    'badge-error'
                                  }`}>
                                    {event.status}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-2 text-sm">
                                  <CalendarDays className="w-4 h-4" />
                                  <span>{eventDate.fromNow}</span>
                                </div>
                                
                                <p className="text-sm line-clamp-2 mt-1">{event.description}</p>
                                
                                <div className="card-actions justify-end mt-2">
                                  <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => navigate(`/events/${event._id}`)}
                                  >
                                    View
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  {/* View All Events Button */}
                  <div className="flex justify-center mt-6">
                    <button 
                      onClick={() => navigate('/profile/events')}
                      className="btn btn-outline"
                    >
                      View All My Events <ArrowRight className="ml-2 w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{displayUser?.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
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

export default ProfilePage;
