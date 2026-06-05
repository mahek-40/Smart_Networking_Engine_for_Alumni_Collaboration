import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Clock, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { useNetwork } from '../contexts/NetworkContext';
import allUsers from '../data/users.json';
import allMentors from '../data/mentors.json';
import styles from './MyNetworkPage.module.css';

const SECTIONS = [
  { key: 'pending', label: 'Pending Requests', icon: Clock, color: '#F59E0B', emptyMsg: 'No pending connection requests.' },
  { key: 'accepted', label: 'Accepted Connections', icon: CheckCircle, color: '#10B981', emptyMsg: 'No accepted connections yet. Start connecting!' },
  { key: 'rejected', label: 'Rejected Requests', icon: XCircle, color: '#EF4444', emptyMsg: 'No rejected requests.' },
];

// Look up a user by ID from all available data sources
const resolveUser = (userId) => {
  const fromUsers = allUsers.find(u => u.id === userId);
  if (fromUsers) return fromUsers;
  const fromMentors = allMentors.find(m => m.id === userId);
  if (fromMentors) return {
    id: fromMentors.id,
    name: fromMentors.name,
    avatar: fromMentors.avatar,
    role: fromMentors.role,
    company: fromMentors.company,
    industry: fromMentors.industry,
  };
  return null;
};

const ConnectionCard = ({ userId, status, onAccept, onReject }) => {
  const navigate = useNavigate();
  const profile = resolveUser(userId);

  if (!profile) return null;

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <img
        src={profile.avatar || `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(profile.name)}`}
        alt={profile.name}
        className={styles.avatar}
      />
      <div className={styles.cardInfo}>
        <p className={styles.cardName}>{profile.name}</p>
        <p className={styles.cardRole}>{profile.role}</p>
        <p className={styles.cardCompany}>{profile.company}</p>
      </div>
      <div className={styles.cardActions}>
        <span className={`${styles.statusBadge} ${styles[`status_${status}`]}`}>
          {status === 'pending' && '⏳ Pending'}
          {status === 'accepted' && '✓ Connected'}
          {status === 'rejected' && '✗ Rejected'}
        </span>
        {status === 'pending' && (
          <>
            <button className={styles.acceptBtn} onClick={() => onAccept(userId)}>Accept</button>
            <button className={styles.rejectBtn} onClick={() => onReject(userId)}>Decline</button>
          </>
        )}
        <button
          className={styles.viewBtn}
          onClick={() => navigate(`/user/${userId}`)}
          title="View Profile"
        >
          <ExternalLink size={14} /> View
        </button>
      </div>
    </motion.div>
  );
};

const MyNetworkPage = () => {
  const { getAllPending, getAllAccepted, getAllRejected, acceptRequest, rejectRequest } = useNetwork();
  const [activeSection, setActiveSection] = useState('pending');

  const pending = getAllPending();
  const accepted = getAllAccepted();
  const rejected = getAllRejected();

  const counts = { pending: pending.length, accepted: accepted.length, rejected: rejected.length };
  const userIds = { pending, accepted, rejected };

  return (
    <div className={styles.page}>
      {/* Header */}
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.headerIcon}><Users size={20} /></div>
        <div>
          <h1 className={styles.headerTitle}>My Network</h1>
          <p className={styles.headerSubtitle}>Manage your connection requests and accepted connections</p>
        </div>
      </motion.div>

      {/* Section Tabs */}
      <div className={styles.tabs} role="tablist">
        {SECTIONS.map(({ key, label, icon: Icon, color }) => (
          <button
            key={key}
            role="tab"
            aria-selected={activeSection === key}
            className={`${styles.tab} ${activeSection === key ? styles.tabActive : ''}`}
            onClick={() => setActiveSection(key)}
            style={{ '--tab-color': color }}
          >
            <Icon size={15} />
            <span>{label}</span>
            {counts[key] > 0 && (
              <span className={styles.tabBadge} style={{ background: color }}>
                {counts[key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className={styles.content}>
        {userIds[activeSection].length === 0 ? (
          <div className={styles.empty}>
            {SECTIONS.find(s => s.key === activeSection)?.emptyMsg}
          </div>
        ) : (
          <div className={styles.cardGrid}>
            {userIds[activeSection].map(userId => (
              <ConnectionCard
                key={userId}
                userId={userId}
                status={activeSection}
                onAccept={acceptRequest}
                onReject={rejectRequest}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyNetworkPage;
