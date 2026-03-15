"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo } from "react";
import { Zap, Search, ChevronDown } from "lucide-react";

const seeded = (i: number, seed: number) =>
  ((i * 7 + seed * 13) % 100) / 100;

export const HeroSection: React.FC = () => {
  const particles = useMemo(() => {
    return [...Array(30)].map((_, i) => ({
      id: i,
      size: seeded(i, 1) * 3 + 1,
      color:
        i % 3 === 0
          ? "rgba(56, 189, 248, 0.5)"
          : i % 3 === 1
          ? "rgba(125, 211, 252, 0.4)"
          : "rgba(255, 255, 255, 0.25)",
      shadow:
        i % 2 === 0
          ? "0 0 10px rgba(56, 189, 248, 0.5)"
          : "0 0 10px rgba(14, 165, 233, 0.4)",
      left: seeded(i, 2) * 100,
      top: seeded(i, 3) * 100,
      xOffset: seeded(i, 4) * 50 - 25,
      duration: seeded(i, 5) * 8 + 5,
      mobileHidden: i >= 8,
    }));
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center text-center overflow-hidden bg-gradient-to-b from-gray-950 via-gray-950 to-gray-950 text-white px-6 py-24">
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(56, 189, 248, 0.15) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(56, 189, 248, 0.15) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <motion.div
        className="absolute top-20 left-10 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl md:block hidden"
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl md:block hidden"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.15, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute top-20 left-10 w-64 h-64 bg-sky-500/15 rounded-full blur-3xl md:hidden" />
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl md:hidden" />

      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute rounded-full ${
            particle.mobileHidden ? "md:block hidden" : ""
          }`}
          style={{
            width: particle.size + "px",
            height: particle.size + "px",
            background: particle.color,
            boxShadow: particle.shadow,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, particle.xOffset, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-900/40 border border-sky-500/30 rounded-full mb-8 backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
          </span>
          <span className="text-sm font-medium text-sky-300">
            NASA Space Biology Knowledge Graph
          </span>
        </motion.div>

        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight leading-tight"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <span className="block bg-gradient-to-r from-sky-300 via-white to-sky-400 bg-clip-text text-transparent">
            Exploring the
          </span>
          <span className="block bg-gradient-to-r from-sky-400 via-blue-400 to-sky-300 bg-clip-text text-transparent">
            Biology of Space
          </span>
        </motion.h1>

        <motion.p
          className="max-w-3xl mx-auto text-lg md:text-xl lg:text-2xl text-slate-400 mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Unlock insights from{" "}
          <span className="text-sky-400 font-semibold">600+</span> NASA space
          biology publications. Explore{" "}
          <span className="text-sky-300 font-semibold">74,000+</span>{" "}
          interconnected relationships and discover how life adapts beyond
          Earth.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link href="/explore">
            <motion.div
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(14, 165, 233, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-sky-500/25 inline-flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
              <Zap className="w-5 h-5 relative z-10" aria-hidden />
              <span className="relative z-10">Start Exploring</span>
            </motion.div>
          </Link>

          <Link href="/search">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-slate-800/50 backdrop-blur-sm border border-slate-600 hover:border-sky-500/50 text-white rounded-xl font-semibold shadow-lg inline-flex items-center gap-3 transition-colors"
            >
              <Search className="w-5 h-5" aria-hidden />
              <span>Query Database</span>
            </motion.div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          <div className="p-6 bg-slate-900/60 border border-sky-500/20 rounded-2xl backdrop-blur-sm shadow-lg shadow-sky-500/5">
            <div className="text-4xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent mb-2">
              600+
            </div>
            <div className="text-sm text-slate-400">Research Publications</div>
          </div>
          <div className="p-6 bg-slate-900/60 border border-sky-500/20 rounded-2xl backdrop-blur-sm shadow-lg shadow-sky-500/5">
            <div className="text-4xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent mb-2">
              74K+
            </div>
            <div className="text-sm text-slate-400">Knowledge Relationships</div>
          </div>
          <div className="p-6 bg-slate-900/60 border border-sky-500/20 rounded-2xl backdrop-blur-sm shadow-lg shadow-sky-500/5">
            <div className="text-4xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent mb-2">
              3D
            </div>
            <div className="text-sm text-slate-400">
              Interactive Visualization
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-slate-500"
        >
          <span className="text-xs uppercase tracking-wider">Scroll</span>
          <ChevronDown className="w-6 h-6" aria-hidden />
        </motion.div>
      </motion.div>
    </section>
  );
};
