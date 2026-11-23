import { useEffect, useRef, useState, useId, type FormEvent, type InputHTMLAttributes } from 'react'
import { ArrowRight, BookOpen, CalendarDays, Check, Copy, Eye, EyeOff, LoaderCircle, LockKeyhole, LogOut, ShieldCheck, Users } from 'lucide-react'
import logo from './assets/logo-koinonia.png'
import { adminRequest, authClient, authMessage, type AdminUser } from './lib/auth'
import './App.css'

type Account = AdminUser & { active: boolean }
type NewAccount = { email: string; temporaryPassword: string }
const roleNames = { owner: 'Responsable de la plateforme', administrator: 'Administrateur', breakfast_editor: 'Éditeur Breakfast' }

function PasswordField({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const [visible, setVisible] = useState(false)
  const id = useId()
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <span className="password-input">
        <input {...props} id={id} type={visible ? 'text' : 'password'} />
        <button type="button" className="icon-button" aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} aria-pressed={visible} onClick={() => setVisible(!visible)}>
          {visible ? <EyeOff size={19} /> : <Eye size={19} />}
        </button>
      </span>
    </div>
  )
}

function App() {
  const [admin, setAdmin] = useState<AdminUser>()
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [newPassword, setNewPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const submitting = useRef(false)

  useEffect(() => {
    let active = true
    async function restore() {
      try {
        const session = await authClient.getSession()
        if (session.error) throw new Error('Impossible de vérifier votre session. Réessayez de vous connecter.')
        if (session.data?.user) {
          const account = await adminRequest<AdminUser>('/me')
          if (active) setAdmin(account)
        }
      } catch (failure) {
        if (active) setError(failure instanceof Error ? failure.message : 'Service indisponible.')
      } finally {
        if (active) setLoading(false)
      }
    }
    void restore()
    return () => { active = false }
  }, [])

  useEffect(() => {
    const expired = () => {
      setAdmin(undefined)
      setPassword(''); setNewPassword(''); setConfirmation('')
      setError('Votre session administrateur a expiré. Reconnectez-vous.')
    }
    window.addEventListener('koinonia:admin-session-expired', expired)
    return () => window.removeEventListener('koinonia:admin-session-expired', expired)
  }, [])

  async function run(action: () => Promise<void>) {
    if (submitting.current) return
    submitting.current = true
    setBusy(true)
    setError('')
    try { await action() }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Une erreur est survenue. Réessayez.') }
    finally { submitting.current = false; setBusy(false) }
  }

  function login(event: FormEvent) {
    event.preventDefault()
    void run(async () => {
      const result = await authClient.signIn.email({ email: email.trim(), password, rememberMe: remember })
      if (result.error) throw new Error(authMessage(result.error))
      const account = await adminRequest<AdminUser>('/me')
      setAdmin(account)
      setPassword('')
    })
  }

  function changePassword(event: FormEvent) {
    event.preventDefault()
    void run(async () => {
      if (newPassword !== confirmation) throw new Error('Les nouveaux mots de passe ne correspondent pas.')
      if (newPassword === password) throw new Error('Choisissez un mot de passe différent du mot de passe actuel.')
      const result = await authClient.changePassword({ currentPassword: password, newPassword, revokeOtherSessions: true })
      if (result.error) throw new Error(authMessage(result.error))
      setPassword(''); setNewPassword(''); setConfirmation('')
      setAdmin(await adminRequest<AdminUser>('/me'))
    })
  }

  function logout() {
    void run(async () => {
      const result = await authClient.signOut()
      if (result.error) throw new Error('La déconnexion a échoué. Réessayez.')
      setAdmin(undefined)
      setPassword(''); setNewPassword(''); setConfirmation('')
    })
  }

  if (admin && !admin.mustChangePassword) {
    return (
      <div className="workspace">
        <header className="workspace-header">
          <img src={logo} alt="Koinonia" width="195" height="33" />
          <button className="text-button" onClick={logout} disabled={busy}><LogOut size={18} />Se déconnecter</button>
        </header>
        <main className="workspace-main">
          <div className="account-heading">
            <div><p className="muted">{roleNames[admin.role]}</p><h1>Bonjour, {admin.name.split(' ')[0]}.</h1></div>
            <ShieldCheck size={30} aria-hidden="true" />
          </div>
          {!!error && <p className="feedback error" role="alert">{error}</p>}
          {admin.permissions.includes('admins:manage') ? <AdminAccounts /> : (
            <section className="permission-panel">
              <h2>Votre accès éditorial</h2>
              <p>Ce compte est autorisé à préparer les Breakfasts et à programmer leur publication.</p>
              <ul className="permission-list">
                <li><BookOpen size={20} />Rédaction des Breakfasts</li>
                <li><CalendarDays size={20} />Programmation des publications</li>
              </ul>
            </section>
          )}
        </main>
      </div>
    )
  }

  return (
    <main className="auth-layout">
      <aside className="brand-panel" aria-label="Koinonia, Communion avec le Saint-Esprit">
        <div className="brand-panel-top"><span className="brand-mark"><BookOpen size={22} /></span><span>Au service de la communion</span></div>
        <div className="brand-message">
          <p className="brand-signature">Koinonia</p>
          <h2>Un même esprit.<br />Une même communion.</h2>
          <p>Préparer la parole du jour, accompagner les communautés et faire grandir la vie du mouvement.</p>
        </div>
        <p className="brand-footer">Communion avec le Saint-Esprit</p>
      </aside>

      <section className="auth-panel">
        <div className="auth-content">
          <img className="brand" src={logo} alt="Koinonia" width="244" height="41" />
          {loading ? <div className="restoring" role="status"><LoaderCircle className="spinner" size={22} />Vérification de votre session…</div> : (
            <>
              <div className="auth-heading">
                <span className="heading-icon">{admin ? <LockKeyhole size={23} /> : <ShieldCheck size={23} />}</span>
                <h1>{admin ? 'Créez votre mot de passe' : 'Heureux de vous retrouver.'}</h1>
                <p>{admin ? 'Créez votre mot de passe administrateur personnel à partir de l’accès temporaire reçu.' : 'Connectez-vous à votre espace de gestion Koinonia.'}</p>
              </div>

              {!!error && <p className="feedback error" role="alert">{error}</p>}

              {admin ? (
                <form onSubmit={changePassword} className="auth-form" aria-label="Changement obligatoire du mot de passe" aria-busy={busy}>
                  <p className="identity">{admin.email}</p>
                  <PasswordField label="Mot de passe temporaire" name="currentPassword" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required maxLength={128} disabled={busy} />
                  <PasswordField label="Nouveau mot de passe" name="newPassword" autoComplete="new-password" value={newPassword} onChange={event => setNewPassword(event.target.value)} required minLength={12} maxLength={128} disabled={busy} aria-describedby="password-help" />
                  <p id="password-help" className="field-help">Au moins 12 caractères. Vous pouvez utiliser une phrase de passe.</p>
                  <PasswordField label="Confirmer le nouveau mot de passe" name="confirmation" autoComplete="new-password" value={confirmation} onChange={event => setConfirmation(event.target.value)} required minLength={12} maxLength={128} disabled={busy} />
                  <button className="primary-button" disabled={busy}>{busy ? <LoaderCircle className="spinner" size={19} /> : <Check size={19} />}Enregistrer et continuer</button>
                  <button type="button" className="text-button centered" onClick={logout} disabled={busy}>Se déconnecter</button>
                </form>
              ) : (
                <form onSubmit={login} className="auth-form" aria-label="Connexion à l’administration" aria-busy={busy}>
                  <label className="field"><span>Adresse e-mail</span><input name="email" type="email" autoComplete="username" placeholder="vous@exemple.com" value={email} onChange={event => setEmail(event.target.value)} required disabled={busy} /></label>
                  <PasswordField label="Mot de passe" name="password" autoComplete="current-password" placeholder="Votre mot de passe" value={password} onChange={event => setPassword(event.target.value)} required maxLength={128} disabled={busy} />
                  <label className="remember"><input type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)} disabled={busy} />Garder ma session ouverte</label>
                  <button className="primary-button" disabled={busy}>{busy ? <LoaderCircle className="spinner" size={19} /> : null}{busy ? 'Connexion en cours…' : 'Se connecter'}{!busy && <ArrowRight size={19} />}</button>
                </form>
              )}
              <p className="access-note">Utilisez les identifiants administrateur fournis par le responsable. Cet accès est indépendant de votre compte mobile.</p>
            </>
          )}
        </div>
        <footer className="auth-footer">Koinonia · Espace d’administration</footer>
      </section>
    </main>
  )
}

function AdminAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('breakfast_editor')
  const [created, setCreated] = useState<NewAccount>()
  const [copied, setCopied] = useState(false)

  async function refresh() {
    setAccounts(await adminRequest<Account[]>('/users'))
  }
  useEffect(() => {
    let active = true
    adminRequest<Account[]>('/users')
      .then(data => { if (active) setAccounts(data) })
      .catch(failure => { if (active) setError(failure.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  async function create(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    setBusy(true); setError(''); setCreated(undefined); setCopied(false)
    try {
      const result = await adminRequest<NewAccount>('/users', { name, email, role })
      setCreated(result)
      setName(''); setEmail('')
      await refresh()
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Création impossible.')
    } finally { setBusy(false) }
  }

  return (
    <div className="account-grid">
      <section className="accounts-panel">
        <h2><Users size={22} />Comptes de gestion</h2>
        <p className="muted">Les personnes autorisées à administrer le mouvement.</p>
        {!!error && <p className="feedback error" role="alert">{error}</p>}
        {loading ? <p role="status">Chargement des comptes…</p> : (
          <ul className="account-list">{accounts.map(account => (
            <li key={account.id}>
              <span className="avatar" aria-hidden="true">{account.name.slice(0, 1).toUpperCase()}</span>
              <div><strong>{account.name}</strong><span>{account.email}</span><small>{roleNames[account.role]}{account.mustChangePassword ? ' · Première connexion à effectuer' : ''}</small></div>
            </li>
          ))}</ul>
        )}
      </section>
      <section className="create-panel">
        <h2>Créer un accès</h2>
        <p className="muted">Un mot de passe temporaire sera généré pour ce compte.</p>
        <form onSubmit={create} className="auth-form" aria-busy={busy}>
          <label className="field"><span>Nom</span><input name="name" autoComplete="name" value={name} onChange={event => setName(event.target.value)} minLength={2} maxLength={100} required disabled={busy} /></label>
          <label className="field"><span>Adresse e-mail</span><input name="newEmail" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required disabled={busy} /></label>
          <label className="field"><span>Rôle</span><select value={role} onChange={event => setRole(event.target.value)} disabled={busy}><option value="breakfast_editor">Éditeur Breakfast</option><option value="administrator">Administrateur</option></select></label>
          <p className="field-help">{role === 'breakfast_editor' ? 'Rédiger les Breakfasts et programmer leur publication.' : 'Gérer les comptes administratifs et les publications.'}</p>
          <button className="primary-button" disabled={busy}>{busy ? <LoaderCircle className="spinner" size={18} /> : <ShieldCheck size={18} />}Créer le compte</button>
        </form>
        {created && (
          <div className="credentials" role="status">
            <h3>Accès créé</h3>
            <p>{created.email}</p>
            <label className="field"><span>Mot de passe temporaire</span><input readOnly value={created.temporaryPassword} /></label>
            <p className="field-help">Transmettez cet accès à la personne concernée. Le changement du mot de passe sera demandé à sa première connexion.</p>
            <button className="text-button" onClick={async () => {
              try { await navigator.clipboard.writeText(created.temporaryPassword); setCopied(true) }
              catch { setError('Copie indisponible. Sélectionnez le mot de passe pour le copier.') }
            }}><Copy size={17} />{copied ? 'Copié' : 'Copier le mot de passe'}</button>
            <button className="text-button" onClick={() => setCreated(undefined)}>Masquer les identifiants</button>
          </div>
        )}
      </section>
    </div>
  )
}

export default App
