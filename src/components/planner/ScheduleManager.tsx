import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Clock, 
  GripVertical, 
  Save, 
  X, 
  Users,
  Coffee,
  GamepadIcon,
  Megaphone,
  ArrowRight,
  Edit3,
  Timer
} from 'lucide-react';
import type { ScheduleItem } from '../../types/schedule';
import styles from '../../pages/Admin.module.css';

interface ScheduleManagerProps {
  schedule: ScheduleItem[];
  onSave: (schedule: ScheduleItem[]) => void;
  onCancel: () => void;
}

// Type configuration with colors and icons
const SCHEDULE_TYPES = {
  session: {
    label: 'Session',
    icon: Users,
    color: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af', accent: '#dbeafe' },
    description: 'Vortrag oder Präsentation',
    templates: [
      { title: 'Begrüßung & Willkommen', duration: 15 },
      { title: 'Hauptvortrag', duration: 45 },
      { title: 'Diskussionsrunde', duration: 30 },
      { title: 'Abschlusswort', duration: 10 }
    ]
  },
  workshop: {
    label: 'Workshop',
    icon: Edit3,
    color: { bg: '#fffbeb', border: '#f59e0b', text: '#b45309', accent: '#fef3c7' },
    description: 'Interaktive Aktivität',
    templates: [
      { title: 'Kreativ-Workshop', duration: 60 },
      { title: 'Gruppenarbeit', duration: 45 },
      { title: 'Basteln & Gestalten', duration: 90 },
      { title: 'Teambuilding', duration: 30 }
    ]
  },
  break: {
    label: 'Pause',
    icon: Coffee,
    color: { bg: '#f0fdf4', border: '#10b981', text: '#047857', accent: '#dcfce7' },
    description: 'Erholungspause',
    templates: [
      { title: 'Kaffeepause', duration: 15 },
      { title: 'Mittagspause', duration: 60 },
      { title: 'Snack-Pause', duration: 10 },
      { title: 'Erfrischungspause', duration: 20 }
    ]
  },
  game: {
    label: 'Spiel',
    icon: GamepadIcon,
    color: { bg: '#fef7ff', border: '#ec4899', text: '#be185d', accent: '#fce7f3' },
    description: 'Spiel oder Aktivität',
    templates: [
      { title: 'Kennenlernspiel', duration: 20 },
      { title: 'Energizer', duration: 10 },
      { title: 'Outdoor-Spiel', duration: 45 },
      { title: 'Gruppenspiel', duration: 30 }
    ]
  },
  announcement: {
    label: 'Ansage',
    icon: Megaphone,
    color: { bg: '#f0f9ff', border: '#0ea5e9', text: '#0369a1', accent: '#e0f2fe' },
    description: 'Wichtige Mitteilung',
    templates: [
      { title: 'Tagesplanung', duration: 5 },
      { title: 'Organisatorisches', duration: 10 },
      { title: 'Sicherheitshinweis', duration: 5 },
      { title: 'Nächste Schritte', duration: 10 }
    ]
  },
  transition: {
    label: 'Übergang',
    icon: ArrowRight,
    color: { bg: '#f8fafc', border: '#64748b', text: '#475569', accent: '#f1f5f9' },
    description: 'Wechsel zwischen Aktivitäten',
    templates: [
      { title: 'Raumwechsel', duration: 10 },
      { title: 'Aufräumen', duration: 15 },
      { title: 'Vorbereitung', duration: 10 },
      { title: 'Sammeln & Sortieren', duration: 5 }
    ]
  }
} as const;

// Helper for type labels
const TYPE_LABELS: Record<keyof typeof SCHEDULE_TYPES, string> = {
  session: 'Session',
  workshop: 'Workshop',
  break: 'Pause',
  game: 'Spiel',
  announcement: 'Ansage',
  transition: 'Übergang'
};

