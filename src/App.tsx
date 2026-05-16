import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { User, Role } from './types';
import { api } from './api';
import { 
  Briefcase, 
  User as UserIcon, 
  LogOut, 
  PlusCircle, 
  FileText, 
  Search, 
  Bell, 
  LayoutDashboard,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Modules (will be implemented in separate files)
import Login from './components/Login';
import Register from './components/Register';
import JobSearch from './components/JobSearch';
import Profile from './components/Profile';
import EmployerDashboard from './components/EmployerDashboard';
import Applications from './components/Applications';
import JobPosting from './components/JobPosting';
import Notifications from './components/Notifications';
import Home from './components/Home';
import Chatbot from './components/Chatbot';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse user', e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      const checkNotifications = async () => {
        try {
          const list = await api.alerts.notifications();
          if (Array.isArray(list)) {
            setUnreadCount(list.filter((n: any) => !n.read).length);
          } else {
            setUnreadCount(0);
          }
        } catch (e) {}
      };
      checkNotifications();
      const interval = setInterval(checkNotifications, 30000); // Check every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogin = (userData: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-950 text-indigo-500">Loading...</div>;

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#050505] text-gray-100 font-sans selection:bg-indigo-500/30">
        <nav className="sticky top-0 z-50 border-b border-indigo-500/10 bg-[#050505]/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link to="/" className="group flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20 transition-transform group-hover:scale-105">
                <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
                  <Briefcase className="h-5 w-5 text-indigo-400" />
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                Career<span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">Pulse</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden items-center gap-6 md:flex">
              <Link to="/jobs" className="text-sm font-medium text-gray-400 transition-colors hover:text-indigo-400">Find Jobs</Link>
              {user?.role === 'STUDENT' && (
                <Link to="/applications" className="text-sm font-medium text-gray-400 transition-colors hover:text-indigo-400">My Applications</Link>
              )}
              {user?.role === 'EMPLOYER' && (
                <Link to="/dashboard" className="text-sm font-medium text-gray-400 transition-colors hover:text-indigo-400">Employer Dashboard</Link>
              )}
              {user ? (
                <div className="flex items-center gap-4">
                  <Link to="/notifications" className="relative p-2 text-gray-400 hover:text-indigo-400 transition-colors">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-pink-500 ring-2 ring-slate-950" />
                    )}
                  </Link>
                  <Link to="/profile" className="flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-1.5 text-sm font-medium text-indigo-300 transition-all hover:bg-indigo-500/10 hover:border-indigo-500/40">
                    <UserIcon className="h-4 w-4" />
                    {user.name}
                  </Link>
                  <button onClick={handleLogout} className="text-gray-400 hover:text-pink-400 transition-colors">
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Log in</Link>
                  <Link to="/register" className="rounded-full bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40 active:scale-95">
                    Sign up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed inset-x-0 z-40 bg-slate-950 p-4 border-b border-white/10 md:hidden"
            >
              <div className="flex flex-col gap-4">
                <Link to="/jobs" onClick={() => setIsMenuOpen(false)}>Jobs</Link>
                {user ? (
                  <>
                    <Link to="/profile" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                    <button onClick={handleLogout} className="text-left text-pink-400">Log out</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>Log in</Link>
                    <Link to="/register" onClick={() => setIsMenuOpen(false)}>Sign up</Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/jobs" element={<JobSearch user={user} />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register onLogin={handleLogin} />} />
            <Route path="/profile" element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />} />
            <Route path="/applications" element={user?.role === 'STUDENT' ? <Applications /> : <Navigate to="/login" />} />
            <Route path="/notifications" element={user ? <Notifications /> : <Navigate to="/login" />} />
            <Route path="/dashboard" element={user?.role === 'EMPLOYER' ? <EmployerDashboard /> : <Navigate to="/login" />} />
            <Route path="/post-job" element={user?.role === 'EMPLOYER' ? <JobPosting /> : <Navigate to="/login" />} />
          </Routes>
        </main>

        {/* Floating Chatbot */}
        <Chatbot />

        <footer className="mt-20 border-t border-white/5 bg-[#050505] py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-4">
              <div className="col-span-2">
                <Link to="/" className="flex items-center gap-2 mb-4">
                   <span className="text-xl font-bold tracking-tight text-white">
                    Career<span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">Pulse</span>
                  </span>
                </Link>
                <p className="text-sm text-gray-500 max-w-xs">
                  Connecting the next generation of talent with world-class opportunities. Build your future with CareerPulse.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-4">Platform</h4>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li><Link to="/jobs" className="hover:text-indigo-400 transition-colors">Browse Jobs</Link></li>
                  <li><Link to="/register" className="hover:text-indigo-400 transition-colors">For Candidates</Link></li>
                  <li><Link to="/register" className="hover:text-indigo-400 transition-colors">For Employers</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-4">Connect</h4>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="hover:text-indigo-400 transition-colors cursor-pointer">Twitter</li>
                  <li className="hover:text-indigo-400 transition-colors cursor-pointer">LinkedIn</li>
                  <li className="hover:text-indigo-400 transition-colors cursor-pointer">Support</li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-white/5 text-center text-xs text-gray-600">
              © 2026 CareerPulse. All rights reserved. Built with Gemini AI.
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
