import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, User, Briefcase, Code, Target, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import styles from './RegisterPage.module.css';

const STEPS = [
  { id: 1, title: 'Basic Info', icon: User, desc: 'Name, email & password' },
  { id: 2, title: 'Professional', icon: Briefcase, desc: 'Industry, role & experience' },
  { id: 3, title: 'Skills', icon: Code, desc: 'Technical skills & interests' },
  { id: 4, title: 'Goals', icon: Target, desc: 'Bio & career goals' },
];

const SKILL_OPTIONS = [
  'Python', 'React', 'Node.js', 'Machine Learning', 'FastAPI', 'Docker',
  'AWS', 'TensorFlow', 'Data Science', 'Kubernetes', 'SQL', 'MongoDB',
  'JavaScript', 'TypeScript', 'Go', 'Java', 'C++', 'Flutter', 'Swift',
];

const INTEREST_OPTIONS = [
  'AI/ML', 'Open Source', 'Startup Ecosystem', 'Product Development',
  'Research', 'EdTech', 'FinTech', 'HealthTech', 'Web3',
  'Cloud Computing', 'Data Science', 'Entrepreneurship', 'Design',
];

const INDUSTRIES = [
  'Technology', 'Artificial Intelligence', 'FinTech', 'EdTech', 'Healthcare',
  'E-commerce', 'Web3 / Blockchain', 'Consulting', 'Research', 'Media & Entertainment',
];

