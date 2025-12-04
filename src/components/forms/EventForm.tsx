import React, { useState } from 'react';
import { Save, X, Calendar } from 'lucide-react';
import type { Event } from '../../types/event';
import styles from '../../pages/Admin.module.css';

interface EventFormProps {
  event?: Event | null;
  organizationId: string;
  onSave: (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'dayPlans'>) => void;
  onCancel: () => void;
}

const EventForm: React.FC<EventFormProps> = ({
  event,
  organizationId,
  onSave,
  onCancel
}) => {
  const [name, setName] = useState(event?.name || '');
  const [description, setDescription] = useState(event?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      organizationId
    });
  };

  const isValid = name.trim().length > 0;

  return (
    <div className={styles.adminCard} style={{ 
      width: '100%', 
      maxWidth: '900px',
      margin: '0 auto'
    }}>
      <div className={styles.tape} aria-hidden="true"></div>
      
      <h2 className={styles.cardTitle}>
        <Calendar size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
        {event ? 'Veranstaltung bearbeiten' : 'Neue Veranstaltung'}
      </h2>

      <form onSubmit={handleSubmit} className={styles.cardContent}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Name Field */}
          <div>
            <label htmlFor="eventName" style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#181818'
            }}>
              Name der Veranstaltung *
            </label>
            <input
              type="text"
              id="eventName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="z.B. Jugendfreizeit 2025"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #181818',
                borderRadius: '8px',
                fontSize: '1rem',
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                backgroundColor: '#fff',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="eventDescription" style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#181818'
            }}>
              Beschreibung (optional)
            </label>
            <textarea
              id="eventDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kurze Beschreibung der Veranstaltung..."
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #181818',
                borderRadius: '8px',
                fontSize: '1rem',
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                backgroundColor: '#fff',
                boxSizing: 'border-box',
                resize: 'vertical',
                minHeight: '80px'
              }}
            />
          </div>

          {/* Action Buttons */}
            <div style={{ 
              display: 'flex', 
              gap: '0.75rem', 
              marginTop: '0.5rem',
              flexDirection: window.innerWidth < 480 ? 'column' : 'row'
            }}>
            <button
              type="submit"
              disabled={!isValid}
              style={{
                flex: '1',
                padding: '0.875rem',
                border: '2px solid #181818',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '700',
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                backgroundColor: isValid ? '#fbbf24' : '#e5e7eb',
                color: isValid ? '#fff' : '#888',
                cursor: isValid ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
                boxShadow: isValid ? '2px 4px 0 #181818' : 'none'
              }}
            >
              <Save size={16} />
              {event ? 'Aktualisieren' : 'Erstellen'}
            </button>

            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '0.875rem 1rem',
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
            >
              <X size={16} />
              Abbrechen
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EventForm;