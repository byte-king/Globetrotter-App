'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/Profile.module.css';
import LogoutButton from '../components/LogoutButton';

interface UserStats {
  maxScore: number;
  currentStreak: number;
  maxStreak: number;
  totalGames: number;
  averageScore: number;
  email: string;
  username: string;
}

const Profile = () => {
  const [stats, setStats] = useState<UserStats>({
    maxScore: 0,
    currentStreak: 0,
    maxStreak: 0,
    totalGames: 0,
    averageScore: 0,
    email: '',
    username: ''
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async (): Promise<void> => {
    try {
      const res = await fetch('/api/user/stats');
      if (!res.ok) {
        throw new Error('Failed to fetch user stats');
      }
      const data: UserStats = await res.json();
      setStats(data);
    } catch (error: unknown) {
      let errorMessage: string = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setIsError(true);
      setMessage(`Failed to load user statistics: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/user/update-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail })
      });
      
      if (!res.ok) throw new Error('Failed to update email');
      
      setMessage('Email updated successfully');
      setIsError(false);
      setIsEditingEmail(false);
      setStats(prev => ({ ...prev, email: newEmail }));
      setNewEmail('');
    } catch (error) {
      setIsError(true);
      setMessage(`Failed to update email: ${error}`);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setIsError(true);
      setMessage(`Passwords do not match`);
      return;
    }

    try {
      const res = await fetch('/api/user/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });
      
      if (!res.ok) throw new Error('Failed to update password');
      
      setMessage('Password updated successfully');
      setIsError(false);
      setIsEditingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setIsError(true);
      setMessage(`Failed to update password: ${error}`);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Profile</h1>
        <div className={styles.headerButtons}>
          <Link href="/" className={styles.homeButton}>
            🏠 Home
          </Link>
          <LogoutButton />
        </div>
      </div>

      {message && (
        <div className={`${styles.message} ${isError ? styles.error : styles.success}`}>
          {message}
        </div>
      )}

      <div className={styles.statsGrid}>
        <div className={styles.statsCard}>
          <span className={styles.statsLabel}>Max Score</span>
          <span className={styles.statsValue}>{stats.maxScore.toLocaleString()}</span>
        </div>
        <div className={styles.statsCard}>
          <span className={styles.statsLabel}>Current Streak</span>
          <span className={styles.statsValue}>{stats.currentStreak}</span>
        </div>
        <div className={styles.statsCard}>
          <span className={styles.statsLabel}>Best Streak</span>
          <span className={styles.statsValue}>{stats.maxStreak}</span>
        </div>
        <div className={styles.statsCard}>
          <span className={styles.statsLabel}>Total Games</span>
          <span className={styles.statsValue}>{stats.totalGames}</span>
        </div>
        <div className={styles.statsCard}>
          <span className={styles.statsLabel}>Average Score</span>
          <span className={styles.statsValue}>{stats.averageScore.toLocaleString()}</span>
        </div>
      </div>

      <div className={styles.profileSection}>
        <h2>Account Settings</h2>
        
        <div className={styles.settingGroup}>
          <div className={styles.settingHeader}>
            <h3>Email</h3>
            <button 
              className={styles.editButton}
              onClick={() => setIsEditingEmail(!isEditingEmail)}
            >
              {isEditingEmail ? 'Cancel' : 'Edit'}
            </button>
          </div>
          {isEditingEmail ? (
            <form onSubmit={handleEmailUpdate} className={styles.form}>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="New email address"
                required
                className={styles.input}
              />
              <button type="submit" className={styles.submitButton}>
                Update Email
              </button>
            </form>
          ) : (
            <p className={styles.currentValue}>{stats.email}</p>
          )}
        </div>

        <div className={styles.settingGroup}>
          <div className={styles.settingHeader}>
            <h3>Password</h3>
            <button 
              className={styles.editButton}
              onClick={() => setIsEditingPassword(!isEditingPassword)}
            >
              {isEditingPassword ? 'Cancel' : 'Edit'}
            </button>
          </div>
          {isEditingPassword && (
            <form onSubmit={handlePasswordUpdate} className={styles.form}>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                required
                className={styles.input}
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                required
                className={styles.input}
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                className={styles.input}
              />
              <button type="submit" className={styles.submitButton}>
                Update Password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 