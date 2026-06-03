import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Users, Clock, Star, CheckCircle, Plus,
  Target, Briefcase, Code, Globe,
} from 'lucide-react';
import { useProject } from '../contexts/ProjectContext';
import SkillTag from '../components/shared/SkillTag';
import collaborationData from '../data/collaborations.json';
import styles from './ProjectDetailsPage.module.css';

const STAGE_COLORS = {
  'In Development': { bg: '#DBEAFE', text: '#1D4ED8' },
  'Planning': { bg: '#FEF3C7', text: '#92400E' },
  'MVP Ready': { bg: '#D1FAE5', text: '#065F46' },
  'Open Source': { bg: '#EDE9FE', text: '#5B21B6' },
  'Alpha Testing': { bg: '#FEE2E2', text: '#991B1B' },
  'Research Phase': { bg: '#F0FDF4', text: '#14532D' },
};

const STATUS_LABEL = {
  none: 'Join Project',
  pending: '⏳ Application Pending',
  accepted: '✓ Accepted',
  rejected: '✗ Not Selected',
};

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProjectStatus, applyToProject } = useProject();

  const project = collaborationData.activeProjects.find(p => p.id === id);
  const status = project ? getProjectStatus(id) : 'none';

  if (!project) {
    return (
      <div className={styles.notFound}>
        <div className={styles.notFoundIcon}>📂</div>
        <h1>Project Not Found</h1>
        <p>The project you're looking for doesn't exist or has been removed.</p>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  const stageStyle = STAGE_COLORS[project.stage] || { bg: '#F1F5F9', text: '#475569' };
  const fillPct = (project.collaborators / project.maxCollaborators) * 100;

  const handleJoin = () => {
    if (status === 'none') {
      applyToProject(id);
    }
  };

  return (
    <div className={styles.page}>
      {/* Back Navigation */}
      <button className={styles.backNav} onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back to Projects
      </button>

      {/* Hero Card */}
      <motion.div
        className={styles.hero}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className={styles.heroTop}>
          <div className={styles.heroMeta}>
            <span
              className={styles.stageBadge}
              style={{ background: stageStyle.bg, color: stageStyle.text }}
            >
              {project.stage}
            </span>
            <span className={styles.industryBadge}>{project.industry}</span>
            <div className={styles.matchScore}>
              <Star size={13} fill="#F59E0B" stroke="none" />
              <span>{project.matchScore}% match</span>
            </div>
          </div>
          <motion.button
            className={`${styles.joinBtn} ${status !== 'none' ? styles[`joinBtn_${status}`] : ''}`}
            onClick={handleJoin}
            disabled={status !== 'none'}
            whileTap={status === 'none' ? { scale: 0.97 } : {}}
            id={`join-project-detail-${id}`}
          >
            {status === 'none' ? (
              <><Plus size={15} /> Join Project</>
            ) : status === 'pending' ? (
              STATUS_LABEL.pending
            ) : status === 'accepted' ? (
              <><CheckCircle size={15} /> {STATUS_LABEL.accepted}</>
            ) : (
              STATUS_LABEL.rejected
            )}
          </motion.button>
        </div>

        <h1 className={styles.projectTitle}>{project.title}</h1>
        <p className={styles.projectDesc}>{project.description}</p>

        {/* Owner */}
        <div className={styles.ownerRow}>
          <img src={project.ownerAvatar} alt={project.owner} className={styles.ownerAvatar} />
          <div>
            <p className={styles.ownerName}>{project.owner}</p>
            <p className={styles.ownerLabel}>Project Owner</p>
          </div>
          <span className={styles.timeline}><Clock size={13} /> {project.timeline}</span>
        </div>
      </motion.div>

      {/* Details Grid */}
      <div className={styles.grid}>
        {/* Skills Required */}
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className={styles.cardHeader}>
            <Code size={16} className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>Required Skills</h2>
          </div>
          <div className={styles.skillsGrid}>
            {project.skills.map(skill => (
              <SkillTag key={skill} skill={skill} size="md" />
            ))}
          </div>
        </motion.div>

        {/* Team Progress */}
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className={styles.cardHeader}>
            <Users size={16} className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>Team Members</h2>
          </div>
          <div className={styles.teamProgress}>
            <div className={styles.teamNumbers}>
              <span className={styles.teamCurrent}>{project.collaborators}</span>
              <span className={styles.teamSep}>/</span>
              <span className={styles.teamMax}>{project.maxCollaborators}</span>
              <span className={styles.teamLabel}>collaborators</span>
            </div>
            <div className={styles.progressTrack}>
              <motion.div
                className={styles.progressFill}
                initial={{ width: 0 }}
                animate={{ width: `${fillPct}%` }}
                transition={{ duration: 0.8, delay: 0.4 }}
              />
            </div>
            <p className={styles.teamPct}>{Math.round(fillPct)}% team filled</p>
          </div>
        </motion.div>

        {/* Open Roles */}
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className={styles.cardHeader}>
            <Briefcase size={16} className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>Open Roles</h2>
          </div>
          <div className={styles.rolesList}>
            {project.openRoles.map(role => (
              <div key={role} className={styles.roleItem}>
                <span className={styles.roleDot} />
                {role}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Project Status */}
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className={styles.cardHeader}>
            <Target size={16} className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>Project Status</h2>
          </div>
          <div className={styles.statusGrid}>
            {[
              ['Stage', project.stage],
              ['Industry', project.industry],
              ['Timeline', project.timeline],
              ['Your Application', STATUS_LABEL[status] || 'Not applied'],
            ].map(([label, value]) => (
              <div key={label} className={styles.statusRow}>
                <span className={styles.statusLabel}>{label}</span>
                <span className={styles.statusValue}>{value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* CTA Footer */}
      {status === 'none' && (
        <motion.div
          className={styles.ctaFooter}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div>
            <p className={styles.ctaTitle}>Interested in joining this project?</p>
            <p className={styles.ctaDesc}>You match {project.matchScore}% of the requirements. Apply now to collaborate!</p>
          </div>
          <motion.button
            className={styles.ctaBtn}
            onClick={handleJoin}
            whileTap={{ scale: 0.97 }}
          >
            <Plus size={16} /> Apply to Join
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default ProjectDetailsPage;
