import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * ব্রাউজারের `confirm()` এর বদলে ব্যবহারের জন্য ডায়ালগ।
 * সরাসরি না ডেকে `useConfirm()` হুকটা ব্যবহার করাই সহজ।
 */
function ConfirmDialog({
  title = 'নিশ্চিত করুন',
  message = 'আপনি কি নিশ্চিত?',
  confirmLabel = 'হ্যাঁ, করুন',
  cancelLabel = 'বাতিল',
  tone = 'danger',
  onClose,
}) {
  // Escape চাপলে বাতিল, আর খোলা থাকলে পেছনের পেজ স্ক্রল বন্ধ
  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose(false);
    };
    document.addEventListener('keydown', handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const confirmTone =
    tone === 'danger'
      ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/40'
      : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-950/40';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={() => onClose(false)}
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl sm:p-6"
      >
        <button
          type="button"
          onClick={() => onClose(false)}
          aria-label="বন্ধ করুন"
          className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3.5">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
              tone === 'danger'
                ? 'border-rose-500/25 bg-rose-500/10 text-rose-400'
                : 'border-indigo-500/25 bg-indigo-500/10 text-indigo-400'
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </span>

          <div className="min-w-0 pr-6">
            <h2 id="confirm-title" className="text-base font-black text-white">{title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => onClose(false)}
            className="min-h-11 rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-2.5 text-sm font-bold text-slate-200 transition hover:bg-slate-800 active:scale-95"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            // ধ্বংসাত্মক কাজে ভুল করে Enter চাপলে যেন হয়ে না যায়, তাই ফোকাস এখানে নয়
            onClick={() => onClose(true)}
            className={`min-h-11 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lg transition active:scale-95 ${confirmTone}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
