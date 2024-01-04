import { ReactNode } from 'react'
import { Platform } from 'react-native'
import { KeyboardAvoidingView as NativeBaseKeyboardAvoidingView } from 'native-base'

type KeyboardAvoidingViewProps = {
  children: ReactNode
}

export function KeyboardAvoidingView({ children }: KeyboardAvoidingViewProps) {
  return Platform.OS === 'ios' ? (
    <NativeBaseKeyboardAvoidingView behavior="padding" flex={1}>
      {children}
    </NativeBaseKeyboardAvoidingView>
  ) : (
    <>{children}</>
  )
}
