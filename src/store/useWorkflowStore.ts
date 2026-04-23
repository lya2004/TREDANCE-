import { create } from 'zustand';
import {
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Connection,
  NodeChange,
  EdgeChange,
} from 'reactflow';
import type {
  NodeDataUnion,
  SimulationResult,
  WorkflowJSON,
  HistoryState,
} from '@/types';

/* ── Store Interface ── */

interface WorkflowState {
  /* Canvas state */
  nodes: Node<NodeDataUnion>[];
  edges: Edge[];
  selectedNodeId: string | null;

  /* Simulation */
  simulationResults: SimulationResult | null;
  isSimulating: boolean;

  /* History (Undo/Redo) */
  past: HistoryState[];
  future: HistoryState[];

  /* UI State */
  isSandboxOpen: boolean;
  isMinimapVisible: boolean;

  /* Canvas Actions */
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (node: Node<NodeDataUnion>) => void;
  removeNode: (nodeId: string) => void;
  updateNodeData: (nodeId: string, data: Partial<NodeDataUnion>) => void;
  setSelectedNode: (nodeId: string | null) => void;

  /* Simulation Actions */
  setSimulationResults: (results: SimulationResult | null) => void;
  setIsSimulating: (value: boolean) => void;

  /* History Actions */
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;

  /* UI Actions */
  toggleSandbox: () => void;
  toggleMinimap: () => void;

  /* Serialization */
  serializeWorkflow: () => WorkflowJSON;
  loadWorkflow: (json: WorkflowJSON) => void;
  clearCanvas: () => void;
}

/* ── Helper: Snapshot current state for history ── */
function snapshot(state: WorkflowState): HistoryState {
  return {
    nodes: state.nodes.map((n) => ({
      id: n.id,
      type: n.type ?? 'default',
      position: { ...n.position },
      data: { ...n.data },
    })),
    edges: state.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
    })),
  };
}

/* ── Helper: Restore from history snapshot ── */
function restoreSnapshot(snap: HistoryState): {
  nodes: Node<NodeDataUnion>[];
  edges: Edge[];
} {
  return {
    nodes: snap.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: { ...n.position },
      data: { ...n.data } as NodeDataUnion,
    })),
    edges: snap.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
    })),
  };
}

const MAX_HISTORY = 50;

/* ── Zustand Store ── */

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  /* Initial State */
  nodes: [],
  edges: [],
  selectedNodeId: null,
  simulationResults: null,
  isSimulating: false,
  past: [],
  future: [],
  isSandboxOpen: false,
  isMinimapVisible: false,

  /* ── Canvas Actions ── */

  onNodesChange: (changes: NodeChange[]) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes) as Node<NodeDataUnion>[],
    }));
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
  },

  onConnect: (connection: Connection) => {
    const state = get();
    state.pushHistory();
    set((s) => ({
      edges: addEdge(
        {
          ...connection,
          animated: true,
          style: { strokeWidth: 2, stroke: '#AEAEB2' },
        },
        s.edges
      ),
    }));
  },

  addNode: (node: Node<NodeDataUnion>) => {
    const state = get();
    state.pushHistory();
    set((s) => ({ nodes: [...s.nodes, node] }));
  },

  removeNode: (nodeId: string) => {
    const state = get();
    state.pushHistory();
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== nodeId),
      edges: s.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: s.selectedNodeId === nodeId ? null : s.selectedNodeId,
    }));
  },

  updateNodeData: (nodeId: string, data: Partial<NodeDataUnion>) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } as NodeDataUnion }
          : node
      ),
    }));
  },

  setSelectedNode: (nodeId: string | null) => {
    set({ selectedNodeId: nodeId });
  },

  /* ── Simulation Actions ── */

  setSimulationResults: (results: SimulationResult | null) => {
    set({ simulationResults: results });
  },

  setIsSimulating: (value: boolean) => {
    set({ isSimulating: value });
  },

  /* ── History (Undo/Redo) ── */

  pushHistory: () => {
    const state = get();
    const snap = snapshot(state);
    set((s) => ({
      past: [...s.past.slice(-MAX_HISTORY), snap],
      future: [],
    }));
  },

  undo: () => {
    const state = get();
    if (state.past.length === 0) return;

    const currentSnap = snapshot(state);
    const previousSnap = state.past[state.past.length - 1];
    const restored = restoreSnapshot(previousSnap);

    set({
      nodes: restored.nodes,
      edges: restored.edges,
      past: state.past.slice(0, -1),
      future: [currentSnap, ...state.future],
    });
  },

  redo: () => {
    const state = get();
    if (state.future.length === 0) return;

    const currentSnap = snapshot(state);
    const nextSnap = state.future[0];
    const restored = restoreSnapshot(nextSnap);

    set({
      nodes: restored.nodes,
      edges: restored.edges,
      past: [...state.past, currentSnap],
      future: state.future.slice(1),
    });
  },

  /* ── UI Actions ── */

  toggleSandbox: () => {
    set((s) => ({ isSandboxOpen: !s.isSandboxOpen }));
  },

  toggleMinimap: () => {
    set((s) => ({ isMinimapVisible: !s.isMinimapVisible }));
  },

  /* ── Serialization ── */

  serializeWorkflow: (): WorkflowJSON => {
    const state = get();
    return {
      nodes: state.nodes.map((n) => ({
        id: n.id,
        type: n.type ?? 'default',
        position: { ...n.position },
        data: { ...n.data },
      })),
      edges: state.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
      })),
      metadata: {
        name: 'Strich Workflow',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
      },
    };
  },

  loadWorkflow: (json: WorkflowJSON) => {
    const state = get();
    state.pushHistory();
    set({
      nodes: json.nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
      })),
      edges: json.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        animated: true,
        style: { strokeWidth: 2, stroke: '#AEAEB2' },
      })),
      selectedNodeId: null,
    });
  },

  clearCanvas: () => {
    const state = get();
    state.pushHistory();
    set({ nodes: [], edges: [], selectedNodeId: null });
  },
}));
