/**
 * প্রশ্নপত্র ও উত্তরপত্রের হেডারে বসানো প্রতিষ্ঠানের লোগো — দুই জায়গাতেই একই
 * মার্কআপ, যাতে অবস্থান/সাইজ বদলাতে হলে একবারই বদলাতে হয়।
 */
const PaperLogo = ({ url }) => {
  if (!url) return null;
  return (
    <img
      src={url}
      alt=""
      className="absolute left-0 top-0 max-h-16 w-auto object-contain print:max-h-16"
    />
  );
};

export default PaperLogo;
