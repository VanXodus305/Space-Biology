import KnowledgeGraph from "@/components/graph/Graph";

export default function page() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white flex flex-col items-center py-12 px-4">
      {/* Header Section */}
      <div className="text-center mb-8 mt-10 relative">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-full mb-4 backdrop-blur-sm">
          <span className="text-indigo-400 text-sm font-semibold">
            🚀 Interactive Visualization
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          3D Knowledge Graph
        </h1>

        {/* Description */}
        <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
          Explore an interactive 3D visualization of{" "}
          <span className="text-indigo-400 font-semibold">
            2,000+ relationships
          </span>{" "}
          from space biology research. Navigate through interconnected concepts,
          entities, and their relationships in real-time.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <div className="px-4 py-2 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-xl">
            <span className="text-indigo-300 text-sm font-medium">
              ✨ Click to Explore
            </span>
          </div>
          <div className="px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl">
            <span className="text-purple-300 text-sm font-medium">
              🔍 Search Nodes
            </span>
          </div>
          <div className="px-4 py-2 bg-gradient-to-r from-pink-600/20 to-cyan-600/20 border border-pink-500/30 rounded-xl">
            <span className="text-pink-300 text-sm font-medium">
              📊 Live Stats
            </span>
          </div>
        </div>
      </div>

      <KnowledgeGraph />
    </main>
  );
}
