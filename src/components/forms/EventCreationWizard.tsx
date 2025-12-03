import React, { useState } from 'react';
import styles from '../../pages/Admin.module.css';
import { api } from '../../lib/api';
import type { Event, DayPlan } from '../../types/event';
import type { ScheduleItem } from '../../types/schedule';
import { Calendar, ChevronLeft, CheckCircle, ArrowRight, Users, Clock } from 'lucide-react';
import EventForm from './EventForm';
import DayPlanForm from './DayPlanForm';
import ScheduleManager from '../planner/ScheduleManager';

interface Props {
  organizationId: string;
  onClose: () => void;
  onCreated: (event: Event) => void;
}

const WIZARD_STEPS = [
  { 
    title: 'Veranstaltung', 
    icon: Users,
    description: 'Grundlegende Informationen zur Veranstaltung definieren'
  },
  { 
    title: 'Tagesplan', 
    icon: Calendar,
    description: 'Datum und Name für den Tagesplan festlegen'
  },
  { 
    title: 'Termine', 
    icon: Clock,
    description: 'Zeitplan mit Aktivitäten und Terminen erstellen'
  }
];

const EventCreationWizard: React.FC<Props> = ({ organizationId, onClose, onCreated }) => {
  const [step, setStep] = useState(0);
  const [createdEvent, setCreatedEvent] = useState<Event | null>(null);
  const [createdDayPlan, setCreatedDayPlan] = useState<DayPlan | null>(null);

  const goBack = () => {
    if (step === 0) { onClose(); return; }
    setStep(step - 1);
  };

  // Progress indicator component
  const ProgressIndicator = () => (
    <div className={styles.adminCard} style={{ 
      width: '100%', 
      maxWidth: '900px', 
      margin: '0 auto 2rem',
      transform: 'rotate(0.2deg)',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
    }}>
      <div className={styles.tape} aria-hidden="true" />
      <h2 className={styles.cardTitle} style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.75rem',
        marginBottom: '1.5rem',
        fontSize: '1.4rem'
      }}>
        <Calendar size={28} />
        Veranstaltung erstellen
      </h2>
      
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        {WIZARD_STEPS.map((stepData, index) => {
          const StepIcon = stepData.icon;
          const isActive = index === step;
          const isCompleted = index < step;
          
          return (
            <div key={stepData.title} style={{
              padding: '1.25rem 1rem',
              border: '3px solid #181818',
              borderRadius: '1rem 1.3rem 0.9rem 1.2rem',
              backgroundColor: isActive ? '#3b82f6' : isCompleted ? '#10b981' : '#ffffff',
              color: isActive || isCompleted ? '#ffffff' : '#1f2937',
              boxShadow: isActive 
                ? '4px 8px 0 #181818, inset 0 2px 0 rgba(255,255,255,0.3)' 
                : isCompleted 
                ? '3px 6px 0 #181818, inset 0 2px 0 rgba(255,255,255,0.2)' 
                : '2px 4px 0 #cbd5e1',
              fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
              fontWeight: '700',
              textAlign: 'center',
              transform: isActive ? 'translateY(-3px) scale(1.02)' : isCompleted ? 'translateY(-1px)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              cursor: 'default'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                <StepIcon size={22} />
                <div style={{
                  fontSize: '0.75rem',
                  backgroundColor: isActive || isCompleted ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                  color: isActive || isCompleted ? '#ffffff' : '#64748b',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800'
                }}>
                  {index + 1}
                </div>
              </div>
              <div style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{stepData.title}</div>
              <div style={{ 
                fontSize: '0.75rem', 
                opacity: 0.8,
                lineHeight: '1.2',
                fontWeight: '400',
                fontFamily: '"Inter", "Roboto", Arial, sans-serif'
              }}>
                {stepData.description}
              </div>
              
              {index < WIZARD_STEPS.length - 1 && (
                <ArrowRight 
                  size={16} 
                  style={{ 
                    position: 'absolute', 
                    right: '-12px', 
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                    opacity: 0.7,
                    backgroundColor: '#ffffff',
                    borderRadius: '50%',
                    padding: '2px'
                  }} 
                />
              )}
            </div>
          );
        })}
      </div>
      
      <div style={{
        padding: '0.75rem 1rem',
        backgroundColor: '#f1f5f9',
        borderRadius: '0.75rem',
        border: '1px solid #e2e8f0',
        fontSize: '0.9rem',
        color: '#475569',
        fontFamily: '"Inter", "Roboto", Arial, sans-serif',
        textAlign: 'center'
      }}>
        Schritt {step + 1} von {WIZARD_STEPS.length}: {WIZARD_STEPS[step]?.description}
      </div>
    </div>
  );

  // Navigation component
  const Navigation = () => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginBottom: '2rem',
      maxWidth: '900px',
      margin: '0 auto 2rem'
    }}>
      <button 
        onClick={goBack}
        style={{
          padding: '1rem 1.5rem',
          border: '3px solid #64748b',
          borderRadius: '1rem 1.2rem 0.9rem 1.1rem',
          backgroundColor: '#ffffff',
          color: '#64748b',
          fontWeight: '700',
          fontFamily: '"Inter", "Roboto", Arial, sans-serif',
          fontSize: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '3px 6px 0 #64748b',
          transform: 'rotate(-0.8deg)',
          minWidth: '120px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'rotate(-0.8deg) translateY(-3px) scale(1.02)';
          e.currentTarget.style.boxShadow = '4px 8px 0 #64748b';
          e.currentTarget.style.backgroundColor = '#f8fafc';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'rotate(-0.8deg) translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '3px 6px 0 #64748b';
          e.currentTarget.style.backgroundColor = '#ffffff';
        }}
      >
        <ChevronLeft size={20} /> 
        {step === 0 ? 'Schließen' : 'Zurück'}
      </button>
      
      {/* Step counter in middle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.25rem',
        backgroundColor: '#f1f5f9',
        border: '2px solid #e2e8f0',
        borderRadius: '2rem',
        fontFamily: '"Inter", "Roboto", Arial, sans-serif',
        fontWeight: '600',
        color: '#475569',
        fontSize: '0.9rem'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#3b82f6'
        }} />
        Schritt {step + 1} von {WIZARD_STEPS.length}
      </div>
      
      <button 
        onClick={onClose}
        style={{
          padding: '1rem 1.5rem',
          border: '3px solid #ef4444',
          borderRadius: '1.1rem 0.9rem 1.2rem 0.85rem',
          backgroundColor: '#fef2f2',
          color: '#dc2626',
          fontWeight: '700',
          fontFamily: '"Inter", "Roboto", Arial, sans-serif',
          fontSize: '1rem',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '3px 6px 0 #ef4444',
          transform: 'rotate(0.5deg)',
          minWidth: '120px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'rotate(0.5deg) translateY(-3px) scale(1.02)';
          e.currentTarget.style.boxShadow = '4px 8px 0 #ef4444';
          e.currentTarget.style.backgroundColor = '#fee2e2';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'rotate(0.5deg) translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '3px 6px 0 #ef4444';
          e.currentTarget.style.backgroundColor = '#fef2f2';
        }}
      >
        Abbrechen
      </button>
    </div>
  );
  const handleCreateEvent = async (
    eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'dayPlans'>
  ) => {
    try {
      const created = await api.createEvent(organizationId, { name: eventData.name, description: eventData.description });
      const newEvent: Event = {
        id: created.id,
        name: created.name,
        description: created.description,
        organizationId,
        createdAt: new Date(created.createdAt),
        updatedAt: new Date(created.updatedAt),
        dayPlans: []
      };
      setCreatedEvent(newEvent);
      setStep(1);
    } catch (err) {
      console.error('Create event failed', err);
    }
  };

  const handleCreateDayPlan = async (
    dayPlanData: Omit<DayPlan, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!createdEvent) return;
    try {
      const created = await api.createDayPlan(createdEvent.id, { name: dayPlanData.name, date: dayPlanData.date, schedule: dayPlanData.schedule });
      const newDayPlan: DayPlan = {
        id: created.id,
        eventId: createdEvent.id,
        name: created.name,
        date: created.date,
        schedule: (created.scheduleItems || []).map((si: any) => ({ id: si.id, time: si.time, type: si.type, title: si.title })),
        createdAt: new Date(created.createdAt),
        updatedAt: new Date(created.updatedAt),
      };
      setCreatedDayPlan(newDayPlan);
      // also attach to event state so final callback includes it
      setCreatedEvent({ ...createdEvent, dayPlans: [newDayPlan] });
      setStep(2);
    } catch (err) {
      console.error('Create day plan failed', err);
    }
  };

  const handleSaveSchedule = async (schedule: ScheduleItem[]) => {
    if (!createdEvent || !createdDayPlan) return;
    try {
      // Persist schedule update if API has such endpoint, otherwise keep local
      // For now, just update local state
      const updatedDayPlan = { ...createdDayPlan, schedule };
      setCreatedDayPlan(updatedDayPlan);
      const finalEvent: Event = {
        ...createdEvent,
        dayPlans: [updatedDayPlan]
      };
      onCreated(finalEvent);
    } catch (err) {
      console.error('Save schedule failed', err);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'repeating-linear-gradient(0deg, var(--color-paper) 0px, var(--color-paper) 39px, #e5e7eb 40px, var(--color-paper) 41px)',
      padding: '2rem 1rem 4rem',
      position: 'relative'
    }}>
      {/* Enhanced background decorations */}
      <div style={{
        position: 'absolute',
        top: '80px',
        left: '8%',
        width: '50px',
        height: '50px',
        background: 'url(\'data:image/svg+xml;utf8,<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="25,5 30,18 45,18 33,28 37,42 25,34 13,42 17,28 5,18 20,18" fill="%23fbbf24" stroke="%23f59e0b" stroke-width="2.5"/></svg>\') no-repeat center/contain',
        opacity: 0.4,
        zIndex: 0,
        animation: 'float 8s ease-in-out infinite'
      }} />
      
      <div style={{
        position: 'absolute',
        top: '150px',
        right: '12%',
        width: '35px',
        height: '35px',
        background: 'url(\'data:image/svg+xml;utf8,<svg width="35" height="35" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="17.5" cy="17.5" r="15" fill="%2306b6d4" stroke="%230891b2" stroke-width="2"/><circle cx="17.5" cy="17.5" r="8" fill="%23ffffff" opacity="0.8"/></svg>\') no-repeat center/contain',
        opacity: 0.35,
        zIndex: 0,
        animation: 'float 6s ease-in-out infinite 2s'
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '120px',
        left: '15%',
        width: '40px',
        height: '40px',
        background: 'url(\'data:image/svg+xml;utf8,<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="5" width="30" height="30" rx="8" fill="%2310b981" stroke="%23047857" stroke-width="2"/><path d="M12 20l6 6 10-10" stroke="%23ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>\') no-repeat center/contain',
        opacity: 0.3,
        zIndex: 0,
        animation: 'float 7s ease-in-out infinite 1s'
      }} />
      
      <style>
        {`
          @keyframes float {
            0%, 100% { 
              transform: translateY(0px) rotate(0deg) scale(1); 
              opacity: 0.3;
            }
            33% { 
              transform: translateY(-12px) rotate(5deg) scale(1.05); 
              opacity: 0.4;
            }
            66% { 
              transform: translateY(-8px) rotate(-3deg) scale(0.98); 
              opacity: 0.35;
            }
          }
          
          .wizard-content {
            position: relative;
            z-index: 10;
          }
        `}
      </style>

      <div className="wizard-content" style={{ 
        width: '100%', 
        maxWidth: '1000px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        <ProgressIndicator />
        <Navigation />

        {/* Step content with improved transitions */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          minHeight: '500px',
          position: 'relative'
        }}>
          <div style={{
            width: '100%',
            opacity: 1,
            transform: 'translateX(0)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            {step === 0 && (
              <div style={{
                animation: 'slideInFromLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                <EventForm
                  organizationId={organizationId}
                  onSave={handleCreateEvent}
                  onCancel={onClose}
                />
              </div>
            )}

            {step === 1 && createdEvent && (
              <div style={{
                animation: 'slideInFromRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                <DayPlanForm
                  event={createdEvent}
                  onSave={handleCreateDayPlan}
                  onCancel={() => setStep(0)}
                />
              </div>
            )}

            {step === 2 && createdDayPlan && (
              <div style={{
                animation: 'slideInFromRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                width: '100%'
              }}>
                <div style={{ width: '100%', maxWidth: '900px' }}>
                  <div className={styles.adminCard} style={{
                    marginBottom: '2rem',
                    transform: 'rotate(-0.3deg)',
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
                  }}>
                    <div className={styles.tape} aria-hidden="true" />
                    <h3 style={{
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      color: '#1e40af',
                      marginBottom: '0.5rem',
                      fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif'
                    }}>
                      Zeitplan für "{createdDayPlan.name}"
                    </h3>
                    <p style={{
                      color: '#64748b',
                      fontSize: '0.95rem',
                      fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                      margin: 0
                    }}>
                      Erstelle und organisiere die Termine für deinen Tagesplan. Du kannst Zeiten hinzufügen, bearbeiten und die Reihenfolge anpassen.
                    </p>
                  </div>
                  
                  <ScheduleManager
                    schedule={createdDayPlan.schedule}
                    onSave={handleSaveSchedule}
                    onCancel={() => setStep(1)}
                  />
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    marginTop: '3rem' 
                  }}>
                    <div className={styles.adminCard} style={{
                      padding: '2rem',
                      maxWidth: '400px',
                      textAlign: 'center',
                      transform: 'rotate(-0.8deg)',
                      background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                      border: '3px solid #10b981'
                    }}>
                      <div className={styles.tape} aria-hidden="true" />
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        marginBottom: '1rem'
                      }}>
                        <CheckCircle size={32} color="#10b981" />
                        <h3 style={{
                          fontSize: '1.3rem',
                          fontWeight: '700',
                          color: '#047857',
                          margin: 0,
                          fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif'
                        }}>
                          Fast geschafft!
                        </h3>
                      </div>
                      
                      <p style={{
                        marginBottom: '1.5rem',
                        fontSize: '1rem',
                        color: '#059669',
                        fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                        lineHeight: '1.4'
                      }}>
                        Deine Veranstaltung ist bereit. Klicke auf "Fertigstellen" um alles zu speichern und die Veranstaltung zu erstellen.
                      </p>
                      
                      <button
                        onClick={() => handleSaveSchedule(createdDayPlan.schedule)}
                        style={{
                          padding: '1.2rem 2rem',
                          border: '3px solid #047857',
                          borderRadius: '1.2rem 1.4rem 1rem 1.3rem',
                          backgroundColor: '#10b981',
                          color: '#ffffff',
                          fontWeight: '700',
                          fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                          fontSize: '1.2rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: '4px 8px 0 #047857, inset 0 2px 0 rgba(255,255,255,0.3)',
                          width: '100%',
                          justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                          e.currentTarget.style.boxShadow = '6px 12px 0 #047857, inset 0 2px 0 rgba(255,255,255,0.3)';
                          e.currentTarget.style.backgroundColor = '#059669';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0) scale(1)';
                          e.currentTarget.style.boxShadow = '4px 8px 0 #047857, inset 0 2px 0 rgba(255,255,255,0.3)';
                          e.currentTarget.style.backgroundColor = '#10b981';
                        }}
                      >
                        <CheckCircle size={24} /> 
                        Veranstaltung fertigstellen
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Add slide animation styles */}
          <style>
            {`
              @keyframes slideInFromLeft {
                from {
                  opacity: 0;
                  transform: translateX(-50px);
                }
                to {
                  opacity: 1;
                  transform: translateX(0);
                }
              }
              
              @keyframes slideInFromRight {
                from {
                  opacity: 0;
                  transform: translateX(50px);
                }
                to {
                  opacity: 1;
                  transform: translateX(0);
                }
              }
            `}
          </style>
        </div>
      </div>
    </div>
  );
};

export default EventCreationWizard;
