import React from 'react';
import { Play, ClipboardList, ShieldCheck, Zap, Flag, Circle } from 'lucide-react';
import type { SimulationStep, NodeType } from '@/types';

interface TimelineProps {
  steps: SimulationStep[];
}

const nodeIcons: Record<NodeType, React.ReactNode> = {
  start: <Play size={14} className="fill-white" />,
  task: <ClipboardList size={14} />,
  approval: <ShieldCheck size={14} />,
  automated: <Zap size={14} className="fill-white" />,
  end: <Flag size={14} />,
};

const nodeGradients: Record<NodeType, string> = {
  start: 'linear-gradient(135deg, #27a845 0%, #34C759 100%)',
  task: 'linear-gradient(135deg, #005fd4 0%, #007AFF 100%)',
  approval: 'linear-gradient(135deg, #cc7a00 0%, #FF9F0A 100%)',
  automated: 'linear-gradient(135deg, #8a2fc5 0%, #AF52DE 100%)',
  end: 'linear-gradient(135deg, #cc1f15 0%, #FF3B30 100%)',
};

const nodeGlows: Record<NodeType, string> = {
  start: 'rgba(52, 199, 89, 0.4)',
  task: 'rgba(0, 122, 255, 0.4)',
  approval: 'rgba(255, 159, 10, 0.4)',
  automated: 'rgba(175, 82, 222, 0.4)',
  end: 'rgba(255, 59, 48, 0.4)',
};

export function Timeline({ steps }: TimelineProps) {
  if (steps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12" style={{ color: 'rgba(255,255,255,0.3)' }}>
        <Circle size={32} className="mb-3 opacity-40" />
        <p className="text-[12px]">No simulation steps to display</p>
      </div>
    );
  }

  return (
    <div className="relative pl-8">
      {/* Vertical line */}
      <div
        className="absolute left-[15px] top-3 bottom-3 w-[2px] rounded-full"
        style={{
          background: 'linear-gradient(to bottom, rgba(52,199,89,0.3) 0%, rgba(0,122,255,0.3) 50%, rgba(255,59,48,0.3) 100%)',
        }}
      />

      <div className="flex flex-col gap-4">
        {steps.map((step, index) => (
          <div
            key={`${step.nodeId}-${index}`}
            className="timeline-step relative"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            {/* Icon dot */}
            <div
              className="absolute -left-8 top-1 w-7 h-7 rounded-full flex items-center justify-center text-white z-10"
              style={{
                background: nodeGradients[step.nodeType],
                boxShadow: `0 2px 10px ${nodeGlows[step.nodeType]}`,
              }}
            >
              {nodeIcons[step.nodeType]}
            </div>

            {/* Content card */}
            <div
              className="rounded-xl px-4 py-3"
              style={{
                background: 'rgba(255,255,255,0.035)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Step {index + 1}
                </span>
                <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {step.nodeType}
                </span>
              </div>
              <p className="text-[13px] leading-relaxed font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
                {step.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
