import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, Brain, Users, MapPin, Briefcase,
  GraduationCap, Star, CheckCircle, Zap, SlidersHorizontal
} from 'lucide-react';
import CompatibilityRing from '../components/shared/CompatibilityRing';
import SkillTag from '../components/shared/SkillTag';
import EmptyState from '../components/shared/EmptyState';
import { CardSkeleton } from '../components/shared/LoadingSkeleton';
import profileService from '../services/profileService';
import { transformProfile } from '../utils/transformers';
import styles from './SmartSearchPage.module.css';

const ALL_INDUSTRIES = ['All', 'Technology', 'E-commerce', 'AI Research', 'Artificial Intelligence', 'Web3 / Fintech', 'IT Services'];
const ALL_EXPERIENCES = ['All', '1-3 years', '3-5 years', '5+ years', '8+ years'];
const ALL_SKILLS = ['Python', 'React', 'Machine Learning', 'Docker', 'AWS', 'Data Science', 'Figma', 'Kubernetes', 'TensorFlow'];
const SORT_OPTIONS = ['Relevance', 'Match Score', 'Connections', 'Newest'];

const TRENDING_SEARCHES = ['AI Research', 'Product Manager at Google', 'React Developer', 'Data Scientist', 'Startup Founder'];

const SmartSearchPage = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [industry, setIndustry] = useState('All');
  const [experience, setExperience] = useState('All');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [sortBy, setSortBy] = useState('Relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [connected, setConnected] = useState({});
  const [hasSearched, setHasSearched] = useState(false);
  const [locationFilter, setLocationFilter] = useState('');

  // Fetch all profiles from backend once on mount
  const fetchProfiles = useCallback(async () => {
    setApiLoading(true);
    setApiError(null);
    try {
      const data = await profileService.searchProfiles({ page: 1, page_size: 100 });
      const profiles = Array.isArray(data) ? data : [];
      setAllUsers(profiles.map(transformProfile));
    } catch (err) {
      console.error('Failed to load profiles from backend:', err);
      setApiError('Could not load profiles from backend. Showing empty results.');
      setAllUsers([]);
    } finally {
      setApiLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // Read query from URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) { setQuery(q); setDebouncedQuery(q); setHasSearched(true); }
  }, []);

  // Debounce search
  useEffect(() => {
    if (!query && !hasSearched) return;
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setHasSearched(true);
      setLoading(false);
    }, 350);
    setLoading(true);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const filtered = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim();
    let results = allUsers.filter(u => u.id !== 'current');

    if (q) {
      results = results.filter(u =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.role || '').toLowerCase().includes(q) ||
        (u.company || '').toLowerCase().includes(q) ||
        (u.industry || '').toLowerCase().includes(q) ||
        (u.skills || []).some(s => s.toLowerCase().includes(q)) ||
        (u.bio || '').toLowerCase().includes(q)
      );
    }
    if (industry !== 'All') {
      results = results.filter(u => (u.industry || '').toLowerCase().includes(industry.toLowerCase()));
    }
    if (experience !== 'All') {
      results = results.filter(u => {
        const yrs = parseInt(u.experience);
        if (experience === '1-3 years') return yrs >= 1 && yrs <= 3;
        if (experience === '3-5 years') return yrs >= 3 && yrs <= 5;
        if (experience === '5+ years') return yrs >= 5;
        if (experience === '8+ years') return yrs >= 8;
        return true;
      });
    }
    if (selectedSkills.length > 0) {
      results = results.filter(u => selectedSkills.some(s => (u.skills || []).includes(s)));
    }
    if (locationFilter.trim()) {
      results = results.filter(u => (u.location || '').toLowerCase().includes(locationFilter.toLowerCase()));
    }

    // Sort
    if (sortBy === 'Match Score') results = [...results].sort((a, b) => (b.compatibilityScore || 0) - (a.compatibilityScore || 0));
    else if (sortBy === 'Connections') results = [...results].sort((a, b) => (b.connections || 0) - (a.connections || 0));

    return results;
  }, [debouncedQuery, industry, experience, selectedSkills, sortBy, locationFilter, allUsers]);

  const hasActiveFilters = industry !== 'All' || experience !== 'All' || selectedSkills.length > 0 || locationFilter;

  const handleReset = () => {
    setIndustry('All');
    setExperience('All');
    setSelectedSkills([]);
    setLocationFilter('');
    setSortBy('Relevance');
  };

  const handleTrendingClick = (term) => {
    setQuery(term);
    setHasSearched(true);
  };

  return (
    <div className={styles.page}>
      {/* API-level error banner */}
      {apiError && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', padding: '10px 18px', borderRadius: 8, margin: '12px 0', fontSize: 14 }}>
          ⚠️ {apiError}
        </div>
      )}
      {/* Search Hero */}
      <motion.div
        className={styles.hero}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.heroBg} aria-hidden="true" />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}><Brain size={13} /> AI-Enhanced Search</div>
          <h1 className={styles.heroTitle}>Find Your Perfect<br /><span className={styles.heroHighlight}>Alumni Connection</span></h1>
          <p className={styles.heroSubtitle}>Search across 9,450+ alumni by name, role, skills, company, or industry</p>

          {/* Main Search Bar */}
          <div className={styles.searchContainer}>
            <div className={styles.searchBar}>
              <Search size={18} className={styles.searchIcon} />
              <input
                id="smart-search-input"
                type="search"
                className={styles.searchInput}
                placeholder="Search alumni by name, role, skill, company…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoComplete="off"
                aria-label="Search alumni"
              />
              {query && (
                <button
                  className={styles.clearBtn}
                  onClick={() => { setQuery(''); setDebouncedQuery(''); setHasSearched(false); }}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
              <button
                className={styles.filterToggle}
                onClick={() => setShowFilters(p => !p)}
                aria-expanded={showFilters}
                aria-label="Toggle filters"
                id="filter-toggle-btn"
              >
                <SlidersHorizontal size={15} />
                Filters
                {hasActiveFilters && <span className={styles.filterDot} />}
              </button>
            </div>
          </div>

          {/* Trending Searches */}
          {!hasSearched && (
            <div className={styles.trending}>
              <span className={styles.trendingLabel}><Zap size={12} /> Trending:</span>
              {TRENDING_SEARCHES.map(term => (
                <button key={term} className={styles.trendChip} onClick={() => handleTrendingClick(term)}>
                  {term}
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            className={styles.filtersPanel}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.filtersPanelContent}>
              <div className={styles.filtersRow}>
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel} htmlFor="industry-filter">Industry</label>
                  <select id="industry-filter" className={styles.filterSelect} value={industry} onChange={e => setIndustry(e.target.value)}>
                    {ALL_INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel} htmlFor="experience-filter">Experience</label>
                  <select id="experience-filter" className={styles.filterSelect} value={experience} onChange={e => setExperience(e.target.value)}>
                    {ALL_EXPERIENCES.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel} htmlFor="location-filter">Location</label>
                  <input
                    id="location-filter"
                    type="text"
                    className={styles.filterInput}
                    placeholder="e.g. Bengaluru, Remote"
                    value={locationFilter}
                    onChange={e => setLocationFilter(e.target.value)}
                  />
                </div>
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel} htmlFor="sort-filter">Sort By</label>
                  <select id="sort-filter" className={styles.filterSelect} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    {SORT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className={styles.skillsFilter}>
                <label className={styles.filterLabel}>Filter by Skill</label>
                <div className={styles.skillChips}>
                  {ALL_SKILLS.map(skill => (
                    <button
                      key={skill}
                      className={`${styles.skillChip} ${selectedSkills.includes(skill) ? styles.skillChipActive : ''}`}
                      onClick={() => toggleSkill(skill)}
                    >
                      {selectedSkills.includes(skill) && <CheckCircle size={11} />}
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
              {hasActiveFilters && (
                <button className={styles.resetBtn} onClick={handleReset}>
                  <X size={13} /> Reset All Filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {hasSearched && (
        <div className={styles.resultsArea}>
          {/* Results Header */}
          <div className={styles.resultsHeader}>
            <p className={styles.resultsCount}>
              {loading ? 'Searching…' : (
                <>
                  <strong>{filtered.length}</strong> alumni found
                  {debouncedQuery && <> for <em>"{debouncedQuery}"</em></>}
                </>
              )}
            </p>
            <div className={styles.sortRow}>
              <span className={styles.sortLabel}>Sort by:</span>
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt}
                  className={`${styles.sortBtn} ${sortBy === opt ? styles.sortBtnActive : ''}`}
                  onClick={() => setSortBy(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className={styles.grid}>
            {(loading || apiLoading) ? (
              Array(4).fill(0).map((_, i) => <CardSkeleton key={i} />)
            ) : filtered.length === 0 ? (
              <div className={styles.emptyWrapper}>
                <EmptyState
                  icon={<Search size={40} />}
                  title="No alumni found"
                  description="Try adjusting your search query or filters to find more results."
                />
              </div>
            ) : (
              filtered.map((alumni, i) => (
                <motion.div
                  key={alumni.id}
                  className={styles.card}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(0,119,181,0.12)' }}
                  layout
                >
                  <div className={styles.cardTop}>
                    <div className={styles.avatarWrapper}>
                      <img src={alumni.avatar} alt={alumni.name} className={styles.avatar} />
                      {alumni.isVerified && (
                        <div className={styles.verifiedBadge}><CheckCircle size={10} /></div>
                      )}
                    </div>
                    <div className={styles.info}>
                      <div className={styles.nameRow}>
                        <h3 className={styles.name}>{alumni.name}</h3>
                        {alumni.mentorAvailable && (
                          <span className={styles.mentorBadge}>Mentor</span>
                        )}
                      </div>
                      <p className={styles.role}>{alumni.role}</p>
                      <p className={styles.company}>
                        <Briefcase size={11} /> {alumni.company}
                        <span className={styles.dot}>·</span>
                        <MapPin size={11} /> {alumni.location}
                      </p>
                      <div className={styles.metaRow}>
                        <span className={styles.metaItem}><GraduationCap size={11} /> {alumni.university}</span>
                        <span className={styles.metaItem}><Star size={11} /> {alumni.experience}</span>
                      </div>
                    </div>
                    <CompatibilityRing score={alumni.compatibilityScore} size={72} strokeWidth={5} />
                  </div>

                  <p className={styles.bio}>{alumni.bio}</p>

                  <div className={styles.skills}>
                    {alumni.skills.slice(0, 4).map(s => <SkillTag key={s} skill={s} size="sm" />)}
                    {alumni.skills.length > 4 && <SkillTag skill={`+${alumni.skills.length - 4}`} variant="gray" size="sm" />}
                  </div>

                  <div className={styles.tagRow}>
                    {(alumni.tags || []).map(t => (
                      <span key={t} className={styles.alumnusTag}>{t}</span>
                    ))}
                  </div>

                  <div className={styles.cardStats}>
                    <span className={styles.statChip}><Users size={11} /> {alumni.connections} connections</span>
                    <span className={styles.statChip}><Star size={11} /> {alumni.profileViews} views</span>
                  </div>

                  <div className={styles.cardActions}>
                    {!connected[alumni.id] ? (
                      <motion.button
                        className={styles.connectBtn}
                        onClick={() => setConnected(p => ({ ...p, [alumni.id]: true }))}
                        whileTap={{ scale: 0.97 }}
                        id={`connect-${alumni.id}`}
                      >
                        <Users size={13} /> Connect
                      </motion.button>
                    ) : (
                      <button className={styles.connectedBtn} disabled>
                        <CheckCircle size={13} /> Request Sent
                      </button>
                    )}
                    <button className={styles.viewBtn}>View Profile</button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Empty / Landing State */}
      {!hasSearched && (
        <motion.div
          className={styles.landingState}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className={styles.statsRow}>
            {[['9,450+', 'Alumni Members'], ['87%', 'Match Accuracy'], ['24 hrs', 'Avg Response'], ['4.8★', 'Satisfaction']].map(([v, l]) => (
              <div key={l} className={styles.landingStat}>
                <span className={styles.landingStatVal}>{v}</span>
                <span className={styles.landingStatLabel}>{l}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SmartSearchPage;
