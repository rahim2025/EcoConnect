import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Leaf, UserPlus } from 'lucide-react';

const HomeSidebar = () => {
  const { authUser } = useAuthStore();
  
  return (
    <div className="space-y-6">
      {/* User Profile Summary */}
      <div className="bg-base-100 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-base-200">
          <div className="flex items-center gap-3">
            <img 
              src={authUser?.profilePic || "/avatar.png"}
              alt={authUser?.fullName} 
              className="w-12 h-12 rounded-full object-cover" 
            />
            <div>
              <h3 className="font-bold">{authUser?.fullName}</h3>
              <p className="text-xs text-gray-500">@{authUser?.email.split('@')[0]}</p>
            </div>
          </div>
        </div>
        
        {/* Eco Points */}
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
        
        {/* Following Stats */}
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
          <div className="mt-3">
            <Link 
              to="/following" 
              className="btn btn-outline btn-block btn-sm gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Find People to Follow
            </Link>
          </div>
        </div>
      </div>
      
      {/* Quick Links */}
      <div className="bg-base-100 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-base-200">
          <h3 className="font-bold">Quick Links</h3>
        </div>
        <div className="p-2">
          <Link to="/" className="block p-3 rounded-lg hover:bg-base-200">Home</Link>
          <Link to="/profile" className="block p-3 rounded-lg hover:bg-base-200">My Profile</Link>
          <Link to="/chat" className="block p-3 rounded-lg hover:bg-base-200">Messages</Link>
          <Link to="/following" className="block p-3 rounded-lg hover:bg-base-200">Manage Connections</Link>
        </div>
      </div>
    </div>
  );
};

export default HomeSidebar;