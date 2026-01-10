import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Monitor, Trash2, Edit2, X, Check, PowerOff } from 'lucide-react';
import type { Display } from '../../types/display';

interface DisplayManagerProps {
  organisationId: string;
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

const DisplayManager: React.FC<DisplayManagerProps> = ({ organisationId }) => {
  const [displays, setDisplays] = useState<Display[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingDisplayId, setEditingDisplayId] = useState<string | null>(null);
  const [selectedDayPlanId, setSelectedDayPlanId] = useState<string>('');
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [changingPlan, setChangingPlan] = useState(false);
  const [dayPlanMap, setDayPlanMap] = useState<Map<string, { name: string; eventName: string }>>(new Map());
  const [autoRefresh] = useState<boolean>(true);
  const refreshTimerRef = useRef<number | null>(null);
  const lastFetchRef = useRef<number>(0);

  const fetchDisplays = useCallback(async () => {
    // Throttle requests - don't fetch more than once every 5 seconds
    const now = Date.now();
    if (now - lastFetchRef.current < 5000) {
      return;
    }
    lastFetchRef.current = now;

    setLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/organisations/${organisationId}/displays`, {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to fetch displays');
      
      const data = await response.json();
      console.log('Fetched displays:', data); // Debug log
      
      // Filter to show only active displays (status = 'PAIRED' and organisationId is set)
      const activeDisplays = Array.isArray(data) 
        ? data.filter((d: Display) => d.organisationId && d.status === 'PAIRED') 
        : [];
      
      console.log('Active displays:', activeDisplays); // Debug log
      setDisplays(activeDisplays);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch displays.');
      setDisplays([]);
    } finally {
      setLoading(false);
    }
  }, [organisationId]);

  const loadEvents = useCallback(async () => {
    setLoadingEvents(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/organisations/${organisationId}/events`, {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to load events');
      
      const data = await response.json();
      setEvents(Array.isArray(data) ? data : []);
      
      // Create a map of dayPlanId -> { name, eventName }
      const planMap = new Map<string, { name: string; eventName: string }>();
      if (Array.isArray(data)) {
        data.forEach((event: Event) => {
          if (event.dayPlans && Array.isArray(event.dayPlans)) {
            event.dayPlans.forEach((dayPlan: DayPlan) => {
              planMap.set(dayPlan.id, {
                name: dayPlan.name,
                eventName: event.name
              });
            });
          }
        });
      }
      setDayPlanMap(planMap);
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Fehler beim Laden der Veranstaltungen');
    } finally {
      setLoadingEvents(false);
    }
  }, [organisationId]);

  useEffect(() => {
    if (organisationId) {
      fetchDisplays();
      loadEvents();

      // Auto-refresh every 30 seconds if enabled
      if (autoRefresh) {
        refreshTimerRef.current = window.setInterval(() => {
          fetchDisplays();
        }, 30000);
      }

      return () => {
        if (refreshTimerRef.current) {
          clearInterval(refreshTimerRef.current);
        }
      };
    }
  }, [organisationId, fetchDisplays, loadEvents, autoRefresh]);

  const handleDeactivateDisplay = async (displayId: string) => {
    if (!window.confirm('Sind Sie sicher, dass Sie dieses Display deaktivieren und löschen möchten?')) {
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/displays/${displayId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to delete display');
      
      // Immediately remove the display from the list
      setDisplays(prevDisplays => prevDisplays.filter(d => d.id !== displayId));
      
      setSuccess('Display deaktiviert und gelöscht');
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Deaktivieren des Displays');
      setSuccess(null);
    }
  };

  const handleDisconnectDisplay = async (displayId: string) => {
    if (!window.confirm('Dieses Display von der Organisation trennen?')) {
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/displays/pairing/${displayId}/disconnect`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to disconnect display');

      // Remove from active list immediately (will be inactive/unassigned after disconnect)
      setDisplays(prev => prev.filter(d => d.id !== displayId));
      setSuccess('Display erfolgreich getrennt');
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Trennen des Displays');
      setSuccess(null);
    }
  };

  const handleStartEditPlan = (displayId: string, currentPlanId: string | null) => {
    setEditingDisplayId(displayId);
    setSelectedDayPlanId(currentPlanId || '');
  };

  const handleCancelEdit = () => {
    setEditingDisplayId(null);
    setSelectedDayPlanId('');
  };

  const handleChangePlan = async (displayId: string) => {
    if (!selectedDayPlanId) {
      setError('Bitte wähle einen DayPlan aus');
      return;
    }

    setChangingPlan(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/displays/pairing/${displayId}/dayplan`, {
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
        throw new Error(data.error || 'Fehler beim Ändern des DayPlans');
      }

      setSuccess('DayPlan erfolgreich geändert');
      setEditingDisplayId(null);
      setSelectedDayPlanId('');
      fetchDisplays();
    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setChangingPlan(false);
    }
  };
  
  const cardStyle = {
    background: '#fff',
    borderRadius: '1.2rem 1.35rem 1.15rem 1.25rem',
    boxShadow: '2px 4px 0 #e5e7eb, 0 2px 8px 0 rgba(0,0,0,0.08)',
    padding: '2rem',
    border: '2px solid #181818',
    position: 'relative' as const,
    transform: 'rotate(-0.2deg)',
    marginTop: '2rem'
  };

  return (
    <div style={cardStyle}>
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
        fontWeight: 700, 
        color: '#0f172a', 
        marginBottom: '1.5rem',
        letterSpacing: '0.01em'
      }}>
        Active Displays
      </h2>

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
      
      {success && (
        <div style={{
          backgroundColor: '#dcfce7',
          border: '2px solid #10b981',
          color: '#065f46',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontFamily: '"Inter", "Roboto", Arial, sans-serif',
          fontSize: '0.95rem'
        }}>
          {success}
        </div>
      )}

      {loading ? (
        <p style={{ 
          fontFamily: '"Inter", "Roboto", Arial, sans-serif',
          color: '#6b7280'
        }}>
          Displays werden geladen...
        </p>
      ) : displays.length === 0 ? (
        <p style={{ 
          color: '#6b7280', 
          fontStyle: 'italic',
          fontFamily: '"Inter", "Roboto", Arial, sans-serif'
        }}>
          Keine aktiven Displays vorhanden.
        </p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {displays.map((display) => (
            <div
              key={display.id}
              style={{
                backgroundColor: '#f9fafb',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                padding: '1.25rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Monitor size={20} style={{ color: '#6366f1' }} />
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: '1.1rem', 
                      fontWeight: '600', 
                      color: '#1e293b',
                      fontFamily: '"Inter", "Roboto", Arial, sans-serif'
                    }}>
                      {display.name}
                    </h3>
                  </div>
                  <p style={{ 
                    margin: '0.25rem 0 0 0', 
                    fontSize: '0.75rem', 
                    color: '#9ca3af',
                    fontFamily: '"Inter", "Roboto", Arial, sans-serif'
                  }}>
                    ID: <span style={{ fontFamily: 'monospace', fontVariantNumeric: 'tabular-nums' }}>{display.id.slice(-8)}...</span>
                  </p>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleDisconnectDisplay(display.id)}
                    style={{
                      padding: "0.5rem 1rem",
                      border: "2px solid #f59e0b",
                      borderRadius: "8px",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      transition: "all 0.2s ease",
                      backgroundColor: "#fff",
                      color: "#f59e0b",
                      boxShadow: "2px 4px 0 #fde68a"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '3px 6px 0 #fde68a';
                      e.currentTarget.style.backgroundColor = '#fffbeb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '2px 4px 0 #fde68a';
                      e.currentTarget.style.backgroundColor = '#fff';
                    }}
                    title="Display trennen"
                  >
                    <PowerOff size={16} />
                  </button>
                  <button
                    onClick={() => handleStartEditPlan(display.id, display.currentDayPlanId)}
                    style={{
                      padding: "0.5rem 1rem",
                      border: "2px solid #3b82f6",
                      borderRadius: "8px",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      transition: "all 0.2s ease",
                      backgroundColor: "#fff",
                      color: "#3b82f6",
                      boxShadow: "2px 4px 0 #dbeafe"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '3px 6px 0 #dbeafe';
                      e.currentTarget.style.backgroundColor = '#eff6ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '2px 4px 0 #dbeafe';
                      e.currentTarget.style.backgroundColor = '#fff';
                    }}
                    title="Plan ändern"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeactivateDisplay(display.id)}
                    style={{
                      padding: "0.5rem 1rem",
                      border: "2px solid #dc2626",
                      borderRadius: "8px",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      transition: "all 0.2s ease",
                      backgroundColor: "#fff",
                      color: "#dc2626",
                      boxShadow: "2px 4px 0 #fee2e2"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '3px 6px 0 #fee2e2';
                      e.currentTarget.style.backgroundColor = '#fef2f2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '2px 4px 0 #fee2e2';
                      e.currentTarget.style.backgroundColor = '#fff';
                    }}
                    title="Display deaktivieren"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Display current day plan or edit form */}
              {editingDisplayId === display.id ? (
                <div style={{
                  borderTop: '2px solid #e5e7eb',
                  paddingTop: '1rem',
                  marginTop: '0.5rem'
                }}>
                  <h4 style={{
                    fontFamily: '"Gloria Hallelujah", "Caveat", cursive',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.75rem'
                  }}>
                    DayPlan ändern
                  </h4>
                  
                  {loadingEvents ? (
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', fontFamily: '"Inter", "Roboto", Arial, sans-serif' }}>
                      Lade Veranstaltungen...
                    </p>
                  ) : events.length === 0 ? (
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', fontFamily: '"Inter", "Roboto", Arial, sans-serif', fontStyle: 'italic' }}>
                      Keine Events gefunden
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                      {events.map((event) => (
                        <div key={event.id}>
                          <p style={{
                            fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#475569',
                            marginBottom: '0.25rem'
                          }}>
                            {event.name}
                          </p>
                          {event.dayPlans && event.dayPlans.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginLeft: '0.5rem' }}>
                              {event.dayPlans.map((dayPlan) => (
                                <label
                                  key={dayPlan.id}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0.5rem',
                                    border: selectedDayPlanId === dayPlan.id ? '2px solid #10b981' : '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    backgroundColor: selectedDayPlanId === dayPlan.id ? '#d1fae5' : 'white',
                                    transition: 'all 0.2s ease',
                                    fontSize: '0.875rem'
                                  }}
                                >
                                  <input
                                    type="radio"
                                    name={`dayplan-${display.id}`}
                                    value={dayPlan.id}
                                    checked={selectedDayPlanId === dayPlan.id}
                                    onChange={() => setSelectedDayPlanId(dayPlan.id)}
                                    style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                                  />
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '500', color: '#1e293b', fontFamily: '"Inter", "Roboto", Arial, sans-serif' }}>
                                      {dayPlan.name}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: '"Inter", "Roboto", Arial, sans-serif' }}>
                                      {new Date(dayPlan.date).toLocaleDateString('de-DE')}
                                    </div>
                                  </div>
                                </label>
                              ))}
                            </div>
                          ) : (
                            <p style={{ fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic', marginLeft: '0.5rem', fontFamily: '"Inter", "Roboto", Arial, sans-serif' }}>
                              Keine Tagespläne vorhanden
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={handleCancelEdit}
                      disabled={changingPlan}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        backgroundColor: '#fff',
                        color: '#374151',
                        border: '2px solid #cbd5e1',
                        borderRadius: '6px',
                        cursor: changingPlan ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <X size={16} />
                      Abbrechen
                    </button>
                    <button
                      onClick={() => handleChangePlan(display.id)}
                      disabled={!selectedDayPlanId || changingPlan}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        backgroundColor: !selectedDayPlanId || changingPlan ? '#9ca3af' : '#10b981',
                        color: 'white',
                        border: '2px solid #181818',
                        borderRadius: '6px',
                        cursor: !selectedDayPlanId || changingPlan ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '700',
                        fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <Check size={16} />
                      {changingPlan ? 'Wird geändert...' : 'Ändern'}
                    </button>
                  </div>
                </div>
              ) : (
                display.currentDayPlanId && (
                  <div style={{
                    borderTop: '2px solid #e5e7eb',
                    paddingTop: '0.75rem',
                    marginTop: '0.5rem'
                  }}>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '0.875rem', 
                      color: '#475569',
                      fontFamily: '"Inter", "Roboto", Arial, sans-serif'
                    }}>
                      <strong>Aktueller Plan:</strong>{' '}
                      {dayPlanMap.get(display.currentDayPlanId) ? (
                        <>
                          {dayPlanMap.get(display.currentDayPlanId)!.name}
                          <span style={{ color: '#9ca3af', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                            ({dayPlanMap.get(display.currentDayPlanId)!.eventName})
                          </span>
                        </>
                      ) : (
                        <span style={{ fontFamily: 'monospace', color: '#9ca3af' }}>
                          {display.currentDayPlanId}
                        </span>
                      )}
                    </p>
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DisplayManager;
