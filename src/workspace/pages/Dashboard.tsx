import { downloadText } from '../downloads'
import {
  ArrowDownToLine,
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronRight,
  CircleCheck,
  Clock3,
  Eye,
  FilePenLine,
  Plus,
  Sunrise,
  UsersRound,
} from 'lucide-react'
import { useWorkspace } from '../context'
import { dayISO, exportCsv, formatDate } from '../model'
import {
  Badge,
  Button,
  EmptyState,
  PageHeading,
  Panel,
  SectionLink,
  WLink,
} from '../ui'

export function Dashboard() {
  const {
    user,
    preview,
    breakfasts,
    data,
    catalogueLoading,
    catalogueError,
    reloadCatalogue,
  } = useWorkspace()
  const published = breakfasts.filter((b) => b.status === 'Publié')
  const upcoming = breakfasts
    .filter((b) => b.status === 'Programmé')
    .sort((a, b) => a.date.localeCompare(b.date))
  const featured = published.find((b) => b.date === dayISO()) ?? published[0]
  const draftCount = breakfasts.filter((b) => b.status === 'Brouillon').length
  return (
    <>
      <PageHeading
        eyebrow="AU SERVICE DE LA COMMUNION"
        title={`Bonjour, ${user.name.split(' ')[0]}.`}
        description="Une nouvelle journée pour nourrir la foi et faire grandir la communion."
      >
        <Button
          variant="secondary"
          icon={ArrowDownToLine}
          onClick={() =>
            downloadText(
              'publications-koinonia.csv',
              exportCsv([
                ['Titre', 'Statut', 'Date'],
                ...breakfasts.map((b) => [b.title, b.status, b.date]),
              ]),
            )
          }
        >
          Exporter
        </Button>
        <WLink to="/breakfasts/nouveau" className="ws-button primary">
          <Plus size={18} />
          Créer un Breakfast
        </WLink>
      </PageHeading>
      <div className="ws-metrics">
        {[
          {
            title: 'Breakfasts publiés',
            value: published.length,
            sub: preview
              ? 'Catalogue de démonstration'
              : 'Disponibles dans le catalogue',
            icon: Sunrise,
            trend: 'La Parole au quotidien',
          },
          {
            title: 'À paraître',
            value: upcoming.length,
            sub: 'Programmations préparées',
            icon: CalendarDays,
            trend: upcoming[0]
              ? 'Prochain : ' + formatDate(upcoming[0].date)
              : 'À votre rythme',
          },
          {
            title: 'Brouillons',
            value: draftCount,
            sub: 'Méditations en préparation',
            icon: FilePenLine,
            trend: 'Votre espace de rédaction',
          },
          {
            title: 'Communautés',
            value: data.communities.length,
            sub: preview
              ? 'Exemples de communautés'
              : 'Préparées sur cet appareil',
            icon: UsersRound,
            trend: 'Grandir ensemble',
          },
        ].map((stat) => (
          <section className="ws-metric" key={stat.title}>
            <div>
              <span>{stat.title}</span>
              <stat.icon size={19} />
            </div>
            <strong>
              {catalogueLoading && stat.title === 'Breakfasts publiés'
                ? '…'
                : stat.value.toString().padStart(2, '0')}
            </strong>
            <p>{stat.sub}</p>
            <small>{stat.trend}</small>
          </section>
        ))}
      </div>
      {catalogueError && (
        <div className="ws-inline-alert" role="alert">
          {catalogueError}
          <button onClick={reloadCatalogue}>Réessayer</button>
        </div>
      )}
      <div className="ws-dashboard-main">
        <section className="ws-daily">
          {featured ? (
            <>
              <img
                src={featured.image}
                alt="Miniature du Breakfast à la une"
                className="ws-daily-image"
              />
              <div className="ws-daily-shade" />
              <div className="ws-daily-top">
                <span className="ws-hero-label">
                  <Sunrise size={16} />
                  Breakfast à la une
                </span>
                <span className="ws-hero-date">
                  {formatDate(featured.date)}
                </span>
              </div>
              <div className="ws-daily-content">
                <div className="ws-hero-kicker">
                  <span className="status-dot" />
                  {featured.status} ·{' '}
                  {featured.reference || 'Méditation quotidienne'}
                </div>
                <h2>{featured.title}</h2>
                <p>{featured.summary}</p>
                <div className="ws-daily-actions">
                  <WLink
                    to={'/breakfasts/' + featured.id}
                    className="ws-button light"
                  >
                    <Eye size={17} />
                    Consulter le Breakfast
                    <ArrowRight size={17} />
                  </WLink>
                  <span>
                    <BookOpen size={16} />
                    {featured.format}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <EmptyState
              title={
                catalogueLoading
                  ? 'Chargement du Breakfast…'
                  : 'Votre prochain Breakfast commence ici'
              }
              description="Préparez une méditation pour accompagner la journée des membres."
            >
              <WLink to="/breakfasts/nouveau" className="ws-button primary">
                <Plus size={17} />
                Commencer la rédaction
              </WLink>
            </EmptyState>
          )}
        </section>
        <Panel
          title="À votre attention"
          description="Les prochaines actions de l’équipe."
          className="ws-attention"
        >
          <WLink to="/breakfasts" className="ws-task">
            <span className="ws-task-icon mint">
              <FilePenLine size={20} />
            </span>
            <div>
              <strong>
                {draftCount
                  ? `${draftCount} Breakfast${draftCount > 1 ? 's' : ''} en préparation`
                  : 'Préparer le prochain Breakfast'}
              </strong>
              <p>Relire, compléter et organiser.</p>
            </div>
            <ChevronRight size={16} />
          </WLink>
          <WLink to="/adhesions" className="ws-task">
            <span className="ws-task-icon sand">
              <UsersRound size={20} />
            </span>
            <div>
              <strong>
                {
                  data.memberships.filter((r) => r.status === 'En attente')
                    .length
                }{' '}
                demande(s) d’adhésion
              </strong>
              <p>Accueillir les nouveaux membres.</p>
            </div>
            <ChevronRight size={16} />
          </WLink>
          <WLink to="/moderation" className="ws-task">
            <span className="ws-task-icon blue">
              <CircleCheck size={20} />
            </span>
            <div>
              <strong>
                {data.reports.filter((r) => r.status === 'À examiner').length}{' '}
                signalement(s) à examiner
              </strong>
              <p>Veiller à la qualité des échanges.</p>
            </div>
            <ChevronRight size={16} />
          </WLink>
          <div className="ws-quiet-note">
            <span>« Demeurez en moi, et je demeurerai en vous. »</span>
            <small>Jean 15.4 · Louis Segond 1910</small>
          </div>
        </Panel>
      </div>
      <div className="ws-dashboard-bottom">
        <Panel
          title="Prochaines publications"
          description="Un regard sur les jours qui viennent."
          action={
            <SectionLink to="/programmation">Voir le calendrier</SectionLink>
          }
        >
          {upcoming.length ? (
            upcoming.slice(0, 3).map((b) => (
              <WLink
                key={b.id}
                to={'/breakfasts/' + b.id}
                className="ws-publication-row"
              >
                <span className="ws-date-square">
                  <small>
                    {new Date(b.date + 'T12:00').toLocaleDateString('fr-FR', {
                      month: 'short',
                    })}
                  </small>
                  <strong>{b.date.slice(-2)}</strong>
                </span>
                <div>
                  <strong>{b.title}</strong>
                  <p>
                    <Clock3 size={13} />
                    {b.time} · {b.format}
                  </p>
                </div>
                <Badge status={b.status} />
                <ChevronRight size={16} />
              </WLink>
            ))
          ) : (
            <EmptyState
              title="Le calendrier vous attend"
              description="Programmez votre prochaine méditation depuis son brouillon."
            />
          )}
        </Panel>
        <Panel
          title="Dernières préparations"
          action={<SectionLink to="/journal">Tout voir</SectionLink>}
        >
          {data.logs.length ? (
            <ol className="ws-timeline">
              {data.logs.slice(0, 3).map((log) => (
                <li key={log.id}>
                  <span />
                  <div>
                    <strong>{log.action}</strong>
                    <p>{log.subject}</p>
                    <small>{formatDate(log.date)} · Équipe éditoriale</small>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState
              title="Le début d’une belle histoire"
              description="Les actions effectuées dans cet espace apparaîtront ici."
            />
          )}
        </Panel>
      </div>
    </>
  )
}
