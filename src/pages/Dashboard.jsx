import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, BookOpen, Star, Eye, ArrowRight, Brain, Sparkles,
  TrendingUp, Clock, Zap, ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CompatibilityRing from '../components/shared/CompatibilityRing';
import SkillTag from '../components/shared/SkillTag';
import StatCard from '../components/shared/StatCard';
import activities from '../data/activities.json';
import recommendations from '../data/recommendations.json';
import mentors from '../data/mentors.json';
import styles from './Dashboard.module.css';

const trendingSkills = [
  { name: 'Python', level: 92, growth: '+23%' },
  { name: 'Machine Learning', level: 87, growth: '+31%' },
  { name: 'React', level: 85, growth: '+18%' },
  { name: 'FastAPI', level: 78, growth: '+45%' },
  { name: 'Data Science', level: 74, growth: '+27%' },
  { name: 'Docker', level: 71, growth: '+12%' },
  { name: 'AWS', level: 68, growth: '+15%' },
  { name: 'Kubernetes', level: 65, growth: '+22%' },
  { name: 'TensorFlow', level: 63, growth: '+19%' },
  { name: 'PostgreSQL', level: 59, growth: '+9%' },
];

const getActivityIcon = (type) => {
  const map = {
    connection: { emoji: '🤝', color: '#0077B5' },
    recommendation: { emoji: '🤖', color: '#8B5CF6' },
    mentor: { emoji: '🎓', color: '#059669' },
    profile: { emoji: '👁️', color: '#F59E0B' },
    collaboration: { emoji: '🚀', color: '#EF4444' },
    skill: { emoji: '⚡', color: '#0077B5' },
  };
  return map[type] || { emoji: '📢', color: '#64748B' };
};

const Dashboard = () => {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('Good morning');

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Good morning');
    else if (h < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const topRecs = recommendations.slice(0, 4);
  const topMentors = mentors.slice(0, 3);
  const recentActivities = activities.slice(0, 6);

  return (
    <div className={styles.page}>
      {/* Welcome Banner */}
      <motion.div
        className={styles.welcomeBanner}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.welcomeLeft}>
          <div className={styles.welcomeIconWrap}>
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className={styles.welcomeTitle}>
              {greeting}, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className={styles.welcomeInsight}>
              <Brain size={14} style={{ display: 'inline', marginRight: 6, color: '#0077B5' }} />
              AI Insight: <strong>12 new alumni match your interests this week.</strong> Your compatibility score improved by 3.2% based on your recent profile updates.
            </p>
          </div>
        </div>
        <div className={styles.welcomeActions}>
          <Link to="/recommendations" className={styles.welcomeBtn}>
            <Sparkles size={15} /> View Matches
          </Link>
          <Link to="/profile" className={styles.welcomeBtnOutline}>
            Update Profile
          </Link>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className={styles.statsGrid}>
        {[
          { title: 'Connections', value: '156', icon: <Users size={20} />, growth: 12.5, growthLabel: 'vs last month', color: '#0077B5' },
          { title: 'Mentor Matches', value: '3', icon: <BookOpen size={20} />, growth: 50, growthLabel: 'this week', color: '#059669' },
          { title: 'AI Match Score', value: '94%', icon: <Star size={20} />, growth: 3.2, growthLabel: 'profile updated', color: '#8B5CF6' },
          { title: 'Profile Views', value: '342', icon: <Eye size={20} />, growth: 18.7, growthLabel: 'this month', color: '#F59E0B' },
        ].map((card, i) => (
          <StatCard key={card.title} {...card} index={i} />
        ))}
      </div>

      {/* AI Recommendations */}
      <motion.section
        className={styles.section}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <Sparkles size={18} className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>AI Recommendations</h2>
            <span className={styles.sectionBadge}>AI Powered</span>
          </div>
          <Link to="/recommendations" className={styles.viewAll}>
            View all <ChevronRight size={14} />
          </Link>
        </div>
        <div className={styles.recsGrid}>
          {topRecs.map((rec, i) => (
            <motion.div
              key={rec.id}
              className={styles.recCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className={styles.recCardHeader}>
                <img src={rec.avatar} alt={rec.name} className={styles.recAvatar} />
                <div className={styles.recInfo}>
                  <p className={styles.recName}>{rec.name}</p>
                  <p className={styles.recRole}>{rec.role}</p>
                  <p className={styles.recCompany}>{rec.company}</p>
                </div>
                <CompatibilityRing score={rec.compatibilityScore} size={64} strokeWidth={5} />
              </div>
              <div className={styles.recSkills}>
                {rec.sharedSkills.slice(0, 3).map(s => (
                  <SkillTag key={s} skill={s} variant="default" size="sm" />
                ))}
              </div>
              <p className={styles.recReason}>
                <Brain size={12} style={{ color: '#0077B5', flexShrink: 0 }} />
                {rec.matchReasons[0]}
              </p>
              <div className={styles.recActions}>
                <Link to="/recommendations" className={styles.recConnectBtn}>Connect</Link>
                <Link to="/recommendations" className={styles.recViewBtn}>View Profile</Link>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <div className={styles.twoCol}>
        {/* Mentor Suggestions */}
        <motion.section
          className={styles.section}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <BookOpen size={18} className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>Top Mentors</h2>
            </div>
            <Link to="/mentors" className={styles.viewAll}>View all <ChevronRight size={14} /></Link>
          </div>
          <div className={styles.mentorsList}>
            {topMentors.map((mentor, i) => (
              <motion.div
                key={mentor.id}
                className={styles.mentorItem}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                whileHover={{ x: 4 }}
              >
                <img src={mentor.avatar} alt={mentor.name} className={styles.mentorAvatar} />
                <div className={styles.mentorInfo}>
                  <p className={styles.mentorName}>{mentor.name}</p>
                  <p className={styles.mentorRole}>{mentor.role} @ {mentor.company}</p>
                  <div className={styles.mentorMeta}>
                    <span className={styles.mentorRating}>⭐ {mentor.rating}</span>
                    <span className={styles.mentorExp}>{mentor.experience}</span>
                  </div>
                </div>
                <div className={styles.mentorScore}>{mentor.compatibilityScore}%</div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Activity Timeline */}
        <motion.section
          className={styles.section}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <Clock size={18} className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>Recent Activity</h2>
            </div>
          </div>
          <div className={styles.activityList}>
            {recentActivities.map((activity, i) => {
              const { emoji, color } = getActivityIcon(activity.type);
              return (
                <motion.div
                  key={activity.id}
                  className={`${styles.activityItem} ${!activity.isRead ? styles.activityUnread : ''}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                >
                  <div className={styles.activityDot} style={{ background: color }}>
                    <span style={{ fontSize: '0.75rem' }}>{emoji}</span>
                  </div>
                  <div className={styles.activityContent}>
                    <p className={styles.activityMsg}>{activity.message}</p>
                    <span className={styles.activityTime}>{activity.time}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      </div>

      {/* Trending Skills */}
      <motion.section
        className={styles.section}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <TrendingUp size={18} className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>Trending Skills in Your Network</h2>
          </div>
          <Link to="/analytics" className={styles.viewAll}>View Analytics <ChevronRight size={14} /></Link>
        </div>
        <div className={styles.skillsCloud}>
          {trendingSkills.map((skill, i) => (
            <motion.div
              key={skill.name}
              className={styles.skillCloudItem}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + i * 0.05 }}
              whileHover={{ scale: 1.08 }}
            >
              <span className={styles.skillName}>{skill.name}</span>
              <span className={styles.skillGrowth}>{skill.growth}</span>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};

export default Dashboard;
