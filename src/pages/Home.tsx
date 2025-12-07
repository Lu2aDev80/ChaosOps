import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Monitor, Calendar, BookOpen, Mail, X } from "lucide-react";
import FlipchartBackground from "../components/layout/FlipchartBackground";
import styles from "./Admin.module.css";
import chaosOpsLogo from "../assets/Chaos-Ops Logo.png";

import Gremlin from "../components/ui/Gremlin";
import HelpChat from "../components/ui/HelpChat";

// Widget-Komponente für Gremlin + Chat
const HelpChatGremlin: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <div
        style={{
          position: "fixed",
          bottom: "2rem",
          right: open ? "22rem" : "2rem",
          zIndex: 1000,
          cursor: "pointer",
          transition: "transform 0.2s, right 0.3s",
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        onClick={() => setOpen((v) => !v)}
        title="Hilfe öffnen"
      >
        <Gremlin type="sleep" size="large" />
      </div>
      {open && <HelpChat onClose={() => setOpen(false)} />}
    </>
  );
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailForm, setEmailForm] = useState({ to: "", name: "" });
  const [sending, setSending] = useState(false);
  const [emailResult, setEmailResult] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForm.to) return;

    setSending(true);
    setEmailResult(null);

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const res = await fetch(`${apiBaseUrl}/api/email/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ to: emailForm.to, name: emailForm.name }),
      });

      if (res.ok) {
        setEmailResult({
          success: true,
          message: "Test-E-Mail erfolgreich versendet! 🎉",
        });
        setTimeout(() => {
          setShowEmailModal(false);
          setEmailForm({ to: "", name: "" });
          setEmailResult(null);
        }, 2000);
      } else {
        const err = await res.json().catch(() => ({}));
        setEmailResult({
          success: false,
          message: err.error || "Fehler beim Versenden",
        });
      }
    } catch (err) {
      setEmailResult({ success: false, message: "Verbindungsfehler" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className={styles.adminWrapper}
      role="main"
      aria-label="Chaos Ops Startseite"
    >
      <FlipchartBackground />

      <main
        className={styles.adminContent}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2rem",
          padding: "2rem 1rem",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {/* Hero Section */}
        <div
          style={{
            background: "#fff",
            borderRadius: "1.2rem 1.35rem 1.15rem 1.25rem",
            boxShadow: "2px 4px 0 #e5e7eb, 0 2px 8px 0 rgba(0,0,0,0.08)",
            padding: "2.5rem 2rem",
            border: "2px solid #181818",
            textAlign: "center",
            width: "100%",
            maxWidth: "700px",
            position: "relative",
            transform: "rotate(-0.3deg)",
            zIndex: 1,
          }}
        >
          {/* Tape */}
          <div className={styles.tape} />

          <div
            style={{
              marginBottom: "1.5rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src={chaosOpsLogo}
              alt="Chaos Ops Logo"
              style={{
                maxWidth: "300px",
                maxHeight: "120px",
                width: "auto",
                height: "auto",
                filter: "drop-shadow(2px 4px 8px rgba(0,0,0,0.1))",
              }}
            />
          </div>

          <p
            style={{
              fontFamily: '"Inter", "Roboto", Arial, sans-serif',
              fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
              color: "#4a5568",
              lineHeight: "1.6",
              marginBottom: "2rem",
            }}
          >
            Dein digitaler Event begleiter
            <br />
            Plane, organisiere und zeige Tagespläne Live übersichtlich an.
          </p>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            maxWidth: "400px",
            margin: "0 auto",
          }}
        >
          <button
            onClick={() => navigate("/login")}
            style={{
              padding: "clamp(0.875rem, 2.5vw, 1rem) clamp(1.5rem, 4vw, 2rem)",
              border: "2px solid #181818",
              borderRadius: "8px",
              fontSize: "clamp(1rem, 2.5vw, 1.1rem)",
              fontWeight: "700",
              fontFamily: '"Inter", "Roboto", Arial, sans-serif',
              backgroundColor: "#fbbf24",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              transition: "all 0.2s ease",
              boxShadow: "2px 4px 0 #181818",
              textShadow: "0 1px 2px rgba(0,0,0,0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "3px 6px 0 #181818";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "2px 4px 0 #181818";
            }}
          >
            <LogIn size={20} />
            Zum Verwalten Anmelden
          </button>

          <button
            onClick={() => navigate("/register-display")}
            style={{
              padding: "clamp(0.875rem, 2.5vw, 1rem) clamp(1.5rem, 4vw, 2rem)",
              border: "2px solid #181818",
              borderRadius: "8px",
              fontSize: "clamp(1rem, 2.5vw, 1.1rem)",
              fontWeight: "700",
              fontFamily: '"Inter", "Roboto", Arial, sans-serif',
              backgroundColor: "#38bdf8",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              transition: "all 0.2s ease",
              boxShadow: "2px 4px 0 #181818",
              textShadow: "0 1px 2px rgba(0,0,0,0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "3px 6px 0 #181818";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "2px 4px 0 #181818";
            }}
          >
            <Monitor size={20} />
            Display Pairing Code
          </button>

          <button
            onClick={() => navigate("/documentation")}
            style={{
              padding: "clamp(0.875rem, 2.5vw, 1rem) clamp(1.5rem, 4vw, 2rem)",
              border: "2px solid #181818",
              borderRadius: "8px",
              fontSize: "clamp(1rem, 2.5vw, 1.1rem)",
              fontWeight: "700",
              fontFamily: '"Inter", "Roboto", Arial, sans-serif',
              backgroundColor: "#a78bfa",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              transition: "all 0.2s ease",
              boxShadow: "2px 4px 0 #181818",
              textShadow: "0 1px 2px rgba(0,0,0,0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "3px 6px 0 #181818";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "2px 4px 0 #181818";
            }}
          >
            <BookOpen size={20} />
            Dokumentation
          </button>

          <button
            onClick={() => setShowEmailModal(true)}
            style={{
              padding: "clamp(0.875rem, 2.5vw, 1rem) clamp(1.5rem, 4vw, 2rem)",
              border: "2px solid #181818",
              borderRadius: "8px",
              fontSize: "clamp(1rem, 2.5vw, 1.1rem)",
              fontWeight: "700",
              fontFamily: '"Inter", "Roboto", Arial, sans-serif',
              backgroundColor: "#ec4899",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              transition: "all 0.2s ease",
              boxShadow: "2px 4px 0 #181818",
              textShadow: "0 1px 2px rgba(0,0,0,0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "3px 6px 0 #181818";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "2px 4px 0 #181818";
            }}
          >
            <Mail size={20} />
            Test E-Mail senden
          </button>

          {/* Development Test Button */}
          <button
            onClick={() => navigate("/planner")}
            style={{
              padding: "clamp(0.875rem, 2.5vw, 1rem) clamp(1.5rem, 4vw, 2rem)",
              border: "2px dashed #181818",
              borderRadius: "8px",
              fontSize: "clamp(0.9rem, 2.25vw, 1rem)",
              fontWeight: "600",
              fontFamily: '"Inter", "Roboto", Arial, sans-serif',
              backgroundColor: "#10b981",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              transition: "all 0.2s ease",
              boxShadow: "2px 4px 0 #181818",
              textShadow: "0 1px 2px rgba(0,0,0,0.2)",
              opacity: "0.9",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "3px 6px 0 #181818";
              e.currentTarget.style.opacity = "1";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "2px 4px 0 #181818";
              e.currentTarget.style.opacity = "0.9";
            }}
            title="Entwicklungs-Test-Button für Planer"
          >
            <Calendar size={18} />
            🧪 Planer testen (Dev)
            <span
              style={{
                position: "absolute",
                top: "clamp(-8px, -2vw, -6px)",
                right: "clamp(-8px, -2vw, -6px)",
                backgroundColor: "#ef4444",
                color: "#fff",
                fontSize: "clamp(0.65rem, 1.5vw, 0.7rem)",
                padding: "2px 6px",
                borderRadius: "4px",
                border: "1px solid #181818",
                fontWeight: "bold",
              }}
            >
              DEV
            </span>
          </button>
        </div>
        </div>

        {/* Features Section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
            gap: "1.5rem",
            width: "100%",
            maxWidth: "900px",
          }}
        >
          {/* Feature 1 */}
          <div
            style={{
              background: "#fff",
              borderRadius: "1rem 1.2rem 1.1rem 1rem",
              boxShadow: "2px 4px 0 #e5e7eb, 0 2px 8px 0 rgba(0,0,0,0.08)",
              padding: "1.5rem",
              border: "2px solid #181818",
              position: "relative",
              transform: "rotate(0.5deg)",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#fef3c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1rem",
                border: "2px solid #181818",
              }}
            >
              <Calendar size={28} color="#f59e0b" strokeWidth={2.5} />
            </div>
            <h3
              style={{
                fontFamily:
                  '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                fontSize: "1.3rem",
                fontWeight: "700",
                color: "#181818",
                marginBottom: "0.5rem",
              }}
            >
              Event-Planung
            </h3>
            <p
              style={{
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                fontSize: "0.95rem",
                color: "#4a5568",
                lineHeight: "1.5",
              }}
            >
              Erstelle und verwalte Events mit detaillierten Tagesplänen.
            </p>
          </div>

          {/* Feature 2 */}
          <div
            style={{
              background: "#fff",
              borderRadius: "1.1rem 1rem 1.2rem 1.1rem",
              boxShadow: "2px 4px 0 #e5e7eb, 0 2px 8px 0 rgba(0,0,0,0.08)",
              padding: "1.5rem",
              border: "2px solid #181818",
              position: "relative",
              transform: "rotate(-0.5deg)",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#dbeafe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1rem",
                border: "2px solid #181818",
              }}
            >
              <Monitor size={28} color="#0284c7" strokeWidth={2.5} />
            </div>
            <h3
              style={{
                fontFamily:
                  '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                fontSize: "1.3rem",
                fontWeight: "700",
                color: "#181818",
                marginBottom: "0.5rem",
              }}
            >
              Display-Modus
            </h3>
            <p
              style={{
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                fontSize: "0.95rem",
                color: "#4a5568",
                lineHeight: "1.5",
              }}
            >
              Registriere Geräte als Display und zeige Tagespläne in Echtzeit
              an.
            </p>
          </div>
        </div>

        {/* Schlafender Gremlin für Hilfe-Chat */}
        <HelpChatGremlin />

        {/* Email Modal */}
        {showEmailModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2000,
              padding: "1rem",
            }}
            onClick={() => setShowEmailModal(false)}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: "1.2rem 1.35rem 1.15rem 1.25rem",
                boxShadow: "2px 4px 0 #e5e7eb, 0 2px 8px 0 rgba(0,0,0,0.08)",
                padding: "2rem",
                border: "2px solid #181818",
                position: "relative",
                maxWidth: "500px",
                width: "100%",
                transform: "rotate(-0.2deg)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowEmailModal(false)}
                style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.5rem",
                  color: "#64748b",
                }}
              >
                <X size={24} />
              </button>

              <h2
                style={{
                  fontFamily:
                    '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                  fontSize: "1.8rem",
                  fontWeight: "700",
                  color: "#0f172a",
                  marginBottom: "1.5rem",
                  textAlign: "center",
                }}
              >
                Test E-Mail senden 📧
              </h2>

              <form
                onSubmit={handleSendTestEmail}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                      fontSize: "1rem",
                      fontWeight: "600",
                      color: "#0f172a",
                      marginBottom: "0.5rem",
                    }}
                  >
                    E-Mail-Adresse *
                  </label>
                  <input
                    type="email"
                    required
                    value={emailForm.to}
                    onChange={(e) =>
                      setEmailForm({ ...emailForm, to: e.target.value })
                    }
                    placeholder="deine@email.de"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #374151",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                      fontSize: "1rem",
                      fontWeight: "600",
                      color: "#0f172a",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Dein Name (optional)
                  </label>
                  <input
                    type="text"
                    value={emailForm.name}
                    onChange={(e) =>
                      setEmailForm({ ...emailForm, name: e.target.value })
                    }
                    placeholder="z.B. Max"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #374151",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {emailResult && (
                  <div
                    style={{
                      padding: "0.75rem",
                      borderRadius: "8px",
                      backgroundColor: emailResult.success
                        ? "#d1fae5"
                        : "#fee2e2",
                      color: emailResult.success ? "#065f46" : "#991b1b",
                      fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >
                    {emailResult.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  style={{
                    padding: "1rem 2rem",
                    border: "2px solid #181818",
                    borderRadius: "8px",
                    fontSize: "1.1rem",
                    fontWeight: "700",
                    fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                    backgroundColor: sending ? "#9ca3af" : "#ec4899",
                    color: "#fff",
                    cursor: sending ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.75rem",
                    transition: "all 0.2s ease",
                    boxShadow: "2px 4px 0 #181818",
                    textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                    width: "100%",
                  }}
                  onMouseEnter={(e) => {
                    if (!sending) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "3px 6px 0 #181818";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!sending) {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "2px 4px 0 #181818";
                    }
                  }}
                >
                  <Mail size={20} />
                  {sending ? "Wird gesendet..." : "E-Mail senden"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
