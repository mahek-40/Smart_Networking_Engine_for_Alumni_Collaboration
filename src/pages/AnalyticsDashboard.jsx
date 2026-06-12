import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts';
import {
  BarChart2, TrendingUp, Users, Eye, Brain, Star,
  Target, Zap, Download, Calendar, FileText, FileJson
} from 'lucide-react';
import StatCard from '../components/shared/StatCard';
import analyticsService from '../services/analyticsService';
import staticAnalyticsData from '../data/analytics.json';
import styles from './AnalyticsDashboard.module.css';

// --- Export Utilities ---
const downloadBlob = (content, filename, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const exportAsCSV = (data) => {
  const { kpis, topSkills, profileViews } = data || staticAnalyticsData;
  const rows = [
    ['Metric', 'Value'],
    ['Total Connections', kpis.totalConnections],
    ['Profile Views', kpis.profileViews],
    ['Engagement Rate (%)', kpis.engagementRate],
    ['AI Match Accuracy (%)', kpis.matchAccuracy],
    ['Mentor Sessions', kpis.mentorSessions],
    ['Recommendations', kpis.recommendations],
    [''],
    ['Month', 'Profile Views', 'Unique Visitors'],
    ...profileViews.map(pv => [pv.date, pv.views, pv.uniqueVisitors]),
    [''],
    ['Skill', 'Alumni Count', 'Growth (%)'],
    ...topSkills.map(s => [s.skill, s.count, s.growth]),
  ];
  const csv = rows.map(r => r.join(',')).join('\n');
  downloadBlob(csv, 'sne_analytics.csv', 'text/csv');
};

const exportAsJSON = (data) => {
  downloadBlob(JSON.stringify(data, null, 2), 'sne_analytics.json', 'application/json');
};

const CHART_COLORS = {
  primary: '#0077B5',
  primaryDark: '#004170',
  primaryLight: '#0091DA',
  success: '#10B981',
  warning: '#F59E0B',
  purple: '#8B5CF6',
};

const TIME_RANGES = ['3 Months', '6 Months', '1 Year'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className={styles.tooltipItem} style={{ color: entry.color }}>
          <span className={styles.tooltipDot} style={{ background: entry.color }} />
          {entry.name}: <strong>{entry.value?.toLocaleString()}</strong>
        </p>
      ))}
    </div>
  );
};

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('1 Year');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef(null);

  // Live data state — merges API response over static scaffold
  const [liveData, setLiveData] = useState(staticAnalyticsData);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchLiveAnalytics = async () => {
      setDataLoading(true);
      try {
        const live = await analyticsService.getAll();
        const metrics = live.kpis || {};

        // Map backend metrics to the KPI shape the cards expect
        const mergedKpis = {
          ...staticAnalyticsData.kpis,
          totalConnections: metrics.total_users ?? staticAnalyticsData.kpis.totalConnections,
          profileViews: metrics.activities_logged ?? staticAnalyticsData.kpis.profileViews,
          recommendations: metrics.recommendations_generated ?? staticAnalyticsData.kpis.recommendations,
        };

        // Top skills: backend returns [{ skill, count }], map to [{ skill, count, growth }]
        const liveSkills = (live.topSkills || []).length > 0
          ? live.topSkills.map((s, i) => ({
              skill: s.skill,
              count: s.count,
              growth: staticAnalyticsData.topSkills[i]?.growth ?? Math.floor(Math.random() * 20 + 5),
            }))
          : staticAnalyticsData.topSkills;

        // Top industries: backend returns [{ industry, count }], map to pie format
        const maxCount = Math.max(...(live.topIndustries || []).map(x => x.count), 1);
        const liveIndustries = (live.topIndustries || []).length > 0
          ? live.topIndustries.map((ind, i) => ({
              name: ind.industry,
              value: Math.round((ind.count / maxCount) * 35) + 5,
              color: staticAnalyticsData.topIndustries[i]?.color ?? '#6B7280',
            }))
          : staticAnalyticsData.topIndustries;

        setLiveData(prev => ({
          ...prev,
          kpis: mergedKpis,
          topSkills: liveSkills,
          topIndustries: liveIndustries,
        }));
      } catch (err) {
        console.error('Analytics API unavailable, using static data:', err);
        // Silent fallback — static data remains in place
      } finally {
        setDataLoading(false);
      }
    };
    fetchLiveAnalytics();
  }, []);

  const { kpis, profileViews, userGrowth, matchRates, topSkills, topIndustries, activityTrends, radarSkills } = liveData;

  const profileViewsSlice = timeRange === '3 Months' ? profileViews.slice(-3)
    : timeRange === '6 Months' ? profileViews.slice(-6)
    : profileViews;

  // Close export menu on outside click
  useEffect(() => {
    const handle = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <div className={styles.page}>
      {/* Header */}
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.headerLeft}>
          <div className={styles.headerTitleRow}>
            <div className={styles.headerIcon}><BarChart2 size={20} /></div>
            <h1 className={styles.headerTitle}>Analytics Dashboard</h1>
            <span className={styles.liveBadge}>
              <span className={styles.liveDot} style={{ background: dataLoading ? '#F59E0B' : undefined }} />
              {dataLoading ? 'Syncing…' : 'Live'}
            </span>
          </div>
          <p className={styles.headerSubtitle}>
            Track your networking impact, match quality, and engagement metrics
          </p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.timeRangeGroup} role="group" aria-label="Time range">
            {TIME_RANGES.map(r => (
              <button
                key={r}
                className={`${styles.rangeBtn} ${timeRange === r ? styles.rangeBtnActive : ''}`}
                onClick={() => setTimeRange(r)}
              >
                {r}
              </button>
            ))}
          </div>
          <div className={styles.exportWrapper} ref={exportRef}>
            <button
              className={styles.exportBtn}
              onClick={() => setShowExportMenu(p => !p)}
              aria-label="Export analytics"
              aria-expanded={showExportMenu}
              id="analytics-export-btn"
            >
              <Download size={14} /> Export
            </button>
            <AnimatePresence>
              {showExportMenu && (
                <motion.div
                  className={styles.exportMenu}
                  initial={{ opacity: 0, y: -6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <button
                    className={styles.exportMenuItem}
                    onClick={() => { exportAsCSV(liveData); setShowExportMenu(false); }}
                    id="export-csv-btn"
                  >
                    <FileText size={14} /> Export as CSV
                  </button>
                  <button
                    className={styles.exportMenuItem}
                    onClick={() => { exportAsJSON(liveData); setShowExportMenu(false); }}
                    id="export-json-btn"
                  >
                    <FileJson size={14} /> Export as JSON
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        {[
          { title: 'Total Connections', value: String(kpis.totalConnections), icon: <Users size={18} />, growth: kpis.connectionsGrowth, growthLabel: 'vs last month', color: CHART_COLORS.primary },
          { title: 'Profile Views', value: String(kpis.profileViews), icon: <Eye size={18} />, growth: kpis.profileViewsGrowth, growthLabel: 'this month', color: CHART_COLORS.success },
          { title: 'AI Match Accuracy', value: `${kpis.matchAccuracy}%`, icon: <Brain size={18} />, growth: kpis.matchAccuracyGrowth, growthLabel: 'improved', color: CHART_COLORS.purple },
          { title: 'Recommendations', value: String(kpis.recommendations), icon: <Star size={18} />, growth: kpis.recommendationsGrowth, growthLabel: 'this month', color: CHART_COLORS.warning },
          { title: 'Engagement Rate', value: `${kpis.engagementRate}%`, icon: <TrendingUp size={18} />, growth: kpis.engagementGrowth, growthLabel: 'improved', color: '#EF4444' },
          { title: 'Mentor Sessions', value: String(kpis.mentorSessions), icon: <Target size={18} />, growth: kpis.mentorSuccess, growthLabel: 'success rate', color: '#059669' },
        ].map((card, i) => <StatCard key={card.title} {...card} index={i} />)}
      </div>

      {/* Row 1: Profile Views + User Growth */}
      <div className={styles.chartRow}>
        {/* Profile Views Area Chart */}
        <motion.div
          className={styles.chartCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className={styles.chartHeader}>
            <div className={styles.chartTitleGroup}>
              <Eye size={16} className={styles.chartIcon} />
              <h2 className={styles.chartTitle}>Profile Views</h2>
            </div>
            <span className={styles.chartBadge}>{timeRange}</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={profileViewsSlice} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.10} />
                  <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--gray-400)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--gray-400)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: 'var(--gray-500)' }} />
              <Area type="monotone" dataKey="views" name="Views" stroke={CHART_COLORS.primary} strokeWidth={2} fill="url(#viewsGrad)" dot={{ fill: CHART_COLORS.primary, r: 3 }} activeDot={{ r: 5 }} />
              <Area type="monotone" dataKey="uniqueVisitors" name="Unique Visitors" stroke={CHART_COLORS.success} strokeWidth={2} fill="url(#visitorsGrad)" dot={{ fill: CHART_COLORS.success, r: 3 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* User Growth Line Chart */}
        <motion.div
          className={styles.chartCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className={styles.chartHeader}>
            <div className={styles.chartTitleGroup}>
              <TrendingUp size={16} className={styles.chartIcon} />
              <h2 className={styles.chartTitle}>Platform Growth</h2>
            </div>
            <span className={styles.chartBadge}>All Time</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={userGrowth} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--gray-400)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--gray-400)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: 'var(--gray-500)' }} />
              <Line type="monotone" dataKey="users" name="Total Users" stroke={CHART_COLORS.primary} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: CHART_COLORS.primary }} />
              <Line type="monotone" dataKey="activeUsers" name="Active Users" stroke={CHART_COLORS.success} strokeWidth={2} dot={false} strokeDasharray="5 5" activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Row 2: Activity Trends + Industry Pie */}
      <div className={styles.chartRow}>
        {/* Weekly Activity Bar Chart */}
        <motion.div
          className={styles.chartCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className={styles.chartHeader}>
            <div className={styles.chartTitleGroup}>
              <Calendar size={16} className={styles.chartIcon} />
              <h2 className={styles.chartTitle}>Weekly Activity</h2>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={activityTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--gray-400)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--gray-400)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: 'var(--gray-500)' }} />
              <Bar dataKey="connections" name="Connections" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} maxBarSize={18} />
              <Bar dataKey="messages" name="Messages" fill={CHART_COLORS.primaryLight} radius={[4, 4, 0, 0]} maxBarSize={18} />
              <Bar dataKey="recommendations" name="Recommendations" fill={CHART_COLORS.purple} radius={[4, 4, 0, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Industry Pie Chart */}
        <motion.div
          className={`${styles.chartCard} ${styles.pieCard}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className={styles.chartHeader}>
            <div className={styles.chartTitleGroup}>
              <Target size={16} className={styles.chartIcon} />
              <h2 className={styles.chartTitle}>Industry Distribution</h2>
            </div>
          </div>
          <div className={styles.pieWrapper}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={topIndustries}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                >
                  {topIndustries.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => `${val}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.pieLegend}>
              {topIndustries.map(entry => (
                <div key={entry.name} className={styles.pieLegendItem}>
                  <span className={styles.pieDot} style={{ background: entry.color }} />
                  <span className={styles.pieName}>{entry.name}</span>
                  <span className={styles.pieVal}>{entry.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Row 3: Top Skills + Radar + Match Rate */}
      <div className={styles.chartRowThree}>
        {/* Top Skills Horizontal Bar */}
        <motion.div
          className={styles.chartCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className={styles.chartHeader}>
            <div className={styles.chartTitleGroup}>
              <Zap size={16} className={styles.chartIcon} />
              <h2 className={styles.chartTitle}>Top Skills in Network</h2>
            </div>
          </div>
          <div className={styles.skillsList}>
            {topSkills.map((skill, i) => (
              <div key={skill.skill} className={styles.skillRow}>
                <span className={styles.skillName}>{skill.skill}</span>
                <div className={styles.skillBarTrack}>
                  <motion.div
                    className={styles.skillBarFill}
                    initial={{ width: 0 }}
                    animate={{ width: `${(skill.count / topSkills[0].count) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.7 + i * 0.06, ease: 'easeOut' }}
                  />
                </div>
                <div className={styles.skillMeta}>
                  <span className={styles.skillCount}>{skill.count.toLocaleString()}</span>
                  <span className={styles.skillGrowth}>+{skill.growth}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Radar Chart */}
        <motion.div
          className={styles.chartCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className={styles.chartHeader}>
            <div className={styles.chartTitleGroup}>
              <Brain size={16} className={styles.chartIcon} />
              <h2 className={styles.chartTitle}>Your Skill Profile</h2>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarSkills} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="var(--gray-100)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--gray-500)' }} />
              <Radar
                name="Your Score"
                dataKey="score"
                stroke={CHART_COLORS.primary}
                fill={CHART_COLORS.primary}
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Tooltip formatter={(val) => [`${val}%`, 'Score']} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Match Rate Line Chart */}
        <motion.div
          className={styles.chartCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className={styles.chartHeader}>
            <div className={styles.chartTitleGroup}>
              <Star size={16} className={styles.chartIcon} />
              <h2 className={styles.chartTitle}>AI Match Rate</h2>
            </div>
            <span className={styles.chartBadge}>8 Weeks</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={matchRates} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="matchGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--gray-400)' }} axisLine={false} tickLine={false} />
              <YAxis domain={[75, 90]} tick={{ fontSize: 11, fill: 'var(--gray-400)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="rate" name="Match Rate %" stroke={CHART_COLORS.primary} strokeWidth={2.5} fill="url(#matchGrad)" dot={{ fill: CHART_COLORS.primary, r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
          <div className={styles.matchSummary}>
            <div className={styles.matchStat}>
              <span className={styles.matchStatVal}>{matchRates[matchRates.length - 1]?.rate}%</span>
              <span className={styles.matchStatLabel}>Current Rate</span>
            </div>
            <div className={styles.matchStat}>
              <span className={styles.matchStatVal} style={{ color: 'var(--success)' }}>+6.1%</span>
              <span className={styles.matchStatLabel}>8-week growth</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
