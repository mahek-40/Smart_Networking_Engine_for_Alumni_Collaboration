import styles from './LoadingSkeleton.module.css';

const LoadingSkeleton = ({ width = '100%', height = '20px', borderRadius = '8px', className = '' }) => (
  <div
    className={`${styles.skeleton} ${className}`}
    style={{ width, height, borderRadius }}
    aria-hidden="true"
  />
);

export const CardSkeleton = () => (
  <div className={styles.card}>
    <div className={styles.header}>
      <LoadingSkeleton width="52px" height="52px" borderRadius="50%" />
      <div className={styles.headerText}>
        <LoadingSkeleton width="60%" height="16px" />
        <LoadingSkeleton width="40%" height="12px" />
      </div>
    </div>
    <LoadingSkeleton height="12px" />
    <LoadingSkeleton width="80%" height="12px" />
    <div className={styles.tags}>
      <LoadingSkeleton width="60px" height="24px" borderRadius="99px" />
      <LoadingSkeleton width="80px" height="24px" borderRadius="99px" />
      <LoadingSkeleton width="70px" height="24px" borderRadius="99px" />
    </div>
    <LoadingSkeleton height="38px" borderRadius="10px" />
  </div>
);

export default LoadingSkeleton;
