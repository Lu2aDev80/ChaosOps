import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Mail, RefreshCw, ArrowLeft } from 'lucide-react';
import FlipchartBackground from '../components/layout/FlipchartBackground';
import { AlertModal } from '../components/ui';
import styles from './Admin.module.css';

interface VerificationResult {
  success: boolean;
  message: string;
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
    emailVerified: boolean;
  };
  organisation?: {
    id: string;
    name: string;
    description?: string;
  };
}

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [resending, setResending] = useState(false);
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string; type?: 'info' | 'success' | 'warning' | 'error' }>({ isOpen: false, title: '', message: '' });

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setResult({
        success: false,
        message: 'Kein Bestätigungstoken gefunden. Bitte überprüfe den Link aus deiner E-Mail.',
      });
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    setVerifying(true);
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${apiBaseUrl}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message || 'E-Mail-Adresse erfolgreich bestätigt!',
          user: data.user,
          organisation: data.organisation,
        });
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setResult({
          success: false,
          message: data.error || 'Bestätigung fehlgeschlagen',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Verbindungsfehler. Bitte versuche es später erneut.',
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleResendEmail = async () => {
    if (!result?.user?.email || !result?.organisation?.id) {
      setAlertModal({
        isOpen: true,
        title: 'Fehler',
        message: 'Keine E-Mail-Adresse oder Organisation gefunden.',
        type: 'error'
      });
      return;
    }

    setResending(true);
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${apiBaseUrl}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: result.user.email,
          organisationId: result.organisation.id,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setAlertModal({
          isOpen: true,
          title: 'Erfolg',
          message: 'Bestätigungs-E-Mail wurde erneut gesendet!',
          type: 'success'
        });
      } else {
        setAlertModal({
          isOpen: true,
          title: 'Fehler',
          message: data.error || 'Fehler beim Senden der E-Mail',
          type: 'error'
        });
      }
    } catch (error) {
      setAlertModal({
        isOpen: true,
        title: 'Fehler',
        message: 'Verbindungsfehler beim Senden der E-Mail',
        type: 'error'
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className={styles.adminWrapper} role="main" aria-label="E-Mail-Bestätigung">
      <FlipchartBackground />

      <main className={styles.adminContent} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
        padding: '2rem 1rem',
        maxWidth: '600px',
        margin: '0 auto',
      }}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>E-Mail-Bestätigung</h1>
          <p className={styles.subtitle}>Chaos Ops Account-Aktivierung</p>
        </div>

        {/* Main Card */}
        <div className={styles.adminCard} style={{ width: '100%' }}>
          {verifying ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <RefreshCw 
                size={48} 
                style={{ 
                  animation: 'spin 1s linear infinite',
                  color: '#10b981',
                  marginBottom: '1rem',
                }} 
              />
              <h3 style={{ 
                fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                fontSize: '1.5rem',
                marginBottom: '0.5rem',
                color: '#181818',
              }}>
                E-Mail wird bestätigt...
              </h3>
              <p style={{ color: '#64748b' }}>
                Einen Moment bitte, wir prüfen deine Bestätigung.
              </p>
            </div>
          ) : result ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              {result.success ? (
                <>
                  <CheckCircle 
                    size={64} 
                    style={{ 
                      color: '#10b981',
                      marginBottom: '1.5rem',
                    }} 
                  />
                  <h3 style={{ 
                    fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                    fontSize: '1.8rem',
                    marginBottom: '1rem',
                    color: '#181818',
                  }}>
                    Erfolgreich bestätigt! 🎉
                  </h3>
                  <p style={{ 
                    color: '#64748b',
                    marginBottom: '1.5rem',
                    fontSize: '1.1rem',
                  }}>
                    {result.message}
                  </p>
                  
                  {result.user && result.organisation && (
                    <div style={{
                      background: '#f0fdf4',
                      border: '2px solid #16a34a',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginBottom: '1.5rem',
                      textAlign: 'left',
                    }}>
                      <h4 style={{ 
                        margin: '0 0 0.5rem 0',
                        color: '#15803d',
                        fontWeight: '600',
                      }}>
                        Account-Details:
                      </h4>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#166534' }}>
                        <strong>Benutzer:</strong> {result.user.username}
                      </p>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#166534' }}>
                        <strong>E-Mail:</strong> {result.user.email}
                      </p>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#166534' }}>
                        <strong>Organisation:</strong> {result.organisation.name}
                      </p>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#166534' }}>
                        <strong>Rolle:</strong> {result.user.role === 'admin' ? 'Administrator' : 'Mitglied'}
                      </p>
                    </div>
                  )}
                  
                  <p style={{ 
                    color: '#64748b',
                    fontSize: '0.9rem',
                    fontStyle: 'italic',
                  }}>
                    Du wirst automatisch zum Dashboard weitergeleitet...
                  </p>
                </>
              ) : (
                <>
                  <XCircle 
                    size={64} 
                    style={{ 
                      color: '#ef4444',
                      marginBottom: '1.5rem',
                    }} 
                  />
                  <h3 style={{ 
                    fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                    fontSize: '1.8rem',
                    marginBottom: '1rem',
                    color: '#181818',
                  }}>
                    Bestätigung fehlgeschlagen
                  </h3>
                  <p style={{ 
                    color: '#ef4444',
                    marginBottom: '1.5rem',
                    fontSize: '1.1rem',
                  }}>
                    {result.message}
                  </p>
                  
                  {result.message.includes('expired') && (
                    <div style={{
                      background: '#fef3c7',
                      border: '2px solid #d97706',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginBottom: '1.5rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Mail size={20} style={{ color: '#d97706' }} />
                        <strong style={{ color: '#92400e' }}>Token abgelaufen</strong>
                      </div>
                      <p style={{ margin: '0', color: '#92400e', fontSize: '0.9rem' }}>
                        Der Bestätigungslink ist nach 24 Stunden abgelaufen. Du kannst eine neue Bestätigungs-E-Mail anfordern.
                      </p>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {(result.message.includes('expired') || result.message.includes('Invalid')) && (
                      <button
                        onClick={handleResendEmail}
                        disabled={resending}
                        style={{
                          padding: '0.75rem 1.5rem',
                          border: '2px solid #181818',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          fontWeight: '600',
                          backgroundColor: '#3b82f6',
                          color: '#fff',
                          cursor: resending ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          boxShadow: '2px 4px 0 #181818',
                          opacity: resending ? 0.7 : 1,
                        }}
                      >
                        <Mail size={18} />
                        {resending ? 'Wird gesendet...' : 'Neue E-Mail anfordern'}
                      </button>
                    )}
                    
                    <button
                      onClick={() => navigate('/')}
                      style={{
                        padding: '0.75rem 1.5rem',
                        border: '2px solid #181818',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        backgroundColor: '#64748b',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '2px 4px 0 #181818',
                      }}
                    >
                      <ArrowLeft size={18} />
                      Zur Startseite
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : null}
        </div>
        
        {/* Help Card */}
        <div className={styles.adminCard} style={{ width: '100%' }}>
          <h3 className={styles.cardTitle}>💡 Hilfe</h3>
          <div className={styles.cardContent}>
            <p><strong>Probleme mit der Bestätigung?</strong></p>
            <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
              <li>Überprüfe den Spam-Ordner in deinem E-Mail-Postfach</li>
              <li>Stelle sicher, dass der Link vollständig kopiert wurde</li>
              <li>Der Bestätigungslink ist nur 24 Stunden gültig</li>
              <li>Pro E-Mail-Adresse kann nur ein Account existieren</li>
            </ul>
            <p>
              <strong>Noch Fragen?</strong> Kontaktiere uns unter{' '}
              <a href="mailto:info@lu2adevelopment.de" style={{ color: '#2563eb', textDecoration: 'none' }}>
                info@lu2adevelopment.de
              </a>
            </p>
          </div>
        </div>
      </main>

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
};

export default VerifyEmail;