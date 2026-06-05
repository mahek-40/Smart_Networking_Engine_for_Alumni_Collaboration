import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Search, Brain, Users, ChevronDown, X, ExternalLink, Clock, CheckCircle } from 'lucide-react';
import CompatibilityRing from '../components/shared/CompatibilityRing';
import SkillTag from '../components/shared/SkillTag';
import { CardSkeleton } from '../components/shared/LoadingSkeleton';
import { useNetwork } from '../contexts/NetworkContext';
import recommendationService from '../services/recommendationService';
import styles from './RecommendationsPage.module.css';

const INDUSTRIES = ['All', 'Technology', 'AI Research', 'E-commerce', 'Artificial Intelligence'];

const RecommendationsPage = () => {
  const navigate = useNavigate();
  const { getStatus, sendRequest } = useNetwork();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [industry, setIndustry] = useState('All');
  const [minScore, setMinScore] = useState(0);
  const [expandedId, setExpandedId] = useState(null);

  const loadRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {
        industry: industry !== 'All' ? industry : null,
        minScore: minScore || 0,
      };
      const recommendations = await recommendationService.getAll(filters);
      setData(recommendations);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [industry, minScore]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRecommendations();
  }, [loadRecommendations]);

  const filtered = data.filter(r => {
    const q = query.toLowerCase();
    const matchesQuery = !q || r.name.toLowerCase().includes(q) || r.role.toLowerCase().includes(q) ||
      r.industry.toLowerCase().includes(q) || r.skills.some(s => s.toLowerCase().includes(q));
    return matchesQuery;
  });

  const handleConnect = async (userId) => {
    if (getStatus(userId) === 'none') {
      try {
        await sendRequest(userId);
      } catch (error) {
        console.error('Failed to send connection request:', error);
      }
    }
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <div className={styles.titleIcon}><Sparkles size={20} /></div>
            <h1 className={styles.title}>AI Recommendations</h1>
            <span className={styles.badge}>AI Powered</span>
          </div>
          <p className={styles.subtitle}>
            Personalized alumni matches based on your skills, interests, and career goals
          </p>
        </div>
        <div className={styles.headerStats}>
          <div className={styles.headerStat}>
            <span className={styles.statNum}>{data.length}</span>
            <span className={styles.statLabel}>Total Matches</span>
          </div>
          <div className={styles.headerStat}>
            <span className={styles.statNum}>87%</span>
            <span className={styles.statLabel}>Avg Accuracy</span>
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search by name, role, skill, or industry..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Search recommendations"
          />
          {query && <button className={styles.clearBtn} onClick={() => setQuery('')}><X size={14} /></button>}
        </div>
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Industry</label>
            <select className={styles.filterSelect} value={industry} onChange={e => setIndustry(e.target.value)}>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Min Score</label>
            <select className={styles.filterSelect} value={minScore} onChange={e => setMinScore(+e.target.value)}>
              {[0, 70, 80, 85, 90].map(v => <option key={v} value={v}>{v > 0 ? `${v}%+` : 'Any'}</option>)}
            </select>
          </div>
          <button className={styles.resetBtn} onClick={() => { setQuery(''); setIndustry('All'); setMinScore(0); loadRecommendations(); }}>
            Reset Filters
          </button>
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <p className={styles.resultsCount}>
          Showing <strong>{filtered.length}</strong> of {data.length} recommendations
        </p>
      )}

      {/* Grid */}
      <div className={styles.grid}>
        {loading ? (
          Array(3).fill(0).map((_, i) => <CardSkeleton key={i} />)
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <Sparkles size={40} />
            <p>No matches found. Try adjusting your filters.</p>
          </div>
        ) : (
          filtered.map((rec, i) => (
            <motion.div
              key={rec.id}
              className={styles.card}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              layout
            >
              <div className={styles.cardTop}>
                <img src={rec.avatar} alt={rec.name} className={styles.avatar} />
                <div className={styles.info}>
                  <div className={styles.nameRow}>
                    <h3 className={styles.name}>{rec.name}</h3>
                    {rec.isConnected && <span className={styles.connectedBadge}>Connected</span>}
                    {getStatus(rec.userId) === 'pending' && !rec.isConnected && <span className={styles.pendingBadge}>Request Sent</span>}
                  </div>
                  <p className={styles.role}>{rec.role}</p>
                  <p className={styles.company}>@ {rec.company} &bull; {rec.industry}</p>
                  <p className={styles.exp}>{rec.experience} experience</p>
                </div>
                <CompatibilityRing score={rec.compatibilityScore} size={80} strokeWidth={6} />
              </div>

              <div className={styles.skills}>
                {rec.skills.slice(0, 4).map(s => <SkillTag key={s} skill={s} size="sm" />)}
                {rec.skills.length > 4 && <SkillTag skill={`+${rec.skills.length - 4}`} variant="gray" size="sm" />}
              </div>

              <div className={styles.sharedSection}>
                <p className={styles.sharedLabel}>Shared with you:</p>
                <div className={styles.sharedChips}>
                  {rec.sharedSkills.map(s => <span key={s} className={styles.sharedChip}>{s}</span>)}
                  {rec.sharedInterests.map(s => <span key={s} className={`${styles.sharedChip} ${styles.interestChip}`}>{s}</span>)}
                </div>
              </div>

              <div className={styles.aiInsight}>
                <Brain size={14} className={styles.brainIcon} />
                <p className={styles.insightText}>{rec.aiInsight}</p>
              </div>

              {/* Reasons accordion */}
              <button
                className={styles.reasonsToggle}
                onClick={() => setExpandedId(expandedId === rec.id ? null : rec.id)}
                aria-expanded={expandedId === rec.id}
              >
                <span>Why this match?</span>
                <ChevronDown size={14} className={expandedId === rec.id ? styles.chevronOpen : ''} />
              </button>

              <AnimatePresence>
                {expandedId === rec.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <ul className={styles.reasons}>
                      {rec.matchReasons.map((r, ri) => (
                        <li key={ri} className={styles.reason}>
                          <span className={styles.checkDot} />{r}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={styles.cardActions}>
                {(() => {
                  const status = getStatus(rec.userId);
                  if (status === 'none' && !rec.isConnected) {
                    return (
                      <motion.button
                        className={styles.connectBtn}
                        onClick={() => handleConnect(rec.userId)}
                        whileTap={{ scale: 0.97 }}
                        id={`connect-rec-${rec.id}`}
                      >
                        <Users size={15} /> Connect
                      </motion.button>
                    );
                  } else if (status === 'pending') {
                    return (
                      <button className={styles.pendingBtn} disabled>
                        <Clock size={15} /> Pending
                      </button>
                    );
                  } else {
                    return (
                      <button className={styles.connectedBtn} disabled>
                        <CheckCircle size={15} /> {rec.isConnected ? 'Connected' : 'Request Sent'}
                      </button>
                    );
                  }
                })()}
                <button
                  className={styles.profileBtn}
                  onClick={() => navigate(`/user/${rec.userId}`)}
                  id={`view-profile-rec-${rec.id}`}
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

export default RecommendationsPage;
