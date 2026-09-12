'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '@/components/ui';
import ProgressBar from '@/components/ui/ProgressBar';
import type { SkillGapAnalysis } from '@/types';
import { BarChart2, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const CAREER_OPTIONS = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'AI/ML Engineer', 'Data Analyst', 'Software Developer', 'Cybersecurity Analyst',
];

export default function SkillsPage() {
  const [career, setCareer] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [currentSkills, setCurrentSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const u = JSON.parse(stored);
      if (u.skills?.length) setCurrentSkills(u.skills);
      if (u.selectedCareer) setCareer(u.selectedCareer);
    }
  }, []);

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !currentSkills.includes(trimmed)) {
      setCurrentSkills((p) => [...p, trimmed]);
      setSkillInput('');
    }
  };

  const removeSkill = (s: string) => setCurrentSkills((p) => p.filter((x) => x !== s));

  const handleAnalyze = async () => {
    if (!career) { toast.error('Please select a target career.'); return; }
    if (!currentSkills.length) { toast.error('Please add at least one skill.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/skills/analyze', { career, currentSkills });
      setAnalysis(res.data.analysis);
      setDemoMode(res.data.demoMode);
      toast.success('Skill gap analysis complete!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const pctColor = (p: number) => p >= 70 ? 'text-green-600' : p >= 40 ? 'text-yellow-600' : 'text-red-500';
  const barColor = (p: number) => p >= 70 ? 'bg-green-500' : p >= 40 ? 'bg-yellow-500' : 'bg-red-400';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="section-title">Skill Gap Analysis</h1>
        <p className="section-subtitle">
          Compare your skills against a target career to see exactly what you need to learn.
          <span className="text-amber-600"> Scores are estimates, not employer evaluations.</span>
        </p>
      </div>

      {/* Setup */}
      <div className="card mb-5">
        <h2 className="font-semibold text-slate-900 mb-4">Setup Analysis</h2>
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Target Career</label>
            <select value={career} onChange={(e) => setCareer(e.target.value)} className="input-field">
              <option value="">Select a career...</option>
              {CAREER_OPTIONS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Add Your Skills</label>
            <div className="flex gap-2">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                placeholder="e.g. Python, React..."
                className="input-field flex-1"
              />
              <button onClick={addSkill} className="btn-secondary px-3 py-2 text-sm">Add</button>
            </div>
          </div>
        </div>

        {currentSkills.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium text-slate-500 mb-2">Your Skills ({currentSkills.length}):</p>
            <div className="flex flex-wrap gap-2">
              {currentSkills.map((s) => (
                <span key={s} className="skill-tag skill-tag-blue cursor-pointer" onClick={() => removeSkill(s)}>
                  {s} ✕
                </span>
              ))}
            </div>
          </div>
        )}

        <button onClick={handleAnalyze} disabled={loading} className="btn-primary mt-4 flex items-center gap-2">
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
          ) : (
            <><BarChart2 className="w-4 h-4" /> Analyze Skill Gap</>
          )}
        </button>
      </div>

      {/* Results */}
      {analysis && (
        <div className="space-y-5">
          {demoMode && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
              🧪 Demo mode — configure an AI API key for personalized analysis.
            </div>
          )}

          {/* Match percentage */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-semibold text-slate-900">Skill Match for: <span className="text-blue-600">{career}</span></h2>
                <p className="text-xs text-slate-400 mt-0.5">Based on {analysis.matchedSkills.length} matched skills out of {analysis.requiredSkills.length} required</p>
              </div>
              <span className={`text-4xl font-bold ${pctColor(analysis.matchPercentage)}`}>
                {analysis.matchPercentage}%
              </span>
            </div>
            <ProgressBar
              value={analysis.matchPercentage}
              color={barColor(analysis.matchPercentage)}
              size="lg"
              showPercent={false}
            />
          </div>

          {/* Matched vs Missing */}
          <div className="grid md:grid-cols-2 gap-5">
            <div className="card">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" /> Skills You Have ({analysis.matchedSkills.length})
              </h3>
              {analysis.matchedSkills.length === 0 ? (
                <p className="text-sm text-slate-400">No matching skills detected yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {analysis.matchedSkills.map((s) => <span key={s} className="skill-tag skill-tag-green">{s}</span>)}
                </div>
              )}
            </div>
            <div className="card">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" /> Skills to Learn ({analysis.missingSkills.length})
              </h3>
              {analysis.missingSkills.length === 0 ? (
                <p className="text-sm text-green-600 font-medium">🎉 You have all required skills!</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {analysis.missingSkills.map((s) => <span key={s} className="skill-tag skill-tag-red">{s}</span>)}
                </div>
              )}
            </div>
          </div>

          {/* Priority levels */}
          {(analysis.beginner.length > 0 || analysis.intermediate.length > 0 || analysis.advanced.length > 0) && (
            <div className="card">
              <h3 className="font-semibold text-slate-900 mb-4">Learning Priority</h3>
              <div className="space-y-4">
                {analysis.beginner.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full" />
                      <p className="text-sm font-medium text-green-700">Beginner Level — Learn First</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {analysis.beginner.map((s) => <span key={s} className="skill-tag skill-tag-green">{s}</span>)}
                    </div>
                  </div>
                )}
                {analysis.intermediate.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <p className="text-sm font-medium text-yellow-700">Intermediate Level — Learn Next</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {analysis.intermediate.map((s) => <span key={s} className="skill-tag skill-tag-yellow">{s}</span>)}
                    </div>
                  </div>
                )}
                {analysis.advanced.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full" />
                      <p className="text-sm font-medium text-red-700">Advanced Level — Later Stage</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {analysis.advanced.map((s) => <span key={s} className="skill-tag skill-tag-red">{s}</span>)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {analysis.suggestions?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-slate-900 mb-3">💡 Suggestions</h3>
              <ul className="space-y-2">
                {analysis.suggestions.map((s, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">→</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            <Link href="/roadmap" className="btn-primary flex items-center gap-2 text-sm py-2.5">
              Generate Learning Roadmap →
            </Link>
            <Link href="/courses" className="btn-secondary text-sm py-2.5">Find Courses</Link>
          </div>
        </div>
      )}
    </div>
  );
}
