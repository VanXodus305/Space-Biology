import QueryGraphExplorer from "@/components/search/QueryGraphExplorer";

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] flex flex-col items-center pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto text-center mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-[#a3a3a3] mb-3">
          Cypher Query Engine
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
          Knowledge Explorer
        </h1>
        <p className="text-base text-[#a3a3a3] max-w-xl mx-auto leading-relaxed">
          Query{" "}
          <span className="text-white font-semibold">600+ space biology publications</span>{" "}
          using Cypher-like syntax. All processing happens locally in your browser.
        </p>
      </div>

      <QueryGraphExplorer />
    </main>
  );
}
