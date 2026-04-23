import React, { useState } from 'react';
import {
  Undo2,
  Redo2,
  Play,
  Download,
  Trash2,
  Map,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Workflow,
} from 'lucide-react';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { simulateWorkflowAPI } from '@/api/client';
import { validateWorkflow } from '@/utils/validation';
import type { ValidationError } from '@/types';

interface TopBarProps {
  onValidationResult?: (errors: ValidationError[]) => void;
}

export function TopBar({ onValidationResult }: TopBarProps) {
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const past = useWorkflowStore((s) => s.past);
  const future = useWorkflowStore((s) => s.future);
  const undo = useWorkflowStore((s) => s.undo);
  const redo = useWorkflowStore((s) => s.redo);
  const clearCanvas = useWorkflowStore((s) => s.clearCanvas);
  const isSimulating = useWorkflowStore((s) => s.isSimulating);
  const setIsSimulating = useWorkflowStore((s) => s.setIsSimulating);
  const setSimulationResults = useWorkflowStore((s) => s.setSimulationResults);
  const toggleMinimap = useWorkflowStore((s) => s.toggleMinimap);
  const isMinimapVisible = useWorkflowStore((s) => s.isMinimapVisible);
  const toggleSandbox = useWorkflowStore((s) => s.toggleSandbox);
  const serializeWorkflow = useWorkflowStore((s) => s.serializeWorkflow);

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [validated, setValidated] = useState(false);

  const errorCount = validationErrors.filter((e) => e.type === 'error').length;
  const warningCount = validationErrors.filter((e) => e.type === 'warning').length;

  const handleValidate = () => {
    const errors = validateWorkflow(nodes, edges);
    setValidationErrors(errors);
    setValidated(true);
    onValidationResult?.(errors);
    return errors;
  };

  const handleSimulate = async () => {
    const errors = handleValidate();
    const hasErrors = errors.some((e) => e.type === 'error');
    if (hasErrors) {
      toggleSandbox();
      return;
    }
    setIsSimulating(true);
    toggleSandbox();
    try {
      const serializedNodes = nodes.map((n) => ({
        id: n.id,
        type: n.type ?? 'task',
        position: n.position,
        data: n.data,
      }));
      const result = await simulateWorkflowAPI({ nodes: serializedNodes, edges });
      setSimulationResults(result);
    } catch {
      setSimulationResults({
        success: false,
        log: [],
        errors: ['Network error: failed to reach simulation API.'],
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const handleExport = () => {
    const json = serializeWorkflow();
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (nodes.length === 0) return;
    clearCanvas();
    setValidationErrors([]);
    setValidated(false);
    setSimulationResults(null);
  };

  return (
    <header
      className="relative flex items-center justify-between h-[52px] px-4 flex-shrink-0 z-10"
      style={{
        background: 'rgba(12, 12, 17, 0.95)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Subtle gradient glow line */}
      <div className="topbar-glow-line" />

      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
            boxShadow: '0 2px 12px rgba(0, 122, 255, 0.4)',
          }}
        >
          <Workflow size={14} className="text-white" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] font-bold text-white tracking-tight">Strich</span>
          <span
            className="text-[10px] font-medium tracking-widest uppercase"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            Workflow Engine
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,0.08)' }} />

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5">
          {[
            { action: undo, disabled: past.length === 0, icon: <Undo2 size={14} />, label: 'Undo (⌘Z)' },
            { action: redo, disabled: future.length === 0, icon: <Redo2 size={14} />, label: 'Redo (⌘⇧Z)' },
          ].map(({ action, disabled, icon, label }) => (
            <button
              key={label}
              onClick={action}
              disabled={disabled}
              title={label}
              aria-label={label}
              className="flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150"
              style={{
                color: disabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)',
                cursor: disabled ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => !disabled && ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Center: validation status */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
        {validated && errorCount === 0 && warningCount === 0 && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
            style={{ background: 'rgba(52,199,89,0.12)', color: '#34C759', border: '1px solid rgba(52,199,89,0.2)' }}
          >
            <CheckCircle size={11} />
            Valid workflow
          </div>
        )}
        {errorCount > 0 && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
            style={{ background: 'rgba(255,59,48,0.12)', color: '#FF3B30', border: '1px solid rgba(255,59,48,0.2)' }}
          >
            <AlertTriangle size={11} />
            {errorCount} error{errorCount > 1 ? 's' : ''}
          </div>
        )}
        {errorCount === 0 && warningCount > 0 && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
            style={{ background: 'rgba(255,159,10,0.12)', color: '#FF9F0A', border: '1px solid rgba(255,159,10,0.2)' }}
          >
            <AlertTriangle size={11} />
            {warningCount} warning{warningCount > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5">
        {/* Map toggle */}
        <TopbarBtn
          onClick={toggleMinimap}
          active={isMinimapVisible}
          title="Toggle minimap"
          aria-label="Toggle minimap"
        >
          <Map size={13} />
          <span>Map</span>
        </TopbarBtn>

        <TopbarBtn onClick={handleValidate} title="Validate">
          <CheckCircle size={13} />
          <span>Validate</span>
        </TopbarBtn>

        <TopbarBtn
          onClick={handleExport}
          disabled={nodes.length === 0}
          title="Export JSON"
        >
          <Download size={13} />
          <span>Export</span>
        </TopbarBtn>

        <TopbarBtn
          onClick={handleClear}
          disabled={nodes.length === 0}
          danger
          title="Clear canvas"
        >
          <Trash2 size={13} />
        </TopbarBtn>

        {/* Divider */}
        <div className="w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,0.08)' }} />

        {/* Simulate */}
        <button
          onClick={handleSimulate}
          disabled={isSimulating || nodes.length === 0}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold text-white
            transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
            boxShadow: '0 2px 12px rgba(0, 122, 255, 0.35)',
          }}
          onMouseEnter={(e) => {
            if (!isSimulating && nodes.length > 0)
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0, 122, 255, 0.55)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0, 122, 255, 0.35)';
          }}
          aria-label="Run simulation"
        >
          {isSimulating
            ? <Loader2 size={13} className="animate-spin" />
            : <Play size={13} className="fill-white" />}
          {isSimulating ? 'Running…' : 'Simulate'}
        </button>
      </div>
    </header>
  );
}

/* ── Reusable topbar button ── */
function TopbarBtn({
  children,
  active,
  danger,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean; danger?: boolean }) {
  return (
    <button
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium
        transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
      style={{
        color: danger
          ? 'rgba(255,59,48,0.7)'
          : active
          ? '#007AFF'
          : 'rgba(255,255,255,0.5)',
        background: active ? 'rgba(0,122,255,0.12)' : 'transparent',
      }}
      onMouseEnter={(e) => {
        if (!props.disabled)
          (e.currentTarget as HTMLElement).style.background = danger
            ? 'rgba(255,59,48,0.1)'
            : 'rgba(255,255,255,0.07)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = active ? 'rgba(0,122,255,0.12)' : 'transparent';
      }}
      {...props}
    >
      {children}
    </button>
  );
}
