const Interview = require('../models/Interview');
const aiService = require('../services/aiService');

// POST /api/interview/start
const startInterview = async (req, res) => {
  const { career, experienceLevel, difficulty } = req.body;

  if (!career) {
    return res.status(400).json({ message: 'Career is required.' });
  }

  try {
    // Get first question
    const question = await aiService.getInterviewQuestion(career, difficulty || 'medium', 1, []);

    const interview = await Interview.create({
      userId: req.user._id,
      career,
      experienceLevel: experienceLevel || 'entry',
      difficulty: difficulty || 'medium',
      status: 'in_progress',
      totalQuestions: 5,
      currentQuestionIndex: 0,
      questionsAndAnswers: [
        {
          questionNumber: 1,
          question,
          userAnswer: '',
        },
      ],
    });

    res.status(201).json({
      message: 'Interview started.',
      demoMode: aiService.isDemoMode,
      interview: {
        id: interview._id,
        career: interview.career,
        difficulty: interview.difficulty,
        currentQuestion: {
          number: 1,
          question,
        },
        totalQuestions: interview.totalQuestions,
      },
    });
  } catch (err) {
    console.error('Start interview error:', err);
    res.status(500).json({ message: 'Failed to start interview.' });
  }
};

// POST /api/interview/answer
const submitAnswer = async (req, res) => {
  const { interviewId, answer } = req.body;

  if (!interviewId || !answer) {
    return res.status(400).json({ message: 'Interview ID and answer are required.' });
  }

  try {
    const interview = await Interview.findOne({ _id: interviewId, userId: req.user._id });
    if (!interview) return res.status(404).json({ message: 'Interview not found.' });
    if (interview.status === 'completed') {
      return res.status(400).json({ message: 'Interview already completed.' });
    }

    const currentIdx = interview.currentQuestionIndex;
    const currentQA = interview.questionsAndAnswers[currentIdx];

    if (!currentQA) {
      return res.status(400).json({ message: 'No current question found.' });
    }

    // Evaluate the answer
    const feedback = await aiService.evaluateAnswer(
      interview.career,
      currentQA.question,
      answer,
      interview.difficulty
    );

    // Save answer and feedback
    currentQA.userAnswer = answer;
    currentQA.feedback = {
      score: feedback.score || 0,
      strengths: feedback.strengths || [],
      improvements: feedback.improvements || [],
      suggestedAnswer: feedback.suggestedAnswer || '',
      evaluation: feedback.evaluation || '',
    };
    currentQA.answeredAt = new Date();

    const nextQuestionNumber = currentIdx + 2;
    const isLastQuestion = nextQuestionNumber > interview.totalQuestions;

    let nextQuestion = null;
    if (!isLastQuestion) {
      // Get next question
      const previousQuestions = interview.questionsAndAnswers.map((q) => q.question);
      nextQuestion = await aiService.getInterviewQuestion(
        interview.career,
        interview.difficulty,
        nextQuestionNumber,
        previousQuestions
      );

      interview.questionsAndAnswers.push({
        questionNumber: nextQuestionNumber,
        question: nextQuestion,
        userAnswer: '',
      });
      interview.currentQuestionIndex = currentIdx + 1;
    } else {
      interview.status = 'completed';
      interview.completedAt = new Date();

      // Generate final summary
      const summary = await aiService.generateInterviewSummary(
        interview.career,
        interview.questionsAndAnswers
      );

      const totalScore = interview.questionsAndAnswers.reduce(
        (sum, qa) => sum + (qa.feedback?.score || 0),
        0
      );
      interview.finalScore = Math.round(
        (totalScore / (interview.questionsAndAnswers.length * 10)) * 100
      );
      interview.finalFeedback = summary;
    }

    await interview.save();

    res.json({
      feedback: currentQA.feedback,
      isComplete: isLastQuestion,
      nextQuestion: isLastQuestion
        ? null
        : { number: nextQuestionNumber, question: nextQuestion },
      finalScore: isLastQuestion ? interview.finalScore : null,
      finalFeedback: isLastQuestion ? interview.finalFeedback : null,
    });
  } catch (err) {
    console.error('Submit answer error:', err);
    res.status(500).json({ message: 'Failed to submit answer.' });
  }
};

// GET /api/interview/history
const getInterviewHistory = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('career difficulty status finalScore createdAt completedAt');
    res.json({ interviews });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch interview history.' });
  }
};

// GET /api/interview/:id
const getInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!interview) return res.status(404).json({ message: 'Interview not found.' });
    res.json({ interview });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch interview.' });
  }
};

module.exports = { startInterview, submitAnswer, getInterviewHistory, getInterview };
