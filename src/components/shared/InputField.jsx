import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './InputField.module.css';

const InputField = ({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  hint,
  icon,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`${styles.field} ${className}`}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-hidden="true"> *</span>}
        </label>
      )}
      <div className={`${styles.inputWrapper} ${error ? styles.hasError : ''} ${disabled ? styles.disabled : ''}`}>
        {icon && <span className={styles.iconLeft}>{icon}</span>}
        <input
          id={id}
          type={inputType}
          className={`${styles.input} ${icon ? styles.hasIcon : ''} ${type === 'password' ? styles.hasToggle : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          {...props}
        />
        {type === 'password' && (
          <button
            type="button"
            className={styles.togglePassword}
            onClick={() => setShowPassword(p => !p)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p id={`${id}-error`} className={styles.errorMsg} role="alert">{error}</p>}
      {hint && !error && <p id={`${id}-hint`} className={styles.hint}>{hint}</p>}
    </div>
  );
};

export default InputField;
