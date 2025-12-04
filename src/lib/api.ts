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

// Get API base URL from environment or default to relative path with base path
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/minihackathon';

async function json<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const url = typeof input === 'string' ? `${API_BASE_URL}${input}` : input;
  const res = await fetch(url, { credentials: "include", ...init });
  if (!res.ok) {
    let err: any = null;
    try {
      err = await res.json();
    } catch {}
    
    // Create error with full error response data for special cases (like email verification)
    const error: any = new Error(err?.error || res.statusText);
    error.data = err; // Include full error response data
    throw error;
  }
  return res.json();
}

export const api = {
  health(): Promise<{ok: boolean}> {
    return json<{ok: boolean}>("/api/health");
  },
  organisations(): Promise<Organisation[]> {
    return json<Organisation[]>("/api/organisations");
  },
  getOrganisation(id: string): Promise<Organisation> {
    return json<Organisation>(`/api/organisations/${id}`);
  },
  updateOrganisation(id: string, data: UpdateOrganisationData): Promise<Organisation> {
    return json<Organisation>(`/api/organisations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },
  uploadLogo(file: File): Promise<{success: boolean; logoUrl: string; filename: string}> {
    const formData = new FormData();
    formData.append('logo', file);
    
    const url = `${API_BASE_URL}/api/upload/logo`;
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
    return json<User[]>(`/api/organisations/${organisationId}/users`);
  },
  getOrganisationInvitations(organisationId: string): Promise<Array<{id: string; email: string; role: string; invitedBy: string; expiresAt: string; createdAt: string}>> {
    return json<Array<{id: string; email: string; role: string; invitedBy: string; expiresAt: string; createdAt: string}>>(`/api/organisations/${organisationId}/invitations`);
  },
  revokeInvitation(organisationId: string, invitationId: string): Promise<{success: boolean; message: string}> {
    return json<{success: boolean; message: string}>(`/api/organisations/${organisationId}/invitations/${invitationId}`, {
      method: "DELETE",
    });
  },
  inviteUser(organisationId: string, data: InviteUserData): Promise<{message: string; email: string; role: string; expiresAt: string}> {
    return json<{message: string; email: string; role: string; expiresAt: string}>(`/api/organisations/${organisationId}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },
  removeUser(organisationId: string, userId: string): Promise<{success: boolean; message: string}> {
    return json<{success: boolean; message: string}>(`/api/organisations/${organisationId}/users/${userId}`, {
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
    return json<SignupResponse>("/api/auth/signup", {
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
    return json<LoginResponse>("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },
  logout(): Promise<LogoutResponse> {
    return json<LogoutResponse>("/api/auth/logout", { method: "POST" });
  },
  me(): Promise<MeResponse> {
    return json<MeResponse>("/api/auth/me");
  },
  verifyEmail(token: string): Promise<VerifyEmailResponse> {
    return json<VerifyEmailResponse>("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
  },
  resendVerification(
    email: string,
    organisationId: string
  ): Promise<ResendVerificationResponse> {
    return json<ResendVerificationResponse>("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, organisationId }),
    });
  },
  acceptInvitation(token: string, username: string, password: string): Promise<AcceptInvitationResponse> {
    return json<AcceptInvitationResponse>("/api/auth/accept-invitation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, username, password }),
    });
  },
  validateInvitation(token: string): Promise<{valid: boolean; email: string; role: string; organisation: {id: string; name: string}}> {
    return json<{valid: boolean; email: string; role: string; organisation: {id: string; name: string}}>("/api/auth/validate-invitation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
  },
  // Events
  listEvents(organisationId: string): Promise<any[]> {
    return json<any[]>(`/api/organisations/${organisationId}/events`)
  },
  getEvent(eventId: string): Promise<any> {
    return json<any>(`/api/events/${eventId}`)
  },
  createEvent(organisationId: string, data: { name: string; description?: string }): Promise<any> {
    return json<any>(`/api/organisations/${organisationId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  },
  updateEvent(eventId: string, data: { name: string; description?: string }): Promise<any> {
    return json<any>(`/api/events/${eventId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  },
  deleteEvent(eventId: string): Promise<{ success: boolean; message: string }> {
    return json<{ success: boolean; message: string }>(`/api/events/${eventId}`, {
      method: 'DELETE',
    })
  },
  // Day Plans
  getDayPlan(dayPlanId: string): Promise<any> {
    return json<any>(`/api/day-plans/${dayPlanId}`)
  },
  createDayPlan(eventId: string, data: { name: string; date: string; schedule?: Array<any> }): Promise<any> {
    return json<any>(`/api/events/${eventId}/day-plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  },
  updateDayPlan(dayPlanId: string, data: { name?: string; date?: string; schedule?: Array<any> }): Promise<any> {
    return json<any>(`/api/day-plans/${dayPlanId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  },
  deleteDayPlan(dayPlanId: string): Promise<{ success: boolean; message: string }> {
    return json<{ success: boolean; message: string }>(`/api/day-plans/${dayPlanId}`, {
      method: 'DELETE',
    })
  },
};
