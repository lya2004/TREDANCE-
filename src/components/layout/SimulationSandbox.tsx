import React from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { Timeline } from '@/components/ui/Timeline';
import { validateWorkflow } from '@/utils/validation';

export function SimulationSandbox() {
  const isSandboxOpen = useWorkflowStore((s) => s.isSandboxOpen);
  const toggleSandbox = useWorkflowStore((s) => s.toggleSandbox);
  const simulationResults = useWorkflowStore((s) => s.simulationResults);
  const isSimulating = useWorkflowStore((s) => s.isSimulating);
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const setSimulationResults = useWorkflowStore((s) => s.setSimulationResults);

  const validationErrors = validateWorkflow(nodes, edges);
  const hasErrors = validationErrors.some((e) => e.type === 'error');

  const handleClearResults = () => {
    setSimulationResults(null);
  };

  if (!isSandboxOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30"
        style={{
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.3s ease both',
        }}
        onClick={toggleSandbox}
        aria-hidden
      />

      {/* Slide-over panel */}
      <div
        className="fixed top-0 right-0 h-full w-[400px] z-40 flex flex-col"
        style={{
          background: 'rgba(12, 12, 17, 0.97)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          borderLeft: '1px solid rgba(255,255,255,0.05)',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.5)',
          animation: 'slideInFromRight 0.4s cubic-bezier(0.34,1.2,0.64,1) both',
        }}
        role="dialog"
        aria-modal
        aria-label="Simulation Sandbox"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 pt-5 pb-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div>
            <h2 className="text-[14px] font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>
              Simulation Sandbox
            </h2>
            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Execution trace for your workflow
            </p>
          </div>
          <button
            onClick={toggleSandbox}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150"
            style={{ color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)';
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.09)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)';
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
            }}
            aria-label="Close sandbox"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Loading state */}
          {isSimulating && (
            <div className="flex flex-col items-center justify-center py-16 gap-4" style={{ animation: 'fadeInScale 0.3s ease both' }}>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(0,122,255,0.1)', border: '1px solid rgba(0,122,255,0.2)' }}
              >
                <Loader2 size={24} className="animate-spin" style={{ color: '#007AFF' }} />
              </div>
              <p className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Running simulation…</p>
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Traversing workflow graph</p>
            </div>
          )}

          {/* Validation errors preventing simulation */}
          {!isSimulating && hasErrors && !simulationResults && (
            <div className="space-y-3" style={{ animation: 'fadeInScale 0.3s ease both' }}>
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.2)' }}
              >
                <XCircle size={15} style={{ color: '#FF3B30' }} className="flex-shrink-0" />
                <p className="text-[12px] font-semibold" style={{ color: '#FF3B30' }}>
                  Fix {validationErrors.filter((e) => e.type === 'error').length} error
                  {validationErrors.filter((e) => e.type === 'error').length > 1 ? 's' : ''} before simulating
                </p>
              </div>
              {validationErrors.map((err, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl"
                  style={{
                    background: err.type === 'error' ? 'rgba(255,59,48,0.05)' : 'rgba(255,159,10,0.05)',
                    border: `1px solid ${err.type === 'error' ? 'rgba(255,59,48,0.15)' : 'rgba(255,159,10,0.15)'}`,
                  }}
                >
                  {err.type === 'error' ? (
                    <XCircle size={13} style={{ color: '#FF3B30' }} className="flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle size={13} style={{ color: '#FF9F0A' }} className="flex-shrink-0 mt-0.5" />
                  )}
                  <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.7)' }}>{err.message}</p>
                </div>
              ))}
            </div>
          )}

          {/* Simulation results */}
          {!isSimulating && simulationResults && (
            <div className="space-y-5" style={{ animation: 'fadeInScale 0.4s ease both' }}>
              {/* Status banner */}
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{
                  background: simulationResults.success ? 'rgba(52,199,89,0.1)' : 'rgba(255,59,48,0.1)',
                  border: `1px solid ${simulationResults.success ? 'rgba(52,199,89,0.2)' : 'rgba(255,59,48,0.2)'}`,
                }}
              >
                {simulationResults.success ? (
                  <CheckCircle size={18} style={{ color: '#34C759' }} />
                ) : (
                  <XCircle size={18} style={{ color: '#FF3B30' }} />
                )}
                <div>
                  <p className="text-[13px] font-semibold" style={{ color: simulationResults.success ? '#34C759' : '#FF3B30' }}>
                    {simulationResults.success ? 'Simulation successful' : 'Simulation completed with errors'}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {simulationResults.log.length} step{simulationResults.log.length !== 1 ? 's' : ''} executed
                  </p>
                </div>
              </div>

              {/* Simulation errors */}
              {simulationResults.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Errors
                  </p>
                  {simulationResults.errors.map((err, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 px-3 py-2 rounded-lg"
                      style={{ background: 'rgba(255,59,48,0.05)', border: '1px solid rgba(255,59,48,0.15)' }}
                    >
                      <AlertTriangle size={12} style={{ color: '#FF3B30' }} className="flex-shrink-0 mt-0.5" />
                      <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.7)' }}>{err}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Timeline */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Execution Trace
                </p>
                <Timeline steps={simulationResults.log} />
              </div>
            </div>
          )}

          {/* Empty state: no errors, no results yet */}
          {!isSimulating && !simulationResults && !hasErrors && (
            <div className="flex flex-col items-center justify-center py-16 text-center" style={{ animation: 'fadeInScale 0.3s ease both' }}>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <CheckCircle size={22} style={{ color: 'rgba(255,255,255,0.2)' }} />
              </div>
              <p className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>No simulation yet</p>
              <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Press Simulate in the toolbar to run</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {simulationResults && !isSimulating && (
          <div
            className="px-5 py-4 flex-shrink-0"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            <button
              onClick={handleClearResults}
              className="w-full py-2 rounded-lg text-[12px] font-semibold transition-all duration-150"
              style={{ color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
              }}
            >
              Clear Results
            </button>
          </div>
        )}
      </div>
    </>
  );
}
