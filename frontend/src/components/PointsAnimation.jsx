import { useState, useEffect } from 'react';

const PointsAnimation = ({ points, trigger }) => {
  const [show, setShow] = useState(false);
  const [animatePoints, setAnimatePoints] = useState(0);
  
  useEffect(() => {
    // Only trigger the animation when points change and we have a trigger
    if (points && trigger) {
      setAnimatePoints(points);
      setShow(true);
      
      // Hide animation after 3 seconds
      const timer = setTimeout(() => {
        setShow(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [points, trigger]);
  
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
      <div className="animate-bounce-up-then-fade-out text-4xl font-bold text-primary flex items-center">
        <span className="text-5xl">+</span>{animatePoints} points!
      </div>
    </div>
  );
};

export default PointsAnimation;
