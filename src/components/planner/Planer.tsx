
import React, { useRef, useState } from 'react';
import styles from './Planer.module.css';
import Clock from './Clock';
import { appConfig } from "../../constants";
import Gremlin from '../ui/Gremlin';
import HelpChat from '../ui/HelpChat';
import type { ScheduleItem } from '../../types/schedule';
import ScheduleCard from './ScheduleCard';
import { useClock } from '../../hooks/useClock';
import { useAutoCenter } from '../../hooks/useAutoCenter';

// Types are imported from ../../types/schedule

interface PlanerProps {
  schedule: ScheduleItem[];
  date?: string;
  title?: string;
  debug?: boolean; // enables visual debug (no dimming, interactive)
  showClock?: boolean; // show live updating clock
  autoCenter?: boolean; // automatically center current activity
  displayInfo?: string; // optional display name/info to show in header
  resetButton?: React.ReactNode; // optional reset button to show in top left
}

const Planer: React.FC<PlanerProps> = ({
  schedule,
  date = new Date().toLocaleDateString(appConfig.locale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
  title = "Heutiger Ablauf",
  debug = true,
  showClock = true,
  autoCenter = true,
  displayInfo,
  resetButton
}) => {
  const currentTime = useClock(showClock);

  // Refs for auto-centering (article elements)
  const cardRefs = useRef<HTMLElement[]>([]);

  // Help Chat State
  const [showHelp, setShowHelp] = useState(false);


  useAutoCenter(autoCenter, schedule, currentTime, cardRefs);

  // Clock side effect handled via useClock hook

  const isTaskPassed = (taskTime: string): boolean => {
    const [hours, minutes] = taskTime.split(':').map(Number);
    const taskDate = new Date();
    taskDate.setHours(hours, minutes, 0);
    return currentTime > taskDate;
  };

  // Category class mapping
  // typeClass moved to ScheduleCard

  return (
    <div className={`${styles.plannerWrapper} ${debug ? styles.debugMode : ''}`} role="main" aria-label="Jugendgruppe Flipchart Ablauf">
      {/* Flipchart holes */}
      <div className={styles.holeLeft} aria-hidden="true"></div>
      <div className={styles.holeCenter} aria-hidden="true"></div>
      <div className={styles.holeRight} aria-hidden="true"></div>
      {/* Torn edge */}
      <div className={styles.tornEdge} aria-hidden="true"></div>

      {/* Reset button in top left */}
      {resetButton && (
        <div style={{
          position: 'absolute',
          top: '3.5rem',
          left: '1rem',
          zIndex: 20,
          pointerEvents: 'auto'
        }}>
          {resetButton}
        </div>
      )}

      {debug && (
        <div className={styles.debugBanner} aria-label="Debug Modus Aktiv">
          <strong>DEBUG MODUS</strong> – Abdunkeln deaktiviert, Interaktionen aktiv
        </div>
      )}

      {/* Schlafender Gremlin unten rechts */}
      <div
        style={{
          position: 'fixed',
          bottom: '2.5rem',
          right: '2.5rem',
          zIndex: 1000,
          cursor: 'pointer',
          pointerEvents: 'auto',
        }}
        aria-label="Help Chat öffnen"
        onClick={() => setShowHelp(true)}
      >
        <Gremlin type="sleep" size="large" />
      </div>

      {/* Help Chat Overlay */}
      {showHelp && <HelpChat />}
      {showHelp && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 10001,
          }}
          onClick={() => setShowHelp(false)}
        />
      )}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.date}>{date}</p>
          {displayInfo && (
            <p className={styles.time}>Display: {displayInfo}</p>
          )}
          {!showClock && !displayInfo && (
            <p className={styles.time}>Stand: {currentTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</p>
          )}
        </div>
      </header>
      {showClock && (
        <Clock time={currentTime} />
      )}
      <section className={styles.scheduleGrid} aria-label="Zeitplan">
        {schedule.length === 0 && (
          <div className={styles.emptyMsg}>Keine Termine für heute.</div>
        )}
        {schedule.map((rawItem, idx) => {
          // Normalize legacy items that may not have a type (treat as session)
          const item: ScheduleItem = (rawItem as any).type ? rawItem as ScheduleItem : { ...(rawItem as any), type: 'session' };
          const isPassed = isTaskPassed(item.time);
          return (
            <ScheduleCard
              key={item.id}
              item={item}
              isPassed={isPassed}
              debug={debug}
              onRef={el => { if (el) cardRefs.current[idx] = el as HTMLElement; }}
              index={idx}
            />
          );
        })}
      </section>
    </div>
  );
};

export default Planer;