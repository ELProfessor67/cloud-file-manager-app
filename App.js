import { View, Text } from 'react-native'
import React from 'react'
import Main from './src/Main'
import { StackProvider } from './src/providers/StackProvider'

const App = () => {
  return (
    <StackProvider>
      <Main/>
    </StackProvider>
  )
}

export default App