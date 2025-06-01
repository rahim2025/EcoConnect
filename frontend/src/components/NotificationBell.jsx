import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationStore } from '../store/useNotificationStore';
import NotificationItem from './NotificationItem';
import { Link } from 'react-router-dom';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { notifications, unreadCount, fetchNotifications, markAllAsRead } = useNotificationStore();
  
  // Fetch notifications when component mounts
  useEffect(() => {
    fetchNotifications();
    
    // Fetch notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="btn btn-sm relative"
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-error text-white flex items-center justify-center text-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-[28rem] overflow-y-auto bg-base-100 rounded-lg shadow-lg z-50 p-2 border border-base-300">
          <div className="flex items-center justify-between p-2 border-b border-base-200 mb-2">
            <h3 className="font-bold">Notifications</h3>
            {notifications.length > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs text-primary hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-base-content/60">
              <Bell className="w-10 h-10 mx-auto opacity-30 mb-3" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <NotificationItem 
                  key={notification._id} 
                  notification={notification} 
                />
              ))}
            </div>
          )}
          
          <div className="p-2 border-t border-base-200 mt-2">
            <Link 
              to="/notifications" 
              className="text-xs text-primary hover:underline block text-center"
              onClick={() => setIsOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
