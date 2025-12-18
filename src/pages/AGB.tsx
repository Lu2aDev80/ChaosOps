
import React from 'react';
import { BackButton } from '../components/ui';
import { getLastNonLegalRoute } from '../hooks/useLastNonLegalRoute';
import FlipchartBackground from '../components/layout/FlipchartBackground';
import styles from './Admin.module.css';

interface AGBProps {
  embedded?: boolean;
}

const AGB: React.FC<AGBProps> = ({ embedded = false }) => {
  const content = (
    <div style={{
      background: '#fff',
      borderRadius: '1.2rem 1.35rem 1.15rem 1.25rem',
      boxShadow: '2px 4px 0 #e5e7eb, 0 2px 8px 0 rgba(0,0,0,0.08)',
      padding: '2rem',
      border: '2px solid #181818',
      width: '100%',
      position: 'relative',
      transform: 'rotate(-0.3deg)',
      zIndex: 1
    }}>
      <div className={styles.tape} />
      {!embedded && (
        <span style={{ position: 'absolute', top: 16, left: 16, zIndex: 2 }}>
          <BackButton iconOnly to={getLastNonLegalRoute()} />
        </span>
      )}
      <div style={{ textAlign: 'center', marginTop: embedded ? '0' : '2rem' }}>
        <h1 style={{
          fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
          fontSize: 'clamp(2rem, 5vw, 2.5rem)',
          fontWeight: 800,
          color: '#181818',
          marginBottom: '0.5rem',
          letterSpacing: '0.01em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}>
          Allgemeine Geschäftsbedingungen (AGB)
        </h1>
        <p style={{ fontFamily: '"Inter", "Roboto", Arial, sans-serif', fontSize: '1.1rem', color: '#4a5568', lineHeight: '1.6' }}>Stand: Dezember 2025</p>
        <div
          style={{
            fontFamily: '"Inter", "Roboto", Arial, sans-serif',
            color: '#181818',
            textAlign: 'left',
            margin: '2.5rem auto 0 auto',
            maxWidth: 700,
            lineHeight: 1.7,
            fontSize: '1.08rem',
          }}
        >
          <p style={{ marginBottom: '2.2rem', fontSize: '1.13rem' }}>
            Diese AGB regeln die Nutzung der Webanwendung <b>Chaos Ops</b>.<br />
            Durch die Registrierung bzw. Anmeldung akzeptierst du diese Bedingungen.
          </p>

          <div style={{ marginBottom: '2.2rem' }}>
            <h3 style={{ margin: '2.2rem 0 0.7rem 0', fontSize: '1.18rem', color: '#1a202c', fontWeight: 700, letterSpacing: '0.01em' }}>1. Leistungsbeschreibung</h3>
            <div style={{ paddingLeft: '0.5rem' }}>
              Die Anwendung ermöglicht das Erstellen und Verwalten von Veranstaltungstagen,<br />
              Zeitplänen und Displays innerhalb einer Organisation.<br />
              Der Dienst wird nach jeweils aktuellen Angaben betrieben; Funktionalität kann sich mit Updates ändern.
            </div>
          </div>

          <div style={{ marginBottom: '2.2rem' }}>
            <h3 style={{ margin: '2.2rem 0 0.7rem 0', fontSize: '1.18rem', color: '#1a202c', fontWeight: 700, letterSpacing: '0.01em' }}>2. Registrierung und Zugang</h3>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', listStyle: 'disc' }}>
              <li>Für die Nutzung ist ein Benutzerkonto erforderlich.</li>
              <li>Bei der Registrierung sind wahrheitsgemäße Angaben zu machen.</li>
              <li>Das Konto darf nicht an Dritte weitergegeben werden.</li>
            </ul>
          </div>

          <div style={{ marginBottom: '2.2rem' }}>
            <h3 style={{ margin: '2.2rem 0 0.7rem 0', fontSize: '1.18rem', color: '#1a202c', fontWeight: 700, letterSpacing: '0.01em' }}>3. Haftung</h3>
            <div style={{ paddingLeft: '0.5rem' }}>
              Soweit gesetzlich zulässig, ist die Haftung auf Vorsatz und grobe Fahrlässigkeit beschränkt.<br />
              Für leicht fahrlässige Pflichtverletzungen besteht nur Haftung bei Verletzung wesentlicher Vertragspflichten.
            </div>
          </div>

          <div style={{ marginBottom: '2.2rem' }}>
            <h3 style={{ margin: '2.2rem 0 0.7rem 0', fontSize: '1.18rem', color: '#1a202c', fontWeight: 700, letterSpacing: '0.01em' }}>4. Änderungen der AGB</h3>
            <div style={{ paddingLeft: '0.5rem' }}>
              Änderungen werden rechtzeitig bekannt gegeben;<br />
              bei wesentlichen Änderungen ist eine erneute Zustimmung erforderlich.
            </div>
          </div>

          <div style={{ marginBottom: '2.2rem' }}>
            <h3 style={{ margin: '2.2rem 0 0.7rem 0', fontSize: '1.18rem', color: '#1a202c', fontWeight: 700, letterSpacing: '0.01em' }}>5. Anwendbares Recht</h3>
            <div style={{ paddingLeft: '0.5rem' }}>
              Es gilt deutsches Recht.<br />
              Gerichtsstand ist, soweit gesetzlich zulässig, der Sitz des Diensteanbieters.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className={styles.adminWrapper}>
      <FlipchartBackground />
      <main className={styles.adminContent} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', padding: '2rem 1rem', maxWidth: '900px', margin: '0 auto' }}>
        {content}
      </main>
    </div>
  );
};

export default AGB;
