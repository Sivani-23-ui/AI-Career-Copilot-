'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '@/components/ui';
import ProgressBar from '@/components/ui/ProgressBar';
import type { Roadmap, RoadmapTask } from '@/types';
import { BookOpen, Loader2, CheckCircle, Circle, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

const CAREER_OPTIONS = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'AI/ML Engineer', 'Data Analyst', 'Software Developer', 'Cybersecurity Analyst',
];

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner (0-1 years)' },
  { value: 'intermediate', label: 'Intermediate (1-3 years)' },
  { value: 'advanced', label: 'Advanced (3+ years)' },
];

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [form, setForm] = useState({
    career: '',
    experienceLevel: 'beginner',
    studyHoursPerWeek: 10,
  });

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const u = JSON.parse(stored);
      if (u.selectedCareer) setForm((f) => ({ ...f, career: u.selectedCareer }));
    }
    api.get('/roadmap')
      .then((res) => { if (res.data.roadmap) setRoadmap(res.data.roadmap); })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const handleGenerate = async () => {
    if (!form.career) { toast.error('Please select a career.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/roadmap/generate', form);
      setRoadmap(res.data.roadmap);
      setDemoMode(res.data.demoMode);
      setExpandedWeek(res.data.roadmap.tasks[0]?._id || null);
      toast.success('Roadmap generated!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate roadmap.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskId: string) => {
    if (!roadmap) return;
    try {
      const res = await api.put(`/roadmap/task/${taskId}/complete`);
      setRoadmap(res.data.roadmap);
      toast.success('Task updated!');
    } catch {
      toast.error('Failed to update task.');
    }
  };

  if (fetching) return <LoadingSpinner text="Loading roadmap..." />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="section-title">Learning Roadmap</h1>
        <p className="section-subtitle">A personalized week-by-week study plan to close your skill gaps and reach your career goal.</p>
      </div>

      {/* Generate form */}
      <div className="card mb-6">
        <h2 className="font-semibold text-slate-900 mb-4">{roadmap ? 'Regenerate Roadmap' : 'Generate Your Roadmap'}</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Target Career</label>
            <select
              value={form.career}
              onChange={(e) => setForm((f) => ({ ...f, career: e.target.value }))}
              className="input-field"
            >
              <option value="">Select career...</option>
              {CAREER_OPTIONS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Experience Level</label>
            <select
              value={form.experienceLevel}
              onChange={(e) => setForm((f) => ({ ...f, experienceLevel: e.target.value }))}
              className="input-field"
            >
              {EXPERIENCE_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Study Hours/Week</label>
            <input
              type="number"
              min={1}
              max={40}
              value={form.studyHoursPerWeek}
              onChange={(e) => setForm((f) => ({ ...f, studyHoursPerWeek: Number(e.target.value) }))}
              className="input-field"
            />
          </div>
        </div>
        <button onClick={handleGenerate} disabled={loading} className="btn-primary mt-4 flex items-center gap-2">
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
          ) : roadmap ? (
            <><RefreshCw className="w-4 h-4" /> Regenerate Roadmap</>
          ) : (
            <><BookOpen className="w-4 h-4" /> Generate Roadmap</>
          )}
        </button>
      </div>

      {/* Roadmap display */}
      {roadmap && (
        <>
          {demoMode && (
            <div className="p-3 mb-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
              🧪 Demo roadmap — configure an AI API key for a personalized plan.
            </div>
          )}

          {/* Progress */}
          <div className="card mb-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-semibold text-slate-900">Overall Progress — {roadmap.career}</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {roadmap.tasks.filter((t) => t.completed).length} of {roadmap.tasks.length} weeks completed
                </p>
              </div>
              <span className="text-2xl font-bold text-blue-600">{roadmap.overallProgress}%</span>
            </div>
            <ProgressBar
              value={roadmap.overallProgress}
              color="bg-blue-600"
              size="lg"
              showPercent={false}
            />
          </div>

          {/* Weekly tasks */}
          <div className="space-y-3">
            {roadmap.tasks.map((task) => (
              <div key={task._id} className={`card ${task.completed ? 'opacity-70' : ''}`}>
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => setExpandedWeek(expandedWeek === task._id ? null : task._id!)}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleTask(task._id!); }}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      task.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-slate-300 hover:border-blue-400'
                    }`}
                  >
                    {task.completed && <CheckCircle className="w-3.5 h-3.5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-slate-500 truncate mt-0.5">{task.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${task.completed ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-600'}`}>
                      Week {task.weekNumber}
                    </span>
                    {expandedWeek === task._id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {expandedWeek === task._id && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                    {task.topics.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Topics to Cover</p>
                        <ul className="space-y-1">
                          {task.topics.map((t, i) => (
                            <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                              <span className="text-blue-500 mt-0.5">•</span> {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {task.practiceProblems.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Practice Tasks</p>
                        <ul className="space-y-1">
                          {task.practiceProblems.map((p, i) => (
                            <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                              <span className="text-purple-500 mt-0.5">📝</span> {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {task.miniProject && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Mini Project</p>
                        <p className="text-sm text-slate-700 bg-orange-50 p-3 rounded-lg">🔨 {task.miniProject}</p>
                      </div>
                    )}
                    {task.resources.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Resources</p>
                        <ul className="space-y-1">
                          {task.resources.map((r, i) => (
                            <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                              <span className="text-teal-500 mt-0.5">🔗</span> {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <button
                      onClick={() => toggleTask(task._id!)}
                      className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                        task.completed
                          ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {task.completed ? '↩ Mark as Incomplete' : '✓ Mark as Complete'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
