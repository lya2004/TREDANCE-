import { useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import type { Connection, Node, XYPosition } from 'reactflow';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import type { NodeDataUnion, NodeType } from '@/types';

const GRID_SIZE = 16;
const NODE_GAP = 32;
const MAX_SEARCH_RING = 20;

const NODE_SIZE_BY_TYPE: Record<string, { width: number; height: number }> = {
  start: { width: 220, height: 108 },
  task: { width: 240, height: 132 },
  approval: { width: 240, height: 132 },
  automated: { width: 240, height: 120 },
  end: { width: 220, height: 120 },
};

const snapToGrid = (position: XYPosition): XYPosition => ({
  x: Math.round(Number(position.x) / GRID_SIZE) * GRID_SIZE,
  y: Math.round(Number(position.y) / GRID_SIZE) * GRID_SIZE,
});

const getNodeType = (node: Node<NodeDataUnion>): string => {
  return String(node.type || node.data?.nodeType || 'task').toLowerCase();
};

const getNodeSize = (node: Node<NodeDataUnion>) => {
  const type = getNodeType(node);
  const fallback = NODE_SIZE_BY_TYPE[type] || { width: 240, height: 132 };

  // Safely grab dimensions from either measured or fallback, ensuring it's always a valid number
  const w = Number(node.measured?.width ?? node.width ?? fallback.width) || fallback.width;
  const h = Number(node.measured?.height ?? node.height ?? fallback.height) || fallback.height;

  return {
    width: Math.max(w, fallback.width),
    height: Math.max(h, fallback.height),
  };
};

const rectsOverlap = (
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
) => {
  const aRight = a.x + a.width;
  const aBottom = a.y + a.height;
  const bRight = b.x + b.width;
  const bBottom = b.y + b.height;

  // Added a tiny epsilon (1px) margin to prevent floating point boundary collisions
  return (
    a.x < bRight - 1 &&
    aRight > b.x + 1 &&
    a.y < bBottom - 1 &&
    aBottom > b.y + 1
  );
};

function findOpenNodePosition({
  desiredPosition,
  nodeType,
  nodes,
  ignoreNodeId,
}: {
  desiredPosition: XYPosition;
  nodeType: string;
  nodes: Node<NodeDataUnion>[];
  ignoreNodeId?: string;
}): XYPosition {
  const nodeTypeSafe = String(nodeType).toLowerCase();
  const fallbackSize = NODE_SIZE_BY_TYPE[nodeTypeSafe] || { width: 240, height: 132 };
  
  const stepX = Math.ceil((fallbackSize.width + NODE_GAP) / GRID_SIZE) * GRID_SIZE;
  const stepY = Math.ceil((fallbackSize.height + NODE_GAP) / GRID_SIZE) * GRID_SIZE;
  
  const occupiedNodes = nodes.filter((node) => node.id !== ignoreNodeId);

  const getCandidateRect = (pos: XYPosition) => ({
    x: Number(pos.x) - NODE_GAP / 2,
    y: Number(pos.y) - NODE_GAP / 2,
    width: fallbackSize.width + NODE_GAP,
    height: fallbackSize.height + NODE_GAP,
  });

  const isFree = (position: XYPosition) => {
    const candidateRect = getCandidateRect(position);

    for (const node of occupiedNodes) {
      const size = getNodeSize(node);
      const nodeRect = {
        x: Number(node.position.x) - NODE_GAP / 2,
        y: Number(node.position.y) - NODE_GAP / 2,
        width: size.width + NODE_GAP,
        height: size.height + NODE_GAP,
      };

      if (rectsOverlap(candidateRect, nodeRect)) {
        return false; // Collision detected
      }
    }
    return true; // No collision
  };

  const basePosition = snapToGrid(desiredPosition);
  
  if (isFree(basePosition)) {
    return basePosition;
  }

  // Spiral search out
  for (let ring = 1; ring <= MAX_SEARCH_RING; ring++) {
    const candidates: XYPosition[] = [];

    // Top and bottom edges of the ring
    for (let dx = -ring; dx <= ring; dx++) {
      candidates.push({ x: basePosition.x + dx * stepX, y: basePosition.y - ring * stepY });
      candidates.push({ x: basePosition.x + dx * stepX, y: basePosition.y + ring * stepY });
    }
    // Left and right edges of the ring
    for (let dy = -ring + 1; dy < ring; dy++) {
      candidates.push({ x: basePosition.x - ring * stepX, y: basePosition.y + dy * stepY });
      candidates.push({ x: basePosition.x + ring * stepX, y: basePosition.y + dy * stepY });
    }

    candidates.sort((a, b) => {
      const distA = Math.pow(a.x - basePosition.x, 2) + Math.pow(a.y - basePosition.y, 2);
      const distB = Math.pow(b.x - basePosition.x, 2) + Math.pow(b.y - basePosition.y, 2);
      return distA - distB;
    });

    for (const candidate of candidates) {
      if (isFree(candidate)) {
        return candidate;
      }
    }
  }

  // Fallback
  return {
    x: basePosition.x,
    y: basePosition.y + (MAX_SEARCH_RING + 1) * stepY,
  };
}

export function useCanvasLogic() {
  const reactFlowInstance = useReactFlow();
  const addNode = useWorkflowStore((s) => s.addNode);
  const onNodesChange = useWorkflowStore((s) => s.onNodesChange);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const nodeType = event.dataTransfer.getData('application/reactflow') as NodeType;
      if (!nodeType) return;

      let position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      position.x -= 100;
      position.y -= 36;
      
      const currentNodes = useWorkflowStore.getState().nodes;
      position = findOpenNodePosition({
        desiredPosition: position,
        nodeType,
        nodes: currentNodes,
      });

      const id = `${nodeType}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

      const dataMap: Record<string, NodeDataUnion> = {
        start: { title: 'Start', nodeType: 'start' },
        task: { title: 'New Task', nodeType: 'task' },
        approval: { title: 'Approval Gate', nodeType: 'approval' },
        automated: { title: 'Automation', nodeType: 'automated' },
        end: { title: 'End', nodeType: 'end' },
      };

      addNode({
        id,
        type: nodeType,
        position,
        data: dataMap[nodeType],
      });
    },
    [reactFlowInstance, addNode]
  );

  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node<NodeDataUnion>) => {
      const nodeType = getNodeType(node);
      const currentNodes = useWorkflowStore.getState().nodes;
      const nextPosition = findOpenNodePosition({
        desiredPosition: node.position,
        nodeType,
        nodes: currentNodes,
        ignoreNodeId: node.id,
      });

      if (nextPosition.x === node.position.x && nextPosition.y === node.position.y) {
        return;
      }

      onNodesChange([
        {
          id: node.id,
          type: 'position',
          position: nextPosition,
          dragging: false,
        },
      ]);
    },
    [onNodesChange]
  );

  const isValidConnection = useCallback((connection: Connection): boolean => {
    if (connection.source === connection.target) return false;
    return true;
  }, []);

  return { onDragOver, onDrop, onNodeDragStop, isValidConnection };
}
