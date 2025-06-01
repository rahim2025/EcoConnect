/**
 * User diagnostic utilities for checking database connections and user records
 */

import mongoose from 'mongoose';
import User from '../models/user.model.js';

/**
 * Check if a user exists in the database
 * @param {string} userId - The user ID to look up
 * @returns {Promise<Object>} Diagnostic information about the user lookup
 */
async function diagnoseUser(userId) {
  const result = {
    isValidId: false,
    userExists: false,
    user: null,
    totalUsers: 0,
    sampleUser: null,
    error: null
  };

  try {
    // Check if this is a valid ObjectId format
    result.isValidId = mongoose.Types.ObjectId.isValid(userId);
    
    if (!result.isValidId) {
      result.error = 'Invalid user ID format';
      return result;
    }

    // Try to find the user
    const user = await User.findById(userId).select('_id fullName email profilePic');
    
    if (user) {
      result.userExists = true;
      result.user = user;
    } else {
      // Let's check if there are any users in the database
      result.totalUsers = await User.countDocuments();
      
      // If there are users, let's get a sample one
      if (result.totalUsers > 0) {
        result.sampleUser = await User.findOne().select('_id fullName email');
      }
    }
    
    return result;
  } catch (error) {
    result.error = error.message;
    return result;
  }
}

/**
 * Get basic stats about users in the system
 * @returns {Promise<Object>} User statistics
 */
async function getUserStats() {
  try {
    const totalUsers = await User.countDocuments();
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('_id fullName email createdAt');
      
    const stats = {
      totalUsers,
      recentUsers,
      adminCount: await User.countDocuments({ isAdmin: true })
    };
    
    return stats;
  } catch (error) {
    return { error: error.message };
  }
}

export {
  diagnoseUser,
  getUserStats
};
