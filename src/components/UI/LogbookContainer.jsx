import { motion } from 'framer-motion';

export default function LogbookContainer({ title, subtitle, date, itemVariants, children }) {
  return (
    <motion.div variants={itemVariants} className="space-y-5 font-sans">
      <div className="flex flex-col items-start justify-between gap-2 pb-4 border-b sm:flex-row sm:items-end border-white/10">
        <div>
          <div className="mb-1 text-[10px] font-bold tracking-widest uppercase text-slate-500 sm:text-xs">
            রিমিশার ইঞ্জিনিয়ারিং লগবুক
          </div>
          <h2 className="text-xl font-extrabold leading-tight text-slate-100 sm:text-2xl">
            {title}
          </h2>
          <span className="block mt-1 text-[11px] text-slate-500 sm:text-xs">
            ({subtitle})
          </span>
        </div>
        <div className="text-[11px] font-semibold text-slate-500">
          তারিখ: {date}
        </div>
      </div>

      <div className="space-y-4">
        {children}
      </div>
    </motion.div>
  );
}
