import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

export default function MenuScreen({ navigation }) {
  const menuItems = [
    {
      title: 'Écoute',
      icon: 'headphones',
      screen: 'Listen', // Vérifie que ce nom est correct dans App.js
      description: 'Écoute les phrases en Haoussa',
      gradient: ['#00b4d8', '#0077b6'],
    },
    {
      title: 'Répète',
      icon: 'record-voice-over',
      screen: 'Repeat',
      description: 'Entraîne-toi à répéter',
      gradient: ['#48cae4', '#00b4d8'],
    },
    {
      title: 'Quiz',
      icon: 'quiz',
      screen: 'Quiz', // Ici, corrige si besoin
      description: 'Teste tes connaissances',
      gradient: ['#90e0ef', '#48cae4'],
    },
    {
      title: 'Profil',
      icon: 'person',
      screen: 'Profile',
      description: 'Voir ton profil et progrès',
      gradient: ['#caf0f8', '#90e0ef'],
    },
  ];

  return (
    <LinearGradient colors={['#e0f7fa', '#dff6ff']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>🏠 Menu Principal</Text>
          <Text style={styles.subtitle}>
            Choisissez votre activité d'apprentissage
          </Text>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, index === menuItems.length - 1 && { marginBottom: 0 }]}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.8}
            >
              <LinearGradient colors={item.gradient} style={styles.menuGradient}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name={item.icon} size={32} color="#fff" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuDescription}>{item.description}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() =>
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              })
            }
            activeOpacity={0.7}
          >
            <MaterialIcons name="home" size={20} color="#0077b6" />
            <Text style={styles.logoutText}>Retour à l'accueil</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0077b6',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#00b4d8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  menuItem: {
    borderRadius: 20,
    shadowColor: '#0077b6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 16,
  },
  menuGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  menuTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  menuDescription: {
    color: '#ffffffcc',
    fontSize: 14,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffffcc',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    gap: 8,
  },
  logoutText: {
    color: '#0077b6',
    fontSize: 16,
    fontWeight: '600',
  },
});
