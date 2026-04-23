import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Play } from 'lucide-react';
import type { StartNodeData } from '@/types';
import { useWorkflowStore } from '@/store/useWorkflowStore';

export function StartNode({ id, data, selected }: NodeProps<StartNodeData>) {
  const setSelectedNode = useWorkflowStore((s) => s.setSelectedNode);
  const metaCount = data.metadata ? Object.keys(data.metadata).length : 0;

  return (
    <div
      className={`workflow-node min-w-[160px] max-w-[220px] rounded-2xl overflow-hidden
        ${selected ? 'node-selected-green' : 'node-default'}`}
      onClick={() => setSelectedNode(id)}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5"
        style={{ background: 'linear-gradient(135deg, #27a845 0%, #34C759 60%, #52d68a 100%)' }}
      >
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
          <Play size={11} className="text-white fill-white" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/75">Start</span>
      </div>

      {/* Body */}
      <div className="node-body px-3 py-2.5">
        <p className="text-[13px] font-semibold text-white/90 truncate">{data.title || 'Start'}</p>
        {metaCount > 0 && (
          <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {metaCount} metadata field{metaCount > 1 ? 's' : ''}
          </p>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        style={{ background: '#34C759', borderColor: 'rgba(255,255,255,0.2)' }}
      />
    </div>
  );
}
