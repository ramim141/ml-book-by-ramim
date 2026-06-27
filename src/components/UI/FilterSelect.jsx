import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * FilterSelect - in-page dropdown that stays inside its parent width on mobile.
 *
 * Props:
 *  - value: current selected value
 *  - onChange: (value) => void
 *  - options: array of { value, label }
 *  - placeholder: optional placeholder shown when value is empty
 *  - className: extra classes for the trigger button
 */
export default function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);
  const display = selected ? selected.label : (placeholder ?? '');

  return (
    <div ref={wrapRef} className="relative w-full min-w-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-full appearance-none bg-slate-900/50 border border-slate-700/50 text-slate-300 text-sm rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all hover:bg-slate-800 cursor-pointer text-left truncate ${className}`}
      >
        <span className="block truncate">{display}</span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
          <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 left-0 right-0 max-h-60 overflow-y-auto rounded-xl border border-slate-700/60 bg-slate-900 shadow-2xl shadow-slate-950/40 py-1 animate-in fade-in zoom-in-95 duration-150"
        >
          {options.map((opt) => {
            const isActive = opt.value === value;
            return (
              <li key={opt.value} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors break-words ${
                    isActive
                      ? 'bg-indigo-500/15 text-indigo-300'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <span className={`shrink-0 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span className="flex-1 min-w-0 break-words whitespace-normal leading-snug">{opt.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
