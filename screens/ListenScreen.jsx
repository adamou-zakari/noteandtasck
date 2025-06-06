import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

const phrases = [
  { id: '1', text: 'Ina kwana?', translation: 'Bonjour (le matin)', audio: require("../assets/audio/Ina_Kwana.mp3") },
  { id: '2', text: 'Ina yini?', translation: 'Comment vas-tu ?', audio: require('../assets/audio/Ina_yini.mp3') },
  { id: '3', text: 'Na gode', translation: 'Merci', audio: require('../assets/audio/Na_gode.mp3') },
  { id: '4', text: 'Sai anjima', translation: 'À plus tard', audio: require('../assets/audio/Sai_anjima.mp3') },
  { id: '5', text: 'Lafiya lau', translation: 'Tout va bien', audio: require('../assets/audio/Lafiya_lau.mp3') },
  { id: '6', text: 'Yaya gida?', translation: 'Comment va la maison ?', audio: require('../assets/audio/Yaya_gida.mp3') },
  { id: '7', text: 'Me ya faru?', translation: 'Que s\'est-il passé ?', audio: require('../assets/audio/Me_ya_faru.mp3') },
  { id: '8', text: 'Ina zuwa kasuwa', translation: 'Je vais au marché', audio: require('../assets/audio/Ina_zuwa_kasuwa.mp3') },
  { id: '9', text: 'Ka ci abinci?', translation: 'As-tu mangé ?', audio: require('../assets/audio/Ka_ci_abinci.mp3') },
  { id: '10', text: 'Ina son shayi', translation: 'J\'aime le thé', audio: require('../assets/audio/Ina_son_shayi.mp3') },
  { id: '11', text: 'Zan taimaka maka', translation: 'Je vais t\'aider', audio: require('../assets/audio/Zan_taimaka_maka.mp3') },
  { id: '12', text: 'Na yi kuskure', translation: 'J\'ai fait une erreur', audio: require('../assets/audio/Na_yi_kuskure.mp3') },
  { id: '13', text: 'Me kake so?', translation: 'Que veux-tu ?', audio: require('../assets/audio/Me_kake_so.mp3') },
  { id: '14', text: 'Ka ji dadin hutu', translation: 'Profite de tes vacances', audio: require('../assets/audio/Kaji_dadin_hutu.mp3') },
  { id: '15', text: 'Allah ya taimaka', translation: 'Que Dieu t\'aide', audio: require('../assets/audio/Allah_ya_taimaka.mp3') },
];

