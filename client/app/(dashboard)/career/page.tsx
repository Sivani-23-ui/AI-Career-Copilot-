'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '@/components/ui';
import ProgressBar from '@/components/ui/ProgressBar';
import type { CareerRecommendation } from '@/types';
import { Compass, Loader2, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const CAREER_OPTIONS = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'AI/ML Engineer', 'Data Analyst', 'Software Developer', 'Cybersecurity Analyst',
];

const SKILL_OPTIONS = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'MongoDB',
  'Machine Learning', 'Data Analysis', 'HTML/CSS', 'Java', 'C++', 'Git',
  'Docker', 'REST APIs', 'Problem Solving', 'Communication',
];

const INTEREST_OPTIONS = [
  'Web Development', 'Artificial Intelligence', 'Data Science',
  'Cloud Computing', 'Mobile Apps', 'Cybersecurity', 'UI/UX Design',
  'Game Development', 'DevOps', 'Open Source',
];

export default function CareerPage() {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const u = JSON.parse(stored);
      if (u.skills?.length) setSelectedSkills(u.skills.slice(0, 10));
    }
  }, []);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills((prev) => [...prev, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const handleGetRecommendations = async () => {
    if (selectedSkills.length === 0) {
      toast.error('Please select at least one skill.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/career/recommend', {
        skills: selectedSkills,
        interests: selectedInterests,
      });
      setRecommendations(res.data.recommendations);
      setDemoMode(res.data.demoMode);
      toast.success('Career recommendations ready!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to get recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCareer = async (career: string) => {
    try {
      const res = await api.post('/career/select', { career, currentSkills: selectedSkills });
      const profile = res.data.profile;
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({
        ...stored,
        selectedCareer: career,
        careerReadinessScore: profile?.readinessScore ?? profile?.skillGapAnalysis?.matchPercentage ?? stored.careerReadinessScore ?? 0,
      }));
      toast.success(`${career} set as your career goal! 🎯`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to select career.');
    }
  };

  const matchColor = (pct: number) =>
    pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-400';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="section-title">Career Explorer</h1>
        <p className="section-subtitle">Select your current skills and interests to get AI-powered career recommendations.</p>
      </div>

      {/* Skill selection */}
      <div className="card mb-5">
        <h2 className="font-semibold text-slate-900 mb-3">Your Current Skills</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {SKILL_OPTIONS.map((skill) => (
            <button
              key={skill}
              onClick={() => toggleSkill(skill)}
              className={`skill-tag cursor-pointer transition-colors ${
                selectedSkills.includes(skill) ? 'skill-tag-blue border border-blue-300' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {selectedSkills.includes(skill) ? '✓ ' : '+ '}{skill}
            </button>
          ))}
        </div>
        {/* Custom skill input */}
        <div className="flex gap-2 mt-2">
          <input
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomSkill()}
            placeholder="Add custom skill..."
            className="input-field flex-1 text-sm"
          />
          <button onClick={addCustomSkill} className="btn-secondary text-sm px-3 py-2">Add</button>
        </div>
        {selectedSkills.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-2">Selected ({selectedSkills.length}):</p>
            <div className="flex flex-wrap gap-1.5">
              {selectedSkills.map((s) => (
                <span key={s} className="skill-tag skill-tag-blue text-xs cursor-pointer" onClick={() => toggleSkill(s)}>
                  {s} ✕
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Interest selection */}
      <div className="card mb-5">
        <h2 className="font-semibold text-slate-900 mb-3">Your Interests</h2>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((interest) => (
            <button
              key={interest}
              onClick={() => toggleInterest(interest)}
              className={`skill-tag cursor-pointer transition-colors ${
                selectedInterests.includes(interest) ? 'skill-tag-purple border border-purple-300' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {selectedInterests.includes(interest) ? '✓ ' : '+ '}{interest}
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleGetRecommendations} disabled={loading} className="btn-primary flex items-center gap-2 mb-8">
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Getting recommendations...</>
        ) : (
          <><Compass className="w-4 h-4" /> Get Career Recommendations</>
        )}
      </button>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          {demoMode && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
              🧪 Demo mode active — configure an AI API key for personalized recommendations.
            </div>
          )}
          <h2 className="font-semibold text-slate-900 text-lg">Recommended Career Paths</h2>
          {recommendations.map((rec, idx) => (
            <div key={idx} className="card">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedCard(expandedCard === idx ? null : idx)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-slate-900">{rec.careerName}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      rec.currentMatch >= 70 ? 'bg-green-100 text-green-700' :
                      rec.currentMatch >= 40 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {rec.currentMatch}% match
                    </span>
                  </div>
                  <ProgressBar
                    value={rec.currentMatch}
                    color={matchColor(rec.currentMatch)}
                    showPercent={false}
                    size="sm"
                  />
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSelectCareer(rec.careerName); }}
                    className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1"
                  >
                    Set as Goal <ArrowRight className="w-3 h-3" />
                  </button>
                  {expandedCard === idx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              {expandedCard === idx && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                  <p className="text-sm text-slate-600">{rec.whySuitable}</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Required Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {rec.requiredSkills.map((s) => <span key={s} className="skill-tag skill-tag-blue text-xs">{s}</span>)}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Skills to Learn</p>
                      <div className="flex flex-wrap gap-1.5">
                        {rec.missingSkills.map((s) => <span key={s} className="skill-tag skill-tag-red text-xs">{s}</span>)}
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Next Steps</p>
                    <ul className="space-y-1">
                      {rec.nextSteps.map((step, i) => (
                        <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">→</span> {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex gap-3">
                    <Link href="/skills" className="btn-primary text-sm py-2 flex items-center gap-1">
                      Analyze Skill Gap <ArrowRight className="w-3 h-3" />
                    </Link>
                    <Link href="/roadmap" className="btn-secondary text-sm py-2">
                      Generate Roadmap
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
