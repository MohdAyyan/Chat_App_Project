'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  delay?: number;
}

export default function FeatureCard({ icon, title, description, delay = 0 }: FeatureCardProps) {
  const { targetRef, hasIntersected } = useIntersectionObserver({ triggerOnce: true });

  return (
    <motion.div
      ref={targetRef as React.RefObject<HTMLDivElement>}
      initial={{ opacity: 0, y: 50 }}
      animate={hasIntersected ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay }}
      className="group relative"
    >
      <div
        className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-8 h-full transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
        data-hoverable
      >
        <div className="mb-6 text-4xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-white/70 leading-relaxed">{description}</p>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 transition-all duration-300 pointer-events-none" />
      </div>
    </motion.div>
  );
}

