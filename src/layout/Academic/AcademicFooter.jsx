import { BookOpen } from 'lucide-react';

const AcademicFooter = () => {
  return (
    <footer className="bg-[#0b0f19] border-t border-indigo-500/10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-6 w-6 text-indigo-400" />
          <span className="text-xl font-semibold text-slate-200">একাডেমিক হাব</span>
        </div>
        <p className="text-slate-400 text-sm text-center max-w-md">
          আমাদের মেশিন লার্নিং উদ্যোগের সাথে যুক্ত এসএসসি এবং এইচএসসি শিক্ষার্থীদের জন্য একটি গোছানো ও পূর্ণাঙ্গ শিখন প্ল্যাটফর্ম।
        </p>
        <div className="mt-8 pt-8 border-t border-slate-800 w-full text-center">
          <p className="text-slate-500 text-xs font-medium">
            © {new Date().getFullYear()} একাডেমিক হাব। সর্বস্বত্ব সংরক্ষিত।
          </p>
        </div>
      </div>
    </footer>
  );
};

export default AcademicFooter;
