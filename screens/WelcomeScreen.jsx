import React from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const navigation = useNavigation();

  return (
    <LinearGradient colors={['#B3E5FC', '#E1F5FE']} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
          />
        </View>

        <Text style={styles.title}>LingoLocal</Text>

        <View style={styles.taglineBox}>
          <Text style={styles.tagline}>
            Apprendre le <Text style={styles.highlight}>Haoussa</Text> facilement
          </Text>
        </View>

        <View style={styles.welcomeBox}>
          <Text style={styles.welcomeText}>
            Bienvenue dans <Text style={styles.highlight}>LingoLocal</Text> !
          </Text>
          <Text style={styles.welcomeSubText}>
            Votre compagnon pour apprendre le haoussa de manière simple, rapide et amusante.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate('Menu')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>🚀 Commencer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: height * 0.1,
  },
  logoContainer: {
    marginBottom: 25,
    shadowColor: '#0077b6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#ffffff50',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0077b6',
    marginBottom: 10,
  },
  taglineBox: {
    backgroundColor: '#ffffffcc',
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tagline: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
    lineHeight: 24,
  },
  highlight: {
    fontWeight: 'bold',
    color: '#0077b6',
  },
  welcomeBox: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#023e8a',
    textAlign: 'center',
    marginBottom: 10,
  },
  welcomeSubText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  primaryButton: {
    backgroundColor: '#0096c7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
