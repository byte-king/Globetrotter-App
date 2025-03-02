'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './dashboard.module.css';
import LogoutButton from '../components/LogoutButton';

interface UserStats {
  username: string;
  highestScore: number;
  currentStreak: number;
  maxStreak: number;
  totalGames: number;
  averageScore: number;
  ranking: number;
  totalPlayers: number;
  recentScores: {
    value: number;
    difficulty: string;
    createdAt: string;
  }[];
  difficultyStats: {
    easy: number;
    medium: number;
    hard: number;
    brutal: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [challengeLink, setChallengeLink] = useState('');

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
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  const handleChallengeFriend = async () => {
    if (!userStats) return;

    const challengeId = Math.random().toString(36).substring(2, 15);
    const challengeData = {
      challengerId: userStats.username,
      challengerRank: userStats.ranking,
      challengerScore: userStats.highestScore,
      timestamp: Date.now()
    };
    
    localStorage.setItem(`challenge_${challengeId}`, JSON.stringify(challengeData));
    
    const link = `${window.location.origin}/?challenge=${challengeId}`;
    setChallengeLink(link);
    setShowShareModal(true);
  };

  const handleShare = async () => {
    if (!userStats) return;

    const shareText = `🌍 Can you beat my Globetrotter Challenge stats?\n` +
      `🏆 Rank: ${userStats.ranking}/${userStats.totalPlayers}\n` +
      `⭐ High Score: ${userStats.highestScore}\n` +
      `🎯 Best Streak: ${userStats.maxStreak}\n` +
      `Join the adventure: ${challengeLink}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Globetrotter Challenge',
          text: shareText,
          url: challengeLink
        });
      } catch (error) {
        console.error('Error sharing:', error);
        await navigator.clipboard.writeText(shareText);
        alert('Challenge link copied to clipboard!');
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      alert('Challenge link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading your stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Dashboard</h1>
        <div className={styles.headerButtons}>
          <Link href="/" className={styles.homeButton}>Home</Link>
          <LogoutButton />
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.welcomeCard}>
          <h2>Welcome back, {userStats?.username || 'Player'}! 👋</h2>
          <div className={styles.rankInfo}>
            <span className={styles.rankBadge}>
              Rank #{userStats?.ranking || '---'} of {userStats?.totalPlayers || '---'}
            </span>
          </div>
          <button onClick={handleChallengeFriend} className={styles.challengeButton}>
            Challenge Friends
          </button>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard} data-type="score">
            <span className={styles.statIcon}>🏆</span>
            <div className={styles.statInfo}>
              <h3>Highest Score</h3>
              <p>{userStats?.highestScore || 0}</p>
            </div>
          </div>

          <div className={styles.statCard} data-type="streak">
            <span className={styles.statIcon}>🔥</span>
            <div className={styles.statInfo}>
              <h3>Best Streak</h3>
              <p>{userStats?.maxStreak || 0}</p>
            </div>
          </div>

          <div className={styles.statCard} data-type="current">
            <span className={styles.statIcon}>⚡</span>
            <div className={styles.statInfo}>
              <h3>Current Streak</h3>
              <p>{userStats?.currentStreak || 0}</p>
            </div>
          </div>

          <div className={styles.statCard} data-type="average">
            <span className={styles.statIcon}>📊</span>
            <div className={styles.statInfo}>
              <h3>Average Score</h3>
              <p>{Math.round(userStats?.averageScore || 0)}</p>
            </div>
          </div>
        </div>

        <div className={styles.difficultyStats}>
          <h2>Challenge Progress</h2>
          <div className={styles.difficultyGrid}>
            {Object.entries(userStats?.difficultyStats || {}).map(([difficulty, count]) => (
              <div key={difficulty} className={styles.difficultyCard} data-difficulty={difficulty}>
                <h3>{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Challenges</h3>
                <p>{count} completed</p>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progress} 
                    style={{ 
                      width: `${userStats?.totalGames ? (count / userStats.totalGames) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.recentActivity}>
          <h2>Recent Games</h2>
          <div className={styles.recentScores}>
            {userStats?.recentScores?.map((score, index) => (
              <div key={index} className={styles.scoreCard}>
                <div className={styles.scoreInfo}>
                  <span className={styles.scoreValue}>{score.value}</span>
                  <span className={styles.scoreDifficulty} data-difficulty={score.difficulty}>
                    {score.difficulty}
                  </span>
                </div>
                <span className={styles.scoreDate}>
                  {new Date(score.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
            {(!userStats?.recentScores || userStats.recentScores.length === 0) && (
              <p className={styles.noScores}>No recent games played</p>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <button onClick={() => router.push('/')} className={styles.playButton}>
            Play New Game
          </button>
          <Link href="/leaderboard" className={styles.leaderboardButton}>
            View Global Rankings
          </Link>
        </div>
      </div>

      {showShareModal && (
        <div className={styles.shareModal}>
          <div className={styles.shareContent}>
            <h3>Challenge Your Friends!</h3>
            <p>Share this challenge link:</p>
            <div className={styles.linkBox}>
              <input type="text" readOnly value={challengeLink} />
              <button onClick={() => navigator.clipboard.writeText(challengeLink)}>
                Copy
              </button>
            </div>
            <div className={styles.shareButtons}>
              <button onClick={handleShare} className={styles.shareButton}>
                Share Challenge
              </button>
              <button onClick={() => setShowShareModal(false)} className={styles.closeButton}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 