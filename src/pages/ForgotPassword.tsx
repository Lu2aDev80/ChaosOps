import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Building2, Users } from "lucide-react";
import FlipchartBackground from "../components/layout/FlipchartBackground";
import { AlertModal } from "../components/ui";
import styles from "./Admin.module.css";
import chaosOpsLogo from "../assets/Chaos-Ops Logo.png";
import { api } from "../lib/api";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [stage, setStage] = useState<"request" | "organisation">("request");
  const [orgs, setOrgs] = useState<Array<{ id: string; name: string; description?: string; logoUrl?: string | null }>>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const cardStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: "1.2rem 1.35rem 1.15rem 1.25rem",
    boxShadow: "2px 4px 0 #e5e7eb, 0 2px 8px 0 rgba(0,0,0,0.08)",
    padding: "2rem",
    border: "2px solid #181818",
    position: "relative",
    width: "100%",
    maxWidth: "600px",
    margin: "0 auto",
    transform: "rotate(-0.2deg)",
    zIndex: 1,
  };

  const buttonStyle: React.CSSProperties = {
    padding: "clamp(0.875rem, 2.5vw, 1rem) clamp(1.5rem, 4vw, 2rem)",
    border: "2px solid #181818",
    borderRadius: "8px",
    fontSize: "clamp(1rem, 2.5vw, 1.1rem)",
    fontWeight: 700,
    fontFamily: '"Inter", "Roboto", Arial, sans-serif',
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.75rem",
    transition: "all 0.2s ease",
    boxShadow: "2px 4px 0 #181818",
    textShadow: "0 1px 2px rgba(0,0,0,0.2)",
    width: "100%",
  };

  const orgButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: "#f8fafc",
    color: "#1f2937",
    border: "2px solid #374151",
    padding: "clamp(1rem, 3vw, 1.25rem)",
    fontSize: "clamp(0.9rem, 2.25vw, 1rem)",
    fontWeight: 600,
    justifyContent: "flex-start",
    textAlign: "left",
    boxShadow: "2px 4px 0 #374151",
  };

  const selectedOrgStyle: React.CSSProperties = {
    ...orgButtonStyle,
    backgroundColor: "#1f2937",
    color: "#fff",
    border: "2px solid #1f2937",
    fontWeight: 700,
    boxShadow: "2px 4px 0 #1f2937",
  };

  const requestReset = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.requestPasswordReset({ usernameOrEmail });
      if ("requiresOrganisationSelection" in res && res.requiresOrganisationSelection) {
        setOrgs(res.organisations || []);
        setStage("organisation");
        return;
      }
      setModalMessage("Wenn ein Konto existiert, wurde eine E-Mail zum Zurücksetzen des Passworts gesendet.");
      setModalOpen(true);
    } catch (e: any) {
      setError(e.message || "Fehler bei der Anfrage");
    } finally {
      setLoading(false);
    }
  };

  const requestForOrganisation = async () => {
    if (!selectedOrgId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.requestPasswordReset({ usernameOrEmail, organisationId: selectedOrgId });
      if ("message" in res) {
        setModalMessage("Wenn ein Konto existiert, wurde eine E-Mail zum Zurücksetzen des Passworts gesendet.");
        setModalOpen(true);
        setStage("request");
      }
    } catch (e: any) {
      setError(e.message || "Fehler bei der Anfrage");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.adminWrapper} role="main" aria-label="Passwort zurücksetzen">
      <FlipchartBackground />
      <main className={styles.adminContent} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem", padding: "2rem 1rem", maxWidth: "800px", margin: "0 auto" }}>
        <div style={cardStyle}>
          <div className={styles.tape} />
          <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <img src={chaosOpsLogo} alt="Chaos Ops Logo" style={{ maxWidth: "250px", maxHeight: "100px", width: "auto", height: "auto", filter: "drop-shadow(2px 4px 8px rgba(0,0,0,0.1))" }} />
          </div>
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif', fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem", textShadow: "2px 2px 0 #fff, 0 3px 6px rgba(251, 191, 36, 0.8)" }}>Passwort zurücksetzen</h1>
          </div>
        </div>

        {stage === "request" ? (
          <div style={{ ...cardStyle, transform: "rotate(-0.2deg)", maxWidth: "500px" }}>
            <form onSubmit={(e) => { e.preventDefault(); requestReset(); }} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <label style={{ display: "block", fontFamily: '"Inter", "Roboto", Arial, sans-serif', fontSize: "1rem", fontWeight: 600, color: "#0f172a", marginBottom: "0.5rem" }}>Benutzername oder E-Mail</label>
                <input type="text" value={usernameOrEmail} onChange={(e) => setUsernameOrEmail(e.target.value)} style={{ width: "100%", padding: "0.75rem", border: "2px solid #374151", borderRadius: "8px", fontSize: "1rem", fontFamily: '"Inter", "Roboto", Arial, sans-serif', boxSizing: "border-box" }} placeholder="Dein Benutzername oder E-Mail" />
              </div>
              {error && <div style={{ color: "#dc2626", fontWeight: 600 }}>{error}</div>}
              <button type="submit" style={{ ...buttonStyle, backgroundColor: "#2563eb", color: "#fff", marginTop: "0.5rem", opacity: loading ? 0.85 : 1, cursor: loading ? "wait" : "pointer" }} disabled={loading}>
                <LogIn size={20} />
                {loading ? "Wird gesendet…" : "Reset anfordern"}
              </button>
            </form>
            <button onClick={() => navigate("/login")} style={{ padding: "0.5rem 1rem", border: "none", background: "none", color: "#6b7280", cursor: "pointer", fontSize: "0.9rem", marginTop: "1rem", textAlign: "center", width: "100%" }}>← Zurück zum Login</button>
          </div>
        ) : (
          <div style={{ ...cardStyle, transform: "rotate(0.3deg)", maxWidth: "700px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem", color: "#0f172a" }}>
              <Building2 size={24} strokeWidth={2.5} />
              <h2 style={{ fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif', fontSize: "1.4rem", fontWeight: 700, margin: 0 }}>Organisation auswählen</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
              {orgs.map((org) => (
                <button key={org.id} style={selectedOrgId === org.id ? selectedOrgStyle : orgButtonStyle} onClick={() => setSelectedOrgId(org.id)}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
                    {org.logoUrl ? (
                      <img src={org.logoUrl.startsWith("http") ? org.logoUrl : `${org.logoUrl}`} alt={`${org.name} Logo`} style={{ width: "24px", height: "24px", objectFit: "contain", borderRadius: "4px", flexShrink: 0 }} />
                    ) : null}
                    <Users size={20} strokeWidth={2} className="fallback-icon" style={{ display: org.logoUrl ? "none" : "block" }} />
                    <div style={{ textAlign: "left", flex: 1 }}>
                      <div style={{ fontWeight: 700, marginBottom: "0.25rem", fontSize: "clamp(0.9rem, 2.25vw, 1rem)" }}>{org.name}</div>
                      <div style={{ fontSize: "clamp(0.8rem, 2vw, 0.9rem)", fontWeight: 500, color: selectedOrgId === org.id ? "#e5e7eb" : "#64748b" }}>{org.description || ""}</div>
                    </div>
                  </div>
                  {selectedOrgId === org.id && (
                    <div style={{ width: "28px", height: "28px", backgroundColor: "#10b981", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff", boxShadow: "0 2px 4px rgba(0,0,0,0.2)", fontSize: "16px", fontWeight: "bold", color: "#fff" }}>✓</div>
                  )}
                </button>
              ))}
            </div>
            <button style={{ ...buttonStyle, backgroundColor: selectedOrgId ? "#2563eb" : "#9ca3af", color: "#fff", cursor: selectedOrgId && !loading ? "pointer" : "not-allowed", opacity: selectedOrgId ? 1 : 0.6 }} disabled={!selectedOrgId || loading} onClick={requestForOrganisation}>
              <LogIn size={20} />
              {loading ? "Wird gesendet…" : "Reset für Organisation anfordern"}
            </button>
            <button onClick={() => { setStage("request"); setSelectedOrgId(null); }} style={{ padding: "0.5rem 1rem", border: "none", background: "none", color: "#6b7280", cursor: "pointer", fontSize: "0.9rem", marginTop: "1rem", textAlign: "center", width: "100%" }}>← Schritt zurück</button>
          </div>
        )}

        <AlertModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="E-Mail gesendet" message={modalMessage} type="info" />
      </main>
    </div>
  );
};

export default ForgotPassword;
