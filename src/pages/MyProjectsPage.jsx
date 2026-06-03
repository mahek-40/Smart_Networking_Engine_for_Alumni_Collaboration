import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Network, Clock, CheckCircle, XCircle, ExternalLink, Star } from 'lucide-react';
import { useProject } from '../contexts/ProjectContext';
import SkillTag from '../components/shared/SkillTag';
import collaborationData from '../data/collaborations.json';
import styles from './MyProjectsPage.module.css';

const SECTIONS = [
  { key: 'pending', label: 'Applied Projects', icon: Clock, color: '#F59E0B' },
  { key: 'accepted', label: 'Accepted Projects', icon: CheckCircle, color: '#10B981' },
  { key: 'rejected', label: 'Not Selected', icon: XCircle, color: '#EF4444' },
];

const STATUS_BADGE = {
  pending: { label: '⏳ Pending Review', cls: 'badge_pending' },
  accepted: { label: '✓ Accepted', cls: 'badge_accepted' },
  rejected: { label: '✗ Not Selected', cls: 'badge_rejected' },
};

const ProjectCard = ({ projectId, status }) => {
  const navigate = useNavigate();
  const project = collaborationData.activeProjects.find(p => p.id === projectId);

  if (!project) return null;

  const badge = STATUS_BADGE[status];

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <div className={styles.cardTop}>
        <div className={styles.cardMeta}>
          <span className={`${styles.badge} ${styles[badge.cls]}`}>{badge.label}</span>
          <span className={styles.industry}>{project.industry}</span>
        </div>
        <div className={styles.matchScore}>
          <Star size={12} fill="#F59E0B" stroke="none" />
          {project.matchScore}% match
        </div>
      </div>
      <h3 className={styles.cardTitle}>{project.title}</h3>
      <p className={styles.cardDesc}>{project.description}</p>
      <div className={styles.ownerRow}>
        <img src={project.ownerAvatar} alt={project.owner} className={styles.ownerAvatar} />
        <span className={styles.ownerName}>{project.owner}</span>
        <span className={styles.timeline}><Clock size={11} /> {project.timeline}</span>
      </div>
      <div className={styles.skillsRow}>
        {project.skills.slice(0, 4).map(s => (
          <SkillTag key={s} skill={s} size="sm" />
        ))}
        {project.skills.length > 4 && (
          <span className={styles.moreSkills}>+{project.skills.length - 4}</span>
        )}
      </div>
      <button
        className={styles.viewBtn}
        onClick={() => navigate(`/projects/${projectId}`)}
      >
        <ExternalLink size={14} /> View Details
      </button>
    </motion.div>
  );
};

const MyProjectsPage = () => {
  const { getAllApplied, getAllAccepted, getAllRejected } = useProject();
  const [activeSection, setActiveSection] = useState('pending');

  const applied = getAllApplied();
  const accepted = getAllAccepted();
  const rejected = getAllRejected();

  const counts = { pending: applied.length, accepted: accepted.length, rejected: rejected.length };
  const projectIds = { pending: applied, accepted, rejected };

  return (
    <div className={styles.page}>
      {/* Header */}
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.headerIcon}><Network size={20} /></div>
        <div>
          <h1 className={styles.headerTitle}>My Projects</h1>
          <p className={styles.headerSubtitle}>Track your project applications and accepted collaborations</p>
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
        {projectIds[activeSection].length === 0 ? (
          <div className={styles.empty}>
            {activeSection === 'pending' && "You haven't applied to any projects yet. Browse the Collaboration page to find projects!"}
            {activeSection === 'accepted' && 'No accepted projects yet. Keep applying!'}
            {activeSection === 'rejected' && 'No rejected applications.'}
          </div>
        ) : (
          <div className={styles.cardGrid}>
            {projectIds[activeSection].map(pid => (
              <ProjectCard key={pid} projectId={pid} status={activeSection} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProjectsPage;
