import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogIn,
  Monitor,
  Calendar,
  BookOpen,
} from "lucide-react";
import FlipchartBackground from "../components/layout/FlipchartBackground";
import styles from "./Admin.module.css";
import chaosOpsLogo from "../assets/Chaos-Ops Logo.png";
import sleepGremlin from '../assets/gremlins/sleep.png';

const Home: React.FC = () => {
  const navigate = useNavigate();

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
            Dein digitaler Begleiter für Events und Veranstaltungen.
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
                padding: "1rem 2rem",
                border: "2px solid #181818",
                borderRadius: "8px",
                fontSize: "1.1rem",
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
                padding: "1rem 2rem",
                border: "2px solid #181818",
                borderRadius: "8px",
                fontSize: "1.1rem",
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
              Tagesplan Display registrieren
            </button>

            <button
              onClick={() => navigate("/documentation")}
              style={{
                padding: "1rem 2rem",
                border: "2px solid #181818",
                borderRadius: "8px",
                fontSize: "1.1rem",
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

            {/* Development Test Button */}
            <button
              onClick={() => navigate("/planner")}
              style={{
                padding: "1rem 2rem",
                border: "2px dashed #181818",
                borderRadius: "8px",
                fontSize: "1rem",
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
                  top: "-8px",
                  right: "-8px",
                  backgroundColor: "#ef4444",
                  color: "#fff",
                  fontSize: "0.7rem",
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
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
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
            // Hier später Hilfefunktion implementieren
            console.log("Gremlin wurde angeklickt - Hilfe kommt bald!");
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
      </main>
    </div>
  );
};

export default Home;
