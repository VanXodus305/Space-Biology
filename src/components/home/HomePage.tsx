"use client";

import { AboutSection } from "./About";
import { HeroSection } from "./Hero";
import { motion } from "framer-motion";
import Link from "next/link";
import { BarChart3, Zap } from "lucide-react";

export const HomePage: React.FC = () => {
  return (
    <div className="bg-gray-950 text-white min-h-screen">
      <HeroSection />

      <section className="relative w-full bg-gradient-to-b from-gray-950 via-gray-950 to-gray-950 py-20 overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-slate-900/60 border border-sky-500/20 rounded-2xl p-8 md:p-12 text-center backdrop-blur-sm shadow-xl shadow-sky-500/10"
          >
            <motion.div
              className="mb-6"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="inline-block p-4 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl mb-4 shadow-lg shadow-sky-500/30">
                <BarChart3 className="w-12 h-12 text-white" aria-hidden />
              </div>
            </motion.div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent mb-4">
              Explore the Knowledge Graph
            </h2>

            <p className="text-slate-300 text-lg mb-2 max-w-2xl mx-auto">
              Dive into 74,000+ interconnected relationships from space biology
              research
            </p>
            <p className="text-slate-400 text-sm mb-8 max-w-2xl mx-auto">
              Interactive force-directed visualization powered by
              react-force-graph
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/explore"
                  className="px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-2xl hover:shadow-sky-500/30 transition-all duration-300 flex items-center gap-2"
                >
                  <Zap className="w-5 h-5" aria-hidden />
                  Launch Knowledge Graph
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/search"
                  className="px-8 py-4 bg-slate-800/50 border border-slate-600 hover:border-sky-500/50 text-slate-200 font-semibold rounded-lg hover:bg-slate-800/70 transition-all duration-300"
                >
                  Query Knowledge Graph
                </Link>
              </motion.div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                className="p-4 bg-slate-900/60 border border-sky-500/20 rounded-lg group hover:border-sky-500/40 transition-all duration-300"
              >
                <div className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent mb-1">
                  74,250+
                </div>
                <div className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                  Verified Relationships
                </div>
              </motion.div>
              <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                className="p-4 bg-slate-900/60 border border-sky-500/20 rounded-lg group hover:border-sky-500/40 transition-all duration-300"
              >
                <div className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent mb-1">
                  Interactive
                </div>
                <div className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                  Drag, Zoom, Explore
                </div>
              </motion.div>
              <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                className="p-4 bg-slate-900/60 border border-sky-500/20 rounded-lg group hover:border-sky-500/40 transition-all duration-300"
              >
                <div className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent mb-1">
                  Real-time
                </div>
                <div className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                  Dynamic Force Layout
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <AboutSection />
    </div>
  );
};
