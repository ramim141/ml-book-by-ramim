import React from 'react';
import { Check, Printer } from 'lucide-react';

const ActionButton = React.memo(({ label, icon: Icon, onClick, disabled = false, variant = 'default' }) => {
  const variantClass = variant === 'primary'
    ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-100 hover:bg-indigo-500/30'
    : 'border-slate-700/60 bg-slate-900/45 text-slate-300 hover:bg-slate-800 hover:text-white';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-extrabold shadow-sm transition duration-150 disabled:cursor-not-allowed disabled:opacity-45 focus:outline-none ${variantClass}`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
});

ActionButton.displayName = 'ActionButton';

const QuickActionCard = React.memo(({
  canPreview,
  onPreview,
  onGenerate,
  canGenerateAnswer,
}) => (
  <section className="animate-[fade-up_200ms_ease-out] rounded-2xl border border-slate-700/50 bg-slate-800/30 p-5 shadow-xl shadow-slate-950/20 transition duration-150 hover:border-slate-600 hover:bg-slate-800/45">
    <div className="mb-4">
      <h2 className="text-sm font-extrabold text-slate-100">দ্রুত কাজ</h2>
      <p className="mt-1 text-xs font-semibold text-slate-500">প্রিভিউ থেকে PDF ডাউনলোড করতে পারবেন</p>
    </div>

    <div className="space-y-2.5">
      <ActionButton label="প্রশ্নপত্র প্রিভিউ" icon={Printer} onClick={onPreview} disabled={!canPreview} variant="primary" />
      <ActionButton label="উত্তরপত্র দেখুন" icon={Check} onClick={onGenerate} disabled={!canGenerateAnswer} />
    </div>
  </section>
));

QuickActionCard.displayName = 'QuickActionCard';

export default QuickActionCard;
