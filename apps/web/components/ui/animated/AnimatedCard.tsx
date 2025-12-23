"use client";

import { ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}

export function AnimatedCard({
  children,
  className,
  hover = true,
  delay = 0,
  ...props
}: AnimatedCardProps) {
  return (
    <motion.div
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={hover ? { y: -4, shadow: "lg" } : {}}
      {...props}
    >
      {children}
    </motion.div>
  );
}

