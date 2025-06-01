import { X, Wifi, RefreshCw } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useState } from "react";

const ChatHeader = ({ isDrawer }) => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers, connectSocket } = useAuthStore();
  const [reconnecting, setReconnecting] = useState(false);

  return (
    <div className={`${isDrawer ? 'p-2' : 'p-2.5'} border-b border-base-300`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className={`${isDrawer ? 'size-8' : 'size-10'} rounded-full relative`}>
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <div className="flex items-center gap-2 text-sm">
              <span className={`flex items-center gap-1 ${onlineUsers.includes(selectedUser._id) ? "text-green-500" : "text-gray-400"}`}>
                <Wifi className="w-3 h-3" />
                {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
              </span>
              
              {/* Refresh connection button */}
              {!onlineUsers.includes(selectedUser._id) && (
                <button 
                  onClick={() => {
                    setReconnecting(true);
                    // Request fresh online users list
                    connectSocket();
                    setTimeout(() => setReconnecting(false), 1500);
                  }}
                  className="text-xs flex items-center gap-1 text-primary hover:underline"
                  disabled={reconnecting}
                >
                  <RefreshCw className={`w-3 h-3 ${reconnecting ? "animate-spin" : ""}`} />
                  {reconnecting ? "Checking..." : "Refresh status"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Close button */}
        <button onClick={() => setSelectedUser(null)}>
          <X />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;