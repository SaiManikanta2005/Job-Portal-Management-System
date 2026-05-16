import { useState, useEffect } from 'react';
import { api } from '../api';
import { Job, User } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Briefcase, Filter, Calendar, DollarSign, CheckCircle2, Bell, Sparkles, Wand2 } from 'lucide-react';
import { geminiService } from '../services/geminiService';

export default function JobSearch({ user }: { user: User | null }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', location: '', experience: '' });
  const [appliedJobs, setAppliedJobs] = useState<number[]>([]);
  const [confirmingJob, setConfirmingJob] = useState<Job | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [smartMatchIds, setSmartMatchIds] = useState<number[]>([]);

  const handleSmartMatch = async () => {
    if (!user) {
      alert('Please log in to use Smart Match');
      return;
    }
    setIsMatching(true);
    try {
      const suggestions = await geminiService.getSmartMatchSuggestions(user, jobs);
      setSmartMatchIds(suggestions);
      if (suggestions.length === 0) {
        alert('No specific matches found. Try updating your profile!');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to get smart suggestions');
    } finally {
      setIsMatching(false);
    }
  };

  useEffect(() => {
    loadJobs();
    if (user?.role === 'STUDENT') {
      api.applications.my().then(apps => {
        if (Array.isArray(apps)) {
          setAppliedJobs(apps.map((a: any) => a.job_id));
        }
      }).catch(console.error);
    }
  }, [filters, user]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await api.jobs.list(filters);
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!confirmingJob || !user) return;
    setApplying(true);
    try {
      await api.applications.apply(confirmingJob.id, coverLetter);
      setAppliedJobs([...appliedJobs, confirmingJob.id]);
      setConfirmingJob(null);
      setCoverLetter('');
    } catch (err: any) {
      alert(err.error || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user) return alert('Please login to subscribe');
    try {
      await api.alerts.subscribe({ 
        category: filters.category, 
        location: filters.location 
      });
      alert('Alert created! We\'ll notify you when matching jobs are posted.');
    } catch (err) {
      alert('Failed to subscribe');
    }
  };

  const filteredJobs = jobs.sort((a, b) => {
    const aIsMatch = smartMatchIds.includes(a.id);
    const bIsMatch = smartMatchIds.includes(b.id);
    if (aIsMatch && !bIsMatch) return -1;
    if (!aIsMatch && bIsMatch) return 1;
    return 0;
  });

  return (
    <div className="space-y-8">
      {/* Search & Filters */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="grid gap-4 md:grid-cols-3 flex-1">
            <div className="relative">
              <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-white/10 px-10 py-2.5 text-xs text-white focus:border-indigo-500 outline-none appearance-none"
              >
                <option value="">All Categories</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Data Science">Data Science</option>
              </select>
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <select
                value={filters.experience}
                onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-white/10 px-10 py-2.5 text-xs text-white focus:border-indigo-500 outline-none appearance-none"
              >
                <option value="">Any Experience</option>
                <option value="Fresher">Fresher</option>
                <option value="1-3 Years">1-3 Years</option>
                <option value="Senior">Senior</option>
                <option value="Entry Level">Entry Level</option>
              </select>
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <input
                type="text"
                placeholder="City/Remote..."
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-white/10 px-10 py-2.5 text-xs text-white focus:border-indigo-500 outline-none"
              />
            </div>
          </div>
          
          <div className="flex gap-2 min-w-max">
            <button 
              onClick={() => setFilters({ category: '', location: '', experience: '' })}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-gray-400 hover:text-white transition-colors"
            >
              Reset
            </button>
            <button 
              onClick={handleSubscribe}
              className="flex items-center gap-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-4 py-2.5 text-xs font-bold text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all shadow-lg shadow-indigo-500/5 active:scale-95"
            >
              <Bell className="h-4 w-4" /> Get Alerts
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {confirmingJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-3xl border border-indigo-500/20 bg-slate-900 p-8 shadow-2xl shadow-indigo-500/20"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 mb-6">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-white">Confirm Application</h2>
              <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                <p className="text-sm font-bold text-indigo-400">{confirmingJob.title}</p>
                <div className="flex flex-wrap gap-3 text-[11px] text-gray-500">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {confirmingJob.location}</span>
                  <span className="flex items-center gap-1 text-green-400 font-bold"><span className="text-xs">₹</span> {confirmingJob.salary}</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-400 leading-relaxed italic">
                Note: Your professional profile and current resume will be submitted.
              </p>
              
              <div className="mt-4 space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Add a custom cover letter (Optional)</label>
                <textarea 
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell the recruiter why you're a great fit..."
                  className="w-full h-32 rounded-2xl bg-white/5 border border-white/10 p-4 text-xs text-white focus:border-indigo-500 outline-none resize-none placeholder:text-gray-700"
                />
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => setConfirmingJob(null)}
                  className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-bold text-gray-500 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleApply}
                  disabled={applying}
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-50"
                >
                  {applying ? 'Applying...' : 'Confirm & Apply'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Latest Opportunities <span className="text-sm font-normal text-gray-600 ml-2">({jobs.length} found)</span></h2>
        
        {user?.role === 'STUDENT' && (
          <button
            onClick={handleSmartMatch}
            disabled={isMatching}
            className={`flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-bold transition-all active:scale-95 ${
              isMatching 
              ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' 
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 border-transparent text-white shadow-lg shadow-indigo-600/20 hover:scale-105'
            }`}
          >
            {isMatching ? (
              <>
                <Wand2 className="h-4 w-4 animate-spin" />
                Analyzing Profile...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Find AI Matches
              </>
            )}
          </button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-3xl bg-white/5 animate-pulse" />
          ))
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <motion.div
              key={job.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.02] p-6 hover:bg-white/[0.05] hover:border-indigo-500/30 transition-all border-b-4 ${
                smartMatchIds.includes(job.id) ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'border-b-transparent hover:border-b-indigo-500'
              }`}
            >
              {smartMatchIds.includes(job.id) && (
                <div className="absolute -top-3 -right-3 flex items-center gap-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-xl">
                  <Sparkles className="h-3 w-3" /> AI Match
                </div>
              )}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {job.category}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{job.title}</h3>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {job.location}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> {job.experience}
                  </div>
                  <div className="flex items-center gap-1.5 text-green-400">
                    <span className="font-bold">₹</span> {job.salary}
                  </div>
                </div>
                <p className="mt-4 text-xs text-gray-400 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-gray-600 uppercase font-bold tracking-tight">Posted {new Date(job.created_at).toLocaleDateString()}</span>
                {appliedJobs.includes(job.id) ? (
                  <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-xs">
                    <CheckCircle2 className="h-4 w-4" /> Applied
                  </div>
                ) : (
                  <button
                    onClick={() => {
                        if (!user) return alert('Please login to apply');
                        if (user.role !== 'STUDENT') return alert('Only students can apply');
                        setConfirmingJob(job);
                    }}
                    className="rounded-full bg-white px-5 py-2 text-[10px] font-bold text-black hover:bg-indigo-400 hover:text-white transition-all active:scale-95"
                  >
                    Apply Now
                  </button>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
             <div className="mx-auto w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-gray-600" />
             </div>
             <p className="text-gray-500">No jobs found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
