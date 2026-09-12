'use client';
import Link from 'next/link';
import { Brain, Target, BookOpen, MessageSquare, BarChart2, Zap, CheckCircle, ArrowRight, Users, Award, TrendingUp } from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI Resume Analyzer', description: 'Upload your resume and let AI extract your skills, identify strengths, and suggest improvements instantly.' },
  { icon: Target, title: 'Career Recommendation', description: 'Get personalized career path suggestions matched to your skills and interests.' },
  { icon: BarChart2, title: 'Skill Gap Analysis', description: 'See exactly which skills you need to land your dream job, with a transparency score.' },
  { icon: BookOpen, title: 'Learning Roadmap', description: 'Get a weekly personalized study plan to close your skill gaps efficiently.' },
  { icon: Zap, title: 'Course Recommendations', description: 'Curated free and paid courses from top platforms to help you learn fast.' },
  { icon: MessageSquare, title: 'AI Mock Interview', description: 'Practice real interview questions and get instant AI feedback on your answers.' },
];

const steps = [
  { step: '01', title: 'Create Your Profile', desc: 'Sign up with your email, enter your college, degree, and current skills.' },
  { step: '02', title: 'Analyze Your Resume', desc: 'Paste your resume text and get an instant AI-powered skills extraction and analysis.' },
  { step: '03', title: 'Explore Career Paths', desc: 'See which careers suit you best and understand exactly what skills you need.' },
  { step: '04', title: 'Follow Your Roadmap', desc: 'Get a personalized weekly learning plan and track your progress week by week.' },
  { step: '05', title: 'Practice Interviews', desc: 'Use the AI mock interview to prepare with role-specific questions and real-time feedback.' },
];

const stats = [
  { value: '6+', label: 'AI-Powered Features' },
  { value: '100%', label: 'Free for Students' },
  { value: '5 min', label: 'To Get Your First Roadmap' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">AI Career Copilot</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors">
              Login
            </Link>
            <Link href="/signup" className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <Zap className="w-3 h-3" />
          Powered by AI • Built for Students
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-6">
          Your AI-Powered<br />
          <span className="text-blue-600">Career Guidance</span> Partner
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Stop guessing about your career path. AI Career Copilot analyzes your skills, identifies gaps,
          creates personalized learning roadmaps, and prepares you for job interviews — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/signup" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors flex items-center gap-2 text-base">
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/login" className="border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold px-8 py-3.5 rounded-xl transition-colors text-base">
            I have an account
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center justify-center gap-12">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-bold text-slate-900">{value}</div>
              <div className="text-sm text-slate-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Problem */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Does this sound familiar?</h2>
            <p className="text-lg text-slate-500 mb-10">Many students face the same challenges when planning their careers.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { q: '"I have a resume but I don\'t know what skills I\'m missing."', icon: '😕' },
              { q: '"There are so many career options — I don\'t know which one is right for me."', icon: '🤔' },
              { q: '"I want to prepare for interviews but don\'t know where to start."', icon: '😰' },
            ].map(({ q, icon }) => (
              <div key={q} className="bg-white rounded-xl p-6 border border-slate-200 text-left">
                <span className="text-3xl">{icon}</span>
                <p className="mt-3 text-slate-600 italic text-sm">{q}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Everything you need to launch your career</h2>
            <p className="text-slate-500 text-lg">Six powerful AI tools working together to guide your career journey.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">How it works</h2>
            <p className="text-slate-500 text-lg">From signup to interview-ready in 5 simple steps.</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-6">
            {steps.map(({ step, title, desc }) => (
              <div key={step} className="flex gap-5 bg-white rounded-xl p-6 border border-slate-200">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white font-bold text-sm rounded-xl flex items-center justify-center">
                  {step}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-2xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to start your career journey?</h2>
          <p className="text-blue-100 text-lg mb-8">Join hundreds of students already using AI Career Copilot. It is completely free.</p>
          <Link href="/signup" className="bg-white text-blue-600 font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors inline-flex items-center gap-2">
            Create Your Free Account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-700 text-sm">AI Career Copilot</span>
          </div>
          <p className="text-slate-400 text-xs">
            Built for students. This is a prototype — career guidance is indicative, not a guarantee of employment.
          </p>
        </div>
      </footer>
    </div>
  );
}
