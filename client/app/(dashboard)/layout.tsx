'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Brain, LayoutDashboard, FileText, Compass, BarChart2,
  BookOpen, GraduationCap, MessageSquare, User, LogOut, Menu, X, ChevronRight,
} from 'lucide-react';
import { logout, getCurrentUser } from '@/lib/auth';
import type { User as UserType } from '@/types';

const navItems = [
  { href: '/overview',   label: 'Overview',        icon: LayoutDashboard },
  { href: '/resume',     label: 'Resume Analyzer',  icon: FileText },
  { href: '/career',     label: 'Career Explorer',  icon: Compass },
  { href: '/skills',     label: 'Skill Gap',        icon: BarChart2 },
  { href: '/roadmap',    label: 'Learning Roadmap', icon: BookOpen },
  { href: '/courses',    label: 'Courses',          icon: GraduationCap },
  { href: '/interview',  label: 'Mock Interview',   icon: MessageSquare },
  { href: '/profile',    label: 'Profile',          icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Load user from localStorage first (fast), then verify with API
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));

    getCurrentUser().then((u) => {
      if (!u) {
        router.push('/login');
      } else {
        setUser(u);
        localStorage.setItem('user', JSON.stringify(u));
      }
    });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    logout();
  };

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full bg-white border-r border-slate-200 ${mobile ? 'w-72' : 'w-64'}`}>
      {/* Logo */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-900">Career Copilot</span>
        </div>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User info */}
      {user && (
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.college || user.degree || 'Student'}</p>
            </div>
          </div>
          {user.selectedCareer && (
            <div className="mt-3 px-3 py-1.5 bg-blue-50 rounded-lg">
              <p className="text-xs text-slate-500">Career Goal</p>
              <p className="text-xs font-semibold text-blue-700 truncate">{user.selectedCareer}</p>
            </div>
          )}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              {active && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50 h-full">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-600">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-sm">AI Career Copilot</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
