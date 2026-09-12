'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { setToken } from '@/lib/auth';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const DEMO_EMAIL = 'demo@careercopilot.com';
const DEMO_PASSWORD = 'Demo@12345';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const doLogin = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    setToken(res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}! 👋`);
    router.push('/overview');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await doLogin(form.email, form.password);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setDemoLoading(true);
    setForm({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
    try {
      await doLogin(DEMO_EMAIL, DEMO_PASSWORD);
    } catch (err: any) {
      // If demo account doesn't exist yet, surface a clear message
      toast.error(
        err.response?.data?.message ||
        'Demo login failed. Please run: cd server && node scripts/seedDemoUser.js'
      );
    } finally {
      setDemoLoading(false);
    }
  };

  const anyLoading = loading || demoLoading;

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="jane@example.com"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="Your password"
                className="input-field pr-10"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={anyLoading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
          <div className="relative text-center"><span className="bg-white px-3 text-xs text-slate-400">or</span></div>
        </div>

        {/* Demo account button */}
        <button
          onClick={handleDemo}
          disabled={anyLoading}
          className="btn-secondary w-full text-sm flex items-center justify-center gap-2"
        >
          {demoLoading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Logging in as Demo...</>
          ) : (
            '🧪 Try with Demo Account'
          )}
        </button>

        <p className="text-center text-sm text-slate-500 mt-5">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-blue-600 hover:underline font-medium">Create one free</Link>
        </p>
      </div>
    </div>
  );
}
