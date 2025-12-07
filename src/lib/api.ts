import type { Display } from '../types/display';
import type { Event } from '../types/event';
import type { DayPlan } from '../types/schedule';
import type { Tag } from '../types/tag';

export type Organisation = { id: string; name: string; description?: string; logoUrl?: string }
export type User = {
  id: string;
  username: string;
  role: "admin" | "member";
  organisationId: string;
  email?: string | null;
  emailVerified?: boolean;
  createdAt?: string;
};
export type MeResponse = { user: User; organisation: Organisation };
export type SignupResponse = {
  organisation: Organisation;
  user: Pick<User, "id" | "username" | "role" | "email" | "emailVerified">;
  message: string;
};
export type LoginResponse = {
  organisation: Pick<Organisation, "id" | "name">;
  user: Pick<User, "id" | "username" | "role" | "email" | "emailVerified">;
};
export type LogoutResponse = { ok: boolean };
export type VerifyEmailResponse = {
  message: string;
  user: Pick<User, "id" | "username" | "email" | "role" | "emailVerified">;
  organisation: Organisation;
};
export type ResendVerificationResponse = { message: string };
export type UpdateOrganisationData = {
  name: string;
  description?: string;
  logoUrl?: string;
};
export type InviteUserData = {
  email: string;
  role: "admin" | "member";
};
export type AcceptInvitationResponse = {
  message: string;
  user: Pick<User, "id" | "username" | "email" | "role" | "emailVerified">;
  organisation: Organisation;
};

// Get API base URL from environment or use the base path for local development
// In production with absolute URL: https://lu2adevelopment.de/minihackathon/api
// In development or fallback: /minihackathon/api (relative to current origin)
const API_BASE_URL = import.meta.env.VITE_API_URL || '/minihackathon/api';

// Log the API URL in development for debugging
if (import.meta.env.DEV) {
  console.log('API_BASE_URL:', API_BASE_URL);
}

async function json<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const url = typeof input === 'string' ? `${API_BASE_URL}${input}` : input;
  
  if (import.meta.env.DEV) {
    console.log('Fetching:', url);
  }
  
  const res = await fetch(url, { credentials: "include", ...init });
  if (!res.ok) {
    let err: { error: string } | null = null;
    try {
      err = await res.json();
    } catch {
      // ignore
    }
    
    // Create error with full error response data for special cases (like email verification)
    const error: Error & { data?: { error: string } } = new Error(err?.error || res.statusText);
    error.data = err || undefined; // Include full error response data
    throw error;
  }
  return res.json();
}

