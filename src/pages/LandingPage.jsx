import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Zap, ArrowRight, Users, Brain, Star, Shield, Search,
  BarChart2, Network, GraduationCap, ChevronRight, Play,
  CheckCircle, TrendingUp, Sparkles, Globe, Award
} from 'lucide-react';
import Footer from '../components/layout/Footer';
import styles from './LandingPage.module.css';

/* ── Animated counter ── */
const AnimCounter = ({ target, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView();

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(target * eased));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
};

/* simple useInView hook */
const useInView = () => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, inView };
};

const features = [
  { icon: Brain, title: 'AI Recommendations', desc: 'Get personalized alumni connections powered by machine learning that analyzes skills, interests, and career goals.' },
  { icon: GraduationCap, title: 'Mentor Matching', desc: 'Connect with experienced mentors who have walked your path. Our AI matches you with the perfect guide for your career.' },
  { icon: Network, title: 'Collaboration Prediction', desc: 'Predict collaboration success before you even connect. Our AI scores partnership potential with 87% accuracy.' },
  { icon: Search, title: 'Smart Search', desc: 'Find any alumni by skills, industry, role, or interest using our intelligent search with natural language understanding.' },
  { icon: BarChart2, title: 'Analytics Dashboard', desc: 'Track your network growth, engagement, and profile performance with beautiful, real-time analytics.' },
  { icon: Shield, title: 'Verified Profiles', desc: 'All alumni profiles are verified through institutional data ensuring authentic, trusted professional connections.' },
];

const testimonials = [
  { name: 'Arjun Sharma', role: 'SWE at Google', avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Arjun', text: 'SNE matched me with my current mentor within 24 hours. That connection helped me land my Google offer. This platform is genuinely transformative.' },
  { name: 'Priya Nair', role: 'PM at Microsoft', avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Priya', text: 'The AI recommendations are remarkably accurate. Every person it suggested became a meaningful professional connection. Highly recommend!' },
  { name: 'Vikram Joshi', role: 'Founder, NeuralStack AI', avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Vikram', text: 'I found my first two co-founders and three key hires through SNE. The collaboration prediction feature is eerily accurate.' },
];

const steps = [
  { n: '01', title: 'Create Account', desc: 'Sign up in minutes with your academic email' },
  { n: '02', title: 'Build Profile', desc: 'Add your skills, experience, and career goals' },
  { n: '03', title: 'AI Analysis', desc: 'Our AI analyzes your profile for best matches' },
  { n: '04', title: 'Get Matches', desc: 'Receive personalized alumni recommendations' },
  { n: '05', title: 'Grow Network', desc: 'Connect, collaborate, and accelerate your career' },
];

/* ── NetworkGraph SVG ── */
const NetworkGraph = () => (
  <motion.div
    className={styles.networkGraph}
    initial={{ opacity: 0, scale: 0.85 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 1, delay: 0.5 }}
  >
    <svg viewBox="0 0 400 400" className={styles.graphSvg}>
      {/* Connection lines */}
      {[
        [200, 200, 100, 80], [200, 200, 320, 80], [200, 200, 60, 220],
        [200, 200, 340, 220], [200, 200, 130, 340], [200, 200, 270, 340],
        [100, 80, 60, 220], [320, 80, 340, 220], [60, 220, 130, 340],
      ].map(([x1, y1, x2, y2], i) => (
        <motion.line
          key={i}
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="rgba(0,119,181,0.3)"
          strokeWidth="1.5"
          strokeDasharray="5,5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.8 + i * 0.1 }}
        />
      ))}
      {/* Central node */}
      <motion.circle cx="200" cy="200" r="32"
        fill="#0077B5" opacity="0.9"
        animate={{ r: [32, 36, 32], opacity: [0.9, 1, 0.9] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />
      <text x="200" y="196" textAnchor="middle" fill="white" fontSize="10" fontFamily="Poppins" fontWeight="700">YOU</text>
      <text x="200" y="208" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="7" fontFamily="Inter">96% match</text>

      {/* Satellite nodes */}
      {[
        { cx: 100, cy: 80, label: 'Arjun', score: '94%', delay: 0.6 },
        { cx: 320, cy: 80, label: 'Meera', score: '88%', delay: 0.7 },
        { cx: 60, cy: 220, label: 'Vikram', score: '91%', delay: 0.8 },
        { cx: 340, cy: 220, label: 'Priya', score: '89%', delay: 0.9 },
        { cx: 130, cy: 340, label: 'Rahul', score: '86%', delay: 1.0 },
        { cx: 270, cy: 340, label: 'Ananya', score: '82%', delay: 1.1 },
      ].map(({ cx, cy, label, score, delay }) => (
        <motion.g key={label}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay }}
        >
          <circle cx={cx} cy={cy} r="24" fill="#ffffff" stroke="#0077B5" strokeWidth="2" />
          <text x={cx} y={cy - 2} textAnchor="middle" fill="#005A8B" fontSize="9" fontFamily="Poppins" fontWeight="700">{label}</text>
          <text x={cx} y={cy + 9} textAnchor="middle" fill="#0077B5" fontSize="7" fontFamily="Inter">{score}</text>
        </motion.g>
      ))}
    </svg>
  </motion.div>
);

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      {/* ── NAVBAR ── */}
      <motion.nav
        className={styles.nav}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.navContent}>
          <Link to="/" className={styles.navLogo}>
            <div className={styles.logoIcon}><Zap size={18} color="white" /></div>
            <span className={styles.logoText}>Smart Networking Engine</span>
          </Link>
          <div className={styles.navLinks}>
            {['Features', 'How it works', 'Testimonials'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className={styles.navLink}>{item}</a>
            ))}
          </div>
          <div className={styles.navActions}>
            <Link to="/login" className={styles.navLoginBtn}>Sign In</Link>
            <Link to="/register" className={styles.navRegisterBtn}>
              Get Started <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroMesh} aria-hidden="true" />
        <div className={styles.heroContent}>
          {/* Left */}
          <div className={styles.heroLeft}>
            <motion.div
              className={styles.heroBadge}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles size={14} className={styles.heroBadgeIcon} />
              <span>AI-Powered Alumni Networking</span>
            </motion.div>
            <motion.h1
              className={styles.heroTitle}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              Smart Networking Engine for{' '}
              <span className={styles.heroHighlight}>Alumni Collaboration</span>
            </motion.h1>
            <motion.p
              className={styles.heroSubtitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              Discover mentors, collaborators, and meaningful alumni connections powered by artificial intelligence. Your next breakthrough connection is one match away.
            </motion.p>
            <motion.div
              className={styles.heroActions}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link to="/register" className={styles.heroPrimary}>
                  Get Started Free <ArrowRight size={18} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link to="/login" className={styles.heroSecondary}>
                  <Play size={16} className={styles.playIcon} />
                  Explore Platform
                </Link>
              </motion.div>
            </motion.div>
            <motion.div
              className={styles.heroTrust}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className={styles.avatarGroup}>
                {['Arjun','Priya','Rahul','Vikram'].map(s => (
                  <img key={s} src={`https://api.dicebear.com/8.x/avataaars/svg?seed=${s}`} alt={s} className={styles.trustAvatar} />
                ))}
              </div>
              <p className={styles.trustText}>
                <strong>9,450+ alumni</strong> already building meaningful connections
              </p>
            </motion.div>
          </div>
          {/* Right — Network Graph */}
          <div className={styles.heroRight}>
            <NetworkGraph />
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className={styles.statsSection} id="features">
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            {[
              { target: 9450, suffix: '+', label: 'Alumni Connected' },
              { target: 48000, suffix: '+', label: 'Recommendations Generated' },
              { target: 2300, suffix: '+', label: 'Mentor Matches' },
              { target: 870, suffix: '+', label: 'Successful Collaborations' },
            ].map(({ target, suffix, label }) => (
              <motion.div
                key={label}
                className={styles.statCard}
                whileHover={{ y: -4 }}
              >
                <p className={styles.statValue}>
                  <AnimCounter target={target} suffix={suffix} />
                </p>
                <p className={styles.statLabel}>{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className={styles.featuresSection} id="features">
        <div className={styles.container}>
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.sectionBadge}>Platform Features</div>
            <h2 className={styles.sectionTitle}>Everything you need to build your alumni network</h2>
            <p className={styles.sectionSubtitle}>
              A comprehensive suite of AI-powered tools designed to accelerate your professional growth
            </p>
          </motion.div>
          <div className={styles.featuresGrid}>
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                className={styles.featureCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -6, boxShadow: '0 20px 60px rgba(0,119,181,0.15)' }}
              >
                <div className={styles.featureIcon}>
                  <Icon size={24} />
                </div>
                <h3 className={styles.featureTitle}>{title}</h3>
                <p className={styles.featureDesc}>{desc}</p>
                <div className={styles.featureArrow}><ChevronRight size={16} /></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className={styles.howSection} id="how-it-works">
        <div className={styles.container}>
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className={styles.sectionBadge}>Getting Started</div>
            <h2 className={styles.sectionTitle}>Start networking in 5 simple steps</h2>
            <p className={styles.sectionSubtitle}>
              From sign-up to your first meaningful connection in under 10 minutes
            </p>
          </motion.div>
          <div className={styles.stepsWrapper}>
            {steps.map(({ n, title, desc }, i) => (
              <motion.div
                key={n}
                className={styles.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className={styles.stepNum}>{n}</div>
                {i < steps.length - 1 && <div className={styles.stepConnector} aria-hidden="true" />}
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>{title}</h3>
                  <p className={styles.stepDesc}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI SHOWCASE ── */}
      <section className={styles.aiSection}>
        <div className={styles.container}>
          <div className={styles.aiGrid}>
            <motion.div
              className={styles.aiLeft}
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className={styles.sectionBadge}>AI Intelligence</div>
              <h2 className={styles.sectionTitle}>Recommendations that actually make sense</h2>
              <p className={styles.sectionSubtitle}>
                Our AI analyzes 50+ data points including skills, experience, career trajectory, and personality traits to surface the most relevant connections.
              </p>
              <div className={styles.aiPoints}>
                {[
                  '87% match accuracy rate',
                  'Real-time compatibility scoring',
                  'AI-generated connection insights',
                  'Personalized outreach suggestions',
                ].map(point => (
                  <div key={point} className={styles.aiPoint}>
                    <CheckCircle size={18} className={styles.aiPointIcon} />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
              <Link to="/register" className={styles.heroPrimary} style={{ display: 'inline-flex', marginTop: 16 }}>
                Try AI Matching Free <ArrowRight size={16} />
              </Link>
            </motion.div>
            <motion.div
              className={styles.aiRight}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {/* Sample recommendation cards */}
              {[
                { name: 'Arjun Sharma', role: 'SWE @ Google', score: 94, skills: ['React', 'ML', 'AWS'], reason: 'Shared interest in AI/ML & Open Source' },
                { name: 'Meera Pillai', role: 'Research Scientist @ DeepMind', score: 88, skills: ['Deep Learning', 'Python', 'JAX'], reason: 'Complementary ML research backgrounds' },
              ].map((r, i) => (
                <motion.div
                  key={r.name}
                  className={styles.aiCard}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.2 }}
                  whileHover={{ y: -4 }}
                >
                  <div className={styles.aiCardHeader}>
                    <img src={`https://api.dicebear.com/8.x/avataaars/svg?seed=${r.name.split(' ')[0]}`} alt={r.name} className={styles.aiCardAvatar} />
                    <div>
                      <p className={styles.aiCardName}>{r.name}</p>
                      <p className={styles.aiCardRole}>{r.role}</p>
                    </div>
                    <div className={styles.aiCardScore}>{r.score}%</div>
                  </div>
                  <div className={styles.aiCardSkills}>
                    {r.skills.map(s => <span key={s} className={styles.aiCardSkill}>{s}</span>)}
                  </div>
                  <div className={styles.aiCardReason}>
                    <Brain size={13} style={{ color: '#0077B5', flexShrink: 0 }} />
                    <span>{r.reason}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className={styles.testimonialsSection} id="testimonials">
        <div className={styles.container}>
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className={styles.sectionBadge}>Testimonials</div>
            <h2 className={styles.sectionTitle}>Loved by thousands of alumni</h2>
          </motion.div>
          <div className={styles.testimonialsGrid}>
            {testimonials.map(({ name, role, avatar, text }, i) => (
              <motion.div
                key={name}
                className={styles.testimonialCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -4 }}
              >
                <div className={styles.stars}>{'★'.repeat(5)}</div>
                <p className={styles.testimonialText}>"{text}"</p>
                <div className={styles.testimonialAuthor}>
                  <img src={avatar} alt={name} className={styles.testimonialAvatar} />
                  <div>
                    <p className={styles.testimonialName}>{name}</p>
                    <p className={styles.testimonialRole}>{role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <motion.div
            className={styles.ctaCard}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className={styles.ctaIconWrapper}><Sparkles size={28} color="white" /></div>
            <h2 className={styles.ctaTitle}>Ready to find your next big opportunity?</h2>
            <p className={styles.ctaSubtitle}>
              Join 9,450+ alumni already building meaningful professional relationships. It's completely free to get started.
            </p>
            <div className={styles.ctaActions}>
              <Link to="/register" className={styles.ctaPrimary}>
                Create Free Account <ArrowRight size={18} />
              </Link>
              <Link to="/login" className={styles.ctaSecondary}>
                Sign in to existing account
              </Link>
            </div>
            <p className={styles.ctaMeta}>No credit card required · Free forever plan · Setup in under 5 minutes</p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
