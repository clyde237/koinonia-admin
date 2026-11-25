import {
  createContext,
  useContext,
  type Dispatch,
  type SetStateAction,
} from 'react'
import type { AdminUser } from '../lib/auth'
import type { Breakfast, WorkspaceData } from './model'
export type WorkspaceContextValue = {
  data: WorkspaceData
  setData: Dispatch<SetStateAction<WorkspaceData>>
  user: AdminUser
  preview: boolean
  breakfasts: Breakfast[]
  catalogueLoading: boolean
  catalogueError: string
  reloadCatalogue: () => void
  toast: (message: string) => void
  log: (action: string, subject: string) => void
  storageError: boolean
}
export const WorkspaceContext = createContext<WorkspaceContextValue | null>(
  null,
)
export function useWorkspace() {
  const value = useContext(WorkspaceContext)
  if (!value) throw new Error('Workspace context missing')
  return value
}
