import React, { useState, useEffect } from 'react';
import { ChevronRight, X } from 'lucide-react';
import type { Event } from '../../types/event';

interface DisplayPairingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
}

type SelectionMode = 'event' | 'single' | null;
type ModalStep = 'pairing-code' | 'selection-mode' | 'event-selection';

const DisplayPairingModal: React.FC<DisplayPairingModalProps> = ({
  isOpen,
  onClose,
  orgId,
}) => {
  const [modalStep, setModalStep] = useState<ModalStep>('pairing-code');
  const [pairingCode, setPairingCode] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [pairedDeviceId, setPairedDeviceId] = useState<string>('');
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingPairing, setLoadingPairing] = useState(false);
  const [error, setError] = useState<string>('');

  // Load events when entering selection mode
  useEffect(() => {
    if (modalStep === 'event-selection' && events.length === 0) {
      loadEvents();
    }
  }, [modalStep, events.length]);

  const loadEvents = async () => {
    setLoadingEvents(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/minihackathon/api';
      const response = await fetch(`${apiUrl}/organisations/${orgId}/events`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to load events');
      const data = await response.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleSelectDayPlan = async (dayPlanId: string) => {
    if (!pairedDeviceId) {
      setError('Device ID nicht gefunden');
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/minihackathon/api';
      const response = await fetch(
        `${apiUrl}/displays/pairing/${pairedDeviceId}/dayplan`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ dayPlanId }),
        }
      );

      if (!response.ok) throw new Error('Failed to assign day plan');
      
      // Success - reset and close
      resetModal();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to assign day plan');
    }
  };

  const handlePairingCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pairingCode.trim()) {
      setError('Bitte gib einen Code ein');
      return;
    }

    setLoadingPairing(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/minihackathon/api';
      const response = await fetch(`${apiUrl}/displays/pairing/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          pairingCode: pairingCode.trim(),
          organisationId: orgId,
          deviceName: deviceName.trim() || undefined
        })
      });

      if (!response.ok) {
        const data: any = await response.json();
        throw new Error(data.error || 'Fehler beim Koppeln des Displays');
      }

      const data: any = await response.json();
      if (data.display?.id) {
        setPairedDeviceId(data.display.id);
        setModalStep('selection-mode');
      } else {
        throw new Error('Ungültige Antwort vom Server');
      }
    } catch (err: any) {
      setError(err.message || 'Fehler beim Koppeln des Displays');
    } finally {
      setLoadingPairing(false);
    }
  };

  const getEventStatus = (dayPlanDate?: string) => {
    if (!dayPlanDate) return { text: '', color: '#64748b' };
    
    const now = new Date();
    const dayStart = new Date(dayPlanDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayPlanDate);
    dayEnd.setHours(23, 59, 59, 999);

    if (now < dayStart) {
      const diff = dayStart.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) {
        return { text: `Startet in ${days}d ${hours}h`, color: '#f59e0b' };
      } else if (hours > 0) {
        return { text: `Startet in ${hours}h`, color: '#f59e0b' };
      } else {
        return { text: 'Startet bald', color: '#f59e0b' };
      }
    } else if (now < dayEnd) {
      return { text: 'Läuft gerade', color: '#10b981' };
    } else if (now >= dayEnd) {
      return { text: 'Beendet', color: '#64748b' };
    }
    
    return { text: '', color: '#64748b' };
  };

  const resetModal = () => {
    setModalStep('pairing-code');
    setPairingCode('');
    setDeviceName('');
    setSelectionMode(null);
    setSelectedEvent(null);
    setEvents([]);
    setPairedDeviceId('');
    setError('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const goBack = () => {
    if (modalStep === 'event-selection') {
      if (selectionMode === 'event' && selectedEvent) {
        setSelectedEvent(null);
      } else {
        setModalStep('selection-mode');
        setSelectionMode(null);
      }
    } else if (modalStep === 'selection-mode') {
      setModalStep('pairing-code');
      setSelectionMode(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
        backdropFilter: 'blur(4px)',
      }}
      onClick={handleClose}
    >
      <style>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) rotate(-0.3deg) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) rotate(-0.3deg) translateY(0);
          }
        }
      `}</style>

      <div
        style={{
          background: '#fff',
          borderRadius: '1.2rem 1.35rem 1.15rem 1.25rem',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3), 4px 8px 0 rgba(0,0,0,0.1)',
          border: '3px solid #181818',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
          transform: 'rotate(-0.3deg)',
          animation: 'modalSlideIn 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative tape */}
        <div
          style={{
            position: 'absolute',
            top: '-12px',
            left: '50%',
            width: '50px',
            height: '18px',
            background: 'repeating-linear-gradient(135deg, #fffbe7 0 6px, #8b5cf6 6px 12px)',
            borderRadius: '6px',
            border: '2px solid #8b5cf6',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transform: 'translateX(-50%) rotate(-2deg)',
            zIndex: 2,
          }}
        />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.5rem 1.5rem 1rem',
            borderBottom: '2px dashed #e5e7eb',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h2
              style={{
                fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#0f172a',
                margin: 0,
              }}
            >
              Display Kopplung
            </h2>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
            }}
          >
            <X size={24} color="#64748b" />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {error && (
            <div
              style={{
                backgroundColor: '#fee2e2',
                border: '2px solid #dc2626',
                color: '#991b1b',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                fontSize: '0.9rem',
              }}
            >
              {error}
            </div>
          )}

          {/* Step 1: Pairing Code */}
          {modalStep === 'pairing-code' && (
            <div>
              <p
                style={{
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  fontSize: '1rem',
                  color: '#64748b',
                  textAlign: 'center',
                  marginBottom: '1.5rem',
                }}
              >
                Geben Sie den Code vom Display ein:
              </p>

              <form
                onSubmit={handlePairingCodeSubmit}
              >
                <div style={{ marginBottom: '1rem' }}>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: '#0f172a',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Kopplungscode
                  </label>
                  <input
                    type="text"
                    value={pairingCode}
                    onChange={(e) => setPairingCode(e.target.value.toUpperCase())}
                    placeholder="z.B. 331539"
                    maxLength={10}
                    disabled={loadingPairing}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '2px solid #cbd5e1',
                      borderRadius: '10px',
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      fontFamily: 'monospace',
                      letterSpacing: '0.2em',
                      textAlign: 'center',
                      textTransform: 'uppercase',
                      fontVariantNumeric: 'tabular-nums',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      opacity: loadingPairing ? 0.6 : 1,
                      cursor: loadingPairing ? 'not-allowed' : 'text',
                    }}
                    onFocus={(e) => {
                      if (!loadingPairing) {
                        e.currentTarget.style.borderColor = '#0284c7';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(2, 132, 199, 0.1)';
                      }
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: '#0f172a',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Display Name (optional)
                  </label>
                  <input
                    type="text"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    placeholder="z.B. Eingangsbereich"
                    disabled={loadingPairing}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '2px solid #cbd5e1',
                      borderRadius: '10px',
                      fontSize: '0.95rem',
                      fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      opacity: loadingPairing ? 0.6 : 1,
                      cursor: loadingPairing ? 'not-allowed' : 'text',
                    }}
                    onFocus={(e) => {
                      if (!loadingPairing) {
                        e.currentTarget.style.borderColor = '#0284c7';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(2, 132, 199, 0.1)';
                      }
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!pairingCode.trim() || loadingPairing}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: (pairingCode.trim() && !loadingPairing) ? '#8b5cf6' : '#cbd5e1',
                    color: (pairingCode.trim() && !loadingPairing) ? 'white' : '#94a3b8',
                    border: '2px solid #181818',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '700',
                    fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                    boxShadow: '2px 4px 0 #181818',
                    cursor: (pairingCode.trim() && !loadingPairing) ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (pairingCode.trim() && !loadingPairing) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '3px 6px 0 #181818';
                      e.currentTarget.style.backgroundColor = '#7c3aed';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (pairingCode.trim() && !loadingPairing) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '2px 4px 0 #181818';
                      e.currentTarget.style.backgroundColor = '#8b5cf6';
                    }
                  }}
                >
                  {loadingPairing ? 'Wird gekoppelt...' : 'Fortfahren →'}
                </button>
              </form>
            </div>
          )}

          {/* Step 2: Selection Mode */}
          {modalStep === 'selection-mode' && (
            <div>
              <p
                style={{
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  fontSize: '1rem',
                  color: '#64748b',
                  textAlign: 'center',
                  marginBottom: '1.5rem',
                }}
              >
                Was soll auf dem Display angezeigt werden?
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <button
                  onClick={() => {
                    setSelectionMode('event');
                    setModalStep('event-selection');
                  }}
                  style={{
                    padding: '1.5rem 2rem',
                    backgroundColor: '#dbeafe',
                    border: '2px solid #0284c7',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#0f172a',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '2px 4px 0 #cbd5e1',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#bfdbfe';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '3px 6px 0 #cbd5e1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#dbeafe';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '2px 4px 0 #cbd5e1';
                  }}
                >
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '1.2rem' }}>📅 Ganzes Event</div>
                    <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.25rem' }}>
                      Mit allen Tagen der Veranstaltung
                    </div>
                  </div>
                  <ChevronRight size={24} color="#0284c7" />
                </button>

                <button
                  onClick={() => {
                    setSelectionMode('single');
                    setModalStep('event-selection');
                  }}
                  style={{
                    padding: '1.5rem 2rem',
                    backgroundColor: '#d1fae5',
                    border: '2px solid #10b981',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#0f172a',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '2px 4px 0 #cbd5e1',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#a7f3d0';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '3px 6px 0 #cbd5e1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#d1fae5';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '2px 4px 0 #cbd5e1';
                  }}
                >
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '1.2rem' }}>📋 Einzelner Plan</div>
                    <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.25rem' }}>
                      Nur einen Tagesplan anzeigen
                    </div>
                  </div>
                  <ChevronRight size={24} color="#10b981" />
                </button>
              </div>

              <button
                onClick={goBack}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#fff',
                  color: '#64748b',
                  border: '2px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  boxShadow: '2px 4px 0 #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '3px 6px 0 #e2e8f0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '2px 4px 0 #e2e8f0';
                }}
              >
                ← Zurück
              </button>
            </div>
          )}

          {/* Step 3: Event/Plan Selection */}
          {modalStep === 'event-selection' && (
            <div>
              <p
                style={{
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  fontSize: '1rem',
                  color: '#64748b',
                  textAlign: 'center',
                  marginBottom: '1.5rem',
                }}
              >
                {selectionMode === 'event' ? 'Event auswählen' : 'Tagesplan auswählen'}
              </p>

              {loadingEvents ? (
                <p style={{ textAlign: 'center', color: '#64748b' }}>⏳ Wird geladen...</p>
              ) : selectionMode === 'event' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {events.map((event) => {
                    const dayPlanDates = (event.dayPlans || []).map(dp => new Date(dp.date).getTime());
                    const minDate = dayPlanDates.length > 0 ? Math.min(...dayPlanDates) : null;
                    const firstDayPlanDate = minDate ? new Date(minDate).toISOString().split('T')[0] : null;
                    const status = firstDayPlanDate ? getEventStatus(firstDayPlanDate) : { text: '', color: '#64748b' };
                    
                    return (
                      <button
                        key={event.id}
                        onClick={() => {
                          if (event.dayPlans && event.dayPlans.length === 1) {
                            handleSelectDayPlan(event.dayPlans[0].id);
                          } else {
                            setSelectedEvent(event);
                          }
                        }}
                        style={{
                          padding: '1.25rem 1.5rem',
                          backgroundColor: '#f8fafc',
                          border: '2px solid #cbd5e1',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                          textAlign: 'left',
                          transition: 'all 0.2s ease',
                          boxShadow: '2px 4px 0 #e2e8f0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f1f5f9';
                          e.currentTarget.style.borderColor = '#94a3b8';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '3px 6px 0 #e2e8f0';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#f8fafc';
                          e.currentTarget.style.borderColor = '#cbd5e1';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '2px 4px 0 #e2e8f0';
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '1.1rem' }}>
                            {event.name}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                            {event.dayPlans?.length || 0} Tagesplan{event.dayPlans?.length !== 1 ? 'e' : ''}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.85rem', color: status.color, fontWeight: '600' }}>
                            {status.text}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {events.flatMap(event =>
                    (event.dayPlans || []).map(dayPlan => {
                      const dayPlanDate = new Date(dayPlan.date).toLocaleDateString('de-DE', {
                        weekday: 'short',
                        day: '2-digit',
                        month: '2-digit'
                      });
                      const status = getEventStatus(dayPlan.date);
                      
                      return (
                        <button
                          key={dayPlan.id}
                          onClick={() => handleSelectDayPlan(dayPlan.id)}
                          style={{
                            padding: '1.25rem 1.5rem',
                            backgroundColor: '#f8fafc',
                            border: '2px solid #cbd5e1',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                            textAlign: 'left',
                            transition: 'all 0.2s ease',
                            boxShadow: '2px 4px 0 #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f1f5f9';
                            e.currentTarget.style.borderColor = '#94a3b8';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '3px 6px 0 #e2e8f0';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#f8fafc';
                            e.currentTarget.style.borderColor = '#cbd5e1';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '2px 4px 0 #e2e8f0';
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '1.1rem' }}>
                              {dayPlan.name}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                              {event.name} • {dayPlanDate}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.85rem', color: status.color, fontWeight: '600' }}>
                              {status.text}
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              )}

              <button
                onClick={goBack}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#fff',
                  color: '#64748b',
                  border: '2px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  boxShadow: '2px 4px 0 #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '3px 6px 0 #e2e8f0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '2px 4px 0 #e2e8f0';
                }}
              >
                ← Zurück
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisplayPairingModal;
