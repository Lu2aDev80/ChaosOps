import React, { useState, useEffect } from 'react';
import { Share2, Copy, QrCode, Edit2, Trash2, X, Plus, Calendar, Eye, ExternalLink, Check } from 'lucide-react';
import QRCodeLib from 'qrcode';

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
}

interface SharePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayPlanId: string;
  dayPlanName: string;
  onSharedPlanCreated: (sharedPlan: SharedPlan) => void;
}

interface SharedPlansManagerProps {
  dayPlanId: string;
  dayPlanName: string;
}

const SharePlanModal: React.FC<SharePlanModalProps> = ({
  isOpen,
  onClose,
  dayPlanId,
  dayPlanName,
  onSharedPlanCreated,
}) => {
  const [title, setTitle] = useState(dayPlanName);
  const [description, setDescription] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/dayplans/${dayPlanId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim() || dayPlanName,
          description: description.trim() || undefined,
          expiresAt: expiresAt || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create shared plan');
      }

      const sharedPlan = await response.json();
      onSharedPlanCreated(sharedPlan);
      onClose();
      
      // Reset form
      setTitle(dayPlanName);
      setDescription('');
      setExpiresAt('');
    } catch (err: any) {
      setError(err.message || 'Failed to create shared plan');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '1rem'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '1.2rem 1.35rem 1.15rem 1.25rem',
        boxShadow: '4px 6px 0 #181818, 0 4px 16px rgba(0,0,0,0.15)',
        border: '3px solid #181818',
        maxWidth: '450px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative',
        transform: 'rotate(-0.3deg)',
      }}>
        {/* Tape decoration */}
        <div style={{
          position: 'absolute',
          top: '-12px',
          left: '50%',
          width: '55px',
          height: '18px',
          background: 'repeating-linear-gradient(135deg, #fffbe7 0 6px, #fbbf24 6px 12px)',
          borderRadius: '8px',
          border: '2px solid #eab308',
          boxShadow: '0 3px 6px rgba(0,0,0,0.25)',
          transform: 'translateX(-50%) rotate(-4deg)',
          zIndex: 10,
        }} />
        
        <div style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                background: '#dbeafe',
                borderRadius: '50%',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Share2 size={22} color="#2563eb" />
              </div>
              <h2 style={{
                fontSize: '1.4rem',
                fontWeight: 700,
                color: '#181818',
                fontFamily: "'Gloria Hallelujah', 'Caveat', 'Comic Neue', cursive, sans-serif",
                margin: 0
              }}>Plan teilen</h2>
            </div>
            <button
              onClick={onClose}
              style={{
                background: '#f3f4f6',
                border: '2px solid #181818',
                borderRadius: '50%',
                padding: '0.4rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
              aria-label="Schließen"
            >
              <X size={18} color="#181818" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label htmlFor="title" style={{
                  display: 'block',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#181818',
                  marginBottom: '0.5rem',
                  fontFamily: "'Inter', 'Roboto', Arial, sans-serif"
                }}>
                  Titel für geteilten Plan
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid #181818',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    fontFamily: "'Inter', 'Roboto', Arial, sans-serif",
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'box-shadow 0.2s'
                  }}
                  onFocus={(e) => e.currentTarget.style.boxShadow = '3px 3px 0 #fbbf24'}
                  onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                  placeholder="Titel für den geteilten Plan"
                />
              </div>

              <div>
                <label htmlFor="description" style={{
                  display: 'block',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#181818',
                  marginBottom: '0.5rem',
                  fontFamily: "'Inter', 'Roboto', Arial, sans-serif"
                }}>
                  Beschreibung (optional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid #181818',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    fontFamily: "'Inter', 'Roboto', Arial, sans-serif",
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    transition: 'box-shadow 0.2s'
                  }}
                  onFocus={(e) => e.currentTarget.style.boxShadow = '3px 3px 0 #fbbf24'}
                  onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                  placeholder="Zusätzliche Informationen für die geteilte Ansicht"
                />
              </div>

              <div>
                <label htmlFor="expiresAt" style={{
                  display: 'block',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#181818',
                  marginBottom: '0.5rem',
                  fontFamily: "'Inter', 'Roboto', Arial, sans-serif"
                }}>
                  Ablaufdatum (optional)
                </label>
                <input
                  id="expiresAt"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid #181818',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    fontFamily: "'Inter', 'Roboto', Arial, sans-serif",
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'box-shadow 0.2s'
                  }}
                  onFocus={(e) => e.currentTarget.style.boxShadow = '3px 3px 0 #fbbf24'}
                  onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                />
                <p style={{
                  fontSize: '0.8rem',
                  color: '#6b7280',
                  marginTop: '0.4rem',
                  fontFamily: "'Inter', 'Roboto', Arial, sans-serif"
                }}>
                  Wenn leer, läuft der Link nicht ab
                </p>
              </div>
            </div>

            {error && (
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem 1rem',
                background: '#fef2f2',
                border: '2px solid #ef4444',
                borderRadius: '0.75rem'
              }}>
                <p style={{ fontSize: '0.9rem', color: '#dc2626', margin: 0, fontFamily: "'Inter', 'Roboto', Arial, sans-serif" }}>{error}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  background: '#f3f4f6',
                  border: '2px solid #181818',
                  borderRadius: '0.75rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#181818',
                  cursor: 'pointer',
                  fontFamily: "'Inter', 'Roboto', Arial, sans-serif",
                  transition: 'all 0.2s',
                  boxShadow: '2px 2px 0 #181818'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translate(-1px, -1px)';
                  e.currentTarget.style.boxShadow = '3px 3px 0 #181818';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translate(0, 0)';
                  e.currentTarget.style.boxShadow = '2px 2px 0 #181818';
                }}
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  background: loading ? '#93c5fd' : '#fbbf24',
                  border: '2px solid #181818',
                  borderRadius: '0.75rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#181818',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: "'Inter', 'Roboto', Arial, sans-serif",
                  transition: 'all 0.2s',
                  boxShadow: '2px 2px 0 #181818'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translate(-1px, -1px)';
                    e.currentTarget.style.boxShadow = '3px 3px 0 #181818';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translate(0, 0)';
                  e.currentTarget.style.boxShadow = '2px 2px 0 #181818';
                }}
              >
                {loading ? 'Erstelle...' : 'Erstellen'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const SharedPlansManager: React.FC<SharedPlansManagerProps> = ({ dayPlanId, dayPlanName }) => {
  const [sharedPlans, setSharedPlans] = useState<SharedPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SharedPlan | null>(null);

  useEffect(() => {
    fetchSharedPlans();
  }, [dayPlanId]);

  const fetchSharedPlans = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/dayplans/${dayPlanId}/shares`, {
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

  const generateQRCode = async (url: string, plan: SharedPlan) => {
    try {
      const qrDataUrl = await QRCodeLib.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qrDataUrl);
      setSelectedPlan(plan);
      setShowQrModal(true);
    } catch (err) {
      console.error('Failed to generate QR code:', err);
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

  return (
    <div style={{
      background: '#fff',
      borderRadius: '1.1rem 1.3rem 1.2rem 1.15rem',
      boxShadow: '3px 4px 0 #181818, 0 2px 12px rgba(0,0,0,0.08)',
      border: '2.5px solid #181818',
      padding: '1.5rem',
      position: 'relative',
      transform: 'rotate(0.15deg)',
    }}>
      {/* Tape decoration */}
      <div style={{
        position: 'absolute',
        top: '-12px',
        left: '50%',
        width: '55px',
        height: '18px',
        background: 'repeating-linear-gradient(135deg, #fffbe7 0 6px, #fbbf24 6px 12px)',
        borderRadius: '8px',
        border: '2px solid #eab308',
        boxShadow: '0 3px 6px rgba(0,0,0,0.25)',
        transform: 'translateX(-50%) rotate(-3deg)',
        zIndex: 10,
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            background: '#dbeafe',
            borderRadius: '50%',
            padding: '0.4rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #3b82f6'
          }}>
            <Share2 size={18} color="#2563eb" />
          </div>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#181818',
            fontFamily: "'Gloria Hallelujah', 'Caveat', 'Comic Neue', cursive, sans-serif",
            margin: 0
          }}>Geteilte Pläne</h3>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.6rem 1rem',
            background: '#fbbf24',
            border: '2px solid #181818',
            borderRadius: '0.6rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#181818',
            cursor: 'pointer',
            fontFamily: "'Inter', 'Roboto', Arial, sans-serif",
            boxShadow: '2px 2px 0 #181818',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translate(-1px, -1px)';
            e.currentTarget.style.boxShadow = '3px 3px 0 #181818';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translate(0, 0)';
            e.currentTarget.style.boxShadow = '2px 2px 0 #181818';
          }}
        >
          <Plus size={16} />
          Neuen Link erstellen
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #fbbf24',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#6b7280', fontFamily: "'Inter', 'Roboto', Arial, sans-serif" }}>Lade geteilte Pläne...</p>
        </div>
      )}

      {error && (
        <div style={{
          padding: '0.75rem 1rem',
          background: '#fef2f2',
          border: '2px solid #ef4444',
          borderRadius: '0.75rem'
        }}>
          <p style={{ fontSize: '0.9rem', color: '#dc2626', margin: 0, fontFamily: "'Inter', 'Roboto', Arial, sans-serif" }}>{error}</p>
        </div>
      )}

      {!loading && !error && sharedPlans.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
          <div style={{
            background: '#f3f4f6',
            borderRadius: '50%',
            width: '70px',
            height: '70px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            border: '2px dashed #d1d5db'
          }}>
            <Share2 size={32} color="#9ca3af" />
          </div>
          <p style={{
            fontSize: '1.1rem',
            fontWeight: 600,
            color: '#181818',
            fontFamily: "'Gloria Hallelujah', 'Caveat', 'Comic Neue', cursive, sans-serif",
            marginBottom: '0.5rem'
          }}>Keine geteilten Pläne</p>
          <p style={{
            fontSize: '0.9rem',
            color: '#6b7280',
            fontFamily: "'Inter', 'Roboto', Arial, sans-serif"
          }}>Erstellen Sie einen geteilten Link, um diesen Plan zu teilen</p>
        </div>
      )}

      {!loading && !error && sharedPlans.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sharedPlans.map((plan) => (
            <SharedPlanCard
              key={plan.id}
              plan={plan}
              onCopy={copyToClipboard}
              onQrCode={generateQRCode}
              onToggle={togglePlanStatus}
              onDelete={deletePlan}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <SharePlanModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        dayPlanId={dayPlanId}
        dayPlanName={dayPlanName}
        onSharedPlanCreated={(newPlan) => {
          setSharedPlans([newPlan, ...sharedPlans]);
        }}
      />

      {/* QR Code Modal */}
      {showQrModal && selectedPlan && qrCodeUrl && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '1rem'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '1.2rem 1.35rem 1.15rem 1.25rem',
            boxShadow: '4px 6px 0 #181818, 0 4px 16px rgba(0,0,0,0.15)',
            border: '3px solid #181818',
            maxWidth: '350px',
            width: '100%',
            position: 'relative',
            transform: 'rotate(0.3deg)',
          }}>
            {/* Tape decoration */}
            <div style={{
              position: 'absolute',
              top: '-12px',
              left: '50%',
              width: '55px',
              height: '18px',
              background: 'repeating-linear-gradient(135deg, #fffbe7 0 6px, #fbbf24 6px 12px)',
              borderRadius: '8px',
              border: '2px solid #eab308',
              boxShadow: '0 3px 6px rgba(0,0,0,0.25)',
              transform: 'translateX(-50%) rotate(-2deg)',
              zIndex: 10,
            }} />
            
            <div style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  color: '#181818',
                  fontFamily: "'Gloria Hallelujah', 'Caveat', 'Comic Neue', cursive, sans-serif",
                  margin: 0
                }}>QR-Code</h3>
                <button
                  onClick={() => setShowQrModal(false)}
                  style={{
                    background: '#f3f4f6',
                    border: '2px solid #181818',
                    borderRadius: '50%',
                    padding: '0.4rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
                >
                  <X size={18} color="#181818" />
                </button>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  background: '#fff',
                  border: '3px solid #181818',
                  borderRadius: '1rem',
                  padding: '1rem',
                  display: 'inline-block',
                  boxShadow: '3px 3px 0 #e5e7eb'
                }}>
                  <img src={qrCodeUrl} alt="QR Code" style={{ display: 'block' }} />
                </div>
                <p style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#181818',
                  marginTop: '1rem',
                  marginBottom: '0.4rem',
                  fontFamily: "'Inter', 'Roboto', Arial, sans-serif"
                }}>{selectedPlan.title}</p>
                <p style={{
                  fontSize: '0.85rem',
                  color: '#6b7280',
                  fontFamily: "'Inter', 'Roboto', Arial, sans-serif"
                }}>Scannen Sie den QR-Code, um den Plan zu öffnen</p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  onClick={() => copyToClipboard(selectedPlan.shareUrl)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    padding: '0.75rem 1rem',
                    background: '#f3f4f6',
                    border: '2px solid #181818',
                    borderRadius: '0.75rem',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: '#181818',
                    cursor: 'pointer',
                    fontFamily: "'Inter', 'Roboto', Arial, sans-serif",
                    boxShadow: '2px 2px 0 #181818',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translate(-1px, -1px)';
                    e.currentTarget.style.boxShadow = '3px 3px 0 #181818';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translate(0, 0)';
                    e.currentTarget.style.boxShadow = '2px 2px 0 #181818';
                  }}
                >
                  <Copy size={16} />
                  Link kopieren
                </button>
                <button
                  onClick={() => setShowQrModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    background: '#fbbf24',
                    border: '2px solid #181818',
                    borderRadius: '0.75rem',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: '#181818',
                    cursor: 'pointer',
                    fontFamily: "'Inter', 'Roboto', Arial, sans-serif",
                    boxShadow: '2px 2px 0 #181818',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translate(-1px, -1px)';
                    e.currentTarget.style.boxShadow = '3px 3px 0 #181818';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translate(0, 0)';
                    e.currentTarget.style.boxShadow = '2px 2px 0 #181818';
                  }}
                >
                  Schließen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Separate component for shared plan cards
const SharedPlanCard: React.FC<{
  plan: SharedPlan;
  onCopy: (url: string) => void;
  onQrCode: (url: string, plan: SharedPlan) => void;
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  formatDate: (date: string) => string;
}> = ({ plan, onCopy, onQrCode, onToggle, onDelete, formatDate }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(plan.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      border: `2px solid ${plan.isActive ? '#22c55e' : '#d1d5db'}`,
      borderRadius: '0.85rem',
      padding: '1rem 1.25rem',
      background: plan.isActive ? '#f0fdf4' : '#f9fafb',
      transition: 'all 0.2s'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h4 style={{
            fontSize: '1.05rem',
            fontWeight: 600,
            color: '#181818',
            margin: '0 0 0.25rem 0',
            fontFamily: "'Inter', 'Roboto', Arial, sans-serif"
          }}>{plan.title}</h4>
          {plan.description && (
            <p style={{
              fontSize: '0.9rem',
              color: '#4b5563',
              margin: '0.25rem 0 0 0',
              fontFamily: "'Inter', 'Roboto', Arial, sans-serif"
            }}>{plan.description}</p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.25rem',
              fontSize: '0.8rem',
              color: '#6b7280',
              fontFamily: "'Inter', 'Roboto', Arial, sans-serif"
            }}>
              <Calendar size={12} />
              Erstellt: {formatDate(plan.createdAt)}
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.25rem',
              fontSize: '0.8rem',
              color: '#6b7280',
              fontFamily: "'Inter', 'Roboto', Arial, sans-serif"
            }}>
              <Eye size={12} />
              {plan.viewCount} Aufrufe
            </div>
            {plan.expiresAt && (
              <div style={{ 
                fontSize: '0.8rem',
                color: '#ea580c',
                fontWeight: 500,
                fontFamily: "'Inter', 'Roboto', Arial, sans-serif"
              }}>
                Läuft ab: {formatDate(plan.expiresAt)}
              </div>
            )}
          </div>
        </div>
        <div style={{
          padding: '0.3rem 0.75rem',
          borderRadius: '2rem',
          fontSize: '0.8rem',
          fontWeight: 600,
          background: plan.isActive ? '#dcfce7' : '#f3f4f6',
          color: plan.isActive ? '#166534' : '#4b5563',
          border: `1.5px solid ${plan.isActive ? '#22c55e' : '#d1d5db'}`,
          fontFamily: "'Inter', 'Roboto', Arial, sans-serif"
        }}>
          {plan.isActive ? 'Aktiv' : 'Deaktiviert'}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ 
          flex: 1, 
          minWidth: '200px',
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          background: '#f3f4f6',
          border: '1.5px solid #d1d5db',
          borderRadius: '0.5rem',
          padding: '0.5rem 0.75rem',
          overflow: 'hidden'
        }}>
          <ExternalLink size={14} color="#6b7280" style={{ flexShrink: 0 }} />
          <code style={{
            fontSize: '0.8rem',
            color: '#374151',
            fontFamily: 'monospace',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1
          }}>
            {plan.shareUrl}
          </code>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <IconButton 
            onClick={handleCopy} 
            icon={copied ? <Check size={16} /> : <Copy size={16} />} 
            color={copied ? '#22c55e' : '#3b82f6'} 
            bgColor={copied ? '#dcfce7' : '#dbeafe'}
            title="Link kopieren" 
          />
          <IconButton 
            onClick={() => onQrCode(plan.shareUrl, plan)} 
            icon={<QrCode size={16} />} 
            color="#9333ea" 
            bgColor="#f3e8ff"
            title="QR-Code anzeigen" 
          />
          <IconButton 
            onClick={() => onToggle(plan.id, plan.isActive)} 
            icon={<Edit2 size={16} />} 
            color={plan.isActive ? '#ea580c' : '#22c55e'} 
            bgColor={plan.isActive ? '#fff7ed' : '#f0fdf4'}
            title={plan.isActive ? 'Deaktivieren' : 'Aktivieren'} 
          />
          <IconButton 
            onClick={() => onDelete(plan.id)} 
            icon={<Trash2 size={16} />} 
            color="#ef4444" 
            bgColor="#fef2f2"
            title="Löschen" 
          />
        </div>
      </div>
    </div>
  );
};

// Reusable icon button component
const IconButton: React.FC<{
  onClick: () => void;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  title: string;
}> = ({ onClick, icon, color, bgColor, title }) => {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        padding: '0.5rem',
        background: bgColor,
        border: `2px solid ${color}`,
        borderRadius: '0.5rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
        transition: 'all 0.2s',
        boxShadow: `1px 1px 0 ${color}`
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translate(-1px, -1px)';
        e.currentTarget.style.boxShadow = `2px 2px 0 ${color}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translate(0, 0)';
        e.currentTarget.style.boxShadow = `1px 1px 0 ${color}`;
      }}
    >
      {icon}
    </button>
  );
};

export default SharedPlansManager;