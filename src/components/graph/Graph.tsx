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
      <div className="flex flex-col items-center justify-center py-32 text-slate-500">
        <div className="w-10 h-10 border-2 border-slate-700 border-t-cyan-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm">Loading knowledge graph&hellip;</p>
      </div>
    );

  return (
    <div className="flex mt-14 justify-center items-center w-full mb-12 flex-col px-4">
      <div className="w-full max-w-6xl mb-3 flex gap-3 items-stretch flex-wrap">
        <div className="flex-1 min-w-[200px] bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-500 flex-shrink-0" aria-hidden />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search nodes..."
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 focus:outline-none"
            aria-label="Search nodes in knowledge graph"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setHighlightNodes(new Set());
                setHighlightLinksKeys(new Set());
              }}
              className="text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-800 transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-600"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-center gap-5">
          {[
            { value: stats.totalNodes, label: "Nodes" },
            { value: stats.totalLinks, label: "Links" },
            { value: stats.avgConnections.toFixed(1), label: "Avg" },
          ].map((s, i) => (
            <div key={s.label} className="flex items-center gap-5">
              {i > 0 && <div className="w-px h-6 bg-slate-800" />}
              <div className="text-center">
                <div className="text-sm font-semibold text-cyan-400 tabular-nums">
                  {s.value}
                </div>
                <div className="text-[10px] text-slate-500">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-6xl mb-3 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5">
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

      <div className="w-full max-w-6xl flex gap-3 flex-col lg:flex-row">
        <div className="relative flex-1 min-h-[400px] lg:min-h-[100vh] h-[70vh] lg:h-[100vh] bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
          <ForceGraph3D
            graphData={data}
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

              if (hoveredNode && (source === hoveredNode || target === hoveredNode)) {
                return "rgba(6, 182, 212, 0.85)";
              }
              return "rgba(6, 182, 212, 0.18)";
            }}
            linkWidth={(link: { source?: unknown; target?: unknown }) => {
              if (highlightLinksKeys.size > 0 && isLinkHighlighted(link)) {
                return 3;
              }
              const { source, target } = getLinkSourceTarget(link);
              if (hoveredNode && (source === hoveredNode || target === hoveredNode)) {
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
