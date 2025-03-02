'use client'
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Show success message if redirected from registration or recovery
    const registered = searchParams.get('registered');
    const recovered = searchParams.get('recovered');
    
    if (registered) {
      setSuccessMessage('Registration successful! Please log in with your username.');
    } else if (recovered) {
      setSuccessMessage('Account recovered! Please log in with your new password.');
    }

    // Pre-fill username if provided
    const username = searchParams.get('username');
    if (username) {
      setFormData(prev => ({ ...prev, username }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h1>Welcome Back!</h1>
        <p className={styles.subtitle}>Log in to continue your Globetrotter journey</p>

        {successMessage && (
          <div className={styles.success}>{successMessage}</div>
        )}

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
              autoComplete="username"
              autoFocus={!formData.username}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <div className={styles.passwordInput}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                autoComplete="current-password"
                autoFocus={!!formData.username}
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

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className={styles.loadingText}>
                <span className={styles.spinner}></span>
                Logging in...
              </span>
            ) : (
              'Log In'
            )}
          </button>
        </form>

        <div className={styles.links}>
          <Link href="/register" className={styles.registerLink}>
            Create Account
          </Link>
          <span className={styles.divider}>•</span>
          <Link href="/register?mode=existing" className={styles.recoverLink}>
            Recover Account
          </Link>
        </div>
      </div>
    </div>
  );
} 