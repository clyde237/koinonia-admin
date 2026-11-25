import readingCover1 from '../assets/breakfasts/adorez-dieu-selon-sa-parole-cover.jpg'
import readingCover2 from '../assets/breakfasts/devenez-un-allie-de-dieu-cover.jpg'
import readingCover3 from '../assets/breakfasts/la-puissance-de-dieu-enrichit-cover.jpg'
import readingCover4 from '../assets/breakfasts/dieu-parle-cover.jpg'
import cover1 from '../assets/breakfasts/adorez-dieu-selon-sa-parole.jpg'
import cover2 from '../assets/breakfasts/devenez-un-allie-de-dieu.jpg'
import cover3 from '../assets/breakfasts/la-puissance-de-dieu-enrichit.jpg'
import cover4 from '../assets/breakfasts/dieu-parle.jpg'
import { dayISO, type WorkspaceData, type Breakfast } from './model'
export const readingCovers = [
  readingCover1,
  readingCover2,
  readingCover3,
  readingCover4,
]
export const covers = [cover1, cover2, cover3, cover4]
const today = dayISO()
const day = (offset: number) => {
  const d = new Date(today + 'T12:00:00')
  d.setDate(d.getDate() + offset)
  return dayISO(d)
}
export const emptyData: WorkspaceData = {
  version: 1,
  breakfasts: [],
  members: [],
  communities: [],
  memberships: [],
  reports: [],
  events: [],
  notifications: [],
  media: [],
  logs: [],
  messages: [],
  settings: {
    name: 'Koinonia',
    description: 'Communion avec le Saint-Esprit',
    time: '06:00',
    timezone: 'Africa/Douala',
    notifications: true,
  },
}
const titles = [
  'Adorez Dieu selon sa Parole',
  'Devenez un allié de Dieu',
  'La puissance de Dieu enrichit',
  'Dieu parle',
  'Demeurer dans sa présence',
  'Une foi qui porte du fruit',
]
export const exampleData: WorkspaceData = {
  ...emptyData,
  breakfasts: titles.map((title, i): Breakfast => ({
    id: 'example-' + i,
    coverImage: readingCovers[i % 4],
    title,
    summary:
      'Prendre un temps à part pour accueillir la Parole et avancer dans la communion avec Dieu.',
    text: 'Prenons le temps de nous arrêter devant Dieu. Sa Parole nourrit notre foi et nous invite à vivre chaque journée dans sa présence.\n\nLaissons cette méditation éclairer nos choix et devenir une prière simple, au cœur de notre quotidien.',
    author: 'Équipe Koinonia',
    reference: i % 2 ? 'Proverbes 3.5-6' : 'Jean 15.4-5',
    date: day(i === 0 ? 0 : i < 4 ? -i : i - 3),
    time: '06:00',
    status: i < 4 ? 'Publié' : i === 4 ? 'Programmé' : 'Brouillon',
    format: 'Vidéo + lecture',
    image: covers[i % 4],
    tags: [i % 2 ? 'Foi' : 'Communion', 'Vie chrétienne'],
    source: 'example',
  })),
  members: [
    {
      id: 'm1',
      name: 'Élise M.',
      email: 'elise@example.com',
      country: 'Cameroun',
      joined: day(-1),
      status: 'Actif',
      groups: ['g1', 'g2'],
    },
    {
      id: 'm2',
      name: 'Samuel N.',
      email: 'samuel@example.com',
      country: 'Cameroun',
      joined: day(-2),
      status: 'Actif',
      groups: ['g1'],
    },
    {
      id: 'm3',
      name: 'Grâce A.',
      email: 'grace@example.com',
      country: 'France',
      joined: day(-3),
      status: 'Actif',
      groups: ['g2'],
    },
    {
      id: 'm4',
      name: 'Joël K.',
      email: 'joel@example.com',
      country: 'Côte d’Ivoire',
      joined: day(-4),
      status: 'Suspendu',
      groups: [],
    },
    {
      id: 'm5',
      name: 'Esther B.',
      email: 'esther@example.com',
      country: 'Sénégal',
      joined: day(-5),
      status: 'Actif',
      groups: ['g3'],
    },
  ],
  communities: [
    {
      id: 'g1',
      name: 'Veilleurs du matin',
      description:
        'Commencer la journée ensemble, dans la prière et la méditation.',
      category: 'Prière',
      members: 128,
      access: 'Ouvert',
      color: 'mint',
    },
    {
      id: 'g2',
      name: 'Grandir dans la foi',
      description:
        'Un espace pour approfondir la Parole et partager son chemin de foi.',
      category: 'Étude biblique',
      members: 86,
      access: 'Sur demande',
      color: 'sand',
    },
    {
      id: 'g3',
      name: 'Prière et partage',
      description:
        'Porter les intentions de chacun et cultiver la communion fraternelle.',
      category: 'Partage',
      members: 64,
      access: 'Ouvert',
      color: 'blue',
    },
  ],
  memberships: [
    {
      id: 'a1',
      member: 'Miriam T.',
      group: 'Grandir dans la foi',
      date: day(-1),
      status: 'En attente',
    },
    {
      id: 'a2',
      member: 'David F.',
      group: 'Grandir dans la foi',
      date: today,
      status: 'En attente',
    },
  ],
  reports: [
    {
      id: 'r1',
      author: 'Un membre',
      subject: 'Message dans « Prière et partage »',
      reason: 'Contenu hors sujet',
      date: today,
      status: 'À examiner',
    },
    {
      id: 'r2',
      author: 'Un membre',
      subject: 'Commentaire dans « Grandir dans la foi »',
      reason: 'Propos inappropriés',
      date: day(-1),
      status: 'À examiner',
    },
  ],
  events: [
    {
      id: 'e1',
      title: 'Matinée de prière et de communion',
      date: day(3),
      time: '09:00',
      location: 'En ligne',
      description:
        'Un temps de prière, de louange et de partage autour de la Parole.',
      status: 'Programmé',
    },
  ],
  notifications: [
    {
      id: 'n1',
      title: 'Votre Breakfast vous attend',
      body: 'Prenez quelques minutes pour nourrir votre foi aujourd’hui.',
      target: 'Tous les membres',
      date: today,
      status: 'Préparée',
    },
  ],
  media: covers.map((url, i) => ({
    id: 'asset-' + i,
    name: titles[i] + '.jpg',
    type: 'Image',
    size: 'Couverture',
    date: day(-i),
    url,
  })),
  logs: [
    {
      id: 'l1',
      action: 'Brouillon enregistré',
      subject: 'Une foi qui porte du fruit',
      date: new Date().toISOString(),
    },
    {
      id: 'l2',
      action: 'Programmation préparée',
      subject: 'Demeurer dans sa présence',
      date: new Date(Date.now() - 3600000).toISOString(),
    },
  ],
  messages: [
    {
      id: 'c1',
      group: 'g1',
      author: 'Élise M.',
      body: 'Bonjour à tous. Que cette journée soit un temps de paix et de communion.',
      time: '07:12',
    },
    {
      id: 'c2',
      group: 'g1',
      author: 'Samuel N.',
      body: 'Amen. Le Breakfast de ce matin nous rappelle de prendre du temps pour la Parole.',
      time: '07:18',
    },
  ],
}
