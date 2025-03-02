'use client'
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import styles from './register.module.css';
import { isValidUsername, isValidEmail } from '../utils/validation';

export default function RegisterPage() {
  const router = useRouter();
  const [mode, /* setMode */] = useState<'new' | 'existing'>('new');  // Currently unused but needed for validation
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingUsername, setIsGeneratingUsername] = useState(false);

  useEffect(() => {
    // Generate username when component mounts
    generateNewUsername();
  }, []);

  const generateNewUsername = async () => {
    try {
      setIsGeneratingUsername(true);
      const res = await fetch('/api/generate-username');
      const data = await res.json();
      setFormData(prev => ({ ...prev, username: data.username }));
    } catch (error) {
      console.error('Error generating username:', error);
    } finally {
      setIsGeneratingUsername(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user types
  };

  const validateForm = (): boolean => {
    // For new accounts, check all fields
    if (mode === 'new') {
      if (!formData.username || !formData.email || !formData.password) {
        setError('All fields are required');
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
          body: JSON.stringify(formData)
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Registration failed');
        }

        // Show success message with username
        alert(`Account created successfully! Your username is: ${formData.username}\nPlease save this username for future login.`);
        router.push(`/login?registered=true&username=${formData.username}`);
      } else {
        // Handle existing account recovery
        const res = await fetch('/api/auth/recover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
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
      <div className={styles.formContainer}>
        <h1>Create Account</h1>
        <p className={styles.subtitle}>Join the world&apos;s most exciting geography game!</p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="username">Username</label>
            <div className={styles.usernameInputGroup}>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                required
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9_-]+"
                title="Username can only contain letters, numbers, underscores, and hyphens"
              />
              <button 
                type="button" 
                onClick={generateNewUsername} 
                className={styles.generateButton}
                disabled={isGeneratingUsername}
              >
                {isGeneratingUsername ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
              minLength={6}
            />
          </div>

          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className={styles.links}>
          <Link href="/login" className={styles.link}>
            Already have an account? Log in
          </Link>
        </div>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
} 