import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type ButtonHTMLAttributes,
} from 'react'
import { ArrowRight, Inbox, Search, X, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router'
import { useWorkspace } from './context'

export function Button({
  children,
  variant = 'primary',
  icon: Icon,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  icon?: LucideIcon
}) {
  return (
    <button
      {...props}
      type={type}
      className={`ws-button ${variant} ${props.className ?? ''}`}
    >
      {Icon && <Icon size={17} aria-hidden="true" />}
      {children}
    </button>
  )
}
export function WLink({
  to,
  children,
  className = '',
}: {
  to: string
  children: ReactNode
  className?: string
}) {
  const { preview } = useWorkspace()
  return (
    <Link className={className} to={to + (preview ? '?apercu=1' : '')}>
      {children}
    </Link>
  )
}
export function PageHeading({
  title,
  description,
  children,
  eyebrow,
}: {
  title: string
  description: string
  children?: ReactNode
  eyebrow?: string
}) {
  return (
    <div className="ws-page-heading">
      <div>
        {eyebrow && <p className="ws-eyebrow">{eyebrow}</p>}
        <h1 tabIndex={-1} id="page-title">
          {title}
        </h1>
        <p>{description}</p>
      </div>
      <div className="ws-page-actions">{children}</div>
    </div>
  )
}
export function Badge({
  children,
  status = '',
}: {
  children?: ReactNode
  status?: string
}) {
  const kind = [
    'Publié',
    'Actif',
    'Acceptée',
    'Résolu',
    'Ouvert',
    'Connecté',
  ].includes(status)
    ? 'positive'
    : ['Programmé', 'Préparée', 'En attente', 'À examiner'].includes(status)
      ? 'warning'
      : ['Suspendu', 'Refusée', 'Erreur'].includes(status)
        ? 'negative'
        : 'neutral'
  return (
    <span className={`ws-badge ${kind}`}>
      <span />
      {children ?? status}
    </span>
  )
}
export function SearchField({
  value,
  onChange,
  placeholder = 'Rechercher…',
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <label className="ws-search">
      <Search size={17} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Effacer la recherche"
        >
          <X size={14} />
        </button>
      )}
    </label>
  )
}
export function Panel({
  title,
  description,
  children,
  action,
  className = '',
}: {
  title?: string
  description?: string
  children: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <section className={`ws-panel ${className}`}>
      {title && (
        <div className="ws-panel-head">
          <div>
            <h2>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
export function EmptyState({
  title = 'Rien à afficher pour le moment',
  description = 'Les éléments apparaîtront ici.',
  children,
}: {
  title?: string
  description?: string
  children?: ReactNode
}) {
  return (
    <div className="ws-empty">
      <span>
        <Inbox size={25} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  )
}
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  wide = false,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  wide?: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const id = useId()
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      dialog
        .querySelector<HTMLElement>(
          'input:not([type=hidden]), textarea, select',
        )
        ?.focus()
    }
    if (!open && dialog.open) dialog.close()
  }, [open])
  return (
    <dialog
      ref={ref}
      className={`ws-dialog ${wide ? 'wide' : ''}`}
      aria-labelledby={id}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect()
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose()
        }
      }}
    >
      <div className="ws-dialog-head">
        <div>
          <h2 id={id}>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        <button
          className="ws-icon"
          aria-label="Fermer la fenêtre"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  )
}
export function LocalNote({ children }: { children?: ReactNode }) {
  return (
    <p className="ws-local-note">
      {children ??
        'Préparation locale : ces modifications ne sont pas diffusées dans l’application.'}
    </p>
  )
}
export function SectionLink({
  to,
  children,
}: {
  to: string
  children: ReactNode
}) {
  return (
    <WLink to={to} className="ws-inline-link">
      {children}
      <ArrowRight size={15} />
    </WLink>
  )
}
export function Avatar({ name, index = 0 }: { name: string; index?: number }) {
  return (
    <span className={`ws-avatar tone-${index % 4}`}>
      {name
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0])
        .join('')}
    </span>
  )
}
