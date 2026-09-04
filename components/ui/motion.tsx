"use client";

import React from "react";
import { motion, HTMLMotionProps, Variants } from "framer-motion";

interface FadeInProps extends HTMLMotionProps<"div"> {
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  duration?: number;
  distance?: number;
  viewportOnce?: boolean;
  children: React.ReactNode;
}

export const FadeIn = ({
  direction = "up",
  delay = 0,
  duration = 0.5,
  distance = 24,
  viewportOnce = true,
  children,
  className,
  ...props
}: FadeInProps) => {
  const getDirections = () => {
    switch (direction) {
      case "up":
        return { y: distance };
      case "down":
        return { y: -distance };
      case "left":
        return { x: distance };
      case "right":
        return { x: -distance };
      default:
        return {};
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...getDirections() }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: viewportOnce, margin: "-50px" }}
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98] as const,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

interface StaggerContainerProps extends HTMLMotionProps<"div"> {
  staggerDelay?: number;
  delayChildren?: number;
  viewportOnce?: boolean;
  children: React.ReactNode;
}

export const StaggerContainer = ({
  staggerDelay = 0.1,
  delayChildren = 0,
  viewportOnce = true,
  children,
  className,
  ...props
}: StaggerContainerProps) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: viewportOnce, margin: "-50px" }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({
  children,
  className,
  ...props
}: HTMLMotionProps<"div">) => {
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.21, 0.47, 0.32, 0.98] as const,
      },
    },
  };

  return (
    <motion.div variants={itemVariants} className={className} {...props}>
      {children}
    </motion.div>
  );
};

export const HoverScale = ({
  children,
  scale = 1.03,
  tapScale = 0.97,
  className,
  ...props
}: HTMLMotionProps<"div"> & { scale?: number; tapScale?: number }) => {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: tapScale }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};
