import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2, Calendar, AlertCircle, Eye, Home } from 'lucide-react';
import Planer from '../components/planner/Planer';
import FlipchartBackground from '../components/layout/FlipchartBackground';
import ActionButton from '../components/ui/ActionButton';
import type { ScheduleItem } from '../types/schedule';
import styles from './Admin.module.css';
import chaosOpsLogo from '../assets/Chaos-Ops Logo.png';

interface SharedPlanData {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  viewCount: number;
  dayPlan: {
    id: string;
    name: string;
    date: string;
    scheduleItems: ScheduleItem[];
    event: {
      name: string;
      organisation: {
        name: string;
        logoUrl?: string;
      };
    };
  };
}

const SharedPlanView: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [sharedPlan, setSharedPlan] = useState<SharedPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedPlan = async () => {
      if (!token) {
        setError('Kein Token gefunden');
        setLoading(false);
        return;
      }

      try {
        const apiUrl = import.meta.env.VITE_API_URL || '/api';
        const response = await fetch(`${apiUrl}/share/${token}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('Geteilter Plan nicht gefunden oder abgelaufen');
          } else {
            setError('Fehler beim Laden des geteilten Plans');
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setSharedPlan(data);
      } catch (err) {
        console.error('Error fetching shared plan:', err);
        setError('Fehler beim Laden des geteilten Plans');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedPlan();
  }, [token]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatScheduleDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={styles.adminWrapper} role="main" aria-label="Geteilten Plan laden">
        <FlipchartBackground />
        
        <main className={styles.adminContent} style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem',
          maxWidth: '900px',
          margin: '0 auto',
        }}>
          <div
            style={{
              background: '#fff',
              borderRadius: '1.2rem 1.35rem 1.15rem 1.25rem',
              boxShadow: '2px 4px 0 #e5e7eb, 0 2px 8px 0 rgba(0,0,0,0.08)',
              padding: '2.5rem 2rem',
              border: '2px solid #181818',
              textAlign: 'center',
              width: '100%',
              maxWidth: '450px',
              position: 'relative',
              transform: 'rotate(-0.3deg)',
              zIndex: 1,
            }}
          >
            <div className={styles.tape} />
            <div style={{ 
              width: '56px', 
              height: '56px', 
              border: '4px solid #fbbf24',
              borderTop: '4px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1.5rem'
            }} />
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#181818',
              marginBottom: '0.75rem',
              fontFamily: "'Gloria Hallelujah', 'Caveat', 'Comic Neue', cursive, sans-serif",
            }}>
              Plan wird geladen...
            </h2>
            <p style={{
              fontSize: '1rem',
              color: '#4a5568',
              fontFamily: "'Inter', 'Roboto', Arial, sans-serif",
              margin: 0
            }}>
              Einen Moment bitte
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.adminWrapper} role="main" aria-label="Fehler beim Laden">
        <FlipchartBackground />
        
        <main className={styles.adminContent} style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem',
          maxWidth: '900px',
          margin: '0 auto',
        }}>
          <div
            style={{
              background: '#fff',
              borderRadius: '1.2rem 1.35rem 1.15rem 1.25rem',
              boxShadow: '2px 4px 0 #e5e7eb, 0 2px 8px 0 rgba(0,0,0,0.08)',
              padding: '2.5rem 2rem',
              border: '2px solid #181818',
              textAlign: 'center',
              width: '100%',
              maxWidth: '500px',
              position: 'relative',
              transform: 'rotate(-0.3deg)',
              zIndex: 1,
            }}
          >
            <div className={styles.tape} />
            <AlertCircle size={64} style={{ color: '#ef4444', margin: '0 auto 1.5rem', display: 'block' }} />
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#181818',
              marginBottom: '0.75rem',
              fontFamily: "'Gloria Hallelujah', 'Caveat', 'Comic Neue', cursive, sans-serif",
            }}>
              Plan nicht gefunden
            </h2>
            <p style={{
              fontSize: '1rem',
              color: '#4a5568',
              fontFamily: "'Inter', 'Roboto', Arial, sans-serif",
              marginBottom: '2rem'
            }}>
              {error}
            </p>
            <ActionButton
              onClick={() => navigate('/')}
              icon={<Home size={20} />}
              color="#fbbf24"
            >
              Zur Startseite
            </ActionButton>
          </div>
        </main>
      </div>
    );
  }

  if (!sharedPlan) {
    return (
      <div className={styles.adminWrapper} role="main" aria-label="Kein Plan">
        <FlipchartBackground />
        
        <main className={styles.adminContent} style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem',
          maxWidth: '900px',
          margin: '0 auto',
        }}>
          <div
            style={{
              background: '#fff',
              borderRadius: '1.2rem 1.35rem 1.15rem 1.25rem',
              boxShadow: '2px 4px 0 #e5e7eb, 0 2px 8px 0 rgba(0,0,0,0.08)',
              padding: '2.5rem 2rem',
              border: '2px solid #181818',
              textAlign: 'center',
              width: '100%',
              maxWidth: '450px',
              position: 'relative',
              transform: 'rotate(-0.3deg)',
              zIndex: 1,
            }}
          >
            <div className={styles.tape} />
            <p style={{
              fontSize: '1.3rem',
              fontWeight: 700,
              color: '#181818',
              fontFamily: "'Gloria Hallelujah', 'Caveat', 'Comic Neue', cursive, sans-serif",
              margin: 0
            }}>
              Kein Plan gefunden
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.adminWrapper} role="main" aria-label="Geteilter Plan">
      <FlipchartBackground />

      <main className={styles.adminContent} style={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
        padding: '2rem 1rem', 
        maxWidth: '1200px', 
        margin: '0 auto' 
      }}>
        {/* Header Card */}
        <div
          style={{
            background: '#fff',
            borderRadius: '1.2rem 1.35rem 1.15rem 1.25rem',
            boxShadow: '2px 4px 0 #e5e7eb, 0 2px 8px 0 rgba(0,0,0,0.08)',
            padding: '2rem 2rem',
            border: '2px solid #181818',
            width: '100%',
            maxWidth: '900px',
            position: 'relative',
            transform: 'rotate(-0.2deg)',
            zIndex: 1,
          }}
        >
          <div className={styles.tape} />
          
          {/* Logo + Title Row */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1.5rem',
            flexWrap: 'wrap',
            marginBottom: '1rem'
          }}>
            {sharedPlan.dayPlan.event.organisation.logoUrl ? (
              <img
                src={sharedPlan.dayPlan.event.organisation.logoUrl}
                alt={sharedPlan.dayPlan.event.organisation.name}
                style={{ 
                  height: '70px', 
                  width: '70px', 
                  objectFit: 'contain', 
                  flexShrink: 0,
                  borderRadius: '0.5rem',
                  border: '2px solid #e5e7eb',
                  padding: '0.25rem',
                  background: '#fff'
                }}
              />
            ) : (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center' 
              }}>
                <img
                  src={chaosOpsLogo}
                  alt="Chaos Ops Logo"
                  style={{
                    maxWidth: '150px',
                    maxHeight: '60px',
                    width: 'auto',
                    height: 'auto',
                    filter: 'drop-shadow(1px 2px 4px rgba(0,0,0,0.1))',
                  }}
                />
              </div>
            )}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h1 style={{
                fontSize: 'clamp(1.3rem, 4vw, 1.7rem)',
                fontWeight: 700,
                color: '#181818',
                marginBottom: '0.5rem',
                fontFamily: "'Gloria Hallelujah', 'Caveat', 'Comic Neue', cursive, sans-serif",
                letterSpacing: '0.01em',
              }}>
                {sharedPlan.title}
              </h1>
              <p style={{
                fontSize: '1rem',
                color: '#4a5568',
                fontFamily: "'Inter', 'Roboto', Arial, sans-serif",
                margin: 0,
                fontWeight: 500
              }}>
                {sharedPlan.dayPlan.event.name}
              </p>
            </div>
          </div>

          {/* Info Pills */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            flexWrap: 'wrap',
            marginBottom: sharedPlan.description ? '1.5rem' : 0
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem',
              background: '#fef3c7',
              border: '1.5px solid #f59e0b',
              borderRadius: '2rem',
              padding: '0.4rem 0.85rem',
              fontSize: '0.9rem',
              fontWeight: 500,
              color: '#92400e',
              fontFamily: "'Inter', 'Roboto', Arial, sans-serif",
            }}>
              <Calendar size={16} />
              {formatScheduleDate(sharedPlan.dayPlan.date)}
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem',
              background: '#dbeafe',
              border: '1.5px solid #3b82f6',
              borderRadius: '2rem',
              padding: '0.4rem 0.85rem',
              fontSize: '0.9rem',
              fontWeight: 500,
              color: '#1e40af',
              fontFamily: "'Inter', 'Roboto', Arial, sans-serif",
            }}>
              <Share2 size={16} />
              {sharedPlan.dayPlan.event.organisation.name}
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem',
              background: '#f3e8ff',
              border: '1.5px solid #a855f7',
              borderRadius: '2rem',
              padding: '0.4rem 0.85rem',
              fontSize: '0.9rem',
              fontWeight: 500,
              color: '#7e22ce',
              fontFamily: "'Inter', 'Roboto', Arial, sans-serif",
            }}>
              <Eye size={16} />
              {sharedPlan.viewCount} Aufrufe
            </div>
          </div>

          {/* Description */}
          {sharedPlan.description && (
            <div style={{
              padding: '1rem 1.25rem',
              background: '#fffbeb',
              border: '2px dashed #fbbf24',
              borderRadius: '0.75rem',
            }}>
              <p style={{ 
                color: '#78350f', 
                margin: 0, 
                fontStyle: 'italic',
                fontSize: '1rem',
                fontFamily: "'Inter', 'Roboto', Arial, sans-serif",
                lineHeight: 1.5
              }}>
                „{sharedPlan.description}"
              </p>
            </div>
          )}
        </div>

        {/* Planner Display */}
        <div style={{ width: '100%', maxWidth: '1100px' }}>
          <Planer
            schedule={sharedPlan.dayPlan.scheduleItems}
            title={sharedPlan.dayPlan.name}
            date={formatScheduleDate(sharedPlan.dayPlan.date)}
            showClock={true}
            autoCenter={true}
            debug={false}
            displayInfo={`Geteilt von ${sharedPlan.dayPlan.event.organisation.name}`}
            viewType="shared"
          />
        </div>

        {/* Footer Card */}
        <div
          style={{
            background: '#fff',
            borderRadius: '1.1rem 1.3rem 1.2rem 1.15rem',
            boxShadow: '2px 4px 0 #e5e7eb, 0 2px 8px 0 rgba(0,0,0,0.08)',
            padding: '1.5rem 2rem',
            border: '2px solid #181818',
            textAlign: 'center',
            width: '100%',
            maxWidth: '600px',
            position: 'relative',
            transform: 'rotate(0.3deg)',
            zIndex: 1,
          }}
        >
          <div className={styles.tape} />
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <img
              src={chaosOpsLogo}
              alt="Chaos Ops Logo"
              style={{
                maxWidth: '180px',
                maxHeight: '70px',
                width: 'auto',
                height: 'auto',
                filter: 'drop-shadow(1px 2px 4px rgba(0,0,0,0.1))',
              }}
            />
          </div>
          
          <p style={{ 
            color: '#4a5568', 
            fontSize: '0.95rem',
            margin: '0 0 1.25rem 0',
            fontFamily: "'Inter', 'Roboto', Arial, sans-serif",
            lineHeight: 1.5
          }}>
            Dieser Plan wurde mit <strong>Chaos Ops</strong> erstellt und geteilt.
          </p>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <ActionButton
              onClick={() => navigate('/')}
              icon={<Home size={18} />}
              color="#fbbf24"
              extraStyles={{ minWidth: '160px' }}
            >
              Mehr erfahren
            </ActionButton>
          </div>
          
          <p style={{ 
            fontSize: '0.8rem', 
            color: '#9ca3af',
            margin: '1rem 0 0 0',
            fontFamily: "'Inter', 'Roboto', Arial, sans-serif",
          }}>
            Geteilt am {formatDate(sharedPlan.createdAt)}
          </p>
        </div>
      </main>
    </div>
  );
};

export default SharedPlanView;
