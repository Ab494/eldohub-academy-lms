import { Quiz } from '../models/Quiz.js';
import { QuizAttempt } from '../models/QuizAttempt.js';
import { AppError } from '../utils/errorHandler.js';

export class QuizService {
  static async createQuiz(quizData) {
    const totalPoints = quizData.questions.reduce((sum, q) => sum + (q.points || 1), 0);

    const quiz = new Quiz({
      ...quizData,
      totalPoints,
    });

    await quiz.save();
    return quiz;
  }

  static async submitQuizAttempt(quizId, studentId, courseId, answers, timeTaken) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new AppError('Quiz not found', 404);
    }

    // Check attempts
    const previousAttempts = await QuizAttempt.countDocuments({
      quiz: quizId,
      student: studentId,
    });

    if (previousAttempts >= quiz.attemptsAllowed) {
      throw new AppError('Maximum attempts exceeded', 400);
    }

    // Grade quiz
    let totalScore = 0;
    const gradedAnswers = [];

    answers.forEach((answer, index) => {
      const question = quiz.questions[index];
      if (!question) return;

      const isCorrect = answer.answer === question.correctAnswer;
      const pointsEarned = isCorrect ? (question.points || 1) : 0;

      totalScore += pointsEarned;
      gradedAnswers.push({
        questionId: question._id,
        studentAnswer: answer.answer,
        isCorrect,
        pointsEarned,
      });
    });

    const percentage = Math.round((totalScore / quiz.totalPoints) * 100);
    const status = percentage >= quiz.passingScore ? 'passed' : 'failed';

    const attempt = new QuizAttempt({
      quiz: quizId,
      student: studentId,
      course: courseId,
      answers: gradedAnswers,
      score: totalScore,
      percentage,
      status,
      timeTaken,
      attemptNumber: previousAttempts + 1,
    });

    await attempt.save();

    return {
      attempt: attempt.populate('quiz', 'title totalPoints'),
      questions: quiz.showAnswers ? quiz.questions : null,
    };
  }

  static async getStudentQuizAttempts(quizId, studentId) {
    const attempts = await QuizAttempt.find({
      quiz: quizId,
      student: studentId,
    }).sort({ createdAt: -1 });

    return attempts;
  }

  static async getBestAttempt(quizId, studentId) {
    return QuizAttempt.findOne({
      quiz: quizId,
      student: studentId,
    }).sort({ percentage: -1 });
  }
}
