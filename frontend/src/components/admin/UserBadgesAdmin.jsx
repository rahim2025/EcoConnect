import React, { useState, useEffect } from 'react';
import { Award } from 'lucide-react';
import { axiosInstance } from '../../lib/axios';

const UserBadgesAdmin = ({ userId }) => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (userId) {
      fetchUserBadges();
    }
  }, [userId]);
  
  const fetchUserBadges = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/badges/user/${userId}`);
      setBadges(response.data);
    } catch (error) {
      console.error('Error fetching user badges:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (badges.length === 0) {
    return (
      <div className="text-sm text-center py-2 text-base-content/60">
        No badges yet
      </div>
    );
  }
  
  return (
    <div className="flex flex-wrap gap-1">
      {badges.map((userBadge) => (
        <div 
          key={userBadge._id}
          className="tooltip tooltip-top"
          data-tip={`${userBadge.badge.name}: ${userBadge.badge.description}`}
        >
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center
            ${userBadge.badge.category === 'beginner' ? 'bg-green-100' :
              userBadge.badge.category === 'intermediate' ? 'bg-blue-100' :
              userBadge.badge.category === 'advanced' ? 'bg-purple-100' :
              userBadge.badge.category === 'expert' ? 'bg-amber-100' :
              userBadge.badge.category === 'special' ? 'bg-rose-100' : 'bg-base-300'}
          `}>
            <Award className={`
              w-5 h-5
              ${userBadge.badge.category === 'beginner' ? 'text-green-700' :
                userBadge.badge.category === 'intermediate' ? 'text-blue-700' :
                userBadge.badge.category === 'advanced' ? 'text-purple-700' :
                userBadge.badge.category === 'expert' ? 'text-amber-700' :
                userBadge.badge.category === 'special' ? 'text-rose-700' : 'text-base-content'}
            `} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserBadgesAdmin;
