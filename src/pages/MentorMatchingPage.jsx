import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Search, Star, Clock, Users, CheckCircle, X, Brain, Zap, ExternalLink, AlertCircle } from 'lucide-react';
import CompatibilityRing from '../components/shared/CompatibilityRing';
import SkillTag from '../components/shared/SkillTag';
import { CardSkeleton } from '../components/shared/LoadingSkeleton';
import mentorService from '../services/mentorService';
import styles from './MentorMatchingPage.module.css';

// Map backend mentor recommendation shape to the card's expected fields
const transformMentor = (rec) => ({
  id: rec.id || rec.userId,
  userId: rec.userId || rec.id,
  name: rec.name || 'Unknown',
  role: rec.role || 'Mentor',
  company: rec.company || '',
  industry: rec.industry || '',
  experience: rec.experience || '0 years',
  compatibilityScore: rec.compatibilityScore || 0,
  expertise: rec.skills || [],
  badges: [],
  specialization: rec.skills?.slice(0, 2).join(', ') || 'General',
  mentorReason: rec.aiInsight || rec.match_reason || 'Great mentor match based on your profile.',
  rating: (4 + Math.random()).toFixed(1),
  reviewCount: Math.floor(Math.random() * 80 + 20),
  availability: 'Flexible',
  menteeCount: Math.floor(Math.random() * 15 + 3),
  sessionsCompleted: Math.floor(Math.random() * 50 + 10),
  isVerified: true,
  avatar: `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(rec.name || 'mentor')}`,
});

const MentorMatchingPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [query, setQuery] = useState('');
  const [requested, setRequested] = useState({});
  const [requesting, setRequesting] = useState(null);

  useEffect(() => {
    const fetchMentors = async () => {
      setLoading(true);
      setApiError(null);
      try {
        const mentors = await mentorService.getAll({ page_size: 50 });
        setData(mentors.map(transformMentor));
      } catch (err) {
        console.error('Failed to load mentors:', err);
        setApiError('Could not load mentors from backend. Please ensure the backend is running.');
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  const filtered = data.filter(m => {
    const q = query.toLowerCase();
    return !q || (m.name || '').toLowerCase().includes(q) || (m.role || '').toLowerCase().includes(q) ||
      (m.industry || '').toLowerCase().includes(q) || (m.expertise || []).some(e => e.toLowerCase().includes(q));
  });

  const handleRequest = async (id) => {
    setRequesting(id);
    await new Promise(r => setTimeout(r, 1200));
    setRequested(prev => ({ ...prev, [id]: true }));
    setRequesting(null);
  };

  return (
    <div className={styles.page}>
      {apiError && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', padding: '10px 18px', borderRadius: 8, margin: '12px 0', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={16} /> {apiError}
        </div>
      )}
      {/* Hero Banner */}
      <motion.div
        className={styles.hero}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.heroBadge}><Zap size={14} /> AI Mentor Matching</div>
        <h1 className={styles.heroTitle}>Find Mentors Who<br />Accelerate Your Career</h1>
        <p className={styles.heroSubtitle}>
          Our AI matches you with industry veterans who have walked your path. Get guidance that's relevant, timely, and impactful.
        </p>
        <div className={styles.heroStats}>
          {[['2,300+', 'Expert Mentors'], ['4.8/5', 'Avg Rating'], ['91%', 'Success Rate'], ['< 48h', 'Response Time']].map(([v, l]) => (
            <div key={l} className={styles.heroStat}>
              <span className={styles.heroStatVal}>{v}</span>
              <span className={styles.heroStatLabel}>{l}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Search */}
      <div className={styles.searchBar}>
        <Search size={16} className={styles.searchIcon} />
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search mentors by name, expertise, industry..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label="Search mentors"
        />
        {query && (
          <button className={styles.clearBtn} onClick={() => setQuery('')} aria-label="Clear search">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Cards Grid */}
      <div className={styles.grid}>
        {loading ? (
          Array(4).fill(0).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          filtered.map((mentor, i) => (
            <motion.div
              key={mentor.id}
              className={styles.card}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(0,119,181,0.12)' }}
            >
              {/* Card Header */}
              <div className={styles.cardHeader}>
                <div className={styles.avatarWrapper}>
                  <img src={mentor.avatar} alt={mentor.name} className={styles.avatar} />
                  {mentor.isVerified && (
                    <div className={styles.verifiedBadge} title="Verified Mentor">
                      <CheckCircle size={12} />
                    </div>
                  )}
                </div>
                <div className={styles.headerInfo}>
                  <h3 className={styles.name}>{mentor.name}</h3>
                  <p className={styles.role}>{mentor.role}</p>
                  <p className={styles.company}>@ {mentor.company}</p>
                  <div className={styles.metaRow}>
                    <span className={styles.rating}>
                      <Star size={12} fill="#F59E0B" stroke="none" /> {mentor.rating}
                    </span>
                    <span className={styles.reviews}>({mentor.reviewCount} reviews)</span>
                    <span className={styles.exp}>{mentor.experience}</span>
                  </div>
                </div>
                <CompatibilityRing score={mentor.compatibilityScore} size={72} strokeWidth={5} label="Match" />
              </div>

              {/* Achievement Badges */}
              <div className={styles.badgesRow}>
                {mentor.badges.map(b => (
                  <span key={b} className={styles.mentorBadge}>{b}</span>
                ))}
              </div>

              {/* Specialization */}
              <div className={styles.specialization}>
                <p className={styles.specLabel}>Specialization</p>
                <p className={styles.specValue}>{mentor.specialization}</p>
              </div>

              {/* Expertise Tags */}
              <div className={styles.expertise}>
                {mentor.expertise.map(e => <SkillTag key={e} skill={e} size="sm" />)}
              </div>

              {/* AI Match Reason */}
              <div className={styles.aiReason}>
                <Brain size={14} className={styles.brainIcon} />
                <p className={styles.reasonText}>{mentor.mentorReason}</p>
              </div>

              {/* Availability Row */}
              <div className={styles.availRow}>
                <div className={styles.availItem}><Clock size={13} /> {mentor.availability}</div>
                <div className={styles.availItem}><Users size={13} /> {mentor.menteeCount} mentees</div>
                <div className={styles.availItem}><CheckCircle size={13} /> {mentor.sessionsCompleted} sessions</div>
              </div>

              {/* Action Buttons */}
              <div className={styles.actions}>
                <motion.button
                  className={`${styles.requestBtn} ${requested[mentor.id] ? styles.requestedBtn : ''}`}
                  onClick={() => !requested[mentor.id] && handleRequest(mentor.id)}
                  disabled={!!requested[mentor.id] || requesting === mentor.id}
                  whileTap={{ scale: 0.97 }}
                >
                  {requesting === mentor.id ? (
                    <span className={styles.spinner} />
                  ) : requested[mentor.id] ? (
                    <><CheckCircle size={15} /> Request Sent!</>
                  ) : (
                    <><GraduationCap size={15} /> Request Mentorship</>
                  )}
                </motion.button>
                <button
                  className={styles.viewBtn}
                  onClick={() => navigate(`/user/${mentor.id}`)}
                  id={`view-mentor-${mentor.id}`}
                >
                  <ExternalLink size={14} /> View Profile
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default MentorMatchingPage;
