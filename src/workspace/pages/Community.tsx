import { downloadText } from '../downloads'
import { useState, type FormEvent } from 'react'
import {
  ArrowDownToLine,
  Check,
  ChevronRight,
  HeartHandshake,
  Plus,
  ShieldCheck,
  X,
} from 'lucide-react'
import { useWorkspace } from '../context'
import {
  dayISO,
  exportCsv,
  formatDate,
  type Community,
  type Member,
} from '../model'
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  LocalNote,
  Modal,
  PageHeading,
  Panel,
  SearchField,
} from '../ui'

export function Members() {
  const { data, setData, toast, log } = useWorkspace()
  const [search, setSearch] = useState(''),
    [filter, setFilter] = useState('Tous'),
    [selected, setSelected] = useState<Member | null>(null),
    [open, setOpen] = useState(false)
  const members = data.members.filter(
    (m) =>
      `${m.name} ${m.email} ${m.country}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (filter === 'Tous' || m.status === filter),
  )
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const item: Member = {
      id: selected?.id ?? crypto.randomUUID(),
      name: String(f.get('name')).trim(),
      email: String(f.get('email')).trim(),
      country: String(f.get('country')),
      joined: selected?.joined ?? dayISO(),
      status: selected?.status ?? 'Actif',
      groups: selected?.groups ?? [],
    }
    setData((d) => ({
      ...d,
      members: [item, ...d.members.filter((m) => m.id !== item.id)],
    }))
    log('Fiche locale enregistrée', item.name)
    setOpen(false)
    toast('La fiche est enregistrée dans cet espace local.')
  }
  return (
    <>
      <PageHeading
        title="Membres"
        description="Accueillir chacun, accompagner son parcours."
      >
        <Button
          variant="secondary"
          icon={ArrowDownToLine}
          onClick={() =>
            downloadText(
              'membres-locaux.csv',
              exportCsv([
                ['Nom', 'E-mail', 'Pays', 'Statut'],
                ...members.map((m) => [m.name, m.email, m.country, m.status]),
              ]),
            )
          }
        >
          Exporter
        </Button>
        <Button
          icon={Plus}
          onClick={() => {
            setSelected(null)
            setOpen(true)
          }}
        >
          Préparer une fiche
        </Button>
      </PageHeading>
      <LocalNote>
        Fiches de préparation locales. La liste des utilisateurs de
        l’application n’est pas encore raccordée à cet écran.
      </LocalNote>
      <div className="ws-list-toolbar">
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Rechercher un membre, un pays…"
        />
        <select
          className="ws-select"
          aria-label="Statut des membres"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option>Tous</option>
          <option>Actif</option>
          <option>Suspendu</option>
        </select>
      </div>
      <div className="ws-table-wrap">
        <table className="ws-table">
          <thead>
            <tr>
              <th>Membre</th>
              <th>Pays</th>
              <th>Communautés</th>
              <th>Inscription</th>
              <th>Statut</th>
              <th>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((m, i) => (
              <tr key={m.id}>
                <td>
                  <button
                    className="ws-person-button"
                    onClick={() => {
                      setSelected(m)
                      setOpen(true)
                    }}
                  >
                    <Avatar name={m.name} index={i} />
                    <span>
                      <strong>{m.name}</strong>
                      <small>{m.email}</small>
                    </span>
                  </button>
                </td>
                <td>{m.country}</td>
                <td>{m.groups.length} communauté(s)</td>
                <td>{formatDate(m.joined)}</td>
                <td>
                  <Badge status={m.status} />
                </td>
                <td>
                  <button
                    className="ws-icon"
                    aria-label={'Consulter ' + m.name}
                    onClick={() => {
                      setSelected(m)
                      setOpen(true)
                    }}
                  >
                    <ChevronRight size={17} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!members.length && (
          <EmptyState
            title="Aucun membre à afficher"
            description="Changez votre recherche ou préparez une première fiche."
          />
        )}
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={selected ? 'Fiche du membre' : 'Préparer une fiche membre'}
      >
        <form className="ws-form" key={selected?.id ?? 'new'} onSubmit={save}>
          <label>
            Nom d’affichage
            <input
              name="name"
              defaultValue={selected?.name}
              required
              minLength={2}
            />
          </label>
          <label>
            Adresse e-mail
            <input
              type="email"
              name="email"
              defaultValue={selected?.email}
              required
            />
          </label>
          <label>
            Pays
            <input
              name="country"
              defaultValue={selected?.country ?? 'Cameroun'}
              required
            />
          </label>
          {selected && (
            <Button
              variant="secondary"
              onClick={() => {
                const status =
                  selected.status === 'Actif' ? 'Suspendu' : 'Actif'
                setData((d) => ({
                  ...d,
                  members: d.members.map((m) =>
                    m.id === selected.id ? { ...m, status } : m,
                  ),
                }))
                setOpen(false)
                log('Statut local modifié', selected.name)
                toast('Le statut de la fiche locale a été modifié.')
              }}
            >
              {selected.status === 'Actif'
                ? 'Suspendre la fiche locale'
                : 'Réactiver la fiche locale'}
            </Button>
          )}
          <LocalNote />
          <div className="ws-modal-actions">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit">Enregistrer la fiche</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
export function Communities() {
  const { data, setData, toast, log } = useWorkspace()
  const [search, setSearch] = useState(''),
    [open, setOpen] = useState(false),
    [selected, setSelected] = useState<Community | null>(null)
  const groups = data.communities.filter((g) =>
    `${g.name} ${g.category}`.toLowerCase().includes(search.toLowerCase()),
  )
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const item: Community = {
      id: selected?.id ?? crypto.randomUUID(),
      name: String(f.get('name')),
      description: String(f.get('description')),
      category: String(f.get('category')),
      access: String(f.get('access')) as Community['access'],
      members: selected?.members ?? 0,
      color: selected?.color ?? 'mint',
    }
    setData((d) => ({
      ...d,
      communities: [item, ...d.communities.filter((g) => g.id !== item.id)],
    }))
    log('Communauté préparée', item.name)
    setOpen(false)
    toast('La communauté est enregistrée localement.')
  }
  return (
    <>
      <PageHeading
        title="Communautés"
        description="Des espaces pour prier, partager et grandir ensemble."
      >
        <Button
          icon={Plus}
          onClick={() => {
            setSelected(null)
            setOpen(true)
          }}
        >
          Préparer une communauté
        </Button>
      </PageHeading>
      <div className="ws-list-toolbar">
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Rechercher une communauté…"
        />
        <span className="ws-muted">{groups.length} communauté(s)</span>
      </div>
      <div className="ws-community-grid">
        {groups.map((g, i) => (
          <article className="ws-community-card" key={g.id}>
            <div className={'ws-community-art ' + g.color}>
              <HeartHandshake size={50} strokeWidth={1.2} />
              <span>{g.category}</span>
            </div>
            <div className="ws-community-body">
              <Badge status={g.access} />
              <h2>{g.name}</h2>
              <p>{g.description}</p>
              <div className="ws-community-bottom">
                <span className="ws-stacked-avatars">
                  {data.members
                    .filter((m) => m.groups.includes(g.id))
                    .slice(0, 3)
                    .map((m, j) => (
                      <Avatar key={m.id} name={m.name} index={i + j} />
                    ))}
                  <small>
                    {g.members} membres{' '}
                    {g.members && !data.members.length ? 'en exemple' : ''}
                  </small>
                </span>
                <button
                  className="ws-icon"
                  aria-label={'Gérer ' + g.name}
                  onClick={() => {
                    setSelected(g)
                    setOpen(true)
                  }}
                >
                  <ChevronRight size={19} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!groups.length && (
        <Panel>
          <EmptyState
            title="La communauté commence par un lien"
            description="Préparez votre premier espace de prière ou de partage."
          />
        </Panel>
      )}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={selected ? 'Préparer la communauté' : 'Nouvelle communauté'}
      >
        <form className="ws-form" key={selected?.id ?? 'new'} onSubmit={save}>
          <label>
            Nom de la communauté
            <input
              name="name"
              defaultValue={selected?.name}
              required
              minLength={3}
            />
          </label>
          <label>
            Description
            <textarea
              name="description"
              rows={3}
              defaultValue={selected?.description}
              required
            />
          </label>
          <div className="ws-form-row">
            <label>
              Thématique
              <select name="category" defaultValue={selected?.category}>
                <option>Prière</option>
                <option>Étude biblique</option>
                <option>Partage</option>
                <option>Vie chrétienne</option>
              </select>
            </label>
            <label>
              Adhésion
              <select name="access" defaultValue={selected?.access}>
                <option>Ouvert</option>
                <option>Sur demande</option>
              </select>
            </label>
          </div>
          <LocalNote />
          <div className="ws-modal-actions">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit">Enregistrer la préparation</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
export function Memberships() {
  const { data, setData, log, toast } = useWorkspace()
  const [filter, setFilter] = useState('En attente')
  const rows = data.memberships.filter(
    (r) => filter === 'Toutes' || r.status === filter,
  )
  function decide(id: string, status: 'Acceptée' | 'Refusée') {
    setData((d) => ({
      ...d,
      memberships: d.memberships.map((r) =>
        r.id === id ? { ...r, status } : r,
      ),
    }))
    log('Décision préparée', status)
    toast('La décision a été préparée localement.')
  }
  return (
    <>
      <PageHeading
        title="Demandes d’adhésion"
        description="Accueillir de nouvelles personnes dans les communautés."
      />
      <div className="ws-tabs">
        {['En attente', 'Acceptée', 'Refusée', 'Toutes'].map((v) => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            aria-pressed={filter === v}
          >
            {v}
          </button>
        ))}
      </div>
      <Panel>
        {rows.length ? (
          rows.map((r, i) => (
            <div className="ws-request-row" key={r.id}>
              <Avatar name={r.member} index={i} />
              <div>
                <strong>{r.member}</strong>
                <p>
                  Souhaite rejoindre <b>{r.group}</b>
                </p>
                <small>{formatDate(r.date)}</small>
              </div>
              <Badge status={r.status} />
              {r.status === 'En attente' && (
                <div className="ws-row-actions">
                  <Button
                    variant="secondary"
                    icon={X}
                    onClick={() => decide(r.id, 'Refusée')}
                  >
                    Refuser
                  </Button>
                  <Button icon={Check} onClick={() => decide(r.id, 'Acceptée')}>
                    Accepter
                  </Button>
                </div>
              )}
            </div>
          ))
        ) : (
          <EmptyState
            title="Toutes les demandes ont leur place"
            description="Aucune demande dans cette catégorie."
          />
        )}
      </Panel>
      <LocalNote>
        Les décisions de cette interface sont préparées localement et ne
        modifient pas les adhésions dans l’application.
      </LocalNote>
    </>
  )
}
export function Moderation() {
  const { data, setData, toast, log } = useWorkspace()
  const [selected, setSelected] = useState<string | null>(null)
  const report = data.reports.find((r) => r.id === selected)
  function resolve(status: 'Résolu' | 'Ignoré') {
    setData((d) => ({
      ...d,
      reports: d.reports.map((r) => (r.id === selected ? { ...r, status } : r)),
    }))
    log('Signalement examiné localement', report?.subject ?? 'Signalement')
    setSelected(null)
    toast('Le suivi local du signalement a été mis à jour.')
  }
  return (
    <>
      <PageHeading
        title="Modération"
        description="Préserver un espace de partage bienveillant."
      />
      <div className="ws-summary-strip">
        <ShieldCheck size={22} />
        <div>
          <strong>
            {data.reports.filter((r) => r.status === 'À examiner').length}{' '}
            signalement(s) à examiner
          </strong>
          <p>Chaque situation mérite une attention personnelle.</p>
        </div>
      </div>
      <Panel>
        {data.reports.length ? (
          data.reports.map((r) => (
            <button
              className="ws-report-row"
              key={r.id}
              onClick={() => setSelected(r.id)}
            >
              <span className="ws-task-icon sand">
                <ShieldCheck size={20} />
              </span>
              <div>
                <strong>{r.subject}</strong>
                <p>
                  {r.reason} · {formatDate(r.date)}
                </p>
              </div>
              <Badge status={r.status} />
              <ChevronRight size={17} />
            </button>
          ))
        ) : (
          <EmptyState
            title="Aucun signalement à examiner"
            description="Les signalements raccordés à cet espace apparaîtront ici."
          />
        )}
      </Panel>
      <Modal
        open={!!report}
        onClose={() => setSelected(null)}
        title="Examiner le signalement"
      >
        <div className="ws-form">
          <Badge status={report?.status} />
          <h3>{report?.subject}</h3>
          <p>Motif : {report?.reason}</p>
          <p className="ws-message-example">
            Signalement de démonstration. Le contenu des conversations de
            l’application n’est pas chargé dans cet espace.
          </p>
          <LocalNote />
          <div className="ws-modal-actions">
            <Button variant="secondary" onClick={() => resolve('Ignoré')}>
              Classer sans suite
            </Button>
            <Button onClick={() => resolve('Résolu')}>
              Marquer comme examiné
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
export function Conversations() {
  const { data, setData, user, toast } = useWorkspace()
  const [selected, setSelected] = useState(data.communities[0]?.id ?? ''),
    [text, setText] = useState('')
  const group = data.communities.find((g) => g.id === selected)
  const messages = data.messages.filter((m) => m.group === selected)
  return (
    <>
      <PageHeading
        title="Conversations"
        description="Suivre la vie des communautés et préparer les échanges."
      />
      <div className="ws-chat-layout">
        <aside className="ws-chat-groups">
          <h2>Communautés</h2>
          {data.communities.map((g, i) => (
            <button
              key={g.id}
              className={selected === g.id ? 'active' : ''}
              onClick={() => setSelected(g.id)}
            >
              <Avatar name={g.name} index={i} />
              <span>
                <strong>{g.name}</strong>
                <small>{g.category}</small>
              </span>
            </button>
          ))}
        </aside>
        <Panel className="ws-chat-main">
          {group ? (
            <>
              <div className="ws-chat-heading">
                <HeartHandshake size={22} />
                <div>
                  <h2>{group.name}</h2>
                  <p>Espace de préparation des échanges</p>
                </div>
              </div>
              <div className="ws-chat-messages">
                <span className="ws-chat-date">
                  Conversation de démonstration / notes locales
                </span>
                {messages.length ? (
                  messages.map((m, i) => (
                    <div
                      className={
                        'ws-chat-message ' +
                        (m.author === user.name ? 'own' : '')
                      }
                      key={m.id}
                    >
                      <Avatar name={m.author} index={i} />
                      <div>
                        <small>
                          {m.author} · {m.time}
                        </small>
                        <p>{m.body}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    title="Un premier mot"
                    description="Préparez une réponse ou une intention pour cette communauté."
                  />
                )}
              </div>
              <form
                className="ws-chat-composer"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!text.trim()) return
                  setData((d) => ({
                    ...d,
                    messages: [
                      ...d.messages,
                      {
                        id: crypto.randomUUID(),
                        group: selected,
                        author: user.name,
                        body: text.trim(),
                        time: new Date().toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        }),
                      },
                    ],
                  }))
                  setText('')
                  toast('Réponse ajoutée aux notes locales, sans envoi.')
                }}
              >
                <label className="sr-only" htmlFor="chat-message">
                  Préparer une réponse
                </label>
                <textarea
                  id="chat-message"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Écrire une réponse à préparer…"
                  rows={2}
                  required
                />
                <Button type="submit" disabled={!text.trim()}>
                  Préparer la réponse
                </Button>
              </form>
            </>
          ) : (
            <EmptyState
              title="Choisissez une communauté"
              description="Préparez d’abord une communauté pour organiser ses échanges."
            />
          )}
        </Panel>
      </div>
    </>
  )
}
