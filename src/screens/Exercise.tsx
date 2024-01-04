import { useCallback, useState } from 'react'
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native'
import { TouchableOpacity } from 'react-native'
import {
  Box,
  HStack,
  Heading,
  Icon,
  Image,
  ScrollView,
  Text,
  VStack,
  useToast,
} from 'native-base'
import { Feather } from '@expo/vector-icons'

import BodySvg from '@assets/body.svg'
import SeriesSvg from '@assets/series.svg'
import RepetitionsSvg from '@assets/repetitions.svg'

import { api } from '@services/api'
import { AppError } from '@utils/AppError'
import { ExerciseDTO } from '@dtos/ExerciseDTO'

import { Button } from '@components/Button'
import { AppNavigatorRoutesProps } from '@routes/app.routes'
import { Loading } from '@components/Loading'

type RouteParamsProps = {
  exerciseId: number
}

export function Exercise() {
  const [isLoading, setIsLoading] = useState(true)
  const [exercise, setExercise] = useState<ExerciseDTO>({} as ExerciseDTO)

  const route = useRoute()
  const navigation = useNavigation<AppNavigatorRoutesProps>()
  const toast = useToast()

  const { exerciseId } = route.params as RouteParamsProps

  function handleGoBack() {
    navigation.goBack()
  }

  useFocusEffect(
    useCallback(() => {
      async function fetchExerciseDetails() {
        try {
          setIsLoading(true)
          const { data } = await api.get(`/exercises/${exerciseId}`)
          setExercise(data)
        } catch (error) {
          const isAppError = error instanceof AppError
          const title = isAppError
            ? error.message
            : 'Não foi possível carregar os exercícios.'

          toast.show({
            title,
            placement: 'top',
            bgColor: 'red.500',
          })
        } finally {
          setIsLoading(false)
        }
      }

      fetchExerciseDetails()
    }, [toast, exerciseId]),
  )

  return (
    <VStack flex={1}>
      <VStack px={8} bg="gray.600" pt={12}>
        <TouchableOpacity onPress={handleGoBack}>
          <Icon as={Feather} name="arrow-left" color="green.500" size={6} />
        </TouchableOpacity>

        <HStack
          justifyContent="space-between"
          mt={4}
          mb={8}
          alignItems="center"
        >
          <Heading
            color="gray.100"
            fontSize="lg"
            fontFamily="heading"
            flexShrink={1}
          >
            {exercise.name}
          </Heading>

          <HStack alignItems="center">
            <BodySvg />
            <Text color="gray.200" ml={1} textTransform="capitalize">
              {exercise.group}
            </Text>
          </HStack>
        </HStack>
      </VStack>

      {isLoading ? (
        <Loading />
      ) : (
        <ScrollView>
          <VStack p={8}>
            <Box rounded="lg" overflow="hidden">
              <Image
                w="full"
                h={80}
                source={{
                  uri: `${api.defaults.baseURL}/exercise/demo/${exercise.demo}`,
                }}
                alt="Imagem do exercício"
                mb={3}
                resizeMode="cover"
                rounded="lg"
              />
            </Box>

            <Box bg="gray.600" rounded="md" pb={4} px={4}>
              <HStack
                alignItems="center"
                justifyContent="space-around"
                mt={5}
                mb={6}
              >
                <HStack alignItems="center">
                  <SeriesSvg />
                  <Text color="gray.200" ml={2}>
                    {exercise.series} séries
                  </Text>
                </HStack>

                <HStack alignItems="center">
                  <RepetitionsSvg />
                  <Text color="gray.200" ml={2}>
                    {exercise.repetitions} repetições
                  </Text>
                </HStack>
              </HStack>

              <Button title="Marcar como realizado" />
            </Box>
          </VStack>
        </ScrollView>
      )}
    </VStack>
  )
}
