/* eslint-disable camelcase */
import { useCallback, useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import {
  Center,
  Heading,
  ScrollView,
  Skeleton,
  Text,
  VStack,
  useToast,
} from 'native-base'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'

import { AppError } from '@utils/AppError'
import { api } from '@services/api'
import { useAuth } from '@hooks/useAuth'

import defaultUserPhotoImg from '@assets/userPhotoDefault.png'

import { KeyboardAvoidingView } from '@components/KeyboardAvoidingView'
import { ScreenHeader } from '@components/ScreenHeader'
import { UserPhoto } from '@components/UserPhoto'
import { Input } from '@components/Input'
import { Button } from '@components/Button'

const PHOTO_SIZE = 37

const profileFormValidationSchema = z
  .object({
    name: z.string().min(1, { message: 'O nome é obrigatório.' }),
    email: z.string().email(),
    old_password: z
      .string()
      .optional()
      .or(z.literal(''))
      .transform((value) => value || ''),
    password: z
      .string()
      .min(6, { message: 'A senha deve ter no mínimo 6 dígitos.' })
      .optional()
      .or(z.literal(''))
      .transform((value) => value || ''),
    password_confirm: z
      .string()
      .optional()
      .transform((value) => value || ''),
  })
  .refine(({ password, password_confirm }) => password === password_confirm, {
    message: 'As senhas devem ser iguais.',
    path: ['password_confirm'],
  })

type FormDataProps = z.infer<typeof profileFormValidationSchema>

export function Profile() {
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [photoHasLoaded, setPhotoHasLoaded] = useState(true)

  const { user, updateUserProfile } = useAuth()
  const toast = useToast()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormDataProps>({
    resolver: zodResolver(profileFormValidationSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      old_password: '',
      password: '',
      password_confirm: '',
    },
  })

  async function handleUserPhotoSelect() {
    setPhotoHasLoaded(false)

    try {
      const selectedPhoto = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        aspect: [4, 4],
        allowsEditing: true,
        selectionLimit: 1,
      })

      if (selectedPhoto.canceled) {
        return
      }

      const uri = selectedPhoto.assets[0].uri

      if (uri) {
        const photoInfo = await FileSystem.getInfoAsync(uri)

        if (photoInfo.exists && photoInfo.size / 1024 / 1024 > 5) {
          return toast.show({
            title: 'A imagem deve ter no máximo 5MB',
            placement: 'top',
            bgColor: 'red.500',
          })
        }

        const fileExtension = uri.split('.').pop()

        const photoFile = {
          name: `${user.name}.${fileExtension}`.toLowerCase(),
          uri,
          type: `${selectedPhoto.assets[0].type}/${fileExtension}`,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any

        const userPhotoUploadForm = new FormData()
        userPhotoUploadForm.append('avatar', photoFile)

        const avatarResponse = await api.patch(
          '/users/avatar',
          userPhotoUploadForm,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        )

        updateUserProfile({
          ...user,
          avatar: avatarResponse.data.avatar,
        })

        toast.show({
          title: 'Foto atualizada!',
          placement: 'top',
          bgColor: 'green.700',
        })
      }
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError
        ? error.message
        : 'Não foi possível atualizar a foto.'

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      })
    } finally {
      setPhotoHasLoaded(true)
    }
  }

  async function handleProfileUpdate({
    name,
    password,
    old_password,
  }: FormDataProps) {
    try {
      setIsUpdatingProfile(true)
      await api.put('/users', { name, password, old_password })
      await updateUserProfile({
        ...user,
        name,
      })

      reset({
        name,
      })

      toast.show({
        title: 'Perfil atualizado com sucesso',
        placement: 'top',
        bgColor: 'green.700',
      })
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError
        ? error.message
        : 'Não foi possível atualizar o perfil.'

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      })
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      reset()
    }, [reset]),
  )

  return (
    <KeyboardAvoidingView>
      <VStack flex={1}>
        <ScreenHeader title="Perfil" />

        <ScrollView>
          <Center mt={6} px={10}>
            <Skeleton
              w={PHOTO_SIZE}
              h={PHOTO_SIZE}
              rounded="full"
              startColor="gray.500"
              endColor="gray.400"
              isLoaded={photoHasLoaded}
            >
              <UserPhoto
                source={
                  user.avatar
                    ? { uri: `${api.defaults.baseURL}/avatar/${user.avatar}` }
                    : defaultUserPhotoImg
                }
                size={PHOTO_SIZE}
              />
            </Skeleton>

            <TouchableOpacity onPress={handleUserPhotoSelect}>
              <Text
                color="green.500"
                fontWeight="bold"
                fontSize="md"
                mt={2}
                mb={8}
              >
                Alterar foto
              </Text>
            </TouchableOpacity>

            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  placeholder="Nome"
                  bg="gray.600"
                  value={field.value}
                  onChangeText={field.onChange}
                  errorMessage={errors.name?.message}
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  placeholder="seunome@email.com"
                  bg="gray.600"
                  isDisabled
                  value={field.value}
                  onChangeText={field.onChange}
                />
              )}
            />
          </Center>

          <VStack mt={12} mb={9} px={10}>
            <Heading fontFamily="heading" color="gray.200" fontSize="md" mb={2}>
              Alterar senha
            </Heading>

            <Controller
              name="old_password"
              control={control}
              render={({ field }) => (
                <Input
                  bg="gray.600"
                  placeholder="Senha antiga"
                  secureTextEntry
                  value={field.value}
                  onChangeText={field.onChange}
                  errorMessage={errors.old_password?.message}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input
                  bg="gray.600"
                  placeholder="Nova senha"
                  secureTextEntry
                  value={field.value}
                  onChangeText={field.onChange}
                  errorMessage={errors.password?.message}
                />
              )}
            />

            <Controller
              name="password_confirm"
              control={control}
              render={({ field }) => (
                <Input
                  bg="gray.600"
                  placeholder="Confirme a nova senha"
                  secureTextEntry
                  value={field.value}
                  onChangeText={field.onChange}
                  errorMessage={errors.password_confirm?.message}
                />
              )}
            />

            <Button
              title="Atualizar"
              mt={4}
              onPress={handleSubmit(handleProfileUpdate)}
              isLoading={isUpdatingProfile}
            />
          </VStack>
        </ScrollView>
      </VStack>
    </KeyboardAvoidingView>
  )
}
