import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, Briefcase, GraduationCap, Calendar, Globe,
  CheckCircle, Users, Eye, Star, MessageSquare, UserPlus,
  Award, Heart, TrendingUp, ExternalLink, Clock,
} from 'lucide-react';
import { useNetwork } from '../contexts/NetworkContext';
import CompatibilityRing from '../components/shared/CompatibilityRing';
import SkillTag from '../components/shared/SkillTag';
import allUsers from '../data/users.json';
import allMentors from '../data/mentors.json';
import allRecommendations from '../data/recommendations.json';
import styles from './UserProfilePage.module.css';



const STATUS_CLASSES = {
  none: 'connectBtn',
  pending: 'pendingBtn',
  accepted: 'acceptedBtn',
  rejected: 'rejectedBtn',
};

const UserProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getStatus, sendRequest } = useNetwork();

  // Find user from any source: users.json, mentors.json, or recommendations.json
  const fromUsers = allUsers.find(u => u.id === id);
  const fromMentors = allMentors.find(m => m.id === id);
  const fromRecs = allRecommendations.find(r => r.userId === id);

  // Build a unified profile object
  const profile = fromUsers
    ? fromUsers
    : fromMentors
    ? {
        id: fromMentors.id,
        name: fromMentors.name,
        avatar: fromMentors.avatar,
        role: fromMentors.role,
        company: fromMentors.company,
        industry: fromMentors.industry,
        location: fromMentors.location,
        experience: fromMentors.experience,
        skills: fromMentors.expertise || [],
        interests: fromMentors.tags || [],
        bio: fromMentors.bio,
        careerGoals: fromMentors.mentorReason,
        compatibilityScore: fromMentors.compatibilityScore,
        connections: fromMentors.menteeCount ? fromMentors.menteeCount * 12 : 120,
        profileViews: fromMentors.sessionsCompleted ? fromMentors.sessionsCompleted * 4 : 200,
        linkedin: fromMentors.linkedin,
        isVerified: fromMentors.isVerified,
        university: '',
        degree: '',
        graduationYear: null,
        lookingFor: ['Mentoring', 'Networking'],
        tags: fromMentors.tags || [],
      }
    : fromRecs
    ? {
        id: fromRecs.userId,
        name: fromRecs.name,
        avatar: fromRecs.avatar,
        role: fromRecs.role,
        company: fromRecs.company,
        industry: fromRecs.industry,
        experience: fromRecs.experience,
        skills: fromRecs.skills || [],
        interests: fromRecs.interests || [],
        bio: fromRecs.aiInsight || '',
        compatibilityScore: fromRecs.compatibilityScore,
        connections: fromRecs.mutualConnections ? fromRecs.mutualConnections * 15 : 100,
        profileViews: 200,
        lookingFor: [],
        tags: [],
        isVerified: false,
      }
    : null;

  const status = profile ? getStatus(profile.id) : 'none';

  if (!profile) {
    return (
      <div className={styles.notFound}>
        <div className={styles.notFoundIcon}>🔍</div>
        <h1>Profile Not Found</h1>
        <p>We couldn't find the profile you're looking for.</p>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  const handleConnect = () => {
    if (status === 'none') {
      sendRequest(profile.id);
    }
  };

  return (
    <div className={styles.page}>
      {/* Back Navigation */}
      <button className={styles.backNav} onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* Hero */}
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
              <img
                src={profile.avatar || `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(profile.name)}`}
                alt={profile.name}
                className={styles.avatar}
              />
              {profile.isVerified && (
                <div className={styles.verifiedBadge} title="Verified Alumni">
                  <CheckCircle size={14} />
                </div>
              )}
            </div>
            <div className={styles.heroInfo}>
              <div className={styles.nameRow}>
                <h1 className={styles.name}>{profile.name}</h1>
                <div className={styles.tagsList}>
                  {(profile.tags || []).map(t => (
                    <span key={t} className={styles.tag}>{t}</span>
                  ))}
                </div>
              </div>
              <p className={styles.role}>{profile.role}</p>
              <p className={styles.company}>
                <Briefcase size={14} /> {profile.company}
              </p>
              <div className={styles.metaRow}>
                {profile.location && (
                  <span className={styles.metaItem}><MapPin size={13} /> {profile.location}</span>
                )}
                {profile.university && (
                  <span className={styles.metaItem}><GraduationCap size={13} /> {profile.university}</span>
                )}
                {profile.graduationYear && (
                  <span className={styles.metaItem}><Calendar size={13} /> Class of {profile.graduationYear}</span>
                )}
                {profile.linkedin && (
                  <span className={styles.metaItem}>
                    <Globe size={13} />
                    <a href={`https://${profile.linkedin}`} target="_blank" rel="noopener noreferrer">LinkedIn</a>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.heroRight}>
            {profile.compatibilityScore && (
              <CompatibilityRing
                score={profile.compatibilityScore}
                size={90}
                strokeWidth={6}
                label="Match"
              />
            )}
            <div className={styles.heroActions}>
              <motion.button
                className={`${styles.connectBtn} ${styles[STATUS_CLASSES[status] || 'connectBtn']}`}
                onClick={handleConnect}
                disabled={status !== 'none'}
                whileTap={status === 'none' ? { scale: 0.97 } : {}}
                id={`connect-btn-${profile.id}`}
              >
                {status === 'accepted' ? (
                  <><CheckCircle size={15} /> Connected</>
                ) : status === 'pending' ? (
                  <><Clock size={15} /> Pending</>
                ) : (
                  <><UserPlus size={15} /> Connect</>
                )}
              </motion.button>
              <button className={styles.messageBtn}>
                <MessageSquare size={15} /> Message
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className={styles.statsGrid}>
        {[
          { label: 'Connections', value: profile.connections || 0, icon: <Users size={18} /> },
          { label: 'Profile Views', value: profile.profileViews || 0, icon: <Eye size={18} /> },
          { label: 'Match Score', value: `${profile.compatibilityScore || 0}%`, icon: <Star size={18} /> },
          { label: 'Experience', value: profile.experience || 'N/A', icon: <Briefcase size={18} /> },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className={styles.statCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1 }}
          >
            <div className={styles.statIcon}>{stat.icon}</div>
            <div>
              <p className={styles.statValue}>{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</p>
              <p className={styles.statLabel}>{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Content Grid */}
      <div className={styles.contentGrid}>
        {/* About */}
        {profile.bio && (
          <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className={styles.cardHeader}>
              <Heart size={16} className={styles.cardIcon} />
              <h2 className={styles.cardTitle}>About</h2>
            </div>
            <p className={styles.bio}>{profile.bio}</p>
          </motion.div>
        )}

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className={styles.cardHeader}>
              <TrendingUp size={16} className={styles.cardIcon} />
              <h2 className={styles.cardTitle}>Skills</h2>
            </div>
            <div className={styles.skillsGrid}>
              {profile.skills.map(skill => (
                <SkillTag key={skill} skill={skill} size="md" />
              ))}
            </div>
          </motion.div>
        )}

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className={styles.cardHeader}>
              <Heart size={16} className={styles.cardIcon} />
              <h2 className={styles.cardTitle}>Interests</h2>
            </div>
            <div className={styles.interestChips}>
              {profile.interests.map(interest => (
                <span key={interest} className={styles.interestChip}>{interest}</span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Education */}
        {(profile.university || profile.degree) && (
          <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <div className={styles.cardHeader}>
              <Award size={16} className={styles.cardIcon} />
              <h2 className={styles.cardTitle}>Education</h2>
            </div>
            <div className={styles.eduInfo}>
              {profile.degree && (
                <p className={styles.eduDegree}>
                  {[profile.degree, profile.branch].filter(Boolean).join(' – ')}
                </p>
              )}
              {profile.university && (
                <p className={styles.eduUniv}>{profile.university}</p>
              )}
              {profile.graduationYear && (
                <p className={styles.eduYear}>Class of {profile.graduationYear}</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Looking For */}
        {profile.lookingFor && profile.lookingFor.length > 0 && (
          <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className={styles.cardHeader}>
              <ExternalLink size={16} className={styles.cardIcon} />
              <h2 className={styles.cardTitle}>Looking For</h2>
            </div>
            <div className={styles.lookingChips}>
              {profile.lookingFor.map(item => (
                <span key={item} className={styles.lookingChip}>{item}</span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Industry */}
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <div className={styles.cardHeader}>
            <Briefcase size={16} className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>Industry</h2>
          </div>
          <p className={styles.industryValue}>{profile.industry || 'Technology'}</p>
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfilePage;
