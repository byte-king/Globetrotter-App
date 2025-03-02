'use client'

import { useRouter } from 'next/navigation';
import styles from '../styles/LogoutButton.module.css';

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        router.push('/login');
        router.refresh();
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <button 
      className={styles.logoutButton}
      onClick={handleLogout}
    >
      🚪 Logout
    </button>
  );
};

export default LogoutButton; 