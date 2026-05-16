import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { motion } from 'motion/react';
import { Mail, Lock, User, UserPlus, Briefcase, GraduationCap } from 'lucide-react';
import { Role } from '../types';

export default function Register({ onLogin }: { onLogin: (u: any, t: string) => void }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'STUDENT' as Role });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.auth.register(formData);
      const res = await api.auth.login({ email: formData.email, password: formData.password });
      onLogin(res.user, res.token);
      navigate('/');
    } catch (err: any) {
      setError(err.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
      >
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-white">Join CareerPulse</h2>
          <p className="mt-2 text-sm text-gray-500">Start your journey today</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-pink-500/10 border border-pink-500/20 p-3 text-sm text-pink-400 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'STUDENT' })}
              className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all ${
                formData.role === 'STUDENT' 
                ? 'border-indigo-500 bg-indigo-500/10' 
                : 'border-white/10 bg-slate-900/50 hover:bg-slate-900'
              }`}
            >
              <GraduationCap className={`h-6 w-6 ${formData.role === 'STUDENT' ? 'text-indigo-400' : 'text-gray-500'}`} />
              <span className={`text-xs font-bold ${formData.role === 'STUDENT' ? 'text-white' : 'text-gray-500'}`}>Candidate</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'EMPLOYER' })}
              className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all ${
                formData.role === 'EMPLOYER' 
                ? 'border-pink-500 bg-pink-500/10' 
                : 'border-white/10 bg-slate-900/50 hover:bg-slate-900'
              }`}
            >
              <Briefcase className={`h-6 w-6 ${formData.role === 'EMPLOYER' ? 'text-pink-400' : 'text-gray-500'}`} />
              <span className={`text-xs font-bold ${formData.role === 'EMPLOYER' ? 'text-white' : 'text-gray-500'}`}>Employer</span>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <input
                type="text"
                required
                className="w-full rounded-xl bg-slate-900 border border-white/10 px-10 py-2.5 text-white outline-none focus:border-indigo-500 transition-colors"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <input
                type="email"
                required
                className="w-full rounded-xl bg-slate-900 border border-white/10 px-10 py-2.5 text-white outline-none focus:border-indigo-500 transition-colors"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 ${
              formData.role === 'STUDENT' 
              ? 'bg-indigo-600 shadow-indigo-500/20 hover:bg-indigo-500' 
              : 'bg-pink-600 shadow-pink-500/20 hover:bg-pink-500'
            }`}
          >
            {loading ? 'Creating account...' : (
              <>
                Create Account <UserPlus className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <span className="text-gray-500">Already have an account? </span>
          <Link to="/login" className="font-bold text-indigo-400 hover:text-indigo-300">
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
