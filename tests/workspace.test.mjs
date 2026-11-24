import test from 'node:test'
import assert from 'node:assert/strict'
import {
  dayISO,
  exportCsv,
  formatDate,
  parseWorkspace,
  validateBreakfast,
} from '../src/workspace/model.ts'

const empty = () => ({
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
    description: '',
    time: '06:00',
    timezone: 'Africa/Douala',
    notifications: true,
  },
})
const draft = () => ({
  id: 'draft-1',
  title: 'Une méditation',
  summary: '',
  text: 'Le texte rédigé.',
  author: 'Équipe',
  reference: 'Jean 15.4',
  date: '2099-04-12',
  time: '06:00',
  status: 'Brouillon',
  format: 'Vidéo + lecture',
  image: '/cover.jpg',
  tags: ['Foi', 'Prière'],
  source: 'local',
})

test('un brouillon peut être conservé avant de choisir sa date', () => {
  assert.equal(validateBreakfast({ ...draft(), date: '', time: '' }), null)
  assert.match(validateBreakfast({ ...draft(), title: '  ' }), /titre/)
})
test('la programmation exige une date future et une heure valide', () => {
  assert.equal(validateBreakfast({ ...draft(), status: 'Programmé' }), null)
  assert.match(
    validateBreakfast({ ...draft(), status: 'Programmé', date: '2000-01-01' }),
    /futur/,
  )
  assert.match(
    validateBreakfast({ ...draft(), status: 'Programmé', time: '' }),
    /date et une heure/,
  )
  assert.match(
    validateBreakfast({
      ...draft(),
      status: 'Programmé',
      date: 'date-invalide',
    }),
    /invalide/,
  )
  assert.match(
    validateBreakfast({ ...draft(), status: 'Programmé', time: '29:00' }),
    /invalide/,
  )
})
test('les dates éditoriales suivent Douala à la frontière du jour UTC', () => {
  assert.equal(dayISO(new Date('2026-11-23T23:30:00Z')), '2026-11-24')
  assert.equal(formatDate('invalide'), 'Date à définir')
})
test('le rechargement restaure le texte, les thèmes et les préférences', () => {
  const saved = { ...empty(), breakfasts: [draft()] }
  const restored = parseWorkspace(JSON.stringify(saved), empty())
  assert.deepEqual(restored, saved)
  restored.breakfasts[0].tags.push('Espérance')
  assert.equal(saved.breakfasts[0].tags.length, 2)
})
test('une donnée absente ou illisible revient à un état indépendant', () => {
  const fallback = empty()
  for (const value of [null, '{broken', 'null', '{"version":9}']) {
    const restored = parseWorkspace(value, fallback)
    assert.deepEqual(restored, fallback)
    restored.settings.name = 'Autre'
    assert.equal(fallback.settings.name, 'Koinonia')
  }
})
test('les collections corrompues ne font pas planter les écrans', () => {
  for (const corrupt of [
    { members: [null] },
    { members: [{ id: 'a', name: 'Sans groupes' }] },
    { breakfasts: [{ ...draft(), tags: [null] }] },
    { breakfasts: [{ ...draft(), status: 'Statut inconnu' }] },
    { notifications: ['invalide'] },
    { settings: { name: 'Incomplet' } },
  ])
    assert.deepEqual(
      parseWorkspace(JSON.stringify({ ...empty(), ...corrupt }), empty()),
      empty(),
    )
})
test('les exports conservent accents, séparateurs, guillemets et retours à la ligne', () => {
  assert.equal(
    exportCsv([['Équipe; locale', '« Foi » "partagée"', 'Deux\nlignes']]),
    '\uFEFF"Équipe; locale";"« Foi » ""partagée""";"Deux\nlignes"',
  )
})
test('les textes saisis ne deviennent pas des formules dans les exports', () => {
  for (const value of ['=1+1', '+SUM(A1)', '-1+1', '@SUM(A1)', '   =1+1']) {
    assert.equal(exportCsv([[value]]), '\uFEFF"\'' + value + '"')
  }
})
