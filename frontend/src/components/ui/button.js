import React from "react";

export const Button = ({
  children,
  onClick,
  type = "button",
  className = "",
  size = "md",
}) => {
  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`rounded-lg font-medium transition duration-200 ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};
