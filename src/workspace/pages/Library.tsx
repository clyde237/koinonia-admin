import { useEffect, useRef, useState } from 'react'
import { BookOpen, FileText, Image, Plus, Video } from 'lucide-react'
import { useWorkspace } from '../context'
import { dayISO, formatDate, type Media } from '../model'
import {
  Badge,
  Button,
  EmptyState,
  LocalNote,
  Modal,
  PageHeading,
  Panel,
  SearchField,
} from '../ui'

export function MediaLibrary() {
  const { data, setData, toast, log } = useWorkspace()
  const [search, setSearch] = useState(''),
    [filter, setFilter] = useState('Tous les fichiers'),
    [selected, setSelected] = useState<Media | null>(null)
  const input = useRef<HTMLInputElement>(null)
  const rows = data.media.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) &&
      (filter === 'Tous les fichiers' || m.type === filter),
  )
  function selectFiles(files: FileList | null) {
    if (!files) return
    const items = [...files]
      .filter((f) => /^(image\/|video\/|application\/pdf)/.test(f.type))
      .map((f): Media => ({
        id: crypto.randomUUID(),
        name: f.name,
        type: f.type.startsWith('image')
          ? 'Image'
          : f.type.startsWith('video')
            ? 'Vidéo'
            : 'PDF',
        size: (f.size / 1024 / 1024).toFixed(1) + ' Mo',
        date: dayISO(),
      }))
    setData((d) => ({ ...d, media: [...items, ...d.media] }))
    if (items.length) {
      toast(
        `${items.length} fichier(s) référencé(s) localement, sans transfert.`,
      )
      log('Fichiers référencés', `${items.length} pièce(s)`)
    } else toast('Choisissez des images, vidéos ou fichiers PDF.')
    if (input.current) input.current.value = ''
  }
  return (
    <>
      <PageHeading
        title="Médiathèque"
        description="Les ressources qui donnent vie à vos contenus."
      >
        <input
          ref={input}
          type="file"
          accept="image/*,video/*,application/pdf"
          multiple
          hidden
          onChange={(e) => selectFiles(e.target.files)}
        />
        <Button icon={Plus} onClick={() => input.current?.click()}>
          Sélectionner des fichiers
        </Button>
      </PageHeading>
      <div className="ws-list-toolbar">
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Rechercher un fichier…"
        />
        <select
          className="ws-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label="Type de fichier"
        >
          <option>Tous les fichiers</option>
          <option>Image</option>
          <option>Vidéo</option>
          <option>PDF</option>
        </select>
      </div>
      <div className="ws-media-grid">
        {rows.map((m) => (
          <button
            className="ws-media-card"
            key={m.id}
            onClick={() => setSelected(m)}
          >
            <div>
              {m.url ? (
                <img src={m.url} alt="" />
              ) : m.type === 'Image' ? (
                <Image size={38} />
              ) : m.type === 'Vidéo' ? (
                <Video size={38} />
              ) : (
                <FileText size={38} />
              )}
              <span>{m.type}</span>
            </div>
            <strong>{m.name}</strong>
            <small>
              {m.size} · {formatDate(m.date)}
            </small>
          </button>
        ))}
      </div>
      {!rows.length && (
        <Panel>
          <EmptyState
            title="Des ressources à rassembler"
            description="Sélectionnez vos images, vidéos et PDF pour préparer leur organisation."
          />
        </Panel>
      )}
      <LocalNote>
        La sélection référence les fichiers sur cet appareil. Leur transfert et
        leur stockage centralisé restent à raccorder.
      </LocalNote>
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Détails du fichier"
      >
        {selected && (
          <div className="ws-form">
            {selected.url && (
              <img
                className="ws-media-detail"
                src={selected.url}
                alt={selected.name}
              />
            )}
            <h3>{selected.name}</h3>
            <Badge status={selected.type} />
            <dl className="ws-detail-list">
              <div>
                <dt>Type</dt>
                <dd>{selected.type}</dd>
              </div>
              <div>
                <dt>Taille / usage</dt>
                <dd>{selected.size}</dd>
              </div>
              <div>
                <dt>Date</dt>
                <dd>{formatDate(selected.date, true)}</dd>
              </div>
            </dl>
            <LocalNote />
            <div className="ws-modal-actions">
              <Button
                variant="secondary"
                onClick={() => {
                  setData((d) => ({
                    ...d,
                    media: d.media.filter((m) => m.id !== selected.id),
                  }))
                  setSelected(null)
                  toast(
                    'La référence locale a été retirée. Le fichier original est conservé.',
                  )
                }}
              >
                Retirer la référence locale
              </Button>
              <Button onClick={() => setSelected(null)}>Fermer</Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
type BibleBook = { id: string; name: string; chapters_count: number }
type Chapter = {
  book: { name: string }
  chapter: number
  verses: { number: number; text: string }[]
}
export function Bible() {
  const { preview, toast } = useWorkspace()
  const [book, setBook] = useState('jean'),
    [chapter, setChapter] = useState(15),
    [books, setBooks] = useState<BibleBook[]>([]),
    [revision, setRevision] = useState(0)
  const requestKey = `${book}/${chapter}/${revision}`
  const [response, setResponse] = useState<{
    key: string
    value?: Chapter
    error?: string
  }>()
  const result = preview
    ? {
        book: { name: 'Jean' },
        chapter: 15,
        verses: [
          {
            number: 4,
            text: 'Demeurez en moi, et je demeurerai en vous. Comme le sarment ne peut de lui-même porter du fruit, s’il ne demeure attaché au cep, ainsi vous ne le pouvez non plus, si vous ne demeurez en moi.',
          },
          {
            number: 5,
            text: 'Je suis le cep, vous êtes les sarments. Celui qui demeure en moi et en qui je demeure porte beaucoup de fruit, car sans moi vous ne pouvez rien faire.',
          },
        ],
      }
    : response?.key === requestKey
      ? response.value
      : undefined
  const error = response?.key === requestKey ? response.error : ''
  useEffect(() => {
    if (preview) return
    const controller = new AbortController()
    fetch('/api/bible/books', { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error('La Bible est indisponible.')
        return r.json()
      })
      .then((value) => {
        if (Array.isArray(value)) setBooks(value)
      })
      .catch(() => {})
    return () => controller.abort()
  }, [preview])
  useEffect(() => {
    if (preview) return
    const controller = new AbortController()
    fetch(`/api/bible/chapters/${book}/${chapter}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok)
          throw new Error(
            'Ce chapitre est indisponible. Vérifiez que le service Bible est démarré.',
          )
        const value: Chapter = await response.json()
        if (
          !value?.book ||
          typeof value.book.name !== 'string' ||
          !Array.isArray(value.verses) ||
          !value.verses.every(
            (v) => typeof v.text === 'string' && typeof v.number === 'number',
          )
        )
          throw new Error('Le chapitre reçu est invalide.')
        setResponse({ key: requestKey, value })
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setResponse({ key: requestKey, error: error.message })
      })
    return () => controller.abort()
  }, [book, chapter, preview, requestKey])

  return (
    <>
      <PageHeading
        title="Bible & verset du jour"
        description="La Parole au cœur de la vie de Koinonia."
      >
        <Badge status="LSG 1910" />
      </PageHeading>
      <div className="ws-editor-grid">
        <Panel title="Consulter la Bible">
          <div className="ws-form-row">
            <label className="ws-field-label">
              Livre
              <select
                disabled={preview}
                value={book}
                onChange={(e) => {
                  setBook(e.target.value)
                  setChapter(1)
                }}
              >
                {books.length ? (
                  books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))
                ) : (
                  <option value="jean">Jean</option>
                )}
              </select>
            </label>
            <label className="ws-field-label">
              Chapitre
              <input
                type="number"
                disabled={preview}
                min={1}
                max={books.find((b) => b.id === book)?.chapters_count ?? 21}
                value={chapter}
                onChange={(e) =>
                  setChapter(Math.max(1, Number(e.target.value)))
                }
              />
            </label>
          </div>
          {error ? (
            <div className="ws-inline-alert" role="alert">
              {error}
              <button onClick={() => setRevision((r) => r + 1)}>
                Réessayer
              </button>
            </div>
          ) : result ? (
            <div className="ws-bible-text">
              <h2>
                {result.book.name} {result.chapter}
              </h2>
              {result.verses.map((v) => (
                <button
                  key={v.number}
                  onClick={() =>
                    toast(
                      `Référence sélectionnée : ${result.book.name} ${result.chapter}.${v.number}. La modification du verset quotidien sera raccordée au service.`,
                    )
                  }
                >
                  <sup>{v.number}</sup>
                  {v.text}
                </button>
              ))}
            </div>
          ) : (
            <p role="status" className="ws-loading">
              Chargement du chapitre…
            </p>
          )}
        </Panel>
        <aside>
          <Panel title="Verset à méditer">
            <span className="ws-task-icon mint">
              <BookOpen size={22} />
            </span>
            <blockquote className="ws-verse">
              « Je suis le cep, vous êtes les sarments. »
            </blockquote>
            <p className="ws-muted">Jean 15.5 · Louis Segond 1910</p>
            <LocalNote>
              La sélection éditoriale du verset du jour sera raccordée au
              service de publication.
            </LocalNote>
          </Panel>
          <Panel title="Édition du texte biblique">
            <p className="ws-muted">
              Le texte Louis Segond 1910 est consultable ici. Il est conservé
              comme source de référence pour l’application.
            </p>
          </Panel>
        </aside>
      </div>
    </>
  )
}
