import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Zap } from 'lucide-react';
import type { AutomatedNodeData } from '@/types';
import { useWorkflowStore } from '@/store/useWorkflowStore';

export function AutomatedNode({ id, data, selected }: NodeProps<AutomatedNodeData>) {
  const setSelectedNode = useWorkflowStore((s) => s.setSelectedNode);

  return (
    <div
      className={`workflow-node min-w-[180px] max-w-[240px] rounded-2xl overflow-hidden
        ${selected ? 'node-selected-purple' : 'node-default'}`}
      onClick={() => setSelectedNode(id)}
    >
      <Handle type="target" position={Position.Top} id="in"
        style={{ background: '#AF52DE', borderColor: 'rgba(255,255,255,0.2)' }} />

      <div
        className="flex items-center gap-2 px-3 py-2.5"
        style={{ background: 'linear-gradient(135deg, #8a2fc5 0%, #AF52DE 60%, #c97af0 100%)' }}
      >
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
          <Zap size={11} className="text-white fill-white" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/75">Automated</span>
      </div>

      <div className="node-body px-3 py-2.5 space-y-1.5">
        <p className="text-[13px] font-semibold text-white/90 truncate">{data.title || 'Automation'}</p>
        {data.actionId && (
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full inline-block"
            style={{ background: 'rgba(175,82,222,0.2)', color: '#d08bef' }}
          >
            {data.actionId}
          </span>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} id="out"
        style={{ background: '#AF52DE', borderColor: 'rgba(255,255,255,0.2)' }} />
    </div>
  );
}
