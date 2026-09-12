'use client';
import { useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '@/components/ui';
import ProgressBar from '@/components/ui/ProgressBar';
import type { Interview, InterviewFeedback, FinalFeedback } from '@/types';
import { MessageSquare, Loader2, CheckCircle, AlertCircle, Star, ArrowRight, RotateCcw } from 'lucide-react';

const CAREER_OPTIONS = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'AI/ML Engineer', 'Data Analyst', 'Software Developer', 'Cybersecurity Analyst',
];

type Stage = 'setup' | 'question' | 'feedback' | 'complete';

export default function InterviewPage() {
  const [stage, setStage] = useState<Stage>('setup');
  const [loading, setLoading] = useState(false);
  const [interview, setInterview] = useState<Interview | null>(null);
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [finalFeedback, setFinalFeedback] = useState<FinalFeedback | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [currentQuestionNum, setCurrentQuestionNum] = useState(1);
  const [form, setForm] = useState({
    career: '',
    experienceLevel: 'entry',
    difficulty: 'medium',
  });

  const handleStart = async () => {
    if (!form.career) { toast.error('Please select a career role.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/interview/start', form);
      setInterview(res.data.interview);
      setInterviewId(res.data.interview.id);
      setDemoMode(res.data.demoMode);
      setCurrentQuestionNum(1);
      setFeedback(null);
      setAnswer('');
      setStage('question');
      toast.success('Interview started! Good luck! 🎯');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start interview.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || answer.trim().length < 5) {
      toast.error('Please write a proper answer (at least 5 characters).');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/interview/answer', { interviewId, answer });
      setFeedback(res.data.feedback);
      setStage('feedback');

      if (res.data.isComplete) {
        setFinalScore(res.data.finalScore);
        setFinalFeedback(res.data.finalFeedback);
      } else {
        // Prepare next question
        setInterview((prev) => prev ? {
          ...prev,
          currentQuestion: res.data.nextQuestion,
        } : prev);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit answer.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (finalScore !== null) {
      setStage('complete');
    } else {
      setCurrentQuestionNum((n) => n + 1);
      setAnswer('');
      setFeedback(null);
      setStage('question');
    }
  };

  const handleReset = () => {
    setStage('setup');
    setInterview(null);
    setInterviewId(null);
    setAnswer('');
    setFeedback(null);
    setFinalScore(null);
    setFinalFeedback(null);
    setCurrentQuestionNum(1);
  };

  const scoreColor = (s: number) => s >= 7 ? 'text-green-600' : s >= 4 ? 'text-yellow-600' : 'text-red-500';
  const finalScoreColor = (s: number) => s >= 70 ? 'text-green-600' : s >= 40 ? 'text-yellow-600' : 'text-red-500';

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="section-title">AI Mock Interview</h1>
        <p className="section-subtitle">
          Practice interview questions with real-time AI feedback.
          <span className="text-amber-600"> Note: This is a practice tool — not a real employer evaluation.</span>
        </p>
      </div>

      {/* ─── SETUP STAGE ─── */}
      {stage === 'setup' && (
        <div className="card">
          <h2 className="font-semibold text-slate-900 mb-5">Configure Your Interview</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Career Role *</label>
              <select
                value={form.career}
                onChange={(e) => setForm((f) => ({ ...f, career: e.target.value }))}
                className="input-field"
              >
                <option value="">Select a role...</option>
                {CAREER_OPTIONS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Experience Level</label>
                <select
                  value={form.experienceLevel}
                  onChange={(e) => setForm((f) => ({ ...f, experienceLevel: e.target.value }))}
                  className="input-field"
                >
                  <option value="entry">Entry Level (0-1 years)</option>
                  <option value="mid">Mid Level (1-3 years)</option>
                  <option value="senior">Senior Level (3+ years)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Difficulty</label>
                <select
                  value={form.difficulty}
                  onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}
                  className="input-field"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-5 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
            <p className="font-medium mb-1">What to expect:</p>
            <ul className="space-y-1 text-blue-700">
              <li>• 5 interview questions for your selected role</li>
              <li>• Submit your answer and receive immediate AI feedback</li>
              <li>• Get a final performance summary at the end</li>
            </ul>
          </div>

          <button onClick={handleStart} disabled={loading} className="btn-primary mt-5 flex items-center gap-2">
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Starting...</>
            ) : (
              <><MessageSquare className="w-4 h-4" /> Start Interview</>
            )}
          </button>
        </div>
      )}

      {/* ─── QUESTION STAGE ─── */}
      {stage === 'question' && interview?.currentQuestion && (
        <div className="space-y-5">
          {demoMode && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
              🧪 Demo mode — configure AI API key for personalized questions.
            </div>
          )}
          {/* Progress */}
          <div className="card">
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="text-slate-500">Question {currentQuestionNum} of {interview.totalQuestions}</span>
              <span className="font-medium text-blue-600">{interview.career}</span>
            </div>
            <ProgressBar
              value={((currentQuestionNum - 1) / interview.totalQuestions) * 100}
              color="bg-blue-600"
              showPercent={false}
              size="sm"
            />
          </div>

          {/* Question */}
          <div className="card">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                Q
              </div>
              <p className="text-slate-900 font-medium text-base leading-relaxed">
                {interview.currentQuestion.question}
              </p>
            </div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Your Answer</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={6}
              placeholder="Type your answer here. Be clear and detailed. You can include examples."
              className="input-field resize-none font-sans"
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-slate-400">{answer.length} characters</span>
              <button onClick={handleSubmitAnswer} disabled={loading} className="btn-primary flex items-center gap-2">
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Evaluating...</>
                ) : (
                  <>Submit Answer <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── FEEDBACK STAGE ─── */}
      {stage === 'feedback' && feedback && (
        <div className="space-y-5">
          {/* Score */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-slate-900">Answer Evaluation</h2>
              <div className="text-right">
                <span className={`text-3xl font-bold ${scoreColor(feedback.score)}`}>{feedback.score}</span>
                <span className="text-slate-400 text-lg">/10</span>
              </div>
            </div>
            <ProgressBar
              value={feedback.score * 10}
              color={feedback.score >= 7 ? 'bg-green-500' : feedback.score >= 4 ? 'bg-yellow-500' : 'bg-red-400'}
              showPercent={false}
              size="md"
            />
            {feedback.evaluation && (
              <p className="mt-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{feedback.evaluation}</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {feedback.strengths.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Strengths
                </h3>
                <ul className="space-y-2">
                  {feedback.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {feedback.improvements.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Areas to Improve
                </h3>
                <ul className="space-y-2">
                  {feedback.improvements.map((s, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5">!</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {feedback.suggestedAnswer && (
            <div className="card">
              <h3 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                <Star className="w-4 h-4" /> Suggested Better Answer
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">{feedback.suggestedAnswer}</p>
            </div>
          )}

          <button onClick={handleNextQuestion} className="btn-primary flex items-center gap-2">
            {finalScore !== null ? 'View Final Summary →' : <>Next Question <ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      )}

      {/* ─── COMPLETE STAGE ─── */}
      {stage === 'complete' && finalFeedback && (
        <div className="space-y-5">
          <div className="card text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Interview Complete!</h2>
            <p className="text-slate-500 text-sm mb-4">Here is your performance summary.</p>
            <div className="mb-4">
              <span className={`text-5xl font-bold ${finalScoreColor(finalScore || 0)}`}>{finalScore}%</span>
              <p className="text-xs text-slate-400 mt-1">Overall Score (practice estimate only)</p>
            </div>
            <ProgressBar
              value={finalScore || 0}
              color={(finalScore || 0) >= 70 ? 'bg-green-500' : (finalScore || 0) >= 40 ? 'bg-yellow-500' : 'bg-red-400'}
              showPercent={false}
              size="lg"
            />
          </div>

          <div className="card">
            <h3 className="font-semibold text-slate-900 mb-2">Overall Feedback</h3>
            <p className="text-sm text-slate-700 leading-relaxed">{finalFeedback.overallPerformance}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="font-semibold text-green-700 mb-3">Top Strengths</h3>
              <ul className="space-y-2">
                {finalFeedback.topStrengths.map((s, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card">
              <h3 className="font-semibold text-orange-700 mb-3">Areas to Improve</h3>
              <ul className="space-y-2">
                {finalFeedback.areasToImprove.map((s, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">→</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {finalFeedback.recommendedResources.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-blue-700 mb-3">Recommended Resources</h3>
              <ul className="space-y-2">
                {finalFeedback.recommendedResources.map((r, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">🔗</span> {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button onClick={handleReset} className="btn-secondary flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Start Another Interview
          </button>
        </div>
      )}
    </div>
  );
}
