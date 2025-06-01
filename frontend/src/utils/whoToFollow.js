/**
 * Who to follow algorithm utilities
 * 
 * This file implements logic to suggest users to follow based on:
 * 1. Mutual connections (users followed by people you follow)
 * 2. Similar interests
 * 3. User activity and engagement
 */

/**
 * Find users with mutual connections (users that are followed by people you follow)
 * @param {Object} currentUser - The current user object
 * @param {Array} allUsers - Array of all users
 * @param {Number} limit - Maximum number of suggestions to return
 * @returns {Array} - Array of suggested users
 */
export const findUsersWithMutualConnections = async (currentUser, allUsers, limit = 5) => {
  if (!currentUser?.following || currentUser.following.length === 0) {
    return [];
  }
  
  // Get a list of users that the current user follows
  const followingUsers = allUsers.filter(user => 
    currentUser.following.includes(user._id)
  );
  
  // Create a map to count mutual connections
  const mutualConnectionsCount = {};
  
  // Analyze who the users I follow are following
  for (const followedUser of followingUsers) {
    if (followedUser.following) {
      for (const potentialSuggestionId of followedUser.following) {
        // Don't suggest users the current user already follows
        if (!currentUser.following.includes(potentialSuggestionId) && 
            potentialSuggestionId !== currentUser._id) {
          if (!mutualConnectionsCount[potentialSuggestionId]) {
            mutualConnectionsCount[potentialSuggestionId] = 0;
          }
          mutualConnectionsCount[potentialSuggestionId]++;
        }
      }
    }
  }
  
  // Sort by number of mutual connections
  const sortedSuggestions = Object.keys(mutualConnectionsCount)
    .sort((a, b) => mutualConnectionsCount[b] - mutualConnectionsCount[a]);
  
  // Get user objects for the suggestions
  const suggestedUsers = sortedSuggestions
    .map(id => {
      const user = allUsers.find(u => u._id === id);
      if (user) {
        return {
          ...user,
          mutualConnections: mutualConnectionsCount[id]
        };
      }
      return null;
    })
    .filter(Boolean)
    .slice(0, limit);
  
  return suggestedUsers;
};

/**
 * Find users with similar interests to the current user
 * @param {Object} currentUser - The current user object
 * @param {Array} allUsers - Array of all users
 * @param {Number} limit - Maximum number of suggestions to return
 * @returns {Array} - Array of suggested users
 */
export const findUsersWithSimilarInterests = (currentUser, allUsers, limit = 5) => {
  if (!currentUser?.interests || currentUser.interests.length === 0) {
    return [];
  }
  
  // Score users based on matching interests
  const usersWithInterestScore = allUsers
    .filter(user => 
      user._id !== currentUser._id && 
      !currentUser.following?.includes(user._id) &&
      user.interests?.length > 0
    )
    .map(user => {
      // Count matching interests
      const matchingInterests = user.interests.filter(
        interest => currentUser.interests.includes(interest)
      );
      
      return {
        ...user,
        interestScore: matchingInterests.length,
        matchingInterests
      };
    })
    .filter(user => user.interestScore > 0)
    .sort((a, b) => b.interestScore - a.interestScore)
    .slice(0, limit);
    
  return usersWithInterestScore;
};

/**
 * Find active users based on post activity
 * @param {Object} currentUser - The current user object
 * @param {Array} allUsers - Array of all users
 * @param {Array} allPosts - Array of all posts
 * @param {Number} limit - Maximum number of suggestions to return
 * @returns {Array} - Array of suggested users
 */
export const findActiveUsers = (currentUser, allUsers, allPosts, limit = 5) => {
  // Count posts per user
  const userPostCounts = {};
  
  for (const post of allPosts) {
    if (post.user?._id) {
      if (!userPostCounts[post.user._id]) {
        userPostCounts[post.user._id] = 0;
      }
      userPostCounts[post.user._id]++;
    }
  }
  
  // Filter and sort users
  const activeUsers = allUsers
    .filter(user => 
      user._id !== currentUser._id && 
      !currentUser.following?.includes(user._id) &&
      userPostCounts[user._id] > 0
    )
    .map(user => ({
      ...user,
      postCount: userPostCounts[user._id] || 0
    }))
    .sort((a, b) => b.postCount - a.postCount)
    .slice(0, limit);
    
  return activeUsers;
};

/**
 * Combine different suggestion algorithms with weights
 * @param {Object} currentUser - The current user object
 * @param {Array} allUsers - Array of all users
 * @param {Array} allPosts - Array of all posts
 * @param {Number} limit - Maximum number of suggestions to return
 * @returns {Array} - Array of suggested users
 */
export const getWhoToFollowSuggestions = async (currentUser, allUsers, allPosts, limit = 5) => {
  // Don't suggest if not logged in
  if (!currentUser) return [];
  
  // Suggestions from mutual connections
  const mutualSuggestions = await findUsersWithMutualConnections(currentUser, allUsers, limit);
  
  // Suggestions from similar interests
  const interestSuggestions = findUsersWithSimilarInterests(currentUser, allUsers, limit);
  
  // Suggestions from active users
  const activeSuggestions = findActiveUsers(currentUser, allUsers, allPosts, limit);
  
  // Combine and deduplicate suggestions
  const allSuggestions = [
    ...mutualSuggestions,
    ...interestSuggestions,
    ...activeSuggestions
  ];
  
  // Deduplicate by user ID
  const uniqueSuggestions = [];
  const seenIds = new Set();
  
  for (const suggestion of allSuggestions) {
    if (!seenIds.has(suggestion._id)) {
      seenIds.add(suggestion._id);
      uniqueSuggestions.push(suggestion);
    }
  }
  
  // Return limited number of suggestions
  return uniqueSuggestions.slice(0, limit);
};
