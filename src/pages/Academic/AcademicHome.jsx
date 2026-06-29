import { useState, useEffect } from 'react';
import { Book, GraduationCap, Video, ArrowRight, Library, BookOpen, FileText, CheckSquare, Sparkles, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="group bg-[#0f172a]/60 backdrop-blur-md border border-slate-800/80 p-8 rounded-3xl transition-all duration-300 hover:bg-[#0f172a] hover:border-slate-700 hover:-translate-y-1 shadow-xl">
    <div className="h-14 w-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 text-indigo-400 transition-transform duration-300 group-hover:scale-110 shadow-inner">
      <Icon className="h-7 w-7" />
    </div>
    <h3 className="text-xl font-bold text-white mb-3 transition-colors group-hover:text-slate-200">{title}</h3>
    <p className="text-slate-400 leading-relaxed text-sm">{description}</p>
  </div>
);

const StatCard = ({ icon: Icon, number, label, colorClass }) => (
  <div className="flex flex-col items-center justify-center p-5 sm:p-6 text-center transition-all duration-300 border bg-slate-800/30 backdrop-blur-md border-slate-700/50 rounded-2xl hover:border-slate-600 hover:bg-slate-800/50 shadow-lg hover:-translate-y-1 group">
    <div className={`p-3 mb-3 sm:mb-4 transition-transform duration-300 border rounded-xl bg-slate-900/50 border-slate-700/50 group-hover:scale-110 shadow-inner ${colorClass}`}>
      <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
    </div>
    <h3 className="mb-1 text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 sm:text-4xl">{number}</h3>
    <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider">{label}</p>
  </div>
);

