import React from 'react';

/**
 * প্রশ্নপত্র ও উত্তরপত্রের হেডারে বসানো প্রতিষ্ঠানের লোগো
 */
const PaperLogo = ({ url, className = '' }) => {
  if (!url) return null;
  return (
    <img
      src={url}
      alt="Institute Logo"
      className={`max-h-16 max-w-[80px] object-contain print:max-h-16 ${className}`}
    />
  );
};

export default PaperLogo;
