import React from "react";
import { Clock } from "lucide-react";

export type QuickDelayStatus = {
  type: "success" | "error" | "info";
  message: string;
};

type QuickDelayMenuProps = {
  nextItemTitle?: string;
  nextItemTime?: string;
  minutesUntil?: number | null;
  onDelay: (minutes: number) => void;
  disabled?: boolean;
  isApplying?: boolean;
  presetOptions?: number[];
  layout?: "inline" | "floating";
  helperText?: string;
  status?: QuickDelayStatus | null;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
};

const cardBase: React.CSSProperties = {
  background: "#f8fafc",
  borderRadius: "1rem",
  border: "1.5px solid #e2e8f0",
  boxShadow: "inset 0 1px 0 #fff, 0 8px 20px rgba(15,23,42,0.04)",
  padding: "1rem 1.1rem",
  display: "flex",
  gap: "1rem",
  alignItems: "center",
};

const QuickDelayMenu: React.FC<QuickDelayMenuProps> = ({
  nextItemTitle,
  nextItemTime,
  minutesUntil,
  onDelay,
  disabled = false,
  isApplying = false,
  presetOptions = [5, 10, 15],
  layout = "inline",
  helperText,
  status,
  collapsed = false,
  onToggleCollapse,
}) => {
  const [customMinutes, setCustomMinutes] = React.useState(5);
  const isDisabled = disabled || isApplying;

  const clampedCustom = Math.min(90, Math.max(1, customMinutes || 0));

  const handleCustomApply = () => {
    const value = Number.isFinite(clampedCustom) ? clampedCustom : 5;
    onDelay(value);
  };

  const showNextInfo = nextItemTitle && nextItemTime;

  const containerStyle: React.CSSProperties =
    layout === "floating"
      ? {
          position: "fixed",
          right: "1.25rem",
          bottom: "1.25rem",
          left: "1.25rem",
          maxWidth: "620px",
          margin: "0 auto",
          zIndex: 1200,
          pointerEvents: "none",
        }
      : { width: "100%" };

  const bodyStyle: React.CSSProperties =
    layout === "floating"
      ? {
          ...cardBase,
          pointerEvents: "auto",
          flexWrap: "wrap",
        }
      : {
          ...cardBase,
          justifyContent: "space-between",
          flexWrap: "wrap",
        };

  return (
    <div style={containerStyle} aria-live="polite">
      <div style={bodyStyle}>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", flex: 1 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: "12px",
              background: "#fff7ed",
              border: "1.75px solid #fdba74",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "2px 4px 0 #fdba7455",
              flexShrink: 0,
            }}
            aria-hidden
          >
            <Clock size={22} color="#b45309" />
          </div>

          <div style={{ display: "grid", gap: "0.4rem", flex: 1, minWidth: 220 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "1rem" }}>Quick Delay</div>
              {minutesUntil !== null && minutesUntil !== undefined && (
                <span
                  style={{
                    padding: "0.2rem 0.6rem",
                    borderRadius: "999px",
                    border: "1.5px solid #cbd5e1",
                    background: "#fff",
                    color: "#0f172a",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    boxShadow: "1px 2px 0 #cbd5e1",
                    lineHeight: 1.2,
                  }}
                >
                  {minutesUntil === 0 ? "Jetzt" : `in ${minutesUntil} min`}
                </span>
              )}
              {onToggleCollapse && (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  style={{
                    marginLeft: "auto",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: "#475569",
                    fontWeight: 700,
                  }}
                  aria-label={collapsed ? "Quick Delay anzeigen" : "Quick Delay ausblenden"}
                >
                  {collapsed ? "Zeigen" : "Schliessen"}
                </button>
              )}
            </div>

            {!collapsed && (
              <>
                <div style={{ color: "#475569", fontSize: "0.92rem", fontWeight: 700 }}>
                  {showNextInfo
                    ? `Nächste Aktion: ${nextItemTime} • ${nextItemTitle}`
                    : "Wähle einen Tagesplan, um die nächste Aktion zu verschieben."}
                </div>

                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {presetOptions.map((minutes) => (
                    <button
                      key={minutes}
                      type="button"
                      onClick={() => onDelay(minutes)}
                      disabled={isDisabled || !showNextInfo}
                      style={{
                        padding: "0.65rem 0.95rem",
                        borderRadius: "10px",
                        border: "2px solid #0f172a",
                        background: "#fffaf0",
                        color: "#0f172a",
                        fontWeight: 800,
                        letterSpacing: "0.01em",
                        cursor: isDisabled || !showNextInfo ? "not-allowed" : "pointer",
                        opacity: isDisabled || !showNextInfo ? 0.6 : 1,
                        boxShadow: "2px 4px 0 #e2e8f0",
                        transition: "transform 0.1s ease, box-shadow 0.1s ease",
                      }}
                      title={showNextInfo ? `+${minutes} Minuten zur nächsten Aktion` : "Kein Tagesplan ausgewählt"}
                      onMouseEnter={(e) => {
                        if (!isDisabled && showNextInfo) {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "3px 6px 0 #e2e8f0";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "2px 4px 0 #e2e8f0";
                      }}
                    >
                      +{minutes} min
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      padding: "0.55rem 0.65rem",
                      border: "1.75px solid #cbd5e1",
                      borderRadius: "10px",
                      background: "#f8fafc",
                      boxShadow: "2px 4px 0 #e2e8f0",
                    }}
                  >
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(parseInt(e.target.value, 10))}
                      disabled={isDisabled || !showNextInfo}
                      style={{
                        width: "72px",
                        padding: "0.35rem 0.45rem",
                        borderRadius: "8px",
                        border: "1.5px solid #cbd5e1",
                        fontWeight: 700,
                        color: "#0f172a",
                        background: "#fff",
                      }}
                      aria-label="Eigene Minuten hinzufügen"
                    />
                    <span style={{ color: "#475569", fontWeight: 700 }}>Minuten</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCustomApply}
                    disabled={isDisabled || !showNextInfo}
                    style={{
                      padding: "0.65rem 1rem",
                      borderRadius: "10px",
                      border: "2px solid #181818",
                      background: "linear-gradient(120deg, #fbbf24, #f59e0b)",
                      color: "#0f172a",
                      fontWeight: 800,
                      cursor: isDisabled || !showNextInfo ? "not-allowed" : "pointer",
                      opacity: isDisabled || !showNextInfo ? 0.7 : 1,
                      boxShadow: "2px 4px 0 #18181826",
                    }}
                    title={showNextInfo ? `+${clampedCustom} Minuten anwenden` : "Kein Tagesplan ausgewählt"}
                  >
                    {isApplying ? "Speichere..." : `+${clampedCustom} min`}
                  </button>
                </div>

                {helperText && (
                  <div style={{ color: "#475569", fontSize: "0.85rem", fontWeight: 600 }}>
                    {helperText}
                  </div>
                )}

                {status && (
                  <div
                    style={{
                      marginTop: "0.25rem",
                      padding: "0.65rem 0.75rem",
                      borderRadius: "10px",
                      border: "1.5px solid #cbd5e1",
                      background:
                        status.type === "success"
                          ? "#ecfdf3"
                          : status.type === "error"
                          ? "#fef2f2"
                          : "#eef2ff",
                      color: status.type === "error" ? "#b91c1c" : "#0f172a",
                      fontWeight: 700,
                      boxShadow: "1px 2px 0 #cbd5e1",
                    }}
                  >
                    {status.message}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickDelayMenu;
