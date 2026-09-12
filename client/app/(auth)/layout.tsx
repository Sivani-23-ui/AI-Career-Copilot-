import Link from 'next/link';
import { Brain } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-700 hover:text-blue-600 transition-colors">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">AI Career Copilot</span>
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        {children}
      </main>

      {/* Footer note */}
      <footer className="text-center pb-6 text-xs text-slate-400">
        Your data is stored securely and never sold to third parties.
      </footer>
    </div>
  );
}
