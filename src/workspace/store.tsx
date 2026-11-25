import { WorkspaceContext } from './context'
import { useEffect, useState, type ReactNode } from 'react'
import type { AdminUser } from '../lib/auth'
import { covers, emptyData, exampleData } from './data'
import { dayISO, parseWorkspace, type Breakfast } from './model'

export function WorkspaceProvider({
  children,
  user,
  preview,
}: {
  children: ReactNode
  user: AdminUser
  preview: boolean
}) {
  const key = `koinonia-workspace-v1-${preview ? 'preview' : user.id}`
  const [data, setData] = useState(() => {
    try {
      return parseWorkspace(
        localStorage.getItem(key),
        preview ? exampleData : emptyData,
      )
    } catch {
      return structuredClone(preview ? exampleData : emptyData)
    }
  })
  const [storageError, setStorageError] = useState(false)
  const [catalogue, setCatalogue] = useState<Breakfast[]>([])
  const [catalogueLoading, setCatalogueLoading] = useState(!preview)
  const [catalogueError, setCatalogueError] = useState('')
  const [revision, setRevision] = useState(0)
  const [notice, setNotice] = useState('')
  useEffect(() => {
    // Synchronise le retour d’erreur avec le stockage externe au composant.
    try {
      localStorage.setItem(key, JSON.stringify(data))
      // oxlint-disable-next-line react/set-state-in-effect
      setStorageError(false)
    } catch {
      // oxlint-disable-next-line react/set-state-in-effect
      setStorageError(true)
    }
  }, [data, key])
  useEffect(() => {
    if (preview) return
    const controller = new AbortController()
    // Le changement de requête invalide l’ancien résultat du catalogue.
    // oxlint-disable-next-line react/set-state-in-effect
    setCatalogueLoading(true)
    setCatalogueError('')
    fetch('/api/breakfasts', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok)
          throw new Error('Le catalogue publié est indisponible.')
        const items: unknown = await response.json()
        if (!Array.isArray(items))
          throw new Error('Le catalogue reçu est invalide.')
        setCatalogue(
          items
            .filter(
              (item) =>
                typeof item.id === 'string' && typeof item.title === 'string',
            )
            .map((item, i) => ({
              id: item.id,
              title: item.title,
              summary: item.summary ?? '',
              text: item.text ?? '',
              author: item.author ?? 'Koinonia',
              reference: item.scriptureRef ?? '',
              date: item.publishedOn ?? dayISO(),
              time: '06:00',
              status: 'Publié',
              format:
                item.format === 'video'
                  ? 'Vidéo'
                  : item.format === 'text'
                    ? 'Lecture'
                    : 'Vidéo + lecture',
              coverImage: item.coverUrl,
              image: item.thumbnailUrl ?? covers[i % covers.length],
              tags: Array.isArray(item.tags) ? item.tags : [],
              source: 'catalogue',
              videoUrl: item.videoUrl,
              pdfUrl: item.pdfUrl,
            })),
        )
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setCatalogueError(
            error instanceof Error
              ? error.message
              : 'Connexion au catalogue impossible.',
          )
      })
      .finally(() => {
        if (!controller.signal.aborted) setCatalogueLoading(false)
      })
    return () => controller.abort()
  }, [preview, revision])
  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(''), 4500)
    return () => clearTimeout(timer)
  }, [notice])
  const log = (action: string, subject: string) =>
    setData((d) => ({
      ...d,
      logs: [
        {
          id: crypto.randomUUID(),
          action,
          subject,
          date: new Date().toISOString(),
        },
        ...d.logs,
      ].slice(0, 100),
    }))
  return (
    <WorkspaceContext.Provider
      value={{
        data,
        setData,
        user,
        preview,
        breakfasts: [...data.breakfasts, ...catalogue],
        catalogueLoading,
        catalogueError,
        reloadCatalogue: () => setRevision((v) => v + 1),
        toast: (message) => {
          if (data.settings.notifications) setNotice(message)
        },
        log,
        storageError,
      }}
    >
      {children}
      {notice && (
        <div className="ws-toast" role="status">
          <span className="status-dot" />
          {notice}
          <button
            onClick={() => setNotice('')}
            aria-label="Fermer la confirmation"
          >
            ×
          </button>
        </div>
      )}
    </WorkspaceContext.Provider>
  )
}
