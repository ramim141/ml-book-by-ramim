export default function BlogAuthor({ authorName }) {
  return (
    <aside className="mt-12 pt-8 border-t border-slate-850/80 flex items-center gap-4">
      <img
        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ramim"
        alt={authorName}
        className="h-12 w-12 rounded-full border border-slate-700/50 bg-[#111729]/80 object-cover"
      />
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">লেখক</p>
        <h4 className="text-sm sm:text-base font-bold text-white leading-none mb-1">{authorName}</h4>
        <p className="text-xs text-slate-400">মেশিন লার্নিং গবেষক ও টেক প্রফেশনাল</p>
      </div>
    </aside>
  );
}
