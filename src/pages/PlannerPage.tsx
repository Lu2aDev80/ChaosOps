import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Planer from '../components/planner/Planer';
import type { ScheduleItem } from '../types/schedule';

// Helper to create sample schedule items with required fields
const createSampleItem = (partial: Partial<ScheduleItem>): ScheduleItem => ({
  id: 0,
  dayPlanId: 'sample',
  position: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  tags: [],
  ...partial,
  time: partial.time || '00:00',
  type: partial.type || 'session',
  title: partial.title || 'Untitled',
});

// Sample schedule for demo/development
// Includes examples of time and position changes for demonstration
const sampleSchedule: ScheduleItem[] = [
  createSampleItem({ id: 1, position: 0, time: '08:45', type: 'announcement', title: 'Ankommen & Registrierung', details: 'Bitte Namensschild holen und Platz suchen.' }),
  createSampleItem({ id: 2, position: 1, time: '09:00', type: 'session', title: 'Begrüßung & Intro', speaker: 'Lea', location: 'Großer Raum', details: 'Kurzer Überblick über den Tag.' }),
  createSampleItem({ 
    id: 3, 
    position: 2,
    time: '09:20', 
    type: 'game', 
    title: 'Namensspiel', 
    facilitator: 'Tom', 
    location: 'Kreis', 
    materials: 'Ball', 
    details: 'Schnelles Kennenlernspiel.',
    timeChanged: true,
    originalTime: '09:15'
  }),
  createSampleItem({ id: 4, position: 3, time: '09:30', type: 'workshop', title: 'Kreative Karten', speaker: 'Mara', location: 'Werkraum', materials: 'Stifte, Bastelpapier', details: 'Gestalte eine persönliche Ermutigungskarte.' }),
  createSampleItem({ id: 5, position: 4, time: '10:15', type: 'break', title: 'Pause', duration: '15 Min', snacks: 'Kekse & Saft' }),
  createSampleItem({ 
    id: 6, 
    position: 5,
    time: '10:45', 
    type: 'session', 
    title: 'Impuls: Vertrauen', 
    speaker: 'Paul', 
    location: 'Großer Raum', 
    details: 'Kurzer Input mit Austausch.',
    timeChanged: true,
    originalTime: '10:30',
    positionChanged: true,
    originalPosition: 5
  }),
  createSampleItem({ 
    id: 7, 
    position: 6,
    time: '11:00', 
    type: 'transition', 
    title: 'Umbau / Vorbereitung Spiel',
    positionChanged: true,
    originalPosition: 6
  }),
  createSampleItem({ id: 8, position: 7, time: '11:10', type: 'game', title: 'Teamchallenge Parcours', facilitator: 'Sarah', location: 'Außenbereich', materials: 'Seile, Hütchen', details: 'Kooperations-Challenge.' }),
  createSampleItem({ id: 9, position: 8, time: '11:45', type: 'announcement', title: 'Ansage: Ausflug nächste Woche', details: 'Treffpunkt 9:30 an der Kirche.' }),
  createSampleItem({ id: 10, position: 9, time: '11:50', type: 'break', title: 'Frühstück / Snack', duration: '20 Min', snacks: 'Obst & Müsliriegel' }),
  createSampleItem({ id: 11, position: 10, time: '12:10', type: 'workshop', title: 'Musik Jam', speaker: 'Ben', location: 'Musikraum', materials: 'Gitarren, Cajón', details: 'Offene Jam-Runde.' }),
  createSampleItem({ id: 12, position: 11, time: '12:45', type: 'session', title: 'Abschlussrunde', speaker: 'Lea', location: 'Großer Raum', details: 'Feedback & Gebet.' }),
  createSampleItem({ id: 13, position: 12, time: '13:00', type: 'transition', title: 'Aufräumen' }),
  createSampleItem({ id: 14, position: 13, time: '13:10', type: 'announcement', title: 'Ende / Verabschiedung', details: 'Dank & Hinweis auf Termin nächste Woche.' }),
];

const PlannerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [scheduleData, setScheduleData] = React.useState({
    schedule: sampleSchedule,
    title: 'Heutiger Ablauf',
    date: new Date().toLocaleDateString('de-DE', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })
  });
  
  const dayPlanId = searchParams.get('dayPlanId');

  // Load from database via API
  React.useEffect(() => {
    const fetchDayPlan = async () => {
      if (dayPlanId) {
        try {
          // Import the API from the lib
          const { api } = await import('../lib/api');
          
          // Fetch the specific day plan directly
          const dayPlan = await api.getDayPlan(dayPlanId);
          
          if (dayPlan) {
            // Map scheduleItems to schedule format expected by Planer component
            const newSchedule = (dayPlan.scheduleItems || []).map((item: ScheduleItem) => item);
            
            const newTitle = dayPlan.name;
            const newDate = new Date(dayPlan.date).toLocaleDateString('de-DE', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            });
            
            // Update state with fetched data
            setScheduleData({ schedule: newSchedule, title: newTitle, date: newDate });
          }
        } catch (error) {
          console.error('Error loading schedule from database:', error);
          // Fallback to sample schedule
          setScheduleData({ 
            schedule: sampleSchedule, 
            title: 'Heutiger Ablauf (Demo)', 
            date: new Date().toLocaleDateString('de-DE', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })
          });
        }
      }
    };
    
    fetchDayPlan();
  }, [dayPlanId]);

  return (
    <Planer
      schedule={scheduleData.schedule}
      title={scheduleData.title}
      date={scheduleData.date}
      showClock={true}
      autoCenter={true}
      debug={false}
      resetButton={
        <button
          onClick={() => navigate(-1)}
          style={{
            background: '#f1f5f9',
            border: '2px solid #181818',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '1rem',
            padding: '0.5rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '2px 4px 0 #181818',
            cursor: 'pointer',
            pointerEvents: 'auto',
            zIndex: 30
          }}
        >
          <span style={{fontSize: '1.2em', lineHeight: 1}}>&larr;</span>
          Zurück
        </button>
      }
    />
  );
};

export default PlannerPage;