const EXPERIENCE_LEVELS = [
  'Student / Intern', '0–1 years', '1–3 years', '3–5 years', '5–10 years', '10+ years'
];

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    industry: '',
    role: '',
    experience: '',
    company: '',
    skills: [],
    interests: [],
    bio: '',
    careerGoals: '',
  });
  const [errors, setErrors] = useState({});

  const update = (key, val) => setFormData(p => ({ ...p, [key]: val }));

  const toggleItem = (key, item) => {
    setFormData(p => ({
      ...p,
      [key]: p[key].includes(item) ? p[key].filter(x => x !== item) : [...p[key], item],
    }));
  };

  const validate = () => {
    const errs = {};
    if (step === 1) {
      if (!formData.name.trim()) errs.name = 'Full name is required';
      if (!formData.email.includes('@')) errs.email = 'Valid email required';
      if (formData.password.length < 8) errs.password = 'Password must be at least 8 characters';
    }
    if (step === 2) {
      if (!formData.industry) errs.industry = 'Please select an industry';
      if (!formData.role.trim()) errs.role = 'Job role is required';
    }
    if (step === 3) {
      if (formData.skills.length === 0) errs.skills = 'Select at least one skill';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => { if (validate()) setStep(p => Math.min(p + 1, 4)); };
  const back = () => setStep(p => Math.max(p - 1, 1));

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    await register(formData);
    setLoading(false);
    navigate('/dashboard');
  };

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <Link to="/" className={styles.logo}>
            <div className={styles.logoIcon}><Zap size={18} color="white" /></div>
            <span className={styles.logoText}>Smart Networking Engine</span>
          </Link>
          <p className={styles.stepInfo}>Step {step} of {STEPS.length}</p>
        </div>

        {/* Progress */}
        <div className={styles.progressSection}>
          <div className={styles.stepsIndicator}>
            {STEPS.map(({ id, title, icon: Icon }) => (
              <div
                key={id}
                className={`${styles.stepDot} ${step >= id ? styles.stepActive : ''} ${step > id ? styles.stepDone : ''}`}
              >
                <div className={styles.stepCircle}>
                  {step > id ? <Check size={14} /> : <Icon size={14} />}
                </div>
                <span className={styles.stepLabel}>{title}</span>
              </div>
            ))}
          </div>
          <div className={styles.progressBar}>
            <motion.div
              className={styles.progressFill}
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className={styles.formCard}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
              {step === 1 && (
                <div className={styles.stepContent}>
                  <div className={styles.stepHeader}>
                    <div className={styles.stepIconBig}><User size={24} /></div>
                    <div>
                      <h2 className={styles.stepTitle}>Basic Information</h2>
                      <p className={styles.stepDesc}>Tell us a little about yourself to get started</p>
                    </div>
                  </div>
                  <div className={styles.fields}>
                    <div className={styles.field}>
                      <label htmlFor="name" className={styles.label}>
                        Full Name <span className={styles.req}>*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                        placeholder="e.g. Riya Patel"
                        value={formData.name}
                        onChange={e => update('name', e.target.value)}
                      />
                      {errors.name && <p className={styles.error}>{errors.name}</p>}
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="email" className={styles.label}>
                        Email Address <span className={styles.req}>*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                        placeholder="you@university.edu"
                        value={formData.email}
                        onChange={e => update('email', e.target.value)}
                      />
                      {errors.email && <p className={styles.error}>{errors.email}</p>}
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="password" className={styles.label}>
                        Password <span className={styles.req}>*</span>
                      </label>
                      <input
                        id="password"
                        type="password"
                        className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                        placeholder="Minimum 8 characters"
                        value={formData.password}
                        onChange={e => update('password', e.target.value)}
                      />
                      {errors.password && <p className={styles.error}>{errors.password}</p>}
                      <p className={styles.hint}>Use a mix of letters, numbers, and symbols</p>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className={styles.stepContent}>
                  <div className={styles.stepHeader}>
                    <div className={styles.stepIconBig}><Briefcase size={24} /></div>
                    <div>
                      <h2 className={styles.stepTitle}>Professional Information</h2>
                      <p className={styles.stepDesc}>Help us understand your professional background</p>
                    </div>
                  </div>
                  <div className={styles.fields}>
                    <div className={styles.field}>
                      <label htmlFor="industry" className={styles.label}>
                        Industry <span className={styles.req}>*</span>
                      </label>
                      <select
                        id="industry"
                        className={`${styles.select} ${errors.industry ? styles.inputError : ''}`}
                        value={formData.industry}
                        onChange={e => update('industry', e.target.value)}
                      >
                        <option value="">Select your industry</option>
                        {INDUSTRIES.map(ind => (
                          <option key={ind} value={ind}>{ind}</option>
                        ))}
                      </select>
                      {errors.industry && <p className={styles.error}>{errors.industry}</p>}
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="role" className={styles.label}>
                        Job Role / Title <span className={styles.req}>*</span>
                      </label>
                      <input
                        id="role"
                        type="text"
                        className={`${styles.input} ${errors.role ? styles.inputError : ''}`}
                        placeholder="e.g. Full Stack Developer"
                        value={formData.role}
                        onChange={e => update('role', e.target.value)}
                      />
                      {errors.role && <p className={styles.error}>{errors.role}</p>}
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="company" className={styles.label}>Company / Organization</label>
                      <input
                        id="company"
                        type="text"
                        className={styles.input}
                        placeholder="e.g. Google, IIT Bombay, Self-employed"
                        value={formData.company}
                        onChange={e => update('company', e.target.value)}
                      />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="experience" className={styles.label}>Experience Level</label>
                      <select
                        id="experience"
                        className={styles.select}
                        value={formData.experience}
                        onChange={e => update('experience', e.target.value)}
                      >
                        <option value="">Select experience level</option>
                        {EXPERIENCE_LEVELS.map(lvl => (
                          <option key={lvl} value={lvl}>{lvl}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className={styles.stepContent}>
                  <div className={styles.stepHeader}>
                    <div className={styles.stepIconBig}><Code size={24} /></div>
                    <div>
                      <h2 className={styles.stepTitle}>Skills & Interests</h2>
                      <p className={styles.stepDesc}>Select skills and interests so our AI can find perfect matches</p>
                    </div>
                  </div>
                  <div className={styles.fields}>
                    <div className={styles.field}>
                      <label className={styles.label}>
                        Technical Skills <span className={styles.req}>*</span>
                      </label>
                      <p className={styles.hint}>Selected: {formData.skills.length}</p>
                      {errors.skills && <p className={styles.error}>{errors.skills}</p>}
                      <div className={styles.chipGrid}>
                        {SKILL_OPTIONS.map(skill => (
                          <button
                            key={skill}
                            type="button"
                            className={`${styles.chip} ${formData.skills.includes(skill) ? styles.chipSelected : ''}`}
                            onClick={() => toggleItem('skills', skill)}
                          >
                            {formData.skills.includes(skill) && <Check size={12} />}
                            {skill}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Interests</label>
                      <div className={styles.chipGrid}>
                        {INTEREST_OPTIONS.map(interest => (
                          <button
                            key={interest}
                            type="button"
                            className={`${styles.chip} ${styles.chipInterest} ${formData.interests.includes(interest) ? styles.chipSelected : ''}`}
                            onClick={() => toggleItem('interests', interest)}
                          >
                            {formData.interests.includes(interest) && <Check size={12} />}
                            {interest}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className={styles.stepContent}>
                  <div className={styles.stepHeader}>
                    <div className={styles.stepIconBig}><Target size={24} /></div>
                    <div>
                      <h2 className={styles.stepTitle}>Career Goals</h2>
                      <p className={styles.stepDesc}>Tell us what you want to achieve with your network</p>
                    </div>
                  </div>
                  <div className={styles.fields}>
                    <div className={styles.field}>
                      <label htmlFor="bio" className={styles.label}>Professional Bio</label>
                      <textarea
                        id="bio"
                        className={styles.textarea}
                        placeholder="Describe your professional background, what you've built, and what drives you..."
                        value={formData.bio}
                        onChange={e => update('bio', e.target.value)}
                        rows={4}
                      />
                      <p className={styles.hint}>{formData.bio.length}/300 characters</p>
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="careerGoals" className={styles.label}>Career Goals</label>
                      <textarea
                        id="careerGoals"
                        className={styles.textarea}
                        placeholder="What are your professional aspirations? What impact do you want to create?"
                        value={formData.careerGoals}
                        onChange={e => update('careerGoals', e.target.value)}
                        rows={4}
                      />
                    </div>
                    <div className={styles.summaryBox}>
                      <p className={styles.summaryTitle}>✨ Profile Summary</p>
                      <div className={styles.summaryGrid}>
                        {[
                          ['Name', formData.name],
                          ['Industry', formData.industry],
                          ['Role', formData.role],
                          [
                            'Skills',
                            formData.skills.slice(0, 3).join(', ') +
                              (formData.skills.length > 3 ? ` +${formData.skills.length - 3}` : '') ||
                              'None selected',
                          ],
                        ].map(([k, v]) => (
                          <div key={k} className={styles.summaryItem}>
                            <span className={styles.summaryKey}>{k}</span>
                            <span className={styles.summaryVal}>{v || '—'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className={styles.formActions}>
            {step > 1 && (
              <button type="button" className={styles.backBtn} onClick={back}>
                <ArrowLeft size={16} /> Back
              </button>
            )}
            <div style={{ flex: 1 }} />
            {step < 4 ? (
              <motion.button
                type="button"
                className={styles.nextBtn}
                onClick={next}
                whileTap={{ scale: 0.97 }}
              >
                Next Step <ArrowRight size={16} />
              </motion.button>
            ) : (
              <motion.button
                type="button"
                className={styles.submitBtn}
                onClick={handleSubmit}
                disabled={loading}
                whileTap={{ scale: 0.97 }}
              >
                {loading ? (
                  <span className={styles.spinner} />
                ) : (
                  <><Check size={16} /> Create Account</>
                )}
              </motion.button>
            )}
          </div>
        </div>

        <p className={styles.loginLink}>
          Already have an account?{' '}
          <Link to="/login" className={styles.loginAnchor}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
