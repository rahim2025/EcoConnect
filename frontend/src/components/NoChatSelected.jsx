import { MessageSquare } from "lucide-react";

const NoChatSelected = ({ isDrawer }) => {
  return (
    <div className={`w-full flex flex-1 flex-col items-center justify-center ${isDrawer ? 'p-4' : 'p-16'} bg-base-100/50`}>
      <div className="max-w-md text-center space-y-3">
        {/* Icon Display */}
        <div className="flex justify-center gap-4 mb-2">
          <div className="relative">
            <div
              className={`${isDrawer ? 'w-12 h-12' : 'w-16 h-16'} rounded-2xl bg-primary/10 flex items-center
             justify-center animate-bounce`}
            >
              <MessageSquare className={`${isDrawer ? 'w-6 h-6' : 'w-8 h-8'} text-primary`} />
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className={`${isDrawer ? 'text-xl' : 'text-2xl'} font-bold`}>Welcome to Chatty!</h2>
        <p className="text-base-content/60 text-sm">
          Select a conversation to start chatting
        </p>
      </div>
    </div>
  );
};

export default NoChatSelected;
