import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotificationStore } from '../store/useNotificationStore';
import { formatDistanceToNow } from 'date-fns';
import { UserPlus, X } from 'lucide-react';

const NotificationItem = ({ notification }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { markAsRead, removeNotification } = useNotificationStore();
  
  const handleReadStatus = () => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
  };
  
  const handleRemove = (e) => {
    e.stopPropagation();
    e.preventDefault();
    removeNotification(notification._id);
  };
  
  const renderNotificationContent = () => {
    switch (notification.type) {
      case 'follow':
        return (
          <Link 
            to={`/profile/${notification.sender._id}`}
            className="flex items-center p-2 gap-3 rounded-lg hover:bg-base-200 transition-all"
            onClick={handleReadStatus}
          >
            <div className="bg-primary-content/30 rounded-full p-2.5 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <img 
                  src={notification.sender.profilePic || "/avatar.png"} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover" 
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    <span className="font-bold">{notification.sender.fullName}</span> started following you
                  </p>
                  <p className="text-xs text-base-content/60">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
            {isHovered && (
              <button 
                onClick={handleRemove} 
                className="p-1 rounded-full hover:bg-base-300"
                aria-label="Remove notification"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </Link>
        );
        
      case 'like':
        return (
          <Link 
            to={`/post/${notification.post._id}`}
            className="flex items-center p-2 gap-3 rounded-lg hover:bg-base-200 transition-all"
            onClick={handleReadStatus}
          >
            <div className="bg-red-100 rounded-full p-2.5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#ef4444" 
                stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <img 
                  src={notification.sender.profilePic || "/avatar.png"} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover" 
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    <span className="font-bold">{notification.sender.fullName}</span> liked your post
                  </p>
                  <p className="text-xs text-base-content/60">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
            {isHovered && (
              <button 
                onClick={handleRemove} 
                className="p-1 rounded-full hover:bg-base-300"
                aria-label="Remove notification"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </Link>
        );
        
      case 'comment':
        return (
          <Link 
            to={`/post/${notification.post._id}`}
            className="flex items-center p-2 gap-3 rounded-lg hover:bg-base-200 transition-all"
            onClick={handleReadStatus}
          >
            <div className="bg-blue-100 rounded-full p-2.5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
                stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <img 
                  src={notification.sender.profilePic || "/avatar.png"} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover" 
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    <span className="font-bold">{notification.sender.fullName}</span> commented on your post
                  </p>
                  <p className="text-xs italic">{notification.comment || ''}</p>
                  <p className="text-xs text-base-content/60">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
            {isHovered && (
              <button 
                onClick={handleRemove} 
                className="p-1 rounded-full hover:bg-base-300"
                aria-label="Remove notification"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </Link>
        );
        
      case 'event_invite':
        return (
          <Link 
            to={`/events/${notification.event?._id}`}
            className="flex items-center p-2 gap-3 rounded-lg hover:bg-base-200 transition-all"
            onClick={handleReadStatus}
          >
            <div className="bg-green-100 rounded-full p-2.5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
                stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <img 
                  src={notification.sender.profilePic || "/avatar.png"} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover" 
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    <span className="font-bold">{notification.sender.fullName}</span> {notification.content}
                  </p>
                  <p className="text-xs text-base-content/60">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
            {isHovered && (
              <button 
                onClick={handleRemove} 
                className="p-1 rounded-full hover:bg-base-300"
                aria-label="Remove notification"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </Link>        );
        
      case 'marketplace_offer':
        return (
          <Link 
            to={`/marketplace/items/${notification.marketplaceItem?._id}`}
            className="flex items-center p-2 gap-3 rounded-lg hover:bg-base-200 transition-all border-l-4 border-success"
            onClick={handleReadStatus}
          >
            <div className="bg-success/20 rounded-full p-2.5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                className="text-success">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6"></path>
                <path d="m21 12-6-3-6 3-6-3"></path>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <img 
                  src={notification.sender.profilePic || "/avatar.png"} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover" 
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    <span className="font-bold">{notification.sender.fullName}</span> made an offer on your listing
                  </p>
                  <p className="text-xs text-base-content/70">
                    {notification.marketplaceItem?.title}
                  </p>
                  <p className="text-xs text-base-content/60">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
            {isHovered && (
              <button 
                onClick={handleRemove} 
                className="p-1 rounded-full hover:bg-base-300"
                aria-label="Remove notification"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </Link>
        );
        
      case 'eco_points':
        return (
          <div 
            className="flex items-center p-2 gap-3 rounded-lg hover:bg-base-200 transition-all cursor-pointer border-l-4 border-success"
            onClick={handleReadStatus}
          >
            <div className="bg-success/20 rounded-full p-2.5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                className="text-success">
                <circle cx="12" cy="8" r="7"></circle>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                <span className="font-bold">Eco Points Earned!</span>
              </p>
              <p className="text-sm">
                {notification.message || notification.content}
              </p>
              <p className="text-xs text-base-content/60">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </p>
            </div>
            {isHovered && (
              <button 
                onClick={handleRemove} 
                className="p-1 rounded-full hover:bg-base-300"
                aria-label="Remove notification"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        );
        
      case 'badge_purchase':
        return (
          <Link 
            to="/badges"
            className="flex items-center p-2 gap-3 rounded-lg hover:bg-base-200 transition-all border-l-4 border-secondary"
            onClick={handleReadStatus}
          >
            <div className="bg-secondary/20 rounded-full p-2.5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                className="text-secondary">
                <circle cx="12" cy="8" r="7"></circle>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                <span className="font-bold">Badge Purchased!</span>
              </p>
              <p className="text-sm">
                {notification.content}
              </p>
              <p className="text-xs text-base-content/60">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </p>
            </div>
            {isHovered && (
              <button 
                onClick={handleRemove} 
                className="p-1 rounded-full hover:bg-base-300"
                aria-label="Remove notification"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </Link>
        );
        
      case 'admin-alert':
      case 'warning':
      case 'info':
      case 'critical':
        return (
          <div 
            className={`flex items-center p-2 gap-3 rounded-lg hover:bg-base-200 transition-all cursor-pointer
              ${notification.type === 'warning' ? 'border-l-4 border-warning' :
               notification.type === 'info' ? 'border-l-4 border-info' :
               notification.type === 'critical' ? 'border-l-4 border-error' : 'border-l-4 border-primary'}`}
            onClick={handleReadStatus}
          >
            <div className={`rounded-full p-2.5 flex items-center justify-center
              ${notification.type === 'warning' ? 'bg-warning/20' :
               notification.type === 'info' ? 'bg-info/20' :
               notification.type === 'critical' ? 'bg-error/20' : 'bg-primary/20'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                className={`
                  ${notification.type === 'warning' ? 'text-warning' :
                   notification.type === 'info' ? 'text-info' :
                   notification.type === 'critical' ? 'text-error' : 'text-primary'}`}
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                <span className="font-bold capitalize">
                  {notification.type === 'admin-alert' ? 'Admin Alert' : notification.type}
                </span>
              </p>
              <p className="text-sm">
                {notification.content || notification.message}
              </p>
              <p className="text-xs text-base-content/60">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </p>
            </div>
            {isHovered && (
              <button 
                onClick={handleRemove} 
                className="p-1 rounded-full hover:bg-base-300"
                aria-label="Remove notification"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        );
        
      // Default case for any other notification types
      default:
        return (
          <div 
            className="flex items-center p-2 gap-3 rounded-lg hover:bg-base-200 transition-all cursor-pointer"
            onClick={handleReadStatus}
          >
            <div className="bg-base-300 rounded-full p-2.5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18"></path><path d="M6 6L18 18"></path>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                <span className="font-bold">{notification.type}</span> notification
              </p>
              <p className="text-xs text-base-content/60">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </p>
            </div>
            {isHovered && (
              <button 
                onClick={handleRemove} 
                className="p-1 rounded-full hover:bg-base-300"
                aria-label="Remove notification"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        );
    }
  };
  
  return (
    <div 
      className={`relative ${notification.isRead ? 'opacity-70' : 'bg-base-200/50'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!notification.isRead && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary ml-1"></div>
      )}
      {renderNotificationContent()}
    </div>
  );
};

export default NotificationItem;
