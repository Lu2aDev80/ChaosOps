import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Display } from '../../types/display';

interface DevicePairingAdminProps {
  onSuccess?: (deviceId: string) => void;
  orgId?: string;
}

interface DayPlan {
  id: string;
  name: string;
  date: string;
}

interface Event {
  id: string;
  name: string;
  dayPlans: DayPlan[];
}

const DevicePairingAdmin: React.FC<DevicePairingAdminProps> = ({ onSuccess, orgId: propOrgId }) => {
  const [searchParams] = useSearchParams();
  const orgId = propOrgId || searchParams.get('org');
  
  const [pairingCode, setPairingCode] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pairedDevice, setPairedDevice] = useState<Display | null>(null);
  const [showDayPlanModal, setShowDayPlanModal] = useState(false);
  
  // DayPlan selection
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDayPlanId, setSelectedDayPlanId] = useState('');
  const [dayPlanLoading, setDayPlanLoading] = useState(false);

  const loadEvents = useCallback(async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/minihackathon/api';
      const response = await fetch(`${apiUrl}/organisations/${orgId}/events`, {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to load events');
      
      const data = await response.json();
      console.log('Events loaded:', data); // Debug log
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Fehler beim Laden der Veranstaltungen');
    }
  }, [orgId]);

  useEffect(() => {
    if (orgId) {
      loadEvents();
    }
  }, [orgId, loadEvents]);

  const handlePairDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orgId) {
      setError('Organisation ID fehlt in der URL. Bitte verwende: ?org=<organisationID>');
      return;
    }

    if (!pairingCode.trim()) {
      setError('Bitte gib einen Kopplungs-Code ein');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/minihackathon/api';
      const response = await fetch(`${apiUrl}/displays/pairing/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          pairingCode: pairingCode.trim(),
          organisationId: orgId,
          deviceName: deviceName.trim() || undefined
        })
      });

      if (!response.ok) {
        const data: { error?: string } = await response.json();
        throw new Error(data.error || 'Fehler beim Koppeln des Geräts');
      }

      const data: { display: Display } = await response.json();
      setPairedDevice(data.display);
      
      // Show DayPlan selection modal
      setShowDayPlanModal(true);
      
      // Reset form
      setPairingCode('');
      setDeviceName('');
      
      if (onSuccess && data.display) {
        onSuccess(data.display.id);
      }

    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDayPlan = async () => {
    if (!selectedDayPlanId || !pairedDevice) {
      setError('Bitte wähle einen DayPlan aus');
      return;
    }

    setDayPlanLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/minihackathon/api';
      const response = await fetch(`${apiUrl}/displays/pairing/${pairedDevice.id}/dayplan`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          dayPlanId: selectedDayPlanId
        })
      });

      if (!response.ok) {
        const data: { error?: string } = await response.json();
        throw new Error(data.error || 'Fehler beim Zuweisen des DayPlans');
      }

      // Success - close modal
      setShowDayPlanModal(false);
      setPairedDevice(null);
      setSelectedDayPlanId('');

    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setDayPlanLoading(false);
    }
  };

  const closeModal = () => {
    setShowDayPlanModal(false);
    setPairedDevice(null);
    setSelectedDayPlanId('');
  };

  return (
    <>
      <div style={{
        background: '#fff',
        borderRadius: '1.2rem 1.35rem 1.15rem 1.25rem',
        boxShadow: '2px 4px 0 #e5e7eb, 0 2px 8px 0 rgba(0,0,0,0.08)',
        padding: '2rem',
        border: '2px solid #181818',
        position: 'relative',
        transform: 'rotate(-0.2deg)',
        marginTop: '2rem',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        {/* Tape */}
        <div style={{
          position: 'absolute',
          top: '-12px',
          left: '50%',
          width: '45px',
          height: '16px',
          background: 'repeating-linear-gradient(135deg, #fffbe7 0 6px, #fbbf24 6px 12px)',
          borderRadius: '6px',
          border: '1.5px solid #eab308',
          boxShadow: '0 1px 4px #eab30844',
          transform: 'translateX(-50%) rotate(-4deg)',
          zIndex: 2
        }} />

        <h2 style={{ 
          fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
          fontSize: '1.5rem', 
          fontWeight: '700',
          marginBottom: '1.5rem',
          color: '#0f172a'
        }}>
          Display Koppeln
        </h2>

        {!orgId && (
          <div style={{
            backgroundColor: '#fef3c7',
            border: '2px solid #fbbf24',
            color: '#92400e',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontFamily: '"Inter", "Roboto", Arial, sans-serif',
            fontSize: '0.95rem'
          }}>
            ⚠️ Keine Organisation ausgewählt. Füge ?org=&lt;organisationID&gt; zur URL hinzu.
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '2px solid #ef4444',
            color: '#991b1b',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontFamily: '"Inter", "Roboto", Arial, sans-serif',
            fontSize: '0.95rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handlePairDevice}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#0f172a',
              fontFamily: '"Gloria Hallelujah", "Caveat", cursive',
              fontSize: '1rem'
            }}>
              Kopplungs-Code vom Display *
            </label>
            <input
              type="text"
              value={pairingCode}
              onChange={(e) => setPairingCode(e.target.value)}
              placeholder="123456"
              maxLength={6}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '1.5rem',
                fontFamily: 'monospace',
                letterSpacing: '0.3rem',
                textAlign: 'center',
                boxSizing: 'border-box'
              }}
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#0f172a',
              fontFamily: '"Gloria Hallelujah", "Caveat", cursive',
              fontSize: '1rem'
            }}>
              Display Name (Optional)
            </label>
            <input
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="z.B. Empfangs-Display"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '1rem',
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                boxSizing: 'border-box'
              }}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !orgId}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: loading || !orgId ? '#9ca3af' : '#10b981',
              color: 'white',
              border: '2px solid #181818',
              borderRadius: '8px',
              cursor: loading || !orgId ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '700',
              fontFamily: '"Inter", "Roboto", Arial, sans-serif',
              boxShadow: '2px 4px 0 #181818',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!loading && orgId) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '3px 6px 0 #181818';
                e.currentTarget.style.backgroundColor = '#059669';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && orgId) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '2px 4px 0 #181818';
                e.currentTarget.style.backgroundColor = '#10b981';
              }
            }}
          >
            {loading ? 'Kopplung läuft...' : 'Display koppeln'}
          </button>
        </form>

        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          fontSize: '0.875rem',
          color: '#6b7280',
          fontFamily: '"Inter", "Roboto", Arial, sans-serif'
        }}>
          <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Anleitung:</p>
          <ol style={{ marginLeft: '1.5rem', marginTop: '0.5rem', lineHeight: '1.6' }}>
            <li>Öffne /register-display auf dem Display-Gerät</li>
            <li>Notiere den 6-stelligen Code vom Display</li>
            <li>Gib den Code hier ein und klicke auf "Display koppeln"</li>
            <li>Wähle anschließend den DayPlan aus, der angezeigt werden soll</li>
          </ol>
        </div>
      </div>

      {/* DayPlan Selection Modal */}
      {showDayPlanModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '1.2rem 1.35rem 1.15rem 1.25rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            padding: '2.5rem 2rem',
            border: '2px solid #181818',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '85vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            {/* Tape */}
            <div style={{
              position: 'absolute',
              top: '-12px',
              left: '50%',
              width: '45px',
              height: '16px',
              background: 'repeating-linear-gradient(135deg, #fffbe7 0 6px, #fbbf24 6px 12px)',
              borderRadius: '6px',
              border: '1.5px solid #eab308',
              boxShadow: '0 1px 4px #eab30844',
              transform: 'translateX(-50%) rotate(-4deg)',
              zIndex: 2
            }} />

            <h2 style={{ 
              fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
              fontSize: '1.5rem', 
              fontWeight: '700',
              marginBottom: '1rem',
              color: '#0f172a'
            }}>
              DayPlan auswählen
            </h2>

            <p style={{ 
              marginBottom: '1.5rem', 
              color: '#64748b',
              fontFamily: '"Inter", "Roboto", Arial, sans-serif',
              fontSize: '0.95rem',
              lineHeight: '1.6'
            }}>
              Welcher DayPlan soll auf dem Display "{pairedDevice?.name || 'Unbenannt'}" angezeigt werden?
            </p>

            {error && (
              <div style={{
                backgroundColor: '#fee2e2',
                border: '2px solid #ef4444',
                color: '#991b1b',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                fontSize: '0.95rem'
              }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              {events.length === 0 ? (
                <p style={{ 
                  color: '#6b7280', 
                  textAlign: 'center',
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  fontStyle: 'italic'
                }}>
                  Keine Events gefunden
                </p>
              ) : (
                events.map((event) => (
                  <div key={event.id} style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ 
                      fontFamily: '"Gloria Hallelujah", "Caveat", cursive',
                      fontSize: '1.1rem', 
                      fontWeight: '600', 
                      marginBottom: '0.75rem',
                      color: '#374151'
                    }}>
                      {event.name}
                    </h3>
                    {event.dayPlans && event.dayPlans.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {event.dayPlans.map((dayPlan) => (
                          <label
                            key={dayPlan.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '0.875rem',
                              border: selectedDayPlanId === dayPlan.id 
                                ? '2px solid #10b981' 
                                : '2px solid #e5e7eb',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              backgroundColor: selectedDayPlanId === dayPlan.id 
                                ? '#d1fae5' 
                                : 'white',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              if (selectedDayPlanId !== dayPlan.id) {
                                e.currentTarget.style.backgroundColor = '#f9fafb';
                                e.currentTarget.style.borderColor = '#cbd5e1';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selectedDayPlanId !== dayPlan.id) {
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.borderColor = '#e5e7eb';
                              }
                            }}
                          >
                            <input
                              type="radio"
                              name="dayplan"
                              value={dayPlan.id}
                              checked={selectedDayPlanId === dayPlan.id}
                              onChange={() => setSelectedDayPlanId(dayPlan.id)}
                              style={{ marginRight: '0.75rem', cursor: 'pointer' }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ 
                                fontWeight: '600', 
                                color: '#1e293b',
                                fontFamily: '"Inter", "Roboto", Arial, sans-serif'
                              }}>{dayPlan.name}</div>
                              <div style={{ 
                                fontSize: '0.875rem', 
                                color: '#6b7280', 
                                marginTop: '0.25rem',
                                fontFamily: '"Inter", "Roboto", Arial, sans-serif'
                              }}>
                                {new Date(dayPlan.date).toLocaleDateString('de-DE')}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p style={{ 
                        fontSize: '0.875rem', 
                        color: '#9ca3af', 
                        fontStyle: 'italic',
                        fontFamily: '"Inter", "Roboto", Arial, sans-serif'
                      }}>
                        Keine Tagespläne vorhanden
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={closeModal}
                disabled={dayPlanLoading}
                style={{
                  flex: 1,
                  minWidth: '120px',
                  padding: '0.75rem',
                  backgroundColor: '#fff',
                  color: '#374151',
                  border: '2px solid #cbd5e1',
                  borderRadius: '8px',
                  cursor: dayPlanLoading ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  boxShadow: '2px 4px 0 #e5e7eb',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!dayPlanLoading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '3px 6px 0 #e5e7eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!dayPlanLoading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '2px 4px 0 #e5e7eb';
                  }
                }}
              >
                Abbrechen
              </button>
              <button
                onClick={handleAssignDayPlan}
                disabled={!selectedDayPlanId || dayPlanLoading}
                style={{
                  flex: 1,
                  minWidth: '120px',
                  padding: '0.75rem',
                  backgroundColor: !selectedDayPlanId || dayPlanLoading ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: '2px solid #181818',
                  borderRadius: '8px',
                  cursor: !selectedDayPlanId || dayPlanLoading ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '700',
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  boxShadow: '2px 4px 0 #181818',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (selectedDayPlanId && !dayPlanLoading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '3px 6px 0 #181818';
                    e.currentTarget.style.backgroundColor = '#059669';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedDayPlanId && !dayPlanLoading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '2px 4px 0 #181818';
                    e.currentTarget.style.backgroundColor = '#10b981';
                  }
                }}
              >
                {dayPlanLoading ? 'Wird zugewiesen...' : 'DayPlan zuweisen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DevicePairingAdmin;
