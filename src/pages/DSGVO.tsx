
import React from 'react';
import { BackButton } from '../components/ui';
import { getLastNonLegalRoute } from '../hooks/useLastNonLegalRoute';
import FlipchartBackground from '../components/layout/FlipchartBackground';
import styles from './Admin.module.css';

interface DSGVOProps {
  embedded?: boolean;
}

const DSGVO: React.FC<DSGVOProps> = ({ embedded = false }) => {
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
          Datenschutzerklärung (DSGVO)
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
            Wir nehmen den Schutz deiner personenbezogenen Daten ernst.<br />
            Diese Erklärung beschreibt, welche Daten wir sammeln, wofür wir sie verwenden und welche Rechte du hast.
          </p>

          <div style={{ marginBottom: '2.2rem' }}>
            <h3 style={{ margin: '2.2rem 0 0.7rem 0', fontSize: '1.18rem', color: '#1a202c', fontWeight: 700, letterSpacing: '0.01em' }}>1. Verantwortlicher</h3>
            <div style={{ paddingLeft: '0.5rem' }}>
              Verantwortlich für die Datenverarbeitung ist:<br />
              <span style={{ fontWeight: 600 }}>Luca Steinhagen</span> (Kontakt: <a href="mailto:info@lu2adevelopment.de" style={{ color: '#2563eb', textDecoration: 'underline' }}>info@lu2adevelopment.de</a>).
            </div>
          </div>

          <div style={{ marginBottom: '2.2rem' }}>
            <h3 style={{ margin: '2.2rem 0 0.7rem 0', fontSize: '1.18rem', color: '#1a202c', fontWeight: 700, letterSpacing: '0.01em' }}>2. Welche Daten wir verarbeiten</h3>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', listStyle: 'disc' }}>
              <li>Registrierungsdaten (Name, E-Mail, Benutzername)</li>
              <li>Organisationsdaten (Name, Beschreibung, ggf. Logo)</li>
              <li>Nutzungsdaten (Einstellungen, Login-Zeiten)</li>
            </ul>
          </div>

          <div style={{ marginBottom: '2.2rem' }}>
            <h3 style={{ margin: '2.2rem 0 0.7rem 0', fontSize: '1.18rem', color: '#1a202c', fontWeight: 700, letterSpacing: '0.01em' }}>3. Zweck der Verarbeitung</h3>
            <div style={{ paddingLeft: '0.5rem' }}>
              Die Datenverarbeitung erfolgt zur Bereitstellung und Verbesserung des Dienstes,<br />
              zur Authentifizierung, Benachrichtigung (E-Mails) und zur Erfüllung vertraglicher Pflichten.
            </div>
          </div>

          <div style={{ marginBottom: '2.2rem' }}>
            <h3 style={{ margin: '2.2rem 0 0.7rem 0', fontSize: '1.18rem', color: '#1a202c', fontWeight: 700, letterSpacing: '0.01em' }}>4. Rechtsgrundlage</h3>
            <div style={{ paddingLeft: '0.5rem' }}>
              Die Verarbeitung erfolgt auf Basis von Art. 6 DSGVO (Vertragserfüllung, berechtigtes Interesse)<br />
              und — sofern erforderlich — mit Einwilligung (Art. 6 Abs. 1 lit. a).
            </div>
          </div>

          <div style={{ marginBottom: '2.2rem' }}>
            <h3 style={{ margin: '2.2rem 0 0.7rem 0', fontSize: '1.18rem', color: '#1a202c', fontWeight: 700, letterSpacing: '0.01em' }}>5. Speicherdauer</h3>
            <div style={{ paddingLeft: '0.5rem' }}>
              Personenbezogene Daten werden nur so lange gespeichert, wie es für die Zwecke erforderlich ist<br />
              oder gesetzliche Aufbewahrungsfristen bestehen.
            </div>
          </div>

          <div style={{ marginBottom: '2.2rem' }}>
            <h3 style={{ margin: '2.2rem 0 0.7rem 0', fontSize: '1.18rem', color: '#1a202c', fontWeight: 700, letterSpacing: '0.01em' }}>6. Deine Rechte</h3>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', listStyle: 'disc' }}>
              <li>Auskunft</li>
              <li>Berichtigung</li>
              <li>Löschung</li>
              <li>Einschränkung der Verarbeitung</li>
              <li>Datenübertragbarkeit</li>
              <li>Widerspruch</li>
            </ul>
            <div style={{ paddingLeft: '0.5rem', marginTop: '0.7rem' }}>
              Zur Ausübung wende dich an <a href="mailto:info@lu2adevelopment.de" style={{ color: '#2563eb', textDecoration: 'underline' }}>info@lu2adevelopment.de</a>.
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

export default DSGVO;
