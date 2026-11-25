export type PublicationStatus = 'Publié' | 'Programmé' | 'Brouillon' | 'Archivé'
export type Breakfast = {
  id: string
  title: string
  summary: string
  text: string
  author: string
  reference: string
  date: string
  time: string
  status: PublicationStatus
  format: 'Vidéo + lecture' | 'Vidéo' | 'Lecture'
  image: string
  tags: string[]
  source: 'local' | 'example' | 'catalogue'
  videoUrl?: string
  pdfUrl?: string
  coverImage?: string
}
export type Member = {
  id: string
  name: string
  email: string
  country: string
  joined: string
  status: 'Actif' | 'Suspendu'
  groups: string[]
}
export type Community = {
  id: string
  name: string
  description: string
  category: string
  members: number
  access: 'Ouvert' | 'Sur demande'
  color: string
}
export type Membership = {
  id: string
  member: string
  group: string
  date: string
  status: 'En attente' | 'Acceptée' | 'Refusée'
}
export type Report = {
  id: string
  author: string
  subject: string
  reason: string
  date: string
  status: 'À examiner' | 'Résolu' | 'Ignoré'
}
export type EventItem = {
  id: string
  title: string
  date: string
  time: string
  location: string
  description: string
  status: 'Brouillon' | 'Programmé'
}
export type NotificationItem = {
  id: string
  title: string
  body: string
  target: string
  date: string
  status: 'Brouillon' | 'Préparée'
}
export type Media = {
  id: string
  name: string
  type: 'Image' | 'Vidéo' | 'PDF'
  size: string
  date: string
  url?: string
}
export type LogItem = {
  id: string
  action: string
  subject: string
  date: string
}
export type WorkspaceData = {
  version: 1
  breakfasts: Breakfast[]
  members: Member[]
  communities: Community[]
  memberships: Membership[]
  reports: Report[]
  events: EventItem[]
  notifications: NotificationItem[]
  media: Media[]
  logs: LogItem[]
  settings: {
    name: string
    description: string
    time: string
    timezone: string
    notifications: boolean
  }
  messages: {
    id: string
    group: string
    author: string
    body: string
    time: string
  }[]
}
export const dayISO = (date = new Date()) =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: 'Africa/Douala' }).format(date)
export const formatDate = (value: string, long = false) => {
  const date = new Date(value.length === 10 ? value + 'T12:00:00' : value)
  return Number.isNaN(date.getTime())
    ? 'Date à définir'
    : new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: long ? 'long' : 'short',
        ...(long ? { year: 'numeric' } : {}),
      }).format(date)
}
export function validateBreakfast(
  item: Pick<Breakfast, 'title' | 'text' | 'date' | 'time' | 'status'>,
): string | null {
  if (item.title.trim().length < 3)
    return 'Le titre doit contenir au moins 3 caractères.'
  if (item.status === 'Programmé' && (!item.date || !item.time))
    return 'Choisissez une date et une heure de publication.'
  if (
    item.status === 'Programmé' &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(item.date) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(item.time) ||
      !Number.isFinite(Date.parse(`${item.date}T${item.time}:00+01:00`)))
  )
    return 'La date ou l’heure de publication est invalide.'
  if (
    item.status === 'Programmé' &&
    new Date(`${item.date}T${item.time}:00+01:00`).getTime() <= Date.now()
  )
    return 'La programmation doit être dans le futur.'
  return null
}
const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value)
const strings = (value: Record<string, unknown>, fields: string[]) =>
  fields.every((field) => typeof value[field] === 'string')
const stringArray = (value: unknown) =>
  Array.isArray(value) && value.every((item) => typeof item === 'string')
export function parseWorkspace(
  raw: string | null,
  fallback: WorkspaceData,
): WorkspaceData {
  const reset = () => structuredClone(fallback)
  try {
    if (!raw) return reset()
    const value: unknown = JSON.parse(raw)
    if (!isRecord(value) || value.version !== 1 || !isRecord(value.settings))
      return reset()
    if (
      !strings(value.settings, ['name', 'description', 'time', 'timezone']) ||
      typeof value.settings.notifications !== 'boolean'
    )
      return reset()
    const fields: Record<string, string[]> = {
      breakfasts: [
        'id',
        'title',
        'summary',
        'text',
        'author',
        'reference',
        'date',
        'time',
        'status',
        'format',
        'image',
        'source',
      ],
      members: ['id', 'name', 'email', 'country', 'joined', 'status'],
      communities: ['id', 'name', 'description', 'category', 'access', 'color'],
      memberships: ['id', 'member', 'group', 'date', 'status'],
      reports: ['id', 'author', 'subject', 'reason', 'date', 'status'],
      events: [
        'id',
        'title',
        'date',
        'time',
        'location',
        'description',
        'status',
      ],
      notifications: ['id', 'title', 'body', 'target', 'date', 'status'],
      media: ['id', 'name', 'type', 'size', 'date'],
      logs: ['id', 'action', 'subject', 'date'],
      messages: ['id', 'group', 'author', 'body', 'time'],
    }
    for (const [key, required] of Object.entries(fields)) {
      const collection = value[key]
      if (
        !Array.isArray(collection) ||
        !collection.every((item) => isRecord(item) && strings(item, required))
      )
        return reset()
    }
    const data = value as unknown as WorkspaceData
    if (
      !data.breakfasts.every(
        (b) =>
          stringArray(b.tags) &&
          ['Publié', 'Programmé', 'Brouillon', 'Archivé'].includes(b.status) &&
          ['local', 'example', 'catalogue'].includes(b.source) &&
          ['Vidéo', 'Lecture', 'Vidéo + lecture'].includes(b.format),
      )
    )
      return reset()
    if (
      !data.members.every((m) => stringArray(m.groups)) ||
      !data.communities.every(
        (c) => Number.isFinite(c.members) && c.members >= 0,
      )
    )
      return reset()
    return data
  } catch {
    return reset()
  }
}
export function exportCsv(rows: string[][]): string {
  return (
    '\uFEFF' +
    rows
      .map((row) =>
        row
          .map(
            (value) =>
              '"' +
              (/^[=+@\-\t\r\n]/.test(String(value).trimStart())
                ? "'" + value
                : String(value)
              ).replace(/"/g, '""') +
              '"',
          )
          .join(';'),
      )
      .join('\r\n')
  )
}
