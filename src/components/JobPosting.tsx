import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { motion } from 'motion/react';
import { PlusCircle, ArrowLeft, Send, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function JobPosting() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Engineering',
    location: '',
    experience: 'Fresher',
    salary: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.jobs.create(formData);
      navigate('/dashboard');
    } catch (err) {
      alert('Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-400 transition-colors mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <PlusCircle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Post an Opportunity</h1>
            <p className="text-sm text-gray-500">Reach thousands of talented students instantly.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-400 mb-2">Job Title</label>
              <input
                required
                className="w-full rounded-xl bg-slate-950 border border-white/10 p-3.5 text-sm text-white focus:border-indigo-500 outline-none transition-colors"
                placeholder="e.g. Senior Frontend Developer"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Category</label>
              <select
                className="w-full rounded-xl bg-slate-950 border border-white/10 p-3.5 text-sm text-white focus:border-indigo-500 outline-none transition-colors appearance-none"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Data Science">Data Science</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Location</label>
              <input
                required
                className="w-full rounded-xl bg-slate-950 border border-white/10 p-3.5 text-sm text-white focus:border-indigo-500 outline-none transition-colors"
                placeholder="e.g. New York (Remote)"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div>
               <label className="block text-sm font-bold text-gray-400 mb-2">Experience Level</label>
               <input
                required
                className="w-full rounded-xl bg-slate-950 border border-white/10 p-3.5 text-sm text-white focus:border-indigo-500 outline-none transition-colors"
                placeholder="e.g. 0-2 Years"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              />
            </div>

            <div>
               <label className="block text-sm font-bold text-gray-400 mb-2">Offered Salary</label>
               <input
                required
                className="w-full rounded-xl bg-slate-950 border border-white/10 p-3.5 text-sm text-white focus:border-indigo-500 outline-none transition-colors"
                placeholder="e.g. ₹5,00,000 - ₹8,00,000 / year"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-400 mb-2">Job Description</label>
              <textarea
                required
                className="w-full h-40 rounded-xl bg-slate-950 border border-white/10 p-4 text-sm text-white focus:border-indigo-500 outline-none transition-colors resize-none"
                placeholder="Describe roles, responsibilities, and requirements..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
             <div className="flex items-center gap-2 text-xs text-indigo-400">
               <Sparkles className="h-4 w-4" /> AI will automatically tag this job for optimal search matching.
             </div>
             <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-sm font-bold text-black hover:bg-indigo-400 hover:text-white transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Posting...' : (
                  <>Post Job <Send className="h-4 w-4" /></>
                )}
             </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
