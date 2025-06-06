import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from './screens/WelcomeScreen';
import MenuScreen from './screens/MenuScreen';
import ListenScreen from './screens/ListenScreen';
import RepeatScreen from './screens/RepeatScreen';
import QuizScreen from './screens/QuizScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Menu" component={MenuScreen} />
        {/* Ajoute d'autres écrans ici */}
         {/* Assurez-vous que ces écrans existent dans le dossier screens */} 
       <Stack.Screen name="Listen" component={ListenScreen} /> 
         <Stack.Screen name="Repeat" component={RepeatScreen} /> 
         <Stack.Screen name="Quiz" component={QuizScreen} /> 
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
        