"use client";

import { motion } from "framer-motion";
import { X, ArrowRight, Network } from "lucide-react";
import type { NodeInfo, Node, GraphNode } from "@/types/graph";

interface NodeInfoPanelProps {
  selectedNode: NodeInfo;
  nodes: Node[];
  onClose: () => void;
  onNodeClick: (node: GraphNode) => void;
  maxHeight?: string;
  className?: string;
}

export function NodeInfoPanel({
  selectedNode,
  nodes,
  onClose,
  onNodeClick,
  maxHeight = "100vh",
  className = "",
}: NodeInfoPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.2 }}
      className={`relative w-80 bg-[#141414] border border-[#262626] rounded-lg overflow-y-auto ${className}`}
      style={{ maxHeight }}
    >
      {/* Cyan accent bar at the top to tie into graph emphasis color */}
      <div className="h-[2px] bg-gradient-to-r from-[#e8e8e8] to-[#e8e8e8]/20" />

      <div className="sticky top-0 bg-[#141414]/95 backdrop-blur-sm border-b border-[#262626] px-5 py-4 z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e8e8e8] opacity-40" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#e8e8e8]" />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#e8e8e8]">
              {selectedNode.group === 1 ? "Subject" : "Object"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#666666] hover:text-white p-1 rounded-md hover:bg-[#1c1c1c] transition-colors focus:outline-none focus:ring-2 focus:ring-[#e8e8e8]"
            aria-label="Close node details"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <h3 className="text-[15px] font-semibold text-white break-words leading-snug">
          {selectedNode.id}
        </h3>
      </div>

      <div className="px-5 py-4">
        <div className="flex gap-3">
          <div className="flex-1 bg-[#1c1c1c] border border-[#262626] rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-[#e8e8e8] tabular-nums">
              {selectedNode.connections}
            </div>
            <div className="text-[10px] text-[#666666] mt-0.5 uppercase tracking-wider">
              Connections
            </div>
          </div>
          <div className="flex-1 bg-[#1c1c1c] border border-[#262626] rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-white tabular-nums">
              {selectedNode.relatedNodes.length}
            </div>
            <div className="text-[10px] text-[#666666] mt-0.5 uppercase tracking-wider">
              Related
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-4">
        <h4 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666666] mb-2 flex items-center gap-1.5">
          <ArrowRight className="w-3 h-3 text-[#555]" />
          Relationships ({selectedNode.relatedPredicates.length})
        </h4>
        <div className="space-y-1 max-h-36 overflow-y-auto custom-scrollbar">
          {selectedNode.relatedPredicates.slice(0, 10).map((pred, i) => (
            <div
              key={`${pred}-${i}`}
              className="bg-[#1c1c1c] border border-[#262626] rounded px-3 py-1.5 text-xs text-[#a3a3a3] font-mono"
            >
              {pred}
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 pb-5">
        <h4 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666666] mb-2 flex items-center gap-1.5">
          <Network className="w-3 h-3 text-[#555]" />
          Connected Nodes ({selectedNode.relatedNodes.length})
        </h4>
        <div className="space-y-1 max-h-52 overflow-y-auto custom-scrollbar">
          {selectedNode.relatedNodes.slice(0, 15).map((nodeId) => {
            const connNode = nodes.find((n) => n.id === nodeId);
            return (
              <button
                key={nodeId}
                onClick={() => {
                  if (connNode) onNodeClick(connNode as GraphNode);
                }}
                className="group w-full flex items-center gap-2 bg-[#1c1c1c] hover:bg-[#1f1f1f] border border-[#262626] hover:border-[#e8e8e8]/30 rounded px-3 py-2 text-left transition-colors focus:outline-none focus:ring-1 focus:ring-[#e8e8e8]"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#555] group-hover:bg-white transition-colors flex-shrink-0" />
                <span className="text-xs text-[#a3a3a3] group-hover:text-white transition-colors truncate">
                  {nodeId}
                </span>
                {connNode?.connections != null && connNode.connections > 0 && (
                  <span className="ml-auto text-[10px] tabular-nums text-[#555] group-hover:text-[#e8e8e8]/60 transition-colors flex-shrink-0">
                    {connNode.connections}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
