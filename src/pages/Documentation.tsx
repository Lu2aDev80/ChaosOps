import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Monitor, 
  Users, 
  Clock, 
  Edit3, 
  ChevronRight,
  LogIn,
  ArrowLeft,
  BookOpen,
  Lightbulb,
  Target,
  HelpCircle
} from 'lucide-react';
import FlipchartBackground from '../components/layout/FlipchartBackground';
import styles from './Admin.module.css';

const Documentation: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.adminWrapper} role="main" aria-label="Chaos Ops Dokumentation">
      <FlipchartBackground />
      
      <main className={styles.adminContent} style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '2rem',
        padding: '2rem 1rem',
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        {/* Header */}
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
          
          <button
            onClick={() => navigate('/')}
            style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              padding: '0.5rem 1rem',
              border: '2px solid #181818',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '600',
              fontFamily: '"Inter", "Roboto", Arial, sans-serif',
              backgroundColor: '#f3f4f6',
              color: '#181818',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              boxShadow: '1px 2px 0 #181818'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '2px 3px 0 #181818';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '1px 2px 0 #181818';
            }}
          >
            <ArrowLeft size={16} />
            Zurück
          </button>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <h1 style={{ 
              fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
              fontSize: 'clamp(2rem, 5vw, 2.5rem)',
              fontWeight: '800',
              color: '#181818',
              marginBottom: '0.5rem',
              letterSpacing: '0.01em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              <BookOpen size={40} color="#fbbf24" />
              Dokumentation
            </h1>
            <p style={{ 
              fontFamily: '"Inter", "Roboto", Arial, sans-serif',
              fontSize: '1.1rem',
              color: '#4a5568',
              lineHeight: '1.6'
            }}>
              Lerne, wie du Chaos Ops optimal nutzt
            </p>
          </div>
        </div>

        {/* Overview Section */}
        <section style={{
          background: '#fff',
          borderRadius: '1rem 1.2rem 1.1rem 1rem',
          boxShadow: '2px 4px 0 #e5e7eb, 0 2px 8px 0 rgba(0,0,0,0.08)',
          padding: '2rem',
          border: '2px solid #181818',
          width: '100%',
          transform: 'rotate(0.2deg)'
        }}>
          <h2 style={{
            fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
            fontSize: '1.8rem',
            fontWeight: '700',
            color: '#181818',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Calendar size={28} color="#fbbf24" />
            Was ist Chaos Ops?
          </h2>
          <p style={{
            fontFamily: '"Inter", "Roboto", Arial, sans-serif',
            fontSize: '1rem',
            color: '#4a5568',
            lineHeight: '1.7',
            marginBottom: '1rem'
          }}>
            Chaos Ops ist ein digitales Planungssystem für Jugendgruppen-Events und 
            Konfi-Tage. Es ermöglicht dir, Tagespläne zu erstellen und diese auf verschiedenen 
            Displays in Echtzeit anzuzeigen.
          </p>
          <p style={{
            fontFamily: '"Inter", "Roboto", Arial, sans-serif',
            fontSize: '1rem',
            color: '#4a5568',
            lineHeight: '1.7'
          }}>
            Das System besteht aus zwei Hauptkomponenten: dem <strong>Admin-Bereich</strong> zur 
            Planung und Verwaltung sowie dem <strong>Display-Modus</strong> zur Anzeige der Pläne.
          </p>
        </section>

        {/* Getting Started */}
        <section style={{
          background: '#fff',
          borderRadius: '1.1rem 1rem 1.2rem 1.1rem',
          boxShadow: '2px 4px 0 #e5e7eb, 0 2px 8px 0 rgba(0,0,0,0.08)',
          padding: '2rem',
          border: '2px solid #181818',
          width: '100%',
          transform: 'rotate(-0.3deg)'
        }}>
          <h2 style={{
            fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
            fontSize: '1.8rem',
            fontWeight: '700',
            color: '#181818',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <LogIn size={28} color="#38bdf8" />
            Erste Schritte
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Step 1 */}
            <div style={{
              background: '#fef3c7',
              borderRadius: '8px',
              padding: '1.5rem',
              border: '2px solid #181818'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#fbbf24',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '1.1rem',
                  border: '2px solid #181818'
                }}>
                  1
                </div>
                <h3 style={{
                  fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  color: '#181818',
                  margin: 0
                }}>
                  Organisation auswählen
                </h3>
              </div>
              <p style={{
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                fontSize: '1rem',
                color: '#4a5568',
                lineHeight: '1.6',
                marginLeft: '3rem'
              }}>
                Klicke auf "Anmelden" und wähle deine Organisation aus der Liste. 
                Jede Organisation hat ihre eigenen Events und Tagespläne.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{
              background: '#dbeafe',
              borderRadius: '8px',
              padding: '1.5rem',
              border: '2px solid #181818'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#38bdf8',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '1.1rem',
                  border: '2px solid #181818'
                }}>
                  2
                </div>
                <h3 style={{
                  fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  color: '#181818',
                  margin: 0
                }}>
                  Event erstellen
                </h3>
              </div>
              <p style={{
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                fontSize: '1rem',
                color: '#4a5568',
                lineHeight: '1.6',
                marginLeft: '3rem'
              }}>
                Im Dashboard kannst du ein neues Event anlegen. Gib Name, Datum und 
                weitere Details ein. Ein Event kann mehrere Tage umfassen.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{
              background: '#f3e8ff',
              borderRadius: '8px',
              padding: '1.5rem',
              border: '2px solid #181818'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#a78bfa',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '1.1rem',
                  border: '2px solid #181818'
                }}>
                  3
                </div>
                <h3 style={{
                  fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  color: '#181818',
                  margin: 0
                }}>
                  Tagesplan erstellen
                </h3>
              </div>
              <p style={{
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                fontSize: '1rem',
                color: '#4a5568',
                lineHeight: '1.6',
                marginLeft: '3rem'
              }}>
                Füge Zeitblöcke zu deinem Tagesplan hinzu: Definiere Startzeit, Endzeit, 
                Titel und optionale Beschreibungen für jede Aktivität.
              </p>
            </div>

            {/* Step 4 */}
            <div style={{
              background: '#dcfce7',
              borderRadius: '8px',
              padding: '1.5rem',
              border: '2px solid #181818'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '1.1rem',
                  border: '2px solid #181818'
                }}>
                  4
                </div>
                <h3 style={{
                  fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  color: '#181818',
                  margin: 0
                }}>
                  Display registrieren
                </h3>
              </div>
              <p style={{
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                fontSize: '1rem',
                color: '#4a5568',
                lineHeight: '1.6',
                marginLeft: '3rem'
              }}>
                Verwende "Display registrieren" auf dem Gerät, das den Tagesplan anzeigen soll 
                (z.B. Tablet, Monitor). Das Display zeigt automatisch den aktuellen Plan an.
              </p>
            </div>
          </div>
        </section>

        {/* Features Details */}
        <section style={{
          background: '#fff',
          borderRadius: '1rem 1.15rem 1rem 1.2rem',
          boxShadow: '2px 4px 0 #e5e7eb, 0 2px 8px 0 rgba(0,0,0,0.08)',
          padding: '2rem',
          border: '2px solid #181818',
          width: '100%',
          transform: 'rotate(0.4deg)'
        }}>
          <h2 style={{
            fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
            fontSize: '1.8rem',
            fontWeight: '700',
            color: '#181818',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Edit3 size={28} color="#a78bfa" />
            Funktionen im Detail
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Admin Dashboard */}
            <div>
              <h3 style={{
                fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                fontSize: '1.4rem',
                fontWeight: '700',
                color: '#181818',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Users size={24} color="#fbbf24" />
                Admin-Dashboard
              </h3>
              <ul style={{
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                fontSize: '1rem',
                color: '#4a5568',
                lineHeight: '1.8',
                listStyle: 'none',
                padding: 0
              }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <ChevronRight size={20} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Event-Verwaltung:</strong> Erstelle, bearbeite und lösche Events mit allen Details</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <ChevronRight size={20} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Tagesplan-Editor:</strong> Füge beliebig viele Zeitblöcke hinzu und arrangiere sie</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <ChevronRight size={20} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Organisation wechseln:</strong> Verwalte mehrere Gruppen in einem System</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <ChevronRight size={20} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Live-Vorschau:</strong> Sieh sofort, wie der Plan auf dem Display aussieht</span>
                </li>
              </ul>
            </div>

            {/* Display Mode */}
            <div>
              <h3 style={{
                fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                fontSize: '1.4rem',
                fontWeight: '700',
                color: '#181818',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Monitor size={24} color="#38bdf8" />
                Display-Modus
              </h3>
              <ul style={{
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                fontSize: '1rem',
                color: '#4a5568',
                lineHeight: '1.8',
                listStyle: 'none',
                padding: 0
              }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <ChevronRight size={20} color="#38bdf8" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Echtzeit-Anzeige:</strong> Automatische Aktualisierung bei Änderungen</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <ChevronRight size={20} color="#38bdf8" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Aktuelle Uhrzeit:</strong> Live-Uhr zeigt die aktuelle Zeit prominent an</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <ChevronRight size={20} color="#38bdf8" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Übersichtlich:</strong> Alle Zeitblöcke des Tages auf einen Blick</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <ChevronRight size={20} color="#38bdf8" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Responsive Design:</strong> Optimiert für Tablets, Monitore und Smartphones</span>
                </li>
              </ul>
            </div>

            {/* Time Blocks */}
            <div>
              <h3 style={{
                fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                fontSize: '1.4rem',
                fontWeight: '700',
                color: '#181818',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Clock size={24} color="#a78bfa" />
                Zeitblöcke erstellen
              </h3>
              <ul style={{
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                fontSize: '1rem',
                color: '#4a5568',
                lineHeight: '1.8',
                listStyle: 'none',
                padding: 0
              }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <ChevronRight size={20} color="#a78bfa" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Startzeit:</strong> Wann beginnt die Aktivität? (z.B. 09:00)</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <ChevronRight size={20} color="#a78bfa" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Endzeit:</strong> Wann endet die Aktivität? (z.B. 10:30)</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <ChevronRight size={20} color="#a78bfa" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Titel:</strong> Kurzer, prägnanter Name (z.B. "Morgenandacht")</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <ChevronRight size={20} color="#a78bfa" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Beschreibung:</strong> Optionale Details zum Ablauf oder Ort</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Tips & Best Practices */}
        <section style={{
          background: '#fff',
          borderRadius: '1.2rem 1rem 1.1rem 1.15rem',
          boxShadow: '2px 4px 0 #e5e7eb, 0 2px 8px 0 rgba(0,0,0,0.08)',
          padding: '2rem',
          border: '2px solid #181818',
          width: '100%',
          transform: 'rotate(-0.2deg)'
        }}>
          <h2 style={{
            fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
            fontSize: '1.8rem',
            fontWeight: '700',
            color: '#181818',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Lightbulb size={28} color="#fbbf24" />
            Tipps & Best Practices
          </h2>

          <div style={{
            background: '#fef3c7',
            borderRadius: '8px',
            padding: '1.5rem',
            border: '2px solid #181818',
            marginBottom: '1rem'
          }}>
            <p style={{
              fontFamily: '"Inter", "Roboto", Arial, sans-serif',
              fontSize: '1rem',
              color: '#4a5568',
              lineHeight: '1.7',
              margin: 0,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem'
            }}>
              <Lightbulb size={20} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Tipp 1:</strong> Plane Pufferzeiten ein! Zwischen Aktivitäten sollten 
              immer einige Minuten Pause liegen.</span>
            </p>
          </div>

          <div style={{
            background: '#dbeafe',
            borderRadius: '8px',
            padding: '1.5rem',
            border: '2px solid #181818',
            marginBottom: '1rem'
          }}>
            <p style={{
              fontFamily: '"Inter", "Roboto", Arial, sans-serif',
              fontSize: '1rem',
              color: '#4a5568',
              lineHeight: '1.7',
              margin: 0,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem'
            }}>
              <Lightbulb size={20} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Tipp 2:</strong> Verwende kurze, prägnante Titel für bessere Lesbarkeit 
              auf dem Display (max. 3-4 Wörter).</span>
            </p>
          </div>

          <div style={{
            background: '#f3e8ff',
            borderRadius: '8px',
            padding: '1.5rem',
            border: '2px solid #181818',
            marginBottom: '1rem'
          }}>
            <p style={{
              fontFamily: '"Inter", "Roboto", Arial, sans-serif',
              fontSize: '1rem',
              color: '#4a5568',
              lineHeight: '1.7',
              margin: 0,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem'
            }}>
              <Lightbulb size={20} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Tipp 3:</strong> Registriere Displays im Vollbildmodus (F11) für eine 
              optimale Anzeige ohne Browser-Elemente.</span>
            </p>
          </div>

          <div style={{
            background: '#dcfce7',
            borderRadius: '8px',
            padding: '1.5rem',
            border: '2px solid #181818'
          }}>
            <p style={{
              fontFamily: '"Inter", "Roboto", Arial, sans-serif',
              fontSize: '1rem',
              color: '#4a5568',
              lineHeight: '1.7',
              margin: 0,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem'
            }}>
              <Lightbulb size={20} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Tipp 4:</strong> Teste deine Pläne vorab auf dem Display, um zu sehen, 
              wie sie in der echten Umgebung aussehen.</span>
            </p>
          </div>
        </section>

        {/* Use Cases */}
        <section style={{
          background: '#fff',
          borderRadius: '1.1rem 1.2rem 1rem 1.1rem',
          boxShadow: '2px 4px 0 #e5e7eb, 0 2px 8px 0 rgba(0,0,0,0.08)',
          padding: '2rem',
          border: '2px solid #181818',
          width: '100%',
          transform: 'rotate(0.3deg)'
        }}>
          <h2 style={{
            fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
            fontSize: '1.8rem',
            fontWeight: '700',
            color: '#181818',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Target size={28} color="#fbbf24" />
            Anwendungsbeispiele
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              padding: '1rem',
              borderLeft: '4px solid #fbbf24'
            }}>
              <h4 style={{
                fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                fontSize: '1.2rem',
                fontWeight: '700',
                color: '#181818',
                marginBottom: '0.5rem'
              }}>
                Konfi-Tage
              </h4>
              <p style={{
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                fontSize: '0.95rem',
                color: '#4a5568',
                lineHeight: '1.6',
                margin: 0
              }}>
                Plane mehrtägige Konfi-Camps mit detaillierten Zeitplänen für jeden Tag. 
                Zeige den aktuellen Tagesplan im Gemeinschaftsraum an.
              </p>
            </div>

            <div style={{
              padding: '1rem',
              borderLeft: '4px solid #38bdf8'
            }}>
              <h4 style={{
                fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                fontSize: '1.2rem',
                fontWeight: '700',
                color: '#181818',
                marginBottom: '0.5rem'
              }}>
                Jugendfreizeiten
              </h4>
              <p style={{
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                fontSize: '0.95rem',
                color: '#4a5568',
                lineHeight: '1.6',
                margin: 0
              }}>
                Organisiere Freizeiten mit flexiblen Tagesplänen. Teilnehmer*innen wissen 
                immer, was als nächstes ansteht.
              </p>
            </div>

            <div style={{
              padding: '1rem',
              borderLeft: '4px solid #a78bfa'
            }}>
              <h4 style={{
                fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                fontSize: '1.2rem',
                fontWeight: '700',
                color: '#181818',
                marginBottom: '0.5rem'
              }}>
                Workshops & Seminare
              </h4>
              <p style={{
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                fontSize: '0.95rem',
                color: '#4a5568',
                lineHeight: '1.6',
                margin: 0
              }}>
                Strukturiere Workshop-Tage mit verschiedenen Sessions und Pausen. 
                Ideal für Konferenzen und Schulungsveranstaltungen.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{
          background: '#fff',
          borderRadius: '1rem 1.1rem 1.2rem 1rem',
          boxShadow: '2px 4px 0 #e5e7eb, 0 2px 8px 0 rgba(0,0,0,0.08)',
          padding: '2rem',
          border: '2px solid #181818',
          width: '100%',
          transform: 'rotate(-0.4deg)'
        }}>
          <h2 style={{
            fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
            fontSize: '1.8rem',
            fontWeight: '700',
            color: '#181818',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <HelpCircle size={28} color="#fbbf24" />
            Häufig gestellte Fragen
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h4 style={{
                fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                fontSize: '1.2rem',
                fontWeight: '700',
                color: '#181818',
                marginBottom: '0.5rem'
              }}>
                Wie viele Displays kann ich registrieren?
              </h4>
              <p style={{
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                fontSize: '1rem',
                color: '#4a5568',
                lineHeight: '1.7',
                margin: 0
              }}>
                Du kannst beliebig viele Displays registrieren. Alle zeigen automatisch 
                den aktuellen Tagesplan deiner Organisation an.
              </p>
            </div>

            <div>
              <h4 style={{
                fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                fontSize: '1.2rem',
                fontWeight: '700',
                color: '#181818',
                marginBottom: '0.5rem'
              }}>
                Kann ich Pläne nachträglich ändern?
              </h4>
              <p style={{
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                fontSize: '1rem',
                color: '#4a5568',
                lineHeight: '1.7',
                margin: 0
              }}>
                Ja! Alle Änderungen im Admin-Dashboard werden sofort auf allen registrierten 
                Displays angezeigt. So bleiben alle immer auf dem aktuellen Stand.
              </p>
            </div>

            <div>
              <h4 style={{
                fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                fontSize: '1.2rem',
                fontWeight: '700',
                color: '#181818',
                marginBottom: '0.5rem'
              }}>
                Funktioniert es auch offline?
              </h4>
              <p style={{
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                fontSize: '1rem',
                color: '#4a5568',
                lineHeight: '1.7',
                margin: 0
              }}>
                Aktuell benötigt das System eine Internetverbindung. Die Daten werden lokal 
                im Browser gespeichert, aber für die Synchronisation zwischen Admin und 
                Display ist eine Verbindung erforderlich.
              </p>
            </div>

            <div>
              <h4 style={{
                fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                fontSize: '1.2rem',
                fontWeight: '700',
                color: '#181818',
                marginBottom: '0.5rem'
              }}>
                Welche Geräte werden unterstützt?
              </h4>
              <p style={{
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                fontSize: '1rem',
                color: '#4a5568',
                lineHeight: '1.7',
                margin: 0
              }}>
                Chaos Ops funktioniert auf allen modernen Browsern (Chrome, Firefox, Safari, Edge). 
                Optimal auf Tablets (10"+), Monitoren und Desktop-PCs. Auch auf Smartphones nutzbar.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Back to Home */}
        <div style={{
          background: '#fff',
          borderRadius: '1rem 1.2rem 1.1rem 1rem',
          boxShadow: '2px 4px 0 #e5e7eb, 0 2px 8px 0 rgba(0,0,0,0.08)',
          padding: '2rem',
          border: '2px solid #181818',
          width: '100%',
          textAlign: 'center',
          transform: 'rotate(0.2deg)'
        }}>
          <h3 style={{
            fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#181818',
            marginBottom: '1rem'
          }}>
            Bereit loszulegen?
          </h3>
          <p style={{
            fontFamily: '"Inter", "Roboto", Arial, sans-serif',
            fontSize: '1rem',
            color: '#4a5568',
            marginBottom: '1.5rem',
            lineHeight: '1.6'
          }}>
            Starte jetzt mit der Planung deines ersten Events!
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '1rem 2rem',
              border: '2px solid #181818',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: '700',
              fontFamily: '"Inter", "Roboto", Arial, sans-serif',
              backgroundColor: '#fbbf24',
              color: '#fff',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              transition: 'all 0.2s ease',
              boxShadow: '2px 4px 0 #181818',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '3px 6px 0 #181818';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '2px 4px 0 #181818';
            }}
          >
            <LogIn size={20} />
            Zur Anmeldung
          </button>
        </div>
      </main>
      
    </div>
  );
};

export default Documentation;
