import React from 'react';
import { useSearchParams } from 'react-router-dom';
import Planer from '../components/planner/Planer';
import type { ScheduleItem } from '../types/schedule';

interface DayPlan {
  id: string;
  name: string;
  date: string;
  schedule: ScheduleItem[];
}

// Sample schedule for demo/development
// Includes examples of time and position changes for demonstration
const sampleSchedule: ScheduleItem[] = [
  { id: 1, time: '08:45', type: 'announcement', title: 'Ankommen & Registrierung', details: 'Bitte Namensschild holen und Platz suchen.' },
  { id: 2, time: '09:00', type: 'session', title: 'Begrüßung & Intro', speaker: 'Lea', location: 'Großer Raum', details: 'Kurzer Überblick über den Tag.' },
  { 
    id: 3, 
    time: '09:20', 
    type: 'game', 
    title: 'Namensspiel', 
    facilitator: 'Tom', 
    location: 'Kreis', 
    materials: 'Ball', 
    details: 'Schnelles Kennenlernspiel.',
    timeChanged: true,
    originalTime: '09:15'
  },
  { id: 4, time: '09:30', type: 'workshop', title: 'Kreative Karten', speaker: 'Mara', location: 'Werkraum', materials: 'Stifte, Bastelpapier', details: 'Gestalte eine persönliche Ermutigungskarte.' },
  { id: 5, time: '10:15', type: 'break', title: 'Pause', duration: '15 Min', snacks: 'Kekse & Saft' },
  { 
    id: 6, 
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
  },
  { 
    id: 7, 
    time: '11:00', 
    type: 'transition', 
    title: 'Umbau / Vorbereitung Spiel',
    positionChanged: true,
    originalPosition: 6
  },
  { id: 8, time: '11:10', type: 'game', title: 'Teamchallenge Parcours', facilitator: 'Sarah', location: 'Außenbereich', materials: 'Seile, Hütchen', details: 'Kooperations-Challenge.' },
  { id: 9, time: '11:45', type: 'announcement', title: 'Ansage: Ausflug nächste Woche', details: 'Treffpunkt 9:30 an der Kirche.' },
  { id: 10, time: '11:50', type: 'break', title: 'Frühstück / Snack', duration: '20 Min', snacks: 'Obst & Müsliriegel' },
  { id: 11, time: '12:10', type: 'workshop', title: 'Musik Jam', speaker: 'Ben', location: 'Musikraum', materials: 'Gitarren, Cajón', details: 'Offene Jam-Runde.' },
  { id: 12, time: '12:45', type: 'session', title: 'Abschlussrunde', speaker: 'Lea', location: 'Großer Raum', details: 'Feedback & Gebet.' },
  { id: 13, time: '13:00', type: 'transition', title: 'Aufräumen' },
  { id: 14, time: '13:10', type: 'announcement', title: 'Ende / Verabschiedung', details: 'Dank & Hinweis auf Termin nächste Woche.' },
];

const PlannerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
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
  const orgId = searchParams.get('org');

  // Load from database via API instead of localStorage
  React.useEffect(() => {
    const fetchDayPlan = async () => {
      if (dayPlanId && orgId) {
        try {
          // Import the API from the lib
          const { api } = await import('../lib/api');
          
          // Fetch events for the organization from the database
          const events = await api.listEvents(orgId);
          
          // Find the day plan
          for (const event of events) {
            const dayPlan = event.dayPlans?.find((dp: DayPlan) => dp.id === dayPlanId);
            if (dayPlan) {
              const newSchedule = dayPlan.schedule || [];
              const newTitle = dayPlan.name;
              const newDate = new Date(dayPlan.date).toLocaleDateString('de-DE', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              });
              // Force re-render by updating state
              setScheduleData({ schedule: newSchedule, title: newTitle, date: newDate });
              break;
            }
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
  }, [dayPlanId, orgId]);

  return (
    <Planer 
      schedule={scheduleData.schedule} 
      title={scheduleData.title}
      date={scheduleData.date}
      showClock={true} 
      autoCenter={true}
      debug={false}
    />
  );
};

export default PlannerPage;
