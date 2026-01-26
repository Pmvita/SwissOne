"use client";

import { ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface ScaleInProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  scale?: number;
}

export function ScaleIn({
  children,
  delay = 0,
  duration = 0.3,
  scale = 0.9,
  ...props
}: ScaleInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

