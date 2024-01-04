import { useCallback, useEffect, useState } from 'react'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { FlatList, HStack, Heading, Text, VStack, useToast } from 'native-base'

import { api } from '@services/api'
import { AppError } from '@utils/AppError'
import { ExerciseDTO } from '@dtos/ExerciseDTO'

import { HomeHeader } from '@components/HomeHeader'
import { Group } from '@components/Group'
import { ExerciseCard } from '@components/ExerciseCard'

import { AppNavigatorRoutesProps } from '@routes/app.routes'
import { Loading } from '@components/Loading'

export function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [groups, setGroups] = useState<string[]>([])
  const [exercises, setExercises] = useState<ExerciseDTO[]>([])
  const [selectedGroup, setSelectedGroup] = useState('')

  const toast = useToast()
  const navigation = useNavigation<AppNavigatorRoutesProps>()

  function handleOpenExerciseDetails(exerciseId: number) {
    navigation.navigate('exercise', { exerciseId })
  }

  useEffect(() => {
    async function fetchGroups() {
      try {
        const { data } = await api.get('/groups')
        setGroups(data)
      } catch (error) {
        const isAppError = error instanceof AppError
        const title = isAppError
          ? error.message
          : 'Não foi possível carregar os grupos musculares.'

        toast.show({
          title,
          placement: 'top',
          bgColor: 'red.500',
        })
      }
    }

    fetchGroups()
  }, [toast])

  useFocusEffect(
    useCallback(() => {
      async function fetchExercisesByGroup() {
        try {
          setIsLoading(true)

          const { data } = await api.get(`/exercises/bygroup/${selectedGroup}`)
          setExercises(data)
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

      fetchExercisesByGroup()
    }, [toast, selectedGroup]),
  )

  return (
    <VStack flex={1}>
      <HomeHeader />

      <FlatList
        horizontal
        data={groups}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <Group
            name={item}
            isActive={selectedGroup.toLowerCase() === item.toLowerCase()}
            onPress={() => setSelectedGroup(item)}
          />
        )}
        my={10}
        _contentContainerStyle={{ px: 8 }}
        minH={10}
        maxH={10}
      />

      {isLoading ? (
        <Loading />
      ) : (
        <VStack flex={1} px={8}>
          <HStack space={2} justifyContent="space-between" mb={5}>
            <Heading color="gray.200" fontSize="md" fontFamily="heading">
              Exercícios
            </Heading>

            <Text color="gray.200" fontSize="sm">
              {exercises.length}
            </Text>
          </HStack>

          <FlatList
            data={exercises}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <ExerciseCard
                data={item}
                onPress={() => handleOpenExerciseDetails(item.id)}
              />
            )}
            showsVerticalScrollIndicator={false}
            _contentContainerStyle={{ pb: 20 }}
          />
        </VStack>
      )}
    </VStack>
  )
}
