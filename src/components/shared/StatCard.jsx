import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import styles from './StatCard.module.css';

const StatCard = ({ title, value, icon, growth, growthLabel, color = '#0077B5', index = 0 }) => {
  const isPositive = growth >= 0;

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}
    >
      <div className={styles.header}>
        <div className={styles.iconWrapper} style={{ background: `${color}18`, color }}>
          {icon}
        </div>
        {growth !== undefined && (
          <div className={`${styles.growth} ${isPositive ? styles.positive : styles.negative}`}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{Math.abs(growth)}%</span>
          </div>
        )}
      </div>
      <div className={styles.body}>
        <motion.p
          className={styles.value}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: index * 0.1 + 0.2 }}
        >
          {value}
        </motion.p>
        <p className={styles.title}>{title}</p>
        {growthLabel && <p className={styles.growthLabel}>{growthLabel}</p>}
      </div>
    </motion.div>
  );
};

export default StatCard;
