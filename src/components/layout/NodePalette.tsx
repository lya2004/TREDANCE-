import React from 'react';
import type { NodeType } from '@/types';
import { Play, ClipboardList, ShieldCheck, Zap, Flag } from 'lucide-react';

interface PaletteItem {
  type: NodeType;
  label: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  glow: string;
}

const paletteItems: PaletteItem[] = [
  {
    type: 'start',
    label: 'Start',
    description: 'Workflow entry point',
    icon: <Play size={14} className="fill-white text-white" />,
    gradient: 'linear-gradient(135deg, #27a845 0%, #34C759 100%)',
    glow: 'rgba(52, 199, 89, 0.4)',
  },
  {
    type: 'task',
    label: 'Task',
    description: 'Assign work to a person',
    icon: <ClipboardList size={14} className="text-white" />,
    gradient: 'linear-gradient(135deg, #005fd4 0%, #007AFF 100%)',
    glow: 'rgba(0, 122, 255, 0.4)',
  },
  {
    type: 'approval',
    label: 'Approval',
    description: 'Gate requiring sign-off',
    icon: <ShieldCheck size={14} className="text-white" />,
    gradient: 'linear-gradient(135deg, #cc7a00 0%, #FF9F0A 100%)',
    glow: 'rgba(255, 159, 10, 0.4)',
  },
  {
    type: 'automated',
    label: 'Automated',
    description: 'Trigger an automation',
    icon: <Zap size={14} className="fill-white text-white" />,
    gradient: 'linear-gradient(135deg, #8a2fc5 0%, #AF52DE 100%)',
    glow: 'rgba(175, 82, 222, 0.4)',
  },
  {
    type: 'end',
    label: 'End',
    description: 'Workflow termination',
    icon: <Flag size={14} className="text-white" />,
    gradient: 'linear-gradient(135deg, #cc1f15 0%, #FF3B30 100%)',
    glow: 'rgba(255, 59, 48, 0.4)',
  },
];

export function NodePalette() {
  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside
      className="flex flex-col w-[188px] flex-shrink-0 h-full"
      style={{
        background: 'rgba(12, 12, 17, 0.95)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        animation: 'slideInFromLeft 0.4s cubic-bezier(0.34,1.2,0.64,1) both',
      }}
    >
      {/* Header */}
      <div
        className="px-4 pt-4 pb-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <h2
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          Node Palette
        </h2>
        <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Drag onto canvas
        </p>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-1.5 p-3 overflow-y-auto flex-1">
        {paletteItems.map((item, index) => (
          <div
            key={item.type}
            draggable
            onDragStart={(e) => onDragStart(e, item.type)}
            className="palette-item group flex items-center gap-3 px-3 py-2.5 rounded-xl
              cursor-grab active:cursor-grabbing select-none
              transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: 'rgba(255,255,255,0.035)',
              border: '1px solid rgba(255,255,255,0.06)',
              animation: `fadeInScale 0.35s cubic-bezier(0.34,1.2,0.64,1) ${index * 60}ms both`,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.035)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
            }}
            title={`Drag to add ${item.label} node`}
          >
            {/* Icon */}
            <div
              className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl
                transition-transform duration-200 group-hover:scale-105"
              style={{
                background: item.gradient,
                boxShadow: `0 2px 8px ${item.glow}`,
              }}
            >
              {item.icon}
            </div>

            {/* Label */}
            <div className="min-w-0">
              <p className="text-[12px] font-semibold leading-none" style={{ color: 'rgba(255,255,255,0.8)' }}>
                {item.label}
              </p>
              <p className="text-[10px] mt-0.5 leading-tight" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer hint */}
      <div
        className="px-4 py-3 text-center"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Connect by dragging from a handle
        </p>
      </div>
    </aside>
  );
}
