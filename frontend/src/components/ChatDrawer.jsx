import { useState, useEffect } from "react";
import { MessageSquare, X, ChevronDown, ChevronUp } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import ChatContainer from "./ChatContainer";
import Sidebar from "./Sidebar";
import NoChatSelected from "./NoChatSelected";

const ChatDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const { selectedUser, getUsers } = useChatStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [newMessageAlert, setNewMessageAlert] = useState(false);

  // Check for unread messages when component mounts
  useEffect(() => {
    const checkUnreadMessages = async () => {
      const count = await useChatStore.getState().getUnreadMessagesCount();
      
      // If we get new messages while drawer is closed, show animation
      if (count > unreadCount && !isOpen) {
        setNewMessageAlert(true);
        setTimeout(() => setNewMessageAlert(false), 2000);
      }
      
      setUnreadCount(count);
    };
    
    checkUnreadMessages();
    
    // Set up interval to periodically check for new messages
    const intervalId = setInterval(checkUnreadMessages, 15000); // Check every 15 seconds
    
    return () => clearInterval(intervalId);
  }, [isOpen, unreadCount]);

  // Load users when drawer opens
  useEffect(() => {
    if (isOpen) {
      getUsers();
    }
  }, [isOpen, getUsers]);
  
  const toggleDrawer = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Reset minimized state when opening
      setMinimized(false);
    }
  };
  
  const toggleMinimize = () => {
    setMinimized(!minimized);
  };

  return (
    <>
      {/* Chat Button - Fixed in bottom right */}
      <button
        onClick={toggleDrawer}
        className={`fixed bottom-6 right-6 bg-primary text-white rounded-full p-3 shadow-lg 
                   hover:bg-primary-focus z-40 transition-all duration-300
                   ${isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"}
                   ${newMessageAlert ? "animate-bounce" : ""}`}
        aria-label="Open Chat"
      >
        <MessageSquare className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs 
                         rounded-full min-w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Chat Drawer */}
      <div 
        className={`fixed bottom-0 right-6 bg-base-100 rounded-t-xl shadow-2xl flex flex-col 
                   transition-all duration-300 ease-in-out z-50 border border-base-300 
                   ${isOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"} 
                   ${minimized ? "h-14" : "h-[500px]"} w-[350px] md:w-[400px]`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-3 border-b border-base-300">
          <h3 className="font-medium flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <span>Messages</span>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {unreadCount}
              </span>
            )}
          </h3>
          <div className="flex items-center gap-1">
            <button 
              onClick={toggleMinimize} 
              className="p-1 hover:bg-base-200 rounded-md"
              aria-label={minimized ? "Expand" : "Minimize"}
            >
              {minimized ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            <button 
              onClick={toggleDrawer} 
              className="p-1 hover:bg-base-200 rounded-md"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Drawer Content - Only shown when not minimized */}
        {!minimized && (
          <div className="flex h-[calc(100%-48px)]">
            {/* User list sidebar */}
            <div className="w-1/3 border-r border-base-300 h-full overflow-y-auto">
              <Sidebar isDrawer={true} />
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col h-full">
              {selectedUser ? (
                <ChatContainer isDrawer={true} />
              ) : (
                <NoChatSelected isDrawer={true} />
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatDrawer;
