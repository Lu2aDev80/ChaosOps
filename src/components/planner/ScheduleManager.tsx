import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, Save, X, Edit2 } from 'lucide-react';
import type { ScheduleItem } from '../../types/schedule';
import styles from '../../pages/Admin.module.css';

interface ScheduleManagerProps {
  schedule: ScheduleItem[];
  onSave: (schedule: ScheduleItem[]) => void;
  onCancel: () => void;
}

const ScheduleManager: React.FC<ScheduleManagerProps> = ({ schedule, onSave, onCancel }) => {
  const [items, setItems] = useState<ScheduleItem[]>(schedule);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Keep local items in sync if parent passes a different schedule prop
  useEffect(() => {
    setItems(schedule || []);
  }, [schedule]);

  const addScheduleItem = () => {
    const newItem: ScheduleItem = {
      id: Date.now() + Math.random(),
      dayPlanId: '',
      time: '09:00',
      type: 'session',
      title: 'Neuer Termin',
      speaker: undefined,
      location: undefined,
      details: undefined,
      materials: undefined,
      duration: undefined,
      snacks: undefined,
      facilitator: undefined,
      delay: 0,
      timeChanged: false,
      positionChanged: false,
      originalTime: undefined,
      originalPosition: undefined,
      position: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: []
    };

    // Use functional update to avoid stale closures and ensure editingIndex points
    // to the newly inserted item.
    setItems((prev) => {
      const next = [...prev, newItem];
      // set editing index to last item
      setEditingIndex(next.length - 1);
      return next;
    });
  };

  const updateScheduleItem = (index: number, updates: Partial<ScheduleItem>) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    setItems(newItems);
  };

  const removeScheduleItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === items.length - 1)) return;
    
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setItems(newItems);
  };

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '600px',
      margin: '0 1rem'
    }}>
      <div className={styles.adminCard} style={{ width: '100%' }}>
        <div className={styles.tape} aria-hidden="true"></div>
        
        <h2 className={styles.cardTitle}>
          <Clock size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
          Termine verwalten
        </h2>

        <div className={styles.cardContent}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Schedule Items Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center'
            }}>
              <label style={{ 
                fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#181818'
              }}>
                Termine ({items.length})
              </label>
              <button
                type="button"
                onClick={addScheduleItem}
                style={{
                  padding: '0.5rem 1rem',
                  border: '2px solid #181818',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  backgroundColor: '#d9fdd2',
                  color: '#181818',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#a6f3a6';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#d9fdd2';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Plus size={16} />
                Termin
              </button>
            </div>

            {/* Schedule Items List */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.5rem',
              maxHeight: '350px',
              overflowY: 'auto'
            }}>
              {items.length === 0 ? (
                <div style={{
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  color: '#9ca3af',
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  fontSize: '0.9rem'
                }}>
                  Noch keine Termine hinzugefügt
                </div>
              ) : (
                items.map((item, index) => (
                  <div key={index}>
                    {editingIndex === index ? (
                      // Editing Mode
                      <div style={{
                        padding: '0.75rem',
                        border: '2px solid #181818',
                        borderRadius: '6px',
                        backgroundColor: '#fff',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                      }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input
                            type="time"
                            value={item.time}
                            onChange={(e) => updateScheduleItem(index, { time: e.target.value })}
                            style={{
                              width: '80px',
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '0.85rem',
                              fontFamily: '"Inter", "Roboto", Arial, sans-serif'
                            }}
                          />
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => updateScheduleItem(index, { title: e.target.value })}
                            placeholder="Titel"
                            autoFocus
                            style={{
                              flex: '1',
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '0.85rem',
                              fontFamily: '"Inter", "Roboto", Arial, sans-serif'
                            }}
                          />
                          <select
                            value={item.type}
                            onChange={(e) => updateScheduleItem(index, { type: e.target.value as any })}
                            style={{
                              width: '110px',
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '0.85rem',
                              fontFamily: '"Inter", "Roboto", Arial, sans-serif'
                            }}
                          >
                            <option value="session">Session</option>
                            <option value="workshop">Workshop</option>
                            <option value="break">Pause</option>
                            <option value="game">Spiel</option>
                            <option value="announcement">Ansage</option>
                            <option value="transition">Übergang</option>
                          </select>
                          <input
                            type="number"
                            min={0}
                            value={typeof item.delay === 'number' ? item.delay : 0}
                            onChange={(e) => updateScheduleItem(index, { delay: Number(e.target.value) })}
                            style={{
                              width: '80px',
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '0.85rem',
                              fontFamily: '"Inter", "Roboto", Arial, sans-serif'
                            }}
                            placeholder="Delay (min)"
                          />
                        </div>
                        
                        {/* Additional optional fields */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                          <input
                            type="text"
                            value={item.speaker || ''}
                            onChange={(e) => updateScheduleItem(index, { speaker: e.target.value || undefined })}
                            placeholder="Sprecher"
                            style={{
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '0.85rem',
                              fontFamily: '"Inter", "Roboto", Arial, sans-serif'
                            }}
                          />
                          <input
                            type="text"
                            value={item.location || ''}
                            onChange={(e) => updateScheduleItem(index, { location: e.target.value || undefined })}
                            placeholder="Ort"
                            style={{
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '0.85rem',
                              fontFamily: '"Inter", "Roboto", Arial, sans-serif'
                            }}
                          />
                          <input
                            type="text"
                            value={item.duration || ''}
                            onChange={(e) => updateScheduleItem(index, { duration: e.target.value || undefined })}
                            placeholder="Dauer"
                            style={{
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '0.85rem',
                              fontFamily: '"Inter", "Roboto", Arial, sans-serif'
                            }}
                          />
                          <input
                            type="text"
                            value={item.facilitator || ''}
                            onChange={(e) => updateScheduleItem(index, { facilitator: e.target.value || undefined })}
                            placeholder="Moderator"
                            style={{
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '0.85rem',
                              fontFamily: '"Inter", "Roboto", Arial, sans-serif'
                            }}
                          />
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                          <textarea
                            value={item.details || ''}
                            onChange={(e) => updateScheduleItem(index, { details: e.target.value || undefined })}
                            placeholder="Details"
                            rows={2}
                            style={{
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '0.85rem',
                              fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                              resize: 'vertical'
                            }}
                          />
                          <textarea
                            value={item.materials || ''}
                            onChange={(e) => updateScheduleItem(index, { materials: e.target.value || undefined })}
                            placeholder="Materialien"
                            rows={2}
                            style={{
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '0.85rem',
                              fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                              resize: 'vertical'
                            }}
                          />
                        </div>
                        
                        <input
                          type="text"
                          value={item.snacks || ''}
                          onChange={(e) => updateScheduleItem(index, { snacks: e.target.value || undefined })}
                          placeholder="Snacks/Getränke"
                          style={{
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                            fontFamily: '"Inter", "Roboto", Arial, sans-serif'
                          }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setEditingIndex(null)}
                            style={{
                              padding: '0.4rem 0.8rem',
                              border: '1px solid #10b981',
                              borderRadius: '4px',
                              backgroundColor: '#10b981',
                              color: '#fff',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              fontFamily: '"Inter", "Roboto", Arial, sans-serif'
                            }}
                          >
                            ✓ Fertig
                          </button>
                          <button
                            onClick={() => removeScheduleItem(index)}
                            style={{
                              padding: '0.4rem',
                              border: 'none',
                              backgroundColor: '#fee2e2',
                              color: '#dc2626',
                              cursor: 'pointer',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Display Mode
                      <div style={{
                        padding: '0.75rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        backgroundColor: '#f9fafb',
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: '0.75rem',
                            color: '#64748b',
                            fontWeight: '600',
                            marginBottom: '0.25rem',
                            fontFamily: '"Inter", "Roboto", Arial, sans-serif'
                          }}>
                            {item.time} {item.delay ? `(+${item.delay}m)` : ''} • {item.type}
                          </div>
                          <div style={{
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            color: '#181818',
                            fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif'
                          }}>
                            {item.title}
                          </div>
                          {(item.speaker || item.location || item.duration) && (
                            <div style={{
                              fontSize: '0.8rem',
                              color: '#6b7280',
                              marginTop: '0.25rem',
                              fontFamily: '"Inter", "Roboto", Arial, sans-serif'
                            }}>
                              {item.speaker && <span>Sprecher: {item.speaker}</span>}
                              {item.speaker && item.location && <span> • </span>}
                              {item.location && <span>Ort: {item.location}</span>}
                              {(item.speaker || item.location) && item.duration && <span> • </span>}
                              {item.duration && <span>Dauer: {item.duration}</span>}
                            </div>
                          )}
                        </div>
                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginRight: '0.5rem' }}>
                                <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Delay</label>
                                <input
                                  type="number"
                                  min={0}
                                  value={typeof item.delay === 'number' ? item.delay : 0}
                                  onChange={(e) => updateScheduleItem(index, { delay: Number(e.target.value) })}
                                  style={{
                                    width: '64px',
                                    padding: '0.25rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    fontSize: '0.85rem',
                                    fontFamily: '"Inter", "Roboto", Arial, sans-serif'
                                  }}
                                  title="Delay in minutes"
                                />
                              </div>
                          <button
                            onClick={() => moveItem(index, 'up')}
                            disabled={index === 0}
                            style={{
                              padding: '0.3rem 0.5rem',
                              border: 'none',
                              borderRadius: '3px',
                              backgroundColor: index === 0 ? '#f3f4f6' : '#fff',
                              color: index === 0 ? '#9ca3af' : '#181818',
                              cursor: index === 0 ? 'not-allowed' : 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveItem(index, 'down')}
                            disabled={index === items.length - 1}
                            style={{
                              padding: '0.3rem 0.5rem',
                              border: 'none',
                              borderRadius: '3px',
                              backgroundColor: index === items.length - 1 ? '#f3f4f6' : '#fff',
                              color: index === items.length - 1 ? '#9ca3af' : '#181818',
                              cursor: index === items.length - 1 ? 'not-allowed' : 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => setEditingIndex(index)}
                            style={{
                              padding: '0.3rem 0.5rem',
                              border: 'none',
                              borderRadius: '3px',
                              backgroundColor: '#fff',
                              color: '#0284c7',
                              cursor: 'pointer'
                            }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => removeScheduleItem(index)}
                            style={{
                              padding: '0.3rem',
                              border: 'none',
                              borderRadius: '3px',
                              backgroundColor: '#fee2e2',
                              color: '#dc2626',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                onClick={() => onSave(items)}
                style={{
                  flex: '1',
                  padding: '0.875rem',
                  border: '2px solid #181818',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '700',
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  backgroundColor: '#fbbf24',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease',
                  boxShadow: '2px 4px 0 #181818'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f59e0b';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '3px 6px 0 #181818';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fbbf24';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '2px 4px 0 #181818';
                }}
              >
                <Save size={16} />
                Speichern
              </button>

              <button
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <X size={16} />
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleManager;
