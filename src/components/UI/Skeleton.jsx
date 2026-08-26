/**
 * প্রজেক্টজুড়ে ব্যবহারের জন্য আধুনিক গ্লাস এবং শিমার স্কেলিটন প্রিমিটিভ।
 *
 * স্পিনারের বদলে স্কেলিটন ব্যবহার করলে লেআউট আগে থেকেই জায়গা দখল করে রাখে,
 * তাই ডেটা এলে পেজ লাফায় না (layout shift কমে) এবং ব্যবহারকারীর অভিজ্ঞতা স্মুথ হয়।
 */

export function Skeleton({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden rounded-xl bg-slate-800/60 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.06] before:to-transparent ${className}`}
    />
  );
}

/** কয়েক লাইনের টেক্সট ব্লক */
export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={`h-3.5 ${i === lines - 1 ? 'w-3/5' : i === 0 ? 'w-full' : 'w-4/5'}`}
        />
      ))}
    </div>
  );
}

/** আইকন + শিরোনাম + কয়েক লাইন — ড্যাশবোর্ড বা ফিচার কার্ডের আকৃতি */
export function SkeletonCard({ className = '', lines = 2, showIcon = true }) {
  return (
    <div className={`rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm ${className}`}>
      <div className="flex items-start gap-3.5">
        {showIcon && <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />}
        <div className="min-w-0 flex-1 space-y-2 py-0.5">
          <Skeleton className="h-4.5 w-1/2 rounded-lg" />
          <Skeleton className="h-3 w-1/3 rounded-md" />
        </div>
      </div>
      {lines > 0 && <SkeletonText lines={lines} className="mt-4" />}
    </div>
  );
}

/** কার্ডের গ্রিড — ড্যাশবোর্ডে বিষয়/অধ্যায়ের তালিকার জন্য */
export function SkeletonGrid({ count = 6, columns = 'sm:grid-cols-2 lg:grid-cols-3', lines = 2 }) {
  return (
    <div className={`grid grid-cols-1 gap-4.5 ${columns}`}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} lines={lines} />
      ))}
    </div>
  );
}

/** এক কলামে সারি — তালিকাভিত্তিক পেজের জন্য (প্রশ্ন, পরীক্ষা, ফর্মুলা) */
export function SkeletonList({ count = 5, className = '' }) {
  return (
    <div className={`space-y-3.5 ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-center gap-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4.5">
          <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-3/5 rounded-md" />
            <Skeleton className="h-3 w-2/5 rounded-md" />
          </div>
          <Skeleton className="h-8 w-20 shrink-0 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

/** পরিসংখ্যানের সারি — ড্যাশবোর্ডের উপরের সংখ্যাগুলোর জন্য */
export function SkeletonStats({ count = 4, className = '' }) {
  return (
    <div className={`grid grid-cols-2 gap-3.5 sm:grid-cols-4 ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4.5 space-y-2">
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-3.5 w-24 rounded-md" />
        </div>
      ))}
    </div>
  );
}

/** MCQ / পরীক্ষার পেজের জন্য প্রশ্ন কার্ড স্কেলিটন */
export function SkeletonQuestionCard({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 space-y-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-6 w-8 shrink-0 rounded-md" />
            <Skeleton className="h-5 flex-1 rounded-md" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            {Array.from({ length: 4 }, (_, optIdx) => (
              <div key={optIdx} className="flex items-center gap-3 p-3 rounded-xl border border-slate-800/60 bg-slate-900/30">
                <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                <Skeleton className="h-3.5 flex-1 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** ফুল পেজ মাস্টার স্কেলিটন — যেকোনো পেজের প্রারম্ভিক লোডিংয়ের জন্য */
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200 pt-20 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-bangla">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div className="space-y-2.5 max-w-xl">
            <Skeleton className="h-8 sm:h-10 w-3/4 rounded-xl" />
            <Skeleton className="h-4 w-full rounded-lg" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>

        {/* Stats Row Skeleton */}
        <SkeletonStats count={4} />

        {/* Action / Filter Bar */}
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-slate-900/30 border border-slate-800/80">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl hidden sm:block" />
          <Skeleton className="h-10 w-28 rounded-xl hidden md:block" />
        </div>

        {/* Content Cards Grid */}
        <SkeletonGrid count={6} columns="sm:grid-cols-2 lg:grid-cols-3" lines={3} />
      </div>
    </div>
  );
}

export default Skeleton;
