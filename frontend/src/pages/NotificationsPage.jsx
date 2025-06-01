import { useEffect } from "react";
import { useNotificationStore } from "../store/useNotificationStore";
import NotificationItem from "../components/NotificationItem";
import { Bell, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

const NotificationsPage = () => {
  const { 
    notifications, 
    fetchNotifications, 
    markAllAsRead, 
    isLoading,
    unreadCount
  } = useNotificationStore();
  
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
  
  const handleRefresh = () => {
    fetchNotifications();
  };
  
  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };
  
  return (
    <div className="bg-base-200 min-h-screen pt-20 pb-10">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="w-7 h-7" />
            Notifications
            {unreadCount > 0 && (
              <span className="badge badge-primary badge-sm">{unreadCount} new</span>
            )}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="btn btn-sm"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="btn btn-sm btn-primary"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>
        
        <div className="bg-base-100 rounded-xl shadow-sm">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin">
                <RefreshCw className="w-8 h-8 opacity-30" />
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-16 h-16 mx-auto opacity-20 mb-4" />
              <h3 className="text-xl font-bold mb-2">No notifications</h3>
              <p className="text-base-content/70 mb-6">When you get notifications, they'll show up here</p>
              <Link to="/" className="btn btn-primary">
                Back to Home
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-base-200">
              {notifications.map((notification) => (
                <NotificationItem key={notification._id} notification={notification} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
