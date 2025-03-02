'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import styles from './register.module.css';
import { isValidUsername, isValidEmail } from '../utils/validation';

export default function RegisterPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: ''
  });
  const [error, setError] = useState('');
  const [generatedUsername, setGeneratedUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Generate username when component mounts
    generateNewUsername();
  }, []);

  const generateNewUsername = async () => {
    try {
      const res = await fetch('/api/generate-username');
      const data = await res.json();
      setGeneratedUsername(data.username);
      setFormData(prev => ({ ...prev, username: data.username }));
    } catch (error) {
      console.error('Error generating username:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user types
  };

  const validateForm = () => {
    // For new accounts, check all fields
    if (mode === 'new') {
      if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('All fields are required');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    } else {
      // For account recovery, only check username, email and password
      if (!formData.username || !formData.email || !formData.password) {
        setError('All fields are required');
        return false;
      }
    }

    if (!isValidUsername(formData.username)) {
      setError('Username must contain only letters');
      return false;
    }

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      if (mode === 'new') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password
          })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Registration failed');
        }

        // Show success message with username
        alert(`Account created successfully! Your username is: ${formData.username}\nPlease save this username for future login.`);
        router.push('/login?registered=true');
      } else {
        // Handle existing account recovery
        const res = await fetch('/api/auth/recover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password
          })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Account recovery failed');
        }

        router.push('/login?recovered=true');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h1>{mode === 'new' ? 'Create Account' : 'Recover Account'}</h1>
        <p className={styles.subtitle}>
          {mode === 'new' 
            ? 'Join the Globetrotter Challenge!' 
            : 'Recover your existing account'}
        </p>

        <div className={styles.modeToggle}>
          <button 
            className={`${styles.modeButton} ${mode === 'new' ? styles.active : ''}`}
            onClick={() => setMode('new')}
          >
            New Account
          </button>
          <button 
            className={`${styles.modeButton} ${mode === 'existing' ? styles.active : ''}`}
            onClick={() => setMode('existing')}
          >
            Existing Account
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === 'new' && (
            <div className={styles.usernameSection}>
              <div className={styles.inputGroup}>
                <label>Your Username (Auto-generated)</label>
                <div className={styles.usernameDisplay}>
                  <input
                    type="text"
                    value={formData.username}
                    readOnly
                    className={styles.usernameInput}
                  />
                  <button 
                    type="button" 
                    onClick={generateNewUsername}
                    className={styles.regenerateButton}
                  >
                    🔄 New
                  </button>
                </div>
                <p className={styles.usernameNote}>
                  Please save this username - you'll need it to recover your account!
                </p>
              </div>
            </div>
          )}

          {mode === 'existing' && (
            <div className={styles.inputGroup}>
              <label htmlFor="username">Your Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Enter your saved username"
              />
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">
              {mode === 'new' ? 'Create Password' : 'New Password'}
            </label>
            <div className={styles.passwordInput}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.showPasswordButton}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
          </div>

          {mode === 'new' && (
            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className={styles.passwordInput}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={styles.showPasswordButton}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading 
              ? 'Processing...' 
              : mode === 'new' 
                ? 'Create Account' 
                : 'Recover Account'}
          </button>
        </form>

        <p className={styles.loginLink}>
          Already have an account? <Link href="/login">Log In</Link>
        </p>
      </div>
    </div>
  );
} 