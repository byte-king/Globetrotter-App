'use client'
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../styles/Game.module.css';
import LogoutButton from '../components/LogoutButton';

interface Destination {
  id: number;
  city: string;
  country: string;
  clues: string[];
  // funFacts: string[];  // Unused
  // trivia: string[];    // Unused
  difficulty: string;
}

interface UserStats {
  id: number;
  username: string;
  // score: number;      // Unused
  // streak: number;     // Unused
  highestScore: number;
}

interface GameState {
  destination: Destination | null;
  selectedOption: string;
  visibleClues: number;
  timeRemaining: number;
  score: number;
  streak: number;
  maxStreak: number;
  isTimerActive: boolean;
  selectedDifficulty: string;
  showDifficultySelect: boolean;
  options: string[];
  questionsAnswered: number;
  questionDistribution: Record<string, number>;
}

const TIMER_DURATION = 60;
const POINTS_PER_SECOND = 10;
const GAME_STATE_KEY = 'globetrotterGameState';
const TOTAL_QUESTIONS = 150;

const DIFFICULTY_RULES = {
  easy: {
    label: 'Easy',
    distribution: { easy: 0.5, medium: 0.2, hard: 0.1, brutal: 0 }
  },
  medium: {
    label: 'Medium',
    distribution: { easy: 0.15, medium: 1.0, hard: 0.2, brutal: 0.05 }
  },
  hard: {
    label: 'Hard',
    distribution: { easy: 0.15, medium: 0.15, hard: 1.5, brutal: 0.1 }
  },
  brutal: {
    label: 'Brutal',
    distribution: { easy: 0, medium: 0.15, hard: 0.25, brutal: 2.0 }
  }
} as const;

