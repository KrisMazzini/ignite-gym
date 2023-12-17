import { IPressableProps, Pressable, Text } from 'native-base'

interface GroupProps extends IPressableProps {
  name: string
  isActive?: boolean
}

export function Group({ name, isActive = false, ...props }: GroupProps) {
  return (
    <Pressable
      mr={3}
      w={24}
      h={10}
      px={2}
      bg="gray.600"
      rounded="md"
      justifyContent="center"
      alignItems="center"
      overflow="hidden"
      isPressed={isActive}
      _pressed={{
        borderColor: 'green.500',
        borderWidth: 1,
      }}
      {...props}
    >
      <Text
        color={isActive ? 'green.500' : 'gray.200'}
        textTransform="uppercase"
        fontSize="xs"
        fontFamily="heading"
        numberOfLines={1}
      >
        {name}
      </Text>
    </Pressable>
  )
}
