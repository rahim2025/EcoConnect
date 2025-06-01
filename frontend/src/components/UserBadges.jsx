import { useState, useEffect } from 'react';
import { useBadgeStore } from '../store/useBadgeStore';
import { Sparkles, Medal, ShieldCheck } from 'lucide-react';

const UserBadges = ({ userId, editable = false }) => {
  const { userBadges, loading, getUserBadges, updateDisplayBadges } = useBadgeStore();
  const [selectedBadges, setSelectedBadges] = useState([]);
  const [showBadgePicker, setShowBadgePicker] = useState(false);

  useEffect(() => {
    getUserBadges(userId);
  }, [userId, getUserBadges]);
  
  useEffect(() => {
    // Initialize selected badges from user's display badges
    if (userBadges.length > 0) {
      const displayedBadges = userBadges.filter(badge => badge.isDisplayed);
      setSelectedBadges(displayedBadges.map(badge => badge._id));
    }
  }, [userBadges]);

  const handleSaveDisplayBadges = async () => {
    // Get the badge IDs from selected badges
    const badgeIds = selectedBadges.map(badgeId => {
      const userBadge = userBadges.find(ub => ub._id === badgeId);
      return userBadge.badge._id;
    });
    
    await updateDisplayBadges(badgeIds);
    setShowBadgePicker(false);
  };

  const toggleBadgeSelection = (badgeId) => {
    if (selectedBadges.includes(badgeId)) {
      setSelectedBadges(selectedBadges.filter(id => id !== badgeId));
    } else {
      // Limit to 3 badges
      if (selectedBadges.length < 3) {
        setSelectedBadges([...selectedBadges, badgeId]);
      } else {
        // Replace the first selected badge if already have 3
        setSelectedBadges([...selectedBadges.slice(1), badgeId]);
      }
    }
  };

  // Generate icon based on badge category
  const getBadgeIcon = (category) => {
    switch (category) {
      case 'beginner':
        return <Medal className="w-4 h-4" />;
      case 'intermediate':
        return <Medal className="w-4 h-4" />;
      case 'advanced':
        return <ShieldCheck className="w-4 h-4" />;
      case 'expert':
        return <ShieldCheck className="w-4 h-4" />;
      case 'special':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Medal className="w-4 h-4" />;
    }
  };

  // Render badge icon with tooltip
  const renderBadge = (userBadge) => {
    const { badge } = userBadge;
    const badgeStyle = {
      beginner: 'bg-green-100 text-green-700 border-green-200',
      intermediate: 'bg-blue-100 text-blue-700 border-blue-200',
      advanced: 'bg-purple-100 text-purple-700 border-purple-200',
      expert: 'bg-amber-100 text-amber-700 border-amber-200',
      special: 'bg-rose-100 text-rose-700 border-rose-200'
    };
    
    return (
      <div className="tooltip" data-tip={`${badge.name}: ${badge.description}`} key={userBadge._id}>
        <div 
          className={`
            size-10 rounded-full flex items-center justify-center border-2
            ${badgeStyle[badge.category] || 'bg-base-200 text-base-content border-base-300'}
          `}
        >
          {getBadgeIcon(badge.category)}
        </div>
      </div>
    );
  };

  if (loading && userBadges.length === 0) {
    return (
      <div className="flex justify-center p-2">
        <span className="loading loading-spinner loading-sm"></span>
      </div>
    );
  }

  // Show empty state if user has no badges
  if (userBadges.length === 0) {
    return (
      <div className="text-center p-2 text-sm text-gray-500">
        No badges yet
      </div>
    );
  }

  // Show displayed badges
  const displayedBadges = userBadges.filter(badge => badge.isDisplayed);
  
  return (
    <div className="space-y-2">
      {/* Badge display */}
      <div className="flex gap-2 justify-center">
        {displayedBadges.length > 0 ? (
          displayedBadges.map(badge => renderBadge(badge))
        ) : (
          <div className="text-sm text-base-content/60">No badges selected for display</div>
        )}
      </div>

      {/* Edit button (if editable) */}
      {editable && (
        <div className="flex justify-center mt-2">
          <button 
            className="btn btn-xs btn-outline" 
            onClick={() => setShowBadgePicker(!showBadgePicker)}
          >
            {showBadgePicker ? 'Cancel' : 'Change Display Badges'}
          </button>
        </div>
      )}

      {/* Badge picker modal */}
      {showBadgePicker && (
        <div className="mt-4 bg-base-200 rounded-lg p-4">
          <h3 className="font-medium mb-3 text-center">Select badges to display (max 3)</h3>
          
          <div className="grid grid-cols-3 gap-2 mb-4">
            {userBadges.map(userBadge => (
              <div 
                key={userBadge._id}
                className={`
                  flex flex-col items-center p-2 rounded-lg cursor-pointer
                  ${selectedBadges.includes(userBadge._id) 
                    ? 'bg-primary/20 border-2 border-primary'
                    : 'bg-base-300 hover:bg-base-100'}
                `}
                onClick={() => toggleBadgeSelection(userBadge._id)}
              >
                <div className="mb-2">
                  {renderBadge(userBadge)}
                </div>
                <span className="text-xs text-center line-clamp-1">{userBadge.badge.name}</span>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center">
            <button 
              className="btn btn-primary btn-sm"
              onClick={handleSaveDisplayBadges}
              disabled={loading}
            >
              {loading ? <span className="loading loading-spinner loading-xs"></span> : 'Save Selection'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBadges;
