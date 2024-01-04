import { ReactNode, createContext, useEffect, useState } from 'react'
import { useToast } from 'native-base'

import { api } from '@services/api'
import { UserDTO } from '@dtos/UserDTO'
import { AppError } from '@utils/AppError'

import {
  getUserStorage,
  removeUserStorage,
  saveUserStorage,
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

  async function signIn(email: string, password: string) {
    const { data } = await api.post('/sessions', {
      email,
      password,
    })

    if (data.user) {
      setUser(data.user)
      saveUserStorage(data.user)
    }
  }

  async function signOut() {
    try {
      setIsLoadingUserStorageData(true)
      setUser({} as UserDTO)
      await removeUserStorage()
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
        const loggedUser = await getUserStorage()

        if (loggedUser) {
          setUser(loggedUser)
        }
      } catch (error) {
        const isAppError = error instanceof AppError
        const title = isAppError
          ? error.message
          : 'Erro ao fazer login. Tente novamente mais tarde.'

        toast.show({
          title,
          placement: 'top',
          bgColor: 'red.500',
        })
      } finally {
        setIsLoadingUserStorageData(false)
      }
    }

    loadUserData()
  }, [toast])

  return (
    <AuthContext.Provider
      value={{ user, isLoadingUserStorageData, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}
