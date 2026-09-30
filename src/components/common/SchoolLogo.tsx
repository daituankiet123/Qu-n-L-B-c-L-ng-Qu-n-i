import React from 'react';

interface SchoolLogoProps {
  className?: string;
  size?: number;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  className = '',
  size = 48,
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden shadow-md ${className}`}
      title="Trường Cao Đẳng Hậu cần 2 - Tổng cục Hậu cần - Kỹ thuật"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 500 500"
        width="100%"
        height="100%"
        className="w-full h-full object-contain"
      >
        <defs>
          <path id="top-arc-logo" d="M 65 250 A 185 185 0 1 1 435 250" fill="none" />
          <path id="bottom-arc-logo" d="M 70 250 A 180 180 0 0 0 430 250" fill="none" />
          <linearGradient id="gold-grad-logo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE066" />
            <stop offset="50%" stopColor="#FFCC00" />
            <stop offset="100%" stopColor="#E69500" />
          </linearGradient>
          <linearGradient id="blue-sky-logo" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>
        </defs>

        {/* Outer Ring */}
        <circle cx="250" cy="250" r="240" fill="#DA251D" stroke="#FFE066" strokeWidth="8" />
        <circle cx="250" cy="250" r="232" fill="none" stroke="#FFE066" strokeWidth="2" />

        {/* Inner Blue Circle */}
        <circle cx="250" cy="250" r="172" fill="url(#blue-sky-logo)" stroke="#FFE066" strokeWidth="5" />

        {/* Top Text */}
        <text fill="#FFE066" fontFamily="'Times New Roman', Arial, sans-serif" fontWeight="900" fontSize="26" letterSpacing="2.5">
          <textPath href="#top-arc-logo" startOffset="50%" textAnchor="middle">
            TỔNG CỤC HẬU CẦN - KỸ THUẬT
          </textPath>
        </text>

        {/* Bottom Text */}
        <text fill="#FFE066" fontFamily="'Times New Roman', Arial, sans-serif" fontWeight="900" fontSize="24" letterSpacing="2">
          <textPath href="#bottom-arc-logo" startOffset="50%" textAnchor="middle">
            TRƯỜNG CAO ĐẲNG HẬU CẦN 2
          </textPath>
        </text>

        {/* Left Golden Sheaf */}
        <g transform="translate(48, 200) rotate(-15)">
          <path d="M 5 0 Q 2 25 10 50 Q 5 75 15 100" stroke="#FFE066" strokeWidth="3" fill="none"/>
          <ellipse cx="2" cy="15" rx="5" ry="9" fill="#FFE066" transform="rotate(-30 2 15)"/>
          <ellipse cx="14" cy="25" rx="5" ry="9" fill="#FFCC00" transform="rotate(30 14 25)"/>
          <ellipse cx="5" cy="40" rx="5" ry="9" fill="#FFE066" transform="rotate(-30 5 40)"/>
          <ellipse cx="16" cy="50" rx="5" ry="9" fill="#FFCC00" transform="rotate(30 16 50)"/>
          <ellipse cx="7" cy="65" rx="5" ry="9" fill="#FFE066" transform="rotate(-30 7 65)"/>
          <ellipse cx="18" cy="75" rx="5" ry="9" fill="#FFCC00" transform="rotate(30 18 75)"/>
          <ellipse cx="10" cy="90" rx="5" ry="9" fill="#FFE066" transform="rotate(-30 10 90)"/>
        </g>

        {/* Right Golden Sheaf */}
        <g transform="translate(440, 200) scale(-1, 1) rotate(-15)">
          <path d="M 5 0 Q 2 25 10 50 Q 5 75 15 100" stroke="#FFE066" strokeWidth="3" fill="none"/>
          <ellipse cx="2" cy="15" rx="5" ry="9" fill="#FFE066" transform="rotate(-30 2 15)"/>
          <ellipse cx="14" cy="25" rx="5" ry="9" fill="#FFCC00" transform="rotate(30 14 25)"/>
          <ellipse cx="5" cy="40" rx="5" ry="9" fill="#FFE066" transform="rotate(-30 5 40)"/>
          <ellipse cx="16" cy="50" rx="5" ry="9" fill="#FFCC00" transform="rotate(30 16 50)"/>
          <ellipse cx="7" cy="65" rx="5" ry="9" fill="#FFE066" transform="rotate(-30 7 65)"/>
          <ellipse cx="18" cy="75" rx="5" ry="9" fill="#FFCC00" transform="rotate(30 18 75)"/>
          <ellipse cx="10" cy="90" rx="5" ry="9" fill="#FFE066" transform="rotate(-30 10 90)"/>
        </g>

        {/* Blue Cogwheel */}
        <g transform="translate(250, 360)">
          <circle cx="0" cy="0" r="54" fill="#1D4ED8" stroke="#0F172A" strokeWidth="3"/>
          <rect x="-10" y="-62" width="20" height="12" fill="#1D4ED8" stroke="#0F172A" strokeWidth="2"/>
          <rect x="-10" y="50" width="20" height="12" fill="#1D4ED8" stroke="#0F172A" strokeWidth="2"/>
          <rect x="-62" y="-10" width="12" height="20" fill="#1D4ED8" stroke="#0F172A" strokeWidth="2"/>
          <rect x="50" y="-10" width="12" height="20" fill="#1D4ED8" stroke="#0F172A" strokeWidth="2"/>
          <circle cx="0" cy="0" r="46" fill="#1E3A8A" stroke="#FFE066" strokeWidth="2"/>
          <text x="0" y="-6" fill="#FFE066" fontFamily="'Times New Roman', Arial, sans-serif" fontWeight="900" fontSize="18" textAnchor="middle">
            30-8
          </text>
          <text x="0" y="18" fill="#FFE066" fontFamily="'Times New Roman', Arial, sans-serif" fontWeight="900" fontSize="18" textAnchor="middle">
            1977
          </text>
        </g>

        {/* Open White Book */}
        <g transform="translate(250, 240)">
          <path d="M 0 60 Q -65 80 -125 40 L -110 -105 Q -55 -75 0 -95 Q 55 -75 110 -105 L 125 40 Q 65 80 0 60 Z" fill="#FFFFFF" stroke="#0284C7" strokeWidth="4" />
          <path d="M 0 -95 L 0 60" stroke="#0284C7" strokeWidth="3"/>
          <path d="M -115 -90 Q -60 -65 -5 -82" stroke="#CBD5E1" strokeWidth="2" fill="none"/>
          <path d="M 115 -90 Q 60 -65 5 -82" stroke="#CBD5E1" strokeWidth="2" fill="none"/>

          {/* Left Page Sword & Rice Sheaf */}
          <g transform="translate(-56, -20) scale(0.85)">
            <path d="M -25 -25 L 25 25" stroke="#EAB308" strokeWidth="7" strokeLinecap="round"/>
            <path d="M -28 -28 L -15 -35 L -10 -20 Z" fill="#CA8A04"/>
            <line x1="-12" y1="-30" x2="-30" y2="-12" stroke="#CA8A04" strokeWidth="6" strokeLinecap="round"/>
            <path d="M 22 -22 Q -10 -10 -20 20" stroke="#CA8A04" strokeWidth="5" fill="none" strokeLinecap="round"/>
            <circle cx="-16" cy="14" r="5" fill="#EAB308"/>
            <circle cx="-8" cy="6" r="4.5" fill="#FACC15"/>
            <circle cx="2" cy="-2" r="4" fill="#EAB308"/>
            <circle cx="12" cy="-10" r="3.5" fill="#FACC15"/>
          </g>

          {/* Right Page Science Orbit */}
          <g transform="translate(56, -20) scale(0.9)">
            <circle cx="0" cy="0" r="10" fill="#2563EB" stroke="#1D4ED8" strokeWidth="2"/>
            <ellipse cx="0" cy="0" rx="30" ry="11" fill="none" stroke="#DC2626" strokeWidth="3" transform="rotate(30)"/>
            <ellipse cx="0" cy="0" rx="30" ry="11" fill="none" stroke="#16A34A" strokeWidth="3" transform="rotate(-30)"/>
            <ellipse cx="0" cy="0" rx="30" ry="11" fill="none" stroke="#0284C7" strokeWidth="3" transform="rotate(90)"/>
            <circle cx="24" cy="14" r="4.5" fill="#EF4444"/>
            <circle cx="-24" cy="14" r="4.5" fill="#22C55E"/>
            <circle cx="0" cy="-28" r="4.5" fill="#38BDF8"/>
          </g>
        </g>
      </svg>
    </div>
  );
};
