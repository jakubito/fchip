import { createContext } from 'preact'
import { useContext } from 'preact/hooks'
import Client from './client'

export const ClientContext = createContext<Client | undefined>(undefined)

export function useClient() {
  const client = useContext(ClientContext)
  if (!client) throw new Error('ClientContext.Provider not found')
  return client
}
