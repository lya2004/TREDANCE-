import React, { useEffect, useState } from 'react';
import { X, Trash2, Plus } from 'lucide-react';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { useDynamicForm } from '@/hooks/useDynamicForm';
import { fetchAutomations } from '@/api/client';
import type { AutomationAction } from '@/types';
import {
  GlassInput,
  GlassSelect,
  GlassTextarea,
  GlassToggle,
} from '@/components/ui/GlassInput';
import { GlassButton } from '@/components/ui/GlassButton';

export function PropertiesPanel() {
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const setSelectedNode = useWorkflowStore((s) => s.setSelectedNode);
  const removeNode = useWorkflowStore((s) => s.removeNode);
  const {
    nodeData,
    nodeType,
    updateField,
    updateCustomField,
    removeCustomField,
    updateParameter,
  } = useDynamicForm();

  const [automations, setAutomations] = useState<AutomationAction[]>([]);
  const [newCustomKey, setNewCustomKey] = useState('');
  const [newCustomVal, setNewCustomVal] = useState('');
  const [newParamKey, setNewParamKey] = useState('');
  const [newParamVal, setNewParamVal] = useState('');

  useEffect(() => {
    fetchAutomations()
      .then(setAutomations)
      .catch(() => setAutomations([]));
  }, []);

  if (!selectedNodeId || !nodeData) {
    return null;
  }

  const handleDelete = () => {
    removeNode(selectedNodeId);
    setSelectedNode(null);
  };

  const automationOptions = automations.map((a) => ({ value: a.id, label: a.label }));

  const selectedAutomation = nodeType === 'automated'
    ? automations.find((a) => a.id === (nodeData as { actionId?: string }).actionId)
    : null;

  return (
    <aside
      className="flex flex-col w-[272px] flex-shrink-0 h-full overflow-hidden"
      style={{
        background: 'rgba(12, 12, 17, 0.97)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        borderLeft: '1px solid rgba(255,255,255,0.05)',
        animation: 'slideInFromRight 0.35s cubic-bezier(0.34,1.2,0.64,1) both',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 pt-4 pb-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div>
          <h2
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            Properties
          </h2>
          <p className="text-[13px] font-semibold mt-0.5 capitalize" style={{ color: 'rgba(255,255,255,0.85)' }}>
            {nodeType} Node
          </p>
        </div>
        <button
          onClick={() => setSelectedNode(null)}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150"
          style={{ color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)';
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.09)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)';
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
          }}
          aria-label="Close panel"
        >
          <X size={13} />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* ── Common: Title ── */}
        <GlassInput
          label="Title"
          value={nodeData.title || ''}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="Node label…"
        />

        {/* ── START ── */}
        {nodeType === 'start' && (() => {
          const d = nodeData as import('@/types').StartNodeData;
          const meta = d.metadata || {};
          return (
            <div className="space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">Metadata</p>
              {Object.entries(meta).map(([k, v]) => (
                <div key={k} className="flex gap-2 items-center">
                  <GlassInput value={k} readOnly className="flex-1" />
                  <GlassInput
                    value={v}
                    onChange={(e) => (updateField as any)('metadata', { ...meta, [k]: e.target.value })}
                    className="flex-1"
                  />
                  <button
                    onClick={() => {
                      const updated = { ...meta };
                      delete updated[k];
                      (updateField as any)('metadata', updated);
                    }}
                    className="text-accent-red hover:opacity-70 transition-opacity"
                    aria-label={`Remove ${k}`}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <GlassInput
                  placeholder="Key"
                  value={newCustomKey}
                  onChange={(e) => setNewCustomKey(e.target.value)}
                  className="flex-1"
                />
                <GlassInput
                  placeholder="Value"
                  value={newCustomVal}
                  onChange={(e) => setNewCustomVal(e.target.value)}
                  className="flex-1"
                />
                <GlassButton
                  size="sm"
                  variant="primary"
                  icon={<Plus size={12} />}
                  onClick={() => {
                    if (!newCustomKey.trim()) return;
                    (updateField as any)('metadata', { ...meta, [newCustomKey.trim()]: newCustomVal });
                    setNewCustomKey('');
                    setNewCustomVal('');
                  }}
                />
              </div>
            </div>
          );
        })()}

        {/* ── TASK ── */}
        {nodeType === 'task' && (() => {
          const d = nodeData as import('@/types').TaskNodeData;
          return (
            <div className="space-y-3">
              <GlassTextarea
                label="Description"
                value={d.description || ''}
                onChange={(e) => (updateField as any)('description', e.target.value)}
                placeholder="What needs to be done…"
              />
              <GlassInput
                label="Assignee"
                value={d.assignee || ''}
                onChange={(e) => (updateField as any)('assignee', e.target.value)}
                placeholder="e.g. Jane Smith"
              />
              <GlassInput
                label="Due Date"
                type="date"
                value={d.dueDate || ''}
                onChange={(e) => (updateField as any)('dueDate', e.target.value)}
              />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Custom Fields</p>
                {Object.entries(d.customFields || {}).map(([k, v]) => (
                  <div key={k} className="flex gap-2 items-center mb-2">
                    <GlassInput value={k} readOnly className="flex-1 text-xs" />
                    <GlassInput
                      value={v}
                      onChange={(e) => updateCustomField(k, e.target.value)}
                      className="flex-1 text-xs"
                    />
                    <button
                      onClick={() => removeCustomField(k)}
                      className="text-accent-red hover:opacity-70 transition-opacity"
                      aria-label={`Remove ${k}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2 mt-1">
                  <GlassInput
                    placeholder="Key"
                    value={newCustomKey}
                    onChange={(e) => setNewCustomKey(e.target.value)}
                    className="flex-1"
                  />
                  <GlassInput
                    placeholder="Value"
                    value={newCustomVal}
                    onChange={(e) => setNewCustomVal(e.target.value)}
                    className="flex-1"
                  />
                  <GlassButton
                    size="sm"
                    variant="primary"
                    icon={<Plus size={12} />}
                    onClick={() => {
                      if (!newCustomKey.trim()) return;
                      updateCustomField(newCustomKey.trim(), newCustomVal);
                      setNewCustomKey('');
                      setNewCustomVal('');
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── APPROVAL ── */}
        {nodeType === 'approval' && (() => {
          const d = nodeData as import('@/types').ApprovalNodeData;
          return (
            <div className="space-y-3">
              <GlassSelect
                label="Approver Role"
                value={d.approverRole || ''}
                onChange={(e) => (updateField as any)('approverRole', e.target.value)}
                options={[
                  { value: 'Manager', label: 'Manager' },
                  { value: 'HRBP', label: 'HRBP' },
                  { value: 'Director', label: 'Director' },
                ]}
              />
              <GlassInput
                label="Auto-Approve Threshold"
                type="number"
                min={0}
                value={d.autoApproveThreshold ?? ''}
                onChange={(e) =>
                  (updateField as any)('autoApproveThreshold', e.target.value ? Number(e.target.value) : undefined)
                }
                placeholder="Leave empty to disable"
              />
            </div>
          );
        })()}

        {/* ── AUTOMATED ── */}
        {nodeType === 'automated' && (() => {
          const d = nodeData as import('@/types').AutomatedNodeData;
          const paramKeys = selectedAutomation?.params || [];
          return (
            <div className="space-y-3">
              <GlassSelect
                label="Action"
                value={d.actionId || ''}
                onChange={(e) => (updateField as any)('actionId', e.target.value)}
                options={automationOptions}
              />
              {paramKeys.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Parameters</p>
                  {paramKeys.map((key) => (
                    <div key={key} className="mb-2">
                      <GlassInput
                        label={key}
                        value={(d.parameters || {})[key] || ''}
                        onChange={(e) => updateParameter(key, e.target.value)}
                        placeholder={`Enter ${key}…`}
                      />
                    </div>
                  ))}
                </div>
              )}
              {/* Extra custom params */}
              {Object.entries(d.parameters || {})
                .filter(([k]) => !paramKeys.includes(k))
                .map(([k, v]) => (
                  <div key={k} className="flex gap-2 items-center">
                    <GlassInput value={k} readOnly className="flex-1 text-xs" />
                    <GlassInput
                      value={v}
                      onChange={(e) => updateParameter(k, e.target.value)}
                      className="flex-1 text-xs"
                    />
                    <button
                      onClick={() => {
                        const current = { ...(d.parameters || {}) };
                        delete current[k];
                        (updateField as any)('parameters', current);
                      }}
                      className="text-accent-red hover:opacity-70 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              <div className="flex gap-2">
                <GlassInput
                  placeholder="Param key"
                  value={newParamKey}
                  onChange={(e) => setNewParamKey(e.target.value)}
                  className="flex-1"
                />
                <GlassInput
                  placeholder="Value"
                  value={newParamVal}
                  onChange={(e) => setNewParamVal(e.target.value)}
                  className="flex-1"
                />
                <GlassButton
                  size="sm"
                  variant="primary"
                  icon={<Plus size={12} />}
                  onClick={() => {
                    if (!newParamKey.trim()) return;
                    updateParameter(newParamKey.trim(), newParamVal);
                    setNewParamKey('');
                    setNewParamVal('');
                  }}
                />
              </div>
            </div>
          );
        })()}

        {/* ── END ── */}
        {nodeType === 'end' && (() => {
          const d = nodeData as import('@/types').EndNodeData;
          return (
            <div className="space-y-3">
              <GlassInput
                label="End Message"
                value={d.endMessage || ''}
                onChange={(e) => (updateField as any)('endMessage', e.target.value)}
                placeholder="e.g. Onboarding complete!"
              />
              <GlassToggle
                label="Show Summary"
                checked={d.isSummary ?? false}
                onChange={(val) => (updateField as any)('isSummary', val)}
              />
            </div>
          );
        })()}
      </div>

      {/* Delete */}
      <div
        className="px-4 py-4 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <button
          onClick={handleDelete}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-[12px] font-semibold
            transition-all duration-150"
          style={{ color: 'rgba(255,59,48,0.7)', background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.15)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,59,48,0.15)';
            (e.currentTarget as HTMLElement).style.color = '#FF3B30';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,59,48,0.08)';
            (e.currentTarget as HTMLElement).style.color = 'rgba(255,59,48,0.7)';
          }}
        >
          <Trash2 size={13} />
          Delete Node
        </button>
      </div>
    </aside>
  );
}
