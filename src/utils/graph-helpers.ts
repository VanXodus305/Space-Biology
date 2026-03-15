import type { Link, GraphNode, NodeInfo } from "@/types/graph";

type LinkLike = { source?: unknown; target?: unknown };

/** Extract source node ID from a link (handles both string and object references) */
export function getLinkSourceId(link: Link | LinkLike): string {
  return typeof link.source === "object" && link.source && "id" in link.source
    ? String((link.source as { id: string }).id)
    : String(link.source ?? "");
}

/** Extract target node ID from a link (handles both string and object references) */
export function getLinkTargetId(link: Link | LinkLike): string {
  return typeof link.target === "object" && link.target && "id" in link.target
    ? String((link.target as { id: string }).id)
    : String(link.target ?? "");
}

/** Create a unique key for a link for O(1) lookup in highlight maps */
export function getLinkKey(link: Link | LinkLike): string {
  return `${getLinkSourceId(link)}|${getLinkTargetId(link)}`;
}

/** Create a Set of link keys for O(1) highlight lookup */
export function createHighlightLinkKeys(links: Link[]): Set<string> {
  return new Set(links.map(getLinkKey));
}

/** Build NodeInfo and related links from a node click */
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
