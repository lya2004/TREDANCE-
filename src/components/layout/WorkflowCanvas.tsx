import React, { useCallback } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  MiniMap,
  ReactFlowProvider,
  SelectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { useCanvasLogic } from '@/hooks/useCanvasLogic';
import { nodeTypes } from '@/components/nodes';

function CanvasInner() {
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const onNodesChange = useWorkflowStore((s) => s.onNodesChange);
  const onEdgesChange = useWorkflowStore((s) => s.onEdgesChange);
  const onConnect = useWorkflowStore((s) => s.onConnect);
  const isMinimapVisible = useWorkflowStore((s) => s.isMinimapVisible);
  const setSelectedNode = useWorkflowStore((s) => s.setSelectedNode);

  const { onDragOver, onDrop, onNodeDragStop, isValidConnection } = useCanvasLogic();

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  console.log('[WorkflowCanvas] Component Rendered! Hook loaded.');

  return (
    <div className="w-full h-full relative">
      {/* Animated ambient gradient background */}
      <div className="canvas-bg" />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeDragStop={onNodeDragStop}
        onPaneClick={onPaneClick}
        isValidConnection={isValidConnection}
        nodeTypes={nodeTypes}
        fitViewOptions={{ padding: 0.2 }}
        selectionMode={SelectionMode.Partial}
        minZoom={0.2}
        maxZoom={2}
        snapToGrid
        snapGrid={[16, 16]}
        deleteKeyCode={['Backspace', 'Delete']}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'transparent' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1}
          color="rgba(255,255,255,0.06)"
        />
        {isMinimapVisible && (
          <MiniMap
            nodeStrokeWidth={3}
            pannable
            zoomable
            style={{ bottom: 16, right: 16 }}
          />
        )}
      </ReactFlow>

      {/* Empty state hint */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-center" style={{ animation: 'fadeInScale 0.5s cubic-bezier(0.34,1.2,0.64,1) 0.2s both' }}>
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect x="4" y="4" width="10" height="10" rx="3" fill="#34C759" fillOpacity="0.4" />
                <rect x="11" y="18" width="10" height="10" rx="3" fill="#007AFF" fillOpacity="0.4" />
                <line x1="9" y1="14" x2="16" y2="18" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="3 2" />
              </svg>
            </div>
            <h3 className="text-[13px] font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Canvas is empty
            </h3>
            <p className="text-[11px] mt-1.5" style={{ color: 'rgba(255,255,255,0.18)' }}>
              Drag nodes from the panel to get started
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
