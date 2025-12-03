'use client';

import AnimatedCounter from './AnimatedCounter';

export default function InteractiveStats() {
  return (
    <section
      id="stats"
      className="relative py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden"
    >
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Powerful by the Numbers
            </span>
          </h2>
          <p className="text-white/70 text-lg">Trusted by teams worldwide</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <AnimatedCounter target={10000} suffix="+" />
            <p className="text-white/70 mt-4 text-lg">Active Users</p>
          </div>

          <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <AnimatedCounter target={500000} suffix="+" />
            <p className="text-white/70 mt-4 text-lg">Messages Sent</p>
          </div>

          <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <AnimatedCounter target={99} suffix="%" />
            <p className="text-white/70 mt-4 text-lg">Uptime</p>
          </div>
        </div>
      </div>
    </section>
  );
}

