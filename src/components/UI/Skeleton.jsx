/**
 * প্রজেক্টজুড়ে ব্যবহারের জন্য স্কেলিটন প্রিমিটিভ।
 *
 * স্পিনারের বদলে স্কেলিটন ব্যবহার করলে লেআউট আগে থেকেই জায়গা দখল করে রাখে,
 * তাই ডেটা এলে পেজ লাফায় না (layout shift কমে) আর অপেক্ষাটা ছোট মনে হয়।
 */

export function Skeleton({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-slate-800/70 ${className}`}
    />
  );
}

/** কয়েক লাইনের টেক্সট ব্লক — শেষ লাইনটা ছোট, যাতে বাস্তব অনুচ্ছেদের মতো লাগে */
export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={`h-3 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

/** আইকন + শিরোনাম + কয়েক লাইন — বেশিরভাগ ড্যাশবোর্ড কার্ডের আকৃতি */
export function SkeletonCard({ className = '', lines = 2, showIcon = true }) {
  return (
    <div className={`rounded-2xl border border-slate-800/70 bg-slate-900/40 p-5 ${className}`}>
      <div className="flex items-start gap-3">
        {showIcon && <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />}
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      {lines > 0 && <SkeletonText lines={lines} className="mt-4" />}
    </div>
  );
}

/** কার্ডের গ্রিড — ড্যাশবোর্ডে বিষয়/অধ্যায়ের তালিকার জন্য */
export function SkeletonGrid({ count = 6, columns = 'sm:grid-cols-2 lg:grid-cols-3', lines = 2 }) {
  return (
    <div className={`grid grid-cols-1 gap-4 ${columns}`}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} lines={lines} />
      ))}
    </div>
  );
}

/** এক কলামে সারি — তালিকাভিত্তিক পেজের জন্য (প্রশ্ন, পরীক্ষা, ফর্মুলা) */
export function SkeletonList({ count = 5, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-800/70 bg-slate-900/40 p-4">
          <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-3/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
          <Skeleton className="h-8 w-16 shrink-0 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

/** পরিসংখ্যানের সারি — ড্যাশবোর্ডের উপরের সংখ্যাগুলোর জন্য */
export function SkeletonStats({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-4">
          <Skeleton className="h-7 w-14" />
          <Skeleton className="mt-2 h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
