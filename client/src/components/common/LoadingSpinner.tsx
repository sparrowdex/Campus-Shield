import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white';
  text?: string;
  showTips?: boolean;
}

const tips = [
  "Did you know? You can report incidents completely anonymously to protect your privacy.",
  "For emergencies, always call 911 or campus security directly. CampusShield is for non-emergency reporting.",
  "You can attach photos, videos, or documents to your report for more detail.",
  "Check the 'My Reports' page to see status updates from administrators on your submissions.",
  "Use the secure chat feature to communicate directly with campus authorities about your report.",
  "Admins can view an Incident Heatmap to identify areas with frequent reports.",
  "Our AI helps categorize and prioritize reports to ensure a fast and appropriate response.",
  "You'll receive real-time notifications for updates on your reports and new chat messages.",
  "When reporting an incident, you can use your device's current location for accuracy.",
];

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'primary',
  text,
  showTips = false
}) => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const tipRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!showTips) return;

    const interval = setInterval(() => {
      setCurrentTipIndex((prevIndex) => (prevIndex + 1) % tips.length);
    }, 5000); // Change tip every 5 seconds

    return () => clearInterval(interval);
  }, [showTips]);

  useEffect(() => {
    if (showTips && tipRef.current) {
      // Animate out
      gsap.to(tipRef.current, {
        opacity: 0,
        y: -10,
        duration: 0.5,
        onComplete: () => {
          // Animate in
          gsap.to(tipRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.5,
          });
        },
      });
    }
  }, [currentTipIndex, showTips]);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-primary-600',
    white: 'text-white'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-current ${sizeClasses[size]} ${colorClasses[color]}`}></div>
      {text && (
        <p className="mt-4 text-sm text-gray-600">{text}</p>
      )}
      {showTips && (
        <div className="mt-6 text-center h-10">
          <p ref={tipRef} className="text-sm text-gray-500 italic">{tips[currentTipIndex]}</p>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner; 