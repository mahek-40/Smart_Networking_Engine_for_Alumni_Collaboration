import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Filter, Users, Brain, GraduationCap, Eye, Network, Zap, Trash2 } from 'lucide-react';
import activities from '../data/activities.json';
import styles from './NotificationsPage.module.css';

const TYPE_ICONS = {
  connection: { emoji: '🤝', color: '#0077B5', label: 'Connection' },
  recommendation: { emoji: '🤖', color: '#8B5CF6', label: 'AI Match' },
  mentor: { emoji: '🎓', color: '#059669', label: 'Mentor' },
  profile: { emoji: '👁️', color: '#F59E0B', label: 'Profile' },
  collaboration: { emoji: '🚀', color: '#EF4444', label: 'Project' },
  skill: { emoji: '⚡', color: '#0077B5', label: 'Skill' },
};

const FILTERS = ['All', 'Connection', 'AI Match', 'Mentor', 'Project', 'Profile', 'Skill'];

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState(
    activities.map(a => ({ ...a }))
  );
  const [activeFilter, setActiveFilter] = useState('All');
  const [readIds, setReadIds] = useState(
    new Set(activities.filter(a => a.isRead).map(a => a.id))
  );

  const markAllRead = () => {
    setReadIds(new Set(notifications.map(n => n.id)));
  };

  const markRead = (id) => {
    setReadIds(prev => new Set([...prev, id]));
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filtered = notifications.filter(n => {
    if (activeFilter === 'All') return true;
    const typeInfo = TYPE_ICONS[n.type];
    return typeInfo?.label === activeFilter;
  });

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  return (
    <div className={styles.page}>
      {/* Header */}
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <Bell size={20} />
          </div>
          <div>
            <h1 className={styles.headerTitle}>Notifications</h1>
            <p className={styles.headerSubtitle}>
              Stay updated on connections, projects, and recommendations
            </p>
          </div>
        </div>
        <div className={styles.headerRight}>
          {unreadCount > 0 && (
            <span className={styles.unreadBadge}>{unreadCount} unread</span>
          )}
          <button className={styles.markAllBtn} onClick={markAllRead}>
            <CheckCheck size={15} /> Mark all read
          </button>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <div className={styles.filters} role="tablist">
        {FILTERS.map(f => (
          <button
            key={f}
            role="tab"
            aria-selected={activeFilter === f}
            className={`${styles.filterBtn} ${activeFilter === f ? styles.filterActive : ''}`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className={styles.list}>
        <AnimatePresence>
          {filtered.length === 0 ? (
            <motion.div
              className={styles.empty}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Bell size={48} opacity={0.2} />
              <p>No notifications in this category.</p>
            </motion.div>
          ) : (
            filtered.map((notif, i) => {
              const typeInfo = TYPE_ICONS[notif.type] || { emoji: '📢', color: '#64748B', label: 'Other' };
              const isRead = readIds.has(notif.id);

              return (
                <motion.div
                  key={notif.id}
                  className={`${styles.notifItem} ${!isRead ? styles.unread : ''}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                  transition={{ delay: i * 0.05 }}
                  layout
                >
                  <div
                    className={styles.notifDot}
                    style={{ background: typeInfo.color }}
                    aria-hidden="true"
                  >
                    <span>{typeInfo.emoji}</span>
                  </div>

                  <Link
                    to={notif.link || '/dashboard'}
                    className={styles.notifContent}
                    onClick={() => markRead(notif.id)}
                  >
                    <div className={styles.notifRow}>
                      <p className={styles.notifMsg}>{notif.message}</p>
                      {!isRead && <span className={styles.newDot} aria-label="New" />}
                    </div>
                    <div className={styles.notifMeta}>
                      <span
                        className={styles.notifType}
                        style={{ color: typeInfo.color }}
                      >
                        {typeInfo.label}
                      </span>
                      <span className={styles.notifTime}>{notif.time}</span>
                    </div>
                  </Link>

                  <div className={styles.notifActions}>
                    {!isRead && (
                      <button
                        className={styles.actionBtn}
                        onClick={() => markRead(notif.id)}
                        title="Mark as read"
                      >
                        <CheckCheck size={14} />
                      </button>
                    )}
                    <button
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                      onClick={() => deleteNotification(notif.id)}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotificationsPage;
