import React, { useState, useEffect } from 'react';
import { Share2, Calendar, Eye, ExternalLink, Trash2, Edit2, Clock } from 'lucide-react';

interface SharedPlan {
  id: string;
  shareToken: string;
  title: string;
  description?: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  viewCount: number;
  lastViewAt?: string;
  shareUrl: string;
  creator: {
    id: string;
    username: string;
  };
  dayPlan: {
    id: string;
    name: string;
    date: string;
    event: {
      id: string;
      name: string;
    };
  };
}

interface OrganisationSharedPlansProps {
  organisationId: string;
}

const OrganisationSharedPlans: React.FC<OrganisationSharedPlansProps> = ({ organisationId }) => {
  const [sharedPlans, setSharedPlans] = useState<SharedPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSharedPlans();
  }, [organisationId]);

  const fetchSharedPlans = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/organisations/${organisationId}/shared-plans`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch shared plans');
      }

      const data = await response.json();
      setSharedPlans(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load shared plans');
      setSharedPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const togglePlanStatus = async (planId: string, isActive: boolean) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/shared-plans/${planId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (!response.ok) {
        throw new Error('Failed to update plan status');
      }

      // Refresh the list
      fetchSharedPlans();
    } catch (err) {
      console.error('Failed to toggle plan status:', err);
    }
  };

  const deletePlan = async (planId: string) => {
    if (!confirm('Möchten Sie diesen geteilten Plan wirklich löschen?')) {
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/shared-plans/${planId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete shared plan');
      }

      // Refresh the list
      fetchSharedPlans();
    } catch (err) {
      console.error('Failed to delete shared plan:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const cardStyle = {
    background: '#ffffff',
    padding: '2rem',
    borderRadius: '1.2rem 1.35rem 1.15rem 1.25rem',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15), 4px 8px 0 rgba(0,0,0,0.1)',
    border: '3px solid #181818',
    marginBottom: '2rem',
  };

  return (
    <div style={cardStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2
          style={{
            fontFamily: '"Gloria Hallelujah", "Caveat", cursive',
            fontSize: '1.8rem',
            marginBottom: '0.5rem',
            color: '#374151',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <Share2 size={28} color="#8b5cf6" />
          Geteilte Pläne
        </h2>
        <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.4' }}>
          Übersicht aller geteilten Pläne in dieser Organisation
        </p>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
          <div style={{ marginBottom: '1rem' }}>Lade geteilte Pläne...</div>
        </div>
      )}

      {error && (
        <div style={{
          padding: '1rem',
          background: '#fef2f2',
          border: '2px solid #fecaca',
          borderRadius: '8px',
          color: '#dc2626',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {!loading && !error && sharedPlans.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem 1rem', 
          color: '#64748b',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '2px dashed #cbd5e1'
        }}>
          <Share2 size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Keine geteilten Pläne vorhanden</p>
          <p style={{ fontSize: '0.9rem' }}>Geteilte Pläne werden hier angezeigt, sobald sie erstellt wurden</p>
        </div>
      )}

      {!loading && !error && sharedPlans.length > 0 && (
        <div style={{ 
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))'
        }}>
          {sharedPlans.map((plan) => (
            <div
              key={plan.id}
              style={{
                border: `2px solid ${plan.isActive ? '#10b981' : '#6b7280'}`,
                borderRadius: '8px',
                padding: '1.5rem',
                background: plan.isActive ? '#f0fdf4' : '#f9fafb',
              }}
            >
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h3 style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: 600, 
                    color: '#1f2937',
                    margin: 0,
                    flex: 1,
                    minWidth: 0,
                    marginRight: '1rem'
                  }}>
                    {plan.title}
                  </h3>
                  <div style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    background: plan.isActive ? '#dcfce7' : '#f3f4f6',
                    color: plan.isActive ? '#166534' : '#6b7280',
                    whiteSpace: 'nowrap'
                  }}>
                    {plan.isActive ? 'Aktiv' : 'Deaktiviert'}
                  </div>
                </div>

                <div style={{ 
                  fontSize: '0.9rem', 
                  color: '#6b7280',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{ marginBottom: '0.25rem' }}>
                    <strong>{plan.dayPlan.name}</strong> • {plan.dayPlan.event.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={12} />
                      {formatDate(plan.dayPlan.date)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Eye size={12} />
                      {plan.viewCount} Aufrufe
                    </span>
                  </div>
                </div>

                {plan.description && (
                  <p style={{ 
                    fontSize: '0.9rem', 
                    color: '#4b5563',
                    margin: '0.5rem 0',
                    fontStyle: 'italic'
                  }}>
                    {plan.description}
                  </p>
                )}

                {plan.expiresAt && (
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    marginBottom: '0.5rem'
                  }}>
                    <Clock size={12} />
                    Läuft ab: {formatDate(plan.expiresAt)}
                  </div>
                )}
              </div>

              <div style={{ 
                fontSize: '0.8rem', 
                color: '#6b7280',
                marginBottom: '1rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid #e5e7eb'
              }}>
                Erstellt von <strong>{plan.creator.username}</strong> am {formatDate(plan.createdAt)}
                {plan.lastViewAt && (
                  <div>Zuletzt aufgerufen: {formatDate(plan.lastViewAt)}</div>
                )}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
                padding: '0.5rem',
                background: '#f8fafc',
                borderRadius: '6px',
                border: '1px solid #e2e8f0'
              }}>
                <ExternalLink size={14} style={{ color: '#64748b', flexShrink: 0 }} />
                <code style={{ 
                  fontSize: '0.75rem',
                  flex: 1,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: '#374151'
                }}>
                  {plan.shareUrl}
                </code>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => copyToClipboard(plan.shareUrl)}
                  style={{
                    flex: 1,
                    padding: '0.5rem 0.75rem',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                >
                  Link kopieren
                </button>
                <button
                  onClick={() => togglePlanStatus(plan.id, plan.isActive)}
                  style={{
                    padding: '0.5rem',
                    background: plan.isActive ? '#f59e0b' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                  title={plan.isActive ? 'Deaktivieren' : 'Aktivieren'}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = plan.isActive ? '#d97706' : '#059669';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = plan.isActive ? '#f59e0b' : '#10b981';
                  }}
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => deletePlan(plan.id)}
                  style={{
                    padding: '0.5rem',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                  title="Löschen"
                  onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrganisationSharedPlans;