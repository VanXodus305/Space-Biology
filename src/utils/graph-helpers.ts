import type { Link, GraphNode, NodeInfo, Node } from "@/types/graph";

type LinkLike = { source?: unknown; target?: unknown };

// ---------------------------------------------------------------------------
// Link helpers
// ---------------------------------------------------------------------------

export function getLinkSourceId(link: Link | LinkLike): string {
  return typeof link.source === "object" && link.source && "id" in link.source
    ? String((link.source as { id: string }).id)
    : String(link.source ?? "");
}

export function getLinkTargetId(link: Link | LinkLike): string {
  return typeof link.target === "object" && link.target && "id" in link.target
    ? String((link.target as { id: string }).id)
    : String(link.target ?? "");
}

export function getLinkKey(link: Link | LinkLike): string {
  return `${getLinkSourceId(link)}|${getLinkTargetId(link)}`;
}

export function createHighlightLinkKeys(links: Link[]): Set<string> {
  return new Set(links.map(getLinkKey));
}

export function extractLinkEndpoints(link: {
  source?: unknown;
  target?: unknown;
}): { source: string; target: string } {
  const source =
    typeof link.source === "object" && link.source && "id" in link.source
      ? String((link.source as { id: string }).id)
      : String(link.source ?? "");
  const target =
    typeof link.target === "object" && link.target && "id" in link.target
      ? String((link.target as { id: string }).id)
      : String(link.target ?? "");
  return { source, target };
}

// ---------------------------------------------------------------------------
// Node info from click
// ---------------------------------------------------------------------------

export function createNodeInfoFromClick(
  node: GraphNode,
  links: Link[]
): { nodeInfo: NodeInfo; relatedLinks: Link[] } {
  const nodeId = String(node.id ?? "");

  const relatedLinks = links.filter((link) => {
    const sourceId = getLinkSourceId(link);
    const targetId = getLinkTargetId(link);
    return sourceId === nodeId || targetId === nodeId;
  });

  const relatedNodes = new Set<string>();
  const relatedPredicates = new Set<string>();

  relatedLinks.forEach((link) => {
    const sourceId = getLinkSourceId(link);
    const targetId = getLinkTargetId(link);
    if (sourceId === nodeId) relatedNodes.add(targetId);
    if (targetId === nodeId) relatedNodes.add(sourceId);
    relatedPredicates.add(link.predicate);
  });

  const nodeInfo: NodeInfo = {
    id: nodeId,
    group: node.group ?? 1,
    connections: relatedLinks.length,
    relatedNodes: Array.from(relatedNodes),
    relatedPredicates: Array.from(relatedPredicates),
  };

  return { nodeInfo, relatedLinks };
}

// ---------------------------------------------------------------------------
// Node visual state — shared across Explore & Query graph surfaces
// ---------------------------------------------------------------------------

export interface NodeRenderState {
  nodeId: string;
  group: number;
  connections: number;
  hoveredNode: string | null;
  highlightNodes: Set<string>;
  selectedNodeId: string | null;
}

/**
 * Log-scaled importance size. Low-connection nodes stay quiet;
 * high-degree hubs become visible anchors. Interaction states
 * add a temporary bump on top of the base.
 */
export function getNodeSize(state: NodeRenderState): number {
  const { nodeId, connections, hoveredNode, highlightNodes } = state;
  const base = Math.max(1.5, Math.log2((connections || 0) + 1) * 2.2);

  if (highlightNodes.size > 0 && highlightNodes.has(nodeId)) return base + 5;
  if (hoveredNode === nodeId) return base + 3;
  return base;
}

/**
 * Restrained grayscale by default, with bright white-gray accent
 * for highlighted / selected paths and white for hover.
 */
export function getNodeColor(state: NodeRenderState): string {
  const { nodeId, group, hoveredNode, highlightNodes, selectedNodeId } = state;

  if (selectedNodeId === nodeId) return "#e8e8e8";
  if (highlightNodes.size > 0 && highlightNodes.has(nodeId)) return "#e8e8e8";
  if (hoveredNode === nodeId) return "#ffffff";
  if (highlightNodes.size > 0) return "#1a1a1a";

  return group === 1 ? "#b0b0b0" : "#555555";
}

// ---------------------------------------------------------------------------
// Link visual helpers
// ---------------------------------------------------------------------------

export function getLinkColorValue(
  sourceId: string,
  targetId: string,
  hoveredNode: string | null,
  isHighlighted: boolean,
  hasHighlights: boolean
): string {
  if (hasHighlights) {
    return isHighlighted
      ? "rgba(232, 232, 232, 0.85)"
      : "rgba(255, 255, 255, 0.03)";
  }
  if (
    hoveredNode &&
    (sourceId === hoveredNode || targetId === hoveredNode)
  ) {
    return "rgba(232, 232, 232, 0.85)";
  }
  return "rgba(255, 255, 255, 0.06)";
}

