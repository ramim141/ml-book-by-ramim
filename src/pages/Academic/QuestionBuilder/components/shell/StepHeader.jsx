import React from 'react';
import { BookOpenCheck, Check, ShoppingCart, ArrowRight } from 'lucide-react';
import { enToBn } from '../../helpers.jsx';

/**
 * চার ধাপের জন্য একটাই স্থায়ী হেডার — ব্যবহারকারী সবসময় দেখতে পান
 * তিনি কোন ধাপে আছেন, কতগুলো প্রশ্ন বেছেছেন, আর পরের ধাপ কোনটা।
 */
const StepHeader = React.memo(({
  step,
  setStep,
  steps,
  cartCount = 0,
  canAdvance = false,
  onOpenCart,
  primaryAction,
}) => (
  <header className="qb-step-header z-30 -mx-4 border-b border-slate-800/80 bg-[#0b0f19]/95 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3">

      {/* উপরের সারি: শিরোনাম + কার্ট + প্রধান বাটন */}
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
            <BookOpenCheck className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-[15px] font-black tracking-tight text-slate-100 sm:text-base">
              প্রশ্নপত্র নির্মাতা
            </h1>
            <p className="hidden truncate text-[11px] font-semibold text-slate-500 sm:block">
              ধাপ {enToBn(step)} / {enToBn(steps.length)} — {steps.find((s) => s.num === step)?.label}
            </p>
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onOpenCart}
            className="qb-cart-button relative items-center gap-2 rounded-xl border border-slate-700/70 bg-slate-900/70 px-3 py-2 text-xs font-extrabold text-slate-200 transition hover:border-indigo-400/50 hover:bg-slate-800 active:scale-95"
          >
            <ShoppingCart className="h-4 w-4 text-emerald-400" />
            <span className="hidden sm:inline">নির্বাচিত</span>
            <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-black tabular-nums ${cartCount > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
              {enToBn(cartCount)}
            </span>
          </button>

          {primaryAction && (
            <button
              type="button"
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled}
              className="flex items-center gap-2 rounded-xl bg-[#8b5cf6] px-3.5 py-2 text-xs font-extrabold text-white shadow-lg shadow-indigo-950/40 transition hover:bg-[#7c3aed] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
            >
              <span className="truncate">{primaryAction.label}</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0" />
            </button>
          )}
        </div>
      </div>

      {/* নিচের সারি: ধাপের নির্দেশক */}
      <nav aria-label="ধাপসমূহ" className="flex items-center gap-1 overflow-x-auto pb-0.5 custom-scrollbar">
        {steps.map((s, index) => {
          const isCurrent = step === s.num;
          const isDone = step > s.num;
          const isLocked = s.needsCart && !canAdvance;

          return (
            <React.Fragment key={s.num}>
              <button
                type="button"
                onClick={() => (!isLocked ? setStep(s.num) : null)}
                disabled={isLocked}
                aria-current={isCurrent ? 'step' : undefined}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-extrabold transition disabled:cursor-not-allowed disabled:opacity-35 ${
                  isCurrent
                    ? 'bg-indigo-500/15 text-indigo-200'
                    : 'text-slate-500 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black tabular-nums transition ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : isCurrent
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isDone ? <Check className="h-3 w-3" strokeWidth={3.5} /> : enToBn(s.num)}
                </span>
                <span className="whitespace-nowrap">{s.label}</span>
              </button>

              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`h-px w-4 shrink-0 sm:w-8 ${step > s.num ? 'bg-emerald-500/40' : 'bg-slate-800'}`}
                />
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  </header>
));

StepHeader.displayName = 'StepHeader';

export default StepHeader;
