import { useCallback, useEffect, useState } from 'react';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import type { NodeDataUnion } from '@/types';

/**
 * Hook providing controlled form state synced to the Zustand store.
 * Returns the selected node's data and a typed updater function.
 */
export function useDynamicForm() {
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const nodes = useWorkflowStore((s) => s.nodes);
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const nodeData = selectedNode?.data as NodeDataUnion | undefined;

  const updateField = useCallback(
    <K extends keyof NodeDataUnion>(field: K, value: NodeDataUnion[K]) => {
      if (!selectedNodeId) return;
      updateNodeData(selectedNodeId, { [field]: value } as Partial<NodeDataUnion>);
    },
    [selectedNodeId, updateNodeData]
  );

  const updateCustomField = useCallback(
    (key: string, value: string) => {
      if (!selectedNodeId || !nodeData) return;
      if (nodeData.nodeType === 'task') {
        const existing = nodeData.customFields || {};
        updateNodeData(selectedNodeId, {
          customFields: { ...existing, [key]: value },
        } as Partial<NodeDataUnion>);
      }
    },
    [selectedNodeId, nodeData, updateNodeData]
  );

  const removeCustomField = useCallback(
    (key: string) => {
      if (!selectedNodeId || !nodeData) return;
      if (nodeData.nodeType === 'task') {
        const existing = { ...(nodeData.customFields || {}) };
        delete existing[key];
        updateNodeData(selectedNodeId, {
          customFields: existing,
        } as Partial<NodeDataUnion>);
      }
    },
    [selectedNodeId, nodeData, updateNodeData]
  );

  const updateParameter = useCallback(
    (key: string, value: string) => {
      if (!selectedNodeId || !nodeData) return;
      if (nodeData.nodeType === 'automated') {
        const existing = nodeData.parameters || {};
        updateNodeData(selectedNodeId, {
          parameters: { ...existing, [key]: value },
        } as Partial<NodeDataUnion>);
      }
    },
    [selectedNodeId, nodeData, updateNodeData]
  );

  return {
    selectedNodeId,
    nodeData,
    nodeType: nodeData?.nodeType,
    updateField,
    updateCustomField,
    removeCustomField,
    updateParameter,
  };
}
