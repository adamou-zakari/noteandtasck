import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const phrases = [
  { text: "Ina kwana?", audio: require('../assets/audio/Ina_Kwana.mp3') },
  { text: "Nagode", audio: require('../assets/audio/Na_gode.mp3') },
  { text: "Sannu", audio: require('../assets/audio/sannu.mp3') },
  // tu peux décommenter et ajouter plus ici
  // { text: "Yaya kake", audio: require('../assets/audio/Yaya_kake.mp3') },
  // { text: "Zan tafi", audio: require('../assets/audio/Zan_tafi.mp3') },
];

export default function RepeatScreen() {
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [hasRepeated, setHasRepeated] = useState(false);
  const [soundLoaded, setSoundLoaded] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const soundRef = useRef(null);

  useEffect(() => {
    // Configuration audio initiale
    setupAudio();
    
    return () => {
      // Cleanup lors du démontage du composant
      cleanupSound();
    };
  }, []);

  useEffect(() => {
    // Charger le son à chaque changement d'index
    if (soundRef.current) {
      loadSound();
    }
  }, [index]);

  const setupAudio = async () => {
    try {
      // Configuration du mode audio pour iOS
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      // Créer une nouvelle instance Sound
      soundRef.current = new Audio.Sound();
      loadSound();
    } catch (error) {
      console.error('Erreur setup audio:', error);
      Alert.alert('Erreur Audio', 'Impossible d\'initialiser l\'audio');
    }
  };

  const loadSound = async () => {
    if (!soundRef.current) return;
    
    try {
      setLoading(true);
      setSoundLoaded(false);
      
      // Décharger le son précédent s'il existe
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded) {
        await soundRef.current.unloadAsync();
      }

      // Charger le nouveau fichier audio
      await soundRef.current.loadAsync(phrases[index].audio, {
        shouldPlay: false,
        isLooping: false,
        volume: 1.0,
      });

      setSoundLoaded(true);
      setPlaying(false);
      setHasRepeated(false);

      // Configuration du callback de statut
      soundRef.current.setOnPlaybackStatusUpdate((playbackStatus) => {
        if (!playbackStatus.isLoaded) {
          return;
        }
        
        setPlaying(playbackStatus.isPlaying || false);
        
        if (playbackStatus.didJustFinish) {
          setPlaying(false);
        }
      });

    } catch (error) {
      console.error('Erreur chargement audio:', error);
      setSoundLoaded(false);
      
      // Message d'erreur plus spécifique
      let errorMessage = 'Impossible de charger ce fichier audio';
      if (error.message.includes('-11800')) {
        errorMessage = 'Format audio non supporté. Vérifiez que le fichier MP3 est valide.';
      } else if (error.message.includes('404') || error.message.includes('not found')) {
        errorMessage = 'Fichier audio introuvable. Vérifiez le chemin du fichier.';
      }
      
      Alert.alert('Erreur Audio', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const cleanupSound = async () => {
    try {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
        }
        soundRef.current = null;
      }
    } catch (error) {
      console.error('Erreur cleanup:', error);
    }
  };

  const playSound = async () => {
    if (!soundRef.current || !soundLoaded || loading) {
      Alert.alert('Audio non prêt', 'Veuillez attendre que l\'audio soit chargé');
      return;
    }

    try {
      // Animation du bouton
      Animated.sequence([
        Animated.spring(scaleAnim, { 
          toValue: 1.2, 
          useNativeDriver: true,
          tension: 100,
          friction: 3,
        }),
        Animated.spring(scaleAnim, { 
          toValue: 1, 
          useNativeDriver: true,
          tension: 100,
          friction: 3,
        }),
      ]).start();

      const status = await soundRef.current.getStatusAsync();
      
      if (!status.isLoaded) {
        Alert.alert('Erreur', 'Audio non chargé');
        return;
      }

      if (status.isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        // Remettre à zéro si la lecture est terminée
        if (status.didJustFinish) {
          await soundRef.current.setPositionAsync(0);
        }
        await soundRef.current.playAsync();
      }
    } catch (error) {
      console.error('Erreur lecture audio:', error);
      Alert.alert('Erreur Audio', 'Impossible de lire ce fichier audio');
    }
  };

  const handleRepeatPressed = () => {
    setHasRepeated(true);
    Alert.alert(
      "🎤 Répétez maintenant!",
      `Dites : "${phrases[index].text}"`,
      [
        { text: "J'ai répété!", onPress: () => {} },
        { text: "Rejouer l'audio", onPress: playSound }
      ]
    );
  };

  const nextPhrase = () => {
    if (index < phrases.length - 1) {
      setIndex(index + 1);
    }
  };

  const prevPhrase = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>{`Phrase ${index + 1} / ${phrases.length}`}</Text>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${((index + 1) / phrases.length) * 100}%` }]} />
      </View>

      <View style={styles.card}>
        <Text style={styles.phraseText}>{phrases[index].text}</Text>
      </View>

      <Animated.View style={[styles.playButtonWrapper, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          style={[
            styles.playButton, 
            playing ? styles.playing : null,
            loading ? styles.loading : null
          ]}
          onPress={playSound}
          activeOpacity={0.8}
          disabled={loading || !soundLoaded}
        >
          {loading ? (
            <MaterialIcons name="hourglass-empty" size={40} color="#fff" />
          ) : (
            <Ionicons
              name={playing ? "pause" : "play"}
              size={40}
              color="#fff"
            />
          )}
        </TouchableOpacity>
      </Animated.View>

      {loading && (
        <Text style={styles.loadingText}>Chargement de l'audio...</Text>
      )}

      <TouchableOpacity 
        onPress={handleRepeatPressed} 
        style={[styles.recButton, (!soundLoaded || loading) && styles.disabled]}
        disabled={!soundLoaded || loading}
      >
        <Text style={styles.recText}>🎤 Répéter</Text>
      </TouchableOpacity>

      {hasRepeated && (
        <Text style={styles.feedbackText}>
          ✅ Bien joué ! Continuez vers la phrase suivante
        </Text>
      )}

      <View style={styles.navigation}>
        <TouchableOpacity
          onPress={prevPhrase}
          disabled={index === 0}
          style={[styles.navButton, index === 0 && styles.navDisabled]}
        >
          <MaterialIcons name="navigate-before" size={48} color={index === 0 ? '#bbb' : '#0077b6'} />
        </TouchableOpacity>

        {index === phrases.length - 1 ? (
          <Text style={styles.congrats}>🎉 Bien joué !</Text>
        ) : (
          <TouchableOpacity
            onPress={nextPhrase}
            disabled={index === phrases.length - 1}
            style={[styles.navButton, index === phrases.length - 1 && styles.navDisabled]}
          >
            <MaterialIcons name="navigate-next" size={48} color={index === phrases.length - 1 ? '#bbb' : '#0077b6'} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          💡 La reconnaissance vocale nécessite un build personnalisé.
          {'\n'}En attendant, écoutez et répétez à voix haute !
        </Text>
      </View>

      {/* Debug info - à supprimer en production */}
      {__DEV__ && (
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6f0fa',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  progress: {
    fontSize: 18,
    color: '#555',
    marginBottom: 10,
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    width: '100%',
    backgroundColor: '#ccc',
    borderRadius: 10,
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0077b6',
    borderRadius: 10,
  },
  card: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 24,
    paddingVertical: 60,
    paddingHorizontal: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 30,
  },
  phraseText: {
    fontSize: 36,
    color: '#0077b6',
    fontWeight: '700',
    textAlign: 'center',
  },
  playButtonWrapper: {
    marginBottom: 20,
  },
  playButton: {
    backgroundColor: '#0077b6',
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0077b6',
    shadowOpacity: 0.7,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 8,
  },
  playing: {
    backgroundColor: '#0096c7',
  },
  loading: {
    backgroundColor: '#90e0ef',
  },
  loadingText: {
    fontSize: 14,
    color: '#0077b6',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  recButton: {
    backgroundColor: '#48cae4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 10,
  },
  recText: {
    color: 'white',
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  feedbackText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: 'green',
  },
  navigation: {
    flexDirection: 'row',
    width: '60%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    padding: 10,
  },
  navDisabled: {
    opacity: 0.4,
  },
  congrats: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#38b000',
    marginTop: 10,
  },
  infoBox: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffeaa7',
    width: '100%',
  },
  infoText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    lineHeight: 20,
  },
  debugInfo: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
  },
});