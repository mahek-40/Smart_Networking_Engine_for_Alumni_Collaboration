import { motion } from 'framer-motion';
import Button from './Button';
import styles from './EmptyState.module.css';

const EmptyState = ({
  icon,
  title = 'Nothing here yet',
  description = 'Get started by taking an action.',
  actionLabel,
  onAction,
  className = ''
}) => (
  <motion.div
    className={`${styles.container} ${className}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    {icon && <div className={styles.icon}>{icon}</div>}
    <h3 className={styles.title}>{title}</h3>
    <p className={styles.description}>{description}</p>
    {actionLabel && onAction && (
      <Button variant="primary" onClick={onAction}>{actionLabel}</Button>
    )}
  </motion.div>
);

export default EmptyState;
