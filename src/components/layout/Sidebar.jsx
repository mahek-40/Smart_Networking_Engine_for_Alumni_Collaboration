import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, User, Sparkles, GraduationCap,
  Network, Search, BarChart2, Settings, Zap, X, Users, FolderKanban
} from 'lucide-react';
import styles from './Sidebar.module.css';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/profile', icon: User, label: 'My Profile' },
  { to: '/recommendations', icon: Sparkles, label: 'AI Recommendations' },
  { to: '/mentors', icon: GraduationCap, label: 'Mentor Matching' },
  { to: '/collaboration', icon: Network, label: 'Collaboration' },
  { to: '/network', icon: Users, label: 'My Network' },
  { to: '/my-projects', icon: FolderKanban, label: 'My Projects' },
  { to: '/search', icon: Search, label: 'Smart Search' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}
        aria-label="Main navigation"
        role="navigation"
      >
        {/* Mobile close */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close sidebar">
          <X size={18} />
        </button>

        {/* Logo area — links to landing page */}
        <Link to="/" className={styles.logoSection} aria-label="Go to home page">
          <div className={styles.logoIcon}>
            <Zap size={20} color="white" />
          </div>
          <div className={styles.logoText}>
            <span className={styles.logoMain}>SNE</span>
            <span className={styles.logoSub}>Alumni Platform</span>
          </div>
        </Link>

        <nav className={styles.nav}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
              onClick={() => { if (window.innerWidth < 768) onClose(); }}
              aria-label={label}
            >
              <span className={styles.navIcon}><Icon size={19} /></span>
              <span className={styles.navLabel}>{label}</span>
              <span className={styles.activeIndicator} />
            </NavLink>
          ))}
        </nav>

        {/* Upgrade Card */}
        <div className={styles.upgradeCard}>
          <div className={styles.upgradeIcon}>✨</div>
          <p className={styles.upgradeTitle}>Upgrade to Pro</p>
          <p className={styles.upgradeDesc}>Unlock AI insights and unlimited connections</p>
          <button className={styles.upgradeBtn}>Get Pro</button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
