import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ClipboardList } from 'lucide-react';
import type { TaskNodeData } from '@/types';
import { useWorkflowStore } from '@/store/useWorkflowStore';

export function TaskNode({ id, data, selected }: NodeProps<TaskNodeData>) {
  const setSelectedNode = useWorkflowStore((s) => s.setSelectedNode);

  return (
    <div
      className={`workflow-node min-w-[180px] max-w-[240px] rounded-2xl overflow-hidden
        ${selected ? 'node-selected-blue' : 'node-default'}`}
      onClick={() => setSelectedNode(id)}
    >
      <Handle type="target" position={Position.Top} id="in"
        style={{ background: '#007AFF', borderColor: 'rgba(255,255,255,0.2)' }} />

      <div
        className="flex items-center gap-2 px-3 py-2.5"
        style={{ background: 'linear-gradient(135deg, #005fd4 0%, #007AFF 60%, #339dff 100%)' }}
      >
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
          <ClipboardList size={11} className="text-white" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/75">Task</span>
      </div>

      <div className="node-body px-3 py-2.5 space-y-1.5">
        <p className="text-[13px] font-semibold text-white/90 truncate">{data.title || 'New Task'}</p>
        {data.description && (
          <p className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{data.description}</p>
        )}
        <div className="flex items-center gap-2">
          {data.assignee && (
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-full truncate max-w-[90px]"
              style={{ background: 'rgba(0,122,255,0.2)', color: '#60b0ff' }}
            >
              {data.assignee}
            </span>
          )}
          {data.dueDate && (
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{data.dueDate}</span>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} id="out"
        style={{ background: '#007AFF', borderColor: 'rgba(255,255,255,0.2)' }} />
    </div>
  );
}