export function getLinkWidthValue(
  sourceId: string,
  targetId: string,
  hoveredNode: string | null,
  isHighlighted: boolean,
  hasHighlights: boolean
): number {
  if (hasHighlights && isHighlighted) return 3;
  if (
    hoveredNode &&
    (sourceId === hoveredNode || targetId === hoveredNode)
  ) {
    return 2.5;
  }
  return 0.6;
}

// ---------------------------------------------------------------------------
// Persistent label helpers (used with three-spritetext in client components)
// ---------------------------------------------------------------------------

export interface LabelConfig {
  text: string;
  color: string;
  textHeight: number;
  backgroundColor: string;
  padding: number;
  borderRadius: number;
}

/**
 * Compute the connection-count threshold above which nodes get a
 * persistent text label. Only the top-N nodes qualify.
 */
export function computeLabelThreshold(
  nodes: Node[],
  topN: number = 25
): number {
  const counts = nodes
    .map((n) => n.connections || 0)
    .sort((a, b) => b - a);
  if (counts.length === 0) return Infinity;
  return counts[Math.min(topN - 1, counts.length - 1)] || 1;
}

/**
 * Returns sprite configuration for an important node,
 * or `null` for nodes that should stay label-free.
 */
export function getNodeLabelConfig(
  nodeId: string,
  connections: number,
  labelThreshold: number
): LabelConfig | null {
  if (connections < labelThreshold) return null;

  const text =
    nodeId.length > 22 ? nodeId.slice(0, 22) + "\u2026" : nodeId;

  return {
    text,
    color: "#d4d4d4",
    textHeight: 2.2,
    backgroundColor: "rgba(10, 10, 10, 0.65)",
    padding: 1.5,
    borderRadius: 2,
  };
}

/**
 * HTML tooltip shown on hover (richer than the persistent label).
 */
export function getNodeTooltipHtml(
  nodeId: string | number,
  group: number
): string {
  return `
    <div style="
      background: #141414;
      color: #e5e5e5;
      padding: 8px 12px;
      border-radius: 6px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 12px;
      font-weight: 500;
      border: 1px solid #404040;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      max-width: 220px;
      word-wrap: break-word;
    ">
      <div style="margin-bottom: 2px; font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; color: #a3a3a3;">
        ${group === 1 ? "Subject" : "Object"}
      </div>
      ${nodeId}
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Entry animation & physics presets (shared across Explore & Query graphs)
// ---------------------------------------------------------------------------

export interface GraphNodeWithPosition extends Node {
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
}

/** Seeded pseudo-random for deterministic initial positions */
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

/**
 * Apply "drop from above" initial positions to nodes.
 * Nodes start in a band above the scene (high Y) with spread in X/Z,
 * slightly clustered by group so subjects and objects form loose bands.
 */
export function applyEntryPositions<T extends GraphNodeWithPosition>(
  nodes: T[],
  options?: { startY?: number; spread?: number; seed?: number }
): void {
  const startY = options?.startY ?? 70;
  const spread = options?.spread ?? 45;
  const seed = options?.seed ?? 42;
  const rng = seededRandom(seed);

  nodes.forEach((node, i) => {
    const group = node.group ?? 1;
    const bandOffset = (group - 1) * 15;
    node.x = (rng() - 0.5) * 2 * spread + bandOffset * (rng() - 0.5);
    node.y = startY + (rng() - 0.5) * 20;
    node.z = (rng() - 0.5) * 2 * spread + bandOffset * (rng() - 0.5);
    node.vx = 0;
    node.vy = 0;
    node.vz = 0;
  });
}

/** Duration (ms) for the dramatic drop on the explore graph */
export const ENTRY_ANIMATION_DURATION_EXPLORE = 1500;

/** Duration (ms) for the shorter drop on the query graph */
export const ENTRY_ANIMATION_DURATION_QUERY = 900;

/**
 * Physics preset for the entry "drop" phase: slower alpha decay
 * so the simulation runs longer, creating a visible cascade.
 */
export const ENTRY_PHYSICS = {
  d3AlphaDecay: 0.018,
  d3AlphaMin: 0.001,
  cooldownTime: 2500,
  cooldownTicks: 500,
};

/**
 * Physics preset for the settled state: normal decay,
 * more compact/clustered feel via slightly stronger link force.
 */
export const SETTLED_PHYSICS = {
  d3AlphaDecay: 0.0228,
  d3AlphaMin: 0.001,
  cooldownTime: 1500,
  cooldownTicks: 300,
};

/**
 * Clustered/organic force config: slightly stronger link attraction
 * and weaker charge repulsion so nodes feel more grouped.
 */
export const CLUSTERED_FORCE_CONFIG = {
  linkDistance: 80,
  linkStrength: 0.5,
  chargeStrength: -25,
};
