import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Check, Clock, Trash2, Mail } from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  date: string;
}

interface Subscription {
  id: number;
  category: string;
  location: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [nots, subs] = await Promise.all([
        api.alerts.notifications(),
        api.alerts.list()
      ]);
      setNotifications(Array.isArray(nots) ? nots : []);
      setSubscriptions(Array.isArray(subs) ? subs : []);
    } catch (err) {
      setNotifications([]);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    await api.alerts.markRead();
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteSubscription = async (id: number) => {
    await api.alerts.delete(id);
    setSubscriptions(subscriptions.filter(s => s.id !== id));
  };

  if (loading) return <div className="flex h-64 items-center justify-center text-indigo-400"><Clock className="animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Bell className="h-8 w-8 text-indigo-400" /> Notifications & Alerts
          </h1>
          <p className="text-gray-500 text-sm mt-1">Stay updated with your job search and applications.</p>
        </div>
        {notifications.some(n => !n.read) && (
          <button 
            onClick={markAllAsRead}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-500/5 border border-indigo-500/10 transition-all"
          >
            <Check className="h-3.5 w-3.5" /> Mark all as read
          </button>
        )}
      </div>

      <div className="grid gap-12 md:grid-cols-3">
        {/* Alerts Section */}
        <div className="md:col-span-1 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail className="h-5 w-5 text-indigo-400" /> Job Alerts
            </h2>
          </div>
          
          <div className="space-y-4">
            {subscriptions.length > 0 ? subscriptions.map(sub => (
              <div key={sub.id} className="group relative p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-white">{sub.category || 'All Categories'}</p>
                    <p className="text-xs text-gray-500 mt-1">{sub.location || 'All Locations'}</p>
                  </div>
                  <button 
                    onClick={() => deleteSubscription(sub.id)}
                    className="p-1.5 rounded-lg text-gray-600 hover:text-pink-500 hover:bg-pink-500/10 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )) : (
              <div className="p-8 rounded-2xl border border-dashed border-white/10 text-center">
                <p className="text-sm text-gray-600">No active job alerts</p>
                <p className="text-[10px] text-gray-700 mt-1">Setup alerts on the search page</p>
              </div>
            )}
          </div>
        </div>

        {/* Notifications Feed */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-white px-2">Recent Notifications</h2>
          <div className="space-y-4">
            {notifications.length > 0 ? notifications.map(not => (
              <motion.div
                key={not.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-5 rounded-3xl border transition-all ${
                  not.read 
                  ? 'bg-white/[0.01] border-white/5 opacity-60' 
                  : 'bg-indigo-500/5 border-indigo-500/20 shadow-lg shadow-indigo-500/5'
                }`}
              >
                <div className="flex gap-4">
                  <div className={`mt-1 flex-shrink-0 rounded-xl p-2 ${not.read ? 'bg-white/5 text-gray-500' : 'bg-indigo-500/20 text-indigo-400'}`}>
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className={`text-sm font-bold ${not.read ? 'text-gray-400' : 'text-white'}`}>{not.title}</h3>
                      <span className="text-[10px] text-gray-600 font-mono">{new Date(not.date).toLocaleDateString()}</span>
                    </div>
                    <p className={`mt-1.5 text-xs leading-relaxed ${not.read ? 'text-gray-500' : 'text-gray-400'}`}>{not.message}</p>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="p-20 rounded-[2rem] border border-white/5 bg-white/[0.01] text-center flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center text-gray-700">
                  <Bell className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-400">All caught up!</p>
                  <p className="text-xs text-gray-600">You'll see updates about your applications here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
