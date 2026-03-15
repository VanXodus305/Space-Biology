"use client";

import { motion } from "framer-motion";
import { X, Zap, Users } from "lucide-react";
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
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`relative w-80 bg-slate-900/95 border border-sky-500/20 rounded-2xl p-6 shadow-xl shadow-sky-500/10 backdrop-blur-xl overflow-y-auto ${className}`}
      style={{ maxHeight }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-slate-800/50 hover:bg-sky-500/20 border border-slate-700 rounded-lg p-2 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500"
        aria-label="Close node details"
      >
        <X className="w-4 h-4 text-slate-400" />
      </button>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-sky-500/20 p-2 rounded-lg border border-sky-500/30">
            {selectedNode.group === 1 ? "📍" : "🎯"}
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {selectedNode.group === 1 ? "Subject Node" : "Object Node"}
          </span>
        </div>
        <h3 className="text-xl font-bold text-slate-200 break-words">
          {selectedNode.id}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <div className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">
            {selectedNode.connections}
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">
            Connections
          </div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <div className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-sky-400 bg-clip-text text-transparent">
            {selectedNode.relatedNodes.length}
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">
            Related Nodes
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-sky-400" />
          Relationships ({selectedNode.relatedPredicates.length})
        </h4>
        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
          {selectedNode.relatedPredicates.slice(0, 10).map((pred, i) => (
            <div
              key={`${pred}-${i}`}
              className="bg-slate-800/60 border border-sky-500/20 rounded-lg px-3 py-2 text-sm text-sky-300"
            >
              {pred}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-violet-400" />
          Connected Nodes ({selectedNode.relatedNodes.length})
        </h4>
        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
          {selectedNode.relatedNodes.slice(0, 15).map((nodeId) => (
            <button
              key={nodeId}
              onClick={() => {
                const node = nodes.find((n) => n.id === nodeId);
                if (node) onNodeClick(node as GraphNode);
              }}
              className="w-full bg-slate-800/60 border border-slate-700/50 hover:border-sky-500/30 rounded-lg px-3 py-2 text-sm text-sky-300 text-left transition-all hover:bg-sky-500/10 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            >
              {nodeId}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
