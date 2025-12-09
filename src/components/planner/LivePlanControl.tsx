import React from "react";
import { Clock, Edit2, Pen, Send } from "lucide-react";
import styles from "../../pages/Admin.module.css";
import ActionButton from "../ui/ActionButton";

interface LivePlanControlProps {
  isConnected: boolean;
  onDelay: () => void;
  onSendUpdate: () => void;
  delayActive: boolean;
  displayName?: string;
  planName?: string;
  eventName?: string;
}

const cardStyle = {
  background: "#fff",
  borderRadius: "1.2rem 1.35rem 1.15rem 1.25rem",
  boxShadow: "2px 4px 0 #e5e7eb, 0 2px 8px 0 rgba(0,0,0,0.08)",
  padding: "2rem",
  border: "2px solid #181818",
  position: "relative" as const,
  transform: "rotate(-0.2deg)",
};

const LivePlanControl: React.FC<LivePlanControlProps> = ({
  isConnected,
  onDelay,
  onSendUpdate,
  delayActive,
  displayName,
  planName,
  eventName,
}) => {
  if (!isConnected) return null;
  return (
    <div style={cardStyle}>
      <div className={styles.tape} />
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", justifyContent: "space-between" }}>          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Clock size={28} color="#f59e0b" />
          <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "#78350f" }}>
            Live-Plan Steuerung
          </span>
        </div>
          <ActionButton
            onClick={() => navigate("/documentation")}
            icon={<Pen size={20} />}
            color="#fa3f48ff"
          >
            Live Plan Bearbeiten
          </ActionButton>
        </div>
        {displayName && (
          <div style={{ fontSize: "1rem", color: "#78350f", fontWeight: 600 }}>
            Display: {displayName}
          </div>
        )}
        {planName && (
          <div style={{ fontSize: "1rem", color: "#78350f", fontWeight: 600 }}>
            Plan: {planName}
          </div>
        )}
        {eventName && (
          <div style={{ fontSize: "1rem", color: "#78350f", fontWeight: 600 }}>
            Veranstaltung: {eventName}
          </div>
        )}
      </div>
    </div>
  );
};

export default LivePlanControl;
