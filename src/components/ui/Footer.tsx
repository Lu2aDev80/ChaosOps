import React from 'react';
import styles from '../planner/Planer.module.css';
import { PenLine } from 'lucide-react';



const Footer: React.FC = () => (
  <footer
    className={styles.footer}
    style={{
      cursor: 'pointer',
      width: '100%',
      background: 'var(--color-paper)',
      borderRadius: '0 0 1.2rem 1.2rem',
      margin: '0 auto',
      position: 'relative',
    }}
    onClick={() => window.location.href = '/'}
  >
    <span className={styles.footerIcon} aria-hidden="true"><PenLine size={20} /></span>
    <span style={{ fontWeight: 700, letterSpacing: '0.01em' }}>Chaos Ops. Organisiere, Plane, Zeige!</span>
  </footer>
);

export default Footer;
