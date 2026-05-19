import { useEffect, useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import './CustomCursor.css';

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // Track exact X and Y coordinates
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  useEffect(() => {
    const moveCursor = (e) => {
      // Offset by half the width/height (40px / 2 = 20px) so the cursor is perfectly centered
      cursorX.set(e.clientX - 20);
      cursorY.set(e.clientY - 20);
      if (!isVisible) setIsVisible(true);
    };
    
    const handleMouseOver = (e) => {
      // Check if hovering over clickable elements like links or buttons
      const target = e.target;
      if (
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') ||
        target.closest('button') ||
        target.classList.contains('clickable')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);
    document.body.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [cursorX, cursorY, isVisible]);

  return (
    <motion.div
      className={`premium-cursor ${isHovering ? 'hovering' : ''}`}
      style={{
        x: cursorX,
        y: cursorY,
        opacity: isVisible ? 1 : 0
      }}
    >
      <div className="cursor-dot" />
      <div className="cursor-ring" />
    </motion.div>
  );
}
