import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, Save, X, Edit2, ChevronUp, ChevronDown, GripVertical, MapPin, User, Timer, Coffee, Check, FileText, Gamepad2, Megaphone, ArrowRight, Wrench, PauseCircle } from 'lucide-react';
import type { ScheduleItem } from '../../types/schedule';
import styles from '../../pages/Admin.module.css';
import FlipchartBackground from '../layout/FlipchartBackground';

interface ScheduleManagerProps {
  schedule: ScheduleItem[];
  onSave: (schedule: ScheduleItem[]) => void;
  onCancel: () => void;
}

// Type badge colors for visual distinction
const typeColors: Record<string, { bg: string; border: string; text: string }> = {
  session: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
  workshop: { bg: '#fae8ff', border: '#d946ef', text: '#86198f' },
  break: { bg: '#dcfce7', border: '#22c55e', text: '#166534' },
  game: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
  announcement: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
  transition: { bg: '#f1f5f9', border: '#64748b', text: '#334155' },
};

// Type icons using Lucide components
const typeIcons: Record<string, React.ReactNode> = {
  session: <FileText size={14} />,
  workshop: <Wrench size={14} />,
  break: <PauseCircle size={14} />,
  game: <Gamepad2 size={14} />,
  announcement: <Megaphone size={14} />,
  transition: <ArrowRight size={14} />,
};

const typeLabels: Record<string, string> = {
  session: 'Session',
  workshop: 'Workshop',
  break: 'Pause',
  game: 'Spiel',
  announcement: 'Ansage',
  transition: 'Übergang',
};

