"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Terminal } from "lucide-react";
import type { Triple, Node, Link as GraphLink } from "@/types/graph";

const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
});

interface HeroGraphData {
  nodes: Node[];
  links: GraphLink[];
}

export const HeroSection: React.FC = () => {
  const [graphData, setGraphData] = useState<HeroGraphData>({ nodes: [], links: [] });
  const [graphReady, setGraphReady] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fgRef = useRef<any>(null);

  const [stats, setStats] = useState({ nodes: 0, links: 0, pubs: "600+" });

  useEffect(() => {
    fetch("/kg_triples_validated.json")
      .then((res) => res.json())
      .then((triples: Triple[]) => {
        const SAMPLE = 500;
        const sampled = triples.slice(0, SAMPLE);

        const nodesMap = new Map<string, Node>();
        const links: GraphLink[] = [];

        sampled.forEach((t) => {
          if (!nodesMap.has(t.subject))
            nodesMap.set(t.subject, { id: t.subject, group: 1, connections: 0 });
          if (!nodesMap.has(t.object))
            nodesMap.set(t.object, { id: t.object, group: 2, connections: 0 });
          links.push({ source: t.subject, target: t.object, predicate: t.predicate });
        });

        const nodes = Array.from(nodesMap.values());
        setGraphData({ nodes, links });
        setStats({ nodes: nodes.length, links: links.length, pubs: "600+" });
      })
      .catch(() => {});
  }, []);

  const handleEngineStop = useCallback(() => {
    if (fgRef.current && !graphReady) {
      try {
        const controls = fgRef.current.controls();
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.15;
      } catch {
        /* controls may not be available yet */
      }
      setGraphReady(true);
    }
  }, [graphReady]);

  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      try {
        const controls = fgRef.current.controls();
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.15;
      } catch {
        /* controls may not be available */
      }
    }
  }, [graphData]);

  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden bg-[#0a0a0a]">
      {/* Live graph background */}
      <div className="absolute inset-0 z-0">
        {graphData.nodes.length > 0 && (
          <ForceGraph3D
            ref={fgRef}
            graphData={graphData}
            backgroundColor="#0a0a0a"
            nodeRelSize={4}
            nodeColor={() => "rgba(140,140,140,0.7)"}
            linkColor={() => "rgba(255,255,255,0.85)"}
            linkWidth={0.3}
            nodeVal={3}
            enableNodeDrag={false}
            enableNavigationControls={false}
            showNavInfo={false}
            onEngineStop={handleEngineStop}
            nodeLabel={() => ""}
            width={typeof window !== "undefined" ? window.innerWidth : 1200}
            height={typeof window !== "undefined" ? window.innerHeight : 800}
          />
        )}
      </div>

      {/* Gradient overlays for text readability */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#0a0a0a]/80 via-transparent to-transparent" />

      {/* Content overlay */}
      <div className="relative z-10 max-w-4xl mx-auto text-center px-6 pt-32 pb-24">
        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tight leading-[1.05]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="block text-white">Space Biology</span>
          <span className="block text-gradient">Knowledge Graph</span>
        </motion.h1>

        <motion.p
          className="max-w-2xl mx-auto text-lg md:text-xl text-[#a3a3a3] mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          Explore{" "}
          <span className="text-white font-semibold">74,000+</span>{" "}
          interconnected relationships extracted from{" "}
          <span className="text-white font-semibold">600+</span>{" "}
          NASA research publications on how life adapts beyond Earth.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link href="/explore">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4 bg-white text-black text-base font-semibold rounded-lg inline-flex items-center gap-2.5 transition-all duration-200 hover:bg-[#e8e8e8] hover:text-black shadow-lg hover:shadow-[#e8e8e8]/20"
            >
              Start Exploring
              <ArrowRight className="w-5 h-5" aria-hidden />
            </motion.div>
          </Link>

          <Link href="/search">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4 bg-transparent border border-white/30 text-white text-base font-semibold rounded-lg inline-flex items-center gap-2.5 transition-all duration-200 hover:border-white hover:text-white"
            >
              <Terminal className="w-5 h-5" aria-hidden />
              Query Database
            </motion.div>
          </Link>
        </motion.div>

        {/* Glass-morphism stat pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          {[
            { value: stats.pubs, label: "Publications" },
            { value: `${stats.nodes}`, label: "Nodes Loaded" },
            { value: `${stats.links}`, label: "Connections" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="px-5 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full"
            >
              <span className="text-sm font-bold text-white tabular-nums">
                {stat.value}
              </span>
              <span className="text-xs text-[#666666] ml-2">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
