import React from 'react';
import styles from './Planer.module.css';
import { MapPin, Mic, Hourglass, Info, Coffee, Megaphone, Hammer, Dice5 } from 'lucide-react';
import type { ScheduleItem } from '../../types/schedule';

interface ScheduleCardProps {
  item: ScheduleItem;
  isPassed: boolean;
  debug?: boolean;
  onRef?: (el: HTMLElement | null) => void;
  index?: number;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({ item, isPassed, debug, onRef, index = 0 }) => {
  const typeCls = styles['type_' + item.type];
  const edgeCls = index % 3 === 1 ? styles.edgeB : index % 3 === 2 ? styles.edgeC : '';
  const addMinutesToTime = (timeStr?: string, minutesToAdd?: number) => {
    if (!timeStr) return '00:00';
    const parts = timeStr.split(':').map((p) => parseInt(p, 10));
    if (parts.length < 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) return timeStr || '00:00';
    const d = new Date();
    d.setHours(parts[0], parts[1], 0, 0);
    if (minutesToAdd && !Number.isNaN(minutesToAdd)) d.setMinutes(d.getMinutes() + minutesToAdd);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const delayMinutes = typeof item.delay === 'number' ? item.delay : 0;
  const adjustedTime = delayMinutes !== 0 ? addMinutesToTime(item.time, delayMinutes) : item.time;

  return (
    <article
      className={`${styles.card} ${typeCls} ${edgeCls} ${isPassed && !debug ? styles.past : ''}`}
      aria-label={`Termin: ${item.title}`}
      ref={onRef as any}
    >
      <div className={styles.tape} aria-hidden="true"></div>
      
      <div className={styles.cardTime} aria-label={`Zeit: ${item.time}`}>
        <span className={styles.icon} aria-hidden="true"><Hourglass size={18} /></span>
        {delayMinutes !== 0 || item.timeChanged ? (
          <div className={styles.timeChangeWrapper}>
            <span className={styles.newTime}>{adjustedTime}</span>
            <span className={styles.oldTime}>{item.originalTime || item.time}</span>
            <span style={{ marginLeft: 8, fontSize: '0.8rem', color: '#92400e', fontWeight: 700 }}>[{delayMinutes > 0 ? '+' : ''}{delayMinutes}m]</span>
          </div>
        ) : (
          <span>{item.time}</span>
        )}
        {isPassed && <span className={styles.pastEmoji} aria-label="Vergangener Termin">(vorbei)</span>}
      </div>
      <div className={styles.cardContent}>
        <div className={styles.cardHeaderRow}>
          <h3 className={styles.cardTitle} tabIndex={0}>{item.title}</h3>
          <span className={`${styles.categoryBadge} ${styles['cat_' + item.type]}`}>{item.type}</span>
        </div>
        {item.type === 'session' && (
          <>
            {'speaker' in item && item.speaker && (
              <div className={styles.cardSpeaker} aria-label={`Referent: ${item.speaker}`}>
                <span className={styles.icon} aria-hidden="true"><Mic size={18} /></span>
                <span>{item.speaker}</span>
              </div>
            )}
            {'location' in item && item.location && (
              <div className={styles.cardLocation} aria-label={`Ort: ${item.location}`}>
                <span className={styles.icon} aria-hidden="true"><MapPin size={18} /></span>
                <span>{item.location}</span>
              </div>
            )}
            {'details' in item && item.details && (
              <div className={styles.cardDetails} aria-label="Details">
                <span className={styles.icon} aria-hidden="true"><Info size={18} /></span>
                <span>{item.details}</span>
              </div>
            )}
          </>
        )}
        {item.type === 'workshop' && (
          <>
            {'speaker' in item && item.speaker && (
              <div className={styles.cardSpeaker} aria-label={`Leitung: ${item.speaker}`}>
                <span className={styles.icon} aria-hidden="true"><Hammer size={18} /></span>
                <span>{item.speaker}</span>
              </div>
            )}
            {'location' in item && item.location && (
              <div className={styles.cardLocation} aria-label={`Ort: ${item.location}`}>
                <span className={styles.icon} aria-hidden="true"><MapPin size={18} /></span>
                <span>{item.location}</span>
              </div>
            )}
            {'materials' in item && item.materials && (
              <div className={styles.cardDetails} aria-label="Materialien">
                <span className={styles.icon} aria-hidden="true"><Hammer size={18} /></span>
                <span>{item.materials}</span>
              </div>
            )}
            {'details' in item && item.details && (
              <div className={styles.cardDetails} aria-label="Details">
                <span className={styles.icon} aria-hidden="true"><Info size={18} /></span>
                <span>{item.details}</span>
              </div>
            )}
          </>
        )}
        {item.type === 'break' && (
          <>
            {'duration' in item && item.duration && (
              <div className={styles.cardDetails} aria-label="Dauer">
                <span className={styles.icon} aria-hidden="true"><Coffee size={18} /></span>
                <span>{item.duration}</span>
              </div>
            )}
            {'snacks' in item && item.snacks && (
              <div className={styles.cardDetails} aria-label="Snacks">
                <span className={styles.icon} aria-hidden="true"><Coffee size={18} /></span>
                <span>{item.snacks}</span>
              </div>
            )}
          </>
        )}
        {item.type === 'announcement' && (
          <>
            {'details' in item && item.details && (
              <div className={styles.cardDetails} aria-label="Ansage">
                <span className={styles.icon} aria-hidden="true"><Megaphone size={18} /></span>
                <span>{item.details}</span>
              </div>
            )}
          </>
        )}
        {item.type === 'game' && (
          <>
            {'facilitator' in item && item.facilitator && (
              <div className={styles.cardSpeaker} aria-label={`Leitung: ${item.facilitator}`}>
                <span className={styles.icon} aria-hidden="true"><Dice5 size={18} /></span>
                <span>{item.facilitator}</span>
              </div>
            )}
            {'location' in item && item.location && (
              <div className={styles.cardLocation} aria-label={`Ort: ${item.location}`}>
                <span className={styles.icon} aria-hidden="true"><MapPin size={18} /></span>
                <span>{item.location}</span>
              </div>
            )}
            {'materials' in item && item.materials && (
              <div className={styles.cardDetails} aria-label="Materialien">
                <span className={styles.icon} aria-hidden="true"><Dice5 size={18} /></span>
                <span>{item.materials}</span>
              </div>
            )}
            {'details' in item && item.details && (
              <div className={styles.cardDetails} aria-label="Details">
                <span className={styles.icon} aria-hidden="true"><Info size={18} /></span>
                <span>{item.details}</span>
              </div>
            )}
          </>
        )}
      </div>
    </article>
  );
};

export default ScheduleCard;
