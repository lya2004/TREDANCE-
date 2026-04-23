/* ── Phase 1: TypeScript Domain Models ── */

export type NodeType = 'start' | 'task' | 'approval' | 'automated' | 'end';

/* ── Node Data Interfaces ── */

export interface BaseNodeData {
  title: string;
  nodeType: NodeType;
}

export interface StartNodeData extends BaseNodeData {
  nodeType: 'start';
  metadata?: Record<string, string>;
}

export interface TaskNodeData extends BaseNodeData {
  nodeType: 'task';
  description?: string;
  assignee?: string;
  dueDate?: string;
  customFields?: Record<string, string>;
}

export interface ApprovalNodeData extends BaseNodeData {
  nodeType: 'approval';
  approverRole?: 'Manager' | 'HRBP' | 'Director';
  autoApproveThreshold?: number;
}

export interface AutomatedNodeData extends BaseNodeData {
  nodeType: 'automated';
  actionId?: string;
  parameters?: Record<string, string>;
}

export interface EndNodeData extends BaseNodeData {
  nodeType: 'end';
  endMessage?: string;
  isSummary?: boolean;
}

export type NodeDataUnion =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedNodeData
  | EndNodeData;

/* ── Automation Actions (from GET /api/automations) ── */

export interface AutomationAction {
  id: string;
  label: string;
  params: string[];
}

/* ── Simulation Types ── */

export interface SimulationStep {
  nodeId: string;
  nodeType: NodeType;
  message: string;
  timestamp: number;
}

export interface SimulationResult {
  success: boolean;
  log: SimulationStep[];
  errors: string[];
}

/* ── Validation Types ── */

export interface ValidationError {
  type: 'error' | 'warning';
  message: string;
  nodeIds: string[];
}

/* ── Workflow Serialization ── */

export interface SerializedNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeDataUnion;
}

export interface SerializedEdge {
  id: string;
  source: string;
  target: string;
}

export interface WorkflowJSON {
  nodes: SerializedNode[];
  edges: SerializedEdge[];
  metadata: {
    name: string;
    version: string;
    exportedAt: string;
  };
}

/* ── History (Undo/Redo) ── */

export interface HistoryState {
  nodes: SerializedNode[];
  edges: SerializedEdge[];
}
