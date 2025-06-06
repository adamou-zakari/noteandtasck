// QuizScreen.js (Version avec sauvegarde des scores)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const quizzes = [
  {
    id: 1,
    title: "Quiz 1: Salutations en Haoussa",
    data: [
      { question: "Que veut dire 'Ina kwana' ?", options: ["Bonsoir", "Bonjour (matin)", "Merci"], correct: 1 },
      { question: "Que veut dire 'Nagode' ?", options: ["Merci", "Au revoir", "Bonjour"], correct: 0 },
      { question: "Comment dit-on 'Comment ça va?' en Haoussa?", options: ["Yaya lafiya", "Kana lafiya", "Lahiya lau"], correct: 0 }
    ]
  },
  {
    id: 2,
    title: "Quiz 2: Expressions courantes",
    data: [
      { question: "Que veut dire 'Barka da yamma' ?", options: ["Bonsoir", "Bonjour", "Merci"], correct: 0 },
      { question: "Que veut dire 'Sannu' ?", options: ["Salut", "Merci", "Au revoir"], correct: 0 },
      { question: "Comment dit-on 'À demain' en Haoussa?", options: ["Sai anjima", "Sai gobe", "Sai wata rana"], correct: 1 }
    ]
  },
  {
    id: 3,
    title: "Quiz 3: Chiffres et nombres",
    data: [
      { question: "Comment dit-on 'un' en Haoussa?", options: ["Daya", "Biyu", "Uku"], correct: 0 },
      { question: "Comment dit-on 'cinq' en Haoussa?", options: ["Hudu", "Biyar", "Shida"], correct: 1 },
      { question: "Comment dit-on 'dix' en Haoussa?", options: ["Tara", "Goma", "Ashirin"], correct: 1 }
    ]
  },
  {
    id: 4,
    title: "Quiz 4: Couleurs",
    data: [
      { question: "Comment dit-on 'rouge' en Haoussa?", options: ["Ja", "Baki", "Fari"], correct: 0 },
      { question: "Comment dit-on 'noir' en Haoussa?", options: ["Kore", "Rawaya", "Baki"], correct: 2 },
      { question: "Comment dit-on 'bleu' en Haoussa?", options: ["Shuɗi", "Ja", "Ruwan sama"], correct: 2 }
    ]
  },
  {
    id: 5,
    title: "Quiz 5: Les animaux",
    data: [
      { question: "Comment dit-on 'chien' en Haoussa ?", options: ["Kare", "Zaki", "Doki"], correct: 0 },
      { question: "Comment dit-on 'chat' en Haoussa ?", options: ["Mage", "Kyanwa", "Kaji"], correct: 1 },
      { question: "Comment dit-on 'cheval' en Haoussa ?", options: ["Doki", "Zaki", "Kaji"], correct: 0 }
    ]
  },
  {
    id: 6,
    title: "Quiz 6: La nourriture",
    data: [
      { question: "Comment dit-on 'riz' en Haoussa ?", options: ["Shinkafa", "Kayan gwari", "Koko"], correct: 0 },
      { question: "Comment dit-on 'pain' en Haoussa ?", options: ["Burodi", "Fura", "Kayan marmari"], correct: 0 },
      { question: "Comment dit-on 'poulet' en Haoussa ?", options: ["Kaji", "Zaki", "Kare"], correct: 0 }
    ]
  },
   {
    id: 7,
    title: "Quiz 7: Les parties du corps",
    data: [
      { question: "Comment dit-on 'main' en Haoussa ?", options: ["Hannu", "Kafa", "Ido"], correct: 0 },
      { question: "Comment dit-on 'pied' en Haoussa ?", options: ["Kafa", "Hannu", "Goshi"], correct: 0 },
      { question: "Comment dit-on 'œil' en Haoussa ?", options: ["Ido", "Baki", "Hannu"], correct: 0 }
    ]
  }
];

export default function QuizScreen() {
  const [state, setState] = useState({
    quizIndex: 0,
    questionIndex: 0,
    score: 0,
    showResult: false,
    lastAnswerCorrect: null,
    correctAnswer: "",
    showQuizComplete: false,
    allQuizzesCompleted: false
  });

  const currentQuiz = quizzes[state.quizIndex];
  const currentQuestion = currentQuiz.data[state.questionIndex];
  const isLastQuestion = state.questionIndex === currentQuiz.data.length - 1;
  const isLastQuiz = state.quizIndex === quizzes.length - 1;

  const quizThemes = ['#48CAE4', '#0077B6', '#90E0EF', '#80FFDB'];
  const currentTheme = quizThemes[state.quizIndex];

  useEffect(() => {
    let timer;
    if (state.showQuizComplete && !isLastQuiz) {
      timer = setTimeout(() => {
        goToNextQuiz();
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [state.showQuizComplete, isLastQuiz]);

  const saveQuizScore = async () => {
    try {
      // Créer l'objet score
      const scoreData = {
        id: Date.now().toString(), // ID unique basé sur le timestamp
        quizId: currentQuiz.id,
        quizTitle: currentQuiz.title,
        score: state.score,
        totalQuestions: currentQuiz.data.length,
        percentage: Math.round((state.score / currentQuiz.data.length) * 100),
        createdAt: new Date().toISOString(), // Format ISO pour la sérialisation
        completedAt: new Date().toLocaleDateString('fr-FR')
      };

      // Récupérer les scores existants
      const existingScoresJson = await AsyncStorage.getItem('quizScores');
      let existingScores = [];
      
      if (existingScoresJson) {
        existingScores = JSON.parse(existingScoresJson);
      }

      // Ajouter le nouveau score au début de la liste
      const updatedScores = [scoreData, ...existingScores];

      // Limiter à 20 scores maximum pour éviter de surcharger le stockage
      if (updatedScores.length > 20) {
        updatedScores.splice(20);
      }

      // Sauvegarder la liste mise à jour
      await AsyncStorage.setItem('quizScores', JSON.stringify(updatedScores));

      console.log(`Score sauvegardé: ${state.score}/${currentQuiz.data.length} pour ${currentQuiz.title}`);
      
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du score :", error);
      // On peut afficher une alerte ou juste logger l'erreur
      Alert.alert("Erreur", "Impossible de sauvegarder le score");
    }
  };

  const handleAnswer = (selected) => {
    const isCorrect = selected === currentQuestion.correct;
    setState(prev => ({
      ...prev,
      lastAnswerCorrect: isCorrect,
      correctAnswer: currentQuestion.options[currentQuestion.correct],
      showResult: true,
      score: isCorrect ? prev.score + 1 : prev.score
    }));
  };

  const nextQuestion = async () => {
    if (!isLastQuestion) {
      setState(prev => ({
        ...prev,
        questionIndex: prev.questionIndex + 1,
        showResult: false
      }));
    } else {
      await saveQuizScore();
      setState(prev => ({
        ...prev,
        showQuizComplete: true,
        showResult: false
      }));
    }
  };

  const goToNextQuiz = () => {
    if (!isLastQuiz) {
      setState({
        quizIndex: state.quizIndex + 1,
        questionIndex: 0,
        score: 0,
        showResult: false,
        lastAnswerCorrect: null,
        correctAnswer: "",
        showQuizComplete: false,
        allQuizzesCompleted: false
      });
    } else {
      setState(prev => ({
        ...prev,
        showQuizComplete: false,
        allQuizzesCompleted: true
      }));
    }
  };

  const restartCurrentQuiz = () => {
    setState(prev => ({
      ...prev,
      questionIndex: 0,
      score: 0,
      showResult: false,
      showQuizComplete: false,
      lastAnswerCorrect: null,
      correctAnswer: ""
    }));
  };

  const restartAllQuizzes = () => {
    setState({
      quizIndex: 0,
      questionIndex: 0,
      score: 0,
      showResult: false,
      lastAnswerCorrect: null,
      correctAnswer: "",
      showQuizComplete: false,
      allQuizzesCompleted: false
    });
  };

  const handleBack = () => {
    if (state.showResult) {
      setState(prev => ({ ...prev, showResult: false }));
    } else if (state.showQuizComplete) {
      setState(prev => ({ ...prev, showQuizComplete: false }));
    } else if (state.questionIndex > 0) {
      setState(prev => ({ ...prev, questionIndex: prev.questionIndex - 1 }));
    } else if (state.quizIndex > 0) {
      setState(prev => ({
        ...prev,
        quizIndex: prev.quizIndex - 1,
        questionIndex: 0,
        score: 0
      }));
    }
  };

  if (state.allQuizzesCompleted) {
    return (
      <View style={[styles.container, { backgroundColor: '#0077B6' }]}>
        <View style={styles.completionContainer}>
          <Text style={styles.congratsTitle}>🎉 Félicitations! 🎉</Text>
          <Text style={styles.congratsText}>Vous avez terminé tous les quiz avec succès!</Text>
          <Text style={styles.congratsSubtext}>Vous maîtrisez maintenant les bases du Haoussa!</Text>
          <Text style={styles.congratsSubtext}>Consultez votre profil pour voir tous vos résultats!</Text>
          <TouchableOpacity style={styles.restartButton} onPress={restartAllQuizzes}>
            <Text style={styles.restartButtonText}>Recommencer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (state.showQuizComplete) {
    const quizMessages = [
      "Bravo! Vous maîtrisez maintenant les salutations en Haoussa!",
      "Excellent! Vous connaissez les expressions courantes!",
      "Félicitations! Vous savez compter en Haoussa!",
      "Superbe! Vous maîtrisez les couleurs en Haoussa!"
    ];
    return (
      <View style={[styles.container, { backgroundColor: '#48CAE4' }]}>
        <View style={styles.quizCompleteContainer}>
          <Text style={styles.quizCompleteTitle}>
            {state.score >= currentQuiz.data.length / 2 ? "🎉 Quiz terminé avec succès!" : "Quiz terminé!"}
          </Text>
          <Text style={styles.scoreText}>Score: {state.score}/{currentQuiz.data.length}</Text>
          <Text style={styles.percentageText}>
            ({Math.round((state.score / currentQuiz.data.length) * 100)}%)
          </Text>
          <Text style={styles.feedbackText}>{quizMessages[state.quizIndex]}</Text>
          <Text style={styles.savedText}>✅ Résultat sauvegardé dans votre profil!</Text>
          {!isLastQuiz && <Text style={styles.autoAdvanceText}>Passage au quiz suivant dans 3 secondes...</Text>}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.quizButton, { backgroundColor: '#0077B6' }]} onPress={restartCurrentQuiz}>
              <Text style={styles.quizButtonText}>Refaire ce quiz</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quizButton, { backgroundColor: '#0096C7' }]} onPress={goToNextQuiz}>
              <Text style={styles.quizButtonText}>{!isLastQuiz ? "Passer maintenant" : "Terminer"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: currentTheme }]}>
      <View style={styles.questionContainer}>
        <Text style={styles.quizTitle}>{currentQuiz.title}</Text>
        <Text style={styles.progressText}>
          Question {state.questionIndex + 1} sur {currentQuiz.data.length}
        </Text>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        {currentQuestion.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              state.showResult && index === currentQuestion.correct && styles.correctOption,
              state.showResult && index !== currentQuestion.correct && styles.disabledOption
            ]}
            onPress={() => !state.showResult && handleAnswer(index)}
            disabled={state.showResult}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}

        {state.showResult && (
          <>
            <Text style={[styles.resultText, { color: state.lastAnswerCorrect ? '#059669' : '#DC2626' }]}>
              {state.lastAnswerCorrect ? "✅ Bonne réponse!" : `❌ Mauvaise réponse! La bonne réponse était: ${state.correctAnswer}`}
            </Text>
            <TouchableOpacity style={[styles.nextButton, { backgroundColor: '#0077B6' }]} onPress={nextQuestion}>
              <Text style={styles.nextButtonText}>
                {!isLastQuestion ? "Question suivante" : "Terminer le quiz"}
              </Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.bottomButtons}>
          <TouchableOpacity style={styles.skipQuizButton} onPress={goToNextQuiz}>
            <Text style={styles.skipQuizText}>Passer au quiz suivant</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 20,
    padding: 20
  },
  quizTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  progressText: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
  questionText: { fontSize: 18, marginBottom: 20 },
  optionButton: {
    backgroundColor: '#CAF0F8',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10
  },
  correctOption: {
    backgroundColor: '#38B000'
  },
  disabledOption: {
    opacity: 0.6
  },
  optionText: { fontSize: 16 },
  resultText: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  nextButton: {
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  nextButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  bottomButtons: { marginTop: 20 },
  skipQuizButton: { marginBottom: 10 },
  skipQuizText: { color: '#023E8A', fontWeight: 'bold', textAlign: 'center' },
  backButton: {},
  backButtonText: { color: '#03045E', textAlign: 'center' },
  quizCompleteContainer: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  quizCompleteTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  scoreText: { fontSize: 18, marginBottom: 5 },
  percentageText: { fontSize: 16, color: '#666', marginBottom: 10 },
  feedbackText: { fontSize: 16, marginBottom: 10, textAlign: 'center' },
  savedText: { fontSize: 14, color: '#059669', fontWeight: 'bold', marginBottom: 10 },
  autoAdvanceText: { fontSize: 14, fontStyle: 'italic', marginBottom: 20 },
  buttonRow: { flexDirection: 'row', gap: 10 },
  quizButton: { padding: 10, borderRadius: 8, marginHorizontal: 5 },
  quizButtonText: { color: 'white', fontWeight: 'bold' },
  completionContainer: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  congratsTitle: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 10 },
  congratsText: { fontSize: 18, color: 'white', textAlign: 'center', marginBottom: 10 },
  congratsSubtext: { fontSize: 16, color: 'white', textAlign: 'center', marginBottom: 10 },
  restartButton: { backgroundColor: 'white', padding: 12, borderRadius: 10, marginTop: 10 },
  restartButtonText: { fontSize: 16, fontWeight: 'bold', color: '#0077B6' }
});