import {
  LayoutDashboard,
  Sunrise,
  CalendarDays,
  Image,
  Radio,
  UsersRound,
  HeartHandshake,
  UserRoundCheck,
  MessagesSquare,
  ShieldCheck,
  CalendarHeart,
  Bell,
  BookOpen,
  ChartNoAxesCombined,
  UserRoundCog,
  Settings2,
  History,
  CircleHelp,
  Layers3,
  UserRound,
} from 'lucide-react'
export const navigation = [
  {
    label: 'Vue d’ensemble',
    items: [
      { label: 'Tableau de bord', to: '/', icon: LayoutDashboard },
      {
        label: 'Statistiques',
        to: '/statistiques',
        icon: ChartNoAxesCombined,
        admin: true,
      },
    ],
  },
  {
    label: 'Contenus & publications',
    items: [
      { label: 'Breakfasts', to: '/breakfasts', icon: Sunrise },
      { label: 'Programmation', to: '/programmation', icon: CalendarDays },
      { label: 'Médiathèque', to: '/mediatheque', icon: Image },
      {
        label: 'Diffusion Facebook',
        to: '/diffusion',
        icon: Radio,
        admin: true,
      },
      { label: 'Bible & verset du jour', to: '/bible', icon: BookOpen },
    ],
  },
  {
    label: 'Vie de la communauté',
    items: [
      { label: 'Membres', to: '/membres', icon: UsersRound, admin: true },
      {
        label: 'Communautés',
        to: '/communautes',
        icon: HeartHandshake,
        admin: true,
      },
      {
        label: 'Demandes d’adhésion',
        to: '/adhesions',
        icon: UserRoundCheck,
        admin: true,
      },
      {
        label: 'Conversations',
        to: '/conversations',
        icon: MessagesSquare,
        admin: true,
      },
      {
        label: 'Modération',
        to: '/moderation',
        icon: ShieldCheck,
        admin: true,
      },
      {
        label: 'Événements',
        to: '/evenements',
        icon: CalendarHeart,
        admin: true,
      },
      { label: 'Notifications', to: '/notifications', icon: Bell, admin: true },
    ],
  },
  {
    label: 'Administration',
    items: [
      {
        label: 'Équipe & accès',
        to: '/equipe',
        icon: UserRoundCog,
        admin: true,
      },
      { label: 'Paramètres', to: '/parametres', icon: Settings2, admin: true },
      {
        label: 'Journal d’activité',
        to: '/journal',
        icon: History,
        admin: true,
      },
    ],
  },
]
export const extraPages = [
  { label: 'Mon compte', to: '/mon-compte', icon: UserRound },
  { label: 'Centre d’aide', to: '/aide', icon: CircleHelp },
  { label: 'Modules à venir', to: '/evolutions', icon: Layers3 },
]
export const allPages = [
  ...navigation.flatMap((group) => group.items),
  ...extraPages,
]
