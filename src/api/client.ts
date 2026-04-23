import type { SimulationResult, WorkflowJSON, AutomationAction } from '@/types';

const BASE_URL = '/api';

export async function fetchAutomations(): Promise<AutomationAction[]> {
  const response = await fetch(`${BASE_URL}/automations`);
  if (!response.ok) throw new Error(`Failed to fetch automations: ${response.statusText}`);
  return response.json();
}

export async function simulateWorkflowAPI(
  graph: Pick<WorkflowJSON, 'nodes' | 'edges'>
): Promise<SimulationResult> {
  const payload = {
    nodes: graph.nodes.map((n) => ({
      id: n.id,
      type: n.data.nodeType,
      data: n.data,
    })),
    edges: graph.edges.map((e) => ({
      source: e.source,
      target: e.target,
    })),
  };

  const response = await fetch(`${BASE_URL}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error(`Simulation failed: ${response.statusText}`);
  return response.json();
}
