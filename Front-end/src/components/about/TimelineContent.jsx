// src/components/about/TimelineContent.jsx
import React from 'react';
import { motion, useInView } from 'framer-motion';

export const TimelineContent = ({ as = 'div', animationNum, timelineRef, customVariants, className, children, ...props }) => {
  // If 'as' is a string like 'div' or 'a', use motion[as]. Otherwise use motion(as) for custom components.
  const Component = typeof as === 'string' ? (motion[as] || motion.div) : motion(as);
  const isInView = useInView(timelineRef || { current: null }, { once: true, margin: "-50px" });

  return (
    <Component
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      custom={animationNum}
      variants={customVariants}
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
};
