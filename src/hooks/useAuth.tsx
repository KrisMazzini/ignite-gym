import { useContext } from 'react'

import { AuthContext } from '@contexts/AuthContext'

export function useAuth() {
  const authData = useContext(AuthContext)
  return authData
}
