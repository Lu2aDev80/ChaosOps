import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import FlipchartBackground from '../components/layout/FlipchartBackground';
import { UserCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import styles from './Admin.module.css';
import chaosOpsLogo from '../assets/Chaos-Ops Logo.png';

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validating, setValidating] = useState(true);
  const [invitationData, setInvitationData] = useState<{email: string; role: string; organisation: {id: string; name: string}} | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Ungültiger Einladungslink');
      setValidating(false);
      return;
    }
    
    // Validate token on page load
    const validateToken = async () => {
      try {
        const result = await api.validateInvitation(token);
        setInvitationData(result);
      } catch (err: any) {
        if (err.response?.data?.error) {
          const errorMsg = err.response.data.error;
          if (errorMsg.includes('Invalid invitation token')) {
            setError('Diese Einladung wurde widerrufen oder ist ungültig.');
          } else if (errorMsg.includes('expired')) {
            setError('Diese Einladung ist abgelaufen.');
          } else {
            setError(errorMsg);
          }
        } else {
          setError('Einladung konnte nicht validiert werden.');
        }
      } finally {
        setValidating(false);
      }
    };
    
    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Ungültiger Einladungslink');
      return;
    }

    if (!username.trim()) {
      setError('Benutzername ist erforderlich');
      return;
    }

    if (password.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen lang sein');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return;
    }

    setLoading(true);
    try {
      const response = await api.acceptInvitation(token, username, password);
      
      // Success! User is now logged in via session cookie
      console.log('Account created:', response);
      
      // Redirect to admin dashboard
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error('Accept invitation error:', err);
      if (err.response?.data?.error) {
        const errorMsg = err.response.data.error;
        if (errorMsg.includes('Invalid invitation token')) {
          setError('Diese Einladung wurde widerrufen oder ist ungültig.');
        } else if (errorMsg.includes('expired')) {
          setError('Diese Einladung ist abgelaufen.');
        } else if (errorMsg.includes('Username already taken')) {
          setError('Dieser Benutzername ist bereits vergeben.');
        } else {
          setError(errorMsg);
        }
      } else {
        setError('Einladung konnte nicht angenommen werden. Bitte versuche es erneut.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div
        className={styles.adminWrapper}
        role="main"
        aria-label="Chaos Ops Einladung wird validiert"
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
            maxWidth: "500px",
            margin: "0 auto",
          }}
        >
          {/* Loading Card */}
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
              transform: "rotate(-0.3deg)",
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
                  maxWidth: "200px",
                  maxHeight: "80px",
                  width: "auto",
                  height: "auto",
                  filter: "drop-shadow(2px 4px 8px rgba(0,0,0,0.1))",
                }}
              />
            </div>

            {/* Loading Animation */}
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                border: "4px solid #f3f4f6",
                borderTop: "4px solid #3b82f6",
                animation: "spin 1s linear infinite",
                margin: "0 auto 1.5rem",
              }}
            />

            <h1
              style={{
                fontFamily:
                  '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                fontSize: "1.5rem",
                fontWeight: "700",
                color: "#181818",
                marginBottom: "0.5rem",
              }}
            >
              Einladung wird geprüft...
            </h1>

            <p
              style={{
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                fontSize: "1rem",
                color: "#4a5568",
                lineHeight: "1.6",
              }}
            >
              Einen Moment bitte, während wir deine Einladung überprüfen.
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error && !invitationData) {
    return (
      <div
        className={styles.adminWrapper}
        role="main"
        aria-label="Chaos Ops Einladung ungültig"
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
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          {/* Error Card */}
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
              transform: "rotate(0.3deg)",
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
                  maxWidth: "200px",
                  maxHeight: "80px",
                  width: "auto",
                  height: "auto",
                  filter: "drop-shadow(2px 4px 8px rgba(0,0,0,0.1))",
                }}
              />
            </div>

            {/* Error Icon */}
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                backgroundColor: "#fecaca",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
                border: "2px solid #181818",
              }}
            >
              <AlertCircle size={32} color="#dc2626" strokeWidth={2} />
            </div>

            <h1
              style={{
                fontFamily:
                  '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                fontSize: "2rem",
                fontWeight: "700",
                color: "#181818",
                marginBottom: "1rem",
              }}
            >
              Einladung ungültig
            </h1>

            <div
              style={{
                background: "#fef2f2",
                border: "2px solid #fca5a5",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "2rem",
              }}
            >
              <p
                style={{
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  fontSize: "1rem",
                  color: "#991b1b",
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                }}
              >
                {error}
              </p>
              <p
                style={{
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  fontSize: "0.9rem",
                  color: "#7f1d1d",
                  lineHeight: "1.4",
                }}
              >
                Bitte kontaktiere den Administrator für eine neue Einladung.
              </p>
            </div>

            <button
              onClick={() => navigate('/login')}
              style={{
                padding: "1rem 2rem",
                border: "2px solid #181818",
                borderRadius: "8px",
                fontSize: "1.1rem",
                fontWeight: "700",
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                backgroundColor: "#3b82f6",
                color: "#fff",
                cursor: "pointer",
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
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className={styles.adminWrapper}
      role="main"
      aria-label="Chaos Ops Einladung annehmen"
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
        {/* Main Invitation Card */}
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

          {/* Welcome Icon */}
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: "#dcfce7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
              border: "2px solid #181818",
            }}
          >
            <UserCheck size={32} color="#16a34a" strokeWidth={2} />
          </div>

          <h1
            style={{
              fontFamily:
                '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
              fontSize: "2rem",
              fontWeight: "700",
              color: "#181818",
              marginBottom: "1rem",
              textAlign: "center",
            }}
          >
            Willkommen bei Chaos Ops!
          </h1>

          {/* Invitation Details */}
          <div
            style={{
              background: "#f8fafc",
              border: "2px solid #e2e8f0",
              borderRadius: "8px",
              padding: "1.5rem",
              marginBottom: "2rem",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                fontSize: "1.1rem",
                color: "#334155",
                lineHeight: "1.6",
                marginBottom: "1rem",
              }}
            >
              Du wurdest eingeladen, der Organisation{" "}
              <strong style={{ color: "#1e293b" }}>
                {invitationData?.organisation.name}
              </strong>{" "}
              als{" "}
              <strong style={{ color: "#1e293b" }}>
                {invitationData?.role === 'admin' ? 'Administrator' : 'Mitglied'}
              </strong>{" "}
              beizutreten.
            </p>
            <p
              style={{
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                fontSize: "0.9rem",
                color: "#64748b",
              }}
            >
              E-Mail: <strong>{invitationData?.email}</strong>
            </p>
          </div>

          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "2px solid #fca5a5",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1.5rem",
              }}
              role="alert"
            >
              <p
                style={{
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  fontSize: "0.9rem",
                  color: "#991b1b",
                  fontWeight: "600",
                  margin: 0,
                }}
              >
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            {/* Username Field */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                htmlFor="username"
                style={{
                  display: "block",
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  fontSize: "1rem",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "0.5rem",
                }}
              >
                Benutzername
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Wähle einen Benutzernamen"
                required
                disabled={loading}
                autoComplete="username"
                style={{
                  width: "100%",
                  padding: "0.875rem 1rem",
                  border: "2px solid #374151",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  boxSizing: "border-box",
                  transition: "border-color 0.2s ease",
                  backgroundColor: loading ? "#f9fafb" : "#fff",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#3b82f6";
                  e.currentTarget.style.outline = "none";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#374151";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  fontSize: "1rem",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "0.5rem",
                }}
              >
                Passwort
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Wähle ein starkes Passwort"
                  required
                  minLength={6}
                  disabled={loading}
                  autoComplete="new-password"
                  style={{
                    width: "100%",
                    padding: "0.875rem 3rem 0.875rem 1rem",
                    border: "2px solid #374151",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                    boxSizing: "border-box",
                    transition: "border-color 0.2s ease",
                    backgroundColor: loading ? "#f9fafb" : "#fff",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#3b82f6";
                    e.currentTarget.style.outline = "none";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#374151";
                    e.currentTarget.style.boxShadow = "none";
                  }}
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
                Mindestens 6 Zeichen
              </small>
            </div>

            {/* Confirm Password Field */}
            <div style={{ marginBottom: "2rem" }}>
              <label
                htmlFor="confirmPassword"
                style={{
                  display: "block",
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  fontSize: "1rem",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "0.5rem",
                }}
              >
                Passwort bestätigen
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Passwort wiederholen"
                  required
                  minLength={6}
                  disabled={loading}
                  autoComplete="new-password"
                  style={{
                    width: "100%",
                    padding: "0.875rem 3rem 0.875rem 1rem",
                    border: "2px solid #374151",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                    boxSizing: "border-box",
                    transition: "border-color 0.2s ease",
                    backgroundColor: loading ? "#f9fafb" : "#fff",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#3b82f6";
                    e.currentTarget.style.outline = "none";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#374151";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              style={{
                width: "100%",
                padding: "1rem 2rem",
                border: "2px solid #181818",
                borderRadius: "8px",
                fontSize: "1.1rem",
                fontWeight: "700",
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                backgroundColor: loading ? "#9ca3af" : "#16a34a",
                color: "#fff",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                transition: "all 0.2s ease",
                boxShadow: "2px 4px 0 #181818",
                textShadow: "0 1px 2px rgba(0,0,0,0.2)",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "3px 6px 0 #181818";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "2px 4px 0 #181818";
                }
              }}
            >
              {loading ? (
                <>
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      border: "2px solid transparent",
                      borderTop: "2px solid #fff",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  Konto wird erstellt...
                </>
              ) : (
                <>
                  <UserCheck size={20} />
                  Konto erstellen & beitreten
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: "2rem", textAlign: "center" }}>
            <p
              style={{
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                color: "#6b7280",
                fontSize: "0.9rem",
                marginBottom: "0.5rem",
              }}
            >
              Du hast bereits ein Konto?
            </p>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: "none",
                border: "none",
                color: "#3b82f6",
                textDecoration: "underline",
                fontWeight: "600",
                cursor: "pointer",
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                fontSize: "0.9rem",
              }}
            >
              Hier anmelden
            </button>
          </div>
        </div>
      </main>

      {/* Add CSS animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
