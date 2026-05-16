import { useState, useEffect } from 'react';
import { api } from '../api';
import { Application, Job } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  Download, 
  ExternalLink,
  Clock,
  Plus,
  Eye,
  FileText,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmployerDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewingApp, setViewingApp] = useState<Application | null>(null);
  const [appFilter, setAppFilter] = useState<string>('ALL');

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [apps, myJobs, myStats] = await Promise.all([
        api.applications.employer(),
        api.jobs.my(),
        api.applications.stats()
      ]);
      setApplications(apps);
      setJobs(myJobs);
      setStats(myStats);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id: number, status: string) => {
    await api.applications.updateStatus(id, status);
    loadData();
  };

  const handleDeleteJob = async (id: number) => {
    if (confirm('Delete this job?')) {
      await api.jobs.delete(id);
      loadData();
    }
  };

  const filteredApplications = applications.filter(app => 
    appFilter === 'ALL' ? true : app.status === appFilter
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Employer Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your job postings and applicants.</p>
        </div>
        <Link 
          to="/post-job"
          className="flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all text-center justify-center"
        >
          <Plus className="h-4 w-4" /> Post New Job
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadData} className="font-bold underline">Retry</button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Postings', value: stats?.totalJobs || 0, color: 'from-blue-500/20 to-indigo-500/20', icon: Briefcase, text: 'text-blue-400' },
          { label: 'Total Applicants', value: stats?.totalApplicants || 0, color: 'from-purple-500/20 to-pink-500/20', icon: Users, text: 'text-purple-400' },
          { label: 'Shortlisted', value: stats?.shortlisted || 0, color: 'from-green-500/20 to-emerald-500/20', icon: CheckCircle2, text: 'text-green-400' },
          { label: 'Pending Review', value: stats?.pending || 0, color: 'from-orange-500/20 to-yellow-500/20', icon: Clock, text: 'text-orange-400' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br ${stat.color} p-6 backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{stat.label}</p>
                <p className={`mt-2 text-3xl font-bold text-white`}>{stat.value}</p>
              </div>
              <div className={`rounded-2xl bg-white/10 p-3 ${stat.text}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-12 lg:grid-cols-3">
        {/* Jobs List */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white px-2">
            <Briefcase className="h-5 w-5 text-gray-500" /> Your Postings
          </h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {jobs.length > 0 ? jobs.map(job => (
              <div key={job.id} className="group p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all border-l-4 border-l-indigo-500/50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{job.title}</h3>
                    <p className="text-[10px] text-gray-600 mt-1 uppercase tracking-tighter">{job.category} • {job.location}</p>
                  </div>
                  <button onClick={() => handleDeleteJob(job.id)} className="text-gray-700 hover:text-pink-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )) : (
              <div className="p-8 rounded-2xl border border-dashed border-white/10 text-center text-gray-600 text-sm">
                No active postings
              </div>
            )}
          </div>
        </div>

        {/* Applications List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-lg font-bold text-white px-2">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-400" /> Recent Applications
            </div>
            
            <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-white/5 border border-white/5">
              {['ALL', 'PENDING', 'SHORTLISTED', 'APPROVED', 'REJECTED'].map((f) => (
                <button
                  key={f}
                  onClick={() => setAppFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                    appFilter === f 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {f === 'ALL' ? 'All' : f === 'SHORTLISTED' ? 'Shortlisted' : f === 'APPROVED' ? 'Approved' : f === 'REJECTED' ? 'Rejected' : 'Pending'}
                </button>
              ))}
            </div>
          </h2>
          <div className="rounded-3xl border border-white/10 bg-white/[0.01] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Applicant</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Position</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredApplications.map(app => (
                    <tr key={app.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white">{app.applicant_name}</span>
                          <span className="text-xs text-gray-500">{app.applicant_email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-gray-400 px-2 py-1 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                          {app.job_title}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          app.status === 'SHORTLISTED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                          app.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]' :
                          app.status === 'REJECTED' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' :
                          'bg-indigo-500/5 text-indigo-400 border border-indigo-500/20'
                        }`}>
                          {app.status === 'PENDING' ? <Clock className="h-3 w-3 animate-pulse" /> : 
                           app.status === 'SHORTLISTED' ? <CheckCircle2 className="h-3 w-3" /> : 
                           app.status === 'APPROVED' ? <Check className="h-3 w-3" /> : 
                           <XCircle className="h-3 w-3" />}
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setViewingApp(app)}
                            className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-slate-700 transition-all"
                            title="View Cover Letter"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                          {app.resume_path && (
                            <a 
                              href={app.resume_path} 
                              target="_blank" 
                              rel="noreferrer"
                              className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-indigo-600 transition-all"
                              title="View Resume"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          )}
                          <div className="w-px h-4 bg-white/10 mx-1" />
                          <button 
                            onClick={() => handleStatus(app.id, 'SHORTLISTED')}
                            className={`p-2 rounded-xl transition-all ${app.status === 'SHORTLISTED' ? 'bg-green-600 text-white' : 'bg-green-500/10 text-green-400 hover:bg-green-600 hover:text-white'}`}
                            title="Shortlist"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleStatus(app.id, 'APPROVED')}
                            className={`p-2 rounded-xl transition-all ${app.status === 'APPROVED' ? 'bg-emerald-600 text-white' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-600 hover:text-white'}`}
                            title="Approve"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleStatus(app.id, 'REJECTED')}
                            className={`p-2 rounded-xl transition-all ${app.status === 'REJECTED' ? 'bg-pink-600 text-white' : 'bg-pink-500/10 text-pink-400 hover:bg-pink-600 hover:text-white'}`}
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {applications.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center text-gray-600 text-sm italic">
                        <div className="flex flex-col items-center gap-2">
                           <Users className="h-8 w-8 opacity-20" />
                           No applications received yet.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
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
                  <h2 className="text-xl font-bold text-white">Cover Letter</h2>
                  <p className="text-xs text-gray-500 mt-1">From {viewingApp.applicant_name} for {viewingApp.job_title}</p>
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
                  {viewingApp.cover_letter || "No custom cover letter provided for this application."}
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
