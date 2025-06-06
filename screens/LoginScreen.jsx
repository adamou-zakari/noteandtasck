import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.replace("Menu");
    } catch (error) {
      console.log('Erreur de connexion:', error);
      
      let errorMessage = "Une erreur s'est produite. Veuillez réessayer.";
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = "Aucun compte trouvé avec cet email.";
          break;
        case 'auth/wrong-password':
          errorMessage = "Mot de passe incorrect.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Format d'email invalide.";
          break;
        case 'auth/user-disabled':
          errorMessage = "Ce compte a été désactivé.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Trop de tentatives. Veuillez réessayer plus tard.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Erreur de connexion. Vérifiez votre internet.";
          break;
        default:
          errorMessage = "Email ou mot de passe incorrect.";
      }
      
      Alert.alert("Échec de connexion", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Connexion</Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
      />
      
      <TextInput
        placeholder="Mot de passe"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Se connecter</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => navigation.navigate("Register")}
        disabled={loading}
      >
        <Text style={[styles.link, loading && styles.linkDisabled]}>
          Pas encore de compte ? S'inscrire
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#b3e5fc',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 30,
    borderRadius: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#01579b',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#0288d1',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#90CAF9',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 15,
    color: '#01579b',
    textDecorationLine: 'underline',
    fontSize: 16,
  },
  linkDisabled: {
    opacity: 0.5,
  },
});