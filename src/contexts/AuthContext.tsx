import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
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
  updateUserProfile: (updatedUser: UserDTO) => Promise<void>
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

    if (data.user && data.token && data.refresh_token) {
      setIsLoadingUserStorageData(true)

      await saveAuthTokenStorage({
        token: data.token,
        refresh_token: data.refresh_token,
      })

      await saveUserStorage(data.user)

      updateUserAndToken(data.user, data.token)
    }

    setIsLoadingUserStorageData(false)
  }

  const signOut = useCallback(async () => {
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

      toastRef.current.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      })
    } finally {
      setIsLoadingUserStorageData(false)
    }
  }, [])

  async function updateUserProfile(updatedUser: UserDTO) {
    setUser(updatedUser)
    await saveUserStorage(updatedUser)
  }

  useEffect(() => {
    async function loadUserData() {
      try {
        setIsLoadingUserStorageData(true)

        const loggedUser = await getUserStorage()
        const { token } = await getAuthTokenStorage()

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

  useEffect(() => {
    const subscribe = api.registerInterceptTokenManager(signOut)

    return () => subscribe()
  }, [signOut])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoadingUserStorageData,
        signIn,
        signOut,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
