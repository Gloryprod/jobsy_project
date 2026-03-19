import React from 'react';
import { motion } from 'framer-motion';
import './styles.css';

interface Props {
  currentStep: number; // 0, 1, 2, etc.
  totalSteps: number;
}

const StepProgressBar = ({ currentStep, totalSteps }: Props) => {
  // Calcul du pourcentage de progression
  const progress = (currentStep / (totalSteps - 1)) * 100;

  return (
    <div className="progress-container">
      {/* Barre de fond grise */}
      <div className='progress-background-bar'>
        {/* Barre de progression animée */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className='progress-fill-bar'
        />
      </div>

      {/* Les points (Steps) */}
      <div className='steps-container'>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <motion.div
            key={index}
            animate={{
              backgroundColor: index <= currentStep ? "#f0bb31" : "#ddd",
              scale: index <= currentStep ? 1.2 : 1,
            }}
           className='step-circle'
          >
            {index + 1}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StepProgressBar;