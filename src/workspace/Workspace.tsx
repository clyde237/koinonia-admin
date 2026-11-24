import { useEffect, useRef, useState } from 'react'
import {
  BrowserRouter,
  NavLink,
  Route,
  Routes,
  useLocation,
} from 'react-router'
import {
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  LogOut,
  Menu,
  Search,
  X,
} from 'lucide-react'
import type { AdminUser } from '../lib/auth'
import logo from '../assets/logo-koinonia.png'
import { WorkspaceProvider } from './store'
import { useWorkspace } from './context'
import { allPages, navigation } from './navigation'
import { Avatar, EmptyState, Modal, SearchField, WLink } from './ui'
import { Dashboard } from './pages/Dashboard'
import { Breakfasts } from './pages/Breakfasts'
import { Editor } from './pages/Editor'
import { Planning } from './pages/Planning'
import {
  Communities,
  Conversations,
  Members,
  Memberships,
  Moderation,
} from './pages/Community'
import { Events, Facebook, Notifications } from './pages/Communications'
import { Bible, MediaLibrary } from './pages/Library'
import {
  Activity,
  Help,
  Profile,
  Roadmap,
  Settings,
  Statistics,
  Team,
} from './pages/Administration'
import './workspace.css'

type Props = {
  user: AdminUser
  onLogout: () => void
  busy?: boolean
  preview?: boolean
  error?: string
}
export function AdminWorkspace({
  user,
  onLogout,
  busy = false,
  preview = false,
  error,
}: Props) {
  return (
    <BrowserRouter>
      <WorkspaceProvider
        key={preview ? 'preview' : user.id}
        user={user}
        preview={preview}
      >
        <Shell onLogout={onLogout} busy={busy} error={error} />
      </WorkspaceProvider>
    </BrowserRouter>
  )
}
function Shell({
  onLogout,
  busy,
  error,
}: Pick<Props, 'onLogout' | 'busy' | 'error'>) {
  const { user, preview, data, breakfasts, storageError } = useWorkspace()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false),
    [searchOpen, setSearchOpen] = useState(false),
    [search, setSearch] = useState(''),
    [notificationsOpen, setNotificationsOpen] = useState(false)
  const sidebar = useRef<HTMLElement>(null)
  const manager = user.permissions.includes('admins:manage')
  const visibleNavigation = navigation
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !('admin' in item) || !item.admin || manager,
      ),
    }))
    .filter((group) => group.items.length)
  const label = location.pathname.startsWith('/breakfasts/')
    ? 'Rédaction du Breakfast'
    : (allPages.find((p) => p.to === location.pathname)?.label ??
      'Page introuvable')
  const [today] = useState(() =>
    new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      timeZone: 'Africa/Douala',
    }).format(new Date()),
  )
  const to = (path: string) => path + (preview ? '?apercu=1' : '')
  useEffect(() => {
    document.title = `${label} · Koinonia Administration`
    window.scrollTo({ top: 0, behavior: 'instant' })
    document.getElementById('page-title')?.focus({ preventScroll: true })
  }, [location.pathname, label])
  useEffect(() => {
    const keyboard = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', keyboard)
    return () => window.removeEventListener('keydown', keyboard)
  }, [])
  useEffect(() => {
    if (!menuOpen) return
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusable = () =>
      [
        ...(sidebar.current?.querySelectorAll<HTMLElement>(
          'a,button:not([disabled])',
        ) ?? []),
      ].filter(
        (el) =>
          getComputedStyle(el).display !== 'none' &&
          getComputedStyle(el).visibility === 'visible',
      )
    const focusFirst = () => focusable()[0]?.focus({ preventScroll: true })
    const focusFrame = requestAnimationFrame(focusFirst)
    const drawer = sidebar.current
    const afterOpening = (event: TransitionEvent) => {
      if (event.target === drawer && event.propertyName === 'transform')
        focusFirst()
    }
    drawer?.addEventListener('transitionend', afterOpening)
    const keyboard = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
      if (e.key === 'Tab') {
        const list = focusable()
        const first = list[0],
          last = list.at(-1)
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }
    document.addEventListener('keydown', keyboard)
    return () => {
      cancelAnimationFrame(focusFrame)
      drawer?.removeEventListener('transitionend', afterOpening)
      document.body.style.overflow = overflow
      document.removeEventListener('keydown', keyboard)
      previous?.focus({ preventScroll: true })
    }
  }, [menuOpen])
  const foundPages = allPages
    .filter(
      (p) =>
        (!('admin' in p) || !p.admin || manager) &&
        p.label.toLowerCase().includes(search.toLowerCase()),
    )
    .slice(0, 6)
  const foundBreakfasts = search.trim()
    ? breakfasts
        .filter((b) => b.title.toLowerCase().includes(search.toLowerCase()))
        .slice(0, 4)
    : []
  const allowed = (children: React.ReactNode) =>
    manager ? (
      children
    ) : (
      <EmptyState
        title="Un accès réservé à l’équipe d’administration"
        description="Votre rôle d’éditeur vous permet de préparer les Breakfasts et leur programmation."
      >
        <WLink to="/breakfasts" className="ws-button primary">
          Ouvrir les Breakfasts
        </WLink>
      </EmptyState>
    )
  return (
    <div
      className="ws-app"
      onClick={(event) => {
        if ((event.target as Element).closest('a')) {
          setMenuOpen(false)
          setSearchOpen(false)
          setNotificationsOpen(false)
        }
      }}
    >
      <a className="ws-skip" href="#main-content">
        Aller au contenu
      </a>
      {menuOpen && (
        <button
          className="ws-mobile-scrim"
          aria-label="Fermer la navigation"
          tabIndex={-1}
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside
        ref={sidebar}
        className={`ws-sidebar ${menuOpen ? 'is-open' : ''}`}
        role={menuOpen ? 'dialog' : undefined}
        aria-modal={menuOpen || undefined}
        aria-label="Navigation de l’administration"
      >
        <div className="ws-sidebar-brand">
          <WLink to="/">
            <img
              src={logo}
              alt="Koinonia, tableau de bord"
              width="170"
              height="29"
            />
          </WLink>
          <button
            className="ws-icon ws-mobile-close"
            aria-label="Fermer la navigation"
            onClick={() => setMenuOpen(false)}
          >
            <X size={20} />
          </button>
          <span>ESPACE D’ADMINISTRATION</span>
        </div>
        <nav className="ws-navigation">
          {visibleNavigation.map((group) => (
            <div key={group.label} className="ws-nav-group">
              <p>{group.label}</p>
              {group.items
                .filter((item) => !('admin' in item) || !item.admin || manager)
                .map((item) => (
                  <NavLink
                    key={item.to}
                    to={to(item.to)}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `ws-nav-item ${isActive ? 'active' : ''}`
                    }
                  >
                    <item.icon size={19} strokeWidth={1.7} />
                    <span>{item.label}</span>
                    {item.to === '/adhesions' &&
                      !!data.memberships.filter(
                        (r) => r.status === 'En attente',
                      ).length && (
                        <small>
                          {
                            data.memberships.filter(
                              (r) => r.status === 'En attente',
                            ).length
                          }
                        </small>
                      )}
                  </NavLink>
                ))}
            </div>
          ))}
        </nav>
        <div className="ws-sidebar-bottom">
          <WLink to="/aide" className="ws-help-link">
            <CircleHelp size={18} />
            Besoin d’un repère ?<ChevronRight size={14} />
          </WLink>
          <div className="ws-sidebar-profile">
            <WLink to="/mon-compte">
              <Avatar name={user.name} />
              <span>
                <strong>{user.name}</strong>
                <small>
                  {manager ? 'Administration' : 'Édition Breakfast'}
                </small>
              </span>
            </WLink>
            <button
              className="ws-icon"
              aria-label="Se déconnecter"
              onClick={onLogout}
              disabled={busy}
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
      <div className="ws-main-shell" inert={menuOpen}>
        <header className="ws-topbar">
          <div className="ws-breadcrumb">
            <button
              className="ws-icon ws-menu-button"
              aria-label="Ouvrir la navigation"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={21} />
            </button>
            <span>Koinonia</span>
            <ChevronRight size={14} />
            <strong>{label}</strong>
          </div>
          <div className="ws-topbar-tools">
            <button
              aria-label="Rechercher dans Koinonia"
              className="ws-topbar-search"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={17} />
              <span>Rechercher</span>
              <kbd>Ctrl K</kbd>
            </button>
            <span className="ws-header-date">
              <CalendarDays size={16} />
              {today}
            </span>
            <button
              className="ws-icon ws-notification-button"
              aria-label="Consulter les messages préparés"
              onClick={() => setNotificationsOpen(true)}
            >
              <Bell size={20} />
              {!!data.notifications.length && <i />}
            </button>
            <details className="ws-account-menu">
              <summary aria-label="Menu de mon compte">
                <Avatar name={user.name} />
                <ChevronDown size={14} />
              </summary>
              <div>
                <WLink to="/mon-compte">Mon compte</WLink>
                {manager && <WLink to="/parametres">Paramètres</WLink>}
                <button onClick={onLogout} disabled={busy}>
                  <LogOut size={16} />
                  Se déconnecter
                </button>
              </div>
            </details>
          </div>
        </header>
        <main id="main-content" className="ws-content">
          {error && (
            <p className="ws-inline-alert" role="alert">
              {error}
            </p>
          )}
          <div className={`ws-mode-bar ${preview ? 'preview' : ''}`}>
            <span>
              <i />
              {preview ? 'MODE APERÇU' : 'ESPACE DE PRÉPARATION'}
            </span>
            <p>
              {preview
                ? 'Données de démonstration · explorez les pages et essayez les formulaires.'
                : 'Les brouillons restent sur cet appareil. Les comptes de l’équipe utilisent le service central.'}
            </p>
            <WLink to="/aide">
              En savoir plus
              <ChevronRight size={13} />
            </WLink>
          </div>
          {storageError && (
            <div className="ws-inline-alert" role="alert">
              Le navigateur ne permet pas de conserver vos modifications.
              Exportez vos données avant de quitter.
            </div>
          )}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/breakfasts" element={<Breakfasts />} />
            <Route path="/breakfasts/nouveau" element={<Editor key="new" />} />
            <Route
              path="/breakfasts/:id"
              element={<Editor key={location.pathname} />}
            />
            <Route path="/programmation" element={<Planning />} />
            <Route path="/mediatheque" element={<MediaLibrary />} />
            <Route path="/bible" element={<Bible />} />
            <Route path="/diffusion" element={allowed(<Facebook />)} />
            <Route path="/membres" element={allowed(<Members />)} />
            <Route path="/communautes" element={allowed(<Communities />)} />
            <Route path="/adhesions" element={allowed(<Memberships />)} />
            <Route path="/conversations" element={allowed(<Conversations />)} />
            <Route path="/moderation" element={allowed(<Moderation />)} />
            <Route path="/evenements" element={allowed(<Events />)} />
            <Route path="/notifications" element={allowed(<Notifications />)} />
            <Route path="/statistiques" element={allowed(<Statistics />)} />
            <Route path="/equipe" element={allowed(<Team />)} />
            <Route path="/parametres" element={allowed(<Settings />)} />
            <Route path="/journal" element={allowed(<Activity />)} />
            <Route path="/mon-compte" element={<Profile />} />
            <Route path="/aide" element={<Help />} />
            <Route path="/evolutions" element={<Roadmap />} />
            <Route
              path="*"
              element={
                <EmptyState
                  title="Cette page n’existe pas"
                  description="Retrouvez les contenus depuis la navigation de l’administration."
                >
                  <WLink to="/" className="ws-button primary">
                    Revenir au tableau de bord
                  </WLink>
                </EmptyState>
              }
            />
          </Routes>
          <footer className="ws-footer">
            <span>
              Koinonia <i />
              Communion avec le Saint-Esprit
            </span>
            <div>
              <WLink to="/evolutions">Modules à venir</WLink>
              <WLink to="/aide">Centre d’aide</WLink>
            </div>
          </footer>
        </main>
      </div>
      <Modal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        title="Rechercher dans Koinonia"
      >
        <div className="ws-command">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Une page, un Breakfast…"
          />
          <p className="ws-eyebrow">{search ? 'RÉSULTATS' : 'ACCÈS RAPIDE'}</p>
          {foundPages.map((page) => (
            <WLink to={page.to} key={page.to} className="ws-command-result">
              <page.icon size={18} />
              <span>{page.label}</span>
              <ChevronRight size={15} />
            </WLink>
          ))}
          {foundBreakfasts.map((b) => (
            <WLink
              to={'/breakfasts/' + b.id}
              key={b.id}
              className="ws-command-result"
            >
              <img src={b.image} alt="" />
              <span>
                {b.title}
                <small>Breakfast</small>
              </span>
              <ChevronRight size={15} />
            </WLink>
          ))}
          {!foundPages.length && !foundBreakfasts.length && (
            <EmptyState
              title="Aucun résultat"
              description="Essayez un autre titre ou un nom de page."
            />
          )}
        </div>
      </Modal>
      <Modal
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        title="Messages préparés"
        description="Les dernières préparations de communication."
      >
        {data.notifications.length ? (
          data.notifications.map((n) => (
            <div className="ws-notification-item" key={n.id}>
              <span className="ws-task-icon mint">
                <Bell size={18} />
              </span>
              <div>
                <strong>{n.title}</strong>
                <p>{n.body}</p>
                <small>
                  {n.status} · {n.target}
                </small>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            title="Aucun message préparé"
            description="Les brouillons de notification apparaîtront ici."
          />
        )}
        {manager && (
          <div className="ws-modal-actions">
            <WLink to="/notifications" className="ws-button primary">
              Ouvrir les notifications
            </WLink>
          </div>
        )}
      </Modal>
    </div>
  )
}
