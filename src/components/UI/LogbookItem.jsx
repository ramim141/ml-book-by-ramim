export default function LogbookItem({ number, icon: Icon, title, isHighlight = false, children }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-4 sm:p-5 ${
        isHighlight ? 'border-white/15 bg-white/[0.04]' : 'border-white/10 bg-white/[0.02]'
      }`}
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-[11px] font-bold text-slate-300 sm:h-8 sm:w-8 sm:text-xs">
        {number}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex min-w-0 items-center gap-2 text-sm font-bold text-slate-100 sm:text-base">
          {Icon && <Icon size={16} className="shrink-0 text-slate-400" />}
          <span className="min-w-0 break-words">{title}</span>
        </div>

        <div className="text-sm leading-relaxed text-slate-300 sm:text-base">
          {children}
        </div>
      </div>
    </div>
  );
}
