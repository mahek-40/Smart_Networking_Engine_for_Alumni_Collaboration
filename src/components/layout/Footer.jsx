import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, GitBranch, Globe, X, Mail } from 'lucide-react';
import styles from './Footer.module.css';

const SOCIAL_ICONS = [
  { Icon: GitBranch, label: 'GitHub' },
  { Icon: Globe, label: 'LinkedIn' },
  { Icon: X, label: 'Twitter / X' },
  { Icon: Mail, label: 'Email' },
];

const Footer = () => (
  <footer className={styles.footer}>
    <div className={styles.container}>
      <div className={styles.grid}>
        <div className={styles.brand}>
          <Link to="/" className={styles.logo}>
            <div className={styles.logoIcon}><Zap size={18} color="white" /></div>
            <span className={styles.logoText}>Smart Networking Engine</span>
          </Link>
          <p className={styles.tagline}>
            Connecting alumni through the power of artificial intelligence.
            Build meaningful professional relationships that last a lifetime.
          </p>
          <div className={styles.socials}>
            {SOCIAL_ICONS.map(({ Icon, label }) => (
              <a key={label} href="#" className={styles.socialLink} aria-label={label}>
                <Icon size={17} />
              </a>
            ))}
          </div>
        </div>
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Platform</h4>
          {['Features', 'AI Recommendations', 'Mentor Matching', 'Analytics', 'Smart Search'].map(item => (
            <Link key={item} to="/" className={styles.colLink}>{item}</Link>
          ))}
        </div>
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Company</h4>
          {['About Us', 'Careers', 'Blog', 'Press', 'Partners'].map(item => (
            <Link key={item} to="/" className={styles.colLink}>{item}</Link>
          ))}
        </div>
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Legal</h4>
          {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR', 'Contact'].map(item => (
            <Link key={item} to="/" className={styles.colLink}>{item}</Link>
          ))}
        </div>
      </div>
      <div className={styles.bottom}>
        <p className={styles.copyright}>© 2026 Smart Networking Engine. All rights reserved.</p>
        <p className={styles.madeWith}>Built with ❤️ for the alumni community</p>
      </div>
    </div>
  </footer>
);

export default Footer;
