// Shared graph types for Knowledge Graph components

export interface Triple {
  subject: string;
  predicate: string;
  object: string;
  title?: string;
  chunk_id?: string;
  faiss_verified?: boolean;
}

export interface Node {
  id: string;
  group?: number;
  connections?: number;
}

export interface Link {
  source: string | Node;
  target: string | Node;
  predicate: string;
}

export interface GraphData {
  nodes: Node[];
  links: Link[];
}

export interface NodeInfo {
  id: string;
  group: number;
  connections: number;
  relatedNodes: string[];
  relatedPredicates: string[];
}

export interface GraphNode {
  id?: string | number;
  group?: number;
  connections?: number;
  [key: string]: unknown;
}