const ScheduleManager: React.FC<ScheduleManagerProps> = ({ schedule, onSave, onCancel }) => {
  const [items, setItems] = useState<ScheduleItem[]>(schedule);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});

  // Keep local items in sync if parent passes a different schedule prop
  useEffect(() => {
    setItems(schedule || []);
  }, [schedule]);

  const toggleSection = (index: number) => {
    setExpandedSections(prev => ({ ...prev, [index]: !prev[index] }));
  };

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
    <div className={styles.adminWrapper} role="main" aria-label="Termine verwalten">
      <FlipchartBackground />
      <main className={styles.adminContent}>
        <div style={{ 
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          padding: '2rem 1rem',
        }}>
          <div style={{ 
            width: '100%', 
            maxWidth: '700px',
          }}>
            <div className={styles.adminCard} style={{ width: '100%' }}>
              <div className={styles.tape} aria-hidden="true"></div>
              
              <h2 className={styles.cardTitle}>
                <Clock size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                Termine verwalten
              </h2>

              <div className={styles.cardContent}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* Schedule Items Header */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    background: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                  }}>
                    <div>
                      <span style={{ 
                        fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: '#1e293b'
                      }}>
                        Zeitplan
                      </span>
                      <span style={{
                        marginLeft: '0.5rem',
                        padding: '0.2rem 0.6rem',
                        background: '#e0f2fe',
                        color: '#0369a1',
                        borderRadius: '999px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                      }}>
                        {items.length} {items.length === 1 ? 'Termin' : 'Termine'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={addScheduleItem}
                      style={{
                        padding: '0.6rem 1rem',
                        border: '2px solid #059669',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: '700',
                        fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                        backgroundColor: '#10b981',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 4px rgba(16, 185, 129, 0.25)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#059669';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#10b981';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.25)';
                      }}
                    >
                      <Plus size={18} />
                      Neuer Termin
                    </button>
                  </div>

                  {/* Schedule Items List */}
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '0.75rem',
                    padding: '0.25rem',
                  }}>
                    {items.length === 0 ? (
                      <div style={{
                        padding: '3rem 1.5rem',
                        textAlign: 'center',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        border: '2px dashed #cbd5e1',
                      }}>
                        <div style={{
                          width: '56px',
                          height: '56px',
                          margin: '0 auto 1rem',
                          background: '#e0f2fe',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Clock size={28} color="#0284c7" />
                        </div>
                        <div style={{
                          color: '#475569',
                          fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                          fontSize: '1rem',
                          fontWeight: 600,
                          marginBottom: '0.5rem',
                        }}>
                          Noch keine Termine
                        </div>
                        <div style={{
                          color: '#94a3b8',
                          fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                          fontSize: '0.9rem',
                        }}>
                          Klicke auf "Neuer Termin" um deinen ersten Programmpunkt hinzuzufügen.
                        </div>
                      </div>
              ) : (
                items.map((item, index) => {
                  const colors = typeColors[item.type] || typeColors.session;
                  const isExpanded = expandedSections[index];
                  
                  return (
                  <div key={index}>
                    {editingIndex === index ? (
                      // Editing Mode - Clean card layout
                      <div style={{
                        padding: '1.25rem',
                        border: '2px solid #3b82f6',
                        borderRadius: '12px',
                        backgroundColor: '#f8fafc',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                      }}>
                        {/* Header Row - Essential info */}
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '100px 1fr 140px', 
                          gap: '0.75rem',
                          alignItems: 'center'
                        }}>
                          <div>
                            <label style={{ 
                              display: 'block', 
                              fontSize: '0.7rem', 
                              fontWeight: 600, 
                              color: '#64748b',
                              marginBottom: '0.25rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>Uhrzeit</label>
                            <input
                              type="time"
                              value={item.time}
                              onChange={(e) => updateScheduleItem(index, { time: e.target.value })}
                              style={{
                                width: '100%',
                                padding: '0.6rem',
                                border: '2px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                                background: '#fff',
                              }}
                            />
                          </div>
                          <div>
                            <label style={{ 
                              display: 'block', 
                              fontSize: '0.7rem', 
                              fontWeight: 600, 
                              color: '#64748b',
                              marginBottom: '0.25rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>Titel</label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => updateScheduleItem(index, { title: e.target.value })}
                              placeholder="z.B. Begrüßung & Vorstellung"
                              autoFocus
                              style={{
                                width: '100%',
                                padding: '0.6rem',
                                border: '2px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '0.95rem',
                                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                                background: '#fff',
                              }}
                            />
                          </div>
                          <div>
                            <label style={{ 
                              display: 'block', 
                              fontSize: '0.7rem', 
                              fontWeight: 600, 
                              color: '#64748b',
                              marginBottom: '0.25rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>Typ</label>
                            <select
                              value={item.type}
                              onChange={(e) => updateScheduleItem(index, { type: e.target.value as any })}
                              style={{
                                width: '100%',
                                padding: '0.6rem',
                                border: '2px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                                background: '#fff',
                                cursor: 'pointer',
                              }}
                            >
                              <option value="session">Session</option>
                              <option value="workshop">Workshop</option>
                              <option value="break">Pause</option>
                              <option value="game">Spiel</option>
                              <option value="announcement">Ansage</option>
                              <option value="transition">Übergang</option>
                            </select>
                          </div>
                        </div>
                        
                        {/* Toggle for additional fields */}
                        <button
                          type="button"
                          onClick={() => toggleSection(index)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 0.75rem',
                            border: 'none',
                            background: 'transparent',
                            color: '#3b82f6',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                          }}
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          {isExpanded ? 'Weniger Details' : 'Mehr Details hinzufügen'}
                        </button>

                        {/* Expandable additional fields */}
                        {isExpanded && (
                          <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '0.75rem',
                            padding: '1rem',
                            background: '#fff',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                          }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                              <div>
                                <label style={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  fontSize: '0.75rem', 
                                  fontWeight: 600, 
                                  color: '#64748b',
                                  marginBottom: '0.25rem'
                                }}>
                                  <User size={12} /> Sprecher / Leitung
                                </label>
                                <input
                                  type="text"
                                  value={item.speaker || ''}
                                  onChange={(e) => updateScheduleItem(index, { speaker: e.target.value || undefined })}
                                  placeholder="Name eingeben"
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1.5px solid #e2e8f0',
                                    borderRadius: '6px',
                                    fontSize: '0.9rem',
                                    fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                                  }}
                                />
                              </div>
                              <div>
                                <label style={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  fontSize: '0.75rem', 
                                  fontWeight: 600, 
                                  color: '#64748b',
                                  marginBottom: '0.25rem'
                                }}>
                                  <MapPin size={12} /> Ort / Raum
                                </label>
                                <input
                                  type="text"
                                  value={item.location || ''}
                                  onChange={(e) => updateScheduleItem(index, { location: e.target.value || undefined })}
                                  placeholder="z.B. Großer Saal"
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1.5px solid #e2e8f0',
                                    borderRadius: '6px',
                                    fontSize: '0.9rem',
                                    fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                                  }}
                                />
                              </div>
                              <div>
                                <label style={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  fontSize: '0.75rem', 
                                  fontWeight: 600, 
                                  color: '#64748b',
                                  marginBottom: '0.25rem'
                                }}>
                                  <Timer size={12} /> Dauer
                                </label>
                                <input
                                  type="text"
                                  value={item.duration || ''}
                                  onChange={(e) => updateScheduleItem(index, { duration: e.target.value || undefined })}
                                  placeholder="z.B. 45 min"
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1.5px solid #e2e8f0',
                                    borderRadius: '6px',
                                    fontSize: '0.9rem',
                                    fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                                  }}
                                />
                              </div>
                              <div>
                                <label style={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  fontSize: '0.75rem', 
                                  fontWeight: 600, 
                                  color: '#64748b',
                                  marginBottom: '0.25rem'
                                }}>
                                  <Coffee size={12} /> Snacks / Getränke
                                </label>
                                <input
                                  type="text"
                                  value={item.snacks || ''}
                                  onChange={(e) => updateScheduleItem(index, { snacks: e.target.value || undefined })}
                                  placeholder="z.B. Kaffee & Kuchen"
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1.5px solid #e2e8f0',
                                    borderRadius: '6px',
                                    fontSize: '0.9rem',
                                    fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                                  }}
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label style={{ 
                                display: 'block',
                                fontSize: '0.75rem', 
                                fontWeight: 600, 
                                color: '#64748b',
                                marginBottom: '0.25rem'
                              }}>
                                Details / Beschreibung
                              </label>
                              <textarea
                                value={item.details || ''}
                                onChange={(e) => updateScheduleItem(index, { details: e.target.value || undefined })}
                                placeholder="Optionale zusätzliche Informationen..."
                                rows={2}
                                style={{
                                  width: '100%',
                                  padding: '0.5rem',
                                  border: '1.5px solid #e2e8f0',
                                  borderRadius: '6px',
                                  fontSize: '0.9rem',
                                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                                  resize: 'vertical',
                                }}
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Action buttons */}
                        <div style={{ 
                          display: 'flex', 
                          gap: '0.5rem', 
                          justifyContent: 'space-between',
                          paddingTop: '0.5rem',
                          borderTop: '1px solid #e2e8f0',
                        }}>
                          <button
                            onClick={() => removeScheduleItem(index)}
                            style={{
                              padding: '0.5rem 0.75rem',
                              border: '1.5px solid #fecaca',
                              borderRadius: '6px',
                              backgroundColor: '#fef2f2',
                              color: '#dc2626',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                            }}
                          >
                            <Trash2 size={14} />
                            Löschen
                          </button>
                          <button
                            onClick={() => setEditingIndex(null)}
                            style={{
                              padding: '0.5rem 1.25rem',
                              border: '2px solid #059669',
                              borderRadius: '6px',
                              backgroundColor: '#10b981',
                              color: '#fff',
                              fontSize: '0.9rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
                            }}
                          >
                            ✓ Fertig
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Display Mode - Clean compact card
                      <div style={{
                        padding: '0.875rem 1rem',
                        border: `2px solid ${colors.border}`,
                        borderRadius: '10px',
                        backgroundColor: colors.bg,
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      >
                        {/* Drag handle and time */}
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          flexShrink: 0,
                        }}>
                          <GripVertical size={16} color="#94a3b8" style={{ cursor: 'grab' }} />
                          <div style={{
                            padding: '0.35rem 0.6rem',
                            background: '#fff',
                            borderRadius: '6px',
                            border: '1.5px solid #e2e8f0',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            color: '#1e293b',
                            fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                            minWidth: '60px',
                            textAlign: 'center',
                          }}>
                            {item.time}
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{
                              fontSize: '0.95rem',
                              fontWeight: 600,
                              color: '#1e293b',
                              fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                            }}>
                              {item.title}
                            </span>
                            <span style={{
                              padding: '0.15rem 0.5rem',
                              borderRadius: '999px',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              background: colors.bg,
                              color: colors.text,
                              border: `1px solid ${colors.border}`,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}>
                              {typeIcons[item.type]}
                              {typeLabels[item.type] || item.type}
                            </span>
                            {item.delay && item.delay > 0 && (
                              <span style={{
                                padding: '0.15rem 0.4rem',
                                borderRadius: '999px',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                background: '#fef3c7',
                                color: '#92400e',
                                border: '1px solid #fbbf24',
                              }}>
                                +{item.delay}m
                              </span>
                            )}
                          </div>
                          {(item.speaker || item.location || item.duration) && (
                            <div style={{
                              fontSize: '0.8rem',
                              color: '#64748b',
                              marginTop: '0.25rem',
                              fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                              display: 'flex',
                              gap: '0.75rem',
                              flexWrap: 'wrap',
                            }}>
                              {item.speaker && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <User size={12} /> {item.speaker}
                                </span>
                              )}
                              {item.location && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <MapPin size={12} /> {item.location}
                                </span>
                              )}
                              {item.duration && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <Timer size={12} /> {item.duration}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Actions */}
                        <div style={{ 
                          display: 'flex', 
                          gap: '0.25rem', 
                          alignItems: 'center',
                          flexShrink: 0,
                        }}>
                          <button
                            onClick={() => moveItem(index, 'up')}
                            disabled={index === 0}
                            style={{
                              padding: '0.4rem',
                              border: 'none',
                              borderRadius: '6px',
                              backgroundColor: index === 0 ? 'transparent' : '#fff',
                              color: index === 0 ? '#cbd5e1' : '#64748b',
                              cursor: index === 0 ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title="Nach oben"
                          >
                            <ChevronUp size={18} />
                          </button>
                          <button
                            onClick={() => moveItem(index, 'down')}
                            disabled={index === items.length - 1}
                            style={{
                              padding: '0.4rem',
                              border: 'none',
                              borderRadius: '6px',
                              backgroundColor: index === items.length - 1 ? 'transparent' : '#fff',
                              color: index === items.length - 1 ? '#cbd5e1' : '#64748b',
                              cursor: index === items.length - 1 ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title="Nach unten"
                          >
                            <ChevronDown size={18} />
                          </button>
                          <button
                            onClick={() => setEditingIndex(index)}
                            style={{
                              padding: '0.4rem',
                              border: 'none',
                              borderRadius: '6px',
                              backgroundColor: '#fff',
                              color: '#3b82f6',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title="Bearbeiten"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => removeScheduleItem(index)}
                            style={{
                              padding: '0.4rem',
                              border: 'none',
                              borderRadius: '6px',
                              backgroundColor: '#fef2f2',
                              color: '#dc2626',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title="Löschen"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
              )}
            </div>

            {/* Action Buttons */}
            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                onClick={() => onSave(items)}
                style={{
                  flex: '1',
                  padding: '0.875rem',
                  border: '2px solid #059669',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '700',
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  backgroundColor: '#10b981',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#059669';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#10b981';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.3)';
                }}
              >
                <Check size={18} />
                Speichern
              </button>

              <button
                onClick={onCancel}
                style={{
                  padding: '0.875rem 1rem',
                  border: '2px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  backgroundColor: '#f8fafc',
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
                  e.currentTarget.style.borderColor = '#94a3b8';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <X size={18} />
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
        </div>
      </main>
    </div>
  );
};

export default ScheduleManager;
