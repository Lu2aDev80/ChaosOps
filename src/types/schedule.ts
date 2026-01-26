import type { Tag } from './tag';

export interface ScheduleItem {
  id: number;
  dayPlanId: string;
  time: string;
  type: string;
  title: string;
  speaker?: string;
  location?: string;
  details?: string;
  materials?: string;
  duration?: string;
  snacks?: string;
  facilitator?: string;
  // Optional client-side delay in minutes to shift the item's time
  delay?: number;
  timeChanged?: boolean;
  positionChanged?: boolean;
  originalTime?: string;
  originalPosition?: number;
  position: number;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
  // Helper/Employee information fields
  helperMeetingTime?: string;     // Earlier meeting time for team
  helperNotes?: string;           // Additional notes for helpers
  helperMaterials?: string;       // Materials helpers need to prepare
  showHelperInfoOnDisplay?: boolean;    // Show on all displays
  showHelperInfoOnSharedPlan?: boolean; // Show on shared plans only
}

export interface DayPlan {
  id: string;
  eventId: string;
  name: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  scheduleItems: ScheduleItem[];
}