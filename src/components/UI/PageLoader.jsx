import { Loader2 } from 'lucide-react';

export default function PageLoader() {
  return (
    <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4 bg-[#0b0f19] text-slate-400">
      <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      <p className="animate-pulse text-sm font-medium tracking-wide">লোড হচ্ছে...</p>
    </div>
  );
}
