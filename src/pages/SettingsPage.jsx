import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Lock, Bell, Brain, Shield, Trash2, ChevronRight,
  Save, Check, Eye, EyeOff, AlertTriangle, Zap, Globe,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import styles from './SettingsPage.module.css';

const SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'ai', label: 'AI Preferences', icon: Brain },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'danger', label: 'Danger Zone', icon: Trash2 },
];

const Toggle = ({ checked, onChange, id, label }) => (
  <button
    role="switch"
    aria-checked={checked}
    id={id}
    onClick={() => onChange(!checked)}
    className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`}
    aria-label={label}
  >
    <span className={styles.toggleThumb} />
  </button>
);

const SettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    role: user?.role || '',
    company: user?.company || '',
    location: user?.location || '',
    bio: user?.bio || '',
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showEmail: false,
    showConnections: true,
    allowMessages: true,
    allowCollaborationRequests: true,
    showOnlineStatus: false,
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    newConnections: true,
    mentorRequests: true,
    aiRecommendations: true,
    projectInvites: true,
    profileViews: false,
    weeklyDigest: true,
    emailNotifs: true,
    pushNotifs: false,
  });

  // AI preferences
  const [aiPrefs, setAiPrefs] = useState({
    recommendationFrequency: 'weekly',
    matchThreshold: 75,
    includeRemoteJobs: true,
    prioritizeStartups: false,
    autoPredictCollaboration: true,
    shareDataForImprovement: true,
  });

  // Security
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
  });

  const handleSave = () => {
    if (activeSection === 'profile') {
      updateProfile(profileForm);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className={styles.sectionContent}>
            <div className={styles.sectionTitle}>Profile Information</div>
            <div className={styles.formGrid}>
              {[
                { key: 'name', label: 'Full Name', type: 'text', id: 'settings-name' },
                { key: 'role', label: 'Current Role', type: 'text', id: 'settings-role' },
                { key: 'company', label: 'Company', type: 'text', id: 'settings-company' },
                { key: 'location', label: 'Location', type: 'text', id: 'settings-location' },
              ].map(({ key, label, type, id }) => (
                <div key={key} className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor={id}>{label}</label>
                  <input
                    id={id}
                    type={type}
                    className={styles.formInput}
                    value={profileForm[key]}
                    onChange={e => setProfileForm(p => ({ ...p, [key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="settings-bio">Bio</label>
              <textarea
                id="settings-bio"
                className={styles.formTextarea}
                rows={4}
                value={profileForm.bio}
                onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))}
              />
            </div>
            <div className={styles.avatarSection}>
              <label className={styles.formLabel}>Profile Picture</label>
              <div className={styles.avatarRow}>
                <img src={user?.avatar} alt={user?.name} className={styles.avatar} />
                <div className={styles.avatarInfo}>
                  <p className={styles.avatarHint}>Your avatar is generated automatically from your name</p>
                  <span className={styles.avatarTag}>Auto-generated via DiceBear</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className={styles.sectionContent}>
            <div className={styles.sectionTitle}>Privacy Controls</div>
            <div className={styles.togglesList}>
              {[
                { key: 'profilePublic', label: 'Public Profile', desc: 'Allow anyone to view your profile' },
                { key: 'showEmail', label: 'Show Email', desc: 'Display your email on profile' },
                { key: 'showConnections', label: 'Show Connections', desc: 'Others can see your connection count' },
                { key: 'allowMessages', label: 'Allow Messages', desc: 'Receive direct messages from alumni' },
                { key: 'allowCollaborationRequests', label: 'Collaboration Requests', desc: 'Allow project collaboration invites' },
                { key: 'showOnlineStatus', label: 'Online Status', desc: 'Show when you are active' },
              ].map(({ key, label, desc }) => (
                <div key={key} className={styles.toggleRow}>
                  <div className={styles.toggleInfo}>
                    <p className={styles.toggleLabel}>{label}</p>
                    <p className={styles.toggleDesc}>{desc}</p>
                  </div>
                  <Toggle
                    id={`privacy-${key}`}
                    checked={privacy[key]}
                    onChange={val => setPrivacy(p => ({ ...p, [key]: val }))}
                    label={label}
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className={styles.sectionContent}>
            <div className={styles.sectionTitle}>Notification Preferences</div>
            <div className={styles.notifGroup}>
              <p className={styles.notifGroupLabel}><Bell size={14} /> In-App Notifications</p>
              {[
                { key: 'newConnections', label: 'New Connection Requests' },
                { key: 'mentorRequests', label: 'Mentor Session Requests' },
                { key: 'aiRecommendations', label: 'AI Recommendation Alerts' },
                { key: 'projectInvites', label: 'Project Collaboration Invites' },
                { key: 'profileViews', label: 'Profile View Notifications' },
              ].map(({ key, label }) => (
                <div key={key} className={styles.toggleRow}>
                  <div className={styles.toggleInfo}>
                    <p className={styles.toggleLabel}>{label}</p>
                  </div>
                  <Toggle
                    id={`notif-${key}`}
                    checked={notifications[key]}
                    onChange={val => setNotifications(p => ({ ...p, [key]: val }))}
                    label={label}
                  />
                </div>
              ))}
            </div>
            <div className={styles.notifGroup}>
              <p className={styles.notifGroupLabel}><Smartphone size={14} /> Delivery Channels</p>
              {[
                { key: 'weeklyDigest', label: 'Weekly Digest Email', desc: 'Summary of your network activity' },
                { key: 'emailNotifs', label: 'Email Notifications', desc: 'Receive alerts via email' },
                { key: 'pushNotifs', label: 'Push Notifications', desc: 'Browser push notifications' },
              ].map(({ key, label, desc }) => (
                <div key={key} className={styles.toggleRow}>
                  <div className={styles.toggleInfo}>
                    <p className={styles.toggleLabel}>{label}</p>
                    {desc && <p className={styles.toggleDesc}>{desc}</p>}
                  </div>
                  <Toggle
                    id={`delivery-${key}`}
                    checked={notifications[key]}
                    onChange={val => setNotifications(p => ({ ...p, [key]: val }))}
                    label={label}
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 'ai':
        return (
          <div className={styles.sectionContent}>
            <div className={styles.sectionTitle}>AI & Matching Preferences</div>
            <div className={styles.aiPrefsGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="rec-freq">Recommendation Frequency</label>
                <select
                  id="rec-freq"
                  className={styles.formSelect}
                  value={aiPrefs.recommendationFrequency}
                  onChange={e => setAiPrefs(p => ({ ...p, recommendationFrequency: e.target.value }))}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="match-threshold">
                  Minimum Match Score: <strong>{aiPrefs.matchThreshold}%</strong>
                </label>
                <input
                  id="match-threshold"
                  type="range"
                  min={50}
                  max={95}
                  step={5}
                  value={aiPrefs.matchThreshold}
                  onChange={e => setAiPrefs(p => ({ ...p, matchThreshold: +e.target.value }))}
                  className={styles.rangeInput}
                />
                <div className={styles.rangeLabels}>
                  <span>50%</span><span>95%</span>
                </div>
              </div>
            </div>
            <div className={styles.togglesList}>
              {[
                { key: 'includeRemoteJobs', label: 'Include Remote Opportunities', desc: 'Show remote collaboration & job matches' },
                { key: 'prioritizeStartups', label: 'Prioritize Startups', desc: 'Favor startup alumni in recommendations' },
                { key: 'autoPredictCollaboration', label: 'Auto-Predict Collaborations', desc: 'Automatically run collaboration scoring' },
                { key: 'shareDataForImprovement', label: 'Share Data for AI Improvement', desc: 'Help improve matching accuracy (anonymized)' },
              ].map(({ key, label, desc }) => (
                <div key={key} className={styles.toggleRow}>
                  <div className={styles.toggleInfo}>
                    <p className={styles.toggleLabel}>{label}</p>
                    <p className={styles.toggleDesc}>{desc}</p>
                  </div>
                  <Toggle
                    id={`ai-${key}`}
                    checked={aiPrefs[key]}
                    onChange={val => setAiPrefs(p => ({ ...p, [key]: val }))}
                    label={label}
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 'security':
        return (
          <div className={styles.sectionContent}>
            <div className={styles.sectionTitle}>Account Security</div>
            <div className={styles.formGrid}>
              <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                <label className={styles.formLabel} htmlFor="current-password">Current Password</label>
                <div className={styles.passwordField}>
                  <input
                    id="current-password"
                    type={showPassword ? 'text' : 'password'}
                    className={styles.formInput}
                    value={securityForm.currentPassword}
                    onChange={e => setSecurityForm(p => ({ ...p, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                  />
                  <button className={styles.eyeBtn} onClick={() => setShowPassword(p => !p)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="new-password">New Password</label>
                <input
                  id="new-password"
                  type="password"
                  className={styles.formInput}
                  value={securityForm.newPassword}
                  onChange={e => setSecurityForm(p => ({ ...p, newPassword: e.target.value }))}
                  placeholder="Min. 8 characters"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="confirm-password">Confirm Password</label>
                <input
                  id="confirm-password"
                  type="password"
                  className={styles.formInput}
                  value={securityForm.confirmPassword}
                  onChange={e => setSecurityForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="Repeat new password"
                />
              </div>
            </div>
            <div className={styles.divider} />
            <div className={styles.toggleRow}>
              <div className={styles.toggleInfo}>
                <p className={styles.toggleLabel}>Two-Factor Authentication</p>
                <p className={styles.toggleDesc}>Add an extra layer of security to your account</p>
              </div>
              <Toggle
                id="2fa-toggle"
                checked={securityForm.twoFactorEnabled}
                onChange={val => setSecurityForm(p => ({ ...p, twoFactorEnabled: val }))}
                label="Two-Factor Authentication"
              />
            </div>
            <div className={styles.sessionInfo}>
              <p className={styles.sessionLabel}>Active Sessions</p>
              <div className={styles.sessionCard}>
                <div className={styles.sessionIcon}><Globe size={16} /></div>
                <div>
                  <p className={styles.sessionDevice}>Chrome on Windows — Bengaluru, India</p>
                  <p className={styles.sessionTime}>Current session · Just now</p>
                </div>
                <span className={styles.currentTag}>Current</span>
              </div>
            </div>
          </div>
        );

      case 'danger':
        return (
          <div className={styles.sectionContent}>
            <div className={styles.sectionTitle}>Danger Zone</div>
            <div className={styles.dangerBox}>
              <div className={styles.dangerItem}>
                <div className={styles.dangerInfo}>
                  <p className={styles.dangerLabel}>Deactivate Account</p>
                  <p className={styles.dangerDesc}>Temporarily disable your account. Your data will be preserved and you can reactivate at any time.</p>
                </div>
                <button className={styles.dangerBtnYellow}>Deactivate</button>
              </div>
              <div className={styles.dangerDivider} />
              <div className={styles.dangerItem}>
                <div className={styles.dangerInfo}>
                  <p className={styles.dangerLabel} style={{ color: 'var(--error)' }}>
                    <AlertTriangle size={15} style={{ display: 'inline', marginRight: 6 }} />
                    Delete Account
                  </p>
                  <p className={styles.dangerDesc}>
                    Permanently delete your account and all associated data. <strong>This action cannot be undone.</strong>
                  </p>
                </div>
                <button className={styles.dangerBtnRed}>Delete Account</button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className={styles.headerIcon}><Zap size={20} /></div>
        <div>
          <h1 className={styles.headerTitle}>Settings</h1>
          <p className={styles.headerSubtitle}>Manage your account, privacy, and AI preferences</p>
        </div>
      </motion.div>

      <div className={styles.layout}>
        {/* Sidebar Nav */}
        <motion.nav
          className={styles.nav}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          aria-label="Settings navigation"
        >
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`${styles.navItem} ${activeSection === id ? styles.navItemActive : ''} ${id === 'danger' ? styles.navItemDanger : ''}`}
              onClick={() => setActiveSection(id)}
              id={`settings-nav-${id}`}
              aria-current={activeSection === id ? 'page' : undefined}
            >
              <Icon size={16} />
              <span>{label}</span>
              <ChevronRight size={14} className={styles.navChevron} />
            </button>
          ))}
        </motion.nav>

        {/* Content Panel */}
        <motion.div
          className={styles.panel}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>

          {/* Save Actions */}
          {activeSection !== 'danger' && (
            <div className={styles.actions}>
              <button className={styles.cancelBtn} onClick={() => {}}>Cancel</button>
              <motion.button
                className={`${styles.saveBtn} ${saved ? styles.saveBtnSuccess : ''}`}
                onClick={handleSave}
                whileTap={{ scale: 0.97 }}
                id="settings-save-btn"
              >
                {saved ? (
                  <><Check size={15} /> Saved!</>
                ) : (
                  <><Save size={15} /> Save Changes</>
                )}
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;
