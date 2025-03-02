'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './styles/Home.module.css';
import LogoutButton from './components/LogoutButton';
import DashboardButton from './components/DashboardButton';

interface UserStats {
  username: string;
  highestScore: number;
  ranking: number;
  totalPlayers: number;
}

export default function HomePage() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const res = await fetch('/api/user/stats');
        if (res.ok) {
          const data = await res.json();
          setUserStats(data);
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };
    fetchUserStats();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Globetrotter Challenge</h1>
          <div className={styles.headerButtons}>
            <DashboardButton />
            <LogoutButton />
          </div>
        </div>

        <div className={styles.welcomeSection}>
          <h2 className={styles.welcomeTitle}>
            {userStats ? `Welcome back, ${userStats.username}!` : 'Welcome to Globetrotter!'}
          </h2>
          <p className={styles.welcomeSubtitle}>
            Test your geography knowledge and compete with players worldwide
          </p>
          <div className={styles.actionCards}>
            <Link href="/play" className={styles.actionCard}>
              <span className={styles.actionIcon}>🎮</span>
              <div className={styles.actionContent}>
                <h3>Play Now</h3>
                <p>Start a new game and challenge yourself</p>
              </div>
            </Link>
            <Link href="/leaderboard" className={styles.actionCard}>
              <span className={styles.actionIcon}>🏆</span>
              <div className={styles.actionContent}>
                <h3>Leaderboard</h3>
                <p>See how you rank against other players</p>
              </div>
            </Link>
            <Link href="/profile" className={styles.actionCard}>
              <span className={styles.actionIcon}>👤</span>
              <div className={styles.actionContent}>
                <h3>Profile</h3>
                <p>View your stats and achievements</p>
              </div>
            </Link>
          </div>
        </div>

        <div className={styles.featuresSection}>
          <h2 className={styles.sectionTitle}>Game Features</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>🌍</span>
              <h3>Global Destinations</h3>
              <p>Explore cities and landmarks from around the world</p>
            </div>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>⏱️</span>
              <h3>Time Challenge</h3>
              <p>Race against the clock to earn more points</p>
            </div>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>📈</span>
              <h3>Multiple Difficulties</h3>
              <p>Choose your challenge level from Easy to Brutal</p>
            </div>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>🎯</span>
              <h3>Achievement System</h3>
              <p>Unlock badges and track your progress</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}