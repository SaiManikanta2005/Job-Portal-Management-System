import { useState, useEffect } from 'react';
import { api } from '../api';
import { User } from '../types';
import { motion } from 'motion/react';
import { User as UserIcon, Mail, BookOpen, Briefcase, FileUp, Save, CheckCircle2, Download } from 'lucide-react';

export default function Profile({ user, setUser }: { user: User, setUser: (u: User) => void }) {
  const [formData, setFormData] = useState({ bio: user.bio || '', skills: user.skills || '' });
  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.profile.get().then(data => {
      setFormData({ bio: data.bio || '', skills: data.skills || '' });
      setUser(data);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append('bio', formData.bio);
    data.append('skills', formData.skills);
    if (resume) data.append('resume', resume);

    try {
      const res = await api.profile.update(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      // Refresh profile
      const updated = await api.profile.get();
      setUser(updated);
    } catch (err) {
      alert('Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-6 mb-12">
        <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
          <UserIcon className="h-12 w-12" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">{user.name}</h1>
          <p className="text-gray-500 flex items-center gap-2 mt-1">
            <Mail className="h-4 w-4" /> {user.email}
          </p>
          <span className="inline-block mt-3 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-400 border border-indigo-500/20">
            {user.role} Account
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-8 md:grid-cols-2">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
        >
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-400 mb-4">
              <BookOpen className="h-4 w-4" /> Professional Bio
            </label>
            <textarea
              className="w-full h-32 rounded-2xl bg-slate-950 border border-white/10 p-4 text-sm text-white outline-none focus:border-indigo-500 transition-colors resize-none"
              placeholder="Tell employers about yourself..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>

          <div>
             <label className="flex items-center gap-2 text-sm font-bold text-gray-400 mb-4">
              <Briefcase className="h-4 w-4" /> Skills & Expertise
            </label>
            <input
              type="text"
              className="w-full rounded-xl bg-slate-950 border border-white/10 p-4 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
              placeholder="e.g. React, Java, UI/UX"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
        >
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-400 mb-4">
              <FileUp className="h-4 w-4" /> Resume / CV
            </label>
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 p-8 hover:border-indigo-500/50 transition-colors group cursor-pointer relative overflow-hidden">
               {resume ? (
                 <div className="text-center">
                    <CheckCircle2 className="h-10 w-10 text-green-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-white">{resume.name}</p>
                 </div>
               ) : (
                 <>
                    <FileUp className="h-10 w-10 text-gray-600 mb-2 group-hover:text-indigo-400 transition-colors" />
                    <p className="text-sm text-gray-500">Tap to upload file</p>
                    <p className="text-[10px] text-gray-600 mt-1">PDF, DOC (Max 5MB)</p>
                 </>
               )}
               <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => setResume(e.target.files?.[0] || null)}
               />
            </div>
            {user.resume_path && (
               <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-xs text-gray-500">Current Resume:</span>
                  <a 
                    href={user.resume_path} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300"
                  >
                    <Download className="h-3 w-3" /> View Resume
                  </a>
               </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-4 text-sm font-bold text-black shadow-lg hover:bg-indigo-400 hover:text-white transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Saving Changes...' : (
              success ? (
                <>Saved Successfully <CheckCircle2 className="h-4 w-4" /></>
              ) : (
                <>Save Profile <Save className="h-4 w-4" /></>
              )
            )}
          </button>
        </motion.div>
      </form>
    </div>
  );
}
