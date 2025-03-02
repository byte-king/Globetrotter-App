'use client'

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from '../styles/LogoutButton.module.css';

const LogoutButton = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/user/stats');
        setIsAuthenticated(res.ok);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

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
    } catch {
      console.error('Error during logout');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

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