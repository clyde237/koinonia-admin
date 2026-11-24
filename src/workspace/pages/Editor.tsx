import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Check,
  Eye,
  ImagePlus,
  Save,
  Video,
} from 'lucide-react'
import { useWorkspace } from '../context'
import { covers, readingCovers } from '../data'
import { dayISO, validateBreakfast, type Breakfast } from '../model'
import {
  Badge,
  Button,
  EmptyState,
  LocalNote,
  PageHeading,
  Panel,
  WLink,
} from '../ui'

export function Editor() {
  const { id } = useParams()
  const { breakfasts, catalogueLoading } = useWorkspace()
  const original = breakfasts.find((b) => b.id === id)
  if (id && !original && catalogueLoading)
    return (
      <p role="status" className="ws-loading">
        Chargement du Breakfast…
      </p>
    )
  if (id && !original)
    return (
      <EmptyState
        title="Ce Breakfast est introuvable"
        description="Il a peut-être été retiré de cet espace."
      >
        <WLink to="/breakfasts" className="ws-button primary">
          Revenir aux Breakfasts
        </WLink>
      </EmptyState>
    )
  return <EditorForm key={id ?? 'new'} original={original} />
}
function EditorForm({ original }: { original?: Breakfast }) {
  const { setData, preview, toast, log, user } = useWorkspace()
  const [draft, setDraft] = useState<Breakfast>(() =>
    original
      ? { ...original, tags: [...original.tags] }
      : {
          id: crypto.randomUUID(),
          title: '',
          summary: '',
          text: '',
          author: user.name,
          reference: '',
          date: dayISO(),
          time: '06:00',
          status: 'Brouillon',
          format: 'Vidéo + lecture',
          image: covers[0],
          coverImage: readingCovers[0],
          tags: [],
          source: 'local',
        },
  )
  const [tab, setTab] = useState('Contenu'),
    [showPreview, setShowPreview] = useState(false),
    [error, setError] = useState(''),
    [dirty, setDirty] = useState(false),
    [fileName, setFileName] = useState('')
  const [tagsText, setTagsText] = useState(draft.tags.join(', '))
  const navigate = useNavigate()
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])
  const patch = (data: Partial<Breakfast>) => {
    setDraft((d) => ({ ...d, ...data }))
    setDirty(true)
  }
  function save(e: FormEvent, schedule = false) {
    e.preventDefault()
    const item = {
      ...draft,
      tags: tagsText
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      id: original?.source === 'catalogue' ? crypto.randomUUID() : draft.id,
      status: schedule ? ('Programmé' as const) : ('Brouillon' as const),
      source: 'local' as const,
    }
    const problem = validateBreakfast(item)
    if (problem) {
      setError(problem)
      return
    }
    setData((d) => ({
      ...d,
      breakfasts: [item, ...d.breakfasts.filter((b) => b.id !== item.id)],
    }))
    log(
      schedule ? 'Programmation préparée' : 'Brouillon enregistré',
      item.title,
    )
    setDirty(false)
    toast(
      schedule
        ? 'La programmation est préparée localement.'
        : 'Votre brouillon est enregistré sur cet appareil.',
    )
    navigate('/breakfasts' + (preview ? '?apercu=1' : ''))
  }
  return (
    <>
      <WLink to="/breakfasts" className="ws-back">
        <ArrowLeft size={16} />
        Tous les Breakfasts
      </WLink>
      <PageHeading
        title={
          original ? 'Le Breakfast, dans les détails' : 'Préparer un Breakfast'
        }
        description="Une méditation, deux façons de recevoir la Parole."
      >
        <Button
          variant="secondary"
          icon={Eye}
          onClick={() => setShowPreview((v) => !v)}
        >
          {showPreview ? 'Revenir à l’édition' : 'Prévisualiser'}
        </Button>
        <Button icon={Save} onClick={(e) => save(e)}>
          Enregistrer le brouillon
        </Button>
      </PageHeading>
      <LocalNote>
        {original?.source === 'catalogue'
          ? 'Ce Breakfast est publié. Vos modifications seront enregistrées dans une nouvelle copie locale.'
          : 'Votre travail est enregistré sur cet appareil. Il ne sera pas diffusé dans l’application.'}
      </LocalNote>
      {error && (
        <p className="ws-inline-alert" role="alert">
          {error}
        </p>
      )}
      {showPreview ? (
        <article className="ws-reading-preview">
          <img
            src={draft.coverImage ?? draft.image}
            alt="Couverture de lecture"
          />
          <div>
            <span className="ws-eyebrow">BREAKFAST · {draft.author}</span>
            <h1>{draft.title || 'Le titre de votre méditation'}</h1>
            <p className="ws-reading-intro">{draft.summary}</p>
            <blockquote>{draft.reference || 'Référence biblique'}</blockquote>
            {(draft.text || 'Votre texte prendra place ici.')
              .split('\n')
              .map((p, i) => (
                <p key={i}>{p}</p>
              ))}
          </div>
        </article>
      ) : (
        <div className="ws-editor-grid">
          <Panel className="ws-editor-main">
            <div
              className="ws-tabs"
              role="tablist"
              aria-label="Formats du Breakfast"
            >
              {['Contenu', 'Vidéo & documents'].map((label) => (
                <button
                  role="tab"
                  aria-selected={tab === label}
                  key={label}
                  onClick={() => setTab(label)}
                >
                  {label === 'Contenu' ? (
                    <BookOpen size={16} />
                  ) : (
                    <Video size={16} />
                  )}
                  {label}
                </button>
              ))}
            </div>
            {tab === 'Contenu' ? (
              <div className="ws-form">
                <label>
                  Titre de la méditation
                  <input
                    value={draft.title}
                    maxLength={160}
                    onChange={(e) => patch({ title: e.target.value })}
                    placeholder="Une Parole pour aujourd’hui…"
                    required
                  />
                </label>
                <label>
                  Introduction
                  <textarea
                    rows={3}
                    value={draft.summary}
                    onChange={(e) => patch({ summary: e.target.value })}
                    placeholder="Quelques lignes pour inviter à la méditation."
                  />
                </label>
                <div className="ws-form-row">
                  <label>
                    Auteur
                    <input
                      value={draft.author}
                      onChange={(e) => patch({ author: e.target.value })}
                    />
                  </label>
                  <label>
                    Référence biblique
                    <input
                      value={draft.reference}
                      onChange={(e) => patch({ reference: e.target.value })}
                      placeholder="Jean 15.4-5"
                    />
                  </label>
                </div>
                <label>
                  Texte de la méditation
                  <textarea
                    className="ws-writing-area"
                    rows={14}
                    value={draft.text}
                    onChange={(e) => patch({ text: e.target.value })}
                    placeholder="Prenez le temps de développer votre méditation…"
                  />
                </label>
                <p className="ws-field-hint">
                  {draft.text.trim()
                    ? draft.text.trim().split(/\s+/).length
                    : 0}{' '}
                  mots · Paragraphes séparés par un retour à la ligne
                </p>
              </div>
            ) : (
              <div className="ws-form">
                <div className="ws-upload">
                  <Video size={28} />
                  <h3>Version à regarder</h3>
                  <p>Joignez une vidéo pour préparer sa mise en ligne.</p>
                  <label className="ws-button secondary">
                    Choisir une vidéo
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) =>
                        setFileName(e.target.files?.[0]?.name ?? '')
                      }
                      hidden
                    />
                  </label>
                  {fileName && (
                    <small>{fileName} · fichier sélectionné, non envoyé</small>
                  )}
                </div>
                <label>
                  Adresse de la vidéo
                  <input
                    type="url"
                    value={draft.videoUrl ?? ''}
                    onChange={(e) => patch({ videoUrl: e.target.value })}
                    placeholder="https://…"
                  />
                </label>
                <label>
                  Document PDF
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      setFileName(e.target.files?.[0]?.name ?? '')
                      setDirty(true)
                    }}
                  />
                </label>
                <LocalNote>
                  Les fichiers sélectionnés ne sont pas transférés. La mise en
                  ligne sera disponible avec le module de publication.
                </LocalNote>
              </div>
            )}
          </Panel>
          <aside className="ws-editor-aside">
            <Panel title="Publication">
              <Badge status={original?.status ?? 'Brouillon'} />
              <div className="ws-form">
                <label>
                  Date de publication
                  <input
                    type="date"
                    value={draft.date}
                    onChange={(e) => patch({ date: e.target.value })}
                  />
                </label>
                <label>
                  Heure · Douala (UTC+1)
                  <input
                    type="time"
                    value={draft.time}
                    onChange={(e) => patch({ time: e.target.value })}
                  />
                </label>
                <label>
                  Formats
                  <select
                    value={draft.format}
                    onChange={(e) =>
                      patch({ format: e.target.value as Breakfast['format'] })
                    }
                  >
                    <option>Vidéo + lecture</option>
                    <option>Vidéo</option>
                    <option>Lecture</option>
                  </select>
                </label>
                <Button icon={CalendarDays} onClick={(e) => save(e, true)}>
                  Préparer la programmation
                </Button>
              </div>
            </Panel>
            <Panel title="Image de couverture">
              <img
                className="ws-cover-preview"
                src={draft.coverImage ?? draft.image}
                alt="Image de couverture sélectionnée"
              />
              <div className="ws-cover-options">
                {readingCovers.map((image, i) => (
                  <button
                    key={image}
                    aria-label={`Choisir la couverture ${i + 1}`}
                    aria-pressed={draft.coverImage === image}
                    onClick={() => patch({ coverImage: image })}
                  >
                    <img src={image} alt="" />
                  </button>
                ))}
              </div>
              <p className="ws-field-hint">
                <ImagePlus size={14} />
                Couvertures originales des versions écrites.
              </p>
            </Panel>
            <Panel title="Thèmes">
              <label className="ws-field-label">
                Séparer les thèmes par des virgules
                <input
                  value={tagsText}
                  onChange={(e) => {
                    setTagsText(e.target.value)
                    setDirty(true)
                  }}
                  placeholder="Foi, prière, communion"
                />
              </label>
            </Panel>
          </aside>
        </div>
      )}
      <div className="ws-editor-status">
        <Check size={15} />
        {dirty
          ? 'Modifications à enregistrer'
          : 'Votre espace de préparation est prêt'}
      </div>
    </>
  )
}
