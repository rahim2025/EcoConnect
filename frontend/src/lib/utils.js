export function formatMessageTime(date) {
  const messageDate = new Date(date);
  const now = new Date();
  const diffMs = now - messageDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  // Today: show time only
  if (diffDays === 0) {
    return messageDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
  // Yesterday: show "Yesterday"
  else if (diffDays === 1) {
    return "Yesterday";
  }
  // This week: show day name
  else if (diffDays < 7) {
    return messageDate.toLocaleDateString("en-US", { weekday: "short" });
  }
  // Older: show date
  else {
    return messageDate.toLocaleDateString("en-US", { 
      month: "short",
      day: "numeric"
    });
  }
}
