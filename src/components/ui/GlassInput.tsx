import React from 'react';

const inputBase = `
  w-full px-3 py-2 rounded-lg text-[12px]
  transition-all duration-200
  focus:outline-none
`;

const inputStyle = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: 'rgba(255,255,255,0.85)',
};

const inputFocusStyle = {
  border: '1px solid rgba(0,122,255,0.5)',
  background: 'rgba(0,122,255,0.06)',
  boxShadow: '0 0 0 3px rgba(0,122,255,0.12)',
};

const labelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.3)',
};

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
}

export function GlassInput({ label, helperText, className = '', style, ...props }: GlassInputProps) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div className="flex flex-col gap-1">
      {label && <label style={labelStyle}>{label}</label>}
      <input
        className={`${inputBase} ${className}`}
        style={{ ...inputStyle, ...(focused ? inputFocusStyle : {}), ...style }}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
        {...props}
      />
      {helperText && (
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>{helperText}</span>
      )}
    </div>
  );
}

interface GlassSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function GlassSelect({ label, options, className = '', style, ...props }: GlassSelectProps) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div className="flex flex-col gap-1">
      {label && <label style={labelStyle}>{label}</label>}
      <select
        className={`${inputBase} appearance-none cursor-pointer ${className}`}
        style={{ ...inputStyle, ...(focused ? inputFocusStyle : {}), colorScheme: 'dark', ...style }}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
        {...props}
      >
        <option value="">Select…</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

interface GlassTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function GlassTextarea({ label, className = '', style, ...props }: GlassTextareaProps) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div className="flex flex-col gap-1">
      {label && <label style={labelStyle}>{label}</label>}
      <textarea
        className={`${inputBase} resize-none ${className}`}
        style={{ ...inputStyle, ...(focused ? inputFocusStyle : {}), ...style }}
        rows={3}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
        {...props}
      />
    </div>
  );
}

interface GlassToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function GlassToggle({ label, checked, onChange }: GlassToggleProps) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span style={labelStyle}>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative w-9 h-5 rounded-full transition-all duration-200"
        style={{
          background: checked
            ? 'linear-gradient(135deg, #005fd4 0%, #007AFF 100%)'
            : 'rgba(255,255,255,0.1)',
          boxShadow: checked ? '0 0 8px rgba(0,122,255,0.4)' : 'none',
        }}
      >
        <span
          className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200"
          style={{ left: checked ? '18px' : '2px' }}
        />
      </button>
    </label>
  );
}
