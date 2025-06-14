import { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

/**
 * Component to toggle notification sounds on/off and save preference to localStorage
 */
const NotificationSoundToggle = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Load sound preference from localStorage on mount
  useEffect(() => {
    const soundPref = localStorage.getItem("notification-sound");
    // If preference exists, use it; otherwise default to enabled
    setSoundEnabled(soundPref !== "disabled");
  }, []);

  // Toggle sound preference and save to localStorage
  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem("notification-sound", newValue ? "enabled" : "disabled");
  };

  return (
    <button 
      onClick={toggleSound}
      className="btn btn-circle btn-sm btn-ghost"
      title={soundEnabled ? "Mute notification sounds" : "Enable notification sounds"}
    >
      {soundEnabled ? (
        <Volume2 size={18} className="text-primary" />
      ) : (
        <VolumeX size={18} className="text-gray-500" />
      )}
    </button>
  );
};

export default NotificationSoundToggle;
