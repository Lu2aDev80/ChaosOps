import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OrganisationCard from '../ui/OrganisationCard';
import styles from './OrganisationSelect.module.css';
import { api, type Organisation } from '../../lib/api';

interface OrganisationSelectProps {
  isLogin?: boolean;
}

const OrganisationSelect: React.FC<OrganisationSelectProps> = ({ isLogin = false }) => {
  const navigate = useNavigate();
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<{
    api: boolean;
    db: boolean;
    loading: boolean;
    lastCheck: string | null;
  }>({ api: false, db: false, loading: true, lastCheck: null });

  // Load organisations and check database connection status
  useEffect(() => {
    const checkStatus = async () => {
      setDbStatus(prev => ({ ...prev, loading: true }));
      setLoading(true);
      try {
        // Check API health
        await api.health();
        
        // Load organisations (tests DB connection and gets logo data)
        const orgs = await api.organisations();
        setOrganisations(orgs);
        
        setDbStatus({
          api: true,
          db: true,
          loading: false,
          lastCheck: new Date().toLocaleTimeString('de-DE')
        });
      } catch (error) {
        console.error('Status check failed:', error);
        setDbStatus({
          api: false,
          db: false,
          loading: false,
          lastCheck: new Date().toLocaleTimeString('de-DE')
        });
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleOrganisationSelect = (orgId: string) => {
    // Store selected organisation in localStorage
    localStorage.setItem('selectedOrganisation', orgId);
    
    // Find the selected organisation for additional context
    const selectedOrg = organisations.find(org => org.id === orgId);
    if (selectedOrg) {
      localStorage.setItem('selectedOrganisationName', selectedOrg.name);
    }
    
    // Navigate to dashboard immediately
    const basePath = isLogin ? '/login' : '/admin';
    navigate(`${basePath}/dashboard`, { replace: true });
  };

  return (
    <div className={styles.selectContainer}>
      <div className={styles.selectHeader}>
        <h2 className={styles.selectTitle}>Organisation auswählen</h2>
        <p className={styles.selectSubtitle}>
          Wähle eine Organisation aus, um fortzufahren
        </p>
      </div>

      {/* Debug Status Panel */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: dbStatus.api && dbStatus.db ? '#10b981' : '#ef4444',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        fontSize: '0.75rem',
        fontFamily: 'monospace',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        border: '2px solid rgba(255,255,255,0.2)',
        minWidth: '200px',
        zIndex: 1000
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>🔧 Debug Status</div>
        <div>API: {dbStatus.loading ? '⏳' : dbStatus.api ? '✅' : '❌'}</div>
        <div>DB: {dbStatus.loading ? '⏳' : dbStatus.db ? '✅' : '❌'}</div>
        {dbStatus.lastCheck && (
          <div style={{ fontSize: '0.65rem', opacity: 0.8, marginTop: '4px' }}>
            Letzter Check: {dbStatus.lastCheck}
          </div>
        )}
        <button
          onClick={async () => {
            setDbStatus(prev => ({ ...prev, loading: true }));
            try {
              await api.health();
              await api.organisations();
              setDbStatus({
                api: true,
                db: true,
                loading: false,
                lastCheck: new Date().toLocaleTimeString('de-DE')
              });
            } catch {
              setDbStatus({
                api: false,
                db: false,
                loading: false,
                lastCheck: new Date().toLocaleTimeString('de-DE')
              });
            }
          }}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.65rem',
            cursor: 'pointer',
            marginTop: '8px',
            width: '100%'
          }}
        >
          🔄 Erneut prüfen
        </button>
      </div>

      <div className={styles.organisationGrid}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', gridColumn: '1 / -1' }}>
            Lade Organisationen...
          </div>
        ) : organisations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', gridColumn: '1 / -1' }}>
            Keine Organisationen gefunden
          </div>
        ) : (
          organisations.map((org) => (
            <OrganisationCard
              key={org.id}
              name={org.name}
              description={org.description}
              logoUrl={org.logoUrl}
              selected={false}
              onClick={() => handleOrganisationSelect(org.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default OrganisationSelect;
