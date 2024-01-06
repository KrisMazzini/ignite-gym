import { ReactNode, createContext, useEffect, useRef, useState } from 'react'
import { useToast } from 'native-base'

import { api } from '@services/api'
import { UserDTO } from '@dtos/UserDTO'
import { AppError } from '@utils/AppError'

import {
  getAuthTokenStorage,
  removeAuthTokenStorage,
  saveAuthTokenStorage,
} from '@storage/storageAuthToken'
import {
  saveUserStorage,
  getUserStorage,
  removeUserStorage,
} from '@storage/storageUser'

type AuthContextProviderProps = {
  children: ReactNode
}

export type AuthContextDataProps = {
  user: UserDTO
  isLoadingUserStorageData: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextDataProps>(
  {} as AuthContextDataProps,
)

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState<UserDTO>({} as UserDTO)
  const [isLoadingUserStorageData, setIsLoadingUserStorageData] = useState(true)

  const toast = useToast()
  const toastRef = useRef(toast)

  async function updateUserAndToken(userData: UserDTO, token: string) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    setUser(userData)
  }

  async function signIn(email: string, password: string) {
    const { data } = await api.post('/sessions', {
      email,
      password,
    })

    if (data.user && data.token) {
      setIsLoadingUserStorageData(true)

      await saveAuthTokenStorage(data.token)
      await saveUserStorage(data.user)

      updateUserAndToken(data.user, data.token)
    }

    setIsLoadingUserStorageData(false)
  }

  async function signOut() {
    try {
      setIsLoadingUserStorageData(true)

      setUser({} as UserDTO)
      api.defaults.headers.common.Authorization = ''

      await removeUserStorage()
      await removeAuthTokenStorage()
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError
        ? error.message
        : 'Erro ao fazer logout. Tente novamente mais tarde.'

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      })
    } finally {
      setIsLoadingUserStorageData(false)
    }
  }

  useEffect(() => {
    async function loadUserData() {
      try {
        setIsLoadingUserStorageData(true)

        const loggedUser = await getUserStorage()
        const token = await getAuthTokenStorage()

        if (loggedUser && token) {
          updateUserAndToken(loggedUser, token)
        }
      } catch (error) {
        const isAppError = error instanceof AppError
        const title = isAppError
          ? error.message
          : 'Erro ao fazer login. Tente novamente mais tarde.'

        toastRef.current.show({
          title,
          placement: 'top',
          bgColor: 'red.500',
        })
      } finally {
        setIsLoadingUserStorageData(false)
      }
    }

    loadUserData()
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, isLoadingUserStorageData, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}
