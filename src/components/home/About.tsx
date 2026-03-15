"use client";

import { motion } from "framer-motion";
import { Lightbulb, Monitor, Globe } from "lucide-react";

export const AboutSection: React.FC = () => {
  const features = [
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Mission",
      description:
        "To bridge data and discovery by making decades of space biology research easily searchable and understandable through cutting-edge AI technology.",
    },
    {
      icon: <Monitor className="w-8 h-8" />,
      title: "Technology",
      description:
        "Powered by advanced Natural Language Processing, Knowledge Graphs, and Embedding Models that capture semantic relationships between research topics.",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Impact",
      description:
        "Enabling scientists and the public to explore how organisms adapt, grow, and evolve beyond Earth's boundaries with unprecedented ease.",
    },
  ];

  return (
    <section
      id="about"
      className="relative bg-gradient-to-b from-gray-950 via-gray-950 to-gray-950 text-slate-200 py-24 px-6 md:px-20 border-t border-slate-800 overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.2) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <motion.div
        className="absolute top-0 right-0 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-900/40 border border-sky-500/30 rounded-full mb-6 backdrop-blur-sm"
          >
            <span className="text-sm font-medium text-sky-300">
              About the Project
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
              Powered by Innovation
            </span>
          </h2>

          <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-3xl mx-auto">
            Built for{" "}
            <span className="text-sky-400 font-semibold">NASA Space Apps</span>
            , this project leverages machine learning to analyze over{" "}
            <span className="text-sky-300 font-semibold">600 research papers</span>{" "}
            on space biology. It empowers researchers, students, and enthusiasts
            to instantly discover relevant findings and understand how life
            functions in space environments.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-sky-500 opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300 rounded-2xl"></div>

              <div className="relative h-full p-8 bg-slate-900/60 border border-slate-700/50 hover:border-sky-500/40 rounded-2xl backdrop-blur-sm shadow-lg shadow-sky-500/5 transition-all duration-300">
                <motion.div
                  className="inline-flex p-4 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl mb-6 shadow-lg"
                  whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-white">{feature.icon}</div>
                </motion.div>

                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                  {feature.title}
                </h3>

                <p className="text-slate-400 leading-relaxed">
                  {feature.description}
                </p>

                <div className="absolute top-4 right-4 w-20 h-20 opacity-10">
                  <div className="w-full h-full bg-sky-500 rounded-full blur-2xl"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 p-8 bg-slate-900/40 border border-slate-700 rounded-2xl backdrop-blur-sm"
        >
          <h3 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
            Powered By
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { name: "Next.js 15", icon: "⚡" },
              { name: "React Force Graph", icon: "🌐" },
              { name: "NLP & AI", icon: "🤖" },
              { name: "Knowledge Graphs", icon: "🔗" },
            ].map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.1 }}
                className="p-4 bg-slate-800/40 border border-slate-700 hover:border-sky-500/30 rounded-xl transition-colors"
              >
                <div className="text-3xl mb-2">{tech.icon}</div>
                <div className="text-sm text-slate-400 font-medium">
                  {tech.name}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
