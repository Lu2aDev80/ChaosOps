import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { DayPlan } from '../types/schedule';

interface PairingData {
  code: string;
  deviceId: string;
}

interface PairedData {
  orgId: string;
  displayId: string;
  deviceName?: string;
}

const DevicePairingDisplay = () => {
  const [pairingCode, setPairingCode] = useState<string>('');
  const [deviceId, setDeviceId] = useState<string>('');
  const [isPaired, setIsPaired] = useState<boolean>(false);
  const [assignedDayPlan, setAssignedDayPlan] = useState<DayPlan | null>(null);
  const [error, setError] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const socketRef = useRef<Socket | null>(null);

  // Load saved state from localStorage on mount
  useEffect(() => {
    const savedDayPlan = localStorage.getItem('assignedDayPlan');
    const savedPaired = localStorage.getItem('displayPaired');
    
    if (savedDayPlan) {
      try {
        setAssignedDayPlan(JSON.parse(savedDayPlan));
      } catch (err) {
        console.error('Error parsing saved day plan:', err);
      }
    }
    
    if (savedPaired === 'true') {
      setIsPaired(true);
    }
  }, []);

  // Update current time every second for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calculate event status
  const getEventStatus = () => {
    if (!assignedDayPlan) return { status: 'waiting', message: '' };

    const now = currentTime;
    const dayStart = new Date(assignedDayPlan.date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(assignedDayPlan.date);
    dayEnd.setHours(23, 59, 59, 999);

    if (now < dayStart) {
      // Event hasn't started - show countdown
      const diff = dayStart.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return {
        status: 'countdown',
        days,
        hours,
        minutes,
        seconds,
        message: 'Startet in'
      };
    } else if (now >= dayStart && now <= dayEnd) {
      // Event is running
      return {
        status: 'running',
        message: 'Läuft gerade'
      };
    } else {
      // Event has ended
      return {
        status: 'ended',
        message: 'Event beendet'
      };
    }
  };

  const eventStatus = getEventStatus();



  useEffect(() => {
    // Connect to Socket.IO server
    // In dev: uses relative path /minihackathon/socket.io/ (proxied by Vite to localhost:3000)
    // In prod: uses relative path /minihackathon/socket.io/ (served by production server)
    const socketOptions = {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      path: '/minihackathon/socket.io/'
    };
    
    if (import.meta.env.DEV) {
      console.log('Connecting to Socket.IO with options:', socketOptions);
    }
    
    const socket = io(socketOptions);

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to socket server with ID:', socket.id);
      // Request pairing code on connection
      socket.emit('request-pairing-code');
    });

    // Listen for pairing code
    socket.on('pairing-code', (data: PairingData) => {
      console.log('Received pairing code:', data);
      setPairingCode(data.code);
      setDeviceId(data.deviceId);
      setError('');
    });

    // Listen for successful pairing
    socket.on('paired', (data: PairedData) => {
      console.log('Device paired successfully:', data);
      setIsPaired(true);
      
      // Store pairing info in localStorage
      localStorage.setItem('displayPaired', 'true');
      localStorage.setItem('displayOrgId', data.orgId);
      localStorage.setItem('displayId', data.displayId);
    });

    // Listen for day plan assignment from admin
    socket.on('dayplan-assigned', (dayPlan: DayPlan) => {
      console.log('Day plan assigned:', dayPlan);
      setAssignedDayPlan(dayPlan);
      // Save to localStorage for persistence
      localStorage.setItem('assignedDayPlan', JSON.stringify(dayPlan));
    });

    // Listen for errors
    socket.on('error', (data: { message: string }) => {
      console.error('Socket error:', data);
      setError(data.message || 'Ein Fehler ist aufgetreten');
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Verbindung zum Server fehlgeschlagen');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'repeating-linear-gradient(0deg, #fffef0 0px, #fffef0 39px, #e5e7eb 40px, #fffef0 41px)',
      padding: '3rem 2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      {/* Flipchart Holes */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12vw',
        width: '32px',
        height: '32px',
        background: '#e5e7eb',
        borderRadius: '50%',
        boxShadow: '0 2px 8px #bbb inset',
        zIndex: 10
      }} />
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '32px',
        height: '32px',
        background: '#e5e7eb',
        borderRadius: '50%',
        boxShadow: '0 2px 8px #bbb inset',
        zIndex: 10
      }} />
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12vw',
        width: '32px',
        height: '32px',
        background: '#e5e7eb',
        borderRadius: '50%',
        boxShadow: '0 2px 8px #bbb inset',
        zIndex: 10
      }} />

      {/* Show pairing code screen */}
      {!isPaired && !assignedDayPlan && (
      <div style={{
        background: '#fff',
        borderRadius: '1.2rem 1.35rem 1.15rem 1.25rem',
        boxShadow: '2px 4px 0 #e5e7eb, 0 2px 8px 0 rgba(0,0,0,0.08)',
        padding: '3rem 2.5rem',
        border: '2px solid #181818',
        maxWidth: '700px',
        width: '100%',
        position: 'relative',
        transform: 'rotate(-0.3deg)',
        zIndex: 1,
        textAlign: 'center'
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

        <h1 style={{
          fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: '800',
          color: '#181818',
          marginBottom: '1.5rem',
          letterSpacing: '0.01em',
          textShadow: '1px 2px 0 #fff, 0 2px 8px #38bdf8'
        }}>
          Display Kopplung
        </h1>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '2px solid #dc2626',
            borderRadius: '8px',
            padding: '1rem 1.5rem',
            marginBottom: '2rem',
            color: '#991b1b',
            fontFamily: '"Inter", "Roboto", Arial, sans-serif',
            fontSize: '0.95rem'
          }}>
            {error}
          </div>
        )}

        {pairingCode ? (
          <>
            <p style={{
              fontFamily: '"Inter", "Roboto", Arial, sans-serif',
              fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
              color: '#4a5568',
              marginBottom: '2.5rem',
              lineHeight: '1.6'
            }}>
              Gib diesen Code in den Admin-Einstellungen ein:
            </p>

            <div style={{
              backgroundColor: '#f3f4f6',
              border: '3px solid #181818',
              borderRadius: '12px',
              padding: '2rem 3rem',
              marginBottom: '2rem',
              boxShadow: '3px 6px 0 #181818'
            }}>
              <div style={{
                fontFamily: 'monospace',
                fontSize: 'clamp(4rem, 10vw, 7rem)',
                fontWeight: '800',
                color: '#0284c7',
                letterSpacing: '0.3em',
                textAlign: 'center',
                fontVariantNumeric: 'tabular-nums'
              }}>
                {pairingCode}
              </div>
            </div>

            <div style={{
              backgroundColor: '#fef3c7',
              border: '2px solid #fbbf24',
              borderRadius: '8px',
              padding: '1.25rem',
              fontFamily: '"Inter", "Roboto", Arial, sans-serif',
              fontSize: '0.95rem',
              color: '#4a5568'
            }}>
              <p style={{ margin: 0, marginBottom: '0.5rem' }}>Device ID: <span style={{ fontFamily: 'monospace', fontVariantNumeric: 'tabular-nums' }}>{deviceId}</span></p>
              <p style={{ margin: 0, fontWeight: '600' }}>⏳ Warte auf Kopplung...</p>
            </div>
          </>
        ) : (
          <div>
            <p style={{
              fontFamily: '"Inter", "Roboto", Arial, sans-serif',
              fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
              color: '#4a5568',
              marginBottom: '2rem'
            }}>
              Verbindung wird hergestellt...
            </p>
            <p style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', margin: 0 }}>⏳</p>
          </div>
        )}
      </div>
      )}

      {/* Show waiting screen after pairing */}
      {isPaired && !assignedDayPlan && (
      <div style={{
        background: '#fff',
        borderRadius: '1.2rem 1.35rem 1.15rem 1.25rem',
        boxShadow: '2px 4px 0 #e5e7eb, 0 2px 8px 0 rgba(0,0,0,0.08)',
        padding: '3rem 2.5rem',
        border: '2px solid #181818',
        maxWidth: '700px',
        width: '100%',
        position: 'relative',
        transform: 'rotate(-0.3deg)',
        zIndex: 1,
        textAlign: 'center'
      }}>
        {/* Tape */}
        <div style={{
          position: 'absolute',
          top: '-12px',
          left: '50%',
          width: '45px',
          height: '16px',
          background: 'repeating-linear-gradient(135deg, #fffbe7 0 6px, #10b981 6px 12px)',
          borderRadius: '6px',
          border: '1.5px solid #059669',
          boxShadow: '0 1px 4px rgba(5, 150, 105, 0.3)',
          transform: 'translateX(-50%) rotate(-4deg)',
          zIndex: 2
        }} />

        <h1 style={{
          fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: '800',
          color: '#181818',
          marginBottom: '1.5rem',
          letterSpacing: '0.01em',
          textShadow: '1px 2px 0 #fff, 0 2px 8px #10b981'
        }}>
          ✓ Gekoppelt!
        </h1>

        <div style={{
          backgroundColor: '#d1fae5',
          border: '2px solid #10b981',
          borderRadius: '12px',
          padding: '2rem 2.5rem',
          marginBottom: '2rem'
        }}>
          <p style={{
            fontFamily: '"Inter", "Roboto", Arial, sans-serif',
            fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)',
            color: '#065f46',
            marginBottom: '1rem',
            fontWeight: '600'
          }}>
            Display erfolgreich verbunden
          </p>
          <p style={{
            fontFamily: '"Inter", "Roboto", Arial, sans-serif',
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: '#047857',
            margin: 0
          }}>
            Warte auf Planzuweisung vom Admin...
          </p>
        </div>

        <p style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', margin: 0 }}>⏳</p>
      </div>
      )}

      {/* Show assigned day plan */}
      {assignedDayPlan && (
        <>
          {/* Countdown View - Event hasn't started */}
          {eventStatus.status === 'countdown' && (
            <div style={{
              background: '#fff',
              borderRadius: '1.2rem 1.35rem 1.15rem 1.25rem',
              boxShadow: '2px 4px 0 #e5e7eb, 0 2px 8px 0 rgba(0,0,0,0.08)',
              padding: '3rem 2.5rem',
              border: '2px solid #181818',
              maxWidth: '900px',
              width: '100%',
              position: 'relative',
              transform: 'rotate(-0.3deg)',
              zIndex: 1,
              textAlign: 'center'
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
                boxShadow: '0 1px 4px rgba(234, 179, 8, 0.3)',
                transform: 'translateX(-50%) rotate(-4deg)',
                zIndex: 2
              }} />

              <h1 style={{
                fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                fontWeight: '800',
                color: '#181818',
                marginBottom: '1rem',
                textShadow: '1px 2px 0 #fff, 0 2px 8px #fbbf24'
              }}>
                {assignedDayPlan.name}
              </h1>

              <p style={{
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                color: '#64748b',
                marginBottom: '3rem'
              }}>
                {new Date(assignedDayPlan.date).toLocaleDateString('de-DE', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>

              <div style={{
                backgroundColor: '#fef3c7',
                border: '3px solid #fbbf24',
                borderRadius: '16px',
                padding: '3rem 2rem',
                marginBottom: '2rem'
              }}>
                <p style={{
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)',
                  color: '#92400e',
                  marginBottom: '2rem',
                  fontWeight: '600'
                }}>
                  {eventStatus.message}
                </p>

                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '2rem',
                  flexWrap: 'wrap'
                }}>
                  {eventStatus.days! > 0 && (
                    <div style={{
                      backgroundColor: '#fff',
                      border: '2px solid #181818',
                      borderRadius: '12px',
                      padding: '1.5rem 2rem',
                      minWidth: '120px',
                      boxShadow: '3px 3px 0 #181818'
                    }}>
                      <div style={{
                        fontFamily: 'monospace',
                        fontSize: 'clamp(3rem, 6vw, 4rem)',
                        fontWeight: '800',
                        color: '#f59e0b',
                        marginBottom: '0.5rem'
                      }}>
                        {eventStatus.days}
                      </div>
                      <div style={{
                        fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                        fontSize: '1rem',
                        color: '#64748b',
                        fontWeight: '600'
                      }}>
                        Tage
                      </div>
                    </div>
                  )}

                  <div style={{
                    backgroundColor: '#fff',
                    border: '2px solid #181818',
                    borderRadius: '12px',
                    padding: '1.5rem 2rem',
                    minWidth: '120px',
                    boxShadow: '3px 3px 0 #181818'
                  }}>
                    <div style={{
                      fontFamily: 'monospace',
                      fontSize: 'clamp(3rem, 6vw, 4rem)',
                      fontWeight: '800',
                      color: '#f59e0b',
                      marginBottom: '0.5rem'
                    }}>
                      {String(eventStatus.hours).padStart(2, '0')}
                    </div>
                    <div style={{
                      fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                      fontSize: '1rem',
                      color: '#64748b',
                      fontWeight: '600'
                    }}>
                      Stunden
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: '#fff',
                    border: '2px solid #181818',
                    borderRadius: '12px',
                    padding: '1.5rem 2rem',
                    minWidth: '120px',
                    boxShadow: '3px 3px 0 #181818'
                  }}>
                    <div style={{
                      fontFamily: 'monospace',
                      fontSize: 'clamp(3rem, 6vw, 4rem)',
                      fontWeight: '800',
                      color: '#f59e0b',
                      marginBottom: '0.5rem'
                    }}>
                      {String(eventStatus.minutes).padStart(2, '0')}
                    </div>
                    <div style={{
                      fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                      fontSize: '1rem',
                      color: '#64748b',
                      fontWeight: '600'
                    }}>
                      Minuten
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: '#fff',
                    border: '2px solid #181818',
                    borderRadius: '12px',
                    padding: '1.5rem 2rem',
                    minWidth: '120px',
                    boxShadow: '3px 3px 0 #181818'
                  }}>
                    <div style={{
                      fontFamily: 'monospace',
                      fontSize: 'clamp(3rem, 6vw, 4rem)',
                      fontWeight: '800',
                      color: '#f59e0b',
                      marginBottom: '0.5rem'
                    }}>
                      {String(eventStatus.seconds).padStart(2, '0')}
                    </div>
                    <div style={{
                      fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                      fontSize: '1rem',
                      color: '#64748b',
                      fontWeight: '600'
                    }}>
                      Sekunden
                    </div>
                  </div>
                </div>
              </div>

              <p style={{
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                color: '#64748b'
              }}>
                🎉 Freut euch auf das Event!
              </p>
            </div>
          )}

          {/* Ended View - Event has ended */}
          {eventStatus.status === 'ended' && (
            <div style={{
              background: '#fff',
              borderRadius: '1.2rem 1.35rem 1.15rem 1.25rem',
              boxShadow: '2px 4px 0 #e5e7eb, 0 2px 8px 0 rgba(0,0,0,0.08)',
              padding: '3rem 2.5rem',
              border: '2px solid #181818',
              maxWidth: '900px',
              width: '100%',
              position: 'relative',
              transform: 'rotate(-0.3deg)',
              zIndex: 1,
              textAlign: 'center'
            }}>
              {/* Tape */}
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                width: '45px',
                height: '16px',
                background: 'repeating-linear-gradient(135deg, #fffbe7 0 6px, #64748b 6px 12px)',
                borderRadius: '6px',
                border: '1.5px solid #475569',
                boxShadow: '0 1px 4px rgba(71, 85, 105, 0.3)',
                transform: 'translateX(-50%) rotate(-4deg)',
                zIndex: 2
              }} />

              <h1 style={{
                fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                fontWeight: '800',
                color: '#181818',
                marginBottom: '1rem',
                textShadow: '1px 2px 0 #fff'
              }}>
                {assignedDayPlan.name}
              </h1>

              <p style={{
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                color: '#64748b',
                marginBottom: '3rem'
              }}>
                {new Date(assignedDayPlan.date).toLocaleDateString('de-DE', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>

              <div style={{
                backgroundColor: '#f1f5f9',
                border: '3px solid #cbd5e1',
                borderRadius: '16px',
                padding: '3rem 2rem',
                marginBottom: '2rem'
              }}>
                <p style={{
                  fontSize: 'clamp(4rem, 8vw, 6rem)',
                  margin: '0 0 1rem 0'
                }}>
                  ✓
                </p>
                <p style={{
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                  color: '#475569',
                  margin: 0,
                  fontWeight: '600'
                }}>
                  Event beendet
                </p>
              </div>

              <p style={{
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                color: '#64748b'
              }}>
                Vielen Dank für eure Teilnahme! 🎉
              </p>
            </div>
          )}

          {/* Running View - Event is currently running */}
          {eventStatus.status === 'running' && (
      <div style={{
        background: '#fff',
        borderRadius: '1.2rem 1.35rem 1.15rem 1.25rem',
        boxShadow: '2px 4px 0 #e5e7eb, 0 2px 8px 0 rgba(0,0,0,0.08)',
        padding: '3rem 2.5rem',
        border: '2px solid #181818',
        maxWidth: '900px',
        width: '100%',
        position: 'relative',
        transform: 'rotate(-0.3deg)',
        zIndex: 1
      }}>
        {/* Tape */}
        <div style={{
          position: 'absolute',
          top: '-12px',
          left: '50%',
          width: '45px',
          height: '16px',
          background: 'repeating-linear-gradient(135deg, #fffbe7 0 6px, #10b981 6px 12px)',
          borderRadius: '6px',
          border: '1.5px solid #059669',
          boxShadow: '0 1px 4px rgba(5, 150, 105, 0.3)',
          transform: 'translateX(-50%) rotate(-4deg)',
          zIndex: 2
        }} />

        <h1 style={{
          fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
          fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
          fontWeight: '800',
          color: '#181818',
          marginBottom: '0.5rem',
          textAlign: 'center'
        }}>
          {assignedDayPlan.name}
        </h1>

        {/* Running Status Badge */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '1rem'
        }}>
          <div style={{
            backgroundColor: '#d1fae5',
            border: '2px solid #10b981',
            borderRadius: '20px',
            padding: '0.5rem 1.5rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{
              width: '10px',
              height: '10px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }} />
            <span style={{
              fontFamily: '"Inter", "Roboto", Arial, sans-serif',
              fontSize: '0.9rem',
              fontWeight: '700',
              color: '#065f46'
            }}>
              LIVE
            </span>
          </div>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>

        <p style={{
          fontFamily: '"Inter", "Roboto", Arial, sans-serif',
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          color: '#64748b',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          {new Date(assignedDayPlan.date).toLocaleDateString('de-DE', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          })}
        </p>

        {/* Schedule Items */}
        {assignedDayPlan.scheduleItems && assignedDayPlan.scheduleItems.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {assignedDayPlan.scheduleItems.map((item: any, index: number) => (
              <div
                key={item.id || index}
                style={{
                  backgroundColor: '#f8fafc',
                  border: '2px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem'
                }}
              >
                <div style={{
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  fontFamily: 'monospace',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  minWidth: '120px',
                  textAlign: 'center',
                  border: '2px solid #181818',
                  boxShadow: '2px 2px 0 #181818'
                }}>
                  {item.startTime}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    color: '#0f172a',
                    marginBottom: '0.25rem'
                  }}>
                    {item.title}
                  </div>
                  {item.description && (
                    <div style={{
                      fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                      fontSize: '0.95rem',
                      color: '#64748b'
                    }}>
                      {item.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{
            fontFamily: '"Inter", "Roboto", Arial, sans-serif',
            fontSize: '1.1rem',
            color: '#94a3b8',
            textAlign: 'center',
            padding: '2rem'
          }}>
            Keine Programmpunkte vorhanden
          </p>
        )}
      </div>
          )}
        </>
      )}
    </div>
  );
};

export default DevicePairingDisplay;
