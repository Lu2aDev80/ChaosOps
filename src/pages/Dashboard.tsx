import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  LogOut,
  Folder,
  FileText,
  Eye,
  Clock,
  Settings,
  Search,
  X,
  List,
  Grid,
  ChevronDown,
  ChevronRight,
  Filter,
  Share2,
} from "lucide-react";
import EventForm from "../components/forms/EventForm";
import DayPlanForm from "../components/forms/DayPlanForm";
import ScheduleManager from "../components/planner/ScheduleManager";
import EventCreationWizard from "../components/forms/EventCreationWizard";
import DisplayPairingModal from "../components/admin/DisplayPairingModal";
import SharedPlansManager from "../components/admin/SharedPlansManager";
import FlipchartBackground from "../components/layout/FlipchartBackground";
import { ConfirmModal, AlertModal } from "../components/ui";
import type { Event, DayPlan } from "../types/event";
import type { ScheduleItem } from "../types/schedule";
import styles from "./Admin.module.css";
import chaosOpsLogo from "../assets/Chaos-Ops Logo.png";
import { api } from "../lib/api";
import LivePlanControl from "../components/planner/LivePlanControl";
// ...removed import of 'trace' from console, use global console.trace instead

const Dashboard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const orgId = searchParams.get("org");

  // Determine the base path for navigation
  const basePath = location.pathname.startsWith("/login") ? "/login" : "/admin";

  // State management
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showDayPlanForm, setShowDayPlanForm] = useState(false);
  const [editingDayPlan, setEditingDayPlan] = useState<DayPlan | null>(null);
  const [managingSchedule, setManagingSchedule] = useState<DayPlan | null>(
    null
  );
  const [sharingDayPlan, setSharingDayPlan] = useState<DayPlan | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'event' | 'dayPlan';
    id: string;
  }>({ isOpen: false, type: 'event', id: '' });
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string; type?: 'info' | 'success' | 'warning' | 'error' }>({ isOpen: false, title: '', message: '' });

  // Device pairing state
  const [showDevicePairingModal, setShowDevicePairingModal] = useState(false);
  // Dummy: Display verbunden (später mit echter Logik ersetzen)
  // const [isDisplayConnected, setIsDisplayConnected] = useState(true);
  // const [delayActive, setDelayActive] = useState(false);

  // UI state for improved overview
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'detailed' | 'compact'>('detailed');
  const [collapsedEvents, setCollapsedEvents] = useState<Set<string>>(new Set());
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [eventTags, setEventTags] = useState<any[]>([]);
  const [scheduleItemTags, setScheduleItemTags] = useState<any[]>([]);
  const [selectedEventTags, setSelectedEventTags] = useState<Set<string>>(new Set());
  const [selectedScheduleItemTags, setSelectedScheduleItemTags] = useState<Set<string>>(new Set());

  // Get organization info
  const [organisationName, setOrganisationName] = useState<string | null>(null);
  const [organisationLogo, setOrganisationLogo] = useState<string | null>(null);
  useEffect(() => {
    const load = async () => {
      if (!orgId) return;
      try {
        const all = await api.organisations();
        const org = all.find((o: any) => o.id === orgId);
        setOrganisationName(org?.name ?? null);
        setOrganisationLogo(org?.logoUrl ?? null);
      } catch { }
    };
    load();
  }, [orgId]);

  useEffect(() => {
    const loadEvents = async () => {
      if (!orgId) {
        navigate(basePath);
        return;
      }

      try {
        const [serverEvents, eventTagsData, scheduleItemTagsData] = await Promise.all([
          api.listEvents(orgId),
          api.getEventTags(orgId),
          api.getScheduleItemTags(orgId)
        ]);

        setEvents(
          serverEvents.map((e: any) => ({
            ...e,
            createdAt: new Date(e.createdAt),
            updatedAt: new Date(e.updatedAt),
            dayPlans: (e.dayPlans || []).map((d: any) => ({
              ...d,
              createdAt: new Date(d.createdAt),
              updatedAt: new Date(d.updatedAt),
              schedule: (d.scheduleItems || []).map((si: any) => ({
                id: si.id,
                time: si.time,
                type: si.type,
                title: si.title,
              })),
            })),
          }))
        );

        setEventTags(eventTagsData);
        setScheduleItemTags(scheduleItemTagsData);
      } catch (err) {
        console.error('Failed to fetch events', err)
      }
    }
    loadEvents()
  }, [orgId, navigate, basePath]);

  // Update events state only
  const setEventsState = (updatedEvents: Event[]) => {
    setEvents(updatedEvents)
  };

  // Event CRUD operations
  const handleCreateEvent = async (
    eventData: Omit<Event, "id" | "createdAt" | "updatedAt" | "dayPlans">
  ) => {
    try {
      const created = await api.createEvent(orgId!, { name: eventData.name, description: eventData.description })
      const newEvent: Event = {
        id: created.id,
        name: created.name,
        description: created.description,
        organisationId: orgId!,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
        dayPlans: [],
      }
      setEventsState([...events, newEvent])
      setShowEventForm(false)
    } catch (err) {
      console.error('Create event failed', err)
    }
  };

  const handleUpdateEvent = (
    eventData: Omit<Event, "id" | "createdAt" | "updatedAt" | "dayPlans">
  ) => {
    if (!editingEvent) return;

    const updatedEvents = events.map((e) =>
      e.id === editingEvent.id
        ? { ...e, ...eventData, updatedAt: new Date().toISOString() }
        : e
    );
    setEventsState(updatedEvents);
    setEditingEvent(null);
    setShowEventForm(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    setDeleteConfirm({ isOpen: true, type: 'event', id: eventId });
  };

  const confirmDeleteEvent = async () => {
    const eventId = deleteConfirm.id;
    try {
      await api.deleteEvent(eventId);
      setEventsState(events.filter((e) => e.id !== eventId));
      if (selectedEvent?.id === eventId) {
        setSelectedEvent(null);
      }
      setDeleteConfirm({ isOpen: false, type: 'event', id: '' });
    } catch (err) {
      console.error('Delete event failed', err);
      setDeleteConfirm({ isOpen: false, type: 'event', id: '' });
    }
  };

  // DayPlan CRUD operations
  const handleCreateDayPlan = async (
    dayPlanData: Omit<DayPlan, "id" | "createdAt" | "updatedAt">
  ) => {
    if (!selectedEvent) return;
    try {
      // Filter out client-side only properties and prepare schedule items for API
      const scheduleForApi = dayPlanData.scheduleItems?.map((item: any) => ({
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
      })) || [];

      const created = await api.createDayPlan(selectedEvent.id, {
        name: dayPlanData.name,
        date: dayPlanData.date,
        schedule: scheduleForApi
      })
      const newDayPlan: DayPlan = {
        id: created.id,
        eventId: selectedEvent.id,
        name: created.name,
        date: created.date,
        scheduleItems: created.scheduleItems || [],
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      }

      const updatedEvents = events.map((e) =>
        e.id === selectedEvent.id
          ? { ...e, dayPlans: [...e.dayPlans, newDayPlan], updatedAt: new Date().toISOString() }
          : e
      );
      setEventsState(updatedEvents);
      setSelectedEvent(updatedEvents.find((e) => e.id === selectedEvent.id) || null);
      setShowDayPlanForm(false);
    } catch (err) {
      console.error('Create day plan failed', err)
    }
  };

  const handleUpdateDayPlan = async (
    dayPlanData: Omit<DayPlan, "id" | "createdAt" | "updatedAt">
  ) => {
    if (!selectedEvent || !editingDayPlan) return;

    try {
      // Filter out client-side only properties and prepare schedule items for API
      const scheduleForApi = dayPlanData.scheduleItems?.map((item: any) => ({
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
      })) || [];

      const updated = await api.updateDayPlan(editingDayPlan.id, {
        name: dayPlanData.name,
        date: dayPlanData.date,
        schedule: scheduleForApi
      });

      // Use the response from API to ensure we have the correct data structure
      const updatedDayPlan: DayPlan = {
        id: updated.id,
        eventId: updated.eventId,
        name: updated.name,
        date: updated.date,
        scheduleItems: updated.scheduleItems || [],
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };

      const updatedEvents = events.map((e) =>
        e.id === selectedEvent.id
          ? {
              ...e,
              dayPlans: e.dayPlans.map((d) =>
                d.id === editingDayPlan.id
                  ? updatedDayPlan
                  : d
              ),
              updatedAt: new Date().toISOString(),
            }
          : e
      );
      setEventsState(updatedEvents);
      setSelectedEvent(
        updatedEvents.find((e) => e.id === selectedEvent.id) || null
      );
      setEditingDayPlan(null);
      setShowDayPlanForm(false);
    } catch (err) {
      console.error('Update day plan failed', err)
    }
  };

  const handleDeleteDayPlan = (dayPlanId: string) => {
    if (!selectedEvent) return;
    setDeleteConfirm({ isOpen: true, type: 'dayPlan', id: dayPlanId });
  };

  const confirmDeleteDayPlan = async () => {
    if (!selectedEvent) return;
    const dayPlanId = deleteConfirm.id;
    try {
      await api.deleteDayPlan(dayPlanId);
      const updatedEvents = events.map((e) =>
        e.id === selectedEvent.id
          ? {
            ...e,
            dayPlans: e.dayPlans.filter((d) => d.id !== dayPlanId),
            updatedAt: new Date().toISOString(),
          }
          : e
      );
      setEventsState(updatedEvents);
      setSelectedEvent(
        updatedEvents.find((e) => e.id === selectedEvent.id) || null
      );
      setDeleteConfirm({ isOpen: false, type: 'dayPlan', id: '' });
    } catch (err) {
      console.error('Delete day plan failed', err);
      setDeleteConfirm({ isOpen: false, type: 'dayPlan', id: '' });
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch { }
    navigate("/");
  };

  // Filter events based on search query
  const filteredEvents = useMemo(() => {
    let result = events;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(event =>
        event.name.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.dayPlans.some(dp =>
          dp.name.toLowerCase().includes(query) ||
          new Date(dp.date).toLocaleDateString('de-DE').includes(query)
        )
      );
    }
    if (selectedEventTags.size > 0) {
      result = result.filter(event =>
        event.tags && event.tags.some((tag: any) => selectedEventTags.has(tag.id))
      );
    }
    return result;
  }, [events, searchQuery, selectedEventTags]);

  // Filter day plans for selected event
  const filteredDayPlans = useMemo(() => {
    if (!selectedEvent) return [];
    let result = selectedEvent.dayPlans;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(dp =>
        dp.name.toLowerCase().includes(query) ||
        new Date(dp.date).toLocaleDateString('de-DE').includes(query)
      );
    }
    if (selectedScheduleItemTags.size > 0) {
      result = result.filter(dp =>
        dp.scheduleItems && dp.scheduleItems.some((item: any) =>
          item.tags && item.tags.some((tag: any) => selectedScheduleItemTags.has(tag.id))
        )
      );
    }
    return result;
  }, [selectedEvent, searchQuery, selectedScheduleItemTags]);

  // Toggle event collapse
  const toggleEventCollapse = (eventId: string) => {
    setCollapsedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  // Calculate stats
  // const stats = useMemo(() => {
  //   const totalDayPlans = events.reduce((sum, e) => sum + e.dayPlans.length, 0);
  //   const totalScheduleItems = events.reduce((sum, e) => 
  //     sum + e.dayPlans.reduce((s, dp) => s + dp.schedule.length, 0), 0
  //   );
  //   return { totalEvents: events.length, totalDayPlans, totalScheduleItems };
  // }, [events]);

  const handleSaveSchedule = async (schedule: ScheduleItem[]) => {
    if (!selectedEvent || !managingSchedule) return;

    try {
      // Prepare schedule payload for API (strip any client-only fields)
      const scheduleForApi = schedule.map((item: any) => ({
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

      // Persist to server
      const updated = await api.updateDayPlan(managingSchedule.id, {
        schedule: scheduleForApi,
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

      const updatedEvents = events.map((e) =>
        e.id === selectedEvent.id
          ? {
              ...e,
              dayPlans: e.dayPlans.map((d) => (d.id === managingSchedule.id ? updatedDayPlan : d)),
              updatedAt: new Date().toISOString(),
            }
          : e
      );

      setEventsState(updatedEvents);
      setSelectedEvent(updatedEvents.find((e) => e.id === selectedEvent.id) || null);
      setManagingSchedule(null);
    } catch (err) {
      console.error('Save schedule failed', err);
    }
  };

  // Show Schedule Manager
  if (managingSchedule) {
    return (
      <ScheduleManager
        schedule={managingSchedule.scheduleItems}
        onSave={handleSaveSchedule}
        onCancel={() => setManagingSchedule(null)}
      />
    );
  }

  // Show Sharing Manager
  if (sharingDayPlan) {
    return (
      <div className={styles.adminWrapper} role="main" aria-label="Plan teilen">
        <FlipchartBackground />
        <main className={styles.adminContent}>
          <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div className="mb-6">
              <button
                onClick={() => setSharingDayPlan(null)}
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
                  marginBottom: '2rem'
                }}
              >
                <span style={{fontSize: '1.2em', lineHeight: 1}}>&larr;</span>
                Zurück zum Dashboard
              </button>
              <h1 style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                marginBottom: '0.5rem',
                color: '#1f2937'
              }}>
                Plan teilen: {sharingDayPlan.name}
              </h1>
              <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
                Erstellen und verwalten Sie geteilte Links für diesen Plan
              </p>
            </div>
            <SharedPlansManager
              dayPlanId={sharingDayPlan.id}
              dayPlanName={sharingDayPlan.name}
            />
          </div>
        </main>
      </div>
    );
  }

  // Show forms
  if (showEventForm) {
    return (
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          padding: "2rem 1rem",
        }}
      >
        <EventForm
          event={editingEvent}
          organizationId={orgId!}
          onSave={editingEvent ? handleUpdateEvent : handleCreateEvent}
          onCancel={() => {
            setShowEventForm(false);
            setEditingEvent(null);
          }}
        />
      </div>
    );
  }

  if (showWizard) {
    return (
      <EventCreationWizard
        organizationId={orgId!}
        editingEvent={editingEvent}
        editingDayPlan={editingDayPlan}
        onClose={() => {
          setShowWizard(false);
          setEditingEvent(null);
          setEditingDayPlan(null);
        }}
        onCreated={(newEvent) => {
          if (editingEvent) {
            // Update existing event in the list
            setEventsState(events.map(e => e.id === editingEvent.id ? newEvent : e));
            setSelectedEvent(newEvent);
          } else if (editingDayPlan) {
            // Update the event that contains the editingDayPlan
            setEventsState(events.map(e => 
              e.dayPlans.some(dp => dp.id === editingDayPlan.id) ? 
                { ...e, dayPlans: e.dayPlans.map(dp => dp.id === editingDayPlan.id ? newEvent.dayPlans[0] : dp) } : 
                e
            ));
            // Also update selectedEvent if it has the dayPlan
            if (selectedEvent && selectedEvent.dayPlans.some(dp => dp.id === editingDayPlan.id)) {
              setSelectedEvent({
                ...selectedEvent,
                dayPlans: selectedEvent.dayPlans.map(dp => dp.id === editingDayPlan.id ? newEvent.dayPlans[0] : dp)
              });
            }
          } else {
            // Add new event
            setEventsState([...events, newEvent]);
            setSelectedEvent(newEvent);
          }
          setShowWizard(false);
          setEditingEvent(null);
          setEditingDayPlan(null);
        }}
      />
    );
  }

  if (showDayPlanForm && selectedEvent) {
    return (
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          padding: "2rem 1rem",
        }}
      >
        <DayPlanForm
          dayPlan={editingDayPlan}
          event={selectedEvent}
          onSave={editingDayPlan ? handleUpdateDayPlan : handleCreateDayPlan}
          onCancel={() => {
            setShowDayPlanForm(false);
            setEditingDayPlan(null);
          }}
        />
      </div>
    );
  }

  // Main dashboard view
  const cardStyle = {
    background: "#fff",
    borderRadius: "1.2rem 1.35rem 1.15rem 1.25rem",
    boxShadow: "2px 4px 0 #e5e7eb, 0 2px 8px 0 rgba(0,0,0,0.08)",
    padding: "2rem",
    border: "2px solid #181818",
    position: "relative" as const,
    transform: "rotate(-0.2deg)",
  };

  const buttonStyle = {
    padding: "clamp(0.625rem, 2vw, 0.75rem) clamp(1.25rem, 3vw, 1.5rem)",
    border: "2px solid #181818",
    borderRadius: "8px",
    fontSize: "clamp(0.875rem, 2vw, 0.95rem)",
    fontWeight: "700",
    fontFamily: '"Inter", "Roboto", Arial, sans-serif',
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    transition: "all 0.2s ease",
    boxShadow: "2px 4px 0 #181818",
    textShadow: "0 1px 2px rgba(0,0,0,0.1)",
  };

  return (
    <div className={styles.adminWrapper} role="main" aria-label="Dashboard">
      <FlipchartBackground />

      <main
        className={styles.adminContent}
        style={{
          padding: "2rem 1rem",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* Header Card */}
        <div
          style={{
            ...cardStyle,
            marginBottom: "2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1.5rem",
          }}
        >
          <div className={styles.tape} />

          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <img
              src={organisationLogo ? (organisationLogo.startsWith('http') ? organisationLogo : `${organisationLogo}`) : chaosOpsLogo}
              alt={organisationLogo ? `${organisationName} Logo` : "Chaos Ops Logo"}
              style={{
                maxWidth: "150px",
                height: "auto",
                maxHeight: "80px",
                objectFit: "contain",
                filter: "drop-shadow(2px 4px 8px rgba(0,0,0,0.1))",
              }}
              onError={(e) => {
                // Fallback to Chaos Ops logo if organization logo fails to load
                e.currentTarget.src = chaosOpsLogo;
              }}
            />
            <div>
              <h1
                style={{
                  fontFamily:
                    '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                  fontSize: "clamp(1.5rem, 4vw, 2rem)",
                  fontWeight: "700",
                  color: "#0f172a",
                  margin: 0,
                  marginBottom: "0.25rem",
                  textShadow:
                    "2px 2px 0 #fff, 0 3px 6px rgba(251, 191, 36, 0.8)",
                }}
              >
                Admin Dashboard
              </h1>
              <p
                style={{
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  fontSize: "clamp(0.875rem, 2vw, 1rem)",
                  color: "#334155",
                  margin: 0,
                  fontWeight: "500",
                }}
              >
                {organisationName || "Organisation"}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <button
              onClick={() => setShowDevicePairingModal(true)}
              style={{
                ...buttonStyle,
                backgroundColor: "#fff",
                color: "#8b5cf6",
                border: "2px solid #8b5cf6",
                boxShadow: "2px 4px 0 #8b5cf6",
                padding: "clamp(0.5rem, 1.5vw, 0.75rem) clamp(0.75rem, 2vw, 1.5rem)",
                fontSize: "clamp(0.875rem, 2vw, 0.95rem)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "3px 6px 0 #8b5cf6";
                e.currentTarget.style.backgroundColor = "#faf5ff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "2px 4px 0 #8b5cf6";
                e.currentTarget.style.backgroundColor = "#fff";
              }}
              title="Display koppeln"
            >
              <Plus size={18} />
              <span style={{ display: window.innerWidth < 480 ? 'none' : 'inline' }}>Display</span>
            </button>
            <button
              onClick={() => navigate(`/admin/settings?org=${orgId}`)}
              style={{
                ...buttonStyle,
                backgroundColor: "#fff",
                color: "#6366f1",
                border: "2px solid #6366f1",
                boxShadow: "2px 4px 0 #6366f1",
                padding: "clamp(0.5rem, 1.5vw, 0.75rem) clamp(0.75rem, 2vw, 1.5rem)",
                fontSize: "clamp(0.875rem, 2vw, 0.95rem)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "3px 6px 0 #6366f1";
                e.currentTarget.style.backgroundColor = "#eef2ff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "2px 4px 0 #6366f1";
                e.currentTarget.style.backgroundColor = "#fff";
              }}
              title="Organisation Settings"
            >
              <Settings size={18} />
              <span style={{ display: window.innerWidth < 480 ? 'none' : 'inline' }}>Einstellungen</span>
            </button>
            <button
              onClick={handleLogout}
              style={{
                ...buttonStyle,
                backgroundColor: "#fff",
                color: "#dc2626",
                border: "2px solid #dc2626",
                boxShadow: "2px 4px 0 #dc2626",
                padding: "clamp(0.5rem, 1.5vw, 0.75rem) clamp(0.75rem, 2vw, 1.5rem)",
                fontSize: "clamp(0.875rem, 2vw, 0.95rem)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "3px 6px 0 #dc2626";
                e.currentTarget.style.backgroundColor = "#fee2e2";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "2px 4px 0 #dc2626";
                e.currentTarget.style.backgroundColor = "#fff";
              }}
            >
              <LogOut size={18} />
              <span style={{ display: window.innerWidth < 480 ? 'none' : 'inline' }}>Abmelden</span>
            </button>
          </div>
        </div>

        {/* Search & View Toggle */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'center',
            maxWidth: '1400px',
            margin: '0 auto',
            width: '100%',
            flexWrap: 'wrap'
          }}>
            {/* Search Bar */}
            <div style={{ flex: '1 1 300px', position: 'relative' }}>
              <Search 
                size={18} 
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b',
                  pointerEvents: 'none'
                }}
              />
              <input
                type="text"
                placeholder="Veranstaltungen oder Tagespläne suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 8rem 0.75rem 3rem',
                  border: '2px solid #cbd5e1',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  backgroundColor: '#fff',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#0ea5e9';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              
              {/* Filter Button */}
              <button
                onClick={() => setShowTagFilter(!showTagFilter)}
                style={{
                  position: 'absolute',
                  right: searchQuery ? '3rem' : '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  padding: '0.5rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontSize: '0.85rem',
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  border: 'none',
                  backgroundColor: 'transparent',
                }}
              >
                <Filter size={14} />
                {(selectedEventTags.size + selectedScheduleItemTags.size) > 0 && (
                  <span>{selectedEventTags.size + selectedScheduleItemTags.size}</span>
                )}
              </button>

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                    e.currentTarget.style.color = '#dc2626';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#64748b';
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* View Toggle */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              padding: '0.25rem',
              backgroundColor: '#f1f5f9',
              borderRadius: '8px',
              border: '2px solid #cbd5e1'
            }}>
              <button
                onClick={() => setViewMode('detailed')}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: viewMode === 'detailed' ? '#fff' : 'transparent',
                  color: viewMode === 'detailed' ? '#0f172a' : '#64748b',
                  cursor: 'pointer',
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease',
                  boxShadow: viewMode === 'detailed' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                <Grid size={16} />
                Details
              </button>
              <button
                onClick={() => setViewMode('compact')}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: viewMode === 'compact' ? '#fff' : 'transparent',
                  color: viewMode === 'compact' ? '#0f172a' : '#64748b',
                  cursor: 'pointer',
                  fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease',
                  boxShadow: viewMode === 'compact' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                <List size={16} />
                Kompakt
              </button>
            </div>
          </div>

          {/* Tag Filter Dropdown */}
          {showTagFilter && (
            <div style={{
              maxWidth: '1400px',
              margin: '0.75rem auto 0',
              width: '100%',
              backgroundColor: '#fff',
              border: '2px solid #181818',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '2px 4px 0 #e5e7eb, 0 2px 8px 0 rgba(0,0,0,0.08)',
              animation: 'slideDown 0.2s ease',
              position: 'relative' as const,
              transform: 'rotate(0.1deg)',
            }}>
              <style>
                {`
                  @keyframes slideDown {
                    from {
                      opacity: 0;
                      transform: translateY(-10px) rotate(0.1deg);
                    }
                    to {
                      opacity: 1;
                      transform: translateY(0) rotate(0.1deg);
                    }
                  }
                `}
              </style>

              {(eventTags.length === 0 && scheduleItemTags.length === 0) && (
                <div style={{
                  textAlign: 'center',
                  color: '#64748b',
                  fontSize: '1rem',
                  fontWeight: 500,
                  padding: '2rem 0'
                }}>
                  Keine Tags zum Filtern vorhanden.
                </div>
              )}

              {eventTags.length > 0 && (
                <div style={{ marginBottom: scheduleItemTags.length > 0 ? '1.5rem' : '0' }}>
                  <div style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    fontFamily: '"Gloria Hallelujah", "Caveat", cursive',
                    color: '#0f172a',
                    marginBottom: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <div style={{
                      width: '4px',
                      height: '16px',
                      backgroundColor: '#a855f7',
                      borderRadius: '2px'
                    }} />
                    Veranstaltungs-Tags
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
                    {eventTags.map(tag => (
                      <button
                        key={tag.id}
                        onClick={() => {
                          const newSelected = new Set(selectedEventTags);
                          if (newSelected.has(tag.id)) {
                            newSelected.delete(tag.id);
                          } else {
                            newSelected.add(tag.id);
                          }
                          setSelectedEventTags(newSelected);
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          border: `2px solid ${tag.color}`,
                          borderRadius: '20px',
                          backgroundColor: selectedEventTags.has(tag.id) ? tag.color : '#fff',
                          color: selectedEventTags.has(tag.id) ? '#fff' : tag.color,
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          boxShadow: selectedEventTags.has(tag.id) ? `2px 4px 0 ${tag.color}` : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!selectedEventTags.has(tag.id)) {
                            e.currentTarget.style.backgroundColor = `${tag.color}15`;
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedEventTags.has(tag.id)) {
                            e.currentTarget.style.backgroundColor = '#fff';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {scheduleItemTags.length > 0 && (
                <div>
                  <div style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    fontFamily: '"Gloria Hallelujah", "Caveat", cursive',
                    color: '#0f172a',
                    marginBottom: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <div style={{
                      width: '4px',
                      height: '16px',
                      backgroundColor: '#10b981',
                      borderRadius: '2px'
                    }} />
                    Termin-Tags
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
                    {scheduleItemTags.map(tag => (
                      <button
                        key={tag.id}
                        onClick={() => {
                          const newSelected = new Set(selectedScheduleItemTags);
                          if (newSelected.has(tag.id)) {
                            newSelected.delete(tag.id);
                          } else {
                            newSelected.add(tag.id);
                          }
                          setSelectedScheduleItemTags(newSelected);
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          border: `2px solid ${tag.color}`,
                          borderRadius: '20px',
                          backgroundColor: selectedScheduleItemTags.has(tag.id) ? tag.color : '#fff',
                          color: selectedScheduleItemTags.has(tag.id) ? '#fff' : tag.color,
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          boxShadow: selectedScheduleItemTags.has(tag.id) ? `2px 4px 0 ${tag.color}` : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!selectedScheduleItemTags.has(tag.id)) {
                            e.currentTarget.style.backgroundColor = `${tag.color}15`;
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedScheduleItemTags.has(tag.id)) {
                            e.currentTarget.style.backgroundColor = '#fff';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content Grid */}

        {orgId && (() => {
          // Calculate next item information for LivePlanControl
          const getNextItemInfo = () => {
            if (!selectedEvent?.dayPlans?.[0]?.scheduleItems) return null;
            
            const dayPlan = selectedEvent.dayPlans[0];
            const now = new Date();
            
            // Helper to convert HH:MM to Date on the dayPlan date
            const toDate = (dateStr: string, timeStr: string) => {
              const d = new Date(dateStr);
              const parts = (timeStr || '00:00').split(':').map((p) => parseInt(p, 10));
              d.setHours(parts[0] || 0, parts[1] || 0, 0, 0);
              return d;
            };

            // Find next upcoming schedule item (consider existing delay when deciding)
            const nextItem = dayPlan.scheduleItems.find((si: any) => {
              const base = toDate(dayPlan.date, si.time || '00:00');
              const existingDelay = typeof si.delay === 'number' ? si.delay : 0;
              base.setMinutes(base.getMinutes() + existingDelay);
              return base >= now;
            });

            if (!nextItem) return null;

            // Calculate the adjusted time with delay
            const baseTime = toDate(dayPlan.date, nextItem.time || '00:00');
            const adjustedDelay = typeof nextItem.delay === 'number' ? nextItem.delay : 0;
            baseTime.setMinutes(baseTime.getMinutes() + adjustedDelay);
            
            const timeStr = baseTime.toLocaleTimeString('de-DE', { 
              hour: '2-digit', 
              minute: '2-digit' 
            });

            return {
              title: nextItem.title,
              time: timeStr
            };
          };

          const nextItemInfo = getNextItemInfo();

          return (
            <LivePlanControl
              organisationId={orgId}
              selectedDayPlanId={selectedEvent?.dayPlans?.[0]?.id || null}
              nextItemTitle={nextItemInfo?.title}
              nextItemTime={nextItemInfo?.time}
              onDelay={async (minutes) => {
                if (!selectedEvent || !selectedEvent.dayPlans || selectedEvent.dayPlans.length === 0) {
                  setAlertModal({
                    isOpen: true,
                    title: 'Fehler',
                    message: 'Kein Tagesplan ausgewählt.',
                    type: 'error'
                  });
                  return;
                }

                const dayPlanId = selectedEvent.dayPlans[0].id;
                try {
                  const dayPlan = await api.getDayPlan(dayPlanId);
                  console.debug('[LiveDelay] fetched dayPlan', dayPlanId, dayPlan?.scheduleItems?.length);

                  // Helper to convert HH:MM to Date on the dayPlan date
                  const toDate = (dateStr: string, timeStr: string) => {
                    const d = new Date(dateStr);
                    const parts = (timeStr || '00:00').split(':').map((p) => parseInt(p, 10));
                    d.setHours(parts[0] || 0, parts[1] || 0, 0, 0);
                    return d;
                  };

                  const now = new Date();

                  // Find next upcoming schedule item (consider existing delay when deciding)
                  const nextItem = (dayPlan.scheduleItems || []).find((si: any) => {
                    const base = toDate(dayPlan.date, si.time || '00:00');
                    const existingDelay = typeof si.delay === 'number' ? si.delay : 0;
                    base.setMinutes(base.getMinutes() + existingDelay);
                    return base >= now;
                  });

                  if (!nextItem) {
                    setAlertModal({
                      isOpen: true,
                      title: 'Fehler',
                      message: 'Kein kommendes Element im Tagesplan gefunden.',
                      type: 'error'
                    });
                    return;
                  }

                  // Build updated schedule array including updated delay for the target item
                  const updatedSchedule = (dayPlan.scheduleItems || []).map((si: any) => {
                    if (si.id === nextItem.id) {
                      return { ...si, delay: (typeof si.delay === 'number' ? si.delay : 0) + minutes };
                    }
                    return si;
                  }).map((si: any) => ({
                    time: si.time,
                    type: si.type,
                    title: si.title,
                    speaker: si.speaker,
                    location: si.location,
                    details: si.details,
                    materials: si.materials,
                    duration: si.duration,
                    snacks: si.snacks,
                    facilitator: si.facilitator,
                    delay: typeof si.delay === 'number' ? si.delay : undefined,
                  }));

                  // Persist updated schedule to server
                  console.debug('[LiveDelay] sending updated schedule for dayPlan', dayPlanId, updatedSchedule);
                  const updated = await api.updateDayPlan(dayPlanId, { schedule: updatedSchedule });
                  console.debug('[LiveDelay] updateDayPlan response', updated);

                  // Update local events state with returned dayPlan
                  const updatedDayPlan: DayPlan = {
                    id: updated.id,
                    eventId: updated.eventId,
                    name: updated.name,
                    date: updated.date,
                    scheduleItems: updated.scheduleItems || [],
                    createdAt: updated.createdAt,
                    updatedAt: updated.updatedAt,
                  };

                  const updatedEvents = events.map((e) =>
                    e.id === selectedEvent.id
                      ? {
                          ...e,
                          dayPlans: e.dayPlans.map((d) => (d.id === dayPlanId ? updatedDayPlan : d)),
                          updatedAt: new Date().toISOString(),
                        }
                      : e
                  );

                  setEventsState(updatedEvents);
                  setSelectedEvent(updatedEvents.find((e) => e.id === selectedEvent.id) || null);

                  window.alert(`+${minutes} Minuten zur nächsten Aktion hinzugefügt (${nextItem.title}).`);
                } catch (err) {
                  console.error('Failed to apply delay to next item', err);
                  window.alert('Fehler beim Anwenden der Zeitverzögerung.');
                }
              }}
          />
          );
        })()}

        {/* Add spacing between live controls and Veranstaltungen */}
        <div style={{ height: "2.5rem" }} />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "clamp(1.25rem, 3vw, 2rem)",
            maxWidth: "1400px",
            margin: "0 auto",
            width: "100%"
          }}
        >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: selectedEvent
              ? "repeat(auto-fit, minmax(min(100%, 380px), 1fr))"
              : "1fr",
            gap: "clamp(1.25rem, 3vw, 2rem)",
            alignItems: "start",
            width: "100%",
            maxWidth: "1400px"
          }}
        >
          {/* Events List */}
          <div style={cardStyle}>
            <div
              style={{
                position: "absolute",
                top: "-12px",
                left: "30%",
                width: "45px",
                height: "16px",
                background:
                  "repeating-linear-gradient(135deg, #fffbe7 0 6px, #fbbf24 6px 12px)",
                borderRadius: "6px",
                border: "1.5px solid #f59e0b",
                boxShadow: "0 1px 4px rgba(245,158,11,0.3)",
                transform: "translateX(-50%) rotate(-2deg)",
                zIndex: 2,
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h2
                style={{
                  fontFamily:
                    '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                  fontSize: "clamp(1.25rem, 3vw, 1.5rem)",
                  fontWeight: "700",
                  color: "#0f172a",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  margin: 0,
                }}
              >
                <Folder size={24} strokeWidth={2.5} />
                Veranstaltungen ({filteredEvents.length}{filteredEvents.length !== events.length ? ` von ${events.length}` : ''})
              </h2>
              <button
                onClick={() => setShowWizard(true)}
                style={{
                  ...buttonStyle,
                  backgroundColor: "#fbbf24",
                  color: "#fff",
                  padding: "0.625rem 1.25rem",
                  fontSize: "0.9rem",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "3px 6px 0 #181818";
                  e.currentTarget.style.backgroundColor = "#f59e0b";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "2px 4px 0 #181818";
                  e.currentTarget.style.backgroundColor = "#fbbf24";
                }}
              >
                <Plus size={18} strokeWidth={2.5} />
                Neu
              </button>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {filteredEvents.length === 0 ? (
                <div
                  style={{
                    padding: "2.5rem",
                    textAlign: "center",
                    border: "2px dashed #cbd5e1",
                    borderRadius: "12px",
                    color: "#64748b",
                    fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                    fontSize: "1rem",
                    fontWeight: "500",
                    backgroundColor: "#f8fafc",
                  }}
                >
                  {searchQuery ? `Keine Ergebnisse für "${searchQuery}"` : 'Noch keine Veranstaltungen. Klicke auf "Neu" um zu starten!'}
                </div>
              ) : (
                filteredEvents.map((event) => {
                  const isCollapsed = collapsedEvents.has(event.id);
                  const isCompact = viewMode === 'compact';
                  
                  return (
                  <div
                    key={event.id}
                    style={{
                      border: `2px solid ${
                        selectedEvent?.id === event.id ? "#181818" : "#cbd5e1"
                      }`,
                      borderRadius: "12px",
                      backgroundColor:
                        selectedEvent?.id === event.id ? "#fef3c7" : "#f8fafc",
                      transition: "all 0.2s ease",
                      boxShadow:
                        selectedEvent?.id === event.id
                          ? "2px 4px 0 #181818"
                          : "0 1px 3px rgba(0,0,0,0.1)",
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedEvent?.id !== event.id) {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "2px 4px 0 #cbd5e1";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedEvent?.id !== event.id) {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 1px 3px rgba(0,0,0,0.1)";
                      }
                    }}
                  >
                    {/* Event Header - Always visible */}
                    <div
                      onClick={() => setSelectedEvent(event)}
                      style={{
                        padding: isCompact ? "0.875rem 1rem" : "1.25rem",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        gap: "1rem",
                      }}
                    >
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {/* Collapse Toggle */}
                        {!isCompact && event.dayPlans.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleEventCollapse(event.id);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              display: 'flex',
                              alignItems: 'center',
                              color: '#64748b',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#0f172a';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = '#64748b';
                            }}
                          >
                            {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                          </button>
                        )}
                        
                        <div style={{ flex: 1 }}>
                          <h3
                            style={{
                              fontFamily:
                                '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                              fontSize: isCompact ? "1rem" : "clamp(1.1rem, 2.5vw, 1.25rem)",
                              fontWeight: "700",
                              color: "#0f172a",
                              marginBottom: isCompact || !event.description ? "0.25rem" : "0.5rem",
                              margin: 0,
                            }}
                          >
                            {event.name}
                          </h3>
                          {!isCompact && event.description && (
                            <p
                              style={{
                                fontFamily:
                                  '"Inter", "Roboto", Arial, sans-serif',
                                fontSize: "0.9rem",
                                color: "#475569",
                                marginBottom: "0.75rem",
                                fontWeight: "500",
                                margin: "0.5rem 0 0 0"
                              }}
                            >
                              {event.description}
                            </p>
                          )}
                          <div
                            style={{
                              fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                              fontSize: "0.85rem",
                              color: "#64748b",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              fontWeight: "600",
                              marginTop: isCompact ? "0" : "0.5rem"
                            }}
                          >
                            <FileText size={14} strokeWidth={2} />
                            {event.dayPlans.length} Tagesplan
                            {event.dayPlans.length !== 1 ? "e" : ""}
                          </div>
                        </div>
                      </div>
                      
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          flexWrap: "wrap",
                          flexShrink: 0,
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingEvent(event);
                            setShowWizard(true);
                          }}
                          style={{
                            padding: "0.5rem",
                            border: "2px solid #0ea5e9",
                            borderRadius: "6px",
                            backgroundColor: "#f0f9ff",
                            color: "#0284c7",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            boxShadow: "1px 2px 0 #0ea5e9",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#e0f2fe";
                            e.currentTarget.style.transform =
                              "translateY(-1px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#f0f9ff";
                            e.currentTarget.style.transform = "translateY(0)";
                          }}
                          title="Bearbeiten"
                        >
                          <Edit size={16} strokeWidth={2} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEvent(event.id);
                          }}
                          style={{
                            padding: "0.5rem",
                            border: "2px solid #ef4444",
                            borderRadius: "6px",
                            backgroundColor: "#fef2f2",
                            color: "#dc2626",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            boxShadow: "1px 2px 0 #ef4444",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#fee2e2";
                            e.currentTarget.style.transform =
                              "translateY(-1px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#fef2f2";
                            e.currentTarget.style.transform = "translateY(0)";
                          }}
                          title="Löschen"
                        >
                          <Trash2 size={16} strokeWidth={2} />
                        </button>
                      </div>
                    </div>

                    {/* Event Day Plans Preview - Collapsible in detailed mode */}
                    {!isCompact && !isCollapsed && event.dayPlans.length > 0 && (
                      <div style={{
                        padding: '0 1.25rem 1.25rem 1.25rem',
                        borderTop: '1px solid #e2e8f0',
                        backgroundColor: 'rgba(255,255,255,0.5)'
                      }}>
                        <div style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                          color: '#64748b',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          marginBottom: '0.75rem',
                          marginTop: '0.75rem'
                        }}>
                          Tagespläne
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {event.dayPlans
                            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                            .slice(0, 3)
                            .map(dp => (
                            <div
                              key={dp.id}
                              style={{
                                padding: '0.625rem 0.875rem',
                                backgroundColor: '#fff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '0.75rem'
                              }}
                            >
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                  fontWeight: '600',
                                  color: '#0f172a',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {dp.name}
                                </div>
                                <div style={{
                                  fontSize: '0.75rem',
                                  color: '#64748b',
                                  marginTop: '0.125rem'
                                }}>
                                  {new Date(dp.date).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}
                                  {' • '}
                                  {dp.scheduleItems.length} Termin{dp.scheduleItems.length !== 1 ? 'e' : ''}
                                </div>
                              </div>
                            </div>
                          ))}
                          {event.dayPlans.length > 3 && (
                            <div style={{
                              fontSize: '0.75rem',
                              color: '#64748b',
                              textAlign: 'center',
                              fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                              fontStyle: 'italic',
                              padding: '0.25rem'
                            }}>
                              +{event.dayPlans.length - 3} weitere...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )})
              )}
            </div>
          </div>

          {/* Day Plans List - Only shown when event is selected */}
          {selectedEvent && (
            <div
              style={{
                ...cardStyle,
                transform: "rotate(0.2deg)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-12px",
                  right: "30%",
                  width: "45px",
                  height: "16px",
                  background:
                    "repeating-linear-gradient(135deg, #fffbe7 0 6px, #10b981 6px 12px)",
                  borderRadius: "6px",
                  border: "1.5px solid #059669",
                  boxShadow: "0 1px 4px rgba(5,150,105,0.3)",
                  transform: "translateX(50%) rotate(3deg)",
                  zIndex: 2,
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <h2
                  style={{
                    fontFamily:
                      '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                    fontSize: "clamp(1.25rem, 3vw, 1.5rem)",
                    fontWeight: "700",
                    color: "#0f172a",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    margin: 0,
                  }}
                >
                  <Calendar size={24} strokeWidth={2.5} />
                  Tagespläne ({filteredDayPlans.length}{filteredDayPlans.length !== selectedEvent.dayPlans.length ? ` von ${selectedEvent.dayPlans.length}` : ''})
                </h2>
                <button
                  onClick={() => setShowDayPlanForm(true)}
                  style={{
                    ...buttonStyle,
                    backgroundColor: "#10b981",
                    color: "#fff",
                    padding: "0.625rem 1.25rem",
                    fontSize: "0.9rem",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "3px 6px 0 #181818";
                    e.currentTarget.style.backgroundColor = "#059669";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "2px 4px 0 #181818";
                    e.currentTarget.style.backgroundColor = "#10b981";
                  }}
                >
                  <Plus size={18} strokeWidth={2.5} />
                  Neu
                </button>
              </div>

              <div
                style={{
                  padding: "1rem 1.25rem",
                  backgroundColor: "#fef3c7",
                  border: "2px solid #f59e0b",
                  borderRadius: "10px",
                  marginBottom: "1.5rem",
                  boxShadow: "1px 2px 0 #f59e0b",
                }}
              >
                <div
                  style={{
                    fontFamily:
                      '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                    fontSize: "1.1rem",
                    fontWeight: "700",
                    color: "#0f172a",
                    marginBottom: "0.25rem",
                  }}
                >
                  {selectedEvent.name}
                </div>
                <div
                  style={{
                    fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                    fontSize: "0.85rem",
                    color: "#78350f",
                    fontWeight: "600",
                  }}
                >
                  Ausgewählte Veranstaltung
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {filteredDayPlans.length === 0 ? (
                  <div
                    style={{
                      padding: "2.5rem",
                      textAlign: "center",
                      border: "2px dashed #cbd5e1",
                      borderRadius: "12px",
                      color: "#64748b",
                      fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                      fontSize: "1rem",
                      fontWeight: "500",
                      backgroundColor: "#f8fafc",
                    }}
                  >
                    {searchQuery ? `Keine Ergebnisse für "${searchQuery}"` : 'Noch keine Tagespläne. Klicke auf "Neu" um einen zu erstellen!'}
                  </div>
                ) : (
                  filteredDayPlans
                    .sort(
                      (a, b) =>
                        new Date(a.date).getTime() - new Date(b.date).getTime()
                    )
                    .map((dayPlan) => (
                      <div
                        key={dayPlan.id}
                        style={{
                          padding: "1.25rem",
                          border: "2px solid #cbd5e1",
                          borderRadius: "12px",
                          backgroundColor: "#f8fafc",
                          transition: "all 0.2s ease",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "2px 4px 0 #cbd5e1";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow =
                            "0 1px 3px rgba(0,0,0,0.1)";
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "start",
                            gap: "1rem",
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <h3
                              style={{
                                fontFamily:
                                  '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                                fontSize: "clamp(1.1rem, 2.5vw, 1.25rem)",
                                fontWeight: "700",
                                color: "#0f172a",
                                marginBottom: "0.5rem",
                                margin: 0,
                              }}
                            >
                              {dayPlan.name}
                            </h3>
                            <p
                              style={{
                                fontFamily:
                                  '"Inter", "Roboto", Arial, sans-serif',
                                fontSize: "0.9rem",
                                color: "#475569",
                                marginBottom: "0.75rem",
                                fontWeight: "500",
                              }}
                            >
                              {new Date(dayPlan.date).toLocaleDateString(
                                "de-DE",
                                {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </p>
                            <div
                              style={{
                                fontFamily:
                                  '"Inter", "Roboto", Arial, sans-serif',
                                fontSize: "0.85rem",
                                color: "#64748b",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                fontWeight: "600",
                              }}
                            >
                              <Calendar size={14} strokeWidth={2} />
                              {dayPlan.scheduleItems.length} Termin
                              {dayPlan.scheduleItems.length !== 1 ? "e" : ""}
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: "0.5rem",
                              flexWrap: "wrap",
                              flexShrink: 0,
                            }}
                          >
                            <button
                              onClick={() => setManagingSchedule(dayPlan)}
                              style={{
                                padding: "0.5rem",
                                border: "2px solid #f59e0b",
                                borderRadius: "6px",
                                backgroundColor: "#fffbeb",
                                color: "#f59e0b",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                boxShadow: "1px 2px 0 #f59e0b",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#fef3c7";
                                e.currentTarget.style.transform =
                                  "translateY(-1px)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#fffbeb";
                                e.currentTarget.style.transform =
                                  "translateY(0)";
                              }}
                              title="Termine verwalten"
                            >
                              <Clock size={16} strokeWidth={2} />
                            </button>
                            <button
                              onClick={() => {
                                navigate(
                                  `/planner?dayPlanId=${dayPlan.id}&org=${orgId}`
                                );
                              }}
                              style={{
                                padding: "0.5rem",
                                border: "2px solid #10b981",
                                borderRadius: "6px",
                                backgroundColor: "#f0fdf4",
                                color: "#10b981",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                boxShadow: "1px 2px 0 #10b981",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#d1fae5";
                                e.currentTarget.style.transform =
                                  "translateY(-1px)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#f0fdf4";
                                e.currentTarget.style.transform =
                                  "translateY(0)";
                              }}
                              title="Vorschau"
                            >
                              <Eye size={16} strokeWidth={2} />
                            </button>
                            <button
                              onClick={() => setSharingDayPlan(dayPlan)}
                              style={{
                                padding: "0.5rem",
                                border: "2px solid #8b5cf6",
                                borderRadius: "6px",
                                backgroundColor: "#faf5ff",
                                color: "#8b5cf6",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                boxShadow: "1px 2px 0 #8b5cf6",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#f3e8ff";
                                e.currentTarget.style.transform =
                                  "translateY(-1px)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#faf5ff";
                                e.currentTarget.style.transform =
                                  "translateY(0)";
                              }}
                              title="Plan teilen"
                            >
                              <Share2 size={16} strokeWidth={2} />
                            </button>
                            <button
                              onClick={() => {
                                setEditingDayPlan(dayPlan);
                                setShowDayPlanForm(true);
                              }}
                              style={{
                                padding: "0.5rem",
                                border: "2px solid #0ea5e9",
                                borderRadius: "6px",
                                backgroundColor: "#f0f9ff",
                                color: "#0284c7",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                boxShadow: "1px 2px 0 #0ea5e9",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#e0f2fe";
                                e.currentTarget.style.transform =
                                  "translateY(-1px)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#f0f9ff";
                                e.currentTarget.style.transform =
                                  "translateY(0)";
                              }}
                              title="Bearbeiten"
                            >
                              <Edit size={16} strokeWidth={2} />
                            </button>
                            <button
                              onClick={() => handleDeleteDayPlan(dayPlan.id)}
                              style={{
                                padding: "0.5rem",
                                border: "2px solid #ef4444",
                                borderRadius: "6px",
                                backgroundColor: "#fef2f2",
                                color: "#dc2626",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                boxShadow: "1px 2px 0 #ef4444",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#fee2e2";
                                e.currentTarget.style.transform =
                                  "translateY(-1px)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#fef2f2";
                                e.currentTarget.style.transform =
                                  "translateY(0)";
                              }}
                              title="Löschen"
                            >
                              <Trash2 size={16} strokeWidth={2} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}
        </div>
        </div>
      </main>

      {/* Delete Confirmation Modals */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen && deleteConfirm.type === 'event'}
        onClose={() => setDeleteConfirm({ isOpen: false, type: 'event', id: '' })}
        onConfirm={confirmDeleteEvent}
        title="Veranstaltung löschen"
        message="Möchten Sie diese Veranstaltung wirklich löschen? Alle Tagespläne werden ebenfalls gelöscht."
        confirmText="Löschen"
        cancelText="Abbrechen"
        type="error"
      />

      <ConfirmModal
        isOpen={deleteConfirm.isOpen && deleteConfirm.type === 'dayPlan'}
        onClose={() => setDeleteConfirm({ isOpen: false, type: 'dayPlan', id: '' })}
        onConfirm={confirmDeleteDayPlan}
        title="Tagesplan löschen"
        message="Möchten Sie diesen Tagesplan wirklich löschen?"
        confirmText="Löschen"
        cancelText="Abbrechen"
        type="error"
      />

      {/* Display Pairing Modal */}
      <DisplayPairingModal
        isOpen={showDevicePairingModal}
        onClose={() => setShowDevicePairingModal(false)}
        orgId={orgId || ''}
      />

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
};

export default Dashboard;