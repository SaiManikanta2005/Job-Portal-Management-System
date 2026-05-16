import { useState, useEffect } from 'react';
import { api } from '../api';
import { Application } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, CheckCircle2, XCircle, MapPin, Briefcase, FileSearch, FileText } from 'lucide-react';

export default function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredStatus, setFilteredStatus] = useState<string>('ALL');
  const [viewingApp, setViewingApp] = useState<Application | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.applications.my();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError('Could not load applications.');
    } finally {
      setLoading(false);
    }
  };

  const filteredApps = applications.filter(app => 
    filteredStatus === 'ALL' ? true : app.status === filteredStatus
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Your Applications</h1>
          <p className="text-gray-500 text-sm mt-1">Track the status of your job applications in real-time.</p>
        </div>

        <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/5">
          {['ALL', 'PENDING', 'SHORTLISTED', 'APPROVED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilteredStatus(status)}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                filteredStatus === status 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {status === 'PENDING' ? 'Pending' : status === 'ALL' ? 'All' : status === 'SHORTLISTED' ? 'Shortlisted' : status === 'APPROVED' ? 'Approved' : 'Rejected'}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadApplications} className="font-bold underline">Retry</button>
        </div>
      )}

      <div className="grid gap-6">
        {loading ? (
           Array.from({ length: 3 }).map((_, i) => (
             <div key={i} className="h-32 rounded-3xl bg-white/5 animate-pulse" />
           ))
        ) : filteredApps.length > 0 ? (
          filteredApps.map((app) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all"
            >
              <div className="flex items-start gap-5">
                <div className="h-12 w-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-gray-400">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{app.job_title}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1.5 text-sm text-gray-500">
                      <MapPin className="h-4 w-4" /> {app.job_location}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Clock className="h-4 w-4" /> Applied on {new Date(app.applied_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 md:mt-0 flex items-center gap-4">
                 <button 
                    onClick={() => setViewingApp(app)}
                    className="p-2.5 rounded-2xl bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                    title="View your cover letter"
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                 <div className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${
                    app.status === 'SHORTLISTED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    app.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    app.status === 'REJECTED' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' :
                    'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                 }`}>
                   {app.status === 'PENDING' ? <Clock className="h-3.5 w-3.5 animate-pulse" /> : 
                    app.status === 'SHORTLISTED' ? <CheckCircle2 className="h-3.5 w-3.5" /> : 
                    app.status === 'APPROVED' ? <CheckCircle2 className="h-3.5 w-3.5" /> : 
                    <XCircle className="h-3.5 w-3.5" />}
                   {app.status === 'PENDING' ? 'Under Review (Pending)' : app.status}
                 </div>
              </div>
            </motion.div>
          ))
        ) : (
           <div className="py-20 text-center flex flex-col items-center">
              <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <FileSearch className="h-10 w-10 text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-400">No applications yet</h3>
              <p className="text-gray-600 mt-2">Start exploring jobs and apply to see them here.</p>
           </div>
        )}
      </div>

      {/* Cover Letter Modal */}
      <motion.div
        initial={false}
        animate={viewingApp ? { opacity: 1, pointerEvents: 'auto' } : { opacity: 0, pointerEvents: 'none' }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      >
        <AnimatePresence>
          {viewingApp && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-slate-900 p-8 shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Your Cover Letter</h2>
                  <p className="text-xs text-gray-500 mt-1">For {viewingApp.job_title}</p>
                </div>
                <button 
                  onClick={() => setViewingApp(null)}
                  className="p-2 rounded-full hover:bg-white/5 text-gray-500 hover:text-white transition-all"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 whitespace-pre-wrap text-sm text-gray-300 leading-relaxed font-sans italic">
                  {viewingApp.cover_letter || "No custom cover letter was provided with this application."}
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => setViewingApp(null)}
                  className="px-6 py-2 rounded-xl bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
                >
                  Close
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
