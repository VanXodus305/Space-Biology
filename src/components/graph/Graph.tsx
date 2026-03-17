"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import SpriteText from "three-spritetext";
import { forceY } from "d3-force-3d";
import { useDebounce } from "@/hooks/useDebounce";
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
  ENTRY_ANIMATION_DURATION_EXPLORE,
  ENTRY_PHYSICS,
  SETTLED_PHYSICS,
  CLUSTERED_FORCE_CONFIG,
  type NodeRenderState,
} from "@/utils/graph-helpers";
import { NodeInfoPanel } from "./NodeInfoPanel";

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

export default function KnowledgeGraph() {
  const [data, setData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [highlightNodes, setHighlightNodes] = useState(new Set<string>());
  const [highlightLinksKeys, setHighlightLinksKeys] = useState(new Set<string>());
  const [physicsPreset, setPhysicsPreset] = useState(ENTRY_PHYSICS);
  const hasPlayedEntryRef = useRef(false);
  const fgRef = useRef<{ d3Force: (name: string, fn?: unknown) => unknown; d3ReheatSimulation: () => void } | null>(null);

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

        if (!hasPlayedEntryRef.current) {
          applyEntryPositions(nodes, { startY: 70, spread: 45 });
        }

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

  useEffect(() => {
    if (data.nodes.length === 0) return;
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
      if (!hasPlayedEntryRef.current) {
        const dropForce = forceY(0).strength(0.08);
        fg.d3Force("y", dropForce);
      }
      fg.d3ReheatSimulation();
    };
    const t1 = setTimeout(setupForces, 80);
    return () => clearTimeout(t1);
  }, [data.nodes.length]);

  useEffect(() => {
    if (data.nodes.length === 0) return;
    const t2 = setTimeout(() => {
      hasPlayedEntryRef.current = true;
      setPhysicsPreset(SETTLED_PHYSICS);
      if (fgRef.current) {
        const fg = fgRef.current as {
          d3Force: (a: string, b?: unknown) => unknown;
          d3ReheatSimulation: () => void;
        };
        fg.d3Force("y", null);
        fg.d3ReheatSimulation();
      }
    }, ENTRY_ANIMATION_DURATION_EXPLORE);
    return () => clearTimeout(t2);
  }, [data.nodes.length]);

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
      return highlightLinksKeys.has(getLinkKey(link as Link));
    },
    [highlightLinksKeys]
  );

  const labelThreshold = useMemo(
    () => computeLabelThreshold(data.nodes, 25),
    [data.nodes]
  );

  const selectedNodeId = selectedNode?.id ?? null;

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-32 text-[#666666]">
        <div className="w-10 h-10 border-2 border-[#262626] border-t-white rounded-full animate-spin"></div>
        <p className="mt-4 text-sm">Loading knowledge graph&hellip;</p>
      </div>
    );

  return (
    <div className="flex mt-14 justify-center items-center w-full mb-12 flex-col px-4">
      <div className="w-full max-w-6xl mb-3 flex gap-3 items-stretch flex-wrap">
        <div className="flex-1 min-w-[200px] bg-[#141414] border border-[#262626] rounded-lg p-3 flex items-center gap-3">
          <Search className="w-4 h-4 text-[#666666] flex-shrink-0" aria-hidden />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search nodes..."
            className="flex-1 bg-transparent text-sm text-[#e5e5e5] placeholder-[#666666] focus:outline-none"
            aria-label="Search nodes in knowledge graph"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setHighlightNodes(new Set());
                setHighlightLinksKeys(new Set());
              }}
              className="text-[#666666] hover:text-[#22d3ee] p-1 rounded hover:bg-[#1c1c1c] transition-colors focus:outline-none focus:ring-1 focus:ring-[#22d3ee]"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="bg-[#141414] border border-[#262626] rounded-lg p-3 flex items-center gap-5">
          {[
            { value: stats.totalNodes, label: "Nodes" },
            { value: stats.totalLinks, label: "Links" },
            { value: stats.avgConnections.toFixed(1), label: "Avg" },
          ].map((s, i) => (
            <div key={s.label} className="flex items-center gap-5">
              {i > 0 && <div className="w-px h-6 bg-[#262626]" />}
              <div className="text-center">
                <div className="text-sm font-semibold text-white tabular-nums">
                  {s.value}
                </div>
                <div className="text-[10px] text-[#666666]">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-6xl mb-3 bg-[#141414] border border-[#262626] rounded-lg px-4 py-2.5">
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

      <div className="w-full max-w-6xl flex gap-3 flex-col lg:flex-row">
        <div className="relative flex-1 min-h-[400px] lg:min-h-[100vh] h-[70vh] lg:h-[100vh] bg-[#0a0a0a] border border-[#262626] rounded-lg overflow-hidden flex items-center justify-center">
          <ForceGraph3D
            ref={fgRef}
            graphData={data}
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
            height={undefined}
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
            nodeThreeObject={((node: { id?: string | number; connections?: number }) => {
              const cfg = getNodeLabelConfig(
                String(node.id ?? ""),
                node.connections || 0,
                labelThreshold
              );
              if (!cfg) return false as unknown as object;
              const sprite = new SpriteText(cfg.text);
              sprite.color = cfg.color;
              sprite.textHeight = cfg.textHeight;
              sprite.backgroundColor = cfg.backgroundColor;
              sprite.padding = cfg.padding;
              sprite.borderRadius = cfg.borderRadius;
              sprite.fontFace = "system-ui, -apple-system, sans-serif";
              sprite.fontWeight = "500";
              return sprite;
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
