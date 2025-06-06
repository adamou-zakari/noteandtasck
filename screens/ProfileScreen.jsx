import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function ProfileScreen() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    bestScore: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    quizProgress: {},
    availableQuizzes: []
  });

  // Charger les scores à chaque fois que l'écran devient actif
  useFocusEffect(
    React.useCallback(() => {
      loadScores();
    }, [])
  );

  const loadScores = async () => {
    try {
      setLoading(true);
      const scoresJson = await AsyncStorage.getItem('quizScores');
      
      if (scoresJson) {
        const loadedScores = JSON.parse(scoresJson);
        
        // Convertir la date ISO en objet Date pour l'affichage
        const processedScores = loadedScores.map(score => ({
          ...score,
          createdAt: new Date(score.createdAt)
        }));
        
        setScores(processedScores);
        calculateStats(processedScores);
      } else {
        setScores([]);
        setStats({
          totalQuizzes: 0,
          averageScore: 0,
          bestScore: 0,
          totalQuestions: 0,
          correctAnswers: 0,
          quizProgress: {},
          availableQuizzes: []
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des scores:', error);
      Alert.alert('Erreur', 'Impossible de charger les scores');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (scoresData) => {
    if (scoresData.length === 0) {
      setStats({
        totalQuizzes: 0,
        averageScore: 0,
        bestScore: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        quizProgress: {},
        availableQuizzes: []
      });
      return;
    }

    const totalQuizzes = scoresData.length;
    const totalQuestions = scoresData.reduce((sum, score) => sum + score.totalQuestions, 0);
    const correctAnswers = scoresData.reduce((sum, score) => sum + score.score, 0);
    const averageScore = Math.round((correctAnswers / totalQuestions) * 100);
    const bestScore = Math.max(...scoresData.map(score => score.percentage));

    // 🔥 EXTRACTION AUTOMATIQUE DES QUIZ DISPONIBLES
    // On analyse les scores pour découvrir automatiquement quels quiz existent
    const discoveredQuizzes = {};
    
    scoresData.forEach(score => {
      if (!discoveredQuizzes[score.quizId]) {
        discoveredQuizzes[score.quizId] = {
          id: score.quizId,
          title: score.quizTitle,
          // Extraire le nom court du titre (enlever "Quiz X: ")
          shortTitle: score.quizTitle.replace(/^Quiz \d+:\s*/, '')
        };
      }
    });

    // Convertir en array et trier par ID
    const availableQuizzes = Object.values(discoveredQuizzes).sort((a, b) => a.id - b.id);

    // Calculer le progrès par quiz (meilleur score pour chaque quiz découvert)
    const quizProgress = {};
    availableQuizzes.forEach(quiz => {
      const quizScores = scoresData.filter(score => score.quizId === quiz.id);
      if (quizScores.length > 0) {
        const bestQuizScore = Math.max(...quizScores.map(score => score.percentage));
        quizProgress[quiz.id] = {
          completed: true,
          bestScore: bestQuizScore,
          attempts: quizScores.length,
          title: quiz.title,
          shortTitle: quiz.shortTitle
        };
      }
    });

    setStats({
      totalQuizzes,
      averageScore,
      bestScore,
      totalQuestions,
      correctAnswers,
      quizProgress,
      availableQuizzes
    });
  };

  const clearAllScores = () => {
    Alert.alert(
      "Confirmer la suppression",
      "Êtes-vous sûr de vouloir supprimer tous vos résultats ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('quizScores');
              setScores([]);
              setStats({
                totalQuizzes: 0,
                averageScore: 0,
                bestScore: 0,
                totalQuestions: 0,
                correctAnswers: 0,
                quizProgress: {},
                availableQuizzes: []
              });
              Alert.alert("Succès", "Tous les résultats ont été supprimés");
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert("Erreur", "Impossible de supprimer les résultats");
            }
          }
        }
      ]
    );
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return '#059669'; // Vert
    if (percentage >= 60) return '#D97706'; // Orange
    return '#DC2626'; // Rouge
  };

  const getScoreEmoji = (percentage) => {
    if (percentage >= 90) return '🏆';
    if (percentage >= 80) return '🥇';
    if (percentage >= 70) return '🥈';
    if (percentage >= 60) return '🥉';
    return '📚';
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return '#059669';
    if (percentage >= 60) return '#D97706';
    return '#DC2626';
  };

  const renderScoreItem = ({ item }) => (
    <View style={styles.scoreItem}>
      <View style={styles.scoreHeader}>
        <Text style={styles.scoreEmoji}>{getScoreEmoji(item.percentage)}</Text>
        <View style={styles.scoreInfo}>
          <Text style={styles.scoreQuizTitle}>{item.quizTitle}</Text>
          <Text style={[styles.scoreText, { color: getScoreColor(item.percentage) }]}>
            Score : {item.score}/{item.totalQuestions} ({item.percentage}%)
          </Text>
        </View>
      </View>
      <Text style={styles.dateText}>{item.completedAt}</Text>
    </View>
  );

  const renderProgressCard = () => {
    const completedQuizzes = Object.keys(stats.quizProgress).length;
    const totalQuizzes = stats.availableQuizzes.length;
    
    if (totalQuizzes === 0) return null;
    
    const completionPercentage = Math.round((completedQuizzes / totalQuizzes) * 100);

    return (
      <View style={styles.progressCard}>
        <Text style={styles.progressTitle}>🎯 Progression des Quiz</Text>
        <View style={styles.overallProgress}>
          <Text style={styles.progressText}>
            {completedQuizzes}/{totalQuizzes} quiz complétés ({completionPercentage}%)
          </Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${completionPercentage}%` }]} />
          </View>
        </View>
        
        <View style={styles.quizGrid}>
          {stats.availableQuizzes.map(quiz => {
            const progress = stats.quizProgress[quiz.id];
            return (
              <View key={quiz.id} style={styles.quizProgressItem}>
                <View style={styles.quizProgressHeader}>
                  <Text style={styles.quizNumber}>Q{quiz.id}</Text>
                  {progress && (
                    <Text style={[styles.quizScore, { color: getProgressColor(progress.bestScore) }]}>
                      {progress.bestScore}%
                    </Text>
                  )}
                </View>
                <Text style={styles.quizProgressTitle}>
                  {quiz.shortTitle}
                </Text>
                {progress ? (
                  <Text style={styles.attemptText}>
                    {progress.attempts} tentative{progress.attempts > 1 ? 's' : ''}
                  </Text>
                ) : (
                  <Text style={styles.notCompletedText}>Non fait</Text>
                )}
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderStatsCard = () => (
    <View style={styles.statsCard}>
      <Text style={styles.statsTitle}>📈 Statistiques globales</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalQuizzes}</Text>
          <Text style={styles.statLabel}>Tentatives totales</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.averageScore}%</Text>
          <Text style={styles.statLabel}>Moyenne générale</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.bestScore}%</Text>
          <Text style={styles.statLabel}>Meilleur score</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.correctAnswers}/{stats.totalQuestions}</Text>
          <Text style={styles.statLabel}>Bonnes réponses</Text>
        </View>
      </View>
    </View>
  );

  const renderDiscoveryInfo = () => {
    if (stats.availableQuizzes.length === 0) return null;
    
    return (
      <View style={styles.discoveryInfo}>
        <Text style={styles.discoveryText}>
          🔍 {stats.availableQuizzes.length} quiz découverts automatiquement
        </Text>
      </View>
    );
  };

  const renderHeader = () => (
    <View>
      <View style={styles.profileCard}>
        <Image source={require('../assets/profile.png')} style={styles.avatar} />
        <Text style={styles.name}>Utilisateur</Text>
        <Text style={styles.status}>👤 Mode invité</Text>
        <View style={styles.flags}>
          <Image source={require('../assets/aes.png')} style={styles.flag} resizeMode="contain" />
          <Image source={require('../assets/flag-niger.png')} style={styles.flag} resizeMode="contain" />
        </View>
      </View>

      {!loading && renderDiscoveryInfo()}
      {!loading && stats.availableQuizzes.length > 0 && renderProgressCard()}
      {!loading && stats.totalQuizzes > 0 && renderStatsCard()}

      <View style={styles.scoresHeader}>
        <Text style={styles.scoreTitle}>📊 Résultats récents</Text>
        {scores.length > 0 && (
          <TouchableOpacity onPress={clearAllScores} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>🗑️</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🎯</Text>
      <Text style={styles.noScore}>Aucun résultat disponible</Text>
      <Text style={styles.noScoreSubtext}>Complétez un quiz pour voir vos résultats ici !</Text>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#CAF0F8', '#0096C7']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0077B6" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#CAF0F8', '#0096C7']} style={styles.container}>
      <FlatList
        data={scores}
        keyExtractor={(item) => item.id}
        renderItem={renderScoreItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  flatListContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#0077B6',
    marginBottom: 15,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0077B6',
    marginBottom: 6,
  },
  status: {
    fontSize: 16,
    color: '#0096C7',
    marginBottom: 12,
  },
  flags: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  flag: {
    width: 80,
    height: 50,
    marginHorizontal: 10,
  },
  discoveryInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  discoveryText: {
    fontSize: 12,
    color: '#0077B6',
    fontStyle: 'italic',
  },
  progressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0077B6',
    textAlign: 'center',
    marginBottom: 15,
  },
  overallProgress: {
    marginBottom: 15,
  },
  progressText: {
    fontSize: 14,
    color: '#0077B6',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0F7FA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0077B6',
    borderRadius: 4,
  },
  quizGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quizProgressItem: {
    width: '48%',
    backgroundColor: 'rgba(224, 247, 250, 0.5)',
    borderRadius: 10,
    padding: 8,
    marginBottom: 8,
  },
  quizProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  quizNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0077B6',
  },
  quizScore: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  quizProgressTitle: {
    fontSize: 10,
    color: '#0077B6',
    marginBottom: 2,
    lineHeight: 12,
  },
  attemptText: {
    fontSize: 9,
    color: '#666',
    fontStyle: 'italic',
  },
  notCompletedText: {
    fontSize: 9,
    color: '#999',
    fontStyle: 'italic',
  },
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0077B6',
    textAlign: 'center',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0077B6',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  scoresHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  scoreTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0077B6',
  },
  clearButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
  },
  clearButtonText: {
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#0077B6',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 15,
  },
  noScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0077B6',
    textAlign: 'center',
    marginBottom: 8,
  },
  noScoreSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  scoreItem: {
    backgroundColor: 'rgba(224, 247, 250, 0.6)',
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    shadowColor: '#0096C7',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  scoreInfo: {
    flex: 1,
  },
  scoreQuizTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0077B6',
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 12,
    color: '#90E0EF',
    fontStyle: 'italic',
    textAlign: 'right',
  },
});