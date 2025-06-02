import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { LogOut, MessageSquare, User, CalendarDays, Award } from "lucide-react";
import NotificationBell from "./NotificationBell";
import { useEffect, useState } from "react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Check for unread messages when component mounts and when socket receives new messages
  useEffect(() => {
    if (!authUser) return;
    
    const checkUnreadMessages = async () => {
      const count = await useChatStore.getState().getUnreadMessagesCount();
      setUnreadCount(count);
    };
    
    checkUnreadMessages();
    
    // Set up interval to periodically check for new messages
    const intervalId = setInterval(checkUnreadMessages, 30000); // Check every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [authUser]);
  

  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">EcoConnect</h1>
            </Link>
            
            {authUser && (
              <>
                <Link to="/events" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <CalendarDays className="w-5 h-5" />
                  <span>Eco Events</span>
                </Link>
                <div className="dropdown dropdown-hover">
                  <div tabIndex={0} role="button" className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>Marketplace</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 border border-base-300">
                    <li><Link to="/marketplace" className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 1v6M16 1v6" />
                      </svg>
                      Browse Items
                    </Link></li>
                    <li><Link to="/marketplace/my-items" className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      My Items
                    </Link></li>
                    <li><Link to="/marketplace/favorites" className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      Favorites
                    </Link></li>
                  </ul>
                </div>
                <Link to="/leaderboard" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Award className="w-5 h-5" />
                  <span>Leaderboard</span>
                </Link>
                <Link to="/chat" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <span className="relative">
                    <MessageSquare className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </span>
                  <span>Chat</span>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {authUser && authUser.isAdmin && (
              <Link
                to="/admin"
                className="btn btn-sm btn-primary gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}

            {authUser && (
              <>
                {/* Notification Bell */}
                <NotificationBell />
                
                <Link to={"/profile"} className={`btn btn-sm gap-2`}>
                  <User className="size-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                <button className="flex gap-2 items-center" onClick={logout}>
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
