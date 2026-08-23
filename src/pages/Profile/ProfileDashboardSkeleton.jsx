import { Skeleton } from '../../components/UI/Skeleton';

/**
 * ProfileDashboard এর হুবহু কাঠামো — একই কার্ড, একই স্পেসিং, একই সংখ্যা।
 * ডেটা এলে কিছু নড়ে না, তাই লোডিং থেকে পেজে যাওয়াটা নিঃশব্দ মনে হয়।
 */
export default function ProfileDashboardSkeleton() {
  return (
    <div
      className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-label="প্রোফাইল লোড হচ্ছে"
    >
      {/* দৈনিক উক্তি */}
      <div className="mb-6 flex items-start gap-4 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 px-5 py-4">
        <Skeleton className="mt-0.5 h-5 w-5 shrink-0 rounded" />
        <div className="min-w-0 flex-1">
          <Skeleton className="h-3.5 w-3/4" />
          <Skeleton className="mt-2 h-3 w-28" />
        </div>
      </div>

      {/* প্রোফাইল হেডার */}
      <div className="relative mb-5 flex flex-col items-center gap-5 overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5 sm:mb-6 sm:flex-row sm:gap-6 sm:rounded-3xl sm:p-8">
        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500" />

        <Skeleton className="h-24 w-24 shrink-0 rounded-full sm:h-36 sm:w-36" />

        <div className="w-full min-w-0 flex-1">
          {/* নাম + লেভেল ব্যাজ */}
          <div className="mb-1 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <Skeleton className="h-7 w-44 sm:h-9 sm:w-56" />
            <Skeleton className="h-6 w-28 rounded-lg" />
          </div>

          {/* ইমেইল */}
          <div className="mb-3 flex justify-center sm:mb-4 sm:justify-start">
            <Skeleton className="h-4 w-52" />
          </div>

          {/* XP বার */}
          <div className="mx-auto mb-3 max-w-sm sm:mx-0 sm:mb-4">
            <div className="mb-1 flex justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-2 w-full rounded-full sm:h-2.5" />
          </div>

          {/* চিপ */}
          <div className="flex flex-wrap justify-center gap-1.5 sm:justify-start sm:gap-2">
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-7 w-32 rounded-full" />
          </div>
        </div>
      </div>

      {/* পরিসংখ্যান — ৪টা কার্ড */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-4">
            <Skeleton className="mb-2 h-5 w-5 rounded" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="mt-1.5 h-3 w-20" />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* ট্যাব সাইডবার — ৯টা */}
        <div className="w-full shrink-0 lg:w-56">
          <div className="flex flex-row gap-1 overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/40 p-1.5 sm:gap-1.5 sm:p-2 lg:flex-col">
            {Array.from({ length: 9 }, (_, i) => (
              <Skeleton key={i} className="h-9 w-24 shrink-0 rounded-xl sm:h-10 lg:w-full" />
            ))}
          </div>
        </div>

        {/* কনটেন্ট প্যানেল */}
        <div className="min-w-0 flex-1">
          <div className="min-h-[400px] rounded-2xl border border-slate-700/50 bg-slate-800/40 p-4 sm:p-8">
            <Skeleton className="mb-6 h-6 w-40" />

            {/* স্ট্রিক গ্রিড */}
            <div className="mb-5 rounded-2xl border border-slate-700/50 bg-slate-900/50 p-5">
              <div className="mb-3 flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="ml-auto h-4 w-16" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: 28 }, (_, i) => (
                  <Skeleton key={i} className="h-5 w-5 rounded-md" />
                ))}
              </div>
            </div>

            {/* আরও দুইটা ব্লক — আসল ওভারভিউ ট্যাব এর চেয়েও লম্বা, আর এগুলো না
                থাকলে প্যানেলটা ট্যাব কলামের চেয়ে খাটো হয়ে নিচে ধাপ তৈরি করে */}
            {[0, 1].map((i) => (
              <div key={i} className="mb-5 rounded-2xl border border-slate-700/50 bg-slate-900/50 p-5 last:mb-0">
                <div className="mb-4 flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-11/12" />
                  <Skeleton className="h-3.5 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
