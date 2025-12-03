import React from 'react';
import { Outlet } from 'react-router-dom';
import FlipchartBackground from '../components/layout/FlipchartBackground';
import styles from './Admin.module.css';

const Admin: React.FC = () => {
  // Admin layout renders nested routes

  return (
    <div className={styles.adminWrapper} role="main" aria-label="Admin Bereich">
      <FlipchartBackground />

      <main className={styles.adminContent}>
        {/* Always render nested admin routes; handle selection within pages */}
        <Outlet />
      </main>
    </div>
  );
};

export default Admin;
