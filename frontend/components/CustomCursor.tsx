'use client';

import { useState, useEffect } from 'react';
import { useMousePosition } from '@/hooks/useMousePosition';

export default function CustomCursor() {
  const { x, y } = useMousePosition();
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(pointer: coarse)').matches);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    const isHoverable = (element: EventTarget | null): boolean => {
      if (!element || !(element instanceof Element)) {
        return false;
      }

      const el = element as HTMLElement;
      
      // Check if element itself is hoverable
      if (
        el.tagName === 'BUTTON' ||
        el.tagName === 'A' ||
        el.hasAttribute('data-hoverable')
      ) {
        return true;
      }

      // Check if parent elements are hoverable (using closest only if available)
      if (typeof el.closest === 'function') {
        return !!(
          el.closest('button') ||
          el.closest('a') ||
          el.closest('[data-hoverable]')
        );
      }

      return false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      setIsHovering(isHoverable(e.target));
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', checkMobile);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  if (isMobile) return null;

  return (
    <>
      {/* Outer cursor */}
      <div
        className={`fixed top-0 left-0 w-6 h-6 rounded-full border-2 border-blue-500/50 pointer-events-none z-50 transition-all duration-300 ease-out ${
          isHovering ? 'scale-150 opacity-50' : 'scale-100 opacity-100'
        }`}
        style={{
          transform: `translate(${x - 12}px, ${y - 12}px)`,
        }}
      />
      {/* Inner cursor */}
      <div
        className={`fixed top-0 left-0 w-2 h-2 rounded-full bg-blue-500 pointer-events-none z-50 transition-all duration-200 ease-out ${
          isHovering ? 'scale-200' : 'scale-100'
        }`}
        style={{
          transform: `translate(${x - 4}px, ${y - 4}px)`,
        }}
      />
    </>
  );
}

