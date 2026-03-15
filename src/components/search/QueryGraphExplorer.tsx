"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronRight,
  AlertCircle,
  Database,
  Trash2,
  Zap,
} from "lucide-react";
import type { Triple, Node, Link, GraphData, NodeInfo, GraphNode } from "@/types/graph";
import {
  createNodeInfoFromClick,
  createHighlightLinkKeys,
  getLinkKey,
} from "@/utils/graph-helpers";
import { NodeInfoPanel } from "@/components/graph/NodeInfoPanel";

const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
});

export default function QueryGraphExplorer() {
  const [triples, setTriples] = useState<Triple[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Triple[]>([]);
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeInfo | null>(null);
  const [highlightNodes, setHighlightNodes] = useState(new Set<string>());
  const [highlightLinksKeys, setHighlightLinksKeys] = useState(new Set<string>());

  useEffect(() => {
    fetch("/kg_triples_validated.json")
      .then((res) => res.json())
      .then((data) => {
        setTriples(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load dataset.");
        setLoading(false);
      });
  }, []);

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      const { nodeInfo, relatedLinks } = createNodeInfoFromClick(
        node,
        graphData.links
      );
      setSelectedNode(nodeInfo);
      setHighlightNodes(new Set([nodeInfo.id, ...nodeInfo.relatedNodes]));
      setHighlightLinksKeys(createHighlightLinkKeys(relatedLinks));
    },
    [graphData.links]
  );

  const runQuery = () => {
    setError(null);
    if (!query.trim()) {
      setResults([]);
      setGraphData({ nodes: [], links: [] });
      return;
    }

    try {
      const matchRegex = /MATCH\s*\(.*?\)-\[.*?\]->\(.*?\)/i;
      const whereRegex = /WHERE\s+(.+)/i;

      if (!matchRegex.test(query)) {
        throw new Error(
          'Invalid syntax. Try: MATCH (s)-[p]->(o) WHERE s = "covid-19"'
        );
      }

      const whereMatch = query.match(whereRegex);
      let filtered = triples;

      if (whereMatch) {
        const condition = whereMatch[1].replace(/["']/g, "").trim();
        const condParts = condition.split("=").map((s) => s.trim());

        if (condParts.length === 2) {
          const [lhs, rhs] = condParts;
          if (lhs === "s" || lhs === "subject") {
            filtered = triples.filter(
              (t) => t.subject.toLowerCase() === rhs.toLowerCase()
            );
          } else if (lhs === "p" || lhs === "predicate") {
            filtered = triples.filter(
              (t) => t.predicate.toLowerCase() === rhs.toLowerCase()
            );
          } else if (lhs === "o" || lhs === "object") {
            filtered = triples.filter(
              (t) => t.object.toLowerCase() === rhs.toLowerCase()
            );
          } else {
            throw new Error("Unknown field. Use s, p, or o.");
          }
        } else {
          throw new Error(
            'Invalid WHERE clause. Example: WHERE s = "covid-19"'
          );
        }
      }

      setResults(filtered.slice(0, 100));

      const nodesMap = new Map<string, Node>();
      const links: Link[] = [];
      const connectionCounts = new Map<string, number>();

      filtered.slice(0, 100).forEach((t) => {
        if (!nodesMap.has(t.subject))
          nodesMap.set(t.subject, { id: t.subject, group: 1, connections: 0 });
        if (!nodesMap.has(t.object))
          nodesMap.set(t.object, { id: t.object, group: 2, connections: 0 });

        connectionCounts.set(
          t.subject,
          (connectionCounts.get(t.subject) || 0) + 1
        );
        connectionCounts.set(
          t.object,
          (connectionCounts.get(t.object) || 0) + 1
        );

        links.push({
          source: t.subject,
          target: t.object,
          predicate: t.predicate,
        });
      });

      const nodes = Array.from(nodesMap.values()).map((node) => ({
        ...node,
        connections: connectionCounts.get(node.id) || 0,
      }));

      setGraphData({ nodes, links });
      setSelectedNode(null);
      setHighlightNodes(new Set());
      setHighlightLinksKeys(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleClosePanel = useCallback(() => {
    setSelectedNode(null);
    setHighlightNodes(new Set());
    setHighlightLinksKeys(new Set());
  }, []);

  const isLinkHighlighted = useCallback(
    (link: { source?: unknown; target?: unknown }) => {
      if (highlightLinksKeys.size === 0) return false;
      return highlightLinksKeys.has(getLinkKey(link as Link));
    },
    [highlightLinksKeys]
  );

  const getLinkSourceTarget = useCallback(
    (link: { source?: unknown; target?: unknown }) => {
      const source =
        typeof link.source === "object" && link.source && "id" in link.source
          ? String((link.source as { id: string }).id)
          : String(link.source ?? "");
      const target =
        typeof link.target === "object" && link.target && "id" in link.target
          ? String((link.target as { id: string }).id)
          : String(link.target ?? "");
      return { source, target };
    },
    []
  );

  if (loading)
    return (
      <div className="text-center text-slate-400 py-20">
        <div className="inline-block relative">
          <div className="w-16 h-16 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-lg">Loading dataset...</p>
      </div>
    );

  return (
    <div className="w-full max-w-6xl mx-auto mt-10">
      <div className="relative bg-slate-900/90 text-slate-200 p-8 rounded-2xl shadow-xl shadow-sky-500/10 border border-sky-500/20 backdrop-blur-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 via-blue-500/5 to-sky-500/5 animate-pulse"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="bg-sky-500/20 p-3 rounded-xl border border-sky-500/30">
              <Search className="w-6 h-6 text-sky-400" aria-hidden />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">
              Cypher Query Explorer
            </h2>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/50 p-1 shadow-inner mb-4">
            <div className="bg-slate-900/80 rounded-xl p-5 border border-slate-800/50">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <label className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                  <span className="text-sky-400">Query Input</span>
                </label>
                <div className="flex flex-wrap gap-2 justify-end">
                  <button
                    onClick={() =>
                      setQuery('MATCH (s)-[p]->(o) WHERE s = "microgravity"')
                    }
                    className="text-xs px-3 py-1 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 rounded-lg text-sky-300 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    Subject Query
                  </button>
                  <button
                    onClick={() =>
                      setQuery('MATCH (s)-[p]->(o) WHERE p = "affects"')
                    }
                    className="text-xs px-3 py-1 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 rounded-lg text-sky-300 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    Predicate Query
                  </button>
                  <button
                    onClick={() =>
                      setQuery('MATCH (s)-[p]->(o) WHERE o = "bone loss"')
                    }
                    className="text-xs px-3 py-1 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 rounded-lg text-sky-300 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    Object Query
                  </button>
                  <button
                    onClick={() =>
                      setQuery('MATCH (s)-[p]->(o) WHERE s = "space radiation"')
                    }
                    className="text-xs px-3 py-1 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 rounded-lg text-sky-300 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    Radiation Effects
                  </button>
                </div>
              </div>

              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    runQuery();
                  }
                }}
                placeholder='MATCH (s)-[p]->(o) WHERE s = "your-query-here"'
                className="w-full bg-slate-800/60 border border-slate-700 text-slate-100 p-4 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 placeholder-slate-600 transition-all resize-none shadow-inner"
                rows={3}
                aria-label="Cypher query input"
              />

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/50 flex-wrap gap-2">
                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="bg-slate-800/50 px-2 py-1 rounded border border-slate-700/30">
                    <span className="text-sky-400">s</span> = subject
                  </span>
                  <span className="bg-slate-800/50 px-2 py-1 rounded border border-slate-700/30">
                    <span className="text-sky-400">p</span> = predicate
                  </span>
                  <span className="bg-slate-800/50 px-2 py-1 rounded border border-slate-700/30">
                    <span className="text-sky-400">o</span> = object
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  Press{" "}
                  <kbd className="bg-slate-800 px-2 py-0.5 rounded text-sky-400 border border-slate-700">
                    Ctrl+Enter
                  </kbd>{" "}
                  to execute
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-between flex-wrap">
            <button
              onClick={() => {
                setQuery("");
                setResults([]);
                setGraphData({ nodes: [], links: [] });
                setError(null);
              }}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-sky-500/40 rounded-xl text-slate-400 hover:text-slate-200 font-medium transition-all hover:scale-105 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>

            <button
              onClick={runQuery}
              disabled={!query.trim()}
              className="group relative px-8 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 rounded-xl text-white font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-sky-500/30 overflow-hidden focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <span className="relative flex items-center gap-2">
                <ChevronRight className="w-5 h-5" />
                Execute Query
              </span>
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-950/40 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm flex items-start gap-3 animate-[fadeIn_0.3s_ease-in]">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-red-400 font-semibold mb-1">Query Error</h4>
                <p className="text-red-300/80 text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <div className="bg-slate-900/90 rounded-2xl border border-sky-500/20 p-6 shadow-xl shadow-sky-500/10 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-800/50 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-sky-500/20 p-2 rounded-lg border border-sky-500/30">
                <Database className="w-5 h-5 text-sky-400" aria-hidden />
              </div>
              <h3 className="text-xl font-bold text-slate-200">Query Results</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Total:</span>
              <span className="px-3 py-1 bg-sky-500/15 border border-sky-500/30 rounded-lg text-sky-300 font-bold text-sm">
                {results.length}
              </span>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block bg-slate-800/50 p-4 rounded-2xl mb-4">
                <AlertCircle className="w-12 h-12 text-slate-600 mx-auto" />
              </div>
              <p className="text-slate-500 text-lg mb-2">No results found</p>
              <p className="text-slate-600 text-sm">
                Try adjusting your query or use one of the examples above
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
              {results.map((t, i) => (
                <div
                  key={`${t.subject}-${t.predicate}-${t.object}-${i}`}
                  className="group bg-slate-800/60 border border-slate-700/50 hover:border-sky-500/30 rounded-xl p-4 transition-all hover:shadow-lg hover:shadow-sky-500/5 hover:scale-[1.02] backdrop-blur-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-sky-500/10 p-1.5 rounded-lg border border-sky-500/20 mt-0.5">
                      <Zap className="w-4 h-4 text-sky-400" aria-hidden />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                          Subject
                        </span>
                        <span className="text-sm text-slate-300 font-medium">
                          {t.subject}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 pl-4">
                        <ChevronRight className="w-4 h-4 text-violet-400" />
                        <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">
                          Predicate
                        </span>
                        <span className="text-sm text-slate-400 italic">
                          {t.predicate}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2 pl-8">
                        <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                          Object
                        </span>
                        <span className="text-sm text-slate-300 font-medium">
                          {t.object}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {graphData.nodes.length > 0 && (
        <div className="mt-10">
          <div className="mb-4 bg-slate-900/90 backdrop-blur-xl border border-sky-500/20 rounded-xl p-5 shadow-xl shadow-sky-500/10">
            <div className="flex items-center justify-center mb-3">
              <span className="text-sky-400 font-bold text-sm tracking-wider">
                INTERACTIVE CONTROLS
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <div className="flex items-center gap-2 bg-slate-800/60 border border-sky-500/20 rounded-lg px-4 py-2 hover:border-sky-500/40 transition-colors">
                <span className="text-sky-400 font-bold text-xs">LEFT</span>
                <span className="text-slate-400 text-xs font-bold">Rotate</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/60 border border-sky-500/20 rounded-lg px-4 py-2 hover:border-sky-500/40 transition-colors">
                <span className="text-sky-400 font-bold text-xs">WHEEL</span>
                <span className="text-slate-400 text-xs font-bold">Zoom</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/60 border border-sky-500/20 rounded-lg px-4 py-2 hover:border-sky-500/40 transition-colors">
                <span className="text-sky-400 font-bold text-xs">RIGHT</span>
                <span className="text-slate-400 text-xs font-bold">Pan</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/60 border border-sky-500/20 rounded-lg px-4 py-2 hover:border-sky-500/40 transition-colors">
                <span className="text-sky-400 font-bold text-xs">CLICK</span>
                <span className="text-slate-400 text-xs font-bold">
                  Node Info
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 flex-col lg:flex-row">
            <div className="flex-1 min-h-[400px] h-[600px] bg-gray-950 border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center">
              <ForceGraph3D
                graphData={graphData}
                nodeAutoColorBy="group"
                nodeRelSize={6}
                backgroundColor="#030712"
                linkColor={(link: { source?: unknown; target?: unknown }) => {
                  const { source, target } = getLinkSourceTarget(link);

                  if (highlightLinksKeys.size > 0) {
                    const isHighlighted = isLinkHighlighted(link);
                    return isHighlighted
                      ? "rgba(56, 189, 248, 0.9)"
                      : "rgba(56, 189, 248, 0.15)";
                  }

                  if (
                    hoveredNode &&
                    (source === hoveredNode || target === hoveredNode)
                  ) {
                    return "rgba(56, 189, 248, 0.9)";
                  }
                  return "rgba(56, 189, 248, 0.3)";
                }}
                linkWidth={(link: { source?: unknown; target?: unknown }) => {
                  if (highlightLinksKeys.size > 0 && isLinkHighlighted(link)) {
                    return 4;
                  }
                  const { source, target } = getLinkSourceTarget(link);
                  if (
                    hoveredNode &&
                    (source === hoveredNode || target === hoveredNode)
                  ) {
                    return 3;
                  }
                  return 1;
                }}
                nodeLabel={(node: { id?: string | number; group?: number }) => `
                  <div style="
                    background: linear-gradient(135deg, rgba(14, 165, 233, 0.95), rgba(56, 189, 248, 0.95));
                    color: white;
                    padding: 12px 16px;
                    border-radius: 12px;
                    font-family: system-ui, -apple-system, sans-serif;
                    font-size: 14px;
                    font-weight: 600;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
                    backdrop-filter: blur(10px);
                    max-width: 250px;
                    word-wrap: break-word;
                  ">
                    <div style="margin-bottom: 4px; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9;">
                      ${node.group === 1 ? "Subject" : "Object"}
                    </div>
                    ${node.id}
                  </div>
                `}
                linkLabel="predicate"
                enableNodeDrag={true}
                width={undefined}
                height={600}
                showNavInfo={false}
                onNodeClick={handleNodeClick}
                onNodeHover={(node: { id?: string | number } | null) => {
                  setHoveredNode(node ? String(node.id ?? "") : null);
                  document.body.style.cursor = node ? "pointer" : "default";
                }}
                nodeColor={(node: { id?: string | number; group?: number }) => {
                  const nodeId = String(node.id ?? "");
                  const isHighlighted =
                    highlightNodes.size > 0 && highlightNodes.has(nodeId);
                  const isHovered = hoveredNode === nodeId;
                  const group = node.group || 1;

                  if (isHighlighted) {
                    return group === 1 ? "#38bdf8" : "#a78bfa";
                  }
                  if (isHovered) {
                    return "#7dd3fc";
                  }
                  if (highlightNodes.size > 0) {
                    return "#475569";
                  }
                  return group === 1 ? "#0ea5e9" : "#a78bfa";
                }}
                nodeVal={(node: { id?: string | number }) => {
                  const nodeId = String(node.id ?? "");
                  const isHighlighted = highlightNodes.has(nodeId);
                  const isHovered = hoveredNode === nodeId;

                  if (isHighlighted) return 14;
                  if (isHovered) return 12;
                  return 6;
                }}
              />
            </div>

            {selectedNode && (
              <div
                className="lg:hidden fixed inset-0 bg-black/60 z-20 backdrop-blur-sm"
                onClick={handleClosePanel}
                onKeyDown={(e) => e.key === "Escape" && handleClosePanel()}
                role="button"
                tabIndex={0}
                aria-label="Close panel"
              />
            )}
            <AnimatePresence>
              {selectedNode && (
                <motion.div
                  key="node-panel"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="lg:w-80 w-full lg:relative fixed right-0 top-0 bottom-0 lg:right-auto lg:top-auto lg:bottom-auto z-30 w-[min(20rem,100%)] lg:w-80"
                >
                  <NodeInfoPanel
                    selectedNode={selectedNode}
                    nodes={graphData.nodes}
                    onClose={handleClosePanel}
                    onNodeClick={handleNodeClick}
                    maxHeight="min(600px, 100vh)"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
