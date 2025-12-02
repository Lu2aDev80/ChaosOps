export type Organisation = { id: string; name: string; description?: string }
export type User = { id: string; username: string; role: 'admin' | 'member'; organisationId: string; email?: string | null }
export type MeResponse = { user: User; organisation: Organisation }
export type SignupResponse = { organisation: Organisation; user: Pick<User, 'id' | 'username' | 'role'> }
export type LoginResponse = { organisation: Pick<Organisation, 'id' | 'name'>; user: Pick<User, 'id' | 'username' | 'role'> }
export type LogoutResponse = { ok: boolean }

async function json<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, { credentials: 'include', ...init })
  if (!res.ok) {
    let err: any = null
    try { err = await res.json() } catch {}
    throw new Error(err?.error || res.statusText)
  }
  return res.json()
}

export const api = {
  organisations(): Promise<Organisation[]> {
    return json<Organisation[]>('/api/organisations')
  },
  signup(data: { orgName: string; description?: string; adminUsername: string; adminEmail?: string; password: string }): Promise<SignupResponse> {
    return json<SignupResponse>('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  },
  login(data: { organisationId: string; usernameOrEmail: string; password: string }): Promise<LoginResponse> {
    return json<LoginResponse>('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  },
  logout(): Promise<LogoutResponse> {
    return json<LogoutResponse>('/api/auth/logout', { method: 'POST' })
  },
  me(): Promise<MeResponse> {
    return json<MeResponse>('/api/auth/me')
  },
}
