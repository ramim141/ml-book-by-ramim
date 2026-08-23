/**
 * পরীক্ষার্থীর নাম/রোল/শাখা/তারিখ লেখার জায়গা — প্রশ্নপত্রের হেডারে এবং
 * ওএমআর শীটে একই মার্কআপ, তাই বিন্যাস বদলাতে হলে একবারই বদলাতে হয়।
 */
const StudentInfoBox = ({ style }) => (
  <div className="mt-3 pt-2.5 border-t border-dashed border-black/60 text-xs font-semibold text-left">
    {style === 'box' ? (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border border-black p-2 rounded-sm">
        <div>নাম: .......................................</div>
        <div>রোল: ..........................</div>
        <div>শাখা: ........................</div>
        <div>তারিখ: ......................</div>
      </div>
    ) : (
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>নাম: .................................................</span>
        <span>রোল: .....................</span>
        <span>শাখা: ..................</span>
        <span>তারিখ: ................</span>
      </div>
    )}
  </div>
);

export default StudentInfoBox;
