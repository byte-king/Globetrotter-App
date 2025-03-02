'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../styles/DashboardButton.module.css';

const DashboardButton = () => {
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Link href="/dashboard" className={styles.dashboardButton}>
      📊 Dashboard
    </Link>
  );
};

export default DashboardButton; 