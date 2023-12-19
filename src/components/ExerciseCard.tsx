import { TouchableOpacity, TouchableOpacityProps } from 'react-native'
import { HStack, Heading, Icon, Image, Text, VStack } from 'native-base'
import { Entypo } from '@expo/vector-icons'

interface ExerciseCardProps extends TouchableOpacityProps {
  name: string
}

export function ExerciseCard({ name, ...props }: ExerciseCardProps) {
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
            uri: 'https://www.smartfit.com.br/news/wp-content/uploads/2016/06/supino-reto.jpg',
          }}
          alt="Imagem do exercício"
          w={16}
          h={16}
          mr={4}
          rounded="md"
          resizeMode="cover"
        />

        <VStack flex={1}>
          <Heading fontSize="lg" color="white">
            {name}
          </Heading>

          <Text fontSize="sm" color="gray.200" mt={1} numberOfLines={2}>
            3 séries x 12 repetições
          </Text>
        </VStack>

        <Icon as={Entypo} name="chevron-thin-right" color="gray.300" />
      </HStack>
    </TouchableOpacity>
  )
}
