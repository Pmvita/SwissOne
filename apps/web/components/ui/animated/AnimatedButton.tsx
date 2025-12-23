"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
}

export function AnimatedButton({
  children,
  variant = "primary",
  size = "md",
  className,
  disabled = false,
  ...props
}: AnimatedButtonProps) {
  const baseStyles = "font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-primary-700 text-white hover:bg-primary-800 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed",
    secondary: "bg-accent-600 text-white hover:bg-accent-700 focus:ring-accent-500 disabled:bg-gray-400 disabled:cursor-not-allowed",
    outline: "border-2 border-primary-700 text-primary-700 hover:bg-primary-50 focus:ring-primary-500 disabled:border-gray-400 disabled:text-gray-400 disabled:cursor-not-allowed",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <motion.button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      disabled={disabled}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

