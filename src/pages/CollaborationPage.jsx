import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Network, Brain, Zap, Users, TrendingUp, CheckCircle,
  Clock, Star, ChevronRight, Target, Sparkles, Plus, X, UserPlus
} from 'lucide-react';
import CompatibilityRing from '../components/shared/CompatibilityRing';
import SkillTag from '../components/shared/SkillTag';
import StatCard from '../components/shared/StatCard';
import { CardSkeleton } from '../components/shared/LoadingSkeleton';
import { useProject } from '../contexts/ProjectContext';
import collaborationData from '../data/collaborations.json';
import styles from './CollaborationPage.module.css';

const STAGE_COLORS = {
  'In Development': { bg: '#DBEAFE', text: '#1D4ED8' },
  'Planning': { bg: '#FEF3C7', text: '#92400E' },
  'MVP Ready': { bg: '#D1FAE5', text: '#065F46' },
  'Open Source': { bg: '#EDE9FE', text: '#5B21B6' },
  'Alpha Testing': { bg: '#FEE2E2', text: '#991B1B' },
  'Research Phase': { bg: '#F0FDF4', text: '#14532D' },
};

const CollaborationPage = () => {
  const navigate = useNavigate();
  const { getProjectStatus, applyToProject } = useProject();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [applying, setApplying] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showScoreModal, setShowScoreModal] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setProjects(collaborationData.activeProjects);
      setPredictions(collaborationData.predictionScores);
      setLoading(false);
    }, 800);
  }, []);

  const handleApply = async (projectId) => {
    if (getProjectStatus(projectId) !== 'none') return;
    setApplying(projectId);
    await new Promise(r => setTimeout(r, 1200));
    applyToProject(projectId);
    setApplying(null);
  };

  const handlePredictScore = (user) => {
    setSelectedUser(user);
    setShowScoreModal(true);
  };

  const { networkStats } = collaborationData;

  return (
    <div className={styles.page}>
      {/* Hero */}
      <motion.div
        className={styles.hero}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.heroBg} aria-hidden="true" />
        <div className={styles.heroLeft}>
          <div className={styles.heroBadge}><Zap size={13} /> AI Collaboration Engine</div>
          <h1 className={styles.heroTitle}>
            Predict Your Best<br />
            <span className={styles.heroHighlight}>Collaboration Partners</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Our AI analyzes skill overlap, career trajectories, and collaboration histories
            to predict your highest-potential partnerships.
          </p>
        </div>
        <div className={styles.heroRight}>
          {/* SVG Network Diagram */}
          <svg className={styles.networkSvg} viewBox="0 0 240 200" aria-hidden="true">
            <defs>
              <radialGradient id="nodeGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0077B5" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#004170" stopOpacity="0.7" />
              </radialGradient>
            </defs>
            {/* Connection lines */}
            {[[120,100,60,50],[120,100,180,50],[120,100,40,140],[120,100,200,140],[120,100,120,180]].map(([x1,y1,x2,y2], i) => (
              <motion.line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="rgba(0,119,181,0.3)" strokeWidth="1.5" strokeDasharray="4 4"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.6 }}
              />
            ))}
            {/* Satellite nodes */}
            {[[60,50],[180,50],[40,140],[200,140],[120,180]].map(([cx,cy], i) => (
              <motion.circle key={i} cx={cx} cy={cy} r={16}
                fill="rgba(0,119,181,0.12)" stroke="rgba(0,119,181,0.35)" strokeWidth="1.5"
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1, type: 'spring' }}
              />
            ))}
            {/* Center node */}
            <motion.circle cx={120} cy={100} r={28}
              fill="url(#nodeGrad)" opacity={0.9}
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            />
            <text x={120} y={104} textAnchor="middle" fill="white" fontSize={11} fontWeight="600">You</text>
            {/* Pulse ring */}
            <motion.circle cx={120} cy={100} r={36}
              fill="none" stroke="rgba(0,119,181,0.25)" strokeWidth="1"
              animate={{ r: [36, 46, 36], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </svg>
        </div>
      </motion.div>

      {/* KPI Stats */}
      <div className={styles.statsGrid}>
        {[
          { title: 'Potential Collaborations', value: String(networkStats.potentialCollaborations), icon: <Network size={18} />, growth: 22.1, growthLabel: 'this month', color: '#0077B5' },
          { title: 'Active Requests', value: String(networkStats.activeRequests), icon: <Users size={18} />, growth: 14.3, growthLabel: 'this week', color: '#059669' },
          { title: 'Success Rate', value: `${networkStats.successRate}%`, icon: <TrendingUp size={18} />, growth: 8.7, growthLabel: 'vs last quarter', color: '#8B5CF6' },
          { title: 'Avg Response Time', value: networkStats.avgResponseTime, icon: <Clock size={18} />, color: '#F59E0B' },
        ].map((card, i) => <StatCard key={card.title} {...card} index={i} />)}
      </div>

      {/* AI Prediction Scores */}
      <motion.section
        className={styles.section}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <Brain size={18} className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>AI Collaboration Predictions</h2>
            <span className={styles.sectionBadge}>Real-time</span>
          </div>
          <p className={styles.sectionSubtitle}>Based on your skills, projects, and career trajectory</p>
        </div>
        <div className={styles.predGrid}>
          {loading ? (
            Array(3).fill(0).map((_, i) => <CardSkeleton key={i} />)
          ) : (
            predictions.map((pred, i) => (
              <motion.div
                key={pred.userId}
                className={styles.predCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className={styles.predCardTop}>
                  <img src={pred.avatar} alt={pred.name} className={styles.predAvatar} />
                  <div className={styles.predInfo}>
                    <h3 className={styles.predName}>{pred.name}</h3>
                    <p className={styles.predReason}>
                      <Brain size={11} style={{ color: '#0077B5', flexShrink: 0 }} />
                      {pred.reason}
                    </p>
                  </div>
                  <CompatibilityRing score={pred.score} size={68} strokeWidth={5} label="Collab" />
                </div>
                <motion.button
                  className={styles.predictBtn}
                  onClick={() => handlePredictScore(pred)}
                  whileTap={{ scale: 0.97 }}
                  id={`predict-btn-${pred.userId}`}
                >
                  <Sparkles size={14} /> Predict Collaboration
                </motion.button>
              </motion.div>
            ))
          )}
        </div>
      </motion.section>

      {/* Active Projects */}
      <motion.section
        className={styles.section}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <Target size={18} className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>Open Collaboration Projects</h2>
          </div>
          <p className={styles.sectionSubtitle}>Join active projects from your network</p>
        </div>
        <div className={styles.projectsGrid}>
          {loading ? (
            Array(4).fill(0).map((_, i) => <CardSkeleton key={i} />)
          ) : (
            projects.map((project, i) => {
              const stageStyle = STAGE_COLORS[project.stage] || { bg: '#F1F5F9', text: '#475569' };
              const fillPct = (project.collaborators / project.maxCollaborators) * 100;
              return (
                <motion.div
                  key={project.id}
                  className={styles.projectCard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(0,119,181,0.12)' }}
                >
                  <div className={styles.projectCardHeader}>
                    <div className={styles.projectMeta}>
                      <span
                        className={styles.stageBadge}
                        style={{ background: stageStyle.bg, color: stageStyle.text }}
                      >
                        {project.stage}
                      </span>
                      <span className={styles.industryBadge}>{project.industry}</span>
                    </div>
                    <div className={styles.matchScore}>
                      <Star size={12} fill="#F59E0B" stroke="none" />
                      <span>{project.matchScore}% match</span>
                    </div>
                  </div>

                  <h3 className={styles.projectTitle}>{project.title}</h3>
                  <p className={styles.projectDesc}>{project.description}</p>

                  <div className={styles.ownerRow}>
                    <img src={project.ownerAvatar} alt={project.owner} className={styles.ownerAvatar} />
                    <span className={styles.ownerName}>{project.owner}</span>
                    <span className={styles.timeline}><Clock size={11} /> {project.timeline}</span>
                  </div>

                  <div className={styles.skillsRow}>
                    {project.skills.map(s => <SkillTag key={s} skill={s} size="sm" />)}
                  </div>

                  <div className={styles.teamProgress}>
                    <div className={styles.teamProgressHeader}>
                      <span className={styles.teamLabel}>
                        <Users size={12} /> {project.collaborators} / {project.maxCollaborators} collaborators
                      </span>
                      <span className={styles.teamPct}>{Math.round(fillPct)}%</span>
                    </div>
                    <div className={styles.progressTrack}>
                      <motion.div
                        className={styles.progressFill}
                        initial={{ width: 0 }}
                        animate={{ width: `${fillPct}%` }}
                        transition={{ duration: 0.8, delay: 0.6 + i * 0.05 }}
                      />
                    </div>
                  </div>

                  <div className={styles.openRoles}>
                    <span className={styles.rolesLabel}>Open roles:</span>
                    {project.openRoles.map(r => (
                      <span key={r} className={styles.roleChip}>{r}</span>
                    ))}
                  </div>

                  <div className={styles.projectActions}>
                    <motion.button
                      className={`${styles.joinBtn} ${getProjectStatus(project.id) !== 'none' ? styles.joinedBtn : ''}`}
                      onClick={() => handleApply(project.id)}
                      disabled={getProjectStatus(project.id) !== 'none' || applying === project.id}
                      whileTap={{ scale: 0.97 }}
                      id={`join-project-${project.id}`}
                    >
                      {applying === project.id ? (
                        <span className={styles.spinner} />
                      ) : getProjectStatus(project.id) !== 'none' ? (
                        <><CheckCircle size={14} /> Applied!</>
                      ) : (
                        <><Plus size={14} /> Join Project</>
                      )}
                    </motion.button>
                    <button
                      className={styles.viewBtn}
                      onClick={() => navigate(`/projects/${project.id}`)}
                      id={`details-project-${project.id}`}
                    >
                      <ChevronRight size={14} /> Details
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.section>

      {/* Prediction Score Modal */}
      <AnimatePresence>
        {showScoreModal && selectedUser && (
          <>
            <motion.div
              className={styles.overlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowScoreModal(false)}
            />
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              transition={{ type: 'spring', duration: 0.4 }}
              role="dialog"
              aria-label="Collaboration Prediction"
            >
              <div className={styles.modalHeader}>
                <div className={styles.modalTitleRow}>
                  <Brain size={20} className={styles.modalBrainIcon} />
                  <h2 className={styles.modalTitle}>AI Collaboration Prediction</h2>
                </div>
                <button className={styles.modalClose} onClick={() => setShowScoreModal(false)}>
                  <X size={16} />
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.modalProfile}>
                  <img src={selectedUser.avatar} alt={selectedUser.name} className={styles.modalAvatar} />
                  <div>
                    <h3 className={styles.modalName}>{selectedUser.name}</h3>
                  </div>
                </div>
                <div className={styles.modalScore}>
                  <CompatibilityRing score={selectedUser.score} size={120} strokeWidth={8} label="Collaboration" />
                </div>
                <div className={styles.modalReason}>
                  <Brain size={14} style={{ color: '#0077B5', flexShrink: 0 }} />
                  <p>{selectedUser.reason}</p>
                </div>
                <div className={styles.modalFactors}>
                  {['Skill Complementarity', 'Career Alignment', 'Network Proximity', 'Project History'].map((factor, i) => (
                    <div key={factor} className={styles.factorRow}>
                      <span className={styles.factorLabel}>{factor}</span>
                      <div className={styles.factorBar}>
                        <motion.div
                          className={styles.factorFill}
                          initial={{ width: 0 }}
                          animate={{ width: `${[88, 76, 92, 65][i]}%` }}
                          transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
                        />
                      </div>
                      <span className={styles.factorPct}>{[88, 76, 92, 65][i]}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.modalActions}>
                <button className={styles.cancelBtn} onClick={() => setShowScoreModal(false)}>Close</button>
                <motion.button className={styles.connectBtn} whileTap={{ scale: 0.97 }}>
                  <UserPlus size={14} /> Request Collaboration
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollaborationPage;
