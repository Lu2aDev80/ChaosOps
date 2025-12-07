import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Building2, Users } from "lucide-react";
import FlipchartBackground from "../components/layout/FlipchartBackground";
import { ConfirmModal, AlertModal, Modal } from "../components/ui";
import styles from "./Admin.module.css";
import chaosOpsLogo from "../assets/Chaos-Ops Logo.png";
import loginGremlin from "../assets/gremlins/login.png";
import sleepGremlin from "../assets/gremlins/sleep.png";
import { api } from "../lib/api";

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [orgs, setOrgs] = useState<
    Array<{ id: string; name: string; description?: string; logoUrl?: string }>
  >([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<{
    api: boolean;
    db: boolean;
    loading: boolean;
    lastCheck: string | null;
  }>({ api: false, db: false, loading: true, lastCheck: null });
  
  // Modal states
  // Es kann immer nur ein Modal offen sein, type steuert das eindeutig
  const [modalState, setModalState] = useState<{
    type: 'none' | 'confirm-resend' | 'alert' | 'resend-email';
    title: string;
    message: string;
    alertType?: 'info' | 'success' | 'warning' | 'error';
    userEmail?: string;
  }>({
    type: 'none',
    title: '',
    message: '',
    alertType: undefined,
    userEmail: undefined,
  });

  // Hilfsfunktion: Modal robust öffnen
  const openModal = (modal: typeof modalState) => {
    setModalState({
      type: modal.type,
      title: modal.title,
      message: modal.message,
      alertType: modal.alertType,
      userEmail: modal.userEmail,
    });
  };

  // Hilfsfunktion: Modal garantiert schließen
  const closeModal = () => {
    setModalState({ type: 'none', title: '', message: '', alertType: undefined, userEmail: undefined });
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingOrgs(true);
        setDbStatus(prev => ({ ...prev, loading: true }));
        
        // Check API health
        await api.health();
        
        // Load organisations (tests DB connection)
        const data = await api.organisations();
        setOrgs(data);
        
        setDbStatus({
          api: true,
          db: true,
          loading: false,
          lastCheck: new Date().toLocaleTimeString('de-DE')
        });
      } catch (e: any) {
        setError(e.message ?? "Fehler beim Laden der Organisationen");
        setDbStatus({
          api: false,
          db: false,
          loading: false,
          lastCheck: new Date().toLocaleTimeString('de-DE')
        });
      } finally {
        setLoadingOrgs(false);
      }
    };
    load();
    
    // Check every 30 seconds
    const interval = setInterval(async () => {
      try {
        await api.health();
        setDbStatus(prev => ({
          ...prev,
          api: true,
          lastCheck: new Date().toLocaleTimeString('de-DE')
        }));
      } catch {
        setDbStatus(prev => ({
          ...prev,
          api: false,
          lastCheck: new Date().toLocaleTimeString('de-DE')
        }));
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleOrganisationSelect = (orgId: string) => {
    setSelectedOrgId(orgId);
  };

  const handleProceedToLogin = () => {
    if (selectedOrgId) {
      setShowLoginForm(true);
    }
  };

  const handleLogin = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedOrgId) return;
    try {
      await api.login({
        organisationId: selectedOrgId,
        usernameOrEmail: credentials.username,
        password: credentials.password,
      });
      navigate(`/admin/dashboard?org=${selectedOrgId}`, { replace: true });
    } catch (err: any) {
      const errorMessage = err.message || "Login fehlgeschlagen";
      const errorData = err.data || {};

      // Check if it's an email verification error
      if (errorMessage.includes("Email not verified")) {
        // Use email from error response, or fallback to entered username if it's an email
        const emailToUse = errorData.email || 
                          (credentials.username.includes("@") ? credentials.username : null);
        
        openModal({
          type: 'confirm-resend',
          title: 'E-Mail nicht bestätigt',
          message: 'Deine E-Mail-Adresse ist noch nicht bestätigt. Möchtest du eine neue Bestätigungs-E-Mail erhalten?',
          alertType: 'warning',
          userEmail: emailToUse || undefined,
        });
      } else {
        openModal({
          type: 'alert',
          title: 'Login fehlgeschlagen',
          message: errorMessage,
          alertType: 'error',
        });
      }
    }
  };

  const handleResendVerification = async (email?: string) => {
    if (!selectedOrgId) return;
    
    // If no email provided, show input modal
    if (!email) {
      openModal({
        type: 'resend-email',
        title: 'E-Mail-Adresse eingeben',
        message: 'Bitte gib deine E-Mail-Adresse ein, um eine neue Bestätigungs-E-Mail zu erhalten.',
        alertType: 'info',
      });
      return;
    }

    try {
      await api.resendVerification(email, selectedOrgId);
      setModalState({
        type: 'alert',
        title: 'E-Mail gesendet',
        message: 'Eine neue Bestätigungs-E-Mail wurde gesendet! Bitte überprüfe dein Postfach (auch den Spam-Ordner).',
        alertType: 'success',
      });
    } catch (resendError: any) {
      setModalState({
        type: 'alert',
        title: 'Fehler',
        message: 'Fehler beim Senden der Bestätigungs-E-Mail: ' + (resendError.message || 'Unbekannter Fehler'),
        alertType: 'error',
      });
    }
  };


  const cardStyle = {
    background: "#fff",
    borderRadius: "1.2rem 1.35rem 1.15rem 1.25rem",
    boxShadow: "2px 4px 0 #e5e7eb, 0 2px 8px 0 rgba(0,0,0,0.08)",
    padding: "2rem",
    border: "2px solid #181818",
    position: "relative" as const,
    width: "100%",
    maxWidth: "600px",
    margin: "0 auto",
    transform: "rotate(-0.2deg)",
    zIndex: 1,
  };

  const buttonStyle = {
    padding: "clamp(0.875rem, 2.5vw, 1rem) clamp(1.5rem, 4vw, 2rem)",
    border: "2px solid #181818",
    borderRadius: "8px",
    fontSize: "clamp(1rem, 2.5vw, 1.1rem)",
    fontWeight: "700",
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

  const orgButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#f8fafc",
    color: "#1f2937",
    border: "2px solid #374151",
    padding: "clamp(1rem, 3vw, 1.25rem)",
    fontSize: "clamp(0.9rem, 2.25vw, 1rem)",
    fontWeight: "600",
    justifyContent: "flex-start",
    textAlign: "left" as const,
    boxShadow: "2px 4px 0 #374151",
  };

  const selectedOrgStyle = {
    ...orgButtonStyle,
    backgroundColor: "#1f2937",
    color: "#fff",
    border: "2px solid #1f2937",
    fontWeight: "700",
    boxShadow: "2px 4px 0 #1f2937",
  };

  return (
    <div className={styles.adminWrapper} role="main" aria-label="Admin Login">
      <FlipchartBackground />

      <main
        className={styles.adminContent}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2rem",
          padding: "2rem 1rem",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div style={cardStyle}>
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
                maxWidth: "250px",
                maxHeight: "100px",
                width: "auto",
                height: "auto",
                filter: "drop-shadow(2px 4px 8px rgba(0,0,0,0.1))",
              }}
            />
          </div>

          <div style={{ textAlign: "center" }}>
            <h1
              style={{
                fontFamily:
                  '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
                fontWeight: "700",
                color: "#0f172a",
                marginBottom: "0.5rem",
                textShadow: "2px 2px 0 #fff, 0 3px 6px rgba(251, 191, 36, 0.8)",
              }}
            >
              Admin Bereich
            </h1>

            {!showLoginForm && (
              <>
                <img
                  src={loginGremlin}
                  alt="Login Gremlin"
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "contain",
                    margin: "1rem 0",
                  }}
                />
                <p
                  style={{
                    fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                    fontSize: "1.1rem",
                    color: "#334155",
                    lineHeight: "1.6",
                    margin: 0,
                    fontWeight: "500",
                  }}
                >
                  Wähle deine Organisation aus, um fortzufahren
                </p>
              </>
            )}

            {showLoginForm && selectedOrgId && (
              <p
                style={{
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  fontSize: "1.1rem",
                  color: "#334155",
                  lineHeight: "1.6",
                  margin: "1rem 0 0 0",
                  fontWeight: "500",
                }}
              >
                Melde dich bei{" "}
                {orgs.find((org) => org.id === selectedOrgId)?.name} an
              </p>
            )}
          </div>
        </div>

        {!showLoginForm ? (
          /* Organisation Selection */
          <div
            style={{
              ...cardStyle,
              transform: "rotate(0.3deg)",
              maxWidth: "700px",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-12px",
                left: "30%",
                width: "45px",
                height: "16px",
                background:
                  "repeating-linear-gradient(135deg, #fffbe7 0 6px, #38bdf8 6px 12px)",
                borderRadius: "6px",
                border: "1.5px solid #0284c7",
                boxShadow: "0 1px 4px rgba(2,132,199,0.3)",
                transform: "translateX(-50%) rotate(-2deg)",
                zIndex: 2,
              }}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "1.5rem",
                color: "#0f172a",
              }}
            >
              <Building2 size={24} strokeWidth={2.5} />
              <h2
                style={{
                  fontFamily:
                    '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                  fontSize: "1.4rem",
                  fontWeight: "700",
                  margin: 0,
                }}
              >
                Organisation auswählen
              </h2>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                marginBottom: "1.5rem",
              }}
            >
              {loadingOrgs && (
                <div style={{ padding: "1rem", color: "#64748b" }}>
                  Lade Organisationen…
                </div>
              )}
              {error && (
                <div style={{ padding: "1rem", color: "#dc2626" }}>{error}</div>
              )}
              {orgs.map((org) => (
                <button
                  key={org.id}
                  style={
                    selectedOrgId === org.id ? selectedOrgStyle : orgButtonStyle
                  }
                  onClick={() => handleOrganisationSelect(org.id)}
                  onMouseEnter={(e) => {
                    if (selectedOrgId !== org.id) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "3px 6px 0 #374151";
                      e.currentTarget.style.backgroundColor = "#e2e8f0";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedOrgId !== org.id) {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "2px 4px 0 #374151";
                      e.currentTarget.style.backgroundColor = "#f8fafc";
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                    {org.logoUrl ? (
                      <img
                        src={org.logoUrl.startsWith('http') ? org.logoUrl : `/minihackathon${org.logoUrl}`}
                        alt={`${org.name} Logo`}
                        style={{
                          width: '24px',
                          height: '24px',
                          objectFit: 'contain',
                          borderRadius: '4px',
                          flexShrink: 0
                        }}
                        onError={(e) => {
                          // Fallback to Users icon if image fails
                          e.currentTarget.style.display = 'none';
                          const userIcon = e.currentTarget.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                          if (userIcon) userIcon.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <Users 
                      size={20} 
                      strokeWidth={2} 
                      className="fallback-icon"
                      style={{ display: org.logoUrl ? 'none' : 'block' }}
                    />
                    <div style={{ textAlign: "left", flex: 1 }}>
                      <div style={{ fontWeight: "700", marginBottom: "0.25rem", fontSize: "clamp(0.9rem, 2.25vw, 1rem)" }}>
                        {org.name}
                      </div>
                      <div
                        style={{
                          fontSize: "clamp(0.8rem, 2vw, 0.9rem)",
                          fontWeight: "500",
                          color: selectedOrgId === org.id ? "#e5e7eb" : "#64748b",
                        }}
                      >
                        {org.description || ""}
                      </div>
                    </div>
                  </div>
                  {selectedOrgId === org.id && (
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        backgroundColor: "#10b981",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid #fff",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        fontSize: "16px",
                        fontWeight: "bold",
                        color: "#fff",
                      }}
                    >
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button
              style={{
                ...buttonStyle,
                backgroundColor: selectedOrgId ? "#10b981" : "#9ca3af",
                color: "#fff",
                cursor: selectedOrgId ? "pointer" : "not-allowed",
                opacity: selectedOrgId ? 1 : 0.6,
              }}
              disabled={!selectedOrgId}
              onClick={handleProceedToLogin}
              onMouseEnter={(e) => {
                if (selectedOrgId) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "3px 6px 0 #181818";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedOrgId) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "2px 4px 0 #181818";
                }
              }}
            >
              <LogIn size={20} />
              Weiter zum Login
            </button>

            <div style={{ marginTop: "1rem", textAlign: "center" }}>
              <button
                onClick={() => navigate("/signup")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#2563eb",
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Neue Organisation erstellen
              </button>
            </div>
          </div>
        ) : (
          /* Login Form */
          <div
            style={{
              ...cardStyle,
              transform: "rotate(-0.2deg)",
              maxWidth: "500px",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-12px",
                left: "70%",
                width: "45px",
                height: "16px",
                background:
                  "repeating-linear-gradient(135deg, #fffbe7 0 6px, #10b981 6px 12px)",
                borderRadius: "6px",
                border: "1.5px solid #059669",
                boxShadow: "0 1px 4px rgba(5,150,105,0.3)",
                transform: "translateX(-50%) rotate(3deg)",
                zIndex: 2,
              }}
            />

            <form
              onSubmit={handleLogin}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
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
                  Benutzername
                </label>
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials({ ...credentials, username: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #374151",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                    boxSizing: "border-box",
                  }}
                  placeholder="Dein Benutzername"
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
                  Passwort
                </label>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #374151",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                    boxSizing: "border-box",
                  }}
                  placeholder="Dein Passwort"
                />
              </div>

              <button
                type="submit"
                style={{
                  ...buttonStyle,
                  backgroundColor: "#10b981",
                  color: "#fff",
                  marginTop: "0.5rem",
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
                Anmelden
              </button>
            </form>

            <button
              onClick={() => setShowLoginForm(false)}
              style={{
                padding: "0.5rem 1rem",
                border: "none",
                background: "none",
                color: "#6b7280",
                cursor: "pointer",
                fontSize: "0.9rem",
                marginTop: "1rem",
                textAlign: "center",
                width: "100%",
              }}
            >
              ← Zurück zur Organisationsauswahl
            </button>
          </div>
        )}

        {/* Back to Home */}
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "0.75rem 1.5rem",
            border: "2px dashed #374151",
            borderRadius: "8px",
            fontSize: "0.95rem",
            fontWeight: "600",
            fontFamily: '"Inter", "Roboto", Arial, sans-serif',
            backgroundColor: "transparent",
            color: "#475569",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#0f172a";
            e.currentTarget.style.backgroundColor = "#f1f5f9";
            e.currentTarget.style.borderColor = "#0f172a";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#475569";
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.borderColor = "#374151";
          }}
        >
          ← Zurück zur Startseite
        </button>

        {/* Debug Status Panel */}
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          background: dbStatus.api && dbStatus.db ? '#10b981' : '#ef4444',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '0.75rem',
          fontFamily: 'monospace',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          border: '2px solid rgba(255,255,255,0.2)',
          minWidth: '200px',
          zIndex: 999
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>🔧 Debug Status</div>
          <div>API: {dbStatus.loading ? '⏳' : dbStatus.api ? '✅' : '❌'}</div>
          <div>DB: {dbStatus.loading ? '⏳' : dbStatus.db ? '✅' : '❌'}</div>
          {dbStatus.lastCheck && (
            <div style={{ fontSize: '0.65rem', opacity: 0.8, marginTop: '4px' }}>
              Letzter Check: {dbStatus.lastCheck}
            </div>
          )}
          <button
            onClick={async () => {
              setDbStatus(prev => ({ ...prev, loading: true }));
              try {
                await api.health();
                const data = await api.organisations();
                setOrgs(data);
                setDbStatus({
                  api: true,
                  db: true,
                  loading: false,
                  lastCheck: new Date().toLocaleTimeString('de-DE')
                });
                setError(null);
              } catch (error: any) {
                setError(error.message ?? "Verbindungsfehler");
                setDbStatus({
                  api: false,
                  db: false,
                  loading: false,
                  lastCheck: new Date().toLocaleTimeString('de-DE')
                });
              }
            }}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '0.65rem',
              cursor: 'pointer',
              marginTop: '8px',
              width: '100%'
            }}
          >
            🔄 Erneut prüfen
          </button>
        </div>

        {/* Schlafender Gremlin für zukünftige Hilfe-Funktion */}
        <div
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            zIndex: 1000,
            cursor: "pointer",
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
          onClick={() => {
            /* Hilfe kommt später */
          }}
          title="Hilfe (coming soon)"
        >
          <img
            src={sleepGremlin}
            alt="Hilfe Gremlin"
            style={{
              width: "120px",
              height: "120px",
              objectFit: "contain",
            }}
          />
        </div>

        {/* Modals */}
        <ConfirmModal
          isOpen={modalState.type === 'confirm-resend'}
          onClose={closeModal}
          onConfirm={() => handleResendVerification(modalState.userEmail)}
          title={modalState.title}
          message={modalState.message}
          type={modalState.alertType}
          confirmText="E-Mail senden"
          cancelText="Abbrechen"
        />

        <AlertModal
          isOpen={modalState.type === 'alert'}
          onClose={closeModal}
          title={modalState.title}
          message={modalState.message}
          type={modalState.alertType}
        />

        <Modal
          isOpen={modalState.type === 'resend-email'}
          onClose={closeModal}
          title={modalState.title}
          type="info"
        >
          <p style={{
            fontFamily: '"Inter", "Roboto", Arial, sans-serif',
            fontSize: '1rem',
            color: '#475569',
            lineHeight: '1.6',
            marginBottom: '1rem',
          }}>
            {modalState.message}
          </p>
          <form onSubmit={(e) => {
            e.preventDefault();
            const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
            if (email) {
              closeModal();
              handleResendVerification(email);
            }
          }}>
            <input
              type="email"
              name="email"
              required
              placeholder="deine-email@beispiel.de"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #374151',
                borderRadius: '8px',
                fontSize: '1rem',
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                marginBottom: '1rem',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={closeModal}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '2px solid #64748b',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  backgroundColor: '#fff',
                  color: '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '2px 4px 0 #64748b',
                }}
              >
                Abbrechen
              </button>
              <button
                type="submit"
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '2px solid #181818',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  backgroundColor: '#fbbf24',
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '2px 4px 0 #181818',
                }}
              >
                Senden
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
};

export default AdminLogin;
