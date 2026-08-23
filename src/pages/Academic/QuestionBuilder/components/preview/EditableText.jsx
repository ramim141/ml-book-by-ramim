import React, { useEffect, useRef, useState } from 'react';
import { Undo2 } from 'lucide-react';

/**
 * প্রিভিউয়ে প্রশ্ন সম্পাদনা।
 *
 * পুরো কাগজে `contentEditable` বসানোই সহজ ছিল, কিন্তু লেখা মার্কডাউন থেকে
 * রেন্ডার হয় — সম্পাদিত HTML আর মার্কডাউনে ফেরে না, তাই রিফ্রেশ বা PDF
 * বানানোর সময় পরিবর্তন হারিয়ে যেত। এখানে বদলে মূল মার্কডাউনটাই টেক্সট-এরিয়ায়
 * খোলা হয়, ফলে সম্পাদনা সংরক্ষণযোগ্য এবং LaTeX/মার্কডাউন অটুট থাকে।
 */
const EditableText = ({ value, original, editing, onSave, className = '', children }) => {
  const [draft, setDraft] = useState(null);
  const areaRef = useRef(null);

  useEffect(() => {
    if (draft !== null && areaRef.current) {
      areaRef.current.focus();
      areaRef.current.style.height = 'auto';
      areaRef.current.style.height = `${areaRef.current.scrollHeight}px`;
    }
  }, [draft]);

  const commit = () => {
    if (draft !== null && draft !== value) onSave(draft);
    setDraft(null);
  };

  if (!editing) return children;

  if (draft !== null) {
    return (
      <textarea
        ref={areaRef}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          e.target.style.height = 'auto';
          e.target.style.height = `${e.target.scrollHeight}px`;
        }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Escape') { e.preventDefault(); setDraft(null); }
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); commit(); }
        }}
        className="w-full resize-none rounded border-2 border-indigo-400 bg-indigo-50/40 p-1.5 font-mono text-[12px] leading-relaxed text-black outline-none"
      />
    );
  }

  const isEdited = original !== undefined && value !== original;

  return (
    <div className={`qb-editable group/edit relative cursor-text rounded ${className}`} onClick={() => setDraft(value ?? '')}>
      {children}
      {isEdited && (
        <button
          type="button"
          title="মূল লেখায় ফিরুন"
          onClick={(e) => { e.stopPropagation(); onSave(null); }}
          className="absolute -right-1 -top-1 hidden rounded bg-amber-500 p-0.5 text-white shadow group-hover/edit:block"
        >
          <Undo2 className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

export default React.memo(EditableText);
