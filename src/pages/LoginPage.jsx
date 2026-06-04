import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Zap, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('demo@sne.alumni.io');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Left Panel */}
      <motion.div
        className={styles.leftPanel}
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.leftContent}>
          <Link to="/" className={styles.logo}>
            <div className={styles.logoIcon}><Zap size={20} color="white" /></div>
            <span className={styles.logoText}>Smart Networking Engine</span>
          </Link>
          <div className={styles.heroText}>
            <motion.h1
              className={styles.heroTitle}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Connect with alumni who understand your journey
            </motion.h1>
            <motion.p
              className={styles.heroSubtitle}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Join 9,450+ alumni building meaningful professional relationships powered by AI.
            </motion.p>
          </div>
          {/* Network visual */}
          <motion.div
            className={styles.networkVisual}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <div className={styles.centralNode}>
              <Zap size={24} color="white" />
            </div>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className={styles.orbitNode}
                style={{
                  '--angle': `${i * 60}deg`,
                  '--delay': `${i * 0.15}s`,
                }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.3 }}
              />
            ))}
          </motion.div>
          <div className={styles.stats}>
            {[['9.4K+', 'Alumni Connected'], ['87%', 'Match Accuracy'], ['2,300+', 'Mentors']].map(([val, label]) => (
              <div key={label} className={styles.statItem}>
                <span className={styles.statVal}>{val}</span>
                <span className={styles.statLabel}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right Panel */}
      <motion.div
        className={styles.rightPanel}
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Welcome back</h2>
            <p className={styles.formSubtitle}>Sign in to your account to continue</p>
          </div>

          {error && (
            <motion.div
              className={styles.errorBanner}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              {error}
            </motion.div>
          )}

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>Email Address</label>
              <div className={styles.inputWrapper}>
                <Mail size={16} className={styles.inputIcon} />
                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label htmlFor="password" className={styles.label}>Password</label>
                <Link to="/" className={styles.forgotLink}>Forgot password?</Link>
              </div>
              <div className={styles.inputWrapper}>
                <Lock size={16} className={styles.inputIcon} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(p => !p)} aria-label="Toggle password visibility">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className={styles.rememberRow}>
              <label className={styles.checkLabel}>
                <input type="checkbox" className={styles.checkbox} defaultChecked />
                <span>Remember me for 30 days</span>
              </label>
            </div>

            <motion.button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.01 }}
            >
              {loading ? (
                <span className={styles.spinner} />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          <div className={styles.divider}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerText}>or continue with</span>
            <span className={styles.dividerLine} />
          </div>

          <div className={styles.socialBtns}>
            {[
              { provider: 'Google', icon: '🔵' },
              { provider: 'LinkedIn', icon: '💼' },
              { provider: 'GitHub', icon: '⚫' },
            ].map(({ provider, icon }) => (
              <div key={provider} className={styles.socialBtnWrapper}>
                <button
                  key={provider}
                  className={styles.socialBtn}
                  disabled
                  title="Coming Soon"
                  aria-label={`${provider} sign in — coming soon`}
                >
                  <span className={styles.socialIcon}>{icon}</span>
                  {provider}
                </button>
                <span className={styles.comingSoonBadge}>Soon</span>
              </div>
            ))}
          </div>

          <p className={styles.registerLink}>
            Don&apos;t have an account?{' '}
            <Link to="/register" className={styles.registerAnchor}>Create account &rarr;</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
