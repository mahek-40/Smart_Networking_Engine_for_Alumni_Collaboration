import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Briefcase, GraduationCap, Calendar, Globe, Edit3,
  CheckCircle, Users, Eye, Star, MessageSquare, UserPlus,
  Award, Target, Zap, Heart, TrendingUp, ExternalLink, X, Save
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CompatibilityRing from '../components/shared/CompatibilityRing';
import SkillTag from '../components/shared/SkillTag';
import StatCard from '../components/shared/StatCard';
import styles from './ProfilePage.module.css';

const SKILL_LEVELS = {
  React: 92, FastAPI: 85, Python: 88, MongoDB: 78, Docker: 72, 'Machine Learning': 80,
};

const timeline = [
  { year: '2024 – Present', role: 'Full Stack Developer', company: 'TechVentures Inc.', desc: 'Building AI-powered SaaS products using React and FastAPI. Leading the frontend architecture initiative.', icon: '💼' },
  { year: '2023 – 2024', role: 'Junior Developer Intern', company: 'InnovateLab', desc: 'Developed reusable React component library. Contributed to 3 production deployments.', icon: '🚀' },
  { year: '2018 – 2022', role: 'B.Tech Computer Science', company: 'BITS Pilani', desc: 'Graduated with 8.7 CGPA. Final project on AI-driven recommendation systems.', icon: '🎓' },
];

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ bio: user?.bio || '', careerGoals: user?.careerGoals || '' });
  const [activeTab, setActiveTab] = useState('about');
  const [endorsed, setEndorsed] = useState({});
  const [connected, setConnected] = useState(false);

  const handleSave = () => {
    updateProfile(editForm);
    setIsEditing(false);
  };

  return (
    <div className={styles.page}>
      {/* Hero Banner */}
      <motion.div
        className={styles.hero}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.heroBg} aria-hidden="true" />
        <div className={styles.heroContent}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrapper}>
              <img src={user?.avatar} alt={user?.name} className={styles.avatar} />
              {user?.isVerified && (
                <div className={styles.verifiedBadge} title="Verified Alumni">
                  <CheckCircle size={14} />
                </div>
              )}
            </div>
            <div className={styles.heroInfo}>
              <div className={styles.nameRow}>
                <h1 className={styles.name}>{user?.name}</h1>
                <div className={styles.tagsList}>
                  {(user?.tags || []).map(t => (
                    <span key={t} className={styles.tag}>{t}</span>
                  ))}
                </div>
              </div>
              <p className={styles.role}>{user?.role}</p>
              <p className={styles.company}>
                <Briefcase size={14} /> {user?.company}
              </p>
              <div className={styles.metaRow}>
                <span className={styles.metaItem}><MapPin size={13} /> {user?.location}</span>
                <span className={styles.metaItem}><GraduationCap size={13} /> {user?.university}</span>
                <span className={styles.metaItem}><Calendar size={13} /> Class of {user?.graduationYear}</span>
                <span className={styles.metaItem}><Globe size={13} /> <a href={`https://${user?.linkedin}`} target="_blank" rel="noopener noreferrer">LinkedIn</a></span>
              </div>
            </div>
          </div>
          <div className={styles.heroRight}>
            <CompatibilityRing score={user?.compatibilityScore || 96} size={90} strokeWidth={6} label="AI Score" />
            <div className={styles.heroActions}>
              {!connected ? (
                <motion.button
                  className={styles.connectBtn}
                  onClick={() => setConnected(true)}
                  whileTap={{ scale: 0.97 }}
                >
                  <UserPlus size={15} /> Connect
                </motion.button>
              ) : (
                <button className={styles.connectedBtn} disabled>
                  <CheckCircle size={15} /> Connected
                </button>
              )}
              <button className={styles.messageBtn}><MessageSquare size={15} /> Message</button>
              <button
                className={styles.editBtn}
                onClick={() => setIsEditing(true)}
                aria-label="Edit profile"
              >
                <Edit3 size={15} /> Edit Profile
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className={styles.statsGrid}>
        {[
          { title: 'Connections', value: String(user?.connections || 156), icon: <Users size={18} />, growth: 12.5, growthLabel: 'this month', color: '#0077B5' },
          { title: 'Profile Views', value: String(user?.profileViews || 342), icon: <Eye size={18} />, growth: 18.7, growthLabel: 'this month', color: '#059669' },
          { title: 'AI Match Score', value: `${user?.compatibilityScore || 96}%`, icon: <Star size={18} />, growth: 3.2, growthLabel: 'improved', color: '#8B5CF6' },
          { title: 'Experience', value: user?.experience || '2 years', icon: <Briefcase size={18} />, color: '#F59E0B' },
        ].map((card, i) => (
          <StatCard key={card.title} {...card} index={i} />
        ))}
      </div>

      {/* Tabs */}
      <div className={styles.tabs} role="tablist">
        {['about', 'skills', 'timeline', 'interests'].map(tab => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}
            id={`tab-${tab}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className={styles.tabContent}
        >
          {/* About Tab */}
          {activeTab === 'about' && (
            <div className={styles.aboutGrid}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}><Heart size={16} /> About Me</h2>
                </div>
                <p className={styles.bio}>{user?.bio}</p>
              </div>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}><Target size={16} /> Career Goals</h2>
                </div>
                <p className={styles.bio}>{user?.careerGoals}</p>
              </div>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}><Zap size={16} /> Looking For</h2>
                </div>
                <div className={styles.lookingFor}>
                  {(user?.lookingFor || []).map(l => (
                    <span key={l} className={styles.lookingTag}>{l}</span>
                  ))}
                </div>
              </div>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}><Award size={16} /> Education</h2>
                </div>
                <div className={styles.eduInfo}>
                  <p className={styles.eduDegree}>{user?.degree}</p>
                  <p className={styles.eduUniv}>{user?.university}</p>
                  <p className={styles.eduYear}>Class of {user?.graduationYear}</p>
                </div>
              </div>
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div className={styles.skillsSection}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}><TrendingUp size={16} /> Skills & Proficiency</h2>
                </div>
                <div className={styles.skillBars}>
                  {(user?.skills || []).map((skill, i) => {
                    const level = SKILL_LEVELS[skill] || 70;
                    return (
                      <div key={skill} className={styles.skillBar}>
                        <div className={styles.skillBarHeader}>
                          <span className={styles.skillName}>{skill}</span>
                          <span className={styles.skillPct}>{level}%</span>
                        </div>
                        <div className={styles.skillTrack}>
                          <motion.div
                            className={styles.skillFill}
                            initial={{ width: 0 }}
                            animate={{ width: `${level}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}><Star size={16} /> Peer Endorsements</h2>
                </div>
                <div className={styles.endorsements}>
                  {(user?.skills || []).map(skill => (
                    <div key={skill} className={styles.endorseRow}>
                      <SkillTag skill={skill} size="sm" />
                      <div className={styles.endorseRight}>
                        <span className={styles.endorseCount}>{endorsed[skill] ? (Math.floor(Math.random() * 8) + 3) : (Math.floor(Math.random() * 5) + 1)} endorsements</span>
                        <motion.button
                          className={`${styles.endorseBtn} ${endorsed[skill] ? styles.endorsedBtn : ''}`}
                          onClick={() => setEndorsed(p => ({ ...p, [skill]: true }))}
                          disabled={!!endorsed[skill]}
                          whileTap={{ scale: 0.95 }}
                        >
                          {endorsed[skill] ? '✓ Endorsed' : '+ Endorse'}
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}><Calendar size={16} /> Experience & Education</h2>
              </div>
              <div className={styles.timeline}>
                {timeline.map((item, i) => (
                  <motion.div
                    key={i}
                    className={styles.timelineItem}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                  >
                    <div className={styles.timelineDot}>
                      <span>{item.icon}</span>
                    </div>
                    <div className={styles.timelineContent}>
                      <span className={styles.timelineYear}>{item.year}</span>
                      <h3 className={styles.timelineRole}>{item.role}</h3>
                      <p className={styles.timelineCompany}>{item.company}</p>
                      <p className={styles.timelineDesc}>{item.desc}</p>
                    </div>
                    {i < timeline.length - 1 && <div className={styles.timelineLine} />}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Interests Tab */}
          {activeTab === 'interests' && (
            <div className={styles.interestsSection}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}><Heart size={16} /> Interests & Passions</h2>
                </div>
                <div className={styles.interestCloud}>
                  {(user?.interests || []).map((interest, i) => (
                    <motion.span
                      key={interest}
                      className={styles.interestChip}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.08 }}
                      whileHover={{ scale: 1.06 }}
                    >
                      {interest}
                    </motion.span>
                  ))}
                </div>
              </div>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}><ExternalLink size={16} /> Quick Links</h2>
                </div>
                <div className={styles.links}>
                  <a href={`https://${user?.linkedin}`} target="_blank" rel="noopener noreferrer" className={styles.linkItem}>
                    <Globe size={16} /> LinkedIn Profile <ExternalLink size={12} />
                  </a>
                  <a href={`mailto:${user?.email}`} className={styles.linkItem}>
                    <MessageSquare size={16} /> Send Email <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <>
            <motion.div
              className={styles.modalOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
            />
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              role="dialog"
              aria-label="Edit Profile"
            >
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Edit Profile</h2>
                <button className={styles.modalClose} onClick={() => setIsEditing(false)} aria-label="Close">
                  <X size={18} />
                </button>
              </div>
              <div className={styles.modalBody}>
                <label className={styles.formLabel}>Bio</label>
                <textarea
                  className={styles.formTextarea}
                  value={editForm.bio}
                  onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))}
                  rows={4}
                  id="edit-bio"
                />
                <label className={styles.formLabel}>Career Goals</label>
                <textarea
                  className={styles.formTextarea}
                  value={editForm.careerGoals}
                  onChange={e => setEditForm(p => ({ ...p, careerGoals: e.target.value }))}
                  rows={3}
                  id="edit-career-goals"
                />
              </div>
              <div className={styles.modalActions}>
                <button className={styles.cancelBtn} onClick={() => setIsEditing(false)}>Cancel</button>
                <motion.button
                  className={styles.saveBtn}
                  onClick={handleSave}
                  whileTap={{ scale: 0.97 }}
                >
                  <Save size={15} /> Save Changes
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