const AcademicHome = () => {
  const [stats, setStats] = useState({
    subjects: 0,
    chapters: 0,
    cqs: 0,
    mcqs: 0
  });

  useEffect(() => {
    async function fetchStats() {
      const cachedStats = localStorage.getItem('academic_stats');
      const cacheTime = localStorage.getItem('academic_stats_time');
      const now = new Date().getTime();
      const oneHour = 60 * 60 * 1000;

      // Use cache if it exists and is less than 1 hour old
      if (cachedStats && cacheTime && (now - parseInt(cacheTime) < oneHour)) {
        try {
          setStats(JSON.parse(cachedStats));
          return;
        } catch (e) {
          console.error("Failed to parse cached stats", e);
        }
      }

      const cqFiles = import.meta.glob('../../components/Academic/**/*_CQs.json');
      const mcqFiles = import.meta.glob('../../components/Academic/**/*_MCQs.json');
      
      let subjectSet = new Set();
      let chapterSet = new Set();
      let totalCq = 0;
      let totalMcq = 0;
      
      const processFiles = async (files, type) => {
        const promises = Object.entries(files).map(async ([path, loader]) => {
          try {
            const module = await loader();
            if (type === 'cq') {
              totalCq += module.default.length;
            } else {
              totalMcq += module.default.length;
            }
            
            const match = path.match(/Academic\/(?:HSC|SSC)\/([^\/]+)\/.*?(chapter_\d+)/i);
            if (match) {
              subjectSet.add(match[1]);
              chapterSet.add(`${match[1]}-${match[2]}`);
            }
          } catch (err) {
            console.error(`Failed to load ${path}:`, err);
          }
        });
        await Promise.all(promises);
      };
      
      try {
        await Promise.all([
          processFiles(cqFiles, 'cq'),
          processFiles(mcqFiles, 'mcq')
        ]);
        
        const newStats = {
          subjects: subjectSet.size,
          chapters: chapterSet.size,
          cqs: totalCq,
          mcqs: totalMcq
        };

        setStats(newStats);
        localStorage.setItem('academic_stats', JSON.stringify(newStats));
        localStorage.setItem('academic_stats_time', now.toString());
      } catch (err) {
        console.error("Failed to process academic stats", err);
      }
    }
    
    fetchStats();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#050b14] overflow-hidden text-slate-200">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-600/20 blur-[130px] rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-fuchsia-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/5 blur-[150px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-28">
        
        {/* Hero Section */}
        <div className="text-center max-w-5xl mx-auto mb-16 sm:mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs sm:text-sm font-bold mb-8 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
             <Sparkles size={16} /> সেরা একাডেমিক প্ল্যাটফর্ম
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-tight">
            <span className="block text-slate-200 mb-2 drop-shadow-sm">স্বাগতম আমাদের</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">
              একাডেমিক হাবে
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto">
            এসএসসি এবং এইচএসসি শিক্ষার্থীদের জন্য বিষয়ভিত্তিক গোছানো কোর্স, ক্লাস নোটস এবং মডেল টেস্টের একটি পূর্ণাঙ্গ প্ল্যাটফর্ম।
          </p>

          {/* SSC, HSC and Admission Selection Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-6 mt-12">
            <Link
              to="/academic/ssc"
              className="group relative w-full sm:w-72 p-1 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 hover:shadow-[0_0_40px_rgba(99,102,241,0.3)] hover:-translate-y-1 transition-all duration-300"
            >
              <div className="bg-[#0b1120] rounded-[22px] p-6 sm:p-8 h-full flex flex-col items-center justify-center group-hover:bg-[#0b1120]/80 transition-colors">
                <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 transition-transform shadow-inner">
                   <BookOpen size={32} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">এসএসসি</h2>
                <p className="text-slate-400 text-sm mb-6 font-medium">নবম - দশম শ্রেণি</p>
                <div className="flex items-center text-indigo-400 text-sm font-bold group-hover:text-indigo-300 bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/20 transition-colors">
                  সিলেবাস দেখুন <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>

            <Link
              to="/academic/hsc"
              className="group relative w-full sm:w-72 p-1 rounded-3xl bg-gradient-to-br from-cyan-500 to-emerald-500 hover:shadow-[0_0_40px_rgba(6,182,212,0.3)] hover:-translate-y-1 transition-all duration-300"
            >
              <div className="bg-[#0b1120] rounded-[22px] p-6 sm:p-8 h-full flex flex-col items-center justify-center group-hover:bg-[#0b1120]/80 transition-colors">
                <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center mb-6 text-cyan-400 group-hover:scale-110 transition-transform shadow-inner">
                   <GraduationCap size={32} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">এইচএসসি</h2>
                <p className="text-slate-400 text-sm mb-6 font-medium">একাদশ - দ্বাদশ শ্রেণি</p>
                <div className="flex items-center text-cyan-400 text-sm font-bold group-hover:text-cyan-300 bg-cyan-500/10 px-4 py-2 rounded-xl border border-cyan-500/20 transition-colors">
                  সিলেবাস দেখুন <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>

            <Link
              to="/academic/admission"
              className="group relative w-full sm:w-72 p-1 rounded-3xl bg-gradient-to-br from-rose-500 to-orange-500 hover:shadow-[0_0_40px_rgba(244,63,94,0.3)] hover:-translate-y-1 transition-all duration-300"
            >
              <div className="bg-[#0b1120] rounded-[22px] p-6 sm:p-8 h-full flex flex-col items-center justify-center group-hover:bg-[#0b1120]/80 transition-colors">
                <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mb-6 text-rose-400 group-hover:scale-110 transition-transform shadow-inner">
                   <Award size={32} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">অ্যাডমিশন</h2>
                <p className="text-slate-400 text-sm mb-6 font-medium">বিশ্ববিদ্যালয় ভর্তি প্রস্তুতি</p>
                <div className="flex items-center text-rose-400 text-sm font-bold group-hover:text-rose-300 bg-rose-500/10 px-4 py-2 rounded-xl border border-rose-500/20 transition-colors">
                  সিলেবাস দেখুন <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="relative py-12 sm:py-16">
           <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
           <div className="max-w-5xl mx-auto grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
              <StatCard icon={Library} number={stats.subjects || "..."} label="মোট বিষয়" colorClass="text-indigo-400" />
              <StatCard icon={BookOpen} number={stats.chapters || "..."} label="মোট অধ্যায়" colorClass="text-cyan-400" />
              <StatCard icon={FileText} number={stats.cqs || "..."} label="সৃজনশীল (CQ)" colorClass="text-emerald-400" />
              <StatCard icon={CheckSquare} number={stats.mcqs || "..."} label="বহুনির্বাচনি (MCQ)" colorClass="text-amber-400" />
           </div>
           <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mt-16 sm:mt-24">
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
    </div>
  );
};

export default AcademicHome;
