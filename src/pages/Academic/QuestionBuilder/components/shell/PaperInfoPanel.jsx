import React from 'react';
import { X, FileCog, AlertTriangle, Wand2, ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { enToBn } from '../../helpers.jsx';
import { TYPE_LABELS, DEFAULT_MARKS } from '../../marks.js';

const Field = ({ label, hint, children }) => (
  <div className="space-y-1.5">
    <label className="block pl-0.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</label>
    {children}
    {hint && <p className="pl-0.5 text-[11px] font-medium text-slate-600">{hint}</p>}
  </div>
);

const inputClass =
  'w-full rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-sm text-white transition placeholder:text-slate-600 hover:border-slate-700 focus:border-indigo-500/50 focus:outline-none';

/**
 * কাগজের তথ্য + নম্বর বণ্টন। আগে এটা ছিল ধাপ ১ — প্রশ্ন দেখার আগে পেরোতে হতো।
 * এখন যেকোনো সময় খোলা যায়, আর নম্বরের হিসাব কার্টের সাথেই মিলিয়ে দেখায়।
 */
const PaperInfoPanel = React.memo(({
  isOpen, onClose,
  headerInfo, onHeaderChange,
  marksConfig, onMarksChange,
  summary,
  onLogoUpload, onLogoRemove, logoUploading,
}) => {
  const declared = Number(String(headerInfo.totalMarks || '').replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d)));
  const mismatch = Number.isFinite(declared) && declared > 0 && declared !== summary.totalMarks;

  return (
    <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}>
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      <aside className={`absolute bottom-0 right-0 flex max-h-[92vh] w-full max-w-[480px] flex-col rounded-t-3xl border border-slate-800 bg-slate-950 shadow-2xl transition-transform duration-300 sm:bottom-4 sm:right-4 sm:top-4 sm:max-h-none sm:rounded-2xl ${isOpen ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:translate-x-full sm:translate-y-0'}`}>
        <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-slate-700 sm:hidden" />

        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-800 px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="rounded-lg bg-indigo-500/15 p-2 text-indigo-300">
              <FileCog className="h-4 w-4" />
            </span>
            <h2 className="text-sm font-extrabold text-slate-100">কাগজের তথ্য</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="বন্ধ করুন" className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 custom-scrollbar">
          <Field label="প্রতিষ্ঠানের লোগো" hint="সর্বোচ্চ ২MB — প্রশ্নপত্র ও উত্তরপত্রের হেডারে দেখাবে।">
            <div className="flex items-center gap-3">
              {headerInfo.logoUrl ? (
                <img src={headerInfo.logoUrl} alt="" className="h-12 w-12 shrink-0 rounded-lg border border-slate-800 object-contain bg-white/5" />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-700 text-slate-600">
                  <ImagePlus className="h-5 w-5" />
                </div>
              )}
              <label className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/50 py-2.5 text-xs font-bold text-slate-300 transition hover:border-indigo-500/50 hover:text-white ${logoUploading ? 'pointer-events-none opacity-60' : ''}`}>
                {logoUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
                {logoUploading ? 'আপলোড হচ্ছে...' : headerInfo.logoUrl ? 'বদলান' : 'আপলোড করুন'}
                <input
                  type="file"
                  accept="image/*"
                  disabled={logoUploading}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onLogoUpload?.(file);
                    e.target.value = '';
                  }}
                />
              </label>
              {headerInfo.logoUrl && !logoUploading && (
                <button
                  type="button"
                  onClick={onLogoRemove}
                  aria-label="লোগো মুছে ফেলুন"
                  className="shrink-0 rounded-xl border border-slate-800 p-2.5 text-slate-500 transition hover:border-rose-500/40 hover:text-rose-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </Field>

          <Field label="শিক্ষা প্রতিষ্ঠানের নাম">
            <input type="text" name="schoolName" value={headerInfo.schoolName} onChange={onHeaderChange}
              placeholder="যেমন: ঢাকা রেসিডেনসিয়াল মডেল কলেজ" className={inputClass} />
          </Field>

          <Field label="পরীক্ষার নাম">
            <input type="text" name="examName" value={headerInfo.examName} onChange={onHeaderChange}
              placeholder="যেমন: প্রাক-নির্বাচনি পরীক্ষা ২০২৪" className={inputClass} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="বিষয়">
              <input type="text" name="subject" value={headerInfo.subject} onChange={onHeaderChange} className={inputClass} />
            </Field>
            <Field label="বিষয় কোড">
              <input type="text" name="subjectCode" value={headerInfo.subjectCode} onChange={onHeaderChange} className={inputClass} />
            </Field>
            <Field label="সময়">
              <input type="text" name="time" value={headerInfo.time} onChange={onHeaderChange} className={inputClass} />
            </Field>
            <Field label="পূর্ণমান">
              <input type="text" name="totalMarks" value={headerInfo.totalMarks} onChange={onHeaderChange} className={inputClass} />
            </Field>
          </div>

          {/* আগে "পূর্ণমান" নিছক টেক্সট ছিল, কার্টের সাথে মিলত না — এখন গরমিল হলে বলে দেয় */}
          {mismatch && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-bold text-amber-200">
                  লেখা আছে {enToBn(declared)}, কিন্তু নির্বাচিত প্রশ্নের মোট নম্বর {enToBn(summary.totalMarks)}
                </p>
                <button
                  type="button"
                  onClick={() => onHeaderChange({ target: { name: 'totalMarks', value: enToBn(summary.totalMarks) } })}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-2.5 py-1.5 text-[11px] font-extrabold text-amber-100 transition hover:bg-amber-500/30"
                >
                  <Wand2 className="h-3 w-3" /> {enToBn(summary.totalMarks)} বসিয়ে দিন
                </button>
              </div>
            </div>
          )}

          <div className="border-t border-slate-800 pt-4">
            <h3 className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">প্রতি প্রশ্নের নম্বর</h3>
            <p className="mb-3 text-[11px] font-medium text-slate-600">
              এই হার ধরেই মোট নম্বর হিসাব হয় এবং প্রিন্ট কপিতে ছাপা হয়।
            </p>
            <div className="space-y-2">
              {Object.keys(DEFAULT_MARKS).filter((t) => t !== 'short').map((type) => {
                const used = summary.byType[type];
                return (
                  <div key={type} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2">
                    <span className="min-w-0 flex-1 truncate text-[12.5px] font-bold text-slate-200">{TYPE_LABELS[type]}</span>
                    {used ? (
                      <span className="shrink-0 text-[11px] font-bold text-slate-500">
                        {enToBn(used.count)} টি · {enToBn(used.marks)}
                      </span>
                    ) : (
                      <span className="shrink-0 text-[11px] font-semibold text-slate-700">অনির্বাচিত</span>
                    )}
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={marksConfig[type]}
                      onChange={(e) => onMarksChange(type, e.target.value)}
                      className="h-9 w-16 shrink-0 rounded-lg border border-slate-800 bg-slate-950/60 px-2 text-center text-sm font-bold text-white focus:border-indigo-500/50 focus:outline-none"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-800 p-4">
          <div className="mb-3 flex items-center justify-between rounded-xl bg-slate-900/60 px-3 py-2.5">
            <span className="text-[12px] font-bold text-slate-400">নির্বাচিত মোট</span>
            <span className="text-sm font-black text-slate-100">
              {enToBn(summary.totalQuestions)} টি প্রশ্ন · <span className="text-emerald-300">{enToBn(summary.totalMarks)}</span> নম্বর
            </span>
          </div>
          <button type="button" onClick={onClose}
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-extrabold text-white transition hover:bg-indigo-500 active:scale-[0.98]">
            হয়ে গেছে
          </button>
        </div>
      </aside>
    </div>
  );
});

PaperInfoPanel.displayName = 'PaperInfoPanel';

export default PaperInfoPanel;
