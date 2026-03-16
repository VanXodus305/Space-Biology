"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  AlertCircle,
  Database,
  Trash2,
  Play,
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
      <div className="flex flex-col items-center justify-center py-32 text-slate-500">
        <div className="w-10 h-10 border-2 border-slate-700 border-t-cyan-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm">Loading dataset&hellip;</p>
      </div>
    );

  return (
    <div className="w-full max-w-5xl mx-auto mt-14 px-4">
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="border-b border-slate-800 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-200">
            Cypher Query Explorer
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Query the knowledge graph using Cypher-like syntax
          </p>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-2 mb-3">
            {[
              { label: "Subject", query: 'MATCH (s)-[p]->(o) WHERE s = "microgravity"' },
              { label: "Predicate", query: 'MATCH (s)-[p]->(o) WHERE p = "affects"' },
              { label: "Object", query: 'MATCH (s)-[p]->(o) WHERE o = "bone loss"' },
              { label: "Radiation", query: 'MATCH (s)-[p]->(o) WHERE s = "space radiation"' },
            ].map((example) => (
              <button
                key={example.label}
                onClick={() => setQuery(example.query)}
                className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-cyan-800/50 rounded-md text-slate-400 hover:text-slate-300 transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-600"
              >
                {example.label}
              </button>
            ))}
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
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-4 rounded-md font-mono text-sm focus:outline-none focus:ring-1 focus:ring-cyan-600 focus:border-cyan-800 placeholder-slate-600 transition-colors resize-none"
            rows={3}
            aria-label="Cypher query input"
          />

          <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
            <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 font-mono">
              <span>
                <span className="text-cyan-600">s</span>=subject
              </span>
              <span>
                <span className="text-cyan-600">p</span>=predicate
              </span>
              <span>
                <span className="text-cyan-600">o</span>=object
              </span>
              <span className="text-slate-600 ml-2">
                Ctrl+Enter to run
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  setGraphData({ nodes: [], links: [] });
                  setError(null);
                }}
                className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-slate-400 hover:text-slate-300 transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-600"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>

              <button
                onClick={runQuery}
                disabled={!query.trim()}
                className="px-4 py-1.5 text-xs bg-cyan-600 hover:bg-cyan-500 rounded-md text-white font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              >
                <Play className="w-3 h-3" />
                Execute
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-950/30 border border-red-900/50 rounded-md p-3 flex items-start gap-2.5 animate-[fadeIn_0.2s_ease-in]">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-red-400">Query Error</p>
                <p className="text-xs text-red-400/70 mt-0.5">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <div className="bg-slate-900 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-500" aria-hidden />
              <h3 className="text-sm font-semibold text-slate-200">Results</h3>
            </div>
            <span className="text-xs text-slate-500 tabular-nums">
              {results.length} rows
            </span>
          </div>

          <div className="p-6">
            {results.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-slate-500">No results</p>
                <p className="text-xs text-slate-600 mt-1">
                  Run a query to see results here
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto overflow-x-hidden pr-1 custom-scrollbar">
                {results.map((t, i) => (
                  <div
                    key={`${t.subject}-${t.predicate}-${t.object}-${i}`}
                    className="bg-slate-800/60 border border-slate-700/50 hover:border-slate-600 rounded-md p-3 transition-colors"
                  >
                    <div className="flex items-start gap-3 text-xs">
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0 mt-0.5" aria-hidden />
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[10px] font-medium text-cyan-600 uppercase tracking-wider w-14 flex-shrink-0">
                            Subject
                          </span>
                          <span className="text-slate-300 truncate">
                            {t.subject}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-[10px] font-medium text-teal-600 uppercase tracking-wider w-14 flex-shrink-0">
                            Predicate
                          </span>
                          <span className="text-slate-400 italic truncate">
                            {t.predicate}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-[10px] font-medium text-cyan-600 uppercase tracking-wider w-14 flex-shrink-0">
                            Object
                          </span>
                          <span className="text-slate-300 truncate">
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
      </div>

      {graphData.nodes.length > 0 && (
        <div className="mt-8 mb-12">
          <div className="mb-3 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5">
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
              {[
                { key: "LEFT", action: "Rotate" },
                { key: "WHEEL", action: "Zoom" },
                { key: "RIGHT", action: "Pan" },
                { key: "CLICK", action: "Select" },
              ].map((ctrl) => (
                <div key={ctrl.key} className="flex items-center gap-1.5">
                  <kbd className="bg-slate-800 text-cyan-500 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border border-slate-700">
                    {ctrl.key}
                  </kbd>
                  <span className="text-slate-500">{ctrl.action}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 flex-col lg:flex-row">
            <div className="flex-1 min-h-[400px] h-[600px] bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
              <ForceGraph3D
                graphData={graphData}
                nodeAutoColorBy="group"
                nodeRelSize={6}
                backgroundColor="#020617"
                linkColor={(link: { source?: unknown; target?: unknown }) => {
                  const { source, target } = getLinkSourceTarget(link);

                  if (highlightLinksKeys.size > 0) {
                    const isHighlighted = isLinkHighlighted(link);
                    return isHighlighted
                      ? "rgba(6, 182, 212, 0.85)"
                      : "rgba(6, 182, 212, 0.08)";
                  }

                  if (
                    hoveredNode &&
                    (source === hoveredNode || target === hoveredNode)
                  ) {
                    return "rgba(6, 182, 212, 0.85)";
                  }
                  return "rgba(6, 182, 212, 0.18)";
                }}
                linkWidth={(link: { source?: unknown; target?: unknown }) => {
                  if (highlightLinksKeys.size > 0 && isLinkHighlighted(link)) {
                    return 3;
                  }
                  const { source, target } = getLinkSourceTarget(link);
                  if (
                    hoveredNode &&
                    (source === hoveredNode || target === hoveredNode)
                  ) {
                    return 2.5;
                  }
                  return 0.8;
                }}
                nodeLabel={(node: { id?: string | number; group?: number }) => `
                  <div style="
                    background: #0f172a;
                    color: #e2e8f0;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-family: system-ui, -apple-system, sans-serif;
                    font-size: 12px;
                    font-weight: 500;
                    border: 1px solid #334155;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
                    max-width: 220px;
                    word-wrap: break-word;
                  ">
                    <div style="margin-bottom: 2px; font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; color: ${node.group === 1 ? '#06b6d4' : '#2dd4bf'};">
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
                    return group === 1 ? "#22d3ee" : "#5eead4";
                  }
                  if (isHovered) {
                    return "#67e8f9";
                  }
                  if (highlightNodes.size > 0) {
                    return "#334155";
                  }
                  return group === 1 ? "#06b6d4" : "#2dd4bf";
                }}
                nodeVal={(node: { id?: string | number }) => {
                  const nodeId = String(node.id ?? "");
                  const isHighlighted = highlightNodes.has(nodeId);
                  const isHovered = hoveredNode === nodeId;

                  if (isHighlighted) return 12;
                  if (isHovered) return 10;
                  return 5;
                }}
              />
            </div>

            {selectedNode && (
              <div
                className="lg:hidden fixed inset-0 bg-black/50 z-20"
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
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  className="w-[min(20rem,100%)] lg:w-80 lg:relative fixed right-0 top-0 bottom-0 lg:right-auto lg:top-auto lg:bottom-auto z-30"
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
