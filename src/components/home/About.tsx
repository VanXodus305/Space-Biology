"use client";

import { motion } from "framer-motion";
import { Lightbulb, Monitor, Globe, Cpu, Network, Microscope } from "lucide-react";

export const AboutSection: React.FC = () => {
  const features = [
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "Mission",
      description:
        "Bridge data and discovery by making decades of space biology research searchable through cutting-edge AI technology.",
    },
    {
      icon: <Monitor className="w-6 h-6" />,
      title: "Technology",
      description:
        "Powered by NLP, Knowledge Graphs, and Embedding Models that capture semantic relationships between research topics.",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Impact",
      description:
        "Enabling scientists and the public to explore how organisms adapt, grow, and evolve beyond Earth's boundaries.",
    },
    {
      icon: <Microscope className="w-6 h-6" />,
      title: "Research",
      description:
        "Access insights from 600+ verified NASA publications covering decades of space biology experiments and findings.",
    },
    {
      icon: <Network className="w-6 h-6" />,
      title: "Connections",
      description:
        "Discover hidden relationships between biological concepts through an interactive 3D knowledge graph visualization.",
    },
    {
      icon: <Cpu className="w-6 h-6" />,
      title: "Processing",
      description:
        "All queries run locally in your browser. No server round-trips, instant results from the full dataset.",
    },
  ];

  return (
    <section
      id="about"
      className="relative bg-[#0a0a0a] py-28 px-6 md:px-20 border-t border-[#262626]"
    >
      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-[#a3a3a3] mb-4">
            Why SpaceBio Explorer?
          </p>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
            Built for NASA Space Apps
          </h2>

          <p className="text-base md:text-lg text-[#a3a3a3] leading-relaxed max-w-2xl mx-auto">
            This project leverages machine learning to analyze over{" "}
            <span className="text-white font-semibold">600 research papers</span>{" "}
            on space biology, empowering researchers and enthusiasts to discover
            how life functions in space environments.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="group p-7 bg-[#141414] border border-[#262626] hover:border-[#22d3ee]/30 rounded-xl transition-all duration-300"
            >
              <div className="inline-flex p-3 bg-[#1c1c1c] border border-[#333] rounded-lg mb-5 text-white group-hover:text-[#22d3ee] transition-colors">
                {feature.icon}
              </div>

              <h3 className="text-lg font-bold text-white mb-2">
                {feature.title}
              </h3>

              <p className="text-sm text-[#a3a3a3] leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 p-8 bg-[#141414] border border-[#262626] rounded-xl"
        >
          <h3 className="text-sm font-semibold uppercase tracking-widest text-[#666666] mb-6 text-center">
            Powered By
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Next.js 15", desc: "Framework" },
              { name: "Force Graph", desc: "Visualization" },
              { name: "NLP & AI", desc: "Extraction" },
              { name: "Knowledge Graphs", desc: "Structure" },
            ].map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-4 bg-[#1c1c1c] border border-[#262626] hover:border-[#22d3ee]/30 rounded-lg text-center transition-colors"
              >
                <div className="text-base font-semibold text-white">
                  {tech.name}
                </div>
                <div className="text-xs text-[#666666] mt-1">
                  {tech.desc}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
