import { useState } from 'react';
import styles from '../styles/UsernameModal.module.css';

interface UsernameModalProps {
  onSubmit: (username: string) => void;
  onClose: () => void;
}

const UsernameModal = ({ onSubmit, onClose }: UsernameModalProps) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }
    onSubmit(username.trim());
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Choose Your Username</h2>
        <p>Enter a username to challenge your friend!</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            maxLength={20}
            className={styles.input}
          />
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.buttons}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UsernameModal; 