/**
 * Dynamic Graph Traversal Engine
 *
 * This module implements a BFS-based workflow simulation engine.
 * It dynamically parses the JSON graph, builds an adjacency list,
 * and traverses from the start node — reading each node's data
 * payload at runtime to generate execution trace strings.
 *
 * ZERO hardcoded data. Every output string is derived from
 * the current user-defined canvas state.
 */

import type {
  NodeDataUnion,
  NodeType,
  SimulationResult,
  SimulationStep,
  StartNodeData,
  TaskNodeData,
  ApprovalNodeData,
  AutomatedNodeData,
  EndNodeData,
} from '@/types';

interface GraphNode {
  id: string;
  type: NodeType;
  data: NodeDataUnion;
}

interface GraphEdge {
  source: string;
  target: string;
}

interface GraphInput {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/* ── Dynamic Message Formatters ── */

function formatStartMessage(data: StartNodeData): string {
  const metaEntries = data.metadata
    ? Object.entries(data.metadata)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ')
    : '';
  const metaStr = metaEntries ? ` | Metadata: { ${metaEntries} }` : '';
  return `▶ Workflow started: "${data.title}"${metaStr}`;
}

function formatTaskMessage(data: TaskNodeData): string {
  const assignee = data.assignee || 'Unassigned';
  const dueDate = data.dueDate || 'No deadline';
  const desc = data.description ? ` — "${data.description}"` : '';
  const customEntries = data.customFields
    ? Object.entries(data.customFields)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ')
    : '';
  const customStr = customEntries ? ` | Custom: { ${customEntries} }` : '';
  return `📋 Task: "${data.title}"${desc} → Assigned to ${assignee}, due ${dueDate}${customStr}`;
}

function formatApprovalMessage(data: ApprovalNodeData): string {
  const role = data.approverRole || 'Manager';
  const threshold =
    data.autoApproveThreshold !== undefined
      ? ` (auto-approve if ≤ ${data.autoApproveThreshold})`
      : '';
  return `🛡 Approval: "${data.title}" → Requires ${role} approval${threshold}`;
}

function formatAutomatedMessage(data: AutomatedNodeData): string {
  const action = data.actionId || 'none';
  const params = data.parameters
    ? Object.entries(data.parameters)
        .map(([k, v]) => `${k}: "${v}"`)
        .join(', ')
    : 'none';
  return `⚡ Automation: "${data.title}" → Action: ${action}, Params: { ${params} }`;
}

function formatEndMessage(data: EndNodeData): string {
  const msg = data.endMessage || data.title;
  const summary = data.isSummary ? ' [Summary Enabled]' : '';
  return `🏁 Workflow completed: "${msg}"${summary}`;
}

/* ── Dynamic Message Dispatcher ── */

function formatNodeMessage(nodeType: NodeType, data: NodeDataUnion): string {
  switch (nodeType) {
    case 'start':
      return formatStartMessage(data as StartNodeData);
    case 'task':
      return formatTaskMessage(data as TaskNodeData);
    case 'approval':
      return formatApprovalMessage(data as ApprovalNodeData);
    case 'automated':
      return formatAutomatedMessage(data as AutomatedNodeData);
    case 'end':
      return formatEndMessage(data as EndNodeData);
    default:
      return `Unknown node type: ${nodeType}`;
  }
}

/* ── BFS Graph Traversal ── */

export function simulateWorkflow(graph: GraphInput): SimulationResult {
  const errors: string[] = [];

  /* 1. Validate graph has nodes */
  if (!graph.nodes || graph.nodes.length === 0) {
    return { success: false, log: [], errors: ['Graph contains no nodes.'] };
  }

  /* 2. Build adjacency list */
  const adjacency = new Map<string, string[]>();
  const nodeMap = new Map<string, GraphNode>();

  for (const node of graph.nodes) {
    adjacency.set(node.id, []);
    nodeMap.set(node.id, node);
  }

  for (const edge of graph.edges) {
    const neighbors = adjacency.get(edge.source);
    if (neighbors) {
      neighbors.push(edge.target);
    }
  }

  /* 3. Find start node(s) */
  const startNodes = graph.nodes.filter((n) => n.type === 'start');
  if (startNodes.length === 0) {
    return { success: false, log: [], errors: ['No Start node found in the workflow.'] };
  }
  if (startNodes.length > 1) {
    errors.push('Multiple Start nodes detected — using the first one.');
  }

  /* 4. Cycle detection (DFS) */
  const hasCycle = detectCycle(graph.nodes, adjacency);
  if (hasCycle) {
    return {
      success: false,
      log: [],
      errors: ['Cycle detected in workflow graph. Cannot simulate an infinite loop.'],
    };
  }

  /* 5. BFS traversal from start node */
  const startNode = startNodes[0];
  const visited = new Set<string>();
  const queue: string[] = [startNode.id];
  const log: SimulationStep[] = [];
  let stepTime = Date.now();

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const node = nodeMap.get(currentId);
    if (!node) {
      errors.push(`Node ${currentId} referenced but not found in graph.`);
      continue;
    }

    /* Dynamically format the execution message from the node's data */
    const message = formatNodeMessage(node.type, node.data);

    log.push({
      nodeId: node.id,
      nodeType: node.type,
      message,
      timestamp: stepTime,
    });

    stepTime += 1000; // Simulate 1s between steps

    /* Enqueue neighbors */
    const neighbors = adjacency.get(currentId) || [];
    for (const neighborId of neighbors) {
      if (!visited.has(neighborId)) {
        queue.push(neighborId);
      }
    }
  }

  /* 6. Check for orphan nodes */
  const orphans = graph.nodes.filter((n) => !visited.has(n.id));
  if (orphans.length > 0) {
    const orphanNames = orphans.map((o) => `"${o.data.title}" (${o.id})`).join(', ');
    errors.push(`Orphan nodes not reachable from Start: ${orphanNames}`);
  }

  return {
    success: errors.length === 0,
    log,
    errors,
  };
}

/* ── Cycle Detection (DFS with recursion stack) ── */

function detectCycle(
  nodes: GraphNode[],
  adjacency: Map<string, string[]>
): boolean {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const neighbors = adjacency.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id)) return true;
    }
  }

  return false;
}
