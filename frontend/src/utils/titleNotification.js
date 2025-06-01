// Document title notifications
let originalTitle = document.title;
let titleInterval = null;

export const startTitleNotification = (message) => {
  if (titleInterval) return; // Already showing notification
  
  originalTitle = document.title;
  titleInterval = setInterval(() => {
    document.title = document.title === originalTitle 
      ? `${message} • ${originalTitle}`
      : originalTitle;
  }, 1000);
};

export const stopTitleNotification = () => {
  if (titleInterval) {
    clearInterval(titleInterval);
    document.title = originalTitle;
    titleInterval = null;
  }
};
