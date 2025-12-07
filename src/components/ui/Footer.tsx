import React from 'react';
import styles from '../planner/Planer.module.css';
import { PenLine } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => (
    <footer
        className={styles.footer}
        style={{
            width: '100%',
            background: 'var(--color-paper)',
            borderRadius: '0 0 1.2rem 1.2rem',
            margin: '0 auto',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingBottom: '0.5rem',
            paddingTop: '0.5rem',
        }}
    >
        <div style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/'}>
            <span className={styles.footerIcon} aria-hidden="true"><PenLine size={20} /></span>
            <span style={{ fontWeight: 700, letterSpacing: '0.01em' }}>Chaos Ops. Organisiere, Plane, Zeige!</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.2rem' }}>
            <Link to="/impressum" style={{ color: 'var(--color-ink)', fontSize: '0.95rem', textDecoration: 'underline', opacity: 0.9 }}>Impressum</Link>
            <Link to="/agb" style={{ color: 'var(--color-ink)', fontSize: '0.95rem', textDecoration: 'underline', opacity: 0.9 }}>AGB</Link>
            <Link to="/dsgvo" style={{ color: 'var(--color-ink)', fontSize: '0.95rem', textDecoration: 'underline', opacity: 0.9 }}>Datenschutz</Link>
        </div>
    </footer>
);

export default Footer;
