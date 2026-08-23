import { useState, useEffect, useMemo, useRef } from 'react';
import { Search, CornerDownLeft, X } from 'lucide-react';

/**
 * ১৫টা ট্যাব পাঁচটা বিভাগে ছড়ানো — "ডেইলি কোট কোথায়?" খুঁজতে প্রতিবার
 * চোখ বুলাতে হতো। এখন Ctrl+K চেপে নাম লিখলেই সরাসরি চলে যাওয়া যায়।
 *
 * বাংলা ও ইংরেজি — দুই ভাবেই খোঁজা যায় (কেউ "quote" লিখতে পারে,
 * কেউ "কোট"), তাই প্রতিটি ট্যাবের সাথে কিছু কীওয়ার্ড রাখা হয়েছে।
 */
export default function AdminCommandPalette({ isOpen, ...rest }) {
  // বন্ধ থাকলে একেবারেই মাউন্ট করি না — ফলে পরের বার খুললে লেখা ও নির্বাচন
  // নিজে থেকেই ফাঁকা অবস্থায় শুরু হয়, রিসেট করার ইফেক্ট লাগে না
  if (!isOpen) return null;
  return <PaletteBody {...rest} />;
}

function PaletteBody({ onClose, tabs, activeTab, onSelect }) {
  const [queryText, setQueryText] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const results = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    if (!q) return tabs;
    return tabs.filter((t) =>
      t.label.toLowerCase().includes(q)
      || t.category.toLowerCase().includes(q)
      || (t.keywords || '').toLowerCase().includes(q)
    );
  }, [queryText, tabs]);

  // নির্বাচিত সারিটা দৃশ্যমান রাখি
  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [cursor, results.length]);

  const choose = (tab) => {
    if (!tab) return;
    onSelect(tab.id);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => (results.length ? (c + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => (results.length ? (c - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(results[cursor]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center p-4 pt-[12vh]">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="ট্যাব খুঁজুন"
        className="relative flex max-h-[65vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[#11151f] shadow-[0_16px_48px_-12px_rgba(0,0,0,0.8)]"
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-white/[0.06] px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-slate-500" />
          <input
            ref={inputRef}
            autoFocus
            value={queryText}
            onChange={(e) => { setQueryText(e.target.value); setCursor(0); }}
            onKeyDown={handleKeyDown}
            placeholder="কোথায় যেতে চান? (যেমন: ইউজার, quote, লাইভ)"
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-600"
          />
          <button type="button" onClick={onClose} aria-label="বন্ধ করুন"
            className="shrink-0 rounded-lg p-1 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto p-2 custom-scrollbar">
          {results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-slate-500">কিছু পাওয়া যায়নি।</p>
          ) : (
            results.map((tab, i) => (
              <button
                key={tab.id}
                type="button"
                data-active={i === cursor}
                onMouseEnter={() => setCursor(i)}
                onClick={() => choose(tab)}
                className={`flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors ${
                  i === cursor ? 'bg-white/[0.07] text-white' : 'text-slate-400 hover:bg-white/[0.03]'
                }`}
              >
                <tab.icon className={`h-4 w-4 shrink-0 ${i === cursor ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium">{tab.label}</span>
                {tab.id === activeTab && (
                  <span className="shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300">এখানে আছেন</span>
                )}
                <span className="shrink-0 text-[11px] text-slate-600">{tab.category}</span>
              </button>
            ))
          )}
        </div>

        <div className="flex shrink-0 items-center gap-4 border-t border-white/[0.06] px-4 py-2 text-[11px] text-slate-500">
          <span className="flex items-center gap-1"><CornerDownLeft className="h-3 w-3" /> যেতে</span>
          <span>↑↓ বাছাই</span>
          <span>Esc বন্ধ</span>
        </div>
      </div>
    </div>
  );
}
