import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Button, Text } from 'react-native';
import Home from './screens/Home';
import Storage from './screens/Storage';
import Files from './screens/Files';
import Transcrive from './screens/Transcrive';
import FileText from './screens/FileText';

const Stack = createNativeStackNavigator();



const Main = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ headerShown: false }}
        />


        <Stack.Screen
          name="Storage"
          component={Storage}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Files"
          component={Files}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Transcribe"
          component={Transcrive}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FileText"
          component={FileText}
          options={{ headerShown: false }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Main