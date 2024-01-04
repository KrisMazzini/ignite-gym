import { TouchableOpacity, TouchableOpacityProps } from 'react-native'
import { HStack, Heading, Icon, Image, Text, VStack } from 'native-base'
import { Entypo } from '@expo/vector-icons'

import { api } from '@services/api'
import { ExerciseDTO } from '@dtos/ExerciseDTO'

interface ExerciseCardProps extends TouchableOpacityProps {
  data: ExerciseDTO
}

export function ExerciseCard({ data, ...props }: ExerciseCardProps) {
  return (
    <TouchableOpacity {...props}>
      <HStack
        bg="gray.500"
        alignItems="center"
        mb={3}
        p={2}
        pr={4}
        rounded="md"
      >
        <Image
          source={{
            uri: `${api.defaults.baseURL}/exercise/thumb/${data.thumb}`,
          }}
          alt="Imagem do exercício"
          w={16}
          h={16}
          mr={4}
          rounded="md"
          resizeMode="cover"
        />

        <VStack flex={1}>
          <Heading fontSize="lg" color="white" fontFamily="heading">
            {data.name}
          </Heading>

          <Text fontSize="sm" color="gray.200" mt={1} numberOfLines={2}>
            {data.series} séries x {data.repetitions} repetições
          </Text>
        </VStack>

        <Icon as={Entypo} name="chevron-thin-right" color="gray.300" />
      </HStack>
    </TouchableOpacity>
  )
}
