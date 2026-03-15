"use client";

import React from "react";

interface UserAvatarProps {
  name: string;           // Full user name for initials fallback
  imageUrl?: string | null; // Optional avatar image URL
  size?: number;          // Avatar size in pixels
  className?: string;     // Additional CSS classes
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  imageUrl,
  size = 40,
  className = "",
}) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return imageUrl ? (
    <img
      src={imageUrl}
      alt={name}
      className={`rounded-full object-cover ${className}`}
      width={size}
      height={size}
    />
  ) : (
    <div
      className={`rounded-full text-white flex items-center justify-center font-medium ${className}`}
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
};
