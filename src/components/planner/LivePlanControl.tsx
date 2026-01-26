import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface LivePlanControlProps {
  organisationId: string;
  selectedDayPlanId?: string | null;
  onDelay: (minutes: number) => void;
  nextItemTitle?: string;
  nextItemTime?: string;
}

const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: "1.2rem 1.35rem 1.15rem 1.25rem",
  boxShadow: "2px 4px 0 #e5e7eb, 0 2px 8px 0 rgba(0,0,0,0.08)",
  padding: "2rem",
  border: "2px solid #181818",
  position: "relative",
  transform: "rotate(-0.2deg)",
};

const LivePlanControl: React.FC<LivePlanControlProps> = ({
  organisationId: _organisationId, // unused
  selectedDayPlanId,
  onDelay,
  nextItemTitle,
  nextItemTime,
}) => {
  // Keep live quick actions enabled by default
  // const isDeactivated = false;

  // Compact mode for a smaller footprint UI (Kompakt)
  const [compactMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('liveControlCompact') === 'true';
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('liveControlCompact', compactMode ? 'true' : 'false');
    } catch (e) {
      // ignore storage errors
    }
  }, [compactMode]);

  const displays: any[] = []; // Static empty array since we only use delay functionality now
  // const [loading, setLoading] = useState(false);
  // const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  // const [sendingUpdate, setSendingUpdate] = useState(false);
  // const [disconnecting, setDisconnecting] = useState<string | null>(null);
  // const [resetting, setResetting] = useState<string | null>(null);

  // Fetch active displays (commented out since we only use delay functionality now)
  // useEffect(() => {
  //   const fetchDisplays = async () => {
  //     if (!organisationId) return;
  //     setLoading(true);
  //     try {
  //       const allDisplays = await api.getDisplays(organisationId);
  //       console.log("All displays fetched:", allDisplays); // Debug log
  //
  //       // Log each display's properties for debugging
  //       allDisplays.forEach((d, idx) => {
  //         console.log(`Display ${idx}:`, {
  //           name: d.name,
  //           id: d.id,
  //           organisationId: d.organisationId,
  //           status: d.status,
  //           statusType: typeof d.status,
  //           isActive: d.isActive
  //         });
  //
  //       // Filter for paired displays (matching DisplayManager logic)
  //       // A display is considered connected if it has an organisationId and status is PAIRED or ACTIVE
  //       const activeDisplays = allDisplays.filter(
  //         (d) => {
  //           const hasOrg = !!d.organisationId;
  //           // Accept both PAIRED and ACTIVE status (ACTIVE might be used in some flows)
  //           // Also handle case-insensitive comparison in case of string issues
  //           const statusStr = String(d.status).toUpperCase();
  //           const isPaired = statusStr === "PAIRED" || statusStr === "ACTIVE";
  //           const passes = hasOrg && isPaired;
  //           console.log(`Display ${d.name}: orgId=${hasOrg}, status="${d.status}" (${statusStr}), isPaired=${isPaired}, passes=${passes}`); // Debug log
  //           return passes;
  //         }
  //       );
  //
  //       console.log("Filtered active displays:", activeDisplays); // Debug log
  //       console.log("Display count:", activeDisplays.length); // Debug log
  //       console.log("Setting displays state with count:", activeDisplays.length); // Debug log
  //       setDisplays(activeDisplays);
  //     } catch (error) {
  //       console.error("Failed to fetch displays:", error);
  //       setDisplays([]);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchDisplays();
  //   // Refresh every 30 seconds
  //   const interval = setInterval(fetchDisplays, 30000);
  //   return () => clearInterval(interval);
  // }, [organisationId]);

  // const handleSendUpdate = async () => {
  //   if (!selectedDayPlanId) {
  //     alert("Bitte wählen Sie zuerst einen Tagesplan aus.");
  //     return;
  //   }

  //   setSendingUpdate(true);
  //   try {
  //     // Update all active displays with the current day plan
  //     const updatePromises = displays.map((display) =>
  //       api.updateDisplay(display.id, {
  //         currentDayPlanId: selectedDayPlanId,
  //       })
  //     );

  //     await Promise.all(updatePromises);
  //     setLastUpdate(new Date());
  //     alert(`Update wurde an ${displays.length} Display(s) gesendet!`);
  //   } catch (error) {
  //     console.error("Failed to send update:", error);
  //     alert("Fehler beim Senden des Updates. Bitte versuchen Sie es erneut.");
  //   } finally {
  //     setSendingUpdate(false);
  //   }
  // };

  // const handleDisconnectDisplay = async (displayId: string) => {
  //   if (
  //     !window.confirm(
  //       "Sind Sie sicher, dass Sie dieses Display trennen möchten? Das Display wird deaktiviert."
  //     )
  //   ) {
  //     return;
  //   }

  //   setDisconnecting(displayId);
  //   try {
  //     await api.updateDisplay(displayId, { isActive: false });
  //     setDisplays((prev) => prev.filter((d) => d.id !== displayId));
  //     alert("Display wurde erfolgreich getrennt.");
  //   } catch (error) {
  //     console.error("Failed to disconnect display:", error);
  //     alert("Fehler beim Trennen des Displays.");
  //   } finally {
  //     setDisconnecting(null);
  //   }
  // };

  // const handleResetDisplay = async (displayId: string) => {
  //   if (
  //     !window.confirm(
  //       "Sind Sie sicher, dass Sie dieses Display zurücksetzen möchten? Alle Daten werden gelöscht und das Display muss neu gekoppelt werden."
  //     )
  //   ) {
  //     return;
  //   }

  //   setResetting(displayId);
  //   try {
  //     await api.resetDisplay(displayId);
  //     // Remove display from list after reset (it will need re-pairing)
  //     setDisplays((prev) => prev.filter((d) => d.id !== displayId));
  //     alert("Display wurde erfolgreich zurückgesetzt.");
  //   } catch (error) {
  //     console.error("Failed to reset display:", error);
  //     alert("Fehler beim Zurücksetzen des Displays.");
  //   } finally {
  //     setResetting(null);
  //   }
  // };

  // const handleDisconnectAll = async () => {
  //   if (
  //     !window.confirm(
  //       `Sind Sie sicher, dass Sie alle ${displays.length} Display(s) trennen möchten?`
  //     )
  //   ) {
  //     return;
  //   }

  //   setDisconnecting("all");
  //   try {
  //     const promises = displays.map((display) =>
  //       api.updateDisplay(display.id, { isActive: false })
  //     );
  //     await Promise.all(promises);
  //     setDisplays([]);
  //     alert("Alle Displays wurden erfolgreich getrennt.");
  //   } catch (error) {
  //     console.error("Failed to disconnect displays:", error);
  //     alert("Fehler beim Trennen der Displays.");
  //   } finally {
  //     setDisconnecting(null);
  //   }
  // };

  // const formatLastUpdate = () => {
  //   if (!lastUpdate) return "Noch nicht gesendet";
  //   const now = new Date();
  //   const diff = now.getTime() - lastUpdate.getTime();
  //   const minutes = Math.floor(diff / 60000);
  //   if (minutes < 1) return "Gerade eben";
  //   if (minutes === 1) return "Vor 1 Minute";
  //   return `Vor ${minutes} Minuten`;
  // };

  const displayCount = displays.length;
  const isConnected = displayCount > 0;
  
  // Debug logging for render
  console.log("Render - displays.length:", displays.length, "displayCount:", displayCount, "isConnected:", isConnected);

  // Render a compact quick-action bar that attaches a delay to the next upcoming item.
  const hasNextItem = nextItemTitle && nextItemTime;
  const canApplyDelay = selectedDayPlanId && hasNextItem;

  return (
    <div style={{ 
      ...cardStyle, 
      padding: '1rem 1.25rem', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      gap: '1rem',
      background: canApplyDelay ? '#fffbeb' : '#f8fafc',
      border: canApplyDelay ? '2px solid #f59e0b' : '2px solid #e2e8f0',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flex: 1, minWidth: 0 }}>
        <div style={{
          width: 42,
          height: 42,
          borderRadius: '10px',
          background: canApplyDelay ? '#fef3c7' : '#f1f5f9',
          border: canApplyDelay ? '2px solid #fbbf24' : '2px solid #cbd5e1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Clock size={22} color={canApplyDelay ? '#d97706' : '#94a3b8'} />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
            Verzögerung hinzufügen
          </div>
          
          {hasNextItem ? (
            <div style={{ 
              fontSize: '0.85rem', 
              color: '#475569', 
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              <span style={{ color: '#059669', fontWeight: 600 }}>▶</span> {nextItemTime} – {nextItemTitle}
            </div>
          ) : selectedDayPlanId ? (
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>
              Alle Aktionen abgeschlossen
            </div>
          ) : (
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>
              Wähle zuerst einen Tagesplan aus
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
        {[5, 10, 20].map((m) => (
          <button
            key={m}
            onClick={() => onDelay(m)}
            disabled={!canApplyDelay}
            style={{
              padding: '0.55rem 0.85rem',
              borderRadius: '8px',
              border: canApplyDelay ? '2px solid #b45309' : '2px solid #cbd5e1',
              background: canApplyDelay ? 'linear-gradient(to bottom, #fcd34d, #fbbf24)' : '#f1f5f9',
              color: canApplyDelay ? '#78350f' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: canApplyDelay ? 'pointer' : 'not-allowed',
              boxShadow: canApplyDelay ? '0 2px 4px rgba(180, 83, 9, 0.2)' : 'none',
              transition: 'all 0.15s ease',
            }}
            title={canApplyDelay 
              ? `Verschiebe nächste Aktion um ${m} Minuten nach hinten` 
              : hasNextItem 
                ? 'Kein Tagesplan ausgewählt' 
                : 'Keine kommende Aktion vorhanden'}
            onMouseEnter={(e) => {
              if (canApplyDelay) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(180, 83, 9, 0.25)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = canApplyDelay ? '0 2px 4px rgba(180, 83, 9, 0.2)' : 'none';
            }}
          >
            +{m} Min
          </button>
        ))}
      </div>
    </div>
  );
};

export default LivePlanControl;
