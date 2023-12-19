import { useState } from 'react'
import { FlatList, HStack, Heading, Text, VStack } from 'native-base'
import { useNavigation } from '@react-navigation/native'

import { HomeHeader } from '@components/HomeHeader'
import { Group } from '@components/Group'
import { ExerciseCard } from '@components/ExerciseCard'

import { AppNavigatorRoutesProps } from '@routes/app.routes'

export function Home() {
  const [groups, setGroups] = useState([
    'Costas',
    'Bíceps',
    'Tríceps',
    'Ombros',
  ])

  const [exercises, setExercises] = useState([
    'Puxada frontal',
    'Remada curvada',
    'Remada unilateral',
    'Levantamento terra',
    'Rosca direta',
    'Rosca alternada',
    'Rosca concentrada',
    'Tríceps pulley',
    'Tríceps testa',
    'Tríceps corda',
    'Desenvolvimento militar',
    'Elevação lateral',
    'Elevação frontal',
    'Elevação posterior',
  ])

  const [selectedGroup, setSelectedGroup] = useState('Costas')

  const navigation = useNavigation<AppNavigatorRoutesProps>()

  function handleOpenExerciseDetails() {
    navigation.navigate('exercise')
  }

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

      <VStack flex={1} px={8}>
        <HStack space={2} justifyContent="space-between" mb={5}>
          <Heading color="gray.200" fontSize="md">
            Exercícios
          </Heading>

          <Text color="gray.200" fontSize="sm">
            {exercises.length}
          </Text>
        </HStack>

        <FlatList
          data={exercises}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <ExerciseCard name={item} onPress={handleOpenExerciseDetails} />
          )}
          showsVerticalScrollIndicator={false}
          _contentContainerStyle={{ pb: 20 }}
        />
      </VStack>
    </VStack>
  )
}
