import { http, HttpResponse } from 'msw';
import { simulateWorkflow } from './engine';
import type { AutomationAction } from '@/types';

/* ── Static automation actions catalog ── */
const automationActions: AutomationAction[] = [
  {
    id: 'send_email',
    label: 'Send Email',
    params: ['to', 'subject'],
  },
  {
    id: 'generate_doc',
    label: 'Generate Document',
    params: ['template', 'recipient'],
  },
  {
    id: 'create_ticket',
    label: 'Create Support Ticket',
    params: ['priority', 'category'],
  },
  {
    id: 'update_hris',
    label: 'Update HRIS Record',
    params: ['field', 'value'],
  },
  {
    id: 'send_slack',
    label: 'Send Slack Notification',
    params: ['channel', 'message'],
  },
];

/* ── MSW Handlers ── */
export const handlers = [
  /* GET /api/automations — returns available automation actions */
  http.get('/api/automations', () => {
    return HttpResponse.json(automationActions);
  }),

  /* POST /api/simulate — dynamically traverses the graph */
  http.post('/api/simulate', async ({ request }) => {
    const body = await request.json();

    const graph = body as {
      nodes: Array<{
        id: string;
        type: string;
        data: Record<string, unknown>;
      }>;
      edges: Array<{
        source: string;
        target: string;
      }>;
    };

    /* Validate request shape */
    if (!graph.nodes || !graph.edges) {
      return HttpResponse.json(
        {
          success: false,
          log: [],
          errors: ['Invalid request: missing nodes or edges array.'],
        },
        { status: 400 }
      );
    }

    /* Run the dynamic BFS simulation engine */
    const result = simulateWorkflow({
      nodes: graph.nodes.map((n) => ({
        id: n.id,
        type: n.type as 'start' | 'task' | 'approval' | 'automated' | 'end',
        data: n.data as unknown as import('@/types').NodeDataUnion,
      })),
      edges: graph.edges,
    });

    /* Simulate a realistic network delay */
    await new Promise((resolve) => setTimeout(resolve, 800));

    return HttpResponse.json(result);
  }),
];
