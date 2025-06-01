import { useState, useEffect } from 'react';
import { useBadgeStore } from '../store/useBadgeStore';
import { useAuthStore } from '../store/useAuthStore';
import { Award, ShoppingCart, Check, X, Info, AlertTriangle } from 'lucide-react';

const BadgeShop = () => {
  const { authUser } = useAuthStore();
  const { 
    availableBadges, 
    userBadges, 
    loading, 
    getAvailableBadges, 
    getUserBadges, 
    purchaseBadge 
  } = useBadgeStore();
  
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  useEffect(() => {
    getAvailableBadges();
    getUserBadges();
  }, [getAvailableBadges, getUserBadges]);
  
  const handlePurchase = async () => {
    if (!selectedBadge) return;
    
    try {
      await purchaseBadge(selectedBadge._id);
      setShowConfirmModal(false);
      setSelectedBadge(null);
    } catch (error) {
      console.error("Failed to purchase badge:", error);
    }
  };
  
  // Check if user already owns a badge
  const isOwned = (badgeId) => {
    return userBadges.some(userBadge => userBadge.badge._id === badgeId);
  };
  
  // Check if user has enough points for a badge
  const canAfford = (cost) => {
    return authUser?.ecoPoints >= cost;
  };
  
  // Badge categories
  const categories = ['beginner', 'intermediate', 'advanced', 'expert', 'special'];
  
  // Badge styles by category
  const getBadgeStyle = (category) => {
    const styles = {
      beginner: 'bg-green-100 text-green-700 border-green-300',
      intermediate: 'bg-blue-100 text-blue-700 border-blue-300',
      advanced: 'bg-purple-100 text-purple-700 border-purple-300',
      expert: 'bg-amber-100 text-amber-700 border-amber-300',
      special: 'bg-rose-100 text-rose-700 border-rose-300'
    };
    return styles[category] || 'bg-base-200 text-base-content border-base-300';
  };
  
  // Group badges by category
  const badgesByCategory = categories.reduce((acc, category) => {
    acc[category] = availableBadges.filter(badge => badge.category === category);
    return acc;
  }, {});
  
  if (loading && availableBadges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="loading loading-spinner loading-lg text-primary"></div>
        <p className="mt-4">Loading badges shop...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Shop Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Award className="w-6 h-6 text-primary" />
          Badge Shop
        </h2>
        <div className="flex items-center gap-2 bg-base-200 px-4 py-2 rounded-lg">
          <Award className="w-5 h-5 text-primary" />
          <span className="font-semibold">{authUser?.ecoPoints || 0}</span>
          <span className="text-sm text-base-content/70">points</span>
        </div>
      </div>
      
      {/* Badges by Category */}
      {categories.map(category => {
        const badges = badgesByCategory[category] || [];
        if (badges.length === 0) return null;
        
        return (
          <div key={category} className="space-y-3">
            <h3 className="text-lg font-semibold capitalize">{category} Badges</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {badges.map(badge => {
                const owned = isOwned(badge._id);
                const affordable = canAfford(badge.cost);
                
                return (
                  <div 
                    key={badge._id}
                    className={`
                      badge-card bg-base-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md
                      transition-shadow border
                      ${owned ? 'border-success/20' : !affordable ? 'border-error/20' : 'border-base-300'}
                    `}
                  >
                    <div className={`p-4 flex items-center justify-center ${getBadgeStyle(badge.category)}`}>
                      <div className="size-16 rounded-full bg-white/80 flex items-center justify-center">
                        <Award className="size-10" />
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{badge.name}</h4>
                        <span className="flex items-center gap-1 text-sm font-medium">
                          <Award className="w-4 h-4 text-primary" />
                          {badge.cost}
                        </span>
                      </div>
                      
                      <p className="text-sm text-base-content/70 min-h-[40px]">{badge.description}</p>
                      
                      <button
                        className={`
                          btn btn-sm w-full mt-2
                          ${owned 
                            ? 'btn-success cursor-default' 
                            : !affordable 
                              ? 'btn-error cursor-not-allowed opacity-70' 
                              : 'btn-primary'}
                        `}
                        onClick={() => {
                          if (!owned && affordable) {
                            setSelectedBadge(badge);
                            setShowConfirmModal(true);
                          }
                        }}
                        disabled={owned || !affordable}
                      >
                        {owned ? (
                          <><Check className="w-4 h-4" /> Owned</>
                        ) : !affordable ? (
                          <>Not Enough Points</>
                        ) : (
                          <><ShoppingCart className="w-4 h-4" /> Purchase</>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      
      {/* Purchase Confirmation Modal */}
      {showConfirmModal && selectedBadge && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-lg shadow-xl max-w-md w-full overflow-hidden">
            <div className={`p-6 flex items-center justify-center ${getBadgeStyle(selectedBadge.category)}`}>
              <div className="size-24 rounded-full bg-white/80 flex items-center justify-center">
                <Award className="size-16" />
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-bold">Purchase Badge</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Badge Name:</span>
                  <span>{selectedBadge.name}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Cost:</span>
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4 text-primary" />
                    <span>{selectedBadge.cost} points</span>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Your Points:</span>
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4 text-primary" />
                    <span>{authUser?.ecoPoints || 0} points</span>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Remaining After Purchase:</span>
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4 text-primary" />
                    <span>{(authUser?.ecoPoints || 0) - selectedBadge.cost} points</span>
                  </div>
                </div>
              </div>
              
              <div className="alert alert-info text-sm">
                <Info className="size-4" />
                <span>Badge will be added to your collection and can be displayed on your profile.</span>
              </div>
              
              <div className="flex gap-2 justify-end">
                <button 
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowConfirmModal(false);
                    setSelectedBadge(null);
                  }}
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handlePurchase}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <><ShoppingCart className="w-4 h-4" /> Confirm Purchase</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeShop;
