import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Succès", "Compte créé avec succès !");
      navigation.replace('Menu');
    } catch (error) {
      Alert.alert("Erreur", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Créer un compte</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <TextInput
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>S'inscrire</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Vous avez déjà un compte ? Connectez-vous</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#cceeff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#0077cc',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  link: {
    color: '#0077cc',
    marginTop: 10,
  },
});
