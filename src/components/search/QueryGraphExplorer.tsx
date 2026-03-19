"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  AlertCircle,
  Database,
  Trash2,
  Play,
} from "lucide-react";
import * as THREE from "three";
import SpriteText from "three-spritetext";
import { forceY } from "d3-force-3d";
import type { Triple, Node, Link, GraphData, NodeInfo, GraphNode } from "@/types/graph";
import {
  createNodeInfoFromClick,
  createHighlightLinkKeys,
  extractLinkEndpoints,
  getLinkKey,
  getNodeSize,
  getNodeColor,
  getLinkColorValue,
  getLinkWidthValue,
  getNodeTooltipHtml,
  computeLabelThreshold,
  getNodeLabelConfig,
  applyEntryPositions,
  ENTRY_ANIMATION_DURATION_QUERY,
  ENTRY_PHYSICS,
  SETTLED_PHYSICS,
  CLUSTERED_FORCE_CONFIG,
  type NodeRenderState,
} from "@/utils/graph-helpers";
import { NodeInfoPanel } from "@/components/graph/NodeInfoPanel";

const ForceGraph3D = dynamic(
  () =>
    import("react-force-graph-3d").then((mod) => {
      const FG = mod.default;
      return React.forwardRef<unknown, React.ComponentProps<typeof FG>>((props, ref) => (
        <FG ref={ref as never} {...props} />
      ));
    }),
  { ssr: false }
);

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
  const [physicsPreset, setPhysicsPreset] = useState(SETTLED_PHYSICS);
  const queryRunIdRef = useRef(0);
  const fgRef = useRef<{ d3Force: (name: string, fn?: unknown) => unknown; d3ReheatSimulation: () => void } | null>(null);

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

      queryRunIdRef.current += 1;
      applyEntryPositions(nodes, {
        startY: 55,
        spread: 35,
        seed: 100 + queryRunIdRef.current,
      });
      setPhysicsPreset(ENTRY_PHYSICS);
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

  useEffect(() => {
    if (graphData.nodes.length === 0) return;
    const setupForces = () => {
      if (!fgRef.current) return;
      const fg = fgRef.current as {
        d3Force: (a: string, b?: unknown) => unknown;
        d3ReheatSimulation: () => void;
      };
      const linkForce = fg.d3Force("link") as { distance?: (d?: number) => unknown; strength?: (d?: number) => unknown };
      if (linkForce) {
        if (typeof linkForce.distance === "function") linkForce.distance(CLUSTERED_FORCE_CONFIG.linkDistance);
        if (typeof linkForce.strength === "function") linkForce.strength(CLUSTERED_FORCE_CONFIG.linkStrength);
      }
      const chargeForce = fg.d3Force("charge") as { strength?: (d?: number) => unknown };
      if (chargeForce && typeof chargeForce.strength === "function") {
        chargeForce.strength(CLUSTERED_FORCE_CONFIG.chargeStrength);
      }
      const dropForce = forceY(0).strength(0.06);
      fg.d3Force("y", dropForce);
      fg.d3ReheatSimulation();
    };
    const t1 = setTimeout(setupForces, 80);
    return () => clearTimeout(t1);
  }, [graphData.nodes.length]);

  useEffect(() => {
    if (graphData.nodes.length === 0) return;
    const t2 = setTimeout(() => {
      setPhysicsPreset(SETTLED_PHYSICS);
      if (fgRef.current) {
        const fg = fgRef.current as {
          d3Force: (a: string, b?: unknown) => unknown;
          d3ReheatSimulation: () => void;
        };
        fg.d3Force("y", null);
        fg.d3ReheatSimulation();
      }
    }, ENTRY_ANIMATION_DURATION_QUERY);
    return () => clearTimeout(t2);
  }, [graphData.nodes.length]);

  const isLinkHighlighted = useCallback(
    (link: { source?: unknown; target?: unknown }) => {
      if (highlightLinksKeys.size === 0) return false;
      return highlightLinksKeys.has(getLinkKey(link as Link));
    },
    [highlightLinksKeys]
  );

  const labelThreshold = useMemo(
    () => computeLabelThreshold(graphData.nodes, 25),
    [graphData.nodes]
  );

  const selectedNodeId = selectedNode?.id ?? null;

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-32 text-[#666666]">
        <div className="w-10 h-10 border-2 border-[#262626] border-t-white rounded-full animate-spin"></div>
        <p className="mt-4 text-sm">Loading dataset&hellip;</p>
      </div>
    );

  return (
    <div className="w-full max-w-5xl mx-auto mt-14 px-4">
      <div className="bg-[#141414] border border-[#262626] rounded-lg overflow-hidden">
        <div className="border-b border-[#262626] px-6 py-4">
          <h2 className="text-base font-semibold text-white">
            Cypher Query Explorer
          </h2>
          <p className="text-xs text-[#666666] mt-0.5">
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
                className="text-xs px-2.5 py-1 bg-[#1c1c1c] hover:bg-[#262626] border border-[#333] hover:border-[#e8e8e8]/40 rounded-md text-[#a3a3a3] hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-[#e8e8e8]"
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
            className="w-full bg-[#0a0a0a] border border-[#262626] text-[#e5e5e5] p-4 rounded-md font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[#e8e8e8] focus:border-[#404040] placeholder-[#666666] transition-colors resize-none"
            rows={3}
            aria-label="Cypher query input"
          />

          <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
            <div className="flex flex-wrap gap-2 text-[11px] text-[#666666] font-mono">
              <span>
                <span className="text-[#a3a3a3]">s</span>=subject
              </span>
              <span>
                <span className="text-[#a3a3a3]">p</span>=predicate
              </span>
              <span>
                <span className="text-[#a3a3a3]">o</span>=object
              </span>
              <span className="text-[#404040] ml-2">
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
                className="px-3 py-1.5 text-xs bg-[#1c1c1c] hover:bg-[#262626] border border-[#333] hover:border-[#e8e8e8]/40 rounded-md text-[#a3a3a3] hover:text-white transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-[#e8e8e8]"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>

              <button
                onClick={runQuery}
                disabled={!query.trim()}
                className="px-4 py-1.5 text-xs bg-white hover:bg-[#e8e8e8] rounded-md text-black font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-[#e8e8e8]"
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
        <div className="bg-[#141414] rounded-lg border border-[#262626]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626]">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#666666]" aria-hidden />
              <h3 className="text-sm font-semibold text-white">Results</h3>
            </div>
            <span className="text-xs text-[#666666] tabular-nums">
              {results.length} rows
            </span>
          </div>

          <div className="p-6">
            {results.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-[#666666]">No results</p>
                <p className="text-xs text-[#404040] mt-1">
                  Run a query to see results here
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto overflow-x-hidden pr-1 custom-scrollbar">
                {results.map((t, i) => (
                  <div
                    key={`${t.subject}-${t.predicate}-${t.object}-${i}`}
                    className="bg-[#1c1c1c] border border-[#262626] hover:border-[#e8e8e8]/30 rounded-md p-3 transition-colors"
                  >
                    <div className="flex items-start gap-3 text-xs">
                      <ChevronRight className="w-3.5 h-3.5 text-[#404040] flex-shrink-0 mt-0.5" aria-hidden />
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[10px] font-medium text-[#a3a3a3] uppercase tracking-wider w-14 flex-shrink-0">
                            Subject
                          </span>
                          <span className="text-[#e5e5e5] truncate">
                            {t.subject}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-[10px] font-medium text-[#a3a3a3] uppercase tracking-wider w-14 flex-shrink-0">
                            Predicate
                          </span>
                          <span className="text-[#a3a3a3] italic truncate">
                            {t.predicate}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-[10px] font-medium text-[#a3a3a3] uppercase tracking-wider w-14 flex-shrink-0">
                            Object
                          </span>
                          <span className="text-[#e5e5e5] truncate">
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
          <div className="mb-3 bg-[#141414] border border-[#262626] rounded-lg px-4 py-2.5">
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
              {[
                { key: "LEFT", action: "Rotate" },
                { key: "WHEEL", action: "Zoom" },
                { key: "RIGHT", action: "Pan" },
                { key: "CLICK", action: "Select" },
              ].map((ctrl) => (
                <div key={ctrl.key} className="flex items-center gap-1.5">
                  <kbd className="bg-[#1c1c1c] text-white px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border border-[#333]">
                    {ctrl.key}
                  </kbd>
                  <span className="text-[#666666]">{ctrl.action}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 flex-col lg:flex-row">
            <div className="flex-1 min-h-[400px] h-[600px] bg-[#0a0a0a] border border-[#262626] rounded-lg overflow-hidden flex items-center justify-center">
              <ForceGraph3D
                ref={fgRef}
                graphData={graphData}
                nodeRelSize={6}
                backgroundColor="#0a0a0a"
                d3AlphaDecay={physicsPreset.d3AlphaDecay}
                d3AlphaMin={physicsPreset.d3AlphaMin}
                cooldownTime={physicsPreset.cooldownTime}
                cooldownTicks={physicsPreset.cooldownTicks}
                linkColor={(link: { source?: unknown; target?: unknown }) => {
                  const { source, target } = extractLinkEndpoints(link);
                  return getLinkColorValue(
                    source,
                    target,
                    hoveredNode,
                    isLinkHighlighted(link),
                    highlightLinksKeys.size > 0
                  );
                }}
                linkWidth={(link: { source?: unknown; target?: unknown }) => {
                  const { source, target } = extractLinkEndpoints(link);
                  return getLinkWidthValue(
                    source,
                    target,
                    hoveredNode,
                    isLinkHighlighted(link),
                    highlightLinksKeys.size > 0
                  );
                }}
                nodeLabel={(node: { id?: string | number; group?: number }) =>
                  getNodeTooltipHtml(node.id ?? "", node.group || 1)
                }
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
                nodeColor={(node: { id?: string | number; group?: number; connections?: number }) => {
                  const state: NodeRenderState = {
                    nodeId: String(node.id ?? ""),
                    group: node.group || 1,
                    connections: node.connections || 0,
                    hoveredNode,
                    highlightNodes,
                    selectedNodeId,
                  };
                  return getNodeColor(state);
                }}
                nodeVal={(node: { id?: string | number; group?: number; connections?: number }) => {
                  const state: NodeRenderState = {
                    nodeId: String(node.id ?? ""),
                    group: node.group || 1,
                    connections: node.connections || 0,
                    hoveredNode,
                    highlightNodes,
                    selectedNodeId,
                  };
                  return getNodeSize(state);
                }}
                nodeThreeObjectExtend={true}
                nodeThreeObject={((node: { id?: string | number; group?: number; connections?: number }) => {
                  const group = new THREE.Group();
                  const state: NodeRenderState = {
                    nodeId: String(node.id ?? ""),
                    group: node.group || 1,
                    connections: node.connections || 0,
                    hoveredNode,
                    highlightNodes,
                    selectedNodeId,
                  };
                  const color = getNodeColor(state);
                  const geometry = new THREE.SphereGeometry(1, 12, 10);
                  const material = new THREE.MeshBasicMaterial({
                    color,
                    transparent: false,
                  });
                  const sphere = new THREE.Mesh(geometry, material);
                  group.add(sphere);
                  const cfg = getNodeLabelConfig(
                    String(node.id ?? ""),
                    node.connections || 0,
                    labelThreshold
                  );
                  if (cfg) {
                    const sprite = new SpriteText(cfg.text);
                    sprite.color = cfg.color;
                    sprite.textHeight = cfg.textHeight;
                    sprite.backgroundColor = cfg.backgroundColor;
                    sprite.padding = cfg.padding;
                    sprite.borderRadius = cfg.borderRadius;
                    sprite.fontFace = "system-ui, -apple-system, sans-serif";
                    sprite.fontWeight = "500";
                    sprite.position.y = 1.8;
                    group.add(sprite);
                  }
                  return group;
                }) as never}
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
