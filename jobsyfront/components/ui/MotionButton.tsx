'use client';

import { motion, HTMLMotionProps } from 'framer-motion';

interface MotionButtonProps extends Omit<HTMLMotionProps<'button'>, 'onDrag'> {
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

export function MotionButton({ children, variant = 'primary', ...props }: MotionButtonProps) {
  const baseClasses = "px-6 py-3 rounded-lg font-semibold transition-all cursor-pointer";
  const variants = {
    primary: "bg-[#F0E68C] text-[#000080] ",
    secondary: "bg-[#000080] border text-[#F0E68C]"
  };
  
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseClasses} ${variants[variant]}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}