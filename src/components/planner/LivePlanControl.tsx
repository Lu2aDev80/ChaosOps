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
  return (
    <div style={{ ...cardStyle, padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Clock size={20} color="#f59e0b" />
          <div style={{ fontWeight: 700, color: '#374151' }}>Quick Delay</div>
        </div>
        {nextItemTitle && nextItemTime && (
          <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 500 }}>
            Nächste Aktion: {nextItemTime} - {nextItemTitle}
          </div>
        )}
        {!nextItemTitle && selectedDayPlanId && (
          <div style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 500 }}>
            Keine kommende Aktion gefunden
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {[5, 10, 20].map((m) => (
          <button
            key={m}
            onClick={() => onDelay(m)}
            disabled={!selectedDayPlanId}
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: '8px',
              border: '2px solid #181818',
              background: '#fef3c7',
              color: '#374151',
              fontWeight: 700,
              cursor: selectedDayPlanId ? 'pointer' : 'not-allowed',
              opacity: selectedDayPlanId ? 1 : 0.5,
            }}
            title={selectedDayPlanId ? `+${m} Minuten zur nächsten Aktion` : 'Kein Tagesplan ausgewählt'}
          >
            +{m} Min
          </button>
        ))}
      </div>
    </div>
  );
};

export default LivePlanControl;
