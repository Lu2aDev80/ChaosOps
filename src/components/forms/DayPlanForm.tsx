import React, { useState } from 'react';
import { X, Calendar, ChevronRight } from 'lucide-react';
import ScheduleManager from '../planner/ScheduleManager';
import type { Event, DayPlan } from '../../types/event';
import type { ScheduleItem } from '../../types/schedule';
import styles from '../../pages/Admin.module.css';

interface DayPlanFormProps {
  dayPlan?: DayPlan | null;
  event: Event;
  onSave: (dayPlanData: Omit<DayPlan, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const DayPlanForm: React.FC<DayPlanFormProps> = ({
  dayPlan,
  event,
  onSave,
  onCancel
}) => {
  const [name, setName] = useState(dayPlan?.name || '');
  const [date, setDate] = useState(dayPlan?.date || new Date().toISOString().split('T')[0]);
  const isBasicValid = name.trim().length > 0 && date;

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '800px',
      margin: '0 1rem'
    }}>
      <div className={styles.adminCard} style={{ width: '100%' }}>
        <div className={styles.tape} aria-hidden="true"></div>
        <h2 className={styles.cardTitle}>
          <Calendar size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
          {dayPlan ? 'Tagesplan bearbeiten' : 'Neuer Tagesplan'}
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isBasicValid) {
              onSave({
                eventId: event.id,
                name: name.trim(),
                date,
                scheduleItems: dayPlan?.scheduleItems || []
              });
            }
          }}
          className={styles.cardContent}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Event Info */}
            <div style={{
              padding: '1rem',
              backgroundColor: '#f0f9ff',
              border: '2px solid #0ea5e9',
              borderRadius: '8px',
              fontFamily: '"Inter", "Roboto", Arial, sans-serif'
            }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#0369a1',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.5rem'
              }}>
                Veranstaltung
              </div>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#0369a1',
                fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif'
              }}>
                {event.name}
              </div>
            </div>
            {/* Name Field */}
            <div>
              <label htmlFor="dayPlanName" style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#181818'
              }}>
                Name des Tagesplans *
              </label>
              <input
                type="text"
                id="dayPlanName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                placeholder="z.B. Tag 1 - Ankunft & Kennenlernen"
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  border: '2px solid #181818',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  backgroundColor: '#fff',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 3px #fef3c7';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
            {/* Date Field */}
            <div>
              <label htmlFor="dayPlanDate" style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#181818'
              }}>
                Datum *
              </label>
              <input
                type="date"
                id="dayPlanDate"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  border: '2px solid #181818',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  backgroundColor: '#fff',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 3px #fef3c7';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="submit"
                disabled={!isBasicValid}
                style={{
                  flex: '1',
                  padding: '1rem',
                  border: '2px solid #181818',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '700',
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  backgroundColor: isBasicValid ? '#10b981' : '#e5e7eb',
                  color: isBasicValid ? '#fff' : '#888',
                  cursor: isBasicValid ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease',
                  boxShadow: isBasicValid ? '2px 4px 0 #181818' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (isBasicValid) {
                    e.currentTarget.style.backgroundColor = '#059669';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '3px 6px 0 #181818';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isBasicValid) {
                    e.currentTarget.style.backgroundColor = '#10b981';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '2px 4px 0 #181818';
                  }
                }}
              >
                <ChevronRight size={20} />
                Speichern
              </button>
              <button
                type="button"
                onClick={onCancel}
                style={{
                  padding: '1rem 1.5rem',
                  border: '2px solid #64748b',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  backgroundColor: '#fff',
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <X size={20} />
                Abbrechen
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DayPlanForm;