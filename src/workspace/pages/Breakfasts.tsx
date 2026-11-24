import { downloadText } from '../downloads'
import { useState } from 'react'
import {
  Archive,
  ArrowDownToLine,
  BookOpen,
  ChevronRight,
  Copy,
  LayoutGrid,
  List,
  Plus,
  Video,
} from 'lucide-react'
import { useWorkspace } from '../context'
import { exportCsv, formatDate, type PublicationStatus } from '../model'
import {
  Badge,
  Button,
  EmptyState,
  PageHeading,
  SearchField,
  WLink,
  Modal,
} from '../ui'

export function Breakfasts() {
  const { breakfasts, setData, toast, log, catalogueLoading } = useWorkspace()
  const [search, setSearch] = useState(''),
    [status, setStatus] = useState('Tous les Breakfasts'),
    [grid, setGrid] = useState(false),
    [archiveId, setArchiveId] = useState('')
  const [page, setPage] = useState(1)
  const filtered = breakfasts.filter(
    (b) =>
      (!search ||
        `${b.title} ${b.author} ${b.tags.join(' ')}`
          .toLowerCase()
          .includes(search.toLowerCase())) &&
      (status === 'Tous les Breakfasts' || b.status === status),
  )
  const items = filtered.slice((page - 1) * 8, page * 8)
  function duplicate(id: string) {
    const item = breakfasts.find((b) => b.id === id)
    if (!item) return
    setData((d) => ({
      ...d,
      breakfasts: [
        {
          ...item,
          id: crypto.randomUUID(),
          title: item.title + ' · copie',
          status: 'Brouillon',
          source: 'local',
        },
        ...d.breakfasts,
      ],
    }))
    log('Brouillon créé', item.title)
    toast('Une copie a été ajoutée aux brouillons locaux.')
  }
  function archive() {
    const item = breakfasts.find((b) => b.id === archiveId)
    setData((d) => ({
      ...d,
      breakfasts: d.breakfasts.map((b) =>
        b.id === archiveId
          ? { ...b, status: 'Archivé' as PublicationStatus }
          : b,
      ),
    }))
    log('Brouillon archivé', item?.title ?? 'Breakfast')
    setArchiveId('')
    toast('Le brouillon a été archivé sur cet appareil.')
  }
  return (
    <>
      <PageHeading
        title="Breakfasts"
        description="Chaque jour, une Parole à préparer et à partager."
      >
        <Button
          variant="secondary"
          icon={ArrowDownToLine}
          onClick={() =>
            downloadText(
              'breakfasts.csv',
              exportCsv([
                ['Titre', 'Statut', 'Date', 'Format'],
                ...filtered.map((b) => [b.title, b.status, b.date, b.format]),
              ]),
            )
          }
        >
          Exporter
        </Button>
        <WLink to="/breakfasts/nouveau" className="ws-button primary">
          <Plus size={17} />
          Nouveau Breakfast
        </WLink>
      </PageHeading>
      <div
        className="ws-tabs"
        role="tablist"
        aria-label="Statut des Breakfasts"
      >
        {[
          'Tous les Breakfasts',
          'Publié',
          'Programmé',
          'Brouillon',
          'Archivé',
        ].map((label) => (
          <button
            key={label}
            role="tab"
            aria-selected={status === label}
            onClick={() => {
              setStatus(label)
              setPage(1)
            }}
          >
            {label}
            <span>
              {label === 'Tous les Breakfasts'
                ? breakfasts.length
                : breakfasts.filter((b) => b.status === label).length}
            </span>
          </button>
        ))}
      </div>
      <div className="ws-list-toolbar">
        <SearchField
          value={search}
          onChange={(v) => {
            setSearch(v)
            setPage(1)
          }}
          placeholder="Rechercher un titre, un thème, un auteur…"
        />
        <div className="ws-view-toggle" aria-label="Affichage">
          <button
            aria-label="Afficher en liste"
            aria-pressed={!grid}
            onClick={() => setGrid(false)}
          >
            <List size={19} />
          </button>
          <button
            aria-label="Afficher en grille"
            aria-pressed={grid}
            onClick={() => setGrid(true)}
          >
            <LayoutGrid size={18} />
          </button>
        </div>
      </div>
      {!items.length ? (
        <div className="ws-panel">
          <EmptyState
            title={
              catalogueLoading
                ? 'Chargement du catalogue…'
                : search
                  ? 'Aucun Breakfast ne correspond'
                  : 'Une page à écrire'
            }
            description={
              search
                ? 'Essayez un autre mot ou un autre statut.'
                : 'Créez votre premier brouillon et préparez sa version à lire et à regarder.'
            }
          >
            <WLink to="/breakfasts/nouveau" className="ws-button primary">
              <Plus size={16} />
              Créer un Breakfast
            </WLink>
          </EmptyState>
        </div>
      ) : grid ? (
        <div className="ws-breakfast-grid">
          {items.map((b) => (
            <article className="ws-breakfast-card" key={b.id}>
              <WLink to={'/breakfasts/' + b.id}>
                <img src={b.image} alt="" />
                <div>
                  <Badge status={b.status} />
                  <h2>{b.title}</h2>
                  <p>
                    {formatDate(b.date)} · {b.author}
                  </p>
                </div>
              </WLink>
              <div className="ws-card-footer">
                <span>{b.format}</span>
                <WLink to={'/breakfasts/' + b.id} className="ws-inline-link">
                  Ouvrir
                  <ChevronRight size={15} />
                </WLink>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="ws-table-wrap">
          <table className="ws-table">
            <thead>
              <tr>
                <th>Breakfast</th>
                <th>Publication</th>
                <th>Formats</th>
                <th>Statut</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => (
                <tr key={b.id}>
                  <td>
                    <WLink className="ws-item-title" to={'/breakfasts/' + b.id}>
                      <img src={b.image} alt="" />
                      <span>
                        <strong>{b.title}</strong>
                        <small>
                          {b.author} · {b.reference || 'Référence à compléter'}
                        </small>
                      </span>
                    </WLink>
                  </td>
                  <td>
                    <span>{formatDate(b.date, true)}</span>
                    <small>{b.time} · Douala</small>
                  </td>
                  <td>
                    <span className="ws-formats">
                      {b.format.includes('Vidéo') && (
                        <span title="Vidéo">
                          <Video size={16} />
                        </span>
                      )}
                      {b.format !== 'Vidéo' && (
                        <span title="Lecture">
                          <BookOpen size={16} />
                        </span>
                      )}
                    </span>
                  </td>
                  <td>
                    <Badge status={b.status} />
                  </td>
                  <td>
                    <div className="ws-row-actions">
                      <button
                        className="ws-icon"
                        aria-label={'Dupliquer ' + b.title}
                        onClick={() => duplicate(b.id)}
                      >
                        <Copy size={16} />
                      </button>
                      {b.source !== 'catalogue' && b.status !== 'Archivé' && (
                        <button
                          className="ws-icon"
                          aria-label={'Archiver ' + b.title}
                          onClick={() => setArchiveId(b.id)}
                        >
                          <Archive size={16} />
                        </button>
                      )}
                      <WLink to={'/breakfasts/' + b.id} className="ws-icon">
                        <ChevronRight size={17} />
                        <span className="sr-only">Ouvrir {b.title}</span>
                      </WLink>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="ws-pagination">
        <span>
          {filtered.length} Breakfast{filtered.length > 1 ? 's' : ''} ·{' '}
          {Math.min((page - 1) * 8 + 1, filtered.length)}–
          {Math.min(page * 8, filtered.length)} affiché(s)
        </span>
        <div>
          <Button
            variant="secondary"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Précédent
          </Button>
          <span>{page}</span>
          <Button
            variant="secondary"
            disabled={page * 8 >= filtered.length}
            onClick={() => setPage((p) => p + 1)}
          >
            Suivant
          </Button>
        </div>
      </div>
      <Modal
        open={!!archiveId}
        onClose={() => setArchiveId('')}
        title="Archiver ce brouillon ?"
        description="Le contenu restera accessible dans l’onglet Archivé."
      >
        <div className="ws-modal-actions">
          <Button variant="secondary" onClick={() => setArchiveId('')}>
            Annuler
          </Button>
          <Button onClick={archive} icon={Archive}>
            Archiver le brouillon
          </Button>
        </div>
      </Modal>
    </>
  )
}
