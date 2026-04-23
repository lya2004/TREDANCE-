import type { Node, Edge } from 'reactflow';
import type { NodeDataUnion, ValidationError, NodeType } from '@/types';

/**
 * Pre-flight validation for workflow graphs.
 * Checks structural integrity before simulation.
 */
export function validateWorkflow(
  nodes: Node<NodeDataUnion>[],
  edges: Edge[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  /* 1. Must have at least one node */
  if (nodes.length === 0) {
    errors.push({
      type: 'error',
      message: 'Canvas is empty. Add nodes to build a workflow.',
      nodeIds: [],
    });
    return errors;
  }

  /* 2. Must have exactly one Start node */
  const startNodes = nodes.filter((n) => (n.data as NodeDataUnion).nodeType === 'start');
  if (startNodes.length === 0) {
    errors.push({
      type: 'error',
      message: 'Missing Start node. Every workflow must begin with a Start node.',
      nodeIds: [],
    });
  } else if (startNodes.length > 1) {
    errors.push({
      type: 'error',
      message: 'Multiple Start nodes detected. Only one is allowed.',
      nodeIds: startNodes.map((n) => n.id),
    });
  }

  /* 3. Must have at least one End node */
  const endNodes = nodes.filter((n) => (n.data as NodeDataUnion).nodeType === 'end');
  if (endNodes.length === 0) {
    errors.push({
      type: 'error',
      message: 'Missing End node. Every workflow must have at least one End node.',
      nodeIds: [],
    });
  }

  /* 4. Check for orphan / disconnected nodes */
  const connectedNodeIds = new Set<string>();
  for (const edge of edges) {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  }

  if (nodes.length > 1) {
    const orphans = nodes.filter((n) => !connectedNodeIds.has(n.id));
    if (orphans.length > 0) {
      errors.push({
        type: 'warning',
        message: `${orphans.length} disconnected node(s) found. Connect them to the workflow.`,
        nodeIds: orphans.map((n) => n.id),
      });
    }
  }

  /* 5. Start node should not have incoming edges */
  if (startNodes.length === 1) {
    const startId = startNodes[0].id;
    const incomingToStart = edges.filter((e) => e.target === startId);
    if (incomingToStart.length > 0) {
      errors.push({
        type: 'warning',
        message: 'Start node should not have incoming connections.',
        nodeIds: [startId],
      });
    }
  }

  /* 6. End node should not have outgoing edges */
  for (const endNode of endNodes) {
    const outgoingFromEnd = edges.filter((e) => e.source === endNode.id);
    if (outgoingFromEnd.length > 0) {
      errors.push({
        type: 'warning',
        message: `End node "${endNode.data.title}" should not have outgoing connections.`,
        nodeIds: [endNode.id],
      });
    }
  }

  /* 7. Cycle detection */
  if (startNodes.length > 0) {
    const adjacency = new Map<string, string[]>();
    for (const node of nodes) {
      adjacency.set(node.id, []);
    }
    for (const edge of edges) {
      const neighbors = adjacency.get(edge.source);
      if (neighbors) {
        neighbors.push(edge.target);
      }
    }

    if (detectCycleInGraph(nodes, adjacency)) {
      errors.push({
        type: 'error',
        message: 'Cycle detected in the workflow. Workflows must be directed acyclic graphs.',
        nodeIds: [],
      });
    }
  }

  /* 8. Reachability from start */
  if (startNodes.length === 1 && edges.length > 0) {
    const reachable = getReachableNodes(startNodes[0].id, edges);
    const unreachable = nodes.filter(
      (n) => n.id !== startNodes[0].id && !reachable.has(n.id)
    );
    if (unreachable.length > 0) {
      errors.push({
        type: 'warning',
        message: `${unreachable.length} node(s) not reachable from the Start node.`,
        nodeIds: unreachable.map((n) => n.id),
      });
    }
  }

  return errors;
}

/* ── Cycle Detection via DFS ── */
function detectCycleInGraph(
  nodes: Node<NodeDataUnion>[],
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

/* ── BFS Reachability ── */
function getReachableNodes(startId: string, edges: Edge[]): Set<string> {
  const adjacency = new Map<string, string[]>();
  for (const edge of edges) {
    if (!adjacency.has(edge.source)) adjacency.set(edge.source, []);
    adjacency.get(edge.source)!.push(edge.target);
  }

  const visited = new Set<string>();
  const queue = [startId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    const neighbors = adjacency.get(current) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) queue.push(neighbor);
    }
  }

  return visited;
}

/* ── Utility: Get error node IDs for canvas highlighting ── */
export function getErrorNodeIds(errors: ValidationError[]): Set<string> {
  const ids = new Set<string>();
  for (const err of errors) {
    for (const id of err.nodeIds) {
      ids.add(id);
    }
  }
  return ids;
}
