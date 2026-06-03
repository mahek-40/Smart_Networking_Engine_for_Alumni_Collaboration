import React from 'react';
import { motion } from 'framer-motion';
import styles from './CompatibilityRing.module.css';

const CompatibilityRing = ({ score = 0, size = 80, strokeWidth = 7, label = 'Match', showLabel = true }) => {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s) => {
    if (s >= 90) return '#0077B5';
    if (s >= 75) return '#005A8B';
    if (s >= 60) return '#0091DA';
    return '#94A3B8';
  };

  const color = getColor(score);

  return (
    <div className={styles.wrapper} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={styles.svg}>
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E8F4FD"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {showLabel && (
        <div className={styles.content}>
          <motion.span
            className={styles.score}
            style={{ color }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5, type: 'spring' }}
          >
            {score}%
          </motion.span>
          <span className={styles.label}>{label}</span>
        </div>
      )}
    </div>
  );
};

export default CompatibilityRing;
