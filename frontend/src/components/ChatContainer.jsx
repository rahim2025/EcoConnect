import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = ({ isDrawer = false }) => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();

    // Mark messages as read when component mounts and whenever selectedUser changes
    if (selectedUser._id) {
      // Using a small delay to ensure the messages are loaded first
      const timer = setTimeout(() => {
        useChatStore.getState().markMessagesAsRead(selectedUser._id);
      }, 500);
      
      return () => clearTimeout(timer);
    }

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  // Auto-scroll to the newest message when messages update
  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader isDrawer={isDrawer} />
        <MessageSkeleton />
        <MessageInput isDrawer={isDrawer} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader isDrawer={isDrawer} />

      <div className={`flex-1 overflow-y-auto ${isDrawer ? "p-2" : "p-4"} space-y-4`}>
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
          >
            <div className="chat-image avatar">
              <div className={`${isDrawer ? "size-8" : "size-10"} rounded-full border`}>
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className={`chat-bubble flex flex-col ${isDrawer ? "text-sm" : ""}`}>
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className={`${isDrawer ? "max-w-[150px]" : "sm:max-w-[200px]"} rounded-md mb-2`}
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
        <div ref={messageEndRef}></div>
      </div>

      <MessageInput isDrawer={isDrawer} />
    </div>
  );
};

export default ChatContainer;
