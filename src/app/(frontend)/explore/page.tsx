import KnowledgeGraph from "@/components/graph/Graph";

export default function page() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto text-center mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-cyan-500 mb-3">
          Interactive Visualization
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
          3D Knowledge Graph
        </h1>
        <p className="text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
          Explore{" "}
          <span className="text-white font-semibold">2,000+ relationships</span>{" "}
          from space biology research. Navigate interconnected concepts and
          entities in real-time.
        </p>
      </div>

      <KnowledgeGraph />
    </main>
  );
}
