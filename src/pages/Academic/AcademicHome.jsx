import { Book, GraduationCap, Video, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl hover:bg-slate-800 transition-colors">
    <div className="h-12 w-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4 text-indigo-400">
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-slate-400 leading-relaxed text-sm sm:text-base">{description}</p>
  </div>
);

const AcademicHome = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h1 className="text-2xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
          <span className="block text-white mb-2">স্বাগতম আমাদের</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            একাডেমিক হাবে
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-400 mb-8 leading-relaxed">
          এসএসসি এবং এইচএসসি শিক্ষার্থীদের জন্য বিষয়ভিত্তিক গোছানো কোর্স, ক্লাস নোটস এবং মডেল টেস্টের একটি পূর্ণাঙ্গ প্ল্যাটফর্ম।
        </p>
        
        {/* SSC and HSC Selection Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10">
          
          <Link 
            to="/academic/ssc" 
            className="group relative w-full sm:w-64 p-1 rounded-2xl bg-gradient-to-b from-indigo-500 to-purple-600 hover:shadow-[0_0_40px_rgba(99,102,241,0.4)] transition-all duration-300"
          >
            <div className="bg-[#0b0f19] rounded-xl p-6 h-full flex flex-col items-center justify-center group-hover:bg-[#0b0f19]/80 transition-colors">
              <h2 className="text-2xl font-bold text-white mb-2">এসএসসি</h2>
              <p className="text-slate-400 text-sm mb-4">নবম - দশম শ্রেণি</p>
              <div className="flex items-center text-indigo-400 text-sm font-semibold group-hover:text-indigo-300">
                সিলেবাস দেখুন <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <Link 
            to="/academic/hsc" 
            className="group relative w-full sm:w-64 p-1 rounded-2xl bg-gradient-to-b from-purple-500 to-pink-600 hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] transition-all duration-300"
          >
            <div className="bg-[#0b0f19] rounded-xl p-6 h-full flex flex-col items-center justify-center group-hover:bg-[#0b0f19]/80 transition-colors">
              <h2 className="text-2xl font-bold text-white mb-2">এইচএসসি</h2>
              <p className="text-slate-400 text-sm mb-4">একাদশ - দ্বাদশ শ্রেণি</p>
              <div className="flex items-center text-purple-400 text-sm font-semibold group-hover:text-purple-300">
                সিলেবাস দেখুন <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

        </div>
      </div>

      {/* Features Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-24">
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
