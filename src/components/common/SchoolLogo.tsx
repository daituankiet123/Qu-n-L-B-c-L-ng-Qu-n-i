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
      <img
        src="/school-logo.svg"
        alt="Logo Trường Cao Đẳng Hậu cần 2"
        className="w-full h-full object-contain"
        onError={(e) => {
          // Fallback if image load fails
          const target = e.currentTarget;
          target.style.display = 'none';
        }}
      />
    </div>
  );
};