// Helper for type colors (simplified access)
const typeColors: Record<keyof typeof SCHEDULE_TYPES, { bg: string; border: string; text: string; icon: string }> = {
  session: { ...SCHEDULE_TYPES.session.color, icon: SCHEDULE_TYPES.session.color.text },
  workshop: { ...SCHEDULE_TYPES.workshop.color, icon: SCHEDULE_TYPES.workshop.color.text },
  break: { ...SCHEDULE_TYPES.break.color, icon: SCHEDULE_TYPES.break.color.text },
  game: { ...SCHEDULE_TYPES.game.color, icon: SCHEDULE_TYPES.game.color.text },
  announcement: { ...SCHEDULE_TYPES.announcement.color, icon: SCHEDULE_TYPES.announcement.color.text },
  transition: { ...SCHEDULE_TYPES.transition.color, icon: SCHEDULE_TYPES.transition.color.text }
};

const ScheduleManager: React.FC<ScheduleManagerProps> = ({ schedule, onSave, onCancel }) => {
  const [items, setItems] = useState<ScheduleItem[]>(schedule);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [selectedType, setSelectedType] = useState<keyof typeof SCHEDULE_TYPES>('session');
  
  // Store original schedule for change detection
  const [originalSchedule] = useState<ScheduleItem[]>(JSON.parse(JSON.stringify(schedule)));

  // Smart time calculation
  const suggestNextTime = () => {
    if (items.length === 0) return '09:00';
    
    const lastItem = items[items.length - 1];
    const [hours, minutes] = lastItem.time.split(':').map(Number);
    
    // Add reasonable duration based on type
    const durations = {
      session: 45, workshop: 60, break: 15, 
      game: 30, announcement: 10, transition: 10
    };
    
    const duration = durations[lastItem.type] || 30;
    const totalMinutes = hours * 60 + minutes + duration;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    
    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
  };

  const createItemFromTemplate = (template: any, type: keyof typeof SCHEDULE_TYPES) => {
    const newItem: ScheduleItem = {
      id: Date.now() + Math.random(),
      time: suggestNextTime(),
      type: type,
      title: template.title
    } as ScheduleItem;
    
    setItems([...items, newItem]);
    setShowAddMenu(false);
    setEditingIndex(items.length);
  };

  const addCustomItem = () => {
    const newItem: ScheduleItem = {
      id: Date.now() + Math.random(),
      time: suggestNextTime(),
      type: selectedType,
      title: ''
    } as ScheduleItem;
    
    setItems([...items, newItem]);
    setShowAddMenu(false);
    setEditingIndex(items.length);
  };

  const addItem = () => {
    setShowAddMenu(true);
  };

  const updateItem = (index: number, updates: Partial<ScheduleItem>) => {
    const newItems = [...items];
    const currentItem = newItems[index];
    const originalItem = originalSchedule.find(orig => orig.id === currentItem.id);
    
    // Check for time changes
    if (updates.time && originalItem && updates.time !== originalItem.time) {
      updates.timeChanged = true;
      updates.originalTime = originalItem.time;
    } else if (updates.time && originalItem && updates.time === originalItem.time) {
      updates.timeChanged = false;
      updates.originalTime = undefined;
    }
    
    newItems[index] = { ...newItems[index], ...updates };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === items.length - 1)) return;
    
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    
    // Update editing index if needed
    if (editingIndex === index) setEditingIndex(targetIndex);
    else if (editingIndex === targetIndex) setEditingIndex(index);
    
    setItems(newItems);
  };



  // Enhanced Template Selector Component
  const TemplateSelector = () => (
    <div className={styles.adminCard} style={{
      position: 'absolute',
      top: '100%',
      left: '0',
      right: '0',
      marginTop: '0.5rem',
      zIndex: 100,
      maxHeight: '80vh',
      overflow: 'auto',
      background: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)'
    }}>
      <div className={styles.tape} aria-hidden="true" />
      
      {/* Type Selector */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '2px solid #f1f5f9'
      }}>
        <h3 style={{
          margin: '0 0 1rem 0',
          fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
          fontSize: '1.2rem',
          color: '#1f2937'
        }}>
          Was möchtest du hinzufügen?
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.75rem'
        }}>
          {Object.entries(SCHEDULE_TYPES).map(([key, config]) => {
            const TypeIcon = config.icon;
            const isSelected = selectedType === key;
            
            return (
              <button
                key={key}
                onClick={() => setSelectedType(key as keyof typeof SCHEDULE_TYPES)}
                style={{
                  padding: '1rem 0.75rem',
                  border: `3px solid ${isSelected ? config.color.border : '#e5e7eb'}`,
                  borderRadius: '12px',
                  background: isSelected ? config.color.bg : '#fff',
                  color: isSelected ? config.color.text : '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center',
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  boxShadow: isSelected ? `0 4px 0 ${config.color.border}` : '0 2px 0 #e5e7eb',
                  transform: isSelected ? 'translateY(-2px)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = config.color.border;
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = `0 3px 0 ${config.color.border}`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 0 #e5e7eb';
                  }
                }}
              >
                <TypeIcon size={24} style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>{config.label}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>
                  {config.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Templates for selected type */}
      <div style={{ padding: '1.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem'
        }}>
          <h4 style={{
            margin: 0,
            fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
            fontSize: '1.1rem',
            color: SCHEDULE_TYPES[selectedType].color.text
          }}>
            {SCHEDULE_TYPES[selectedType].label}-Vorlagen
          </h4>
          <button
            onClick={addCustomItem}
            style={{
              padding: '0.5rem 1rem',
              border: `2px solid ${SCHEDULE_TYPES[selectedType].color.border}`,
              borderRadius: '8px',
              background: '#fff',
              color: SCHEDULE_TYPES[selectedType].color.text,
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: '"Inter", "Roboto", Arial, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Plus size={14} />
            Eigener {SCHEDULE_TYPES[selectedType].label}
          </button>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.75rem'
        }}>
          {SCHEDULE_TYPES[selectedType].templates.map((template, idx) => (
            <button
              key={idx}
              onClick={() => createItemFromTemplate(template, selectedType)}
              style={{
                padding: '1rem',
                border: `2px solid ${SCHEDULE_TYPES[selectedType].color.border}`,
                borderRadius: '10px',
                background: SCHEDULE_TYPES[selectedType].color.accent,
                color: SCHEDULE_TYPES[selectedType].color.text,
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                transition: 'all 0.2s ease',
                boxShadow: `0 2px 0 ${SCHEDULE_TYPES[selectedType].color.border}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 4px 0 ${SCHEDULE_TYPES[selectedType].color.border}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 2px 0 ${SCHEDULE_TYPES[selectedType].color.border}`;
              }}
            >
              <div style={{
                fontSize: '1rem',
                fontWeight: '700',
                marginBottom: '0.25rem'
              }}>
                {template.title}
              </div>
              <div style={{
                fontSize: '0.8rem',
                opacity: 0.8,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <Timer size={12} />
                ~{template.duration} Min
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Close button */}
      <div style={{ padding: '1rem', textAlign: 'center', borderTop: '2px solid #f1f5f9' }}>
        <button
          onClick={() => setShowAddMenu(false)}
          style={{
            padding: '0.5rem 1rem',
            border: '2px solid #64748b',
            borderRadius: '8px',
            background: '#fff',
            color: '#64748b',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: '"Inter", "Roboto", Arial, sans-serif'
          }}
        >
          Abbrechen
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Add Menu Overlay */}
      {showAddMenu && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{ maxWidth: '600px', width: '100%' }}>
            <TemplateSelector />
          </div>
        </div>
      )}
      
      {/* Main Schedule Manager Content */}
      <div className={styles.adminCard} style={{
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        transform: 'rotate(0deg)',
        background: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)',
        border: '3px solid var(--color-ink)',
        boxShadow: '0 6px 20px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.05)'
      }}>
        <div className={styles.tape} aria-hidden="true" />
        
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '2px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#1e40af',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Clock size={24} />
            Termine verwalten
          </h2>
          <div style={{ position: 'relative' }}>
            <button
              onClick={addItem}
              style={{
                padding: '0.75rem 1.25rem',
                border: '3px solid #10b981',
                borderRadius: '1rem 1.2rem 0.9rem 1.1rem',
                fontSize: '1rem',
                fontWeight: '700',
                fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                backgroundColor: '#10b981',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '3px 6px 0 #047857',
                transition: 'all 0.2s ease',
                transform: 'rotate(-0.5deg)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'rotate(-0.5deg) translateY(-2px)';
                e.currentTarget.style.boxShadow = '4px 8px 0 #047857';
                e.currentTarget.style.backgroundColor = '#059669';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'rotate(-0.5deg) translateY(0)';
                e.currentTarget.style.boxShadow = '3px 6px 0 #047857';
                e.currentTarget.style.backgroundColor = '#10b981';
              }}
            >
              <Plus size={18} strokeWidth={2.5} />
              Neuer Termin
            </button>
          </div>
        </div>

        {/* Schedule Items */}
        <div style={{
          minHeight: '300px',
          maxHeight: '500px',
          overflow: 'auto',
          padding: '1rem'
        }}>
          {items.length === 0 ? (
            <div style={{
              padding: '3rem',
              textAlign: 'center',
              color: '#9ca3af',
              fontFamily: '"Inter", "Roboto", Arial, sans-serif'
            }}>
              <Clock size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Noch keine Termine</p>
              <p style={{ fontSize: '0.9rem' }}>Klicke auf "Neu" um den ersten Termin hinzuzufügen</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {items.map((item, index) => {
                const colors = typeColors[item.type];
                const isEditing = editingIndex === index;

                return (
                  <div
                    key={item.id}
                    style={{
                      border: `2px solid ${colors.border}`,
                      borderRadius: '8px',
                      backgroundColor: isEditing ? '#fff' : colors.bg,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isEditing ? (
                      // Editing Mode
                      <div style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <div style={{ flex: '0 0 auto' }}>
                              <label style={{
                                display: 'block',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                color: '#64748b',
                                marginBottom: '0.25rem',
                                fontFamily: '"Inter", "Roboto", Arial, sans-serif'
                              }}>
                                Uhrzeit
                              </label>
                              <input
                                type="time"
                                value={item.time}
                                onChange={(e) => updateItem(index, { time: e.target.value })}
                                style={{
                                  width: '110px',
                                  padding: '0.5rem',
                                  border: '2px solid #d1d5db',
                                  borderRadius: '6px',
                                  fontSize: '0.95rem',
                                  fontFamily: '"Inter", "Roboto", Arial, sans-serif'
                                }}
                              />
                            </div>
                            <div style={{ flex: '0 0 auto', minWidth: '140px' }}>
                              <label style={{
                                display: 'block',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                color: '#64748b',
                                marginBottom: '0.25rem',
                                fontFamily: '"Inter", "Roboto", Arial, sans-serif'
                              }}>
                                Typ
                              </label>
                              <select
                                value={item.type}
                                onChange={(e) => updateItem(index, { type: e.target.value as any })}
                                style={{
                                  width: '100%',
                                  padding: '0.5rem',
                                  border: '2px solid #d1d5db',
                                  borderRadius: '6px',
                                  fontSize: '0.95rem',
                                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                                  backgroundColor: '#fff'
                                }}
                              >
                                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                                  <option key={value} value={value}>{label}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label style={{
                              display: 'block',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              color: '#64748b',
                              marginBottom: '0.25rem',
                              fontFamily: '"Inter", "Roboto", Arial, sans-serif'
                            }}>
                              Titel *
                            </label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => updateItem(index, { title: e.target.value })}
                              placeholder="z.B. Begrüßung & Kennenlernen"
                              autoFocus
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '2px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '0.95rem',
                                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                                boxSizing: 'border-box'
                              }}
                            />
                          </div>
                          
                          {/* Type-specific fields */}
                          {(item.type === 'session' || item.type === 'workshop') && (
                            <>
                              <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <div style={{ flex: 1 }}>
                                  <label style={{
                                    display: 'block',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    color: '#64748b',
                                    marginBottom: '0.25rem',
                                    fontFamily: '"Inter", "Roboto", Arial, sans-serif'
                                  }}>
                                    {item.type === 'session' ? 'Sprecher' : 'Leiter'}
                                  </label>
                                  <input
                                    type="text"
                                    value={(item as any).speaker || ''}
                                    onChange={(e) => updateItem(index, { speaker: e.target.value })}
                                    placeholder="Name"
                                    style={{
                                      width: '100%',
                                      padding: '0.5rem',
                                      border: '2px solid #d1d5db',
                                      borderRadius: '6px',
                                      fontSize: '0.95rem',
                                      fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                                      boxSizing: 'border-box'
                                    }}
                                  />
                                </div>
                                <div style={{ flex: 1 }}>
                                  <label style={{
                                    display: 'block',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    color: '#64748b',
                                    marginBottom: '0.25rem',
                                    fontFamily: '"Inter", "Roboto", Arial, sans-serif'
                                  }}>
                                    Ort
                                  </label>
                                  <input
                                    type="text"
                                    value={(item as any).location || ''}
                                    onChange={(e) => updateItem(index, { location: e.target.value })}
                                    placeholder="Raum/Ort"
                                    style={{
                                      width: '100%',
                                      padding: '0.5rem',
                                      border: '2px solid #d1d5db',
                                      borderRadius: '6px',
                                      fontSize: '0.95rem',
                                      fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                                      boxSizing: 'border-box'
                                    }}
                                  />
                                </div>
                              </div>
                              {item.type === 'workshop' && (
                                <div>
                                  <label style={{
                                    display: 'block',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    color: '#64748b',
                                    marginBottom: '0.25rem',
                                    fontFamily: '"Inter", "Roboto", Arial, sans-serif'
                                  }}>
                                    Materialien
                                  </label>
                                  <input
                                    type="text"
                                    value={(item as any).materials || ''}
                                    onChange={(e) => updateItem(index, { materials: e.target.value })}
                                    placeholder="z.B. Stifte, Papier"
                                    style={{
                                      width: '100%',
                                      padding: '0.5rem',
                                      border: '2px solid #d1d5db',
                                      borderRadius: '6px',
                                      fontSize: '0.95rem',
                                      fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                                      boxSizing: 'border-box'
                                    }}
                                  />
                                </div>
                              )}
                              <div>
                                <label style={{
                                  display: 'block',
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                  color: '#64748b',
                                  marginBottom: '0.25rem',
                                  fontFamily: '"Inter", "Roboto", Arial, sans-serif'
                                }}>
                                  Details
                                </label>
                                <textarea
                                  value={(item as any).details || ''}
                                  onChange={(e) => updateItem(index, { details: e.target.value })}
                                  placeholder="Zusätzliche Informationen"
                                  rows={2}
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '2px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '0.95rem',
                                    fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                                    boxSizing: 'border-box',
                                    resize: 'vertical'
                                  }}
                                />
                              </div>
                            </>
                          )}

                          {item.type === 'break' && (
                            <>
                              <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <div style={{ flex: 1 }}>
                                  <label style={{
                                    display: 'block',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    color: '#64748b',
                                    marginBottom: '0.25rem',
                                    fontFamily: '"Inter", "Roboto", Arial, sans-serif'
                                  }}>
                                    Dauer
                                  </label>
                                  <input
                                    type="text"
                                    value={(item as any).duration || ''}
                                    onChange={(e) => updateItem(index, { duration: e.target.value })}
                                    placeholder="z.B. 15 Min"
                                    style={{
                                      width: '100%',
                                      padding: '0.5rem',
                                      border: '2px solid #d1d5db',
                                      borderRadius: '6px',
                                      fontSize: '0.95rem',
                                      fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                                      boxSizing: 'border-box'
                                    }}
                                  />
                                </div>
                                <div style={{ flex: 1 }}>
                                  <label style={{
                                    display: 'block',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    color: '#64748b',
                                    marginBottom: '0.25rem',
                                    fontFamily: '"Inter", "Roboto", Arial, sans-serif'
                                  }}>
                                    Snacks
                                  </label>
                                  <input
                                    type="text"
                                    value={(item as any).snacks || ''}
                                    onChange={(e) => updateItem(index, { snacks: e.target.value })}
                                    placeholder="z.B. Obst & Getränke"
                                    style={{
                                      width: '100%',
                                      padding: '0.5rem',
                                      border: '2px solid #d1d5db',
                                      borderRadius: '6px',
                                      fontSize: '0.95rem',
                                      fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                                      boxSizing: 'border-box'
                                    }}
                                  />
                                </div>
                              </div>
                            </>
                          )}

                          {item.type === 'game' && (
                            <>
                              <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <div style={{ flex: 1 }}>
                                  <label style={{
                                    display: 'block',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    color: '#64748b',
                                    marginBottom: '0.25rem',
                                    fontFamily: '"Inter", "Roboto", Arial, sans-serif'
                                  }}>
                                    Spielleiter
                                  </label>
                                  <input
                                    type="text"
                                    value={(item as any).facilitator || ''}
                                    onChange={(e) => updateItem(index, { facilitator: e.target.value })}
                                    placeholder="Name"
                                    style={{
                                      width: '100%',
                                      padding: '0.5rem',
                                      border: '2px solid #d1d5db',
                                      borderRadius: '6px',
                                      fontSize: '0.95rem',
                                      fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                                      boxSizing: 'border-box'
                                    }}
                                  />
                                </div>
                                <div style={{ flex: 1 }}>
                                  <label style={{
                                    display: 'block',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    color: '#64748b',
                                    marginBottom: '0.25rem',
                                    fontFamily: '"Inter", "Roboto", Arial, sans-serif'
                                  }}>
                                    Ort
                                  </label>
                                  <input
                                    type="text"
                                    value={(item as any).location || ''}
                                    onChange={(e) => updateItem(index, { location: e.target.value })}
                                    placeholder="Raum/Ort"
                                    style={{
                                      width: '100%',
                                      padding: '0.5rem',
                                      border: '2px solid #d1d5db',
                                      borderRadius: '6px',
                                      fontSize: '0.95rem',
                                      fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                                      boxSizing: 'border-box'
                                    }}
                                  />
                                </div>
                              </div>
                              <div>
                                <label style={{
                                  display: 'block',
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                  color: '#64748b',
                                  marginBottom: '0.25rem',
                                  fontFamily: '"Inter", "Roboto", Arial, sans-serif'
                                }}>
                                  Materialien
                                </label>
                                <input
                                  type="text"
                                  value={(item as any).materials || ''}
                                  onChange={(e) => updateItem(index, { materials: e.target.value })}
                                  placeholder="z.B. Ball, Seile"
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '2px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '0.95rem',
                                    fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                                    boxSizing: 'border-box'
                                  }}
                                />
                              </div>
                              <div>
                                <label style={{
                                  display: 'block',
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                  color: '#64748b',
                                  marginBottom: '0.25rem',
                                  fontFamily: '"Inter", "Roboto", Arial, sans-serif'
                                }}>
                                  Details
                                </label>
                                <textarea
                                  value={(item as any).details || ''}
                                  onChange={(e) => updateItem(index, { details: e.target.value })}
                                  placeholder="Spielregeln oder Hinweise"
                                  rows={2}
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '2px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '0.95rem',
                                    fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                                    boxSizing: 'border-box',
                                    resize: 'vertical'
                                  }}
                                />
                              </div>
                            </>
                          )}

                          {item.type === 'announcement' && (
                            <div>
                              <label style={{
                                display: 'block',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                color: '#64748b',
                                marginBottom: '0.25rem',
                                fontFamily: '"Inter", "Roboto", Arial, sans-serif'
                              }}>
                                Details
                              </label>
                              <textarea
                                value={(item as any).details || ''}
                                onChange={(e) => updateItem(index, { details: e.target.value })}
                                placeholder="Details zur Ansage"
                                rows={2}
                                style={{
                                  width: '100%',
                                  padding: '0.5rem',
                                  border: '2px solid #d1d5db',
                                  borderRadius: '6px',
                                  fontSize: '0.95rem',
                                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                                  boxSizing: 'border-box',
                                  resize: 'vertical'
                                }}
                              />
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                            <button
                              onClick={() => setEditingIndex(null)}
                              style={{
                                padding: '0.75rem 1.5rem',
                                border: '2px solid #10b981',
                                borderRadius: '0.75rem 0.9rem 0.7rem 0.8rem',
                                fontSize: '0.9rem',
                                fontWeight: '700',
                                backgroundColor: '#10b981',
                                color: '#ffffff',
                                cursor: 'pointer',
                                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                                boxShadow: '2px 4px 0 #047857',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#059669';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '3px 6px 0 #047857';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#10b981';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '2px 4px 0 #047857';
                              }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              Speichern
                            </button>
                            <button
                              onClick={() => removeItem(index)}
                              style={{
                                padding: '0.75rem 1rem',
                                border: '2px solid #ef4444',
                                borderRadius: '0.8rem 0.7rem 0.9rem 0.75rem',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                backgroundColor: '#fef2f2',
                                color: '#dc2626',
                                cursor: 'pointer',
                                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                                boxShadow: '2px 4px 0 #ef4444',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#fee2e2';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '3px 6px 0 #ef4444';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#fef2f2';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '2px 4px 0 #ef4444';
                              }}
                            >
                              <Trash2 size={16} />
                              Löschen
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Display Mode
                      <div style={{
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}>
                        <button
                          style={{
                            padding: '0.25rem',
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: colors.icon,
                            cursor: 'grab',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.25rem'
                          }}
                          onMouseDown={(e) => e.currentTarget.style.cursor = 'grabbing'}
                          onMouseUp={(e) => e.currentTarget.style.cursor = 'grab'}
                        >
                          <GripVertical size={16} />
                        </button>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: colors.icon,
                            marginBottom: '0.25rem',
                            fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            {item.time} • {TYPE_LABELS[item.type]}
                          </div>
                          <div style={{
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#181818',
                            fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif'
                          }}>
                            {item.title || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Kein Titel</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => moveItem(index, 'up')}
                            disabled={index === 0}
                            style={{
                              padding: '0.4rem',
                              border: 'none',
                              borderRadius: '4px',
                              backgroundColor: index === 0 ? '#f3f4f6' : '#fff',
                              color: index === 0 ? '#9ca3af' : colors.icon,
                              cursor: index === 0 ? 'not-allowed' : 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: '600'
                            }}
                            title="Nach oben"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveItem(index, 'down')}
                            disabled={index === items.length - 1}
                            style={{
                              padding: '0.4rem',
                              border: 'none',
                              borderRadius: '4px',
                              backgroundColor: index === items.length - 1 ? '#f3f4f6' : '#fff',
                              color: index === items.length - 1 ? '#9ca3af' : colors.icon,
                              cursor: index === items.length - 1 ? 'not-allowed' : 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: '600'
                            }}
                            title="Nach unten"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => setEditingIndex(index)}
                            style={{
                              padding: '0.4rem 0.6rem',
                              border: 'none',
                              borderRadius: '4px',
                              backgroundColor: '#fff',
                              color: colors.icon,
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              fontWeight: '600'
                            }}
                            title="Bearbeiten"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => removeItem(index)}
                            style={{
                              padding: '0.4rem',
                              border: 'none',
                              borderRadius: '4px',
                              backgroundColor: '#fee2e2',
                              color: '#dc2626',
                              cursor: 'pointer'
                            }}
                            title="Löschen"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '1rem',
          borderTop: '2px solid #e5e7eb',
          display: 'flex',
          gap: '0.75rem',
          backgroundColor: '#f9fafb'
        }}>
          <button
            onClick={() => onSave(items)}
            style={{
              flex: 1,
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
              boxShadow: '2px 4px 0 #181818'
            }}
          >
            <Save size={16} />
            Speichern
          </button>
          <button
            onClick={onCancel}
            style={{
              padding: '0.875rem 1.5rem',
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
              gap: '0.5rem'
            }}
          >
            <X size={16} />
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleManager;
