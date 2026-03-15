import QueryGraphExplorer from "@/components/search/QueryGraphExplorer";

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white flex flex-col items-center py-12 px-4">
      {/* Header Section */}
      <div className="text-center mb-8 mt-10 relative">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-full mb-4 backdrop-blur-sm">
          <span className="text-purple-400 text-sm font-semibold">
            ⚡ Cypher Query Engine
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
          Knowledge Explorer
        </h1>

        {/* Description */}
        <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
          Search and visualize relationships from{" "}
          <span className="text-purple-400 font-semibold">
            600+ space biology publications
          </span>
          . Query using simple Cypher-like syntax — all processed locally.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <div className="px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl">
            <span className="text-purple-300 text-sm font-medium">
              🔎 Advanced Queries
            </span>
          </div>
          <div className="px-4 py-2 bg-gradient-to-r from-pink-600/20 to-cyan-600/20 border border-pink-500/30 rounded-xl">
            <span className="text-pink-300 text-sm font-medium">
              📈 Visual Results
            </span>
          </div>
          <div className="px-4 py-2 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 rounded-xl">
            <span className="text-cyan-300 text-sm font-medium">
              ⚡ Instant Search
            </span>
          </div>
        </div>
      </div>

      <QueryGraphExplorer />
    </main>
  );
}
