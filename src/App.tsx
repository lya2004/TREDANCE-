import React, { useEffect, useCallback } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { NodePalette } from '@/components/layout/NodePalette';
import { WorkflowCanvas } from '@/components/layout/WorkflowCanvas';
import { PropertiesPanel } from '@/components/layout/PropertiesPanel';
import { SimulationSandbox } from '@/components/layout/SimulationSandbox';
import { useWorkflowStore } from '@/store/useWorkflowStore';

export default function App() {
  const undo = useWorkflowStore((s) => s.undo);
  const redo = useWorkflowStore((s) => s.redo);
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);

  /* Global keyboard shortcuts */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (isMeta && (e.key === 'Z' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    },
    [undo, redo]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-ivory">
      <TopBar />

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <NodePalette />

        {/* Main canvas */}
        <main className="flex-1 relative overflow-hidden">
          <WorkflowCanvas />
        </main>

        {/* Right panel — only visible when a node is selected */}
        {selectedNodeId && <PropertiesPanel />}
      </div>

      {/* Simulation sandbox overlay */}
      <SimulationSandbox />
    </div>
  );
}