export default function ListenScreen({ navigation }) {
  const [player, setPlayer] = useState(null);
  const [currentPlayingId, setCurrentPlayingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [audioConfigured, setAudioConfigured] = useState(false);

  useEffect(() => {
    const configureAudio = async () => {
      try {
        // Configuration audio corrigée avec les bonnes constantes
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          interruptionModeIOS: Audio.InterruptionModeIOS.DuckOthers,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: Audio.InterruptionModeAndroid.DuckOthers,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: false,
        });
        setAudioConfigured(true);
        console.log('Configuration audio réussie');
      } catch (error) {
        console.log('Audio configuration error:', error);
        // Même en cas d'erreur de configuration, on peut essayer de jouer
        setAudioConfigured(true);
      }
    };

    configureAudio();

    return () => {
      if (player) {
        player.unloadAsync().catch(console.error);
      }
    };
  }, []);

  const playSound = async (item) => {
    if (!audioConfigured) {
      Alert.alert('Audio non configuré', 'Veuillez attendre la configuration audio');
      return;
    }

    try {
      setIsLoading(true);

      // Arrêter et nettoyer le lecteur précédent
      if (player) {
        await player.unloadAsync();
        setPlayer(null);
        setCurrentPlayingId(null);
      }

      // Si on clique sur le même élément, on arrête juste la lecture
      if (currentPlayingId === item.id) {
        setIsLoading(false);
        return;
      }

      // Créer un nouveau lecteur avec une configuration robuste
      const { sound: newPlayer } = await Audio.Sound.createAsync(
        item.audio,
        { 
          shouldPlay: true, 
          volume: 1.0,
          rate: 1.0,
          shouldCorrectPitch: true,
          progressUpdateIntervalMillis: 100,
        },
        (status) => {
          if (status.isLoaded) {
            if (status.didJustFinish) {
              setCurrentPlayingId(null);
              setPlayer(null);
            }
            if (status.error) {
              console.error('Erreur de lecture:', status.error);
              setCurrentPlayingId(null);
              setPlayer(null);
            }
          }
        }
      );

      setPlayer(newPlayer);
      setCurrentPlayingId(item.id);
      setIsLoading(false);
      
    } catch (error) {
      console.error('Audio playback error:', error);
      setIsLoading(false);
      setCurrentPlayingId(null);

      let errorMessage = 'Impossible de lire ce fichier audio.';
      
      // Messages d'erreur plus spécifiques
      if (error.message.includes('-11800')) {
        errorMessage = 'Format audio non supporté. Vérifiez que le fichier MP3 est valide.';
      } else if (error.message.includes('AVPlayerItem')) {
        errorMessage = 'Fichier audio introuvable ou corrompu.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Problème de réseau. Vérifiez votre connexion.';
      } else if (error.message.includes('permission')) {
        errorMessage = 'Problème de permissions audio.';
      }

      Alert.alert(
        'Erreur Audio', 
        `${errorMessage}\n\nPhrase: ${item.text}`,
        [
          { text: 'OK', style: 'default' },
          { 
            text: 'Réessayer', 
            style: 'default',
            onPress: () => setTimeout(() => playSound(item), 500)
          }
        ]
      );
    }
  };

  const stopAllAudio = async () => {
    if (player) {
      try {
        await player.stopAsync();
        await player.unloadAsync();
      } catch (error) {
        console.error('Erreur lors de l\'arrêt du son:', error);
      }
      setPlayer(null);
      setCurrentPlayingId(null);
    }
  };

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const renderItem = ({ item }) => {
    const isPlaying = item.id === currentPlayingId;
    const isLoadingThis = isLoading && item.id === currentPlayingId;

    return (
      <TouchableOpacity
        style={[styles.card, isPlaying && styles.playingCard]}
        onPress={() => playSound(item)}
        activeOpacity={0.8}
        disabled={isLoading}
      >
        <LinearGradient
          colors={isPlaying ? ['#00d4aa', '#00b4d8'] : ['#00b4d8', '#0077b6']}
          style={styles.gradient}
        >
          <View style={styles.iconContainer}>
            <MaterialIcons
              name={isLoadingThis ? 'hourglass-empty' : (isPlaying ? 'pause' : 'volume-up')}
              size={26}
              color="white"
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.hausaText}>{item.text}</Text>
            <Text style={styles.translation}>{item.translation}</Text>
          </View>
          <View style={styles.statusContainer}>
            {isPlaying && !isLoadingThis && (
              <View style={styles.playingIndicator}>
                <View style={[styles.dot, styles.dot1]} />
                <View style={[styles.dot, styles.dot2]} />
                <View style={[styles.dot, styles.dot3]} />
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#e0f7fa', '#caf0f8']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              stopAllAudio().then(() => navigation.goBack());
            }}
          >
            <MaterialIcons name="arrow-back" size={24} color="#0077b6" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>🎧 Écoute et répète</Text>
            <Text style={styles.subtitle}>Appuyez sur une phrase pour l'écouter</Text>
          </View>
          {currentPlayingId && (
            <TouchableOpacity
              style={styles.stopButton}
              onPress={stopAllAudio}
            >
              <MaterialIcons name="stop" size={24} color="#0077b6" />
            </TouchableOpacity>
          )}
        </View>

        {!audioConfigured && (
          <View style={styles.configWarning}>
            <Text style={styles.configWarningText}>
              ⚠️ Configuration audio en cours...
            </Text>
          </View>
        )}

        <FlatList
          data={phrases}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffffcc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stopButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffffcc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: { flex: 1 },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#023e8a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#0077b6',
    fontWeight: '500',
  },
  configWarning: {
    backgroundColor: '#fff3cd',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  configWarningText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    marginVertical: 8,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#00000044',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  playingCard: {
    elevation: 10,
    shadowColor: '#00b4d8',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  hausaText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
  },
  translation: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a0e7e5',
    marginTop: 4,
  },
  statusContainer: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playingIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 24,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffffcc',
    opacity: 0.8,
  },
  dot1: { opacity: 1 },
  dot2: { opacity: 0.6 },
  dot3: { opacity: 0.4 },
});