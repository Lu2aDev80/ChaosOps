import React from 'react';
import styles from '../../pages/Admin.module.css';
import { Home, Monitor } from 'lucide-react';

export const FooterAdmin: React.FC<{ icon?: 'home' | 'monitor', text: string }> = ({ icon = 'home', text }) => (
  <a href="/" style={{
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
  }}>
    <footer className={styles.footer} style={{ cursor: 'pointer', width: '100%' }}>
      <span className={styles.footerIcon} aria-hidden="true">
        {icon === 'home' ? <Home size={16} /> : <Monitor size={16} />}
      </span>
      <span>{text}</span>
    </footer>
  </a>
);

export default FooterAdmin;
