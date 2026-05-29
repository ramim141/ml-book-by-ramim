import { motion } from 'framer-motion';

export default function ComparisonTable({ tableData, itemVariants }) {
  return (
    <motion.div variants={itemVariants} className="space-y-4">
      <h2 className="flex items-center gap-2 pb-2 font-sans text-xl font-bold text-slate-100 border-b border-white/10">
        <span className="text-lg text-slate-500">■</span>
        {tableData.title}
      </h2>

      <div className="overflow-x-auto rounded-lg border border-white/10 bg-transparent font-sans custom-scrollbar">
        <table className="w-full min-w-[640px] text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.04]">
              {tableData.headers.map((h, i) => (
                <th key={i} className="p-3 text-sm font-bold text-slate-200 md:text-base">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.rows.map((row, idx) => (
              <tr key={idx} className="border-b border-white/10">
                <td className="p-3 text-sm font-bold text-slate-200 md:text-base">
                  {row.feature}
                </td>
                <td className="p-3 text-sm leading-relaxed text-slate-300 md:text-base">
                  {row.computer}
                </td>
                <td className="p-3 text-sm leading-relaxed text-slate-300 md:text-base">
                  {row.ai}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
