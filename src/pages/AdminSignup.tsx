import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, CheckCircle, Eye, EyeOff } from "lucide-react";
import FlipchartBackground from "../components/layout/FlipchartBackground";
import { AlertModal } from "../components/ui";
import styles from "./Admin.module.css";
import chaosOpsLogo from "../assets/Chaos-Ops Logo.png";
import { api } from "../lib/api";

const AdminSignup: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    orgName: "",
    description: "",
    adminUsername: "",
    adminEmail: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupResult, setSignupResult] = useState<{
    organisation: any;
    user: any;
    message: string;
  } | null>(null);
  // Es kann immer nur ein Modal offen sein
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }>({ isOpen: false, title: '', message: '', type: 'info' });

  // Hilfsfunktion: Modal robust öffnen
  const openModal = (modal: Omit<typeof modalState, 'isOpen'>) => {
    setModalState({ ...modal, isOpen: true });
  };


  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.orgName ||
      !form.adminUsername ||
      !form.adminEmail ||
      !form.password
    ) {
      openModal({
        title: 'Fehlende Angaben',
        message: 'Bitte fülle alle Pflichtfelder aus!',
        type: 'warning',
      });
      return;
    }
    
    if (form.password.length < 6) {
      openModal({
        title: 'Passwort zu schwach',
        message: 'Das Passwort muss mindestens 6 Zeichen lang sein.',
        type: 'warning',
      });
      return;
    }

    if (!acceptedTerms) {
      openModal({ title: 'AGB & Datenschutz', message: 'Bitte akzeptiere die AGB und die Datenschutzerklärung, um fortzufahren.', type: 'warning' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = { ...form, acceptsTOS: true, acceptsPrivacy: true } as any;
      const data = await api.signup(payload);
      setSignupResult(data);
      // store acceptance locally if user id present
      try {
        if (data?.user?.id) {
          localStorage.setItem(`accepted_terms_${data.user.id}`, 'true');
        }
      } catch {}
      setSignupSuccess(true);
    } catch (err: any) {
      openModal({
        title: 'Registrierung fehlgeschlagen',
        message: err.message || 'Ein unbekannter Fehler ist aufgetreten.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const input = {
    width: "100%",
    padding: "0.75rem",
    border: "2px solid #374151",
    borderRadius: "8px",
    fontSize: "1rem",
    fontFamily: '"Inter", "Roboto", Arial, sans-serif',
    boxSizing: "border-box" as const,
  };

  const label = {
    display: "block",
    fontFamily: '"Inter", "Roboto", Arial, sans-serif',
    fontSize: "1rem",
    fontWeight: 600,
    color: "#0f172a",
    marginBottom: "0.5rem",
  };

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  if (signupSuccess && signupResult) {
    return (
      <div
        className={styles.adminWrapper}
        role="main"
        aria-label="Registrierung erfolgreich"
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
            maxWidth: "700px",
            margin: "0 auto",
          }}
        >
          {/* Success Card */}
          <div
            style={{
              background: "#fff",
              borderRadius: "1.2rem 1.35rem 1.15rem 1.25rem",
              boxShadow: "2px 4px 0 #e5e7eb, 0 2px 8px 0 rgba(0,0,0,0.08)",
              padding: "3rem 2rem",
              border: "2px solid #181818",
              textAlign: "center",
              width: "100%",
              position: "relative",
              transform: "rotate(-0.2deg)",
              zIndex: 1,
            }}
          >
            <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
              <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} />
                <span style={{ fontFamily: 'Inter, Roboto, sans-serif' }}>Ich akzeptiere die <a href="/agb" target="_blank" rel="noopener noreferrer">AGB</a> und die <a href="/dsgvo" target="_blank" rel="noopener noreferrer">Datenschutzerklärung</a>.</span>
              </label>
            </div>
            {/* Tape */}
            <div className={styles.tape} />
            
            <div
              style={{
                marginBottom: "2rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src={chaosOpsLogo}
                alt="Chaos Ops Logo"
                style={{
                  maxWidth: "200px",
                  maxHeight: "80px",
                  width: "auto",
                  height: "auto",
                  filter: "drop-shadow(2px 4px 8px rgba(0,0,0,0.1))",
                }}
              />
            </div>
            <CheckCircle
              size={64}
              style={{
                color: "#10b981",
                marginBottom: "1.5rem",
              }}
            />

            <h1
              style={{
                fontFamily:
                  '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                fontSize: "2rem",
                fontWeight: "700",
                color: "#181818",
                marginBottom: "0.5rem",
              }}
            >
              Registrierung erfolgreich! 🎉
            </h1>
            
            <p
              style={{
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                fontSize: "1.1rem",
                color: "#4a5568",
                marginBottom: "1.5rem",
                fontWeight: "500",
              }}
            >
              E-Mail-Bestätigung erforderlich
            </p>

            {/* Account Details */}
            <div
              style={{
                background: "#f0fdf4",
                border: "2px solid #16a34a",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1.5rem",
                textAlign: "left",
              }}
            >
              <h4
                style={{
                  margin: "0 0 0.5rem 0",
                  color: "#15803d",
                  fontWeight: "600",
                }}
              >
                Erstellt:
              </h4>
              <p
                style={{
                  margin: "0.25rem 0",
                  fontSize: "0.9rem",
                  color: "#166534",
                }}
              >
                <strong>Organisation:</strong> {signupResult.organisation.name}
              </p>
              <p
                style={{
                  margin: "0.25rem 0",
                  fontSize: "0.9rem",
                  color: "#166534",
                }}
              >
                <strong>Administrator:</strong> {signupResult.user.username}
              </p>
              <p
                style={{
                  margin: "0.25rem 0",
                  fontSize: "0.9rem",
                  color: "#166534",
                }}
              >
                <strong>E-Mail:</strong> {signupResult.user.email}
              </p>
            </div>

            {/* Next Steps */}
            <div
              style={{
                background: "#fef3c7",
                border: "2px solid #d97706",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1.5rem",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                <Mail size={20} style={{ color: "#d97706" }} />
                <strong style={{ color: "#92400e" }}>Nächste Schritte:</strong>
              </div>
              <ol
                style={{
                  margin: "0",
                  paddingLeft: "1.5rem",
                  color: "#92400e",
                  fontSize: "0.9rem",
                }}
              >
                <li>Überprüfe dein E-Mail-Postfach (auch Spam-Ordner)</li>
                <li>Klicke auf den Bestätigungslink in der E-Mail</li>
                <li>Nach der Bestätigung kannst du dich anmelden</li>
              </ol>
            </div>

            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => navigate("/login")}
                style={{
                  padding: "1rem 2rem",
                  border: "2px solid #181818",
                  borderRadius: "8px",
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  backgroundColor: "#10b981",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
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
                Zur Anmeldung
              </button>

              <button
                onClick={() => navigate("/")}
                style={{
                  padding: "1rem 2rem",
                  border: "2px solid #181818",
                  borderRadius: "8px",
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  backgroundColor: "#64748b",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
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
                Zur Startseite
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className={styles.adminWrapper}
      role="main"
      aria-label="Chaos Ops Organisation registrieren"
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
          maxWidth: "700px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "1.2rem 1.35rem 1.15rem 1.25rem",
            boxShadow: "2px 4px 0 #e5e7eb, 0 2px 8px 0 rgba(0,0,0,0.08)",
            padding: "3rem 2rem",
            border: "2px solid #181818",
            width: "100%",
            position: "relative",
            transform: "rotate(-0.2deg)",
            zIndex: 1,
          }}
        >
          {/* Tape */}
          <div className={styles.tape} />
          
          <div
            style={{
              marginBottom: "2rem",
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
          <h1
            style={{
              fontFamily:
                '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
              fontSize: "clamp(1.8rem, 4vw, 2.2rem)",
              fontWeight: 700,
              color: "#0f172a",
              marginBottom: "0.5rem",
              textAlign: "center",
            }}
          >
            Neue Organisation erstellen
          </h1>
          
          <p
            style={{
              fontFamily: '"Inter", "Roboto", Arial, sans-serif',
              fontSize: "1.1rem",
              color: "#4a5568",
              textAlign: "center",
              marginBottom: "2rem",
              lineHeight: "1.6",
            }}
          >
            Erstelle deine Organisation und werde Administrator
          </p>
          <form
            onSubmit={submit}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <label style={label}>Organisationsname</label>
              <input
                style={input}
                value={form.orgName}
                onChange={(e) => setForm({ ...form, orgName: e.target.value })}
                placeholder="z.B. Ev. Jugend West"
              />
            </div>
            <div>
              <label style={label}>Beschreibung (optional)</label>
              <input
                style={input}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div>
              <label style={label}>Admin Benutzername</label>
              <input
                style={input}
                value={form.adminUsername}
                onChange={(e) =>
                  setForm({ ...form, adminUsername: e.target.value })
                }
              />
            </div>
            <div>
              <label style={label}>Admin E-Mail *</label>
              <input
                type="email"
                required
                style={input}
                value={form.adminEmail}
                onChange={(e) =>
                  setForm({ ...form, adminEmail: e.target.value })
                }
                placeholder="admin@beispiel.de"
              />
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#64748b",
                  margin: "0.25rem 0 0 0",
                  fontStyle: "italic",
                }}
              >
                Wird für die E-Mail-Bestätigung benötigt
              </p>
            </div>
            <div>
              <label style={label}>Passwort *</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  style={{
                    ...input,
                    paddingRight: "3rem",
                  }}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Mindestens 6 Zeichen"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0.25rem",
                    color: "#6b7280",
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <small
                style={{
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  color: "#6b7280",
                  fontSize: "0.85rem",
                  marginTop: "0.25rem",
                  display: "block",
                }}
              >
                Mindestens 6 Zeichen für die Sicherheit
              </small>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} />
                <span style={{ fontFamily: 'Inter, Roboto, sans-serif' }}>Ich akzeptiere die <a href="/agb" target="_blank" rel="noopener noreferrer">AGB</a> und die <a href="/dsgvo" target="_blank" rel="noopener noreferrer">Datenschutzerklärung</a>.</span>
              </label>
            </div>

            <button
              disabled={submitting}
              type="submit"
              style={{
                width: "100%",
                padding: "1rem 2rem",
                border: "2px solid #181818",
                borderRadius: "8px",
                fontSize: "1.1rem",
                fontWeight: "700",
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                background: submitting ? "#9ca3af" : "#10b981",
                color: "#fff",
                cursor: submitting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                transition: "all 0.2s ease",
                boxShadow: "2px 4px 0 #181818",
                textShadow: "0 1px 2px rgba(0,0,0,0.2)",
              }}
              onMouseEnter={(e) => {
                if (!submitting) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "3px 6px 0 #181818";
                }
              }}
              onMouseLeave={(e) => {
                if (!submitting) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "2px 4px 0 #181818";
                }
              }}
            >
              {submitting ? "Wird erstellt…" : "Organisation erstellen"}
            </button>
            <div style={{ marginTop: "2rem", textAlign: "center" }}>
              <p
                style={{
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  color: "#6b7280",
                  fontSize: "0.9rem",
                  marginBottom: "0.5rem",
                }}
              >
                Du hast bereits eine Organisation?
              </p>
              <button
                type="button"
                onClick={() => navigate("/login")}
                style={{
                  padding: "0.75rem 1.5rem",
                  border: "2px solid #3b82f6",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  backgroundColor: "transparent",
                  color: "#3b82f6",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: "2px 4px 0 #3b82f6",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "3px 6px 0 #3b82f6";
                  e.currentTarget.style.backgroundColor = "#3b82f6";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "2px 4px 0 #3b82f6";
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#3b82f6";
                }}
              >
                Zur Anmeldung
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Alert Modal */}
      <AlertModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />
    </div>
  );
};

export default AdminSignup
