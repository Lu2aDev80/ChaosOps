
import React, { useRef } from 'react';
import styles from './Planer.module.css';
import Clock from './Clock';
import { appConfig } from "../../constants";
import { PenLine } from 'lucide-react';
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
}

const Planer: React.FC<PlanerProps> = ({
  schedule,
  date = new Date().toLocaleDateString(appConfig.locale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
  title = "Heutiger Ablauf",
  debug = true,
  showClock = true,
  autoCenter = true
}) => {
  const currentTime = useClock(showClock);

  // Refs for auto-centering (article elements)
  const cardRefs = useRef<HTMLElement[]>([]);


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

      {debug && (
        <div className={styles.debugBanner} aria-label="Debug Modus Aktiv">
          <strong>DEBUG MODUS</strong> – Abdunkeln deaktiviert, Interaktionen aktiv
        </div>
      )}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.date}>{date}</p>
          {!showClock && (
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
      <footer className={styles.footer}>
        <span className={styles.footerIcon} aria-hidden="true"><PenLine size={20} /></span>
        <span>Handgezeichneter Jugendgruppen Flipchart</span>
      </footer>
    </div>
  );
};

export default Planer;