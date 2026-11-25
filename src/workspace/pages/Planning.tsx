import { useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useWorkspace } from '../context'
import { dayISO, formatDate } from '../model'
import { Badge, Button, EmptyState, PageHeading, Panel, WLink } from '../ui'
export function Planning() {
  const { breakfasts, data } = useWorkspace()
  const [month, setMonth] = useState(() => {
      const d = new Date()
      return new Date(d.getFullYear(), d.getMonth(), 1)
    }),
    [selected, setSelected] = useState(dayISO())
  const first = (month.getDay() + 6) % 7,
    length = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const days = Array.from(
    { length: Math.ceil((first + length) / 7) * 7 },
    (_, i) => {
      const d = new Date(
        month.getFullYear(),
        month.getMonth(),
        i - first + 1,
        12,
      )
      return {
        key: dayISO(d),
        day: d.getDate(),
        other: d.getMonth() !== month.getMonth(),
      }
    },
  )
  const events = [
    ...breakfasts.filter((b) => b.date === selected),
    ...data.events.filter((e) => e.date === selected),
  ]
  return (
    <>
      <PageHeading
        title="Programmation"
        description="Donnez un rythme à la vie de Koinonia."
      >
        <WLink to="/breakfasts/nouveau" className="ws-button primary">
          <Plus size={17} />
          Préparer une publication
        </WLink>
      </PageHeading>
      <div className="ws-calendar-layout">
        <Panel className="ws-calendar-panel">
          <div className="ws-calendar-toolbar">
            <h2>
              {month.toLocaleDateString('fr-FR', {
                month: 'long',
                year: 'numeric',
              })}
            </h2>
            <div>
              <Button
                variant="secondary"
                onClick={() => {
                  const d = new Date()
                  setMonth(new Date(d.getFullYear(), d.getMonth(), 1))
                  setSelected(dayISO())
                }}
              >
                Aujourd’hui
              </Button>
              <button
                className="ws-icon"
                aria-label="Mois précédent"
                onClick={() =>
                  setMonth(
                    new Date(month.getFullYear(), month.getMonth() - 1, 1),
                  )
                }
              >
                <ChevronLeft size={18} />
              </button>
              <button
                className="ws-icon"
                aria-label="Mois suivant"
                onClick={() =>
                  setMonth(
                    new Date(month.getFullYear(), month.getMonth() + 1, 1),
                  )
                }
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div className="ws-calendar-days">
            {['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.'].map(
              (d) => (
                <span key={d}>{d}</span>
              ),
            )}
          </div>
          <div className="ws-calendar-grid">
            {days.map((d) => {
              const entries = breakfasts.filter(
                (b) => b.date === d.key && b.status !== 'Archivé',
              )
              return (
                <button
                  key={d.key}
                  className={`${d.other ? 'other' : ''} ${d.key === dayISO() ? 'today' : ''} ${d.key === selected ? 'selected' : ''}`}
                  aria-label={`${formatDate(d.key, true)}, ${entries.length} publication(s)`}
                  aria-pressed={d.key === selected}
                  onClick={() => setSelected(d.key)}
                >
                  <span>{d.day}</span>
                  {entries.slice(0, 2).map((b) => (
                    <small
                      key={b.id}
                      className={
                        b.status === 'Publié' ? 'published' : 'planned'
                      }
                    >
                      {b.time} · {b.title}
                    </small>
                  ))}
                </button>
              )
            })}
          </div>
          <div className="ws-calendar-legend">
            <span>
              <i className="positive" />
              Publié au catalogue
            </span>
            <span>
              <i className="warning" />
              Préparation locale
            </span>
          </div>
        </Panel>
        <Panel
          title={formatDate(selected, true)}
          description="Le programme de cette journée."
        >
          {events.length ? (
            events.map((e) => (
              <div className="ws-agenda-item" key={e.id}>
                <span>
                  <CalendarDays size={18} />
                </span>
                <p>
                  <small>{e.time}</small>
                  <strong>{e.title}</strong>
                  <Badge status={e.status} />
                </p>
                {'format' in e && (
                  <WLink to={'/breakfasts/' + e.id} className="ws-icon">
                    <ChevronRight size={16} />
                    <span className="sr-only">Ouvrir</span>
                  </WLink>
                )}
              </div>
            ))
          ) : (
            <EmptyState
              title="Une journée disponible"
              description="Préparez un Breakfast pour cette date."
            />
          )}
        </Panel>
      </div>
    </>
  )
}
