import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ShieldCheck } from 'lucide-react';
import type { ApprovalNodeData } from '@/types';
import { useWorkflowStore } from '@/store/useWorkflowStore';

export function ApprovalNode({ id, data, selected }: NodeProps<ApprovalNodeData>) {
  const setSelectedNode = useWorkflowStore((s) => s.setSelectedNode);

  return (
    <div
      className={`workflow-node min-w-[180px] max-w-[240px] rounded-2xl overflow-hidden
        ${selected ? 'node-selected-amber' : 'node-default'}`}
      onClick={() => setSelectedNode(id)}
    >
      <Handle type="target" position={Position.Top} id="in"
        style={{ background: '#FF9F0A', borderColor: 'rgba(255,255,255,0.2)' }} />

      <div
        className="flex items-center gap-2 px-3 py-2.5"
        style={{ background: 'linear-gradient(135deg, #cc7a00 0%, #FF9F0A 60%, #ffb740 100%)' }}
      >
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
          <ShieldCheck size={11} className="text-white" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/75">Approval</span>
      </div>

      <div className="node-body px-3 py-2.5 space-y-1.5">
        <p className="text-[13px] font-semibold text-white/90 truncate">{data.title || 'Approval Gate'}</p>
        {data.approverRole && (
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full inline-block"
            style={{ background: 'rgba(255,159,10,0.18)', color: '#ffbe4f' }}
          >
            {data.approverRole}
          </span>
        )}
        {data.autoApproveThreshold !== undefined && (
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Auto ≤ {data.autoApproveThreshold}</p>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} id="out"
        style={{ background: '#FF9F0A', borderColor: 'rgba(255,255,255,0.2)' }} />
    </div>
  );
}
