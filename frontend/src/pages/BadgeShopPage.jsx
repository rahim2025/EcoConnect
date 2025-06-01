import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Award, ShoppingBag, User, Database } from 'lucide-react';
import BadgeShop from '../components/BadgeShop';
import { useBadgeStore } from '../store/useBadgeStore';
import { useAuthStore } from '../store/useAuthStore';
import { seedBadges } from '../lib/seedBadges';

const BadgeShopPage = () => {
  const { authUser } = useAuthStore();
  const { userBadges, getUserBadges } = useBadgeStore();
  const [activeTab, setActiveTab] = useState('shop'); // 'shop' or 'collection'
  
  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="max-w-5xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <Link 
              to="/profile"
              className="btn btn-ghost btn-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
          </div>
          
          <div className="text-center pb-4">
            <h1 className="text-2xl font-semibold flex items-center justify-center gap-2">
              <ShoppingBag className="w-8 h-8 text-primary" /> Eco Badge Shop
            </h1>
            <p className="mt-2">Spend your eco points on badges to showcase your environmental contributions</p>
          </div>
          
          {/* Tabs Navigation */}
          <div className="tabs tabs-boxed flex justify-center">
            <button
              className={`tab ${activeTab === 'shop' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('shop')}
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Badge Shop
            </button>
            <button
              className={`tab ${activeTab === 'collection' ? 'tab-active' : ''}`}
              onClick={() => {
                setActiveTab('collection');
                getUserBadges();
              }}
            >
              <User className="w-4 h-4 mr-2" />
              My Collection
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'shop' ? (
              <BadgeShop />
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Award className="w-6 h-6 text-primary" />
                    My Badge Collection
                  </h2>
                  <div className="flex items-center gap-2 bg-base-200 px-4 py-2 rounded-lg">
                    <Award className="w-5 h-5 text-primary" />
                    <span className="font-semibold">{authUser?.ecoPoints || 0}</span>
                    <span className="text-sm text-base-content/70">points</span>
                  </div>
                </div>
                
                {userBadges.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 bg-base-200 rounded-lg">
                    <Award className="w-16 h-16 text-base-content/30 mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Badges Yet</h3>
                    <p className="text-base-content/70 text-center mb-6">
                      You haven't purchased any badges yet. Visit the Badge Shop to get started!
                    </p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setActiveTab('shop')}
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Go to Badge Shop
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {userBadges.map(userBadge => (
                      <div 
                        key={userBadge._id}
                        className="bg-base-100 rounded-lg overflow-hidden border border-base-300 shadow-sm"
                      >
                        <div className={`
                          p-4 flex items-center justify-center
                          ${userBadge.badge.category === 'beginner' ? 'bg-green-100' :
                            userBadge.badge.category === 'intermediate' ? 'bg-blue-100' :
                            userBadge.badge.category === 'advanced' ? 'bg-purple-100' :
                            userBadge.badge.category === 'expert' ? 'bg-amber-100' :
                            userBadge.badge.category === 'special' ? 'bg-rose-100' : 'bg-base-200'}
                        `}>
                          <div className="size-16 rounded-full bg-white/80 flex items-center justify-center">
                            <Award className={`
                              size-10
                              ${userBadge.badge.category === 'beginner' ? 'text-green-700' :
                                userBadge.badge.category === 'intermediate' ? 'text-blue-700' :
                                userBadge.badge.category === 'advanced' ? 'text-purple-700' :
                                userBadge.badge.category === 'expert' ? 'text-amber-700' :
                                userBadge.badge.category === 'special' ? 'text-rose-700' : 'text-base-content'}
                            `} />
                          </div>
                        </div>
                        
                        <div className="p-4 space-y-2">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">{userBadge.badge.name}</h4>
                            <span className="badge badge-sm capitalize">
                              {userBadge.badge.category}
                            </span>
                          </div>
                          
                          <p className="text-sm text-base-content/70">{userBadge.badge.description}</p>
                          
                          <div className="text-xs text-base-content/50">
                            Purchased: {new Date(userBadge.purchasedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>        </div>
      </div>
      
      {/* Hidden admin button for seeding badges (only visible in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 text-center opacity-30 hover:opacity-100 transition-opacity">
          <button
            className="btn btn-sm btn-ghost"
            onClick={async () => {
              await seedBadges();
              setTimeout(() => {
                window.location.reload();
              }, 1500);
            }}
          >
            <Database className="w-4 h-4" /> Admin: Seed Badges
          </button>
        </div>
      )}
    </div>
  );
};

export default BadgeShopPage;
