import { useState, type FormEvent } from 'react'
import {
  Bell,
  CalendarDays,
  Clock3,
  MapPin,
  Plus,
  Send,
  Smartphone,
} from 'lucide-react'
import { useWorkspace } from '../context'
import { dayISO, formatDate } from '../model'
import {
  Badge,
  Button,
  EmptyState,
  LocalNote,
  Modal,
  PageHeading,
  Panel,
} from '../ui'
export function Events() {
  const { data, setData, toast, log } = useWorkspace()
  const [open, setOpen] = useState(false)
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const item = {
      id: crypto.randomUUID(),
      title: String(f.get('title')),
      description: String(f.get('description')),
      date: String(f.get('date')),
      time: String(f.get('time')),
      location: String(f.get('location')),
      status: 'Brouillon' as const,
    }
    setData((d) => ({ ...d, events: [item, ...d.events] }))
    log('Événement préparé', item.title)
    setOpen(false)
    toast('Le brouillon d’événement est enregistré localement.')
  }
  return (
    <>
      <PageHeading
        title="Événements"
        description="Créer des rendez-vous pour vivre la communion."
      >
        <Button icon={Plus} onClick={() => setOpen(true)}>
          Préparer un événement
        </Button>
      </PageHeading>
      <div className="ws-events-grid">
        {data.events.map((event) => (
          <article className="ws-event-card" key={event.id}>
            <div className="ws-event-date">
              <CalendarDays size={25} />
              <strong>{event.date.slice(-2)}</strong>
              <span>
                {new Date(event.date + 'T12:00').toLocaleDateString('fr-FR', {
                  month: 'long',
                })}
              </span>
            </div>
            <div>
              <Badge status={event.status} />
              <h2>{event.title}</h2>
              <p>{event.description}</p>
              <div className="ws-event-meta">
                <span>
                  <Clock3 size={15} />
                  {event.time} · Douala
                </span>
                <span>
                  <MapPin size={15} />
                  {event.location}
                </span>
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  setData((d) => ({
                    ...d,
                    events: d.events.map((e) =>
                      e.id === event.id
                        ? {
                            ...e,
                            status:
                              e.status === 'Brouillon'
                                ? 'Programmé'
                                : 'Brouillon',
                          }
                        : e,
                    ),
                  }))
                  toast('Le statut de préparation local a été modifié.')
                }}
              >
                {event.status === 'Brouillon'
                  ? 'Préparer la programmation'
                  : 'Remettre en brouillon'}
              </Button>
            </div>
          </article>
        ))}
      </div>
      {!data.events.length && (
        <Panel>
          <EmptyState
            title="Le prochain rendez-vous reste à écrire"
            description="Préparez une rencontre, une matinée de prière ou un temps de partage."
          />
        </Panel>
      )}
      <LocalNote />
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Préparer un événement"
      >
        <form className="ws-form" onSubmit={save}>
          <label>
            Titre
            <input
              name="title"
              required
              minLength={3}
              placeholder="Matinée de prière et de communion"
            />
          </label>
          <label>
            Description
            <textarea rows={3} name="description" required />
          </label>
          <div className="ws-form-row">
            <label>
              Date
              <input
                name="date"
                type="date"
                min={dayISO()}
                defaultValue={dayISO()}
                required
              />
            </label>
            <label>
              Heure
              <input name="time" type="time" defaultValue="09:00" required />
            </label>
          </div>
          <label>
            Lieu ou lien de rencontre
            <input
              name="location"
              placeholder="En ligne ou adresse du lieu"
              required
            />
          </label>
          <LocalNote />
          <div className="ws-modal-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit">Enregistrer le brouillon</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
