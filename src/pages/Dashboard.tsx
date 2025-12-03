import React, { useState, useEffect } from 'react';
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
} from "lucide-react";
import EventForm from "../components/forms/EventForm";
import DayPlanForm from "../components/forms/DayPlanForm";
import ScheduleManager from "../components/planner/ScheduleManager";
import EventCreationWizard from "../components/forms/EventCreationWizard";
import FlipchartBackground from "../components/layout/FlipchartBackground";
import { ConfirmModal } from "../components/ui";
import type { Event, DayPlan } from "../types/event";
import type { ScheduleItem } from "../types/schedule";
import styles from "./Admin.module.css";
import chaosOpsLogo from "../assets/Chaos-Ops Logo.png";
import { api } from "../lib/api";

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
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'event' | 'dayPlan';
    id: string;
  }>({ isOpen: false, type: 'event', id: '' });

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
      } catch {}
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
        const serverEvents = await api.listEvents(orgId)
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
        )
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
        organizationId: orgId!,
        createdAt: new Date(created.createdAt),
        updatedAt: new Date(created.updatedAt),
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
        ? { ...e, ...eventData, updatedAt: new Date() }
        : e
    );
    setEventsState(updatedEvents);
    setEditingEvent(null);
    setShowEventForm(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    setDeleteConfirm({ isOpen: true, type: 'event', id: eventId });
  };

  const confirmDeleteEvent = () => {
    const eventId = deleteConfirm.id;
    setEventsState(events.filter((e) => e.id !== eventId));
    if (selectedEvent?.id === eventId) {
      setSelectedEvent(null);
    }
    setDeleteConfirm({ isOpen: false, type: 'event', id: '' });
  };

  // DayPlan CRUD operations
  const handleCreateDayPlan = async (
    dayPlanData: Omit<DayPlan, "id" | "createdAt" | "updatedAt">
  ) => {
    if (!selectedEvent) return;
    try {
      const created = await api.createDayPlan(selectedEvent.id, { name: dayPlanData.name, date: dayPlanData.date, schedule: dayPlanData.schedule })
      const newDayPlan: DayPlan = {
        id: created.id,
        eventId: selectedEvent.id,
        name: created.name,
        date: created.date,
        schedule: (created.scheduleItems || []).map((si: any) => ({ id: si.id, time: si.time, type: si.type, title: si.title })),
        createdAt: new Date(created.createdAt),
        updatedAt: new Date(created.updatedAt),
      }

      const updatedEvents = events.map((e) =>
        e.id === selectedEvent.id
          ? { ...e, dayPlans: [...e.dayPlans, newDayPlan], updatedAt: new Date() }
          : e
      );
      setEventsState(updatedEvents);
      setSelectedEvent(updatedEvents.find((e) => e.id === selectedEvent.id) || null);
      setShowDayPlanForm(false);
    } catch (err) {
      console.error('Create day plan failed', err)
    }
  };

  const handleUpdateDayPlan = (
    dayPlanData: Omit<DayPlan, "id" | "createdAt" | "updatedAt">
  ) => {
    if (!selectedEvent || !editingDayPlan) return;

    const updatedEvents = events.map((e) =>
      e.id === selectedEvent.id
        ? {
            ...e,
            dayPlans: e.dayPlans.map((d) =>
              d.id === editingDayPlan.id
                ? { ...d, ...dayPlanData, updatedAt: new Date() }
                : d
            ),
            updatedAt: new Date(),
          }
        : e
    );
    setEventsState(updatedEvents);
    setSelectedEvent(
      updatedEvents.find((e) => e.id === selectedEvent.id) || null
    );
    setEditingDayPlan(null);
    setShowDayPlanForm(false);
  };

  const handleDeleteDayPlan = (dayPlanId: string) => {
    if (!selectedEvent) return;
    setDeleteConfirm({ isOpen: true, type: 'dayPlan', id: dayPlanId });
  };

  const confirmDeleteDayPlan = () => {
    if (!selectedEvent) return;
    const dayPlanId = deleteConfirm.id;
    const updatedEvents = events.map((e) =>
      e.id === selectedEvent.id
        ? {
            ...e,
            dayPlans: e.dayPlans.filter((d) => d.id !== dayPlanId),
            updatedAt: new Date(),
          }
        : e
    );
    setEventsState(updatedEvents);
    setSelectedEvent(
      updatedEvents.find((e) => e.id === selectedEvent.id) || null
    );
    setDeleteConfirm({ isOpen: false, type: 'dayPlan', id: '' });
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {}
    navigate("/");
  };

  const handleSaveSchedule = (schedule: ScheduleItem[]) => {
    if (!selectedEvent || !managingSchedule) return;

    const updatedEvents = events.map((e) =>
      e.id === selectedEvent.id
        ? {
            ...e,
            dayPlans: e.dayPlans.map((d) =>
              d.id === managingSchedule.id
                ? { ...d, schedule, updatedAt: new Date() }
                : d
            ),
            updatedAt: new Date(),
          }
        : e
    );
    setEventsState(updatedEvents);
    setSelectedEvent(
      updatedEvents.find((e) => e.id === selectedEvent.id) || null
    );
    setManagingSchedule(null);
  };

  // Show Schedule Manager
  if (managingSchedule) {
    return (
      <ScheduleManager
        schedule={managingSchedule.schedule}
        onSave={handleSaveSchedule}
        onCancel={() => setManagingSchedule(null)}
      />
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
        onClose={() => setShowWizard(false)}
        onCreated={(newEvent) => {
          setEventsState([...events, newEvent]);
          setSelectedEvent(newEvent);
          setShowWizard(false);
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
              src={organisationLogo ? (organisationLogo.startsWith('http') ? organisationLogo : `/minihackathon${organisationLogo}`) : chaosOpsLogo}
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

        {/* Content Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: selectedEvent
              ? "repeat(auto-fit, minmax(min(100%, 380px), 1fr))"
              : "1fr",
            gap: "clamp(1.25rem, 3vw, 2rem)",
            alignItems: "start",
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
                Veranstaltungen ({events.length})
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
              {events.length === 0 ? (
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
                  Noch keine Veranstaltungen. Klicke auf "Neu" um zu starten!
                </div>
              ) : (
                events.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    style={{
                      padding: "1.25rem",
                      border: `2px solid ${
                        selectedEvent?.id === event.id ? "#181818" : "#cbd5e1"
                      }`,
                      borderRadius: "12px",
                      backgroundColor:
                        selectedEvent?.id === event.id ? "#fef3c7" : "#f8fafc",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow:
                        selectedEvent?.id === event.id
                          ? "2px 4px 0 #181818"
                          : "0 1px 3px rgba(0,0,0,0.1)",
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
                          {event.name}
                        </h3>
                        {event.description && (
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
                          }}
                        >
                          <FileText size={14} strokeWidth={2} />
                          {event.dayPlans.length} Tagesplan
                          {event.dayPlans.length !== 1 ? "e" : ""}
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
                            setShowEventForm(true);
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
                  </div>
                ))
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
                  Tagespläne ({selectedEvent.dayPlans.length})
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
                {selectedEvent.dayPlans.length === 0 ? (
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
                    Noch keine Tagespläne. Klicke auf "Neu" um einen zu
                    erstellen!
                  </div>
                ) : (
                  selectedEvent.dayPlans
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
                              {dayPlan.schedule.length} Termin
                              {dayPlan.schedule.length !== 1 ? "e" : ""}
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
    </div>
  );
};

export default Dashboard;