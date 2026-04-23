import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Flag } from 'lucide-react';
import type { EndNodeData } from '@/types';
import { useWorkflowStore } from '@/store/useWorkflowStore';

export function EndNode({ id, data, selected }: NodeProps<EndNodeData>) {
  const setSelectedNode = useWorkflowStore((s) => s.setSelectedNode);

  return (
    <div
      className={`workflow-node min-w-[160px] max-w-[220px] rounded-2xl overflow-hidden
        ${selected ? 'node-selected-red' : 'node-default'}`}
      onClick={() => setSelectedNode(id)}
    >
      <Handle type="target" position={Position.Top} id="in"
        style={{ background: '#FF3B30', borderColor: 'rgba(255,255,255,0.2)' }} />

      <div
        className="flex items-center gap-2 px-3 py-2.5"
        style={{ background: 'linear-gradient(135deg, #cc1f15 0%, #FF3B30 60%, #ff6b63 100%)' }}
      >
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
          <Flag size={11} className="text-white" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/75">End</span>
      </div>

      <div className="node-body px-3 py-2.5 space-y-1.5">
        <p className="text-[13px] font-semibold text-white/90 truncate">{data.title || 'End'}</p>
        {data.endMessage && (
          <p className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{data.endMessage}</p>
        )}
        {data.isSummary && (
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full inline-block"
            style={{ background: 'rgba(255,59,48,0.18)', color: '#ff7570' }}
          >
            Summary
          </span>
        )}
      </div>
    </div>
  );
}
