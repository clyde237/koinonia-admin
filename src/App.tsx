import {
  useEffect,
  useRef,
  useState,
  useId,
  type FormEvent,
  type InputHTMLAttributes,
} from 'react'
import {
  ArrowRight,
  BookOpen,
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react'
import logo from './assets/logo-koinonia.png'
import {
  adminRequest,
  authClient,
  authMessage,
  type AdminUser,
} from './lib/auth'
import { AdminWorkspace } from './workspace/Workspace'
import './App.css'

function PasswordField({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const [visible, setVisible] = useState(false)
  const id = useId()
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <span className="password-input">
        <input {...props} id={id} type={visible ? 'text' : 'password'} />
        <button
          type="button"
          className="icon-button"
          aria-label={
            visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
          }
          aria-pressed={visible}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff size={19} /> : <Eye size={19} />}
        </button>
      </span>
    </div>
  )
}

function App() {
  const isPreview =
    import.meta.env.DEV &&
    new URLSearchParams(window.location.search).get('apercu') === '1'
  const [admin, setAdmin] = useState<AdminUser>()
  const [loading, setLoading] = useState(!isPreview)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [newPassword, setNewPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const submitting = useRef(false)

  useEffect(() => {
    if (isPreview) return
    let active = true
    async function restore() {
      try {
        const session = await authClient.getSession()
        if (session.error)
          throw new Error(
            'Impossible de vérifier votre session. Réessayez de vous connecter.',
          )
        if (session.data?.user) {
          const account = await adminRequest<AdminUser>('/me')
          if (active) setAdmin(account)
        }
      } catch (failure) {
        if (active)
          setError(
            failure instanceof Error
              ? failure.message
              : 'Service indisponible.',
          )
      } finally {
        if (active) setLoading(false)
      }
    }
    void restore()
    return () => {
      active = false
    }
  }, [isPreview])

  useEffect(() => {
    const expired = () => {
      setAdmin(undefined)
      setPassword('')
      setNewPassword('')
      setConfirmation('')
      setError('Votre session administrateur a expiré. Reconnectez-vous.')
    }
    window.addEventListener('koinonia:admin-session-expired', expired)
    return () =>
      window.removeEventListener('koinonia:admin-session-expired', expired)
  }, [])

  async function run(action: () => Promise<void>) {
    if (submitting.current) return
    submitting.current = true
    setBusy(true)
    setError('')
    try {
      await action()
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : 'Une erreur est survenue. Réessayez.',
      )
    } finally {
      submitting.current = false
      setBusy(false)
    }
  }

  function login(event: FormEvent) {
    event.preventDefault()
    void run(async () => {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
        rememberMe: remember,
      })
      if (result.error) throw new Error(authMessage(result.error))
      const account = await adminRequest<AdminUser>('/me')
      setAdmin(account)
      setPassword('')
    })
  }

  function changePassword(event: FormEvent) {
    event.preventDefault()
    void run(async () => {
      if (newPassword !== confirmation)
        throw new Error('Les nouveaux mots de passe ne correspondent pas.')
      if (newPassword === password)
        throw new Error(
          'Choisissez un mot de passe différent du mot de passe actuel.',
        )
      const result = await authClient.changePassword({
        currentPassword: password,
        newPassword,
        revokeOtherSessions: true,
      })
      if (result.error) throw new Error(authMessage(result.error))
      setPassword('')
      setNewPassword('')
      setConfirmation('')
      setAdmin(await adminRequest<AdminUser>('/me'))
    })
  }

  function logout() {
    void run(async () => {
      const result = await authClient.signOut()
      if (result.error) throw new Error('La déconnexion a échoué. Réessayez.')
      setAdmin(undefined)
      setPassword('')
      setNewPassword('')
      setConfirmation('')
    })
  }

  if (isPreview)
    return (
      <AdminWorkspace
        user={{
          id: 'preview',
          name: 'Clyde Fanche',
          email: 'apercu@example.com',
          role: 'owner',
          mustChangePassword: false,
          permissions: [
            'admins:manage',
            'breakfasts:write',
            'breakfasts:schedule',
          ],
        }}
        preview
        onLogout={() => window.location.assign('/')}
      />
    )
  if (admin && !admin.mustChangePassword)
    return (
      <AdminWorkspace
        user={admin}
        onLogout={logout}
        busy={busy}
        error={error}
      />
    )

  return (
    <main className="auth-layout">
      <aside
        className="brand-panel"
        aria-label="Koinonia, Communion avec le Saint-Esprit"
      >
        <div className="brand-panel-top">
          <span className="brand-mark">
            <BookOpen size={22} />
          </span>
          <span>Au service de la communion</span>
        </div>
        <div className="brand-message">
          <p className="brand-signature">Koinonia</p>
          <h2>
            Un même esprit.
            <br />
            Une même communion.
          </h2>
          <p>
            Préparer la parole du jour, accompagner les communautés et faire
            grandir la vie du mouvement.
          </p>
        </div>
        <p className="brand-footer">Communion avec le Saint-Esprit</p>
      </aside>

      <section className="auth-panel">
        <div className="auth-content">
          <img
            className="brand"
            src={logo}
            alt="Koinonia"
            width="244"
            height="41"
          />
          {loading ? (
            <div className="restoring" role="status">
              <LoaderCircle className="spinner" size={22} />
              Vérification de votre session…
            </div>
          ) : (
            <>
              <div className="auth-heading">
                <span className="heading-icon">
                  {admin ? (
                    <LockKeyhole size={23} />
                  ) : (
                    <ShieldCheck size={23} />
                  )}
                </span>
                <h1>
                  {admin
                    ? 'Créez votre mot de passe'
                    : 'Heureux de vous retrouver.'}
                </h1>
                <p>
                  {admin
                    ? 'Créez votre mot de passe administrateur personnel à partir de l’accès temporaire reçu.'
                    : 'Connectez-vous à votre espace de gestion Koinonia.'}
                </p>
              </div>

              {!!error && (
                <p className="feedback error" role="alert">
                  {error}
                </p>
              )}

              {admin ? (
                <form
                  onSubmit={changePassword}
                  className="auth-form"
                  aria-label="Changement obligatoire du mot de passe"
                  aria-busy={busy}
                >
                  <p className="identity">{admin.email}</p>
                  <PasswordField
                    label="Mot de passe temporaire"
                    name="currentPassword"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    maxLength={128}
                    disabled={busy}
                  />
                  <PasswordField
                    label="Nouveau mot de passe"
                    name="newPassword"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    required
                    minLength={12}
                    maxLength={128}
                    disabled={busy}
                    aria-describedby="password-help"
                  />
                  <p id="password-help" className="field-help">
                    Au moins 12 caractères. Vous pouvez utiliser une phrase de
                    passe.
                  </p>
                  <PasswordField
                    label="Confirmer le nouveau mot de passe"
                    name="confirmation"
                    autoComplete="new-password"
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)}
                    required
                    minLength={12}
                    maxLength={128}
                    disabled={busy}
                  />
                  <button className="primary-button" disabled={busy}>
                    {busy ? (
                      <LoaderCircle className="spinner" size={19} />
                    ) : (
                      <Check size={19} />
                    )}
                    Enregistrer et continuer
                  </button>
                  <button
                    type="button"
                    className="text-button centered"
                    onClick={logout}
                    disabled={busy}
                  >
                    Se déconnecter
                  </button>
                </form>
              ) : (
                <form
                  onSubmit={login}
                  className="auth-form"
                  aria-label="Connexion à l’administration"
                  aria-busy={busy}
                >
                  <label className="field">
                    <span>Adresse e-mail</span>
                    <input
                      name="email"
                      type="email"
                      autoComplete="username"
                      placeholder="vous@exemple.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      disabled={busy}
                    />
                  </label>
                  <PasswordField
                    label="Mot de passe"
                    name="password"
                    autoComplete="current-password"
                    placeholder="Votre mot de passe"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    maxLength={128}
                    disabled={busy}
                  />
                  <label className="remember">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(event) => setRemember(event.target.checked)}
                      disabled={busy}
                    />
                    Garder ma session ouverte
                  </label>
                  <button className="primary-button" disabled={busy}>
                    {busy ? (
                      <LoaderCircle className="spinner" size={19} />
                    ) : null}
                    {busy ? 'Connexion en cours…' : 'Se connecter'}
                    {!busy && <ArrowRight size={19} />}
                  </button>
                </form>
              )}
              <p className="access-note">
                Utilisez les identifiants administrateur fournis par le
                responsable. Cet accès est indépendant de votre compte mobile.
              </p>
            </>
          )}
        </div>
        {import.meta.env.DEV && (
          <a className="ws-preview-entry" href="/?apercu=1">
            Aperçu de l’interface · données de démonstration
          </a>
        )}
        <footer className="auth-footer">
          Koinonia · Espace d’administration
        </footer>
      </section>
    </main>
  )
}

export default App
