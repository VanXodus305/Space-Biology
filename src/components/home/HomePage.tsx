"use client";

import { AboutSection } from "./About";
import { HeroSection } from "./Hero";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Terminal } from "lucide-react";

export const HomePage: React.FC = () => {
  return (
    <div className="bg-slate-950 text-slate-200 min-h-screen">
      <HeroSection />

      <section className="relative w-full bg-slate-950 py-28 border-t border-slate-800/50">
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-500 mb-4">
              Interactive Data
            </p>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
              Explore the Knowledge Graph
            </h2>

            <p className="text-base md:text-lg text-slate-400 mb-4 max-w-2xl mx-auto leading-relaxed">
              Navigate 74,000+ interconnected relationships from space biology
              research through a 3D force-directed visualization.
            </p>
            <p className="text-sm text-slate-500 mb-10">
              Powered by react-force-graph with real-time interaction
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  href="/explore"
                  className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white text-base font-semibold rounded-lg flex items-center gap-2.5 transition-colors shadow-lg shadow-cyan-500/20"
                >
                  Launch Knowledge Graph
                  <ArrowRight className="w-5 h-5" aria-hidden />
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  href="/search"
                  className="px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 text-slate-200 text-base font-semibold rounded-lg flex items-center gap-2.5 transition-colors"
                >
                  <Terminal className="w-5 h-5" aria-hidden />
                  Query Database
                </Link>
              </motion.div>
            </div>

            <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto">
              {[
                { value: "74,250+", label: "Verified Relationships" },
                { value: "Interactive", label: "Drag, Zoom, Explore" },
                { value: "Real-time", label: "Dynamic Force Layout" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-cyan-400 tabular-nums mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <AboutSection />
    </div>
  );
};
