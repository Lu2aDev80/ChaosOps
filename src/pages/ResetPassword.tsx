import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import FlipchartBackground from "../components/layout/FlipchartBackground";
import styles from "./Admin.module.css";
import chaosOpsLogo from "../assets/Chaos-Ops Logo.png";
import { api } from "../lib/api";

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const t = query.get("token");
    setToken(t);
  }, [query]);

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

  const submit = async () => {
    if (!token) {
      setError("Fehlender Token.");
      return;
    }
    if (password.length < 6) {
      setError("Passwort muss mindestens 6 Zeichen lang sein.");
      return;
    }
    if (password !== confirm) {
      setError("Passwörter stimmen nicht überein.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.resetPassword(token, password);
      if (res.success) {
        setSuccess("Passwort erfolgreich geändert. Du kannst dich jetzt anmelden.");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError(res.message || "Fehler beim Zurücksetzen.");
      }
    } catch (e: any) {
      setError(e.message || "Fehler beim Zurücksetzen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.adminWrapper} role="main" aria-label="Passwort ändern">
      <FlipchartBackground />
      <main className={styles.adminContent} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem", padding: "2rem 1rem", maxWidth: "800px", margin: "0 auto" }}>
        <div style={cardStyle}>
          <div className={styles.tape} />
          <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <img src={chaosOpsLogo} alt="Chaos Ops Logo" style={{ maxWidth: "250px", maxHeight: "100px", width: "auto", height: "auto", filter: "drop-shadow(2px 4px 8px rgba(0,0,0,0.1))" }} />
          </div>
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif', fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem", textShadow: "2px 2px 0 #fff, 0 3px 6px rgba(251, 191, 36, 0.8)" }}>Neues Passwort festlegen</h1>
          </div>
        </div>

        <div style={{ ...cardStyle, transform: "rotate(-0.2deg)", maxWidth: "500px" }}>
          <form onSubmit={(e) => { e.preventDefault(); submit(); }} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "block", fontFamily: '"Inter", "Roboto", Arial, sans-serif', fontSize: "1rem", fontWeight: 600, color: "#0f172a", marginBottom: "0.5rem" }}>Neues Passwort</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: "0.75rem", border: "2px solid #374151", borderRadius: "8px", fontSize: "1rem", fontFamily: '"Inter", "Roboto", Arial, sans-serif', boxSizing: "border-box" }} placeholder="Neues Passwort" />
            </div>
            <div>
              <label style={{ display: "block", fontFamily: '"Inter", "Roboto", Arial, sans-serif', fontSize: "1rem", fontWeight: 600, color: "#0f172a", marginBottom: "0.5rem" }}>Passwort bestätigen</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} style={{ width: "100%", padding: "0.75rem", border: "2px solid #374151", borderRadius: "8px", fontSize: "1rem", fontFamily: '"Inter", "Roboto", Arial, sans-serif', boxSizing: "border-box" }} placeholder="Passwort bestätigen" />
            </div>
            {error && <div style={{ color: "#dc2626", fontWeight: 600 }}>{error}</div>}
            {success && <div style={{ color: "#10b981", fontWeight: 600 }}>{success}</div>}
            <button type="submit" style={{ ...buttonStyle, backgroundColor: "#2563eb", color: "#fff", marginTop: "0.5rem", opacity: loading ? 0.85 : 1, cursor: loading ? "wait" : "pointer" }} disabled={loading}>
              {loading ? "Wird gespeichert…" : "Passwort ändern"}
            </button>
          </form>
          <button
            onClick={() => navigate("/login")}
            style={{
              padding: "0.6rem 1rem",
              border: "2px dashed #374151",
              borderRadius: "8px",
              fontSize: "0.95rem",
              fontWeight: 700,
              fontFamily: '"Inter", "Roboto", Arial, sans-serif',
              backgroundColor: "transparent",
              color: "#2563eb",
              cursor: "pointer",
              transition: "all 0.2s ease",
              marginTop: "1rem",
              width: "100%",
              textAlign: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#0f172a";
              e.currentTarget.style.backgroundColor = "#f1f5f9";
              e.currentTarget.style.borderColor = "#0f172a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#2563eb";
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = "#374151";
            }}
          >
            ← Zurück zum Login
          </button>
        </div>
      </main>
    </div>
  );
};

export default ResetPassword;
