import React from 'react';
import styles from './SkillTag.module.css';

const SkillTag = ({ skill, variant = 'default', size = 'md', removable = false, onRemove, onClick }) => {
  return (
    <span
      className={`${styles.tag} ${styles[variant]} ${styles[size]} ${onClick ? styles.clickable : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {skill}
      {removable && (
        <button
          className={styles.remove}
          onClick={(e) => { e.stopPropagation(); onRemove?.(skill); }}
          aria-label={`Remove ${skill}`}
        >
          ×
        </button>
      )}
    </span>
  );
};

export default SkillTag;
