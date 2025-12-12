import React, { useState } from 'react';
import styles from '../../pages/Admin.module.css';
import { api } from '../../lib/api';
import type { Event, DayPlan } from '../../types/event';
import type { ScheduleItem } from '../../types/schedule';
import {
  Calendar,
  ChevronLeft,
  CheckCircle,
  Users,
  Clock,
  X,
  ArrowRight,
  // ...existing code...
  Sparkles
} from 'lucide-react';
import EventForm from './EventForm';
import DayPlanForm from './DayPlanForm';
import ScheduleManager from '../planner/ScheduleManager';

interface Props {
  organizationId: string;
  onClose: () => void;
  onCreated: (event: Event) => void;
  editingEvent?: Event | null;
  editingDayPlan?: DayPlan | null;
}

const WIZARD_STEPS = [
  {
    title: 'Veranstaltung',
    icon: Users,
    description: 'Grundlegende Informationen zur Veranstaltung',
    shortDesc: 'Veranstaltungsdetails'
  },
  {
    title: 'Tagesplan',
    icon: Calendar,
    description: 'Datum und Name für den Tagesplan festlegen',
    shortDesc: 'Tagesplan erstellen'
  },
  {
    title: 'Termine',
    icon: Clock,
    description: 'Zeitplan mit Aktivitäten und Terminen erstellen',
    shortDesc: 'Zeitplan organisieren'
  }
];

