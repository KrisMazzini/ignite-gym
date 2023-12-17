import { Avatar, IAvatarProps } from 'native-base'

export function UserPhoto(props: IAvatarProps) {
  return (
    <Avatar bg="gray.600" borderWidth={2} borderColor="gray.400" {...props} />
  )
}
