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
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { AuthNavigatorRoutesProps } from '@routes/auth.routes'

import { AppError } from '@utils/AppError'
import { useAuth } from '@hooks/useAuth'

import LogoSvg from '@assets/logo.svg'
import BackgroundImg from '@assets/background.png'

import { KeyboardAvoidingView } from '@components/KeyboardAvoidingView'
import { Input } from '@components/Input'
import { Button } from '@components/Button'

const signUpSchema = z.object({
  email: z
    .string({
      required_error: 'Informe o e-mail.',
    })
    .email({ message: 'E-mail inválido.' }),
  password: z
    .string({ required_error: 'Informe a senha.' })
    .min(6, 'A senha deve ter no mínimo 6 caracteres.'),
})

type FormDataProps = z.infer<typeof signUpSchema>

export function SignIn() {
  const [isLoading, setIsLoading] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormDataProps>({
    resolver: zodResolver(signUpSchema),
  })

  const toast = useToast()
  const { signIn } = useAuth()

  const navigation = useNavigation<AuthNavigatorRoutesProps>()

  function handleNewAccount() {
    navigation.navigate('signUp')
  }

  async function handleSignIn({ email, password }: FormDataProps) {
    try {
      setIsLoading(true)
      await signIn(email, password)
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError
        ? error.message
        : 'Erro ao fazer login. Tente novamente mais tarde.'

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
              Acesse sua conta
            </Heading>

            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Input
                  placeholder="E-mail"
                  keyboardType="email-address"
                  autoCapitalize="none"
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
                  onChangeText={field.onChange}
                  errorMessage={errors.password?.message}
                />
              )}
            />

            <Button
              title="Acessar"
              onPress={handleSubmit(handleSignIn)}
              isLoading={isLoading}
            />
          </Center>

          <Center mt={24}>
            <Text color="gray.100" fontSize="sm" mb={3} fontFamily="body">
              Ainda não tem acesso?
            </Text>

            <Button
              title="Criar conta"
              variant="outline"
              onPress={handleNewAccount}
            />
          </Center>
        </VStack>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
