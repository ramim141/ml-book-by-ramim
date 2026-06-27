import { Book, GraduationCap, Video, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="group bg-slate-800/50 border border-slate-700/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl hover:bg-slate-800 hover:border-slate-600/70 hover:-translate-y-0.5 transition-all duration-300">
    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4 text-indigo-400 transition-transform group-hover:scale-110">
      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
    </div>
    <h3 className="text-base sm:text-xl font-semibold text-white mb-2 leading-snug">{title}</h3>
    <p className="text-slate-400 leading-relaxed text-xs sm:text-base">{description}</p>
  </div>
);

const AcademicHome = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 lg:py-20">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 lg:mb-20">
        <h1 className="text-2xl sm:text-4xl lg:text-6xl font-extrabold tracking-tight mb-4 sm:mb-5 lg:mb-6 leading-tight">
          <span className="block text-white mb-2">স্বাগতম আমাদের</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            একাডেমিক হাবে
          </span>
        </h1>
        <p className="text-sm sm:text-base lg:text-xl text-slate-400 mb-7 sm:mb-8 leading-relaxed">
          এসএসসি এবং এইচএসসি শিক্ষার্থীদের জন্য বিষয়ভিত্তিক গোছানো কোর্স, ক্লাস নোটস এবং মডেল টেস্টের একটি পূর্ণাঙ্গ প্ল্যাটফর্ম।
        </p>
        
        {/* SSC and HSC Selection Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 sm:gap-5 lg:gap-6 mt-7 sm:mt-9 lg:mt-10">
          
          <Link
            to="/academic/ssc"
            className="group relative w-full sm:w-64 p-1 rounded-2xl bg-gradient-to-b from-indigo-500 to-purple-600 hover:shadow-[0_0_40px_rgba(99,102,241,0.4)] active:scale-[0.99] sm:hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="bg-[#0b0f19] rounded-xl p-5 sm:p-6 h-full flex flex-col items-center justify-center group-hover:bg-[#0b0f19]/80 group-active:bg-[#0b0f19]/70 transition-colors">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">এসএসসি</h2>
              <p className="text-slate-400 text-sm mb-4">নবম - দশম শ্রেণি</p>
              <div className="flex items-center text-indigo-400 text-sm font-semibold group-hover:text-indigo-300">
                সিলেবাস দেখুন <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1 group-active:translate-x-0.5" />
              </div>
            </div>
          </Link>

          <Link
            to="/academic/hsc"
            className="group relative w-full sm:w-64 p-1 rounded-2xl bg-gradient-to-b from-purple-500 to-pink-600 hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] active:scale-[0.99] sm:hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="bg-[#0b0f19] rounded-xl p-5 sm:p-6 h-full flex flex-col items-center justify-center group-hover:bg-[#0b0f19]/80 group-active:bg-[#0b0f19]/70 transition-colors">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">এইচএসসি</h2>
              <p className="text-slate-400 text-sm mb-4">একাদশ - দ্বাদশ শ্রেণি</p>
              <div className="flex items-center text-purple-400 text-sm font-semibold group-hover:text-purple-300">
                সিলেবাস দেখুন <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1 group-active:translate-x-0.5" />
              </div>
            </div>
          </Link>

        </div>
      </div>

      {/* Features Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mt-12 sm:mt-16 lg:mt-24">
        <FeatureCard 
          icon={GraduationCap}
          title="গোছানো কারিকুলাম"
          description="বেসিক থেকে এডভান্সড পর্যন্ত ধাপে ধাপে শেখার জন্য সুন্দরভাবে সাজানো সিলেবাস।"
        />
        <FeatureCard 
          icon={Book}
          title="হ্যান্ডনোট ও পিডিএফ"
          description="প্রতিটি অধ্যায়ের জন্য বিষয়ভিত্তিক সহজ ও গোছানো হ্যান্ডনোট এবং পিডিএফ।"
        />
        <FeatureCard 
          icon={Video}
          title="ভিডিও লেকচার"
          description="জটিল গাণিতিক ও থিওরিটিক্যাল বিষয়গুলো সহজে বোঝার জন্য বিস্তারিত ভিডিও ক্লাস।"
        />
      </div>
    </div>
  );
};

export default AcademicHome;