export function Notifications() {
  const { data, setData, toast, log } = useWorkspace()
  const [title, setTitle] = useState(''),
    [body, setBody] = useState(''),
    [target, setTarget] = useState('Tous les membres')
  function save(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return
    setData((d) => ({
      ...d,
      notifications: [
        {
          id: crypto.randomUUID(),
          title: title.trim(),
          body: body.trim(),
          target,
          date: dayISO(),
          status: 'Brouillon',
        },
        ...d.notifications,
      ],
    }))
    log('Notification préparée', title)
    setTitle('')
    setBody('')
    toast(
      'Le message est enregistré en brouillon. Aucune notification envoyée.',
    )
  }
  return (
    <>
      <PageHeading
        title="Notifications"
        description="Une attention juste, au bon moment."
      />
      <div className="ws-notification-grid">
        <Panel
          title="Préparer un message"
          description="Un titre clair, quelques mots essentiels."
        >
          <form className="ws-form" onSubmit={save}>
            <label>
              Destinataires
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              >
                <option>Tous les membres</option>
                {data.communities.map((g) => (
                  <option key={g.id}>{g.name}</option>
                ))}
              </select>
            </label>
            <label>
              Titre de la notification
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={80}
                placeholder="Votre Breakfast vous attend"
                required
              />
            </label>
            <label>
              Message
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                maxLength={240}
                placeholder="Prenez un moment pour nourrir votre foi aujourd’hui."
                required
              />
            </label>
            <small className="ws-field-hint">
              {body.length}/240 caractères
            </small>
            <LocalNote>
              Ce message sera conservé en brouillon sur cet appareil. Aucun
              envoi n’est déclenché.
            </LocalNote>
            <Button icon={Send} type="submit">
              Enregistrer le message
            </Button>
          </form>
        </Panel>
        <section className="ws-phone-preview">
          <div className="ws-phone-time">
            09:41
            <Smartphone size={16} />
          </div>
          <div className="ws-push">
            <div>
              <span className="ws-push-logo">K</span>
              <strong>KOINONIA</strong>
              <small>maintenant</small>
            </div>
            <h3>{title || 'Votre Breakfast vous attend'}</h3>
            <p>
              {body || 'Prenez un moment pour nourrir votre foi aujourd’hui.'}
            </p>
          </div>
          <span className="ws-preview-caption">Aperçu de la notification</span>
        </section>
      </div>
      <Panel
        title="Messages préparés"
        description="Vos brouillons de communication."
      >
        {data.notifications.length ? (
          data.notifications.map((n) => (
            <div className="ws-request-row" key={n.id}>
              <span className="ws-task-icon mint">
                <Bell size={20} />
              </span>
              <div>
                <strong>{n.title}</strong>
                <p>{n.body}</p>
                <small>
                  {n.target} · {formatDate(n.date)}
                </small>
              </div>
              <Badge status={n.status} />
            </div>
          ))
        ) : (
          <EmptyState
            title="Aucun message préparé"
            description="Votre premier brouillon apparaîtra ici."
          />
        )}
      </Panel>
    </>
  )
}
export function Facebook() {
  const { breakfasts, toast } = useWorkspace()
  const [selected, setSelected] = useState(''),
    [message, setMessage] = useState('')
  const b = breakfasts.find((item) => item.id === selected)
  return (
    <>
      <PageHeading
        title="Diffusion Facebook"
        description="Préparer le prolongement des méditations sur votre page."
      />
      <div className="ws-summary-strip">
        <span className="ws-facebook-mark">f</span>
        <div>
          <strong>Préparation des publications</strong>
          <p>Aucune page Facebook n’est connectée à cet espace.</p>
        </div>
        <Badge status="Non connecté" />
      </div>
      <div className="ws-editor-grid">
        <Panel title="Préparer une publication">
          <form
            className="ws-form"
            onSubmit={(e) => {
              e.preventDefault()
              navigator.clipboard
                .writeText(message)
                .then(() => toast('Le texte de la publication a été copié.'))
                .catch(() =>
                  toast(
                    'La copie est indisponible. Sélectionnez votre texte pour le copier.',
                  ),
                )
            }}
          >
            <label>
              Breakfast à partager
              <select
                value={selected}
                onChange={(e) => {
                  const item = breakfasts.find((b) => b.id === e.target.value)
                  setSelected(e.target.value)
                  setMessage(
                    item
                      ? `${item.title}\n\n${item.summary}\n\nRetrouvez votre Breakfast dans Koinonia.`
                      : '',
                  )
                }}
                required
              >
                <option value="">Choisir un Breakfast</option>
                {breakfasts.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Texte de la publication
              <textarea
                rows={7}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </label>
            <LocalNote>
              Vous pouvez préparer et copier ce contenu. La connexion à une page
              Facebook sera ajoutée lors du raccordement de la diffusion.
            </LocalNote>
            <Button type="submit">Copier le texte préparé</Button>
          </form>
        </Panel>
        <Panel title="Aperçu du contenu">
          {b ? (
            <div className="ws-social-preview">
              <div>
                <span className="ws-push-logo">K</span>
                <strong>Koinonia</strong>
              </div>
              <p>{message}</p>
              <img src={b.image} alt={b.title} />
            </div>
          ) : (
            <EmptyState
              title="Choisissez une méditation"
              description="Son aperçu apparaîtra ici."
            />
          )}
        </Panel>
      </div>
    </>
  )
}
