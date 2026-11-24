import { useEffect, useState, type FormEvent } from 'react'
import { Copy, LoaderCircle, ShieldCheck, Users } from 'lucide-react'
import { adminRequest, type AdminUser } from '../lib/auth'
type Account = AdminUser & { active: boolean }
type NewAccount = { email: string; temporaryPassword: string }
const roleNames = {
  owner: 'Responsable de la plateforme',
  administrator: 'Administrateur',
  breakfast_editor: 'Éditeur Breakfast',
}

export function AccountManagement({ preview = false }: { preview?: boolean }) {
  const [accounts, setAccounts] = useState<Account[]>(() =>
    preview
      ? [
          {
            id: 'demo-owner',
            name: 'Responsable Koinonia',
            email: 'responsable@example.com',
            role: 'owner',
            active: true,
            mustChangePassword: false,
            permissions: [],
          },
          {
            id: 'demo-editor',
            name: 'Équipe éditoriale',
            email: 'edition@example.com',
            role: 'breakfast_editor',
            active: true,
            mustChangePassword: true,
            permissions: [],
          },
        ]
      : [],
  )
  const [loading, setLoading] = useState(!preview)
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
    if (preview) return
    let active = true
    adminRequest<Account[]>('/users')
      .then((data) => {
        if (active) setAccounts(data)
      })
      .catch((failure) => {
        if (active) setError(failure.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [preview])

  async function create(event: FormEvent) {
    event.preventDefault()
    if (preview) {
      setError(
        'Connectez-vous avec un compte administrateur pour créer un accès réel.',
      )
      return
    }
    if (busy) return
    setBusy(true)
    setError('')
    setCreated(undefined)
    setCopied(false)
    try {
      const result = await adminRequest<NewAccount>('/users', {
        name,
        email,
        role,
      })
      setCreated(result)
      setName('')
      setEmail('')
      await refresh()
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : 'Création impossible.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="account-grid">
      <section className="accounts-panel">
        <h2>
          <Users size={22} />
          Comptes de gestion
        </h2>
        <p className="muted">
          Les personnes autorisées à administrer le mouvement.
        </p>
        {!!error && (
          <p className="feedback error" role="alert">
            {error}
          </p>
        )}
        {loading ? (
          <p role="status">Chargement des comptes…</p>
        ) : (
          <ul className="account-list">
            {accounts.map((account) => (
              <li key={account.id}>
                <span className="avatar" aria-hidden="true">
                  {account.name.slice(0, 1).toUpperCase()}
                </span>
                <div>
                  <strong>{account.name}</strong>
                  <span>{account.email}</span>
                  <small>
                    {roleNames[account.role]}
                    {account.mustChangePassword
                      ? ' · Première connexion à effectuer'
                      : ''}
                  </small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="create-panel">
        <h2>Créer un accès</h2>
        <p className="muted">
          Un mot de passe temporaire sera généré pour ce compte.
        </p>
        <form onSubmit={create} className="auth-form" aria-busy={busy}>
          <label className="field">
            <span>Nom</span>
            <input
              name="name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              minLength={2}
              maxLength={100}
              required
              disabled={busy}
            />
          </label>
          <label className="field">
            <span>Adresse e-mail</span>
            <input
              name="newEmail"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={busy}
            />
          </label>
          <label className="field">
            <span>Rôle</span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              disabled={busy}
            >
              <option value="breakfast_editor">Éditeur Breakfast</option>
              <option value="administrator">Administrateur</option>
            </select>
          </label>
          <p className="field-help">
            {role === 'breakfast_editor'
              ? 'Rédiger les Breakfasts et programmer leur publication.'
              : 'Gérer les comptes administratifs et les publications.'}
          </p>
          <button className="primary-button" disabled={busy}>
            {busy ? (
              <LoaderCircle className="spinner" size={18} />
            ) : (
              <ShieldCheck size={18} />
            )}
            Créer le compte
          </button>
        </form>
        {created && (
          <div className="credentials" role="status">
            <h3>Accès créé</h3>
            <p>{created.email}</p>
            <label className="field">
              <span>Mot de passe temporaire</span>
              <input readOnly value={created.temporaryPassword} />
            </label>
            <p className="field-help">
              Transmettez cet accès à la personne concernée. Le changement du
              mot de passe sera demandé à sa première connexion.
            </p>
            <button
              className="text-button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(created.temporaryPassword)
                  setCopied(true)
                } catch {
                  setError(
                    'Copie indisponible. Sélectionnez le mot de passe pour le copier.',
                  )
                }
              }}
            >
              <Copy size={17} />
              {copied ? 'Copié' : 'Copier le mot de passe'}
            </button>
            <button
              className="text-button"
              onClick={() => setCreated(undefined)}
            >
              Masquer les identifiants
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
