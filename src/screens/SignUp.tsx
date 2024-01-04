import { useState } from 'react'
import {
  VStack,
  Image,
  Text,
  Center,
  Heading,
  ScrollView,
  useToast,
} from 'native-base'
import { useNavigation } from '@react-navigation/native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { AppError } from '@utils/AppError'

import { api } from '@services/api'
import { useAuth } from '@hooks/useAuth'

import LogoSvg from '@assets/logo.svg'
import BackgroundImg from '@assets/background.png'

import { KeyboardAvoidingView } from '@components/KeyboardAvoidingView'
import { Input } from '@components/Input'
import { Button } from '@components/Button'

const signUpSchema = z
  .object({
    name: z.string({ required_error: 'Informe o nome.' }),
    email: z
      .string({
        required_error: 'Informe o e-mail.',
      })
      .email({ message: 'E-mail inválido.' }),
    password: z
      .string({ required_error: 'Informe a senha.' })
      .min(6, 'A senha deve ter no mínimo 6 caracteres.'),
    passwordConfirm: z.string({
      required_error: 'Confirme a senha.',
    }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'As senhas devem ser iguais.',
    path: ['passwordConfirm'],
  })

type FormDataProps = z.infer<typeof signUpSchema>

export function SignUp() {
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormDataProps>({
    resolver: zodResolver(signUpSchema),
  })

  const navigation = useNavigation()
  const toast = useToast()

  function handleGoBack() {
    navigation.goBack()
  }

  async function handleSignUp({ name, email, password }: FormDataProps) {
    try {
      setIsLoading(true)

      await api.post('/users', {
        name,
        email,
        password,
      })

      await signIn(email, password)
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError
        ? error.message
        : 'Não foi possível criar a conta. Tente novamente mais tarde.'

      setIsLoading(false)

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      })
    }
  }

  return (
    <KeyboardAvoidingView>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <VStack flex={1} px={10}>
          <Image
            source={BackgroundImg}
            defaultSource={BackgroundImg}
            alt="Pessoas treinando na bicicleta"
            resizeMode="contain"
            position="absolute"
          />

          <Center my={24}>
            <LogoSvg />

            <Text color="gray.100" fontSize="sm">
              Treine sua mente e o seu corpo
            </Text>
          </Center>

          <Center>
            <Heading color="gray.100" fontFamily="heading" fontSize="xl" mb={6}>
              Crie sua conta
            </Heading>

            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Input
                  placeholder="Nome"
                  value={field.value}
                  onChangeText={field.onChange}
                  errorMessage={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Input
                  placeholder="E-mail"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={field.value}
                  onChangeText={field.onChange}
                  errorMessage={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <Input
                  placeholder="Senha"
                  secureTextEntry
                  value={field.value}
                  onChangeText={field.onChange}
                  errorMessage={errors.password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="passwordConfirm"
              render={({ field }) => (
                <Input
                  placeholder="Confirme a senha"
                  secureTextEntry
                  value={field.value}
                  onChangeText={field.onChange}
                  onSubmitEditing={handleSubmit(handleSignUp)}
                  errorMessage={errors.passwordConfirm?.message}
                />
              )}
            />

            <Button
              title="Criar e acessar"
              isLoading={isLoading}
              onPress={handleSubmit(handleSignUp)}
            />
          </Center>

          <Button
            title="Voltar para o login"
            variant="outline"
            mt={12}
            onPress={handleGoBack}
          />
        </VStack>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
