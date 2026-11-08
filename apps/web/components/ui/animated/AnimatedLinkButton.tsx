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
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brass";

  const variants = {
    primary: "bg-alpine text-snow hover:bg-primary-800 focus:ring-alpine",
    secondary: "bg-snow text-ink hover:bg-glacier focus:ring-line",
    outline:
      "border border-line text-ink hover:bg-glacier/60 focus:ring-brass bg-transparent",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
      <Link href={href} className={cn(baseStyles, variants[variant], sizes[size], className)}>
        {children}
      </Link>
    </motion.div>
  );
}
