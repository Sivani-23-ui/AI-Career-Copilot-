'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { LoadingSpinner } from '@/components/ui';
import type { Course } from '@/types';
import { GraduationCap, ExternalLink, Search, Filter } from 'lucide-react';

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: 'bg-green-100 text-green-700',
  Intermediate: 'bg-yellow-100 text-yellow-700',
  Advanced: 'bg-red-100 text-red-700',
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [diffFilter, setDiffFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');

  useEffect(() => {
    // Load with user's missing skills as filter
    const stored = localStorage.getItem('user');
    let query = '';
    if (stored) {
      const u = JSON.parse(stored);
      if (u.skills?.length) {
        // Show courses relevant to user's skills and career
        query = `?career=${encodeURIComponent(u.selectedCareer || '')}`;
      }
    }

    api.get(`/courses/recommend${query}`)
      .then((res) => setCourses(res.data.courses))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter((c) => {
    const matchSearch = !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.skill.toLowerCase().includes(search.toLowerCase()) ||
      c.platform.toLowerCase().includes(search.toLowerCase());
    const matchDiff = !diffFilter || c.difficulty === diffFilter;
    const matchSkill = !skillFilter || c.skill.toLowerCase().includes(skillFilter.toLowerCase());
    return matchSearch && matchDiff && matchSkill;
  });

  const uniqueSkills = Array.from(new Set(courses.map((c) => c.skill))).sort();

  if (loading) return <LoadingSpinner text="Loading course recommendations..." />;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="section-title">Course Recommendations</h1>
        <p className="section-subtitle">Curated free and paid courses to help you close your skill gaps. All links lead to official or trusted platforms.</p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="input-field pl-9"
            />
          </div>
          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="input-field w-auto"
          >
            <option value="">All Skills</option>
            {uniqueSkills.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select
            value={diffFilter}
            onChange={(e) => setDiffFilter(e.target.value)}
            className="input-field w-auto"
          >
            <option value="">All Levels</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
          {(search || diffFilter || skillFilter) && (
            <button
              onClick={() => { setSearch(''); setDiffFilter(''); setSkillFilter(''); }}
              className="btn-secondary text-sm py-2 px-3"
            >
              Clear
            </button>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-2">{filtered.length} courses found</p>
      </div>

      {/* Course grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-slate-400">
            <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>No courses match your filters. Try clearing them.</p>
          </div>
        ) : (
          filtered.map((course, idx) => (
            <div key={idx} className="card flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-900 text-sm leading-snug">{course.title}</h3>
                <a
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 text-blue-600 hover:text-blue-700"
                  title="Open course"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="skill-tag skill-tag-blue text-xs">{course.skill}</span>
                <span className={`skill-tag text-xs ${DIFFICULTY_COLORS[course.difficulty] || 'bg-slate-100 text-slate-600'}`}>
                  {course.difficulty}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2 mt-auto">
                <span>🕒 {course.duration}</span>
                <span className="font-medium text-slate-600">{course.platform}</span>
              </div>
              <a
                href={course.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline text-xs py-1.5 text-center"
              >
                Open Course ↗
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
