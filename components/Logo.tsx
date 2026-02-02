
import React from 'react';

const Logo: React.FC<{ className?: string, color?: string }> = ({ className = "w-16 h-16", color = "#1C3E95" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="25" y="25" width="50" height="50" rx="12" fill={color} />
    <path d="M50 35V65" stroke="white" strokeWidth="6" strokeLinecap="round" />
    <path d="M35 50H65" stroke="white" strokeWidth="6" strokeLinecap="round" />
    <circle cx="80" cy="20" r="8" fill="#60A5FA" />
    <circle cx="20" cy="80" r="6" fill="#60A5FA" opacity="0.6" />
    <path d="M80 20L50 50L20 80" stroke="#60A5FA" strokeWidth="2" strokeDasharray="4 4" opacity="0.4" />
  </svg>
);

export default Logo;
