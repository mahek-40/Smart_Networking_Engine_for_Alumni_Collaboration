import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Search, ChevronDown, LogOut, User, Settings,
  BarChart2, Zap, Menu, X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import activities from '../../data/activities.json';
import styles from './Navbar.module.css';

const Navbar = ({ onMenuToggle, sidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);
  const unreadCount = activities.filter(a => !a.isRead).length;

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const getActivityIcon = (type) => {
    const icons = { connection: '🤝', recommendation: '🤖', mentor: '🎓', profile: '👁️', collaboration: '🚀', skill: '⚡' };
    return icons[type] || '📢';
  };

  return (
    <header className={styles.navbar} role="banner">
      <div className={styles.left}>
        <button
          className={styles.menuToggle}
          onClick={onMenuToggle}
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={sidebarOpen}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Link to="/dashboard" className={styles.logo} aria-label="Smart Networking Engine Home">
          <div className={styles.logoIcon}>
            <Zap size={18} className={styles.logoZap} />
          </div>
          <span className={styles.logoText}>
            <span className={styles.logoSNE}>SNE</span>
            <span className={styles.logoDot} aria-hidden="true">·</span>
            <span className={styles.logoAC}>Alumni</span>
          </span>
        </Link>
      </div>

      <div className={styles.searchWrapper}>
        <Search size={16} className={styles.searchIcon} aria-hidden="true" />
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search alumni, skills, companies…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && searchQuery && navigate(`/search?q=${searchQuery}`)}
          aria-label="Search the platform"
          id="global-search"
        />
        <kbd className={styles.searchKbd}>⌘K</kbd>
      </div>

      <div className={styles.right}>
        {/* Notifications */}
        <div className={styles.notifWrapper} ref={notifRef}>
          <button
            className={styles.iconBtn}
            onClick={() => setShowNotifications(p => !p)}
            aria-label={`Notifications — ${unreadCount} unread`}
            aria-expanded={showNotifications}
            aria-haspopup="true"
            id="notifications-btn"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <motion.span
                className={styles.badge}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
                aria-hidden="true"
              >
                {unreadCount}
              </motion.span>
            )}
          </button>
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                className={styles.dropdown}
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                role="dialog"
                aria-label="Notifications"
              >
                <div className={styles.dropdownHeader}>
                  <h3 className={styles.dropdownTitle}>Notifications</h3>
                  <span className={styles.unreadBadge}>{unreadCount} new</span>
                </div>
                <div className={styles.notifList}>
                  {activities.slice(0, 5).map(a => (
                    <Link
                      key={a.id}
                      to={a.link}
                      className={`${styles.notifItem} ${!a.isRead ? styles.unread : ''}`}
                      onClick={() => setShowNotifications(false)}
                    >
                      <span className={styles.notifEmoji}>{getActivityIcon(a.type)}</span>
                      <div className={styles.notifContent}>
                        <p className={styles.notifMsg}>{a.message}</p>
                        <span className={styles.notifTime}>{a.time}</span>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link to="/dashboard" className={styles.viewAll} onClick={() => setShowNotifications(false)}>
                  View all notifications
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Menu */}
        <div className={styles.userWrapper} ref={userMenuRef}>
          <button
            className={styles.userBtn}
            onClick={() => setShowUserMenu(p => !p)}
            aria-expanded={showUserMenu}
            aria-haspopup="true"
            aria-label="User menu"
            id="user-menu-btn"
          >
            <img
              src={user?.avatar}
              alt={user?.name}
              className={styles.avatar}
            />
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.name?.split(' ')[0]}</span>
              <span className={styles.userRole}>{user?.role?.split(' ').slice(0, 2).join(' ')}</span>
            </div>
            <ChevronDown size={14} className={`${styles.chevron} ${showUserMenu ? styles.chevronOpen : ''}`} />
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                className={styles.userDropdown}
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                role="menu"
              >
                <div className={styles.userDropdownHeader}>
                  <img src={user?.avatar} alt={user?.name} className={styles.avatarLg} />
                  <div>
                    <p className={styles.dropdownName}>{user?.name}</p>
                    <p className={styles.dropdownEmail}>{user?.email}</p>
                  </div>
                </div>
                <div className={styles.menuItems}>
                  <Link to="/profile" className={styles.menuItem} role="menuitem" onClick={() => setShowUserMenu(false)}>
                    <User size={15} /> My Profile
                  </Link>
                  <Link to="/analytics" className={styles.menuItem} role="menuitem" onClick={() => setShowUserMenu(false)}>
                    <BarChart2 size={15} /> Analytics
                  </Link>
                  <Link to="/settings" className={styles.menuItem} role="menuitem" onClick={() => setShowUserMenu(false)}>
                    <Settings size={15} /> Settings
                  </Link>
                  <div className={styles.menuDivider} role="separator" />
                  <button className={`${styles.menuItem} ${styles.menuItemDanger}`} role="menuitem" onClick={handleLogout}>
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
