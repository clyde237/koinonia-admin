import { useState } from 'react'
import {
  Bell,
  BookOpen,
  CalendarDays,
  CircleHelp,
  ExternalLink,
  FileText,
  HeartHandshake,
  LockKeyhole,
  Save,
  ShieldCheck,
  UserRound,
  Video,
} from 'lucide-react'
import { useWorkspace } from '../context'
import { AccountManagement } from '../../components/AccountManagement'
import { formatDate } from '../model'
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  LocalNote,
  PageHeading,
  Panel,
  SearchField,
  SectionLink,
} from '../ui'

export function Team() {
  const { preview } = useWorkspace()
  return (
    <>
      <PageHeading
        title="Équipe & accès"
        description="Donner à chacun les bons outils, au bon endroit."
      >
        <Badge status={preview ? 'Aperçu' : 'Connecté'} />
      </PageHeading>
      <div className="ws-role-summary">
        <div>
          <ShieldCheck size={22} />
          <span>
            <strong>Administration</strong>
            <small>Comptes, permissions et publications</small>
          </span>
        </div>
        <div>
          <FileText size={22} />
          <span>
            <strong>Édition Breakfast</strong>
            <small>Rédaction et préparation du calendrier</small>
          </span>
        </div>
      </div>
      <AccountManagement preview={preview} />
    </>
  )
}
export function Settings() {
  const { data, setData, toast, log } = useWorkspace()
  const [tab, setTab] = useState('Général')
  return (
    <>
      <PageHeading
        title="Paramètres"
        description="Les repères communs de votre espace de gestion."
      />
      <div className="ws-settings-layout">
        <aside className="ws-settings-nav">
          {['Général', 'Publications', 'Notifications', 'Services'].map(
            (label) => (
              <button
                key={label}
                className={tab === label ? 'active' : ''}
                onClick={() => setTab(label)}
              >
                {label}
              </button>
            ),
          )}
        </aside>
        <Panel
          title={tab}
          description="Préférences enregistrées sur cet appareil."
        >
          <form
            className="ws-form"
            onSubmit={(e) => {
              e.preventDefault()
              log('Préférences locales enregistrées', tab)
              toast(
                'Les préférences de cet espace ont été enregistrées localement.',
              )
            }}
          >
            {tab === 'Général' && (
              <>
                <label>
                  Nom de la plateforme
                  <input
                    value={data.settings.name}
                    onChange={(e) =>
                      setData((d) => ({
                        ...d,
                        settings: { ...d.settings, name: e.target.value },
                      }))
                    }
                    required
                  />
                </label>
                <label>
                  Signature
                  <textarea
                    value={data.settings.description}
                    onChange={(e) =>
                      setData((d) => ({
                        ...d,
                        settings: {
                          ...d.settings,
                          description: e.target.value,
                        },
                      }))
                    }
                    rows={3}
                  />
                </label>
                <label>
                  Fuseau horaire
                  <select
                    value={data.settings.timezone}
                    onChange={(e) =>
                      setData((d) => ({
                        ...d,
                        settings: { ...d.settings, timezone: e.target.value },
                      }))
                    }
                  >
                    <option value="Africa/Douala">
                      Afrique / Douala · UTC+1
                    </option>
                  </select>
                </label>
              </>
            )}
            {tab === 'Publications' && (
              <>
                <label>
                  Heure habituelle des Breakfasts
                  <input
                    type="time"
                    value={data.settings.time}
                    onChange={(e) =>
                      setData((d) => ({
                        ...d,
                        settings: { ...d.settings, time: e.target.value },
                      }))
                    }
                  />
                </label>
                <p className="ws-muted">
                  Ce repère facilite la préparation des prochaines méditations.
                  Chaque brouillon conserve sa date et son heure.
                </p>
              </>
            )}
            {tab === 'Notifications' && (
              <>
                <div className="ws-switch-row">
                  <div>
                    <strong>Retours de préparation</strong>
                    <p>
                      Afficher les confirmations des actions dans cet espace.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    role="switch"
                    aria-label="Retours de préparation"
                    checked={data.settings.notifications}
                    onChange={(e) =>
                      setData((d) => ({
                        ...d,
                        settings: {
                          ...d.settings,
                          notifications: e.target.checked,
                        },
                      }))
                    }
                  />
                </div>
                <p className="ws-muted">
                  Les notifications envoyées aux membres se préparent dans leur
                  rubrique dédiée.
                </p>
              </>
            )}
            {tab === 'Services' && (
              <>
                <div className="ws-service-row">
                  <span>
                    <BookOpen size={20} />
                    Catalogue Breakfast & Bible
                  </span>
                  <Badge status="Consultation" />
                </div>
                <div className="ws-service-row">
                  <span>
                    <ShieldCheck size={20} />
                    Comptes administratifs
                  </span>
                  <Badge status="Session indépendante" />
                </div>
                <div className="ws-service-row">
                  <span>
                    <ExternalLink size={20} />
                    Facebook
                  </span>
                  <Badge status="À connecter" />
                </div>
                <div className="ws-service-row">
                  <span>
                    <Bell size={20} />
                    Envoi des notifications
                  </span>
                  <Badge status="À raccorder" />
                </div>
              </>
            )}
            <LocalNote />
            <Button type="submit" icon={Save}>
              Enregistrer les préférences
            </Button>
          </form>
        </Panel>
      </div>
    </>
  )
}
export function Profile() {
  const { user, preview } = useWorkspace()
  return (
    <>
      <PageHeading
        title="Mon compte"
        description="Votre accès personnel à l’administration Koinonia."
      />
      <div className="ws-profile-layout">
        <Panel>
          <div className="ws-profile-identity">
            <Avatar name={user.name} />
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <Badge
              status={
                user.role === 'owner'
                  ? 'Responsable de la plateforme'
                  : user.role === 'administrator'
                    ? 'Administrateur'
                    : 'Éditeur Breakfast'
              }
            />
          </div>
        </Panel>
        <Panel title="Votre espace de confiance">
          <div className="ws-service-row">
            <span>
              <LockKeyhole size={20} />
              Compte administratif indépendant
            </span>
            <Badge status={preview ? 'Aperçu' : 'Actif'} />
          </div>
          <p className="ws-muted">
            Ce compte possède son propre mot de passe et ses sessions
            d’administration. L’accès à l’application mobile est géré
            séparément.
          </p>
          <h3>Autorisations</h3>
          <ul className="ws-permission-list">
            <li>Préparer des Breakfasts</li>
            <li>Organiser le calendrier de publication</li>
            {user.permissions.includes('admins:manage') && (
              <li>Créer et gérer les accès de l’équipe</li>
            )}
          </ul>
          <LocalNote>
            La modification du profil et la gestion avancée des sessions
            personnelles seront proposées avec le module Compte.
          </LocalNote>
        </Panel>
      </div>
    </>
  )
}
export function Activity() {
  const { data } = useWorkspace(),
    [search, setSearch] = useState('')
  const rows = data.logs.filter((l) =>
    `${l.action} ${l.subject}`.toLowerCase().includes(search.toLowerCase()),
  )
  return (
    <>
      <PageHeading
        title="Journal d’activité"
        description="Retrouver le fil des préparations de cet espace."
      />
      <div className="ws-list-toolbar">
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Rechercher une action ou un contenu…"
        />
        <span className="ws-muted">{rows.length} action(s) locale(s)</span>
      </div>
      <Panel>
        {rows.length ? (
          <ol className="ws-timeline ws-full-timeline">
            {rows.map((log) => (
              <li key={log.id}>
                <span />
                <div>
                  <strong>{log.action}</strong>
                  <p>{log.subject}</p>
                  <small>
                    {formatDate(log.date, true)} ·{' '}
                    {new Date(log.date).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </small>
                </div>
                <Badge status="Local" />
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState
            title="Vos prochaines actions s’inscriront ici"
            description="Le journal conserve les préparations de cet appareil, sans prétendre remplacer un journal d’audit serveur."
          />
        )}
      </Panel>
    </>
  )
}
export function Statistics() {
  const { breakfasts, data, preview } = useWorkspace()
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - 6 + i)
    return d
  })
  const values = dates.map(
    (d) =>
      breakfasts.filter(
        (b) =>
          b.status === 'Publié' &&
          b.date ===
            new Intl.DateTimeFormat('sv-SE', {
              timeZone: 'Africa/Douala',
            }).format(d),
      ).length,
  )
  const max = Math.max(...values, 1)
  const total = breakfasts.filter((b) => b.status === 'Publié').length
  return (
    <>
      <PageHeading
        title="Statistiques"
        description="Comprendre les contenus disponibles, à partir des données de cet espace."
      >
        <Badge
          status={
            preview
              ? 'Données de démonstration'
              : 'Catalogue & brouillons locaux'
          }
        />
      </PageHeading>
      <div className="ws-metrics stats">
        {[
          ['Publications disponibles', total],
          [
            'Préparations en cours',
            data.breakfasts.filter((b) => b.status !== 'Publié').length,
          ],
          ['Fiches membres locales', data.members.length],
          ['Espaces communautaires', data.communities.length],
        ].map(([label, value]) => (
          <section className="ws-metric" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <p>{preview ? 'Exemple de données' : 'Comptage dans cet espace'}</p>
          </section>
        ))}
      </div>
      <div className="ws-chart-layout">
        <Panel
          title="Rythme des publications"
          description="Nombre de Breakfasts publiés dans les sept derniers jours."
        >
          <div
            className="ws-bars"
            role="img"
            aria-label={dates
              .map(
                (d, i) =>
                  `${d.toLocaleDateString('fr-FR')}: ${values[i]} publication`,
              )
              .join(', ')}
          >
            {dates.map((d, i) => (
              <div key={d.toISOString()}>
                <span>{values[i]}</span>
                <div>
                  <i
                    style={{
                      height: `${Math.max(3, (values[i] / max) * 100)}%`,
                    }}
                  />
                </div>
                <small>
                  {d.toLocaleDateString('fr-FR', { weekday: 'short' })}
                </small>
              </div>
            ))}
          </div>
        </Panel>
        <Panel
          title="Répartition des formats"
          description="Les différentes façons de recevoir la Parole."
        >
          {['Vidéo + lecture', 'Vidéo', 'Lecture'].map((format) => {
            const count = breakfasts.filter((b) => b.format === format).length
            return (
              <div className="ws-format-stat" key={format}>
                <div>
                  <strong>{format}</strong>
                  <span>{count}</span>
                </div>
                <progress value={count} max={Math.max(1, breakfasts.length)} />
              </div>
            )
          })}
          <LocalNote>
            Les vues, le temps de lecture et les utilisateurs actifs seront
            affichés lorsque leur mesure sera raccordée.
          </LocalNote>
        </Panel>
      </div>
    </>
  )
}
export function Help() {
  return (
    <>
      <PageHeading
        title="Centre d’aide"
        description="Les repères pour prendre soin de votre espace Koinonia."
      />
      <div className="ws-help-grid">
        {[
          {
            icon: BookOpen,
            title: 'Préparer un Breakfast',
            text: 'Rédigez votre méditation, choisissez sa couverture et ajoutez sa référence biblique.',
            link: '/breakfasts/nouveau',
            action: 'Commencer une rédaction',
          },
          {
            icon: CalendarDays,
            title: 'Organiser les publications',
            text: 'Retrouvez les dates préparées dans le calendrier et gardez une vue sur les jours à venir.',
            link: '/programmation',
            action: 'Consulter le calendrier',
          },
          {
            icon: ShieldCheck,
            title: 'Les accès de l’équipe',
            text: 'Les administrateurs créent les comptes. Les éditeurs préparent les Breakfasts et leur programmation.',
            link: '/equipe',
            action: 'Voir l’équipe',
          },
        ].map((item) => (
          <Panel key={item.title}>
            <span className="ws-task-icon mint">
              <item.icon size={23} />
            </span>
            <h2>{item.title}</h2>
            <p className="ws-muted">{item.text}</p>
            <SectionLink to={item.link}>{item.action}</SectionLink>
          </Panel>
        ))}
      </div>
      <Panel title="Questions fréquentes">
        <div className="ws-faq">
          {[
            [
              'Mes modifications sont-elles déjà visibles dans l’app ?',
              'Les préparations de contenu restent sur cet appareil. La publication et les opérations communautaires seront raccordées aux services métier. Les créations de comptes administratifs, après connexion, utilisent déjà le service central.',
            ],
            [
              'Comment conserver une rédaction ?',
              'Utilisez « Enregistrer le brouillon ». Le contenu reste disponible dans ce navigateur après rechargement. Exportez les informations utiles avant de vider les données du navigateur.',
            ],
            [
              'Le compte admin est-il celui de l’app ?',
              'Les deux espaces sont indépendants : même adresse possible, mais mots de passe et sessions distincts.',
            ],
            [
              'À quoi sert le mode aperçu ?',
              'Il présente les écrans avec des exemples. Les données de démonstration sont séparées de votre espace connecté.',
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </Panel>
    </>
  )
}

export function Roadmap() {
  return (
    <>
      <PageHeading
        title="Modules à venir"
        description="Les prochaines possibilités, au rythme du projet."
      />
      <Panel
        title="Les fondations sont posées"
        description="Ces modules figurent au cadrage comme évolutions après le lancement."
      >
        <div className="ws-roadmap-list">
          {[
            {
              icon: BookOpen,
              title: 'Cantiques',
              text: 'Paroles, classement et recherche des chants.',
            },
            {
              icon: FileText,
              title: 'Bibliothèque',
              text: 'Ressources de lecture et documents spirituels.',
            },
            {
              icon: HeartHandshake,
              title: 'Boutique & paiements',
              text: 'Catalogue, commandes et suivi des contributions.',
            },
            {
              icon: UserRound,
              title: 'Inscriptions aux événements',
              text: 'Participants, confirmations et listes de présence.',
            },
            {
              icon: Video,
              title: 'Médias dans les conversations',
              text: 'Pièces jointes et partage de contenus dans les communautés.',
            },
            {
              icon: CircleHelp,
              title: 'Recherche transversale & assistance',
              text: 'Retrouver les ressources et faciliter les parcours.',
            },
          ].map((item) => (
            <div key={item.title}>
              <span className="ws-task-icon mint">
                <item.icon size={21} />
              </span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
              <Badge status="Après le lancement" />
            </div>
          ))}
        </div>
      </Panel>
    </>
  )
}
