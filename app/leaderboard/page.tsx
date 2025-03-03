'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/Leaderboard.module.css';

interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  streak: number;
  difficulty: string;
  createdAt: string;
}

interface LeaderboardStats {
  totalPlayers: number;
  highestScore: number;
  averageScore: number;
  totalGames: number;
}

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('all');
  const [stats, setStats] = useState<LeaderboardStats>({
    totalPlayers: 0,
    highestScore: 0,
    averageScore: 0,
    totalGames: 0
  });

  useEffect(() => {
    fetchLeaderboard();
  }, [filter, timeRange]);

  const fetchLeaderboard = async () => {
    try {
      setRefreshing(true);
      const res = await fetch(`/api/leaderboard?difficulty=${filter}&timeRange=${timeRange}`);
      const data = await res.json();
      
      // Ensure data is always an array
      const leaderboardData = Array.isArray(data) ? data : [];
      
      setLeaderboard(leaderboardData);
      
      // Calculate stats from the array
      const uniquePlayers = new Set(leaderboardData.map((entry: LeaderboardEntry) => entry.username)).size;
      const highestScore = leaderboardData.length > 0 
        ? Math.max(...leaderboardData.map((entry: LeaderboardEntry) => entry.score))
        : 0;
      const avgScore = leaderboardData.length 
        ? Math.round(leaderboardData.reduce((acc: number, curr: LeaderboardEntry) => acc + curr.score, 0) / leaderboardData.length)
        : 0;

      setStats({
        totalPlayers: uniquePlayers,
        highestScore: highestScore,
        averageScore: avgScore,
        totalGames: leaderboardData.length
      });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      // Set empty state on error
      setLeaderboard([]);
      setStats({
        totalPlayers: 0,
        highestScore: 0,
        averageScore: 0,
        totalGames: 0
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  console.log("This is leaderboard",leaderboard)
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleRefresh = () => {
    fetchLeaderboard();
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST'
      });
      if (res.ok) {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Global Rankings</h1>
        <div className={styles.headerButtons}>
          <Link href="/" className={styles.homeButton}>
            🏠 Home
          </Link>
          <button 
            className={`${styles.refreshButton} ${refreshing ? styles.refreshing : ''}`}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            ↻ Refresh
          </button>
          <button 
            className={styles.logoutButton}
            onClick={handleLogout}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statsCard}>
          <span className={styles.statsLabel}>Total Players</span>
          <span className={styles.statsValue}>{stats.totalPlayers}</span>
        </div>
        <div className={styles.statsCard}>
          <span className={styles.statsLabel}>Highest Score</span>
          <span className={styles.statsValue}>{stats.highestScore?.toLocaleString()}</span>
        </div>
        <div className={styles.statsCard}>
          <span className={styles.statsLabel}>Average Score</span>
          <span className={styles.statsValue}>{stats.averageScore?.toLocaleString()}</span>
        </div>
        <div className={styles.statsCard}>
          <span className={styles.statsLabel}>Total Games</span>
          <span className={styles.statsValue}>{stats.totalGames}</span>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>Difficulty:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="brutal">Brutal</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Time Range:</label>
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading rankings...</p>
        </div>
      ) : (
        <div className={styles.leaderboardTable}>
          <div className={styles.tableHeader}>
            <div className={styles.rank}>Rank</div>
            <div className={styles.player}>Player</div>
            <div className={styles.score}>Score</div>
            <div className={styles.streak}>Best Streak</div>
            <div className={styles.difficulty}>Difficulty</div>
            <div className={styles.date}>Date</div>
          </div>

          {leaderboard?.map((entry, index) => (
            <div key={entry.id} className={styles.tableRow}>
              <div className={styles.rank}>
                {index < 3 ? (
                  <span className={styles.medal}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </span>
                ) : `#${index + 1}`}
              </div>
              <div className={styles.player}>
                {entry.username}
              </div>
              <div className={styles.score}>{entry.score.toLocaleString()}</div>
              <div className={styles.streak}>
                <span className={styles.streakIcon}>🔥</span>
                {entry.streak}
              </div>
              <div 
                className={styles.difficulty}
                data-difficulty={entry?.difficulty?.toLowerCase()}
              >
                {entry.difficulty}
              </div>
              <div className={styles.date}>{formatDate(entry.createdAt)}</div>
            </div>
          ))}

          {leaderboard.length === 0 && (
            <div className={styles.noResults}>
              <p>No scores found for the selected filters</p>
              <button 
                className={styles.clearFiltersButton}
                onClick={() => {
                  setFilter('all');
                  setTimeRange('all');
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Leaderboard; 