export const api = {
  health(): Promise<{ok: boolean}> {
    return json<{ok: boolean}>("/health");
  },
  organisations(): Promise<Organisation[]> {
    return json<Organisation[]>("/organisations");
  },
  getOrganisation(id: string): Promise<Organisation> {
    return json<Organisation>(`/organisations/${id}`);
  },
  updateOrganisation(id: string, data: UpdateOrganisationData): Promise<Organisation> {
    return json<Organisation>(`/organisations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },
  uploadLogo(file: File): Promise<{success: boolean; logoUrl: string; filename: string}> {
    const formData = new FormData();
    formData.append('logo', file);
    
    const url = `${API_BASE_URL}/upload/logo`;
    return fetch(url, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || res.statusText);
      }
      return res.json();
    });
  },
  getOrganisationUsers(organisationId: string): Promise<User[]> {
    return json<User[]>(`/organisations/${organisationId}/users`);
  },
  getOrganisationInvitations(organisationId: string): Promise<Array<{id: string; email: string; role: string; invitedBy: string; expiresAt: string; createdAt: string}>> {
    return json<Array<{id: string; email: string; role: string; invitedBy: string; expiresAt: string; createdAt: string}>>(`/organisations/${organisationId}/invitations`);
  },
  revokeInvitation(organisationId: string, invitationId: string): Promise<{success: boolean; message: string}> {
    return json<{success: boolean; message: string}>(`/organisations/${organisationId}/invitations/${invitationId}`, {
      method: "DELETE",
    });
  },
  inviteUser(organisationId: string, data: InviteUserData): Promise<{message: string; email: string; role: string; expiresAt: string}> {
    return json<{message: string; email: string; role: string; expiresAt: string}>(`/organisations/${organisationId}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },
  removeUser(organisationId: string, userId: string): Promise<{success: boolean; message: string}> {
    return json<{success: boolean; message: string}>(`/organisations/${organisationId}/users/${userId}`, {
      method: "DELETE",
    });
  },
  signup(data: {
    orgName: string;
    description?: string;
    adminUsername: string;
    adminEmail: string;
    password: string;
  }): Promise<SignupResponse> {
    return json<SignupResponse>("/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },
  login(data: {
    organisationId: string;
    usernameOrEmail: string;
    password: string;
  }): Promise<LoginResponse> {
    return json<LoginResponse>("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },
  logout(): Promise<LogoutResponse> {
    return json<LogoutResponse>("/auth/logout", { method: "POST" });
  },
  me(): Promise<MeResponse> {
    return json<MeResponse>("/auth/me");
  },
  verifyEmail(token: string): Promise<VerifyEmailResponse> {
    return json<VerifyEmailResponse>("/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
  },
  resendVerification(
    email: string,
    organisationId: string
  ): Promise<ResendVerificationResponse> {
    return json<ResendVerificationResponse>("/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, organisationId }),
    });
  },
  acceptInvitation(token: string, username: string, password: string): Promise<AcceptInvitationResponse> {
    return json<AcceptInvitationResponse>("/auth/accept-invitation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, username, password }),
    });
  },
  validateInvitation(token: string): Promise<{valid: boolean; email: string; role: string; organisation: {id: string; name: string}}> {
    return json<{valid: boolean; email: string; role: string; organisation: {id: string; name: string}}>("/auth/validate-invitation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
  },
  // Events
  listEvents(organisationId: string): Promise<Event[]> {
    return json<Event[]>(`/organisations/${organisationId}/events`)
  },
  getEvent(eventId: string): Promise<Event> {
    return json<Event>(`/events/${eventId}`)
  },
  createEvent(organisationId: string, data: { name: string; description?: string }): Promise<Event> {
    return json<Event>(`/organisations/${organisationId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  },
  updateEvent(eventId: string, data: { name: string; description?: string }): Promise<Event> {
    return json<Event>(`/events/${eventId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  },
  deleteEvent(eventId: string): Promise<{ success: boolean; message: string }> {
    return json<{ success: boolean; message: string }>(`/events/${eventId}`, {
      method: 'DELETE',
    })
  },
  // Day Plans
  getDayPlan(dayPlanId: string): Promise<DayPlan> {
    return json<DayPlan>(`/day-plans/${dayPlanId}`)
  },
  createDayPlan(eventId: string, data: { name: string; date: string; schedule?: Array<unknown> }): Promise<DayPlan> {
    return json<DayPlan>(`/events/${eventId}/day-plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  },
  updateDayPlan(dayPlanId: string, data: { name?: string; date?: string; schedule?: Array<unknown> }): Promise<DayPlan> {
    return json<DayPlan>(`/day-plans/${dayPlanId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  },
  deleteDayPlan(dayPlanId: string): Promise<{ success: boolean; message: string }> {
    return json<{ success: boolean; message: string }>(`/day-plans/${dayPlanId}`, {
      method: 'DELETE',
    })
  },
  // Event Tags
  getEventTags(orgId: string): Promise<Tag[]> {
    return json<Tag[]>(`/organisations/${orgId}/event-tags`)
  },
  createEventTag(orgId: string, data: { name: string; color?: string }): Promise<Tag> {
    return json<Tag>(`/organisations/${orgId}/event-tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  },
  updateEventTag(tagId: string, data: { name?: string; color?: string }): Promise<Tag> {
    return json<Tag>(`/event-tags/${tagId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  },
  deleteEventTag(tagId: string): Promise<{ success: boolean }> {
    return json<{ success: boolean }>(`/event-tags/${tagId}`, {
      method: 'DELETE',
    })
  },
  // Schedule Item Tags
  getScheduleItemTags(orgId: string): Promise<Tag[]> {
    return json<Tag[]>(`/organisations/${orgId}/schedule-item-tags`)
  },
  createScheduleItemTag(orgId: string, data: { name: string; color?: string }): Promise<Tag> {
    return json<Tag>(`/organisations/${orgId}/schedule-item-tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  },
  updateScheduleItemTag(tagId: string, data: { name?: string; color?: string }): Promise<Tag> {
    return json<Tag>(`/schedule-item-tags/${tagId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  },
  deleteScheduleItemTag(tagId: string): Promise<{ success: boolean }> {
    return json<{ success: boolean }>(`/schedule-item-tags/${tagId}`, {
      method: 'DELETE',
    })
  },

  // Display Pairing
  generateDisplayCode(): Promise<{ code: string }> {
    return json<{ code: string }>('/displays/generate-code', {
      method: 'POST',
    });
  },

  registerDisplay(data: { code: string; organisationId: string; name: string }): Promise<Display> {
    return json<Display>('/displays', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  getDisplay(displayId: string): Promise<Display> {
    return json<Display>(`/displays/${displayId}`);
  },

  getDisplays(organisationId: string): Promise<Display[]> {
    return json<Display[]>(`/organisations/${organisationId}/displays`);
  },

  getUnassignedDisplays(): Promise<Display[]> {
    return json<Display[]>('/displays/unassigned');
  },

  assignDisplay(displayId: string, organisationId: string): Promise<Display> {
    return json<Display>(`/displays/${displayId}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organisationId }),
    });
  },
};

