'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { LoadingSpinner, StatCard } from '@/components/ui';
import ProgressBar from '@/components/ui/ProgressBar';
import type { User, Roadmap } from '@/types';
import {
  FileText, Compass, BarChart2, BookOpen,
  GraduationCap, MessageSquare, ArrowRight, CheckCircle, AlertCircle,
} from 'lucide-react';

const quickLinks = [
  { href: '/resume',    label: 'Analyze Resume',      icon: FileText,      color: 'bg-blue-50 text-blue-600' },
  { href: '/career',    label: 'Explore Careers',     icon: Compass,       color: 'bg-purple-50 text-purple-600' },
  { href: '/skills',    label: 'Skill Gap Analysis',  icon: BarChart2,     color: 'bg-green-50 text-green-600' },
  { href: '/roadmap',   label: 'View Roadmap',        icon: BookOpen,      color: 'bg-orange-50 text-orange-600' },
  { href: '/courses',   label: 'Find Courses',        icon: GraduationCap, color: 'bg-pink-50 text-pink-600' },
  { href: '/interview', label: 'Start Interview',     icon: MessageSquare, color: 'bg-teal-50 text-teal-600' },
];

export default function OverviewPage() {
  const [user, setUser] = useState<User | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));

    Promise.all([
      api.get('/auth/me').catch(() => null),
      api.get('/roadmap').catch(() => null),
    ]).then(([meRes, roadmapRes]) => {
      if (meRes) {
        setUser(meRes.data.user);
        localStorage.setItem('user', JSON.stringify(meRes.data.user));
      }
      if (roadmapRes?.data?.roadmap) setRoadmap(roadmapRes.data.roadmap);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading your dashboard..." />;

  const firstName = user?.name?.split(' ')[0] || 'Student';

  return (
    <div className="max-w-5xl mx-auto">
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {firstName}! 👋
        </h1>
        <p className="text-slate-500 mt-1">
          {user?.selectedCareer
            ? `You are working toward: ${user.selectedCareer}`
            : 'Start by analyzing your resume or exploring career paths.'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Readiness Score"
          value={`${user?.careerReadinessScore || 0}%`}
          color="text-blue-600"
          sub="Career readiness (estimate)"
        />
        <StatCard
          label="Skills Listed"
          value={user?.skills?.length || 0}
          color="text-green-600"
          sub="From your resume"
        />
        <StatCard
          label="Roadmap Progress"
          value={`${roadmap?.overallProgress || 0}%`}
          color="text-purple-600"
          sub={roadmap ? `${roadmap.career}` : 'No roadmap yet'}
        />
        <StatCard
          label="Career Goal"
          value={user?.selectedCareer ? '✓' : '—'}
          color={user?.selectedCareer ? 'text-green-600' : 'text-slate-400'}
          sub={user?.selectedCareer || 'Not selected'}
        />
      </div>

      {/* Readiness progress bar */}
      {user?.careerReadinessScore !== undefined && (
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold text-slate-900">Career Readiness Score</h2>
              <p className="text-xs text-slate-400 mt-0.5">This is an estimate based on your reported skills — not a real employer evaluation.</p>
            </div>
            <span className={`text-2xl font-bold ${user.careerReadinessScore >= 70 ? 'text-green-600' : user.careerReadinessScore >= 40 ? 'text-yellow-600' : 'text-red-500'}`}>
              {user.careerReadinessScore}%
            </span>
          </div>
          <ProgressBar
            value={user.careerReadinessScore}
            color={user.careerReadinessScore >= 70 ? 'bg-green-500' : user.careerReadinessScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'}
            size="lg"
            showPercent={false}
          />
        </div>
      )}

      {/* Quick links */}
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Access</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {quickLinks.map(({ href, label, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            className="card flex items-center gap-4 hover:border-blue-200 cursor-pointer group"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900">{label}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 ml-auto" />
          </Link>
        ))}
      </div>

      {/* Skills preview */}
      {user?.skills && user.skills.length > 0 && (
        <div className="card mb-8">
          <h2 className="font-semibold text-slate-900 mb-3">Your Skills</h2>
          <div className="flex flex-wrap gap-2">
            {user.skills.map((skill) => (
              <span key={skill} className="skill-tag skill-tag-blue">{skill}</span>
            ))}
          </div>
        </div>
      )}

      {/* Getting started checklist */}
      <div className="card">
        <h2 className="font-semibold text-slate-900 mb-4">Getting Started Checklist</h2>
        <div className="space-y-3">
          {[
            { label: 'Create account', done: true },
            { label: 'Analyze your resume', done: (user?.skills?.length || 0) > 0, href: '/resume' },
            { label: 'Select a career goal', done: !!user?.selectedCareer, href: '/career' },
            { label: 'View skill gap analysis', done: (user?.careerReadinessScore || 0) > 0, href: '/skills' },
            { label: 'Generate learning roadmap', done: !!roadmap, href: '/roadmap' },
            { label: 'Try a mock interview', done: false, href: '/interview' },
          ].map(({ label, done, href }) => (
            <div key={label} className="flex items-center gap-3">
              {done ? (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-slate-200 flex-shrink-0" />
              )}
              {href && !done ? (
                <Link href={href} className="text-sm text-blue-600 hover:underline">{label}</Link>
              ) : (
                <span className={`text-sm ${done ? 'text-slate-500 line-through' : 'text-slate-700'}`}>{label}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
