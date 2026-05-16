import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Briefcase, ArrowRight, Star, Shield, Users, Building, Sparkles } from 'lucide-react';
import { User } from '../types';

export default function Home({ user }: { user: User | null }) {
  return (
    <div className="relative isolate">
      {/* Background Glows */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute top-1/2 right-1/4 h-[400px] w-[400px] rounded-full bg-pink-500/10 blur-[100px]" />
      </div>

      <header className="py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-1 text-sm font-semibold text-indigo-400">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Job Matching Now Live</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-white md:text-7xl">
            Find your <span className="text-indigo-500">Dream Career</span> in the Digital Age
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-400">
            CareerPulse connects high-growth companies with exceptional student talent. 
            Automated matching, verified profiles, and seamless applications.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              to="/jobs"
              className="rounded-full bg-indigo-600 px-8 py-3 text-lg font-semibold text-white shadow-xl shadow-indigo-500/20 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40 active:scale-95 flex items-center gap-2"
            >
              Explore Jobs <ArrowRight className="h-5 w-5" />
            </Link>
            {!user && (
              <Link to="/register" className="text-lg font-semibold leading-6 text-white hover:text-indigo-400 transition-colors">
                Join our platform <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>
        </motion.div>
      </header>

      {/* Stats Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 gap-y-16 text-center lg:grid-cols-3">
          {[
            { label: 'Active Jobs', value: '12,000+', icon: Briefcase },
            { label: 'Registered Students', value: '50k+', icon: Users },
            { label: 'Partner Companies', value: '1,200+', icon: Building },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
                <stat.icon className="h-6 w-6" />
              </div>
              <dt className="text-base leading-7 text-gray-500">{stat.label}</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                {stat.value}
              </dd>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Trust Badges */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Why Choose CareerPulse?</h2>
            <p className="mt-6 text-lg leading-8 text-gray-400">
              We've built the most efficient way for students to transition into their professional lives.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {[
                {
                  id: 1,
                  name: 'Verified Employers',
                  description: 'Every employer on our platform is thoroughly vetted for authenticity and job quality.',
                  icon: Shield,
                },
                {
                  id: 2,
                  name: 'AI Matching',
                  description: 'Our proprietary algorithm matches your skills and interests with the perfect opportunities.',
                  icon: Sparkles,
                },
                {
                  id: 3,
                  name: 'Career Support',
                  description: 'Get reviews on your resume and interview preparation tips directly from our AI career coach.',
                  icon: Star,
                },
              ].map((feature) => (
                <div key={feature.id} className="group relative flex flex-col items-center text-center p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all hover:border-indigo-500/30">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <dt className="text-xl font-bold leading-7 text-white">{feature.name}</dt>
                  <dd className="mt-4 flex flex-auto flex-col text-sm leading-7 text-gray-500">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
