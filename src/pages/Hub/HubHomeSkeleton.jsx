import { Skeleton } from '../../components/UI/Skeleton';

/**
 * HubHome এর হুবহু কাঠামো — একই স্পেসিং, একই মাপ।
 * আসল কনটেন্ট এলে কিছু নড়ে না, তাই লোডিং থেকে পেজে যাওয়াটা নিঃশব্দ মনে হয়।
 */
function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-cyan-100/[0.08] bg-[#071521] p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 shrink-0 rounded-xl sm:h-14 sm:w-14" />
        <div className="min-w-0 flex-1">
          <Skeleton className="h-5 w-24 rounded-md" />
          <Skeleton className="mt-2.5 h-6 w-3/4" />
          <Skeleton className="mt-2 h-3.5 w-1/3" />
        </div>
      </div>

      <div className="mt-5 space-y-2.5">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-2/3" />
      </div>

      <div className="mt-6 flex gap-2">
        <Skeleton className="h-7 w-28 rounded-md" />
        <Skeleton className="h-7 w-32 rounded-md" />
      </div>

      <Skeleton className="mt-7 h-4 w-40" />
    </div>
  );
}

export default function HubHomeSkeleton() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050b12]" aria-busy="true" aria-label="পেজ লোড হচ্ছে">
      {/* আসল পেজের মতোই ব্যাকগ্রাউন্ড গ্লো, যাতে রঙ হঠাৎ না বদলায় */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/4 h-[420px] w-[420px] rounded-full bg-teal-500/10 blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 h-[420px] w-[420px] rounded-full bg-indigo-600/10 blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-10 sm:px-8 sm:py-14 lg:py-16">
        {/* হেডার */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-5 w-40" />
          </div>
          <Skeleton className="hidden h-10 w-28 rounded-md sm:block" />
        </div>

        {/* হিরো */}
        <div className="mt-14 flex flex-col items-center sm:mt-20">
          <Skeleton className="h-9 w-64 rounded-full" />
          <Skeleton className="mt-7 h-12 w-80 sm:h-14 sm:w-[26rem] lg:h-16 lg:w-[32rem]" />
          <div className="mt-5 flex w-full max-w-2xl flex-col items-center space-y-2.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>

        {/* দুইটা সাব-সাইট কার্ড */}
        <div className="mt-12 grid flex-1 content-start gap-6 sm:mt-16 lg:grid-cols-2 lg:gap-8">
          <CardSkeleton />
          <CardSkeleton />
        </div>

        {/* ফুটার */}
        <div className="mt-14 border-t border-cyan-100/[0.06] pt-7 sm:mt-20">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {['w-28', 'w-12', 'w-24', 'w-32', 'w-16'].map((w) => (
              <Skeleton key={w} className={`h-4 ${w}`} />
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
      </div>
    </div>
  );
}
