import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Building2,
  Image as ImageIcon,
  Users,
  UserPlus,
  UserMinus,
  Save,
  ArrowLeft,
  Mail,
  Shield,
  User,
} from 'lucide-react';
import FlipchartBackground from '../components/layout/FlipchartBackground';
import { ConfirmModal } from '../components/ui';
import DisplayManager from '../components/admin/DisplayManager';
import OrganisationSharedPlans from '../components/admin/OrganisationSharedPlans';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import styles from './Admin.module.css';

type UserDetails = {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'member';
  emailVerified: boolean;
  createdAt: string;
};

const OrganisationSettings: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, logout } = useAuth();
  const orgId = searchParams.get('org');
  
  // Derived state
  const isAdmin = useMemo(() => (
    !authLoading && user?.role === 'admin' && user?.organisationId === orgId
  ), [authLoading, user, orgId]);
  
  // Debug logging removed for cleanliness

  // State management
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [invitations, setInvitations] = useState<Array<{id: string; email: string; role: 'admin'|'member'; invitedBy: string; expiresAt: string; createdAt: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [orgName, setOrgName] = useState('');
  const [orgDescription, setOrgDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Invite user form
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    userId: string;
    username: string;
  }>({ isOpen: false, userId: '', username: '' });

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isAuthError = useCallback((err: any): boolean => {
    return err?.message?.includes('Unauthorized') || 
           err?.message?.includes('401') || 
           err?.message?.includes('403') ||
           err?.message?.includes('not authenticated') ||
           err?.status === 401 ||
           err?.status === 403;
  }, []);

  const loadData = useCallback(async () => {
    if (!orgId) return;
    
    try {
      setLoading(true);
      setError(null); 
      
      const [orgData, usersData, invitationsData] = await Promise.all([
        api.getOrganisation(orgId!),
        api.getOrganisationUsers(orgId!),
        api.getOrganisationInvitations(orgId!),
      ]);
      
      setOrgName(orgData.name ?? '');
      setOrgDescription(orgData.description ?? '');
      const rawLogo = orgData.logoUrl ?? '';
      setLogoUrl(rawLogo);
      // Build preview URL
      setUsers(usersData.map(u => ({
        ...u,
        email: u.email || '',
        emailVerified: u.emailVerified ?? false,
        createdAt: u.createdAt || new Date().toISOString(),
      })));
      setInvitations(invitationsData.map(i => ({
        ...i,
        role: (i.role as 'admin'|'member'),
      })));
    } catch (err: any) {
      console.error('Error loading organisation data:', err);
      
      if (isAuthError(err)) {
        await logout();
        navigate('/login', { state: { message: 'Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.' } });
        return;
      }
      
      // Handle network errors
      if (!navigator.onLine) {
        setError('Keine Internetverbindung. Bitte überprüfe deine Netzwerkverbindung.');
        return;
      }
      
      // Handle specific error cases
      if (err.message?.includes('not found') || err.message?.includes('404')) {
        setError('Organisation nicht gefunden. Möglicherweise wurde sie gelöscht.');
      } else if (err.message?.includes('permission') || err.message?.includes('forbidden')) {
        setError('Du hast keine Berechtigung, auf diese Organisation zuzugreifen.');
      } else {
        setError(err.message || 'Fehler beim Laden der Organisationsdaten. Bitte versuche es erneut.');
      }
    } finally {
      setLoading(false);
    }
  }, [orgId, isAuthError, logout, navigate]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    if (!orgId) {
      navigate('/admin/dashboard');
      return;
    }

    loadData();
  }, [authLoading, user, orgId, loadData, navigate]);

  const handleSaveOrganisation = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      // Validate inputs
      if (!orgName.trim()) {
        setError('Organisationsname darf nicht leer sein.');
        setSaving(false);
        return;
      }
      
      let finalLogoUrl = logoUrl;
      
      // Upload logo file if selected
      if (logoFile) {
        try {
          const uploadResult = await api.uploadLogo(logoFile);
          finalLogoUrl = uploadResult.logoUrl;
        } catch (uploadErr: any) {
          console.error('Logo upload error:', uploadErr);
          
          if (isAuthError(uploadErr)) {
            await logout();
            navigate('/login', { state: { message: 'Sitzung abgelaufen. Bitte melde dich erneut an.' } });
            return;
          }
          
          setError(`Logo-Upload fehlgeschlagen: ${uploadErr.message || 'Unbekannter Fehler'}`);
          setSaving(false);
          return;
        }
      }
      
      await api.updateOrganisation(orgId!, {
        name: orgName,
        description: orgDescription,
        logoUrl: finalLogoUrl || undefined,
      });
      
      setSuccessMessage('Organisation erfolgreich aktualisiert!');
      setTimeout(() => setSuccessMessage(null), 3000);
      await loadData();
      setLogoFile(null);
    } catch (err: any) {
      console.error('Error updating organisation:', err);
      
      if (isAuthError(err)) {
        await logout();
        navigate('/login', { state: { message: 'Sitzung abgelaufen. Bitte melde dich erneut an.' } });
        return;
      }
      
      if (!navigator.onLine) {
        setError('Keine Internetverbindung. Änderungen konnten nicht gespeichert werden.');
      } else {
        setError(err.message || 'Fehler beim Aktualisieren der Organisation. Bitte versuche es erneut.');
      }
    } finally {
      setSaving(false);
    }
  }, [orgId, orgName, orgDescription, logoUrl, logoFile, loadData, isAuthError, logout, navigate]);

  const handleInviteUser = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      // Validate email
      if (!inviteEmail.trim()) {
        setError('Bitte gib eine E-Mail-Adresse ein.');
        setSaving(false);
        return;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(inviteEmail)) {
        setError('Bitte gib eine gültige E-Mail-Adresse ein.');
        setSaving(false);
        return;
      }
      
      const result = await api.inviteUser(orgId!, {
        email: inviteEmail,
        role: inviteRole,
      });
      
      setSuccessMessage(`Einladung erfolgreich an ${result.email} gesendet!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      setShowInviteForm(false);
      setInviteEmail('');
      setInviteRole('member');
      
      // Reload invitations to show the new pending invitation immediately
      try {
        const invitationsData = await api.getOrganisationInvitations(orgId!);
        setInvitations(invitationsData.map(i => ({
          ...i,
          role: (i.role as 'admin'|'member'),
        })));
      } catch (reloadErr) {
        console.warn('Could not reload invitations:', reloadErr);
        // Don't show error as the invite was successful
      }
    } catch (err: any) {
      console.error('Error inviting user:', err);
      
      if (isAuthError(err)) {
        await logout();
        navigate('/login', { state: { message: 'Sitzung abgelaufen. Bitte melde dich erneut an.' } });
        return;
      }
      
      if (err.message?.includes('already exists') || err.message?.includes('duplicate')) {
        setError('Diese E-Mail-Adresse wurde bereits eingeladen oder ist bereits Mitglied.');
      } else if (err.message?.includes('permission') || err.message?.includes('forbidden')) {
        setError('Du hast keine Berechtigung, Benutzer einzuladen.');
      } else if (!navigator.onLine) {
        setError('Keine Internetverbindung. Einladung konnte nicht gesendet werden.');
      } else {
        setError(err.message || 'Einladung konnte nicht gesendet werden. Bitte versuche es erneut.');
      }
    } finally {
      setSaving(false);
    }
  }, [orgId, inviteEmail, inviteRole, isAuthError, logout, navigate]);

  const handleRemoveUser = useCallback(async (userId: string) => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      await api.removeUser(orgId!, userId);
      
      setSuccessMessage('Benutzer erfolgreich entfernt!');
      setTimeout(() => setSuccessMessage(null), 3000);
      setDeleteConfirm({ isOpen: false, userId: '', username: '' });
      
      // Reload data to reflect changes
      try {
        await loadData();
      } catch (reloadErr) {
        console.warn('Could not reload data after user removal:', reloadErr);
        // Don't show error as the removal was successful
      }
    } catch (err: any) {
      console.error('Error removing user:', err);
      setDeleteConfirm({ isOpen: false, userId: '', username: '' });
      
      if (isAuthError(err)) {
        await logout();
        navigate('/login', { state: { message: 'Sitzung abgelaufen. Bitte melde dich erneut an.' } });
        return;
      }
      
      if (err.message?.includes('cannot remove') || err.message?.includes('last admin')) {
        setError('Der letzte Administrator kann nicht entfernt werden.');
      } else if (err.message?.includes('permission') || err.message?.includes('forbidden')) {
        setError('Du hast keine Berechtigung, Benutzer zu entfernen.');
      } else if (err.message?.includes('not found') || err.message?.includes('404')) {
        setError('Benutzer wurde bereits entfernt oder existiert nicht.');
      } else if (!navigator.onLine) {
        setError('Keine Internetverbindung. Benutzer konnte nicht entfernt werden.');
      } else {
        setError(err.message || 'Fehler beim Entfernen des Benutzers. Bitte versuche es erneut.');
      }
    } finally {
      setSaving(false);
    }
  }, [orgId, loadData, isAuthError, logout, navigate]);


  const cardStyle = {
    background: '#fff',
    borderRadius: '1.2rem 1.35rem 1.15rem 1.25rem',
    boxShadow: '2px 4px 0 #e5e7eb, 0 2px 8px 0 rgba(0,0,0,0.08)',
    padding: '2rem',
    border: '2px solid #181818',
    position: 'relative' as const,
    transform: 'rotate(-0.2deg)',
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
  };

  const inputStyle = {
    width: '100%',
    padding: 'clamp(0.625rem, 2vw, 0.75rem) clamp(0.875rem, 2.5vw, 1rem)',
    border: '2px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: 'clamp(0.9rem, 2.25vw, 1rem)',
    fontFamily: '"Inter", "Roboto", Arial, sans-serif',
    transition: 'all 0.2s ease',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontFamily: '"Gloria Hallelujah", "Caveat", cursive',
    fontSize: 'clamp(0.9rem, 2.25vw, 1rem)',
    fontWeight: '700',
    color: '#0f172a',
  };

  if (loading || authLoading) {
    return (
      <div className={styles.adminWrapper}>
        <FlipchartBackground />
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
          Loading...
        </div>
      </div>
    );
  }

  // Don't render if no user (will redirect via useEffect)
  if (!user) {
    return null;
  }

  return (
    <div className={styles.adminWrapper}>
      <FlipchartBackground />

      <main
        className={styles.adminContent}
        style={{
          padding: '2rem 1rem',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            ...cardStyle,
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => navigate(`/admin/dashboard?org=${orgId}`)}
              style={{
                ...buttonStyle,
                backgroundColor: '#fff',
                color: '#0ea5e9',
                border: '2px solid #0ea5e9',
                boxShadow: '2px 4px 0 #0ea5e9',
                padding: '0.5rem',
              }}
            >
              <ArrowLeft size={20} />
            </button>
            <h1
              style={{
                fontFamily: '"Gloria Hallelujah", "Caveat", cursive',
                fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                fontWeight: '700',
                color: '#0f172a',
                margin: 0,
              }}
            >
              Organisation Settings
            </h1>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div
            style={{
              ...cardStyle,
              marginBottom: '1.5rem',
              backgroundColor: '#fee2e2',
              border: '2px solid #dc2626',
              color: '#991b1b',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ flex: 1 }}>{error}</span>
            {!error.includes('Berechtigung') && !error.includes('Sitzung') && (
              <button
                onClick={() => {
                  setError(null);
                  loadData();
                }}
                style={{
                  ...buttonStyle,
                  backgroundColor: '#dc2626',
                  color: '#fff',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  boxShadow: '1px 2px 0 #991b1b',
                }}
              >
                Erneut versuchen
              </button>
            )}
          </div>
        )}
        {successMessage && (
          <div
            style={{
              ...cardStyle,
              marginBottom: '1.5rem',
              backgroundColor: '#d1fae5',
              border: '2px solid #10b981',
              color: '#065f46',
            }}
          >
            {successMessage}
          </div>
        )}

        {/* Organisation Details Section - Only for Admins */}
        {isAdmin && (
          <div style={{ ...cardStyle, marginBottom: '2rem' }}>
            <h2
              style={{
                fontFamily: '"Gloria Hallelujah", "Caveat", cursive',
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#0f172a',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Building2 size={24} />
              Organisation Details
            </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Organisation Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                style={inputStyle}
                placeholder="Enter organisation name"
              />
            </div>

            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                value={orgDescription}
                onChange={(e) => setOrgDescription(e.target.value)}
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                placeholder="Enter organisation description (optional)"
              />
            </div>

            <div>
              <label style={labelStyle}>
                <ImageIcon size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Organisation Logo
                <span style={{
                  marginLeft: '1rem',
                  color: '#f59e42',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  fontFamily: 'Inter, Roboto, Arial, sans-serif',
                  background: '#fffbe6',
                  borderRadius: '6px',
                  padding: '0.2rem 0.7rem',
                  border: '1px solid #fbbf24',
                }}>
                  Coming soon
                </span>
              </label>
              
              {/* Logo upload und Vorschau deaktiviert */}
              <div style={{
                marginTop: '1rem',
                textAlign: 'center',
                color: '#94a3b8',
                fontFamily: 'Inter, Roboto, Arial, sans-serif',
                fontSize: '0.95rem',
                background: '#f3f4f6',
                borderRadius: '8px',
                padding: '1.2rem',
                border: '2px dashed #cbd5e1',
                maxWidth: '350px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}>
                Logo Upload ist aktuell deaktiviert.
              </div>
            </div>

            <button
              onClick={handleSaveOrganisation}
              disabled={saving}
              style={{
                ...buttonStyle,
                backgroundColor: '#10b981',
                color: '#fff',
                justifyContent: 'center',
              }}
            >
              <Save size={18} />
              {saving ? 'Wird gespeichert...' : 'Änderungen speichern'}
            </button>
          </div>
        </div>
        )}

        {/* User Management Section */}
        <div style={{ ...cardStyle, marginBottom: '2rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <h2
              style={{
                fontFamily: '"Gloria Hallelujah", "Caveat", cursive',
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#0f172a',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Users size={24} />
              Users ({users.length})
            </h2>
            {isAdmin && (
            <button
              onClick={() => setShowInviteForm(!showInviteForm)}
              style={{
                ...buttonStyle,
                backgroundColor: '#fbbf24',
                color: '#fff',
                padding: '0.625rem 1.25rem',
              }}
            >
              <UserPlus size={18} />
              Benutzer einladen
            </button>
            )}
          </div>

          {/* Invite User Form - Only for Admins */}
          {isAdmin && showInviteForm && (
            <form
              onSubmit={handleInviteUser}
              style={{
                padding: '1.5rem',
                backgroundColor: '#fef3c7',
                border: '2px solid #fbbf24',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <h3
                style={{
                  fontFamily: '"Gloria Hallelujah", "Caveat", cursive',
                  fontSize: '1.2rem',
                  margin: 0,
                  marginBottom: '0.5rem',
                }}
              >
                Neuen Benutzer einladen
              </h3>
              <p style={{ margin: '0 0 1rem 0', color: '#78716c', fontSize: '0.9rem' }}>
                Der Benutzer erhält eine E-Mail mit einem Einladungslink, um sein Konto zu erstellen.
              </p>

              <div>
                <label style={labelStyle}>E-Mail</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  style={inputStyle}
                  placeholder="benutzer@beispiel.de"
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Rolle</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                  style={inputStyle}
                >
                  <option value="member">Mitglied</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#10b981',
                    color: '#fff',
                    flex: 1,
                    justifyContent: 'center',
                  }}
                >
                  <UserPlus size={18} />
                  {saving ? 'Wird eingeladen...' : 'Benutzer einladen'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowInviteForm(false)}
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#fff',
                    color: '#64748b',
                    border: '2px solid #cbd5e1',
                    boxShadow: '2px 4px 0 #cbd5e1',
                    flex: 1,
                    justifyContent: 'center',
                  }}
                >
                  Abbrechen
                </button>
              </div>
            </form>
          )}

          {/* Users List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {users.length === 0 ? (
              <div
                style={{
                  padding: '2rem',
                  textAlign: 'center',
                  border: '2px dashed #cbd5e1',
                  borderRadius: '12px',
                  color: '#64748b',
                }}
              >
                Noch keine Benutzer. Lade Benutzer ein, um zu beginnen!
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  style={{
                    padding: '1.25rem',
                    border: '2px solid #cbd5e1',
                    borderRadius: '12px',
                    backgroundColor: '#f8fafc',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div
                      style={{
                        fontFamily: '"Gloria Hallelujah", "Caveat", cursive',
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        color: '#0f172a',
                        marginBottom: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <User size={18} />
                      {user.username}
                      {user.role === 'admin' && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#fbbf24',
                            color: '#fff',
                            borderRadius: '4px',
                            fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                          }}
                        >
                          <Shield size={12} style={{ display: 'inline' }} /> ADMIN
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                        fontSize: '0.9rem',
                        color: '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Mail size={14} />
                      {user.email}
                      {user.emailVerified ? (
                        <span style={{ color: '#10b981', fontSize: '0.85rem' }}>✓ Bestätigt</span>
                      ) : (
                        <span style={{ color: '#ef4444', fontSize: '0.85rem' }}>✗ Nicht bestätigt</span>
                      )}
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() =>
                        setDeleteConfirm({
                          isOpen: true,
                          userId: user.id,
                          username: user.username,
                        })
                      }
                      style={{
                        padding: '0.5rem 1rem',
                        border: '2px solid #ef4444',
                        borderRadius: '6px',
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        fontFamily: '"Inter", "Roboto", Arial, sans-serif',
                      }}
                    >
                      <UserMinus size={16} />
                      Entfernen
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Invitations - Only for Admins */}
        {isAdmin && (
        <div style={{ ...cardStyle, marginTop: '2rem' }}>
          <h3 style={{
            fontFamily: '"Gloria Hallelujah", "Caveat", cursive',
            fontSize: '1.2rem',
            margin: 0,
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <Mail size={18} /> Ausstehende Einladungen ({invitations.length})
          </h3>

          {invitations.length === 0 ? (
            <div style={{
              padding: '1rem',
              border: '2px dashed #cbd5e1',
              borderRadius: '12px',
              color: '#64748b',
              background: '#f8fafc',
            }}>
              Keine ausstehenden Einladungen.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {invitations.map((inv) => (
                <div key={inv.id} style={{
                  padding: '1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  background: '#fff',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{inv.email}</div>
                      <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Rolle: {inv.role === 'admin' ? 'Admin' : 'Mitglied'}</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Eingeladen von {inv.invitedBy}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Läuft ab am {new Date(inv.expiresAt).toLocaleDateString()}</div>
                      <button
                        onClick={async () => {
                          try {
                            setSaving(true);
                            setError(null);
                            await api.revokeInvitation(orgId!, inv.id);
                            setSuccessMessage('Einladung widerrufen');
                            setTimeout(() => setSuccessMessage(null), 2500);
                            await loadData();
                          } catch (err: any) {
                            setError(err.message || 'Einladung konnte nicht widerrufen werden');
                          } finally {
                            setSaving(false);
                          }
                        }}
                        style={{
                          ...buttonStyle,
                          backgroundColor: '#fef2f2',
                          color: '#dc2626',
                          border: '2px solid #dc2626',
                          boxShadow: '2px 4px 0 #dc2626',
                          padding: '0.5rem 0.75rem',
                        }}
                      >
                        Widerrufen
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}


        {/* Tag Management - Event Tags */}
        {isAdmin && orgId && (
          <div style={{ ...cardStyle, marginBottom: '2rem', marginTop: '2rem' }}>
            <h2
              style={{
                fontFamily: '"Gloria Hallelujah", "Caveat", cursive',
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#0f172a',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              Tags für Veranstaltungen
              <span style={{
                marginLeft: '1rem',
                color: '#f59e42',
                fontWeight: 600,
                fontSize: '0.95rem',
                fontFamily: 'Inter, Roboto, Arial, sans-serif',
                background: '#fffbe6',
                borderRadius: '6px',
                padding: '0.2rem 0.7rem',
                border: '1px solid #fbbf24',
              }}>
                Coming soon
              </span>
            </h2>
          </div>
        )}

        {/* Display Management */}
        {isAdmin && orgId && (
            <DisplayManager organisationId={orgId} />
        )}

        {/* Shared Plans Management */}
        {isAdmin && orgId && (
            <OrganisationSharedPlans organisationId={orgId} />
        )}

        
        {/* Message for non-admin users */}
        {!isAdmin && (
          <div style={{ ...cardStyle, marginBottom: '2rem', textAlign: 'center' }}>
            <h2
              style={{
                fontFamily: '"Gloria Hallelujah", "Caveat", cursive',
                fontSize: '1.5rem',
                marginBottom: '1rem',
                color: '#64748b',
              }}
            >
              Begrenzte Berechtigung
            </h2>
            <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.5' }}>
              Du hast nur Mitglieder-Berechtigung für diese Organisation. 
              Nur Administratoren können Organisation-Einstellungen bearbeiten, 
              Benutzer verwalten und neue Mitglieder einladen.
            </p>
            {user?.organisationId !== orgId && (
              <p style={{ color: '#dc2626', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Du gehörst zu einer anderen Organisation und hast daher keinen Zugriff auf diese Einstellungen.
              </p>
            )}
          </div>
        )}
      </main>

      {isAdmin && (
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, userId: '', username: '' })}
        onConfirm={() => handleRemoveUser(deleteConfirm.userId)}
        title="Benutzer entfernen"
        message={`Bist du sicher, dass du ${deleteConfirm.username} aus dieser Organisation entfernen möchtest?`}
        confirmText="Entfernen"
        cancelText="Abbrechen"
        type="error"
      />
      )}
    </div>
  );
};

export default OrganisationSettings;
