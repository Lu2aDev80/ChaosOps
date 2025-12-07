import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Monitor, Hash, RefreshCw, CheckCircle, Building2 } from 'lucide-react';
import FooterAdmin from '../components/ui/FooterAdmin';
import FlipchartBackground from '../components/layout/FlipchartBackground';
import { api } from '../lib/api';
import styles from './Admin.module.css';

const DisplayRegister: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const codeFromUrl = searchParams.get('code');
  
  const [displayCode, setDisplayCode] = useState(codeFromUrl || '');
  const [organisations, setOrganisations] = useState<any[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [registeredDisplay, setRegisteredDisplay] = useState<any>(null);

  useEffect(() => {
    loadOrganisations();
  }, []);

  const loadOrganisations = async () => {
    try {
      const orgs = await api.organisations();
      setOrganisations(orgs);
    } catch (err) {
      console.error('Failed to load organisations', err);
    }
  };

  const handleGenerateNewCode = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.generateDisplayCode();
      setDisplayCode(result.code);
    } catch (err: any) {
      setError(err.message || 'Failed to generate code');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!displayCode || !selectedOrgId || !displayName.trim()) {
      setError('Bitte fülle alle Felder aus');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const display = await api.registerDisplay({
        code: displayCode,
        organisationId: selectedOrgId,
        name: displayName.trim(),
      });
      setRegisteredDisplay(display);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Registration fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate code on mount if not provided
  useEffect(() => {
    if (!displayCode) {
      handleGenerateNewCode();
    }
  }, []);

  return (
    <div className={styles.adminWrapper} role="main" aria-label="Display registrieren">
      <FlipchartBackground />
      
      <main className={styles.adminContent} style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '2rem',
        padding: '2rem 1rem'
      }}>
        {/* Back Button */}
        <div style={{ width: '100%', maxWidth: '600px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '0.625rem 1rem',
              border: '2px solid #181818',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: '600',
              fontFamily: '"Inter", "Roboto", Arial, sans-serif',
              backgroundColor: '#fff',
              color: '#181818',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              boxShadow: '2px 4px 0 #e5e7eb'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '3px 6px 0 #e5e7eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '2px 4px 0 #e5e7eb';
            }}
          >
            <ArrowLeft size={16} />
            Zurück
          </button>
        </div>

        {/* Main Card */}
        <div style={{
          background: '#fff',
          borderRadius: '1.2rem 1.35rem 1.15rem 1.25rem',
          boxShadow: '2px 4px 0 #e5e7eb, 0 2px 8px 0 rgba(0,0,0,0.08)',
          padding: '2.5rem 2rem',
          border: '2px solid #181818',
          width: '100%',
          maxWidth: '600px',
          position: 'relative',
          transform: 'rotate(-0.3deg)',
          zIndex: 1
        }}>
          {/* Tape */}
          <div className={styles.tape} />

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              backgroundColor: '#dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              border: '2px solid #181818',
              boxShadow: '2px 4px 0 #181818'
            }}>
              <Monitor size={36} color="#0284c7" strokeWidth={2.5} />
            </div>

            <h1 style={{ 
              fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
              fontSize: 'clamp(1.75rem, 4vw, 2.2rem)',
              fontWeight: '800',
              color: '#181818',
              marginBottom: '0.75rem',
              letterSpacing: '0.01em',
              textShadow: '1px 2px 0 #fff, 0 2px 8px #38bdf8'
            }}>
              Display registrieren
            </h1>
            
            <p style={{ 
              fontFamily: '"Inter", "Roboto", Arial, sans-serif',
              fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
              color: '#4a5568',
              lineHeight: '1.6'
            }}>
              Aktiviere dieses Gerät als Display für deine Organisation
            </p>
          </div>

          {/* Instructions */}
          <div style={{
            backgroundColor: success ? '#d1fae5' : '#fef3c7',
            border: `2px solid ${success ? '#10b981' : '#fbbf24'}`,
            borderRadius: '8px',
            padding: '1.25rem',
            marginBottom: '2rem'
          }}>
            {success ? (
              <>
                <h3 style={{
                  fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  color: '#181818',
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <CheckCircle size={20} color="#10b981" />
                  Display erfolgreich registriert!
                </h3>
                <p style={{
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  fontSize: '0.95rem',
                  color: '#4a5568',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  Dein Display "{registeredDisplay?.name}" wurde erfolgreich registriert. 
                  Du kannst jetzt zur Display-Ansicht navigieren oder dieses Fenster schließen.
                </p>
              </>
            ) : (
              <>
                <h3 style={{
                  fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  color: '#181818',
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <CheckCircle size={20} color="#f59e0b" />
                  Registrierung in 3 Schritten
                </h3>
                <ol style={{
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  fontSize: '0.95rem',
                  color: '#4a5568',
                  lineHeight: '1.6',
                  paddingLeft: '1.5rem',
                  margin: 0
                }}>
                  <li style={{ marginBottom: '0.5rem' }}>
                    Notiere dir den Display-Code
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    Wähle deine Organisation aus
                  </li>
                  <li>
                    Gib deinem Display einen Namen
                  </li>
                </ol>
              </>
            )}
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '2px solid #dc2626',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
              color: '#991b1b',
              fontFamily: '"Inter", "Roboto", Arial, sans-serif',
              fontSize: '0.95rem'
            }}>
              {error}
            </div>
          )}

          {!success && (
            <>
              {/* Display Code Section */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#181818'
                }}>
                  <Hash size={20} color="#0284c7" />
                  Display-Code
                </div>

                <div style={{
                  backgroundColor: '#f3f4f6',
                  border: '3px solid #181818',
                  borderRadius: '12px',
                  padding: '1.5rem 2rem',
                  boxShadow: '3px 6px 0 #181818'
                }}>
                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: 'clamp(2rem, 5vw, 3rem)',
                    fontWeight: '800',
                    color: '#0284c7',
                    letterSpacing: '0.2em',
                    textAlign: 'center',
                    fontVariantNumeric: 'tabular-nums'
                  }}>
                    {displayCode || '------'}
                  </div>
                </div>

                <button
                  onClick={handleGenerateNewCode}
                  disabled={loading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: '2px solid #181818',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                    backgroundColor: '#fff',
                    color: '#181818',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease',
                    boxShadow: '2px 4px 0 #e5e7eb',
                    marginTop: '0.5rem',
                    opacity: loading ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '3px 6px 0 #e5e7eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '2px 4px 0 #e5e7eb';
                    }
                  }}
                >
                  <RefreshCw size={16} />
                  Neuen Code generieren
                </button>
              </div>

              {/* Organisation Selection */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  fontFamily: '"Gloria Hallelujah", "Caveat", cursive',
                  fontSize: '1rem',
                  fontWeight: '700',
                  color: '#0f172a',
                }}>
                  <Building2 size={18} color="#0284c7" />
                  Organisation wählen
                </label>
                <select
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                    backgroundColor: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">-- Bitte wählen --</option>
                  {organisations.map(org => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>

              {/* Display Name Input */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  fontFamily: '"Gloria Hallelujah", "Caveat", cursive',
                  fontSize: '1rem',
                  fontWeight: '700',
                  color: '#0f172a',
                }}>
                  <Monitor size={18} color="#0284c7" />
                  Display-Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="z.B. Foyer Display, Raum 101, etc."
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                    backgroundColor: '#fff'
                  }}
                />
              </div>

              {/* Register Button */}
              <button
                onClick={handleRegister}
                disabled={loading || !displayCode || !selectedOrgId || !displayName.trim()}
                style={{
                  width: '100%',
                  padding: '1rem 1.5rem',
                  border: '2px solid #181818',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  backgroundColor: '#10b981',
                  color: '#fff',
                  cursor: (loading || !displayCode || !selectedOrgId || !displayName.trim()) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease',
                  boxShadow: '2px 4px 0 #181818',
                  opacity: (loading || !displayCode || !selectedOrgId || !displayName.trim()) ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!loading && displayCode && selectedOrgId && displayName.trim()) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '3px 6px 0 #181818';
                    e.currentTarget.style.backgroundColor = '#059669';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && displayCode && selectedOrgId && displayName.trim()) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '2px 4px 0 #181818';
                    e.currentTarget.style.backgroundColor = '#10b981';
                  }
                }}
              >
                <CheckCircle size={20} strokeWidth={2.5} />
                {loading ? 'Registriere...' : 'Display registrieren'}
              </button>
            </>
          )}

          {success && registeredDisplay && (
            <button
              onClick={() => navigate(`/display/${registeredDisplay.id}`)}
              style={{
                width: '100%',
                padding: '1rem 1.5rem',
                border: '2px solid #181818',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: '700',
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                backgroundColor: '#0ea5e9',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
                boxShadow: '2px 4px 0 #181818'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '3px 6px 0 #181818';
                e.currentTarget.style.backgroundColor = '#0284c7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '2px 4px 0 #181818';
                e.currentTarget.style.backgroundColor = '#0ea5e9';
              }}
            >
              <Monitor size={20} strokeWidth={2.5} />
              Zur Display-Ansicht
            </button>
          )}
        </div>

        {/* Info Card */}
        <div style={{
          background: '#fff',
          borderRadius: '1rem 1.2rem 1.1rem 1.15rem',
          boxShadow: '2px 4px 0 #e5e7eb, 0 2px 8px 0 rgba(0,0,0,0.08)',
          padding: '1.5rem',
          border: '2px solid #181818',
          width: '100%',
          maxWidth: '600px',
          transform: 'rotate(0.3deg)'
        }}>
          <h3 style={{
            fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
            fontSize: '1.2rem',
            fontWeight: '700',
            color: '#181818',
            marginBottom: '1rem'
          }}>
            Was passiert nach der Registrierung?
          </h3>
          <ul style={{
            fontFamily: '"Inter", "Roboto", Arial, sans-serif',
            fontSize: '0.95rem',
            color: '#4a5568',
            lineHeight: '1.7',
            paddingLeft: '1.5rem',
            margin: 0
          }}>
            <li style={{ marginBottom: '0.5rem' }}>
              Das Display wird deiner Organisation zugeordnet
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              Aktuelle Tagespläne werden automatisch angezeigt
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              Updates werden in Echtzeit synchronisiert
            </li>
            <li>
              Das Display kann jederzeit über das Admin-Panel verwaltet werden
            </li>
          </ul>
        </div>
      </main>
      
      <FooterAdmin icon="monitor" text="Display-Registrierung – KonfiDayPlaner" />
    </div>
  );
};

export default DisplayRegister;
