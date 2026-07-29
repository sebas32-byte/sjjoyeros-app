import React from "react";
interface DiamondIconProps {
  className?: string;
}

export function DiamondIcon({ className }: DiamondIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="20,2 38,14 20,38 2,14" />
      <line x1="2" y1="14" x2="38" y2="14" />
      <line x1="10" y1="2" x2="14" y2="14" />
      <line x1="30" y1="2" x2="26" y2="14" />
      <line x1="10" y1="2" x2="30" y2="2" />
      <line x1="14" y1="14" x2="20" y2="38" />
      <line x1="26" y1="14" x2="20" y2="38" />
    </svg>
  );
}
