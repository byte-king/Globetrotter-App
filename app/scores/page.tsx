'use client'
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './scores.module.css';

interface Score {
  id: string;
  username: string;
  value: number;
  streak: number;
  difficulty: string;
  createdAt: string;
  rank: number;
  userId: string;
}

function ScoresContent() {
  const searchParams = useSearchParams();
  const [highScores, setHighScores] = useState<Score[]>([]);
  const [isNewRecord, setIsNewRecord] = useState(false);
  
  const currentScore = Number(searchParams.get('score')) || 0;
  const maxStreak = Number(searchParams.get('maxStreak')) || 0;

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await fetch('/api/scores');
        const data = await res.json();
        setHighScores(data.scores);
        
        // Check if current score is a new record
        if (data.scores.length > 0 && currentScore > data.scores[0].value) {
          setIsNewRecord(true);
        }
      } catch (error) {
        console.error('Error fetching scores:', error);
      }
    };

    fetchScores();
  }, [currentScore]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Game Over!</h1>
      
      <div className={styles.scoreCard}>
        <h2>Your Score</h2>
        <div className={styles.score}>{currentScore}</div>
        <div className={styles.streak}>Max Streak: {maxStreak}</div>
        
        {isNewRecord && (
          <div className={styles.newRecord}>
            🎉 New High Score! 🎉
          </div>
        )}
      </div>

      <div className={styles.highScores}>
        <h2>High Scores</h2>
        <div className={styles.scoresList}>
          {highScores.map((score, index) => (
            <div key={index} className={styles.scoreItem}>
              <span className={styles.rank}>#{score.rank}</span>
              <span className={styles.username}>{score.username || `Anonymous`}</span>
              <span className={styles.points}>{score.value}</span>
              <span className={styles.scoreStreak}>🔥 {score.streak}</span>
              <span className={styles.date}>
                {new Date(score.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        <Link href="/" className={styles.playAgain}>
          Play Again
        </Link>
        <Link href="/leaderboard" className={styles.viewLeaderboard}>
          Full Leaderboard
        </Link>
      </div>
    </div>
  );
}

// Loading fallback component
function ScoresLoading() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Game Over!</h1>
      <div className={styles.loading}>Loading scores...</div>
    </div>
  );
}

export default function ScoresPage() {
  return (
    <Suspense fallback={<ScoresLoading />}>
      <ScoresContent />
    </Suspense>
  );
} 