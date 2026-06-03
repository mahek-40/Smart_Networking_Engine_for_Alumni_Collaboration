import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Zap } from 'lucide-react';
import styles from './NotFoundPage.module.css';

const NotFoundPage = () => (
  <div className={styles.page}>
    <motion.div
      className={styles.content}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className={styles.logoHeader}>
        <Link to="/" className={styles.logo}>
          <div className={styles.logoIcon}><Zap size={18} color="white" /></div>
          <span className={styles.logoText}>SNE Alumni</span>
        </Link>
      </div>
      <motion.div
        className={styles.errorCode}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        404
      </motion.div>
      <h1 className={styles.title}>Page Not Found</h1>
      <p className={styles.description}>
        The page you're looking for doesn't exist or has been moved.
        Let's get you back to building your network.
      </p>
      <div className={styles.actions}>
        <Link to="/dashboard" className={styles.primaryBtn}>
          <Home size={18} /> Go to Dashboard
        </Link>
        <button onClick={() => window.history.back()} className={styles.secondaryBtn}>
          <ArrowLeft size={18} /> Go Back
        </button>
      </div>
    </motion.div>
  </div>
);

export default NotFoundPage;
