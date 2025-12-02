import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FlipchartBackground from '../components/layout/FlipchartBackground'
import styles from './Admin.module.css'
import { api } from '../lib/api'

const AdminSignup: React.FC = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    orgName: '',
    description: '',
    adminUsername: '',
    adminEmail: '',
    password: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.orgName || !form.adminUsername || !form.password) return
    setSubmitting(true)
    try {
      const data = await api.signup(form)
      navigate(`/admin/dashboard?org=${data.organisation.id}`, { replace: true })
    } catch (err: any) {
      alert(err.message || 'Registrierung fehlgeschlagen')
    } finally {
      setSubmitting(false)
    }
  }

  const input = {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid #374151',
    borderRadius: '8px',
    fontSize: '1rem',
    fontFamily: '"Inter", "Roboto", Arial, sans-serif',
    boxSizing: 'border-box' as const,
  }

  const label = {
    display: 'block',
    fontFamily: '"Inter", "Roboto", Arial, sans-serif',
    fontSize: '1rem',
    fontWeight: 600,
    color: '#0f172a',
    marginBottom: '0.5rem',
  }

  return (
    <div className={styles.adminWrapper}>
      <FlipchartBackground />
      <main className={styles.adminContent} style={{ maxWidth: 600, margin: '0 auto', width: '100%' }}>
        <div style={{
          background: '#fff',
          borderRadius: '1.2rem 1.35rem 1.15rem 1.25rem',
          boxShadow: '2px 4px 0 #e5e7eb, 0 2px 8px 0 rgba(0,0,0,0.08)',
          padding: '2rem',
          border: '2px solid #181818',
        }}>
          <h1 style={{
            fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: '1rem',
          }}>Organisation anlegen</h1>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={label}>Organisationsname</label>
              <input style={input} value={form.orgName} onChange={e => setForm({ ...form, orgName: e.target.value })} placeholder="z.B. Ev. Jugend West" />
            </div>
            <div>
              <label style={label}>Beschreibung (optional)</label>
              <input style={input} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label style={label}>Admin Benutzername</label>
              <input style={input} value={form.adminUsername} onChange={e => setForm({ ...form, adminUsername: e.target.value })} />
            </div>
            <div>
              <label style={label}>Admin E-Mail (optional)</label>
              <input type="email" style={input} value={form.adminEmail} onChange={e => setForm({ ...form, adminEmail: e.target.value })} />
            </div>
            <div>
              <label style={label}>Passwort</label>
              <input type="password" style={input} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <button disabled={submitting} type="submit" style={{
              padding: '0.9rem 1.25rem',
              border: '2px solid #181818',
              borderRadius: 8,
              fontSize: '1rem',
              fontWeight: 700,
              background: '#10b981',
              color: '#fff',
              boxShadow: '2px 4px 0 #181818',
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}>{submitting ? 'Wird erstellt…' : 'Organisation erstellen'}</button>
            <button type="button" onClick={() => navigate('/login')} style={{
              background: 'none', border: 'none', color: '#2563eb', textDecoration: 'underline', fontWeight: 700, cursor: 'pointer'
            }}>Zurück zum Login</button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default AdminSignup
