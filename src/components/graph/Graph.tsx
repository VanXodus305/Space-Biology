"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import type { Triple, Node, Link, GraphData, NodeInfo, GraphNode } from "@/types/graph";
import {
  createNodeInfoFromClick,
  createHighlightLinkKeys,
  getLinkKey,
} from "@/utils/graph-helpers";
import { NodeInfoPanel } from "./NodeInfoPanel";

const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
});

export default function KnowledgeGraph() {
  const [data, setData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [highlightNodes, setHighlightNodes] = useState(new Set<string>());
  const [highlightLinksKeys, setHighlightLinksKeys] = useState(new Set<string>());

  const [stats, setStats] = useState({
    totalNodes: 0,
    totalLinks: 0,
    subjects: 0,
    objects: 0,
    avgConnections: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch("/kg_triples_validated.json");
        const triples: Triple[] = await res.json();

        const nodesMap = new Map<string, Node>();
        const links: Link[] = [];
        const connectionCounts = new Map<string, number>();

        const SAMPLE_LIMIT = 2000;
        const limitedTriples = triples.slice(0, SAMPLE_LIMIT);

        limitedTriples.forEach((t) => {
          if (!nodesMap.has(t.subject))
            nodesMap.set(t.subject, {
              id: t.subject,
              group: 1,
              connections: 0,
            });
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

        setData({ nodes, links });

        const subjects = nodes.filter((n) => n.group === 1).length;
        const objects = nodes.filter((n) => n.group === 2).length;
        const totalConnections = Array.from(connectionCounts.values()).reduce(
          (a, b) => a + b,
          0
        );

        setStats({
          totalNodes: nodes.length,
          totalLinks: links.length,
          subjects,
          objects,
          avgConnections: totalConnections / nodes.length,
        });
      } catch (err) {
        console.error("Error loading triples:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      const { nodeInfo, relatedLinks } = createNodeInfoFromClick(
        node,
        data.links
      );
      setSelectedNode(nodeInfo);
      setHighlightNodes(
        new Set([nodeInfo.id, ...nodeInfo.relatedNodes])
      );
      setHighlightLinksKeys(createHighlightLinkKeys(relatedLinks));
    },
    [data.links]
  );

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  useEffect(() => {
    const term = debouncedSearchTerm;
    if (!term.trim()) {
      setHighlightNodes(new Set());
      setHighlightLinksKeys(new Set());
      return;
    }

    const matchingNodes = data.nodes.filter((node) =>
      node.id.toLowerCase().includes(term.toLowerCase())
    );

    if (matchingNodes.length > 0) {
      const nodeIds = new Set(matchingNodes.map((n) => n.id));
      const relatedLinks = data.links.filter((link) => {
        const sourceId =
          typeof link.source === "object" && "id" in link.source
            ? String(link.source.id)
            : String(link.source);
        const targetId =
          typeof link.target === "object" && "id" in link.target
            ? String(link.target.id)
            : String(link.target);
        return nodeIds.has(sourceId) || nodeIds.has(targetId);
      });

      setHighlightNodes(nodeIds);
      setHighlightLinksKeys(createHighlightLinkKeys(relatedLinks));
    } else {
      setHighlightNodes(new Set());
      setHighlightLinksKeys(new Set());
    }
  }, [debouncedSearchTerm, data.nodes, data.links]);

  const handleClosePanel = useCallback(() => {
    setSelectedNode(null);
    setHighlightNodes(new Set());
    setHighlightLinksKeys(new Set());
  }, []);

  const isLinkHighlighted = useCallback(
    (link: { source?: unknown; target?: unknown }) => {
      if (highlightLinksKeys.size === 0) return false;
      const key = getLinkKey(link as Link);
      return highlightLinksKeys.has(key);
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
        <p className="mt-4 text-lg">Loading Space Biology Knowledge Graph...</p>
      </div>
    );

  return (
    <div className="flex mt-6 justify-center items-center w-full mb-16 flex-col">
      <div className="w-[95%] max-w-6xl mb-4 flex gap-4 items-stretch flex-wrap">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 min-w-[200px] bg-slate-900/90 backdrop-blur-xl border border-sky-500/20 rounded-xl p-4 shadow-xl shadow-sky-500/10"
        >
          <div className="flex items-center gap-3">
            <div className="bg-sky-500/20 p-2 rounded-lg border border-sky-500/30">
              <Search className="w-5 h-5 text-sky-400" aria-hidden />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search nodes... (e.g., 'microgravity', 'bone loss')"
              className="flex-1 bg-slate-800/60 border border-slate-700 text-slate-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 placeholder-slate-600 transition-all"
              aria-label="Search nodes in knowledge graph"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setHighlightNodes(new Set());
                  setHighlightLinksKeys(new Set());
                }}
                className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-lg p-2 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500"
                aria-label="Clear search"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900/90 backdrop-blur-xl border border-sky-500/20 rounded-xl p-4 shadow-xl shadow-sky-500/10"
        >
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">
                {stats.totalNodes}
              </div>
              <div className="text-xs text-slate-500 font-medium">Nodes</div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">
                {stats.totalLinks}
              </div>
              <div className="text-xs text-slate-500 font-medium">Links</div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">
                {stats.avgConnections.toFixed(1)}
              </div>
              <div className="text-xs text-slate-500 font-medium">Avg Links</div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="w-[95%] max-w-6xl mb-4 bg-slate-900/90 backdrop-blur-xl border border-sky-500/20 rounded-xl p-5 shadow-xl shadow-sky-500/10">
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
            <span className="text-slate-400 text-xs font-bold">Node Info</span>
          </div>
        </div>
      </div>

      <div className="w-[95%] max-w-6xl flex gap-4 flex-col lg:flex-row">
        <div className="relative flex-1 min-h-[400px] lg:min-h-[100vh] h-[70vh] lg:h-[100vh] bg-gray-950 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex items-center justify-center">
          <ForceGraph3D
            graphData={data}
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

              if (hoveredNode && (source === hoveredNode || target === hoveredNode)) {
                return "rgba(56, 189, 248, 0.9)";
              }
              return "rgba(56, 189, 248, 0.3)";
            }}
            linkWidth={(link: { source?: unknown; target?: unknown }) => {
              if (highlightLinksKeys.size > 0 && isLinkHighlighted(link)) {
                return 4;
              }
              const { source, target } = getLinkSourceTarget(link);
              if (hoveredNode && (source === hoveredNode || target === hoveredNode)) {
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
            height={undefined}
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
                nodes={data.nodes}
                onClose={handleClosePanel}
                onNodeClick={handleNodeClick}
                maxHeight="100vh"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
