'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '@/components/ui';
import type { User } from '@/types';
import { User as UserIcon, Loader2, Save, Plus, X } from 'lucide-react';

const CAREER_OPTIONS = [
  '', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'AI/ML Engineer', 'Data Analyst', 'Software Developer', 'Cybersecurity Analyst',
];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'Other'];

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [form, setForm] = useState({
    name: '',
    college: '',
    degree: '',
    yearOfStudy: '',
    selectedCareer: '',
    skills: [] as string[],
  });

  useEffect(() => {
    api.get('/auth/me')
      .then((res) => {
        const u = res.data.user;
        setUser(u);
        setForm({
          name: u.name || '',
          college: u.college || '',
          degree: u.degree || '',
          yearOfStudy: u.yearOfStudy || '1st Year',
          selectedCareer: u.selectedCareer || '',
          skills: u.skills || [],
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !form.skills.includes(trimmed)) {
      setForm((f) => ({ ...f, skills: [...f.skills, trimmed] }));
      setSkillInput('');
    }
  };

  const removeSkill = (s: string) => {
    setForm((f) => ({ ...f, skills: f.skills.filter((x) => x !== s) }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required.'); return; }
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', form);
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading profile..." />;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="section-title">Profile</h1>
        <p className="section-subtitle">Update your information to improve career recommendations.</p>
      </div>

      {/* Avatar */}
      <div className="card mb-5 flex items-center gap-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-2xl">
          {user?.name?.charAt(0).toUpperCase() || '?'}
        </div>
        <div>
          <p className="font-semibold text-slate-900">{user?.name}</p>
          <p className="text-sm text-slate-500">{user?.email}</p>
          {user?.selectedCareer && (
            <span className="inline-block mt-1 skill-tag skill-tag-blue text-xs">🎯 {user.selectedCareer}</span>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="card space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
            <input name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="Jane Smith" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">College / University</label>
            <input name="college" value={form.college} onChange={handleChange} className="input-field" placeholder="MIT, IIT, etc." />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Degree</label>
            <input name="degree" value={form.degree} onChange={handleChange} className="input-field" placeholder="B.Tech CS" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Year of Study</label>
            <select name="yearOfStudy" value={form.yearOfStudy} onChange={handleChange} className="input-field">
              {YEARS.map((y) => <option key={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Career Goal</label>
          <select name="selectedCareer" value={form.selectedCareer} onChange={handleChange} className="input-field">
            {CAREER_OPTIONS.map((c) => <option key={c} value={c}>{c || 'Not selected'}</option>)}
          </select>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Your Skills</label>
          <div className="flex gap-2 mb-2">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSkill()}
              placeholder="Add a skill and press Enter..."
              className="input-field flex-1"
            />
            <button onClick={addSkill} className="btn-secondary px-3 py-2 flex items-center gap-1 text-sm">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          {form.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {form.skills.map((s) => (
                <span key={s} className="skill-tag skill-tag-blue flex items-center gap-1">
                  {s}
                  <button onClick={() => removeSkill(s)} className="hover:text-red-600 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No skills added yet. Add them here or analyze your resume.</p>
          )}
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 w-full justify-center">
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          ) : (
            <><Save className="w-4 h-4" /> Save Profile</>
          )}
        </button>
      </div>

      {/* Stats */}
      {user && (
        <div className="card mt-5">
          <h2 className="font-semibold text-slate-900 mb-3">Account Stats</h2>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-blue-600">{user.skills?.length || 0}</p>
              <p className="text-xs text-slate-500 mt-0.5">Skills Listed</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-purple-600">{user.careerReadinessScore || 0}%</p>
              <p className="text-xs text-slate-500 mt-0.5">Readiness Score</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