const EventCreationWizard: React.FC<Props> = ({
  organizationId,
  onClose,
  onCreated,
  editingEvent = null,
  editingDayPlan = null
}) => {
  // Determine initial step based on editing mode
  const getInitialStep = () => {
    if (editingDayPlan) return 2; // Go directly to schedule editing
    if (editingEvent) return 1; // Go to day plan selection/creation
    return 0; // Normal creation flow
  };

  const [step, setStep] = useState(getInitialStep());
  const [createdEvent, setCreatedEvent] = useState<Event | null>(editingEvent);
  const [createdDayPlan, setCreatedDayPlan] = useState<DayPlan | null>(editingDayPlan);

  const goBack = () => {
    if (step === 0) { onClose(); return; }
    setStep(step - 1);
  };



  // Enhanced progress indicator component
  const ProgressIndicator = () => (
    <div className={styles.adminCard} style={{
      width: '100%',
      maxWidth: '1000px',
      margin: '0 auto 2rem',
      transform: 'rotate(0deg)',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      border: '3px solid var(--color-ink)',
      boxShadow: '0 6px 20px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.05)'
    }}>
      <div className={styles.tape} aria-hidden="true" />

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        marginBottom: '2rem',
        padding: '0.5rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          borderRadius: '50%',
          padding: '0.75rem',
          border: '3px solid var(--color-ink)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }}>
          <Sparkles size={24} color="#fff" />
        </div>
        <h2 className={styles.cardTitle} style={{
          fontSize: '1.6rem',
          margin: 0,
          color: '#1e40af'
        }}>
          {editingEvent || editingDayPlan ? 'Bearbeitung' : 'Neue Veranstaltung'}
        </h2>
      </div>

      {/* Step Progress Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '2rem',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        {WIZARD_STEPS.map((stepData, index) => {
          const StepIcon = stepData.icon;
          const isActive = index === step;
          const isCompleted = index < step || (index === step && step === 2 && createdDayPlan);
          const isAccessible = index <= step || (index === 2 && createdDayPlan);

          return (
            <React.Fragment key={stepData.title}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: isAccessible ? 1 : 0.4,
                transition: 'all 0.3s ease'
              }}>
                {/* Step Circle */}
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  border: '3px solid var(--color-ink)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isCompleted
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : isActive
                      ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                      : '#fff',
                  color: isCompleted || isActive ? '#fff' : '#64748b',
                  boxShadow: isActive
                    ? '0 6px 20px rgba(59, 130, 246, 0.4), 0 0 0 4px rgba(59, 130, 246, 0.1)'
                    : isCompleted
                      ? '0 4px 12px rgba(16, 185, 129, 0.3)'
                      : '0 2px 8px rgba(0,0,0,0.1)',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                  {isCompleted ? <CheckCircle size={24} /> : <StepIcon size={24} />}
                </div>

                {/* Step Label */}
                <div style={{
                  textAlign: 'center',
                  maxWidth: '120px'
                }}>
                  <div style={{
                    fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    color: isActive ? '#1e40af' : '#374151',
                    marginBottom: '0.25rem'
                  }}>
                    {stepData.title}
                  </div>
                  <div style={{
                    fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                    fontSize: '0.75rem',
                    color: '#64748b',
                    lineHeight: '1.2'
                  }}>
                    {window.innerWidth < 768 ? stepData.shortDesc : stepData.description}
                  </div>
                </div>
              </div>

              {/* Arrow between steps */}
              {index < WIZARD_STEPS.length - 1 && (
                <div style={{
                  display: window.innerWidth < 640 ? 'none' : 'flex',
                  alignItems: 'center',
                  color: index < step ? '#10b981' : '#d1d5db',
                  margin: '0 0.5rem'
                }}>
                  <ArrowRight size={20} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Current Step Info */}
      <div style={{
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        border: '2px solid #3b82f6',
        borderRadius: '12px',
        padding: '1rem',
        textAlign: 'center'
      }}>
        <div style={{
          fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
          fontSize: '1rem',
          fontWeight: '700',
          color: '#1e40af',
          marginBottom: '0.25rem'
        }}>
          Schritt {step + 1} von {WIZARD_STEPS.length}
        </div>
        <div style={{
          fontFamily: '"Inter", "Roboto", Arial, sans-serif',
          fontSize: '0.9rem',
          color: '#475569'
        }}>
          {WIZARD_STEPS[step]?.description}
        </div>
      </div>
    </div>
  );

  // Enhanced navigation component
  const Navigation = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      maxWidth: '1000px',
      margin: '0 auto 2rem',
      gap: '1rem',
      flexWrap: 'wrap'
    }}>
      {/* Back Button */}
      <button
        onClick={goBack}
        style={{
          padding: '0.875rem 1.5rem',
          border: '3px solid var(--color-ink)',
          borderRadius: '12px',
          backgroundColor: '#fff',
          color: '#64748b',
          fontWeight: '700',
          fontFamily: '"Inter", "Roboto", Arial, sans-serif',
          fontSize: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 4px 0 var(--color-ink), 0 2px 8px rgba(0,0,0,0.1)',
          minWidth: '140px',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 0 var(--color-ink), 0 4px 12px rgba(0,0,0,0.15)';
          e.currentTarget.style.backgroundColor = '#f8fafc';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 0 var(--color-ink), 0 2px 8px rgba(0,0,0,0.1)';
          e.currentTarget.style.backgroundColor = '#fff';
        }}
      >
        <ChevronLeft size={20} />
        {step === 0 ? 'Schließen' : 'Zurück'}
      </button>

      {/* Progress Dots (Mobile Alternative) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        order: window.innerWidth < 640 ? 3 : 2,
        width: window.innerWidth < 640 ? '100%' : 'auto',
        justifyContent: window.innerWidth < 640 ? 'center' : 'flex-start'
      }}>
        {WIZARD_STEPS.map((_, index) => (
          <div
            key={index}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: index <= step ? '#3b82f6' : '#d1d5db',
              transition: 'all 0.3s ease',
              border: index === step ? '2px solid #1e40af' : 'none',
              transform: index === step ? 'scale(1.2)' : 'scale(1)'
            }}
          />
        ))}
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        style={{
          padding: '0.875rem 1.25rem',
          border: '3px solid #ef4444',
          borderRadius: '12px',
          backgroundColor: '#fef2f2',
          color: '#dc2626',
          fontWeight: '700',
          fontFamily: '"Inter", "Roboto", Arial, sans-serif',
          fontSize: '1rem',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 4px 0 #ef4444, 0 2px 8px rgba(239, 68, 68, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          order: window.innerWidth < 640 ? 1 : 3,
          minWidth: '120px',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 0 #ef4444, 0 4px 12px rgba(239, 68, 68, 0.3)';
          e.currentTarget.style.backgroundColor = '#fee2e2';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 0 #ef4444, 0 2px 8px rgba(239, 68, 68, 0.2)';
          e.currentTarget.style.backgroundColor = '#fef2f2';
        }}
      >
        <X size={18} />
        {window.innerWidth < 480 ? 'Abbrechen' : 'Abbrechen'}
      </button>
    </div>
  );
  const handleCreateEvent = async (
    eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'dayPlans'>
  ) => {
    try {
      if (editingEvent) {
        // Update existing event
        console.log('Updating event:', editingEvent.id, eventData);
        const updated = await api.updateEvent(editingEvent.id, {
          name: eventData.name,
          description: eventData.description
        });
        const updatedEvent: Event = {
          ...editingEvent,
          name: updated.name,
          description: updated.description,
          updatedAt: updated.updatedAt
        };
        setCreatedEvent(updatedEvent);
        onCreated(updatedEvent);
        return;
      }

      const created = await api.createEvent(organizationId, { name: eventData.name, description: eventData.description });
      const newEvent: Event = {
        id: created.id,
        name: created.name,
        description: created.description,
        organisationId: organizationId,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
        dayPlans: []
      };
      setCreatedEvent(newEvent);
      setStep(1);
    } catch (err) {
      console.error('Create/Update event failed', err);
    }
  };

  const handleCreateDayPlan = async (
    dayPlanData: Omit<DayPlan, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!createdEvent) return;
    try {
      if (editingDayPlan) {
        // Update existing day plan
        console.log('Updating day plan:', editingDayPlan.id, dayPlanData);
        const scheduleForApi = (dayPlanData.scheduleItems || []).map((item: any) => ({
          time: item.time || '09:00',
          type: item.type || 'session',
          title: item.title || '',
          speaker: item.speaker,
          location: item.location,
          details: item.details,
          materials: item.materials,
          duration: item.duration,
          snacks: item.snacks,
          facilitator: item.facilitator,
          delay: typeof item.delay === 'number' ? item.delay : undefined,
        }));

        const updated = await api.updateDayPlan(editingDayPlan.id, {
          name: dayPlanData.name,
          date: dayPlanData.date,
          schedule: scheduleForApi
        });

        const updatedDayPlan: DayPlan = {
          id: updated.id,
          eventId: updated.eventId,
          name: updated.name,
          date: updated.date,
          scheduleItems: updated.scheduleItems || [],
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
        };
        setCreatedDayPlan(updatedDayPlan);
        setCreatedEvent({ ...createdEvent, dayPlans: [updatedDayPlan] });
        setStep(2);
        return;
      }

      const scheduleForApi = (dayPlanData.scheduleItems || []).map((item: any) => ({
        time: item.time || '09:00',
        type: item.type || 'session',
        title: item.title || '',
        speaker: item.speaker,
        location: item.location,
        details: item.details,
        materials: item.materials,
        duration: item.duration,
        snacks: item.snacks,
        facilitator: item.facilitator,
        delay: typeof item.delay === 'number' ? item.delay : undefined,
      }));

      const created = await api.createDayPlan(createdEvent.id, {
        name: dayPlanData.name,
        date: dayPlanData.date,
        schedule: scheduleForApi
      });

      const newDayPlan: DayPlan = {
        id: created.id,
        eventId: createdEvent.id,
        name: created.name,
        date: created.date,
        scheduleItems: created.scheduleItems || [],
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      };
      setCreatedDayPlan(newDayPlan);
      setCreatedEvent({ ...createdEvent, dayPlans: [newDayPlan] });
      setStep(2);
    } catch (err) {
      console.error('Create/Update day plan failed', err);
    }
  };

  const handleSaveSchedule = async (schedule: ScheduleItem[]) => {
    const dayPlanToUpdate = createdDayPlan || editingDayPlan;
    if (!dayPlanToUpdate) return;

    try {
      const scheduleForApi = (schedule || []).map((item: any) => ({
        time: item.time || '09:00',
        type: item.type || 'session',
        title: item.title || '',
        speaker: item.speaker,
        location: item.location,
        details: item.details,
        materials: item.materials,
        duration: item.duration,
        snacks: item.snacks,
        facilitator: item.facilitator,
        delay: typeof item.delay === 'number' ? item.delay : undefined,
      }));

      // Update the day plan with the new schedule
      const updated = await api.updateDayPlan(dayPlanToUpdate.id, {
        schedule: scheduleForApi
      });

      const updatedDayPlan: DayPlan = {
        id: updated.id,
        eventId: updated.eventId,
        name: updated.name,
        date: updated.date,
        scheduleItems: updated.scheduleItems || [],
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };

      if (createdEvent) {
        // Fresh creation
        setCreatedDayPlan(updatedDayPlan);
        const finalEvent: Event = {
          ...createdEvent,
          dayPlans: [updatedDayPlan]
        };
        onCreated(finalEvent);
      } else {
        // Editing existing day plan
        // Since we don't have the full event, we'll create a minimal event object
        const minimalEvent: Event = {
          id: updated.eventId,
          name: '', // We don't have this info
          description: '',
          organisationId: organizationId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          dayPlans: [updatedDayPlan]
        };
        onCreated(minimalEvent);
      }
    } catch (err) {
      console.error('Save schedule failed', err);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'repeating-linear-gradient(0deg, var(--color-paper) 0px, var(--color-paper) 39px, #e5e7eb 40px, var(--color-paper) 41px)',
      padding: '1.5rem 1rem 3rem',
      position: 'relative'
    }}>
      {/* Enhanced background decorations */}
      <div style={{
        position: 'absolute',
        top: '10vh',
        left: '5%',
        width: '40px',
        height: '40px',
        background: 'url(\'data:image/svg+xml;utf8,<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="20,3 24,15 37,15 26,23 30,34 20,27 10,34 14,23 3,15 16,15" fill="%23fbbf24" stroke="%23f59e0b" stroke-width="2.5"/></svg>\') no-repeat center/contain',
        opacity: 0.3,
        zIndex: 0,
        animation: 'float 6s ease-in-out infinite'
      }} />

      <div style={{
        position: 'absolute',
        bottom: '15vh',
        right: '8%',
        width: '35px',
        height: '35px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #a5f3fc 0%, #38bdf8 100%)',
        opacity: 0.4,
        zIndex: 0,
        animation: 'float 4s ease-in-out infinite reverse'
      }} />

      <div style={{
        position: 'absolute',
        top: '60%',
        left: '10%',
        width: '50px',
        height: '20px',
        background: 'url(\'data:image/svg+xml;utf8,<svg width="50" height="20" viewBox="0 0 50 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 13 Q 15 3, 30 13 T 47 13" stroke="%23f472b6" stroke-width="2.5" fill="none"/></svg>\') no-repeat center/contain',
        opacity: 0.3,
        zIndex: 0,
        animation: 'bounce 3s ease-in-out infinite'
      }} />

      {/* Floating animation styles */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-10px) rotate(2deg); }
            66% { transform: translateY(-5px) rotate(-1deg); }
          }
          
          @keyframes bounce {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-8px) scale(1.05); }
          }
          
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
          
          @keyframes slideInFromBottom {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>

      <div style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        <ProgressIndicator />
        <Navigation />

        {/* Enhanced step content with better transitions */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          minHeight: '500px',
          position: 'relative'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '1000px',
            opacity: 1,
            transform: 'translateX(0)',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            {/* Step 1: Event Form */}
            {step === 0 && (
              <div style={{
                animation: 'slideInFromLeft 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                justifyContent: 'center'
              }}>
                <div style={{ width: '100%', maxWidth: '600px' }}>
                  <EventForm
                    event={editingEvent}
                    organizationId={organizationId}
                    onSave={handleCreateEvent}
                    onCancel={onClose}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Day Plan Form */}
            {step === 1 && createdEvent && (
              <div style={{
                animation: 'slideInFromRight 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                justifyContent: 'center'
              }}>
                <div style={{ width: '100%', maxWidth: '600px' }}>
                  <DayPlanForm
                    dayPlan={editingDayPlan}
                    event={createdEvent}
                    onSave={handleCreateDayPlan}
                    onCancel={() => setStep(0)}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Schedule Manager */}
            {step === 2 && (createdDayPlan || editingDayPlan) && (
              <div style={{
                animation: 'slideInFromLeft 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                justifyContent: 'center',
                width: '100%'
              }}>
                <div style={{ width: '100%', maxWidth: '600px' }}>
                  <ScheduleManager
                    schedule={(createdDayPlan || editingDayPlan)?.scheduleItems || []}
                    onSave={handleSaveSchedule}
                    onCancel={() => setStep(1)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCreationWizard;