export default function GamePage() {
  const router = useRouter();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [feedback, setFeedback] = useState<{ feedback: string; funMessage: string } | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [visibleClues, setVisibleClues] = useState(2);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(TIMER_DURATION);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('medium');
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [showDifficultySelect, setShowDifficultySelect] = useState(true);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [questionDistribution, setQuestionDistribution] = useState<Record<string, number>>({
    easy: 0,
    medium: 0,
    hard: 0,
    brutal: 0
  });
  const [showShareModal, setShowShareModal] = useState(false);

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

  // Load saved game state on mount
  useEffect(() => {
    const savedState = localStorage.getItem(GAME_STATE_KEY);
    if (savedState) {
      const parsedState: GameState = JSON.parse(savedState);
      setDestination(parsedState.destination);
      setSelectedOption(parsedState.selectedOption);
      setVisibleClues(parsedState.visibleClues);
      setTimeRemaining(parsedState.timeRemaining);
      setScore(parsedState.score);
      setStreak(parsedState.streak);
      setMaxStreak(parsedState.maxStreak);
      setIsTimerActive(parsedState.isTimerActive);
      setSelectedDifficulty(parsedState.selectedDifficulty);
      setShowDifficultySelect(parsedState.showDifficultySelect);
      setOptions(parsedState.options);
      setQuestionsAnswered(parsedState.questionsAnswered);
      setQuestionDistribution(parsedState.questionDistribution);
    }
  }, []);

  // Save game state whenever it changes
  useEffect(() => {
    const gameState: GameState = {
      destination,
      selectedOption,
      visibleClues,
      timeRemaining,
      score,
      streak,
      maxStreak,
      isTimerActive,
      selectedDifficulty,
      showDifficultySelect,
      options,
      questionsAnswered,
      questionDistribution
    };
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState));
  }, [
    destination,
    selectedOption,
    visibleClues,
    timeRemaining,
    score,
    streak,
    maxStreak,
    isTimerActive,
    selectedDifficulty,
    showDifficultySelect,
    options,
    questionsAnswered,
    questionDistribution
  ]);

  // Timer effect
  useEffect(() => {
    if (!isTimerActive || timeRemaining <= 0) {
      if (timeRemaining <= 0) {
        handleGameOver();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsAnswerRevealed(true);
          setIsTimerActive(false);
          handleGameOver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerActive, timeRemaining]);

  const clearGameState = useCallback(() => {
    localStorage.removeItem(GAME_STATE_KEY);
  }, []);

  const handleGameOver = useCallback(async () => {
    try {
      clearGameState();
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          score, 
          streak: maxStreak,
          difficulty: selectedDifficulty,
          userId: userStats?.id
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setShowShareModal(true);
        router.push(`/scores?score=${score}&maxStreak=${maxStreak}&rank=${data.rank}`);
      }
    } catch (error) {
      console.error('Error saving score:', error);
    }
  }, [score, maxStreak, selectedDifficulty, router, clearGameState, userStats?.id]);

  const startGame = async () => {
    clearGameState();
    setShowDifficultySelect(false);
    setIsTimerActive(true);
    await fetchDestination();
  };

  const fetchRandomCities = async (excludeCity: string): Promise<string[]> => {
    try {
      const res = await fetch(`/api/random-cities?excludeCity=${encodeURIComponent(excludeCity)}&count=4`);
      const cities: string[] = await res.json();
      return cities;
    } catch (error) {
      console.error('Error fetching random cities:', error);
      return ["Paris", "Tokyo", "New York", "London"];
    }
  };

  const fetchDestination = async () => {
    setFeedback(null);
    setSelectedOption('');
    setVisibleClues(2);
    setIsAnswerRevealed(false);
    setTimeRemaining(TIMER_DURATION);
    setIsTimerActive(true);

    if (questionsAnswered >= TOTAL_QUESTIONS) {
      handleGameOver();
      return;
    }

    try {
      const res = await fetch(`/api/destination?difficulty=${selectedDifficulty}`);
      const data = await res.json();

      if (data && !data.error) {
        setDestination(data);
        setQuestionsAnswered(prev => prev + 1);
        setQuestionDistribution(prev => ({
          ...prev,
          [data.difficulty as keyof typeof prev]: (prev[data.difficulty as keyof typeof prev] || 0) + 1
        }));

        const randomCities = await fetchRandomCities(data.city);
        const uniqueOptions = new Set(randomCities);
        uniqueOptions.add(data.city);
        setOptions(Array.from(uniqueOptions).sort(() => Math.random() - 0.5));
      }
    } catch (error) {
      console.error('Error fetching destination:', error);
    }
  };

  const handleSubmit = async () => {
    if (!destination || !selectedOption) return;
    setIsTimerActive(false);
    
    const res = await fetch('/api/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destinationId: destination.id, guess: selectedOption }),
    });
    const result = await res.json();
    setFeedback(result);

    if (result.feedback === 'correct') {
      const pointsEarned = Math.round(timeRemaining * POINTS_PER_SECOND * 
        (DIFFICULTY_RULES[selectedDifficulty as keyof typeof DIFFICULTY_RULES].distribution[selectedDifficulty as keyof typeof DIFFICULTY_RULES['easy']['distribution']] || 1));
      setScore(prev => prev + pointsEarned);
      setStreak(prev => {
        const newStreak = prev + 1;
        setMaxStreak(current => Math.max(current, newStreak));
        return newStreak;
      });
      setTimeout(fetchDestination, 2000);
    } else {
      setTimeRemaining(prev => Math.max(0, prev - 10));
      if (visibleClues < destination.clues.length) {
        setVisibleClues(prev => prev + 1);
        setIsTimerActive(true);
      } else {
        setIsAnswerRevealed(true);
        handleGameOver();
      }
      setStreak(0);
    }
  };

  const handleShare = async () => {
    const shareText = `🌍 Globetrotter Challenge\n` +
      `🎯 Score: ${score}\n` +
      `🔥 Best Streak: ${maxStreak}\n` +
      `💪 Difficulty: ${selectedDifficulty}\n` +
      `🎮 Play now: ${window.location.origin}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Globetrotter Challenge',
          text: shareText,
          url: window.location.origin
        });
      } catch (error) {
        console.error('Error sharing:', error);
        await navigator.clipboard.writeText(shareText);
        setShowShareModal(true);
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      setShowShareModal(true);
    }
  };

  if (showDifficultySelect) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1>Globetrotter Challenge</h1>
            <div className={styles.headerButtons}>
              <Link href="/" className={styles.homeButton}>Home</Link>
              <Link href="/dashboard" className={styles.dashboardButton}>Dashboard</Link>
              <LogoutButton />
            </div>
          </div>
        </div>

        <div className={styles.difficultySelect}>
          <div className={styles.welcomeCard}>
            <h2>Select Your Challenge Level</h2>
            {userStats && (
              <div className={styles.statsHighlight}>
                <span>Your Best Score</span>
                <strong>{userStats.highestScore}</strong>
              </div>
            )}
          </div>

          <div className={styles.difficultyOptions}>
            {Object.entries(DIFFICULTY_RULES).map(([key, rule]) => (
              <button
                key={key}
                className={`${styles.difficultyButton} ${selectedDifficulty === key ? styles.selected : ''}`}
                onClick={() => setSelectedDifficulty(key)}
                data-difficulty={key}
              >
                <div className={styles.difficultyInfo}>
                  <span className={styles.difficultyLabel}>{rule.label}</span>
                  <span className={styles.multiplier}>
                    {rule.distribution[key as keyof typeof rule.distribution]}x Points
                  </span>
                </div>
                {selectedDifficulty === key && (
                  <span className={styles.selectedIndicator}>✓</span>
                )}
              </button>
            ))}
          </div>

          <div className={styles.actionButtons}>
            <button className={styles.startButton} onClick={startGame}>
              Start Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.gameHeader}>
        <div className={styles.headerContent}>
          <h1>Globetrotter Challenge</h1>
          <div className={styles.userInfo}>
            {userStats && (
              <>
                <span className={styles.username}>{userStats.username}</span>
                <span className={styles.score}>Score: {score}</span>
                <span className={styles.streak}>Streak: {streak}</span>
                <span className={styles.highScore}>Best: {userStats.highestScore}</span>
              </>
            )}
          </div>
          <div className={styles.headerButtons}>
            <Link href="/" className={styles.homeButton}>Home</Link>
            <Link href="/dashboard" className={styles.dashboardButton}>Dashboard</Link>
            <LogoutButton />
          </div>
        </div>
        <div className={styles.stats}>
          <div className={styles.timer} data-warning={timeRemaining < 10}>
            <span>{timeRemaining}s</span>
          </div>
        </div>
      </div>

      {destination && (
        <div className={styles.content}>
          <div className={styles.difficultyBadge} data-difficulty={destination.difficulty}>
            {destination.difficulty}
          </div>
          
          <h2 className={styles.title}>Where in the World?</h2>
          
          <div className={styles.clueContainer}>
            {destination.clues.slice(0, visibleClues).map((clue, idx) => (
              <div key={idx} className={styles.clue}>
                <span className={styles.clueNumber}>Clue {idx + 1}</span>
                <p>{clue}</p>
              </div>
            ))}
            {isAnswerRevealed && (
              <div className={styles.revealedAnswer}>
                <span className={styles.revealLabel}>Location Revealed</span>
                <strong>{destination.city}, {destination.country}</strong>
              </div>
            )}
          </div>

          <div className={styles.optionsGrid}>
            {options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedOption(option)}
                className={`${styles.optionButton} ${selectedOption === option ? styles.selected : ''}`}
                disabled={isAnswerRevealed || !isTimerActive}
              >
                {option}
                {selectedOption === option && <span className={styles.checkmark}>✓</span>}
              </button>
            ))}
          </div>

          <div className={styles.gameControls}>
            <button 
              className={`${styles.actionButton} ${styles.submitButton}`}
              onClick={handleSubmit}
              disabled={!isTimerActive || !selectedOption || timeRemaining <= 0}
            >
              Submit Answer
            </button>
            <button 
              className={`${styles.actionButton} ${styles.skipButton}`}
              onClick={isAnswerRevealed ? handleGameOver : fetchDestination}
              disabled={timeRemaining <= 0}
            >
              {isAnswerRevealed ? 'View Final Score' : 'Skip This One'}
            </button>
          </div>

          {feedback && (
            <div className={`${styles.feedback} ${
              feedback.feedback === 'correct' ? styles.feedbackCorrect : styles.feedbackIncorrect
            }`}>
              <div className={styles.feedbackContent}>
                {feedback.feedback === 'correct' ? (
                  <>
                    <span className={styles.feedbackIcon}>🎉</span>
                    <div className={styles.feedbackMessage}>
                      <p className={styles.mainMessage}>Correct!</p>
                      <p className={styles.subMessage}>
                        +{Math.round(timeRemaining * POINTS_PER_SECOND * 
                          (DIFFICULTY_RULES[selectedDifficulty as keyof typeof DIFFICULTY_RULES]
                            .distribution[selectedDifficulty as keyof typeof DIFFICULTY_RULES['easy']['distribution']] || 1))} points!
                      </p>
                      <p className={styles.funMessage}>{feedback.funMessage}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <span className={styles.feedbackIcon}>😢</span>
                    <div className={styles.feedbackMessage}>
                      <p className={styles.mainMessage}>Not quite right</p>
                      <p className={styles.subMessage}>Try another guess</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {showShareModal && (
        <div className={styles.shareModal}>
          <div className={styles.shareContent}>
            <h3>Share Your Score!</h3>
            <div className={styles.shareButtons}>
              <button onClick={handleShare} className={styles.shareButton}>
                Share Score
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