import React from 'react';
import { Award, Users, BarChart2, TrendingUp, AlertTriangle, Calendar, Gift } from 'lucide-react';

const AdminDashboardStats = ({ stats }) => {
  if (!stats) {
    return (
      <div className="p-6 text-center">
        <p>No statistics available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-primary" /> Dashboard Overview
        </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-base-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base-content/70 text-sm font-medium">Total Users</h3>                <p className="text-3xl font-bold mt-2">{stats.stats.totalUsers || 0}</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
          
          <div className="bg-base-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base-content/70 text-sm font-medium">Available Badges</h3>
                <p className="text-3xl font-bold mt-2">{stats.stats.totalBadges || 0}</p>
              </div>
              <div className="bg-secondary/10 p-3 rounded-lg">
                <Award className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </div>
          
          <div className="bg-base-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base-content/70 text-sm font-medium">Badges Purchased</h3>
                <p className="text-3xl font-bold mt-2">{stats.stats.totalUserBadges || 0}</p>
              </div>
              <div className="bg-success/10 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-yellow-50 rounded-xl p-6 shadow-sm border-l-4 border-yellow-400">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-yellow-800 text-sm font-medium">Reported Posts</h3>
                <p className="text-3xl font-bold mt-2 text-yellow-700">{stats.stats.reportedPostsCount || 0}</p>
                {stats.stats.pendingReportsCount > 0 && (
                  <span className="text-xs text-yellow-600 mt-1 block">
                    {stats.stats.pendingReportsCount} pending review
                  </span>
                )}
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-6 shadow-sm border-l-4 border-blue-400">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-blue-800 text-sm font-medium">Events</h3>
                <p className="text-3xl font-bold mt-2 text-blue-700">{stats.stats.totalEvents || 0}</p>
                {stats.stats.upcomingEvents > 0 && (
                  <span className="text-xs text-blue-600 mt-1 block">
                    {stats.stats.upcomingEvents} upcoming
                  </span>
                )}
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-xl p-6 shadow-sm border-l-4 border-purple-400">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-purple-800 text-sm font-medium">Rewards</h3>
                <p className="text-3xl font-bold mt-2 text-purple-700">{stats.stats.rewardsCount || 0}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Gift className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-base-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Top Users by Points
          </h3>
          
          <div className="divide-y divide-base-300">
            {stats.topUsers.map((user) => (
              <div key={user._id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <img 
                    src={user.profilePic || '/avatar.png'} 
                    alt={user.fullName} 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span>{user.fullName}</span>
                </div>
                <div className="badge badge-primary badge-lg gap-2">
                  <Award className="w-3.5 h-3.5" />
                  {user.ecoPoints} points
                </div>
              </div>
            ))}
            
            {stats.topUsers.length === 0 && (
              <div className="py-4 text-center text-base-content/70">
                No users found
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-base-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" /> 
            Most Popular Badges
          </h3>
          
          <div className="divide-y divide-base-300">
            {stats.popularBadges && stats.popularBadges.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${item.badge.category === 'beginner' ? 'bg-green-100' :
                      item.badge.category === 'intermediate' ? 'bg-blue-100' :
                      item.badge.category === 'advanced' ? 'bg-purple-100' :
                      item.badge.category === 'expert' ? 'bg-amber-100' :
                      item.badge.category === 'special' ? 'bg-rose-100' : 'bg-base-300'}
                  `}>
                    <Award className={`
                      w-6 h-6
                      ${item.badge.category === 'beginner' ? 'text-green-700' :
                        item.badge.category === 'intermediate' ? 'text-blue-700' :
                        item.badge.category === 'advanced' ? 'text-purple-700' :
                        item.badge.category === 'expert' ? 'text-amber-700' :
                        item.badge.category === 'special' ? 'text-rose-700' : 'text-base-content'}
                    `} />
                  </div>
                  <div>
                    <div className="font-medium">{item.badge.name}</div>
                    <div className="text-xs text-base-content/70">{item.badge.cost} points</div>
                  </div>
                </div>
                <div className="badge badge-ghost">
                  {item.count} users
                </div>
              </div>
            ))}
            
            {!stats.popularBadges || stats.popularBadges.length === 0 && (
              <div className="py-4 text-center text-base-content/70">
                No badge data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardStats;
