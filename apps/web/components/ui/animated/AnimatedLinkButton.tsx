"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedLinkButtonProps {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AnimatedLinkButton({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
}: AnimatedLinkButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-primary-700 text-white hover:bg-primary-800 focus:ring-primary-500",
    secondary: "bg-white text-primary-900 hover:bg-gray-50 focus:ring-white",
    outline: "border-2 border-primary-700 text-primary-700 hover:bg-primary-50 focus:ring-primary-500 bg-transparent",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        href={href}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
      >
        {children}
      </Link>
    </motion.div>
  );
}

