import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { motion } from 'motion/react';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

export default function Login({ onLogin }: { onLogin: (u: any, t: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.auth.login({ email, password });
      onLogin(res.user, res.token);
      navigate('/');
    } catch (err: any) {
      setError(err.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
      >
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-white">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-500">Sign in to your CareerPulse account</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-pink-500/10 border border-pink-500/20 p-4 text-sm text-pink-400">
            <p className="font-bold mb-1">Login Failed</p>
            <p className="opacity-80">{error}</p>
            <p className="mt-2 text-[11px] text-pink-500/60 uppercase tracking-wider font-bold">Tip: Employers must register before first login.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <input
                type="email"
                required
                className="w-full rounded-xl bg-slate-900 border border-white/10 px-10 py-2.5 text-white outline-none focus:border-indigo-500 transition-colors"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <input
                type="password"
                required
                className="w-full rounded-xl bg-slate-900 border border-white/10 px-10 py-2.5 text-white outline-none focus:border-indigo-500 transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Signing in...' : (
              <>
                Sign In <LogIn className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <span className="text-gray-500">Don't have an account? </span>
          <Link to="/register" className="font-bold text-indigo-400 hover:text-indigo-300">
            Create an account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
