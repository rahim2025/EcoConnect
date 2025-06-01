import { diagnoseUser, getUserStats } from '../utils/userDiagnostic.js';

// Get user system statistics for administrators
export const getUserDiagnostics = async (req, res) => {
  try {
    // Only admins should be able to access this endpoint
    if (!req.user.isAdmin) {
      return res.status(403).json({ 
        error: "Access denied. Admin privileges required."
      });
    }
    
    const stats = await getUserStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error("Error in getUserDiagnostics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Check a specific user by ID
export const checkSpecificUser = async (req, res) => {
  try {
    // Only admins should be able to access this endpoint
    if (!req.user.isAdmin) {
      return res.status(403).json({ 
        error: "Access denied. Admin privileges required."
      });
    }
    
    const { userId } = req.params;
    const result = await diagnoseUser(userId);
    
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in checkSpecificUser:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
