'use client';
import { useState, useEffect, useRef } from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = 'Search policies, ministries...' }: Props) {
  const [local, setLocal] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external value changes
  useEffect(() => { setLocal(value); }, [value]);

  const handleChange = (v: string) => {
    setLocal(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(v), 350);
  };

  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>🔍</span>
      <input
        className="form-input"
        style={{ paddingLeft: 42, paddingRight: local ? 40 : 16, fontSize: 15, height: 48 }}
        placeholder={placeholder}
        value={local}
        onChange={e => handleChange(e.target.value)}
      />
      {local && (
        <button
          onClick={() => { setLocal(''); onChange(''); }}
          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, lineHeight: 1, cursor: 'pointer', padding: 4 }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
