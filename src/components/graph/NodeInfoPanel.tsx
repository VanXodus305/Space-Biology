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
      className={`relative w-80 bg-slate-900 border border-slate-700 rounded-lg overflow-y-auto ${className}`}
      style={{ maxHeight }}
    >
      <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-5 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block w-2.5 h-2.5 rounded-full ${
              selectedNode.group === 1 ? "bg-cyan-500" : "bg-teal-400"
            }`}
          />
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {selectedNode.group === 1 ? "Subject" : "Object"}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-300 p-1 rounded-md hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-600"
          aria-label="Close node details"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-5 py-4">
        <h3 className="text-base font-semibold text-slate-200 break-words leading-snug">
          {selectedNode.id}
        </h3>

        <div className="flex gap-3 mt-4">
          <div className="flex-1 bg-slate-800 rounded-md p-3">
            <div className="text-lg font-semibold text-cyan-400 tabular-nums">
              {selectedNode.connections}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Connections</div>
          </div>
          <div className="flex-1 bg-slate-800 rounded-md p-3">
            <div className="text-lg font-semibold text-teal-400 tabular-nums">
              {selectedNode.relatedNodes.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Related</div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-4">
        <h4 className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
          <ArrowRight className="w-3 h-3 text-cyan-600" />
          Relationships ({selectedNode.relatedPredicates.length})
        </h4>
        <div className="space-y-1 max-h-36 overflow-y-auto custom-scrollbar">
          {selectedNode.relatedPredicates.slice(0, 10).map((pred, i) => (
            <div
              key={`${pred}-${i}`}
              className="bg-slate-800 rounded px-3 py-1.5 text-xs text-slate-300 font-mono"
            >
              {pred}
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 pb-5">
        <h4 className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
          <Network className="w-3 h-3 text-teal-600" />
          Connected Nodes ({selectedNode.relatedNodes.length})
        </h4>
        <div className="space-y-1 max-h-52 overflow-y-auto custom-scrollbar">
          {selectedNode.relatedNodes.slice(0, 15).map((nodeId) => (
            <button
              key={nodeId}
              onClick={() => {
                const node = nodes.find((n) => n.id === nodeId);
                if (node) onNodeClick(node as GraphNode);
              }}
              className="w-full bg-slate-800 hover:bg-slate-750 border border-transparent hover:border-cyan-800/50 rounded px-3 py-1.5 text-xs text-slate-300 text-left transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-600"
            >
              {nodeId}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
