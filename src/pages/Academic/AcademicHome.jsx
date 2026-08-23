import { memo } from 'react';
import { Book, GraduationCap, Video, ArrowRight, Library, BookOpen, FileText, CheckSquare, Sparkles, Award, PlayCircle, Brain, Target, ShieldCheck, Zap, Trophy, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { db } from '../../config/firebase';
import { useAcademicSubjects } from '../../hooks/useAcademicSubjects';
import { QK, STALE } from '../../lib/queryConfig';
import { Helmet } from 'react-helmet-async';
import GlobalSearch from '../../components/Academic/GlobalSearch';
import DailyChallengeWidget from '../../components/Academic/DailyChallengeWidget';

const FeatureCard = memo(({ icon: Icon, title, description, colorClass, delay }) => (
  <div 
    className={`group relative bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 p-8 rounded-[2rem] transition-all duration-500 hover:bg-slate-800/60 hover:border-${colorClass}-500/50 hover:-translate-y-2 shadow-2xl overflow-hidden`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={`absolute top-0 right-0 w-32 h-32 bg-${colorClass}-500/10 blur-[50px] rounded-full group-hover:bg-${colorClass}-500/20 transition-colors duration-500`}></div>
    <div className={`h-16 w-16 bg-${colorClass}-500/10 border border-${colorClass}-500/20 rounded-2xl flex items-center justify-center mb-6 text-${colorClass}-400 transition-transform duration-500 group-hover:scale-110 shadow-inner relative z-10`}>
      <Icon className="h-8 w-8" />
    </div>
    <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 transition-colors group-hover:text-slate-100 relative z-10">{title}</h3>
    <p className="text-slate-400 leading-relaxed text-sm sm:text-base relative z-10">{description}</p>
  </div>
));

const StatCard = memo(({ icon: Icon, number, label, colorClass, gradient }) => (
  <div className="relative group p-[1px] rounded-3xl overflow-hidden aspect-square">
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50 group-hover:opacity-100 transition-opacity duration-500`}></div>
    <div className="relative flex flex-col items-center justify-center p-3 sm:p-8 text-center bg-slate-900/90 backdrop-blur-xl rounded-[23px] h-full transition-all duration-500 group-hover:bg-slate-900/70">
      <div className={`p-3 sm:p-4 mb-2 sm:mb-5 transition-transform duration-500 rounded-2xl bg-slate-800/80 shadow-inner group-hover:scale-110 group-hover:rotate-3 ${colorClass}`}>
        <Icon className="w-6 h-6 sm:w-10 sm:h-10" />
      </div>
      <h3 className="mb-1 sm:mb-2 text-xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">{number}</h3>
      <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider sm:tracking-widest leading-tight">{label}</p>
    </div>
  </div>
));

const AcademicHome = () => {
  const { data: subjectList = [] } = useAcademicSubjects();

  /**
   * আগে শুধু গণনা দেখানোর জন্য প্রতিটা CQ ও MCQ ডকুমেন্ট ডাউনলোড করা হতো।
   * getCountFromServer() সার্ভারেই গণনা করে ফেরত দেয় — ডকুমেন্ট আসে না,
   * রিড খরচও নাটকীয়ভাবে কম।
   */
  const { data: questionCounts = { cqs: 0, mcqs: 0 } } = useQuery({
    queryKey: QK.academicStats(),
    queryFn: async () => {
      const [cqSnap, mcqSnap] = await Promise.all([
        getCountFromServer(query(collection(db, 'academic_content'), where('type', '==', 'cq'))),
        getCountFromServer(query(collection(db, 'academic_content'), where('type', '==', 'mcq'))),
      ]);
      return { cqs: cqSnap.data().count, mcqs: mcqSnap.data().count };
    },
    staleTime: STALE.STATS,
    retry: false, // লগআউট অবস্থায় permission-denied হলে বারবার চেষ্টা করার মানে নেই
  });

  const stats = {
    subjects: subjectList.length,
    chapters: subjectList.reduce((acc, sub) => acc + (sub.chapters?.length || 0), 0),
    cqs: questionCounts.cqs,
    mcqs: questionCounts.mcqs,
  };

  return (
    <div className="relative min-h-screen bg-[#030712] overflow-hidden text-slate-200 selection:bg-indigo-500/30">
      <Helmet>
        <title>অ্যাকাডেমিক হাব | এসএসসি, এইচএসসি এবং এডমিশন প্রস্তুতি</title>
        <meta name="description" content="এসএসসি, এইচএসসি এবং এডমিশন টেস্টের সকল বিষয়ের এ টু জেড প্রস্তুতি এখন এক জায়গায়। বাংলাদেশের স্মার্টেস্ট লার্নিং প্ল্যাটফর্ম।" />
        <meta name="keywords" content="SSC, HSC, Admission, Academic, BD, Smart Learning, Model Test, Question Bank" />
        <meta property="og:title" content="অ্যাকাডেমিক হাব | স্মার্ট লার্নিং" />
        <meta property="og:description" content="এসএসসি, এইচএসসি এবং এডমিশন টেস্টের সকল বিষয়ের এ টু জেড প্রস্তুতি।" />
        <meta property="og:type" content="website" />
      </Helmet>
      
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dztz49ncf/image/upload/v1704443900/grid-dark_x0ix5d.png')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10 mix-blend-overlay"></div>
        
        {/* Glowing Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/30 blur-[120px] rounded-full animate-[pulse_8s_ease-in-out_infinite_alternate]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-600/20 blur-[120px] rounded-full animate-[pulse_10s_ease-in-out_infinite_alternate-reverse]"></div>
        <div className="absolute top-[30%] left-[60%] w-[30%] h-[30%] bg-cyan-600/20 blur-[100px] rounded-full animate-[pulse_12s_ease-in-out_infinite_alternate]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        
        {/* Hero Section */}
        <div className="text-center max-w-5xl mx-auto mb-20 sm:mb-28 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-indigo-500/10 blur-[100px] -z-10 rounded-full pointer-events-none"></div>
          
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-indigo-500/30 text-indigo-300 text-sm font-bold mb-8 shadow-[0_0_25px_rgba(99,102,241,0.2)] animate-fade-in-up">
             <Sparkles size={16} className="text-indigo-400 animate-pulse" /> 
             <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-fuchsia-400">
               বাংলাদেশের স্মার্টেস্ট লার্নিং প্ল্যাটফর্ম
             </span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-[5.5rem] font-black tracking-tight mb-8 leading-[1.1] animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <span className="block text-slate-200 mb-3 drop-shadow-lg">স্বাগতম আমাদের</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-cyan-400 animate-gradient-x">
              অ্যাডভান্সড ও ইন্টারেক্টিভ
            </span> <br className="hidden sm:block" />
            অ্যাকাডেমিক হাবে
          </h1>
          
          <p className="text-base sm:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up font-medium" style={{ animationDelay: '200ms' }}>
            এসএসসি, এইচএসসি এবং এডমিশন টেস্টের সকল বিষয়ের এ টু জেড প্রস্তুতি এখন এক জায়গায়।
          </p>
          
          <div className="max-w-2xl mx-auto relative group animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <GlobalSearch />
          </div>

          {/* Core Categories Section */}
          <div className="mt-24 sm:mt-32">
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4 animate-fade-in-up">আপনার লক্ষ্য বেছে নিন</h2>
            <p className="text-slate-400 text-sm sm:text-base mb-12 max-w-2xl mx-auto animate-fade-in-up">যে ক্লাসে পড়ছেন, সেটি সিলেক্ট করে আপনার প্রস্তুতি শুরু করুন।</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <Link
                to="/academic/ssc"
                className="group relative rounded-[2rem] p-[2px] overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.5)]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-[2rem] p-8 lg:p-10 h-full flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner">
                     <BookOpen size={40} />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">এসএসসি</h2>
                  <p className="text-indigo-200/60 text-sm mb-8 font-semibold tracking-wide uppercase">নবম - দশম শ্রেণি</p>
                  <div className="flex items-center justify-center w-full bg-indigo-500/10 text-indigo-300 text-sm font-bold group-hover:bg-indigo-500 group-hover:text-white px-6 py-3.5 rounded-xl border border-indigo-500/20 group-hover:border-transparent transition-all duration-300">
                    সিলেবাস দেখুন <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>

              <Link
                to="/academic/hsc"
                className="group relative rounded-[2rem] p-[2px] overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(6,182,212,0.5)] md:-mt-8"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-emerald-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-[2rem] p-8 lg:p-10 h-full flex flex-col items-center justify-center">
                  <div className="absolute top-0 right-0 px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-bl-2xl rounded-tr-[2rem] text-xs font-bold text-white shadow-lg">Popular</div>
                  <div className="w-20 h-20 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center mb-6 text-cyan-400 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 shadow-inner">
                     <GraduationCap size={40} />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">এইচএসসি</h2>
                  <p className="text-cyan-200/60 text-sm mb-8 font-semibold tracking-wide uppercase">একাদশ - দ্বাদশ শ্রেণি</p>
                  <div className="flex items-center justify-center w-full bg-cyan-500/10 text-cyan-300 text-sm font-bold group-hover:bg-cyan-500 group-hover:text-white px-6 py-3.5 rounded-xl border border-cyan-500/20 group-hover:border-transparent transition-all duration-300">
                    সিলেবাস দেখুন <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>

              <Link
                to="/academic/admission"
                className="group relative rounded-[2rem] p-[2px] overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(244,63,94,0.5)]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500 via-orange-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-[2rem] p-8 lg:p-10 h-full flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mb-6 text-rose-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner">
                     <Award size={40} />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">অ্যাডমিশন</h2>
                  <p className="text-rose-200/60 text-sm mb-8 font-semibold tracking-wide uppercase">বিশ্ববিদ্যালয় প্রস্তুতি</p>
                  <div className="flex items-center justify-center w-full bg-rose-500/10 text-rose-300 text-sm font-bold group-hover:bg-rose-500 group-hover:text-white px-6 py-3.5 rounded-xl border border-rose-500/20 group-hover:border-transparent transition-all duration-300">
                    সিলেবাস দেখুন <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Massive Stats Section */}
        <div className="mt-32 mb-32 relative">
           <div className="absolute inset-0 bg-slate-800/20 blur-3xl rounded-full pointer-events-none"></div>
           <div className="text-center mb-12">
             <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">আমাদের কালেকশন</h2>
             <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">প্রচুর সংখ্যক প্রশ্ন ও নোটস দিয়ে সাজানো হয়েছে আমাদের প্ল্যাটফর্ম</p>
           </div>
           
           <div className="max-w-6xl mx-auto grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-8 relative z-10">
              <StatCard icon={Library} number={stats.subjects || "..."} label="মোট বিষয়" colorClass="text-indigo-400" gradient="from-indigo-500 to-purple-500" />
              <StatCard icon={BookOpen} number={stats.chapters || "..."} label="মোট অধ্যায়" colorClass="text-cyan-400" gradient="from-cyan-500 to-emerald-500" />
              <StatCard icon={FileText} number={stats.cqs || "..."} label="সৃজনশীল প্রশ্ন" colorClass="text-fuchsia-400" gradient="from-fuchsia-500 to-pink-500" />
              <StatCard icon={CheckSquare} number={stats.mcqs || "..."} label="বহুনির্বাচনি (MCQ)" colorClass="text-amber-400" gradient="from-amber-500 to-orange-500" />
           </div>
        </div>

        {/* Detailed Information Section */}
        <div className="mt-32">
          <div className="text-center mb-16 lg:mb-24">
             <h2 className="text-2xl sm:text-5xl font-black text-white mb-4 animate-fade-in-up">আমাদের প্ল্যাটফর্মে যা যা পাচ্ছেন</h2>
             <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-lg animate-fade-in-up" style={{ animationDelay: '100ms' }}>আপনার এ-টু-জেড প্রস্তুতির জন্য প্রয়োজনীয় সবকিছু এক ছাতার নিচে।</p>
          </div>
          
          <div className="space-y-16 lg:space-y-32">
            {/* Feature 1 */}
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 group">
               <div className="flex-1 order-2 lg:order-1">
                 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-bold mb-6 border border-indigo-500/20">
                   <BookOpen size={16} /> স্টাডি ম্যাটেরিয়াল
                 </div>
                 <h3 className="text-2xl sm:text-4xl font-bold text-white mb-6 leading-tight">বিগত সালের সকল বোর্ড প্রশ্ন ও অধ্যায়ভিত্তিক সমাধান</h3>
                 <p className="text-slate-400 text-sm sm:text-lg leading-relaxed mb-8">এসএসসি ও এইচএসসি পরীক্ষার বিগত সকল বছরের বোর্ড প্রশ্ন অধ্যায়ভিত্তিক সাজানো আছে। যেকোনো প্রশ্নের উত্তর এবং বিস্তারিত সমাধান পাবেন খুব সহজেই।</p>
                 <ul className="space-y-4">
                   <li className="flex items-center gap-4 text-slate-300 font-medium"><div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400"><CheckSquare size={16} /></div> অধ্যায়ভিত্তিক সৃজনশীল প্রশ্ন (CQ)</li>
                   <li className="flex items-center gap-4 text-slate-300 font-medium"><div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400"><CheckSquare size={16} /></div> বহুনির্বাচনি প্রশ্ন (MCQ) ও তার ব্যাখ্যা</li>
                   <li className="flex items-center gap-4 text-slate-300 font-medium"><div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400"><CheckSquare size={16} /></div> জ্ঞান ও অনুধাবনমূলক প্রশ্ন</li>
                 </ul>
               </div>
               <div className="flex-1 order-1 lg:order-2 w-full">
                 <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] p-8 aspect-[4/3] flex items-center justify-center relative overflow-hidden transition-transform duration-700 group-hover:scale-105 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 blur-3xl"></div>
                    <FileText className="w-32 h-32 text-indigo-400/80 relative z-10 transition-transform duration-700 group-hover:scale-110 group-hover:text-indigo-400" />
                 </div>
               </div>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 group">
               <div className="flex-1 order-1 lg:order-1 w-full">
                 <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] p-8 aspect-[4/3] flex items-center justify-center relative overflow-hidden transition-transform duration-700 group-hover:scale-105 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 blur-3xl"></div>
                    <Activity className="w-32 h-32 text-cyan-400/80 relative z-10 transition-transform duration-700 group-hover:scale-110 group-hover:text-cyan-400" />
                 </div>
               </div>
               <div className="flex-1 order-2 lg:order-2">
                 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 text-cyan-400 text-sm font-bold mb-6 border border-cyan-500/20">
                   <Target size={16} /> স্কিল যাচাই
                 </div>
                 <h3 className="text-2xl sm:text-4xl font-bold text-white mb-6 leading-tight">স্মার্ট মডেল টেস্ট দিয়ে নিজের প্রস্তুতি যাচাই করুন</h3>
                 <p className="text-slate-400 text-sm sm:text-lg leading-relaxed mb-8">বোর্ড স্ট্যান্ডার্ড প্রশ্ন দিয়ে আনলিমিটেড মডেল টেস্ট দিন। পরীক্ষা শেষে সাথে সাথেই রেজাল্ট, সঠিক উত্তর এবং বিস্তারিত ব্যাখ্যা পেয়ে যাবেন।</p>
                 <ul className="space-y-4">
                   <li className="flex items-center gap-4 text-slate-300 font-medium"><div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400"><CheckSquare size={16} /></div> কাস্টমাইজড মডেল টেস্ট (অধ্যায় বা বিষয়ভিত্তিক)</li>
                   <li className="flex items-center gap-4 text-slate-300 font-medium"><div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400"><CheckSquare size={16} /></div> লিডারবোর্ডে সারা দেশের শিক্ষার্থীদের মাঝে নিজের অবস্থান</li>
                   <li className="flex items-center gap-4 text-slate-300 font-medium"><div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400"><CheckSquare size={16} /></div> দুর্বল টপিকগুলোর এনালাইসিস রিপোর্ট</li>
                 </ul>
               </div>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 group">
               <div className="flex-1 order-2 lg:order-1">
                 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-fuchsia-500/10 text-fuchsia-400 text-sm font-bold mb-6 border border-fuchsia-500/20">
                   <Trophy size={16} /> গ্যামিফিকেশন
                 </div>
                 <h3 className="text-2xl sm:text-4xl font-bold text-white mb-6 leading-tight">পড়াশোনা করুন গেম খেলার মতো মজার ছলে</h3>
                 <p className="text-slate-400 text-sm sm:text-lg leading-relaxed mb-8">পড়াশোনাকে আর একঘেয়েমি মনে হবে না! প্রতিদিনের লক্ষ্য পূরণ করে পয়েন্ট অর্জন করুন, লেভেল আপ করুন এবং নতুন নতুন ব্যাজ জিতে নিন।</p>
                 <ul className="space-y-4">
                   <li className="flex items-center gap-4 text-slate-300 font-medium"><div className="w-8 h-8 rounded-full bg-fuchsia-500/20 flex items-center justify-center text-fuchsia-400"><CheckSquare size={16} /></div> সঠিক উত্তরের জন্য XP পয়েন্ট অর্জন</li>
                   <li className="flex items-center gap-4 text-slate-300 font-medium"><div className="w-8 h-8 rounded-full bg-fuchsia-500/20 flex items-center justify-center text-fuchsia-400"><CheckSquare size={16} /></div> ডেইলি স্ট্রিক (Daily Streak) মেইনটেইন করে এক্সট্রা পয়েন্ট</li>
                   <li className="flex items-center gap-4 text-slate-300 font-medium"><div className="w-8 h-8 rounded-full bg-fuchsia-500/20 flex items-center justify-center text-fuchsia-400"><CheckSquare size={16} /></div> লেভেল আপ এবং এক্সক্লুসিভ অ্যাচিভমেন্ট ব্যাজ</li>
                 </ul>
               </div>
               <div className="flex-1 order-1 lg:order-2 w-full">
                 <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] p-8 aspect-[4/3] flex items-center justify-center relative overflow-hidden transition-transform duration-700 group-hover:scale-105 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/20 to-pink-500/10 blur-3xl"></div>
                    <Trophy className="w-32 h-32 text-fuchsia-400/80 relative z-10 transition-transform duration-700 group-hover:scale-110 group-hover:text-fuchsia-400" />
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Premium Features Grid */}
        <div className="mt-40">
          <div className="text-center mb-16">
             <div className="inline-flex items-center justify-center p-3 mb-6 bg-slate-800/50 rounded-2xl border border-slate-700">
               <ShieldCheck className="w-8 h-8 text-indigo-400" />
             </div>
             <h2 className="text-2xl sm:text-5xl font-black text-white mb-4">কেন আমরা সেরা?</h2>
             <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-lg">অন্যান্য গতানুগতিক প্ল্যাটফর্ম থেকে আমাদের সিস্টেম সম্পূর্ণ আলাদা এবং আধুনিক।</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Brain}
              title="এআই অ্যাসিস্ট্যান্ট"
              colorClass="indigo"
              delay={0}
              description="যেকোনো প্রশ্নে আটকে গেলে আমাদের AI আপনাকে ধাপে ধাপে বুঝিয়ে দেবে, ঠিক একজন প্রাইভেট টিউটরের মতো।"
            />
            <FeatureCard
              icon={Target}
              title="স্মার্ট মডেল টেস্ট"
              colorClass="cyan"
              delay={100}
              description="বোর্ড স্ট্যান্ডার্ড প্রশ্ন দিয়ে আনলিমিটেড মডেল টেস্ট দিন এবং সাথে সাথে রেজাল্ট ও এনালাইসিস পান।"
            />
            <FeatureCard
              icon={Zap}
              title="দ্রুত ও নির্ভুল"
              colorClass="fuchsia"
              delay={200}
              description="সুপার ফাস্ট ইন্টারফেসের সাথে নির্ভুল সব সল্যুশন যা আপনার মূল্যবান সময় বাঁচাবে।"
            />
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 sm:mt-32 relative overflow-hidden rounded-3xl sm:rounded-[3rem] bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 border border-indigo-500/30 p-8 sm:p-20 text-center">
          <div className="absolute top-0 right-0 w-64 h-64 sm:w-[500px] sm:h-[500px] bg-indigo-500/20 blur-[80px] sm:blur-[100px] rounded-full"></div>
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-5xl font-black text-white mb-4 sm:mb-6">আজই আপনার প্রস্তুতি শুরু করুন</h2>
            <p className="text-sm sm:text-xl text-indigo-200/80 mb-8 sm:mb-10 max-w-2xl mx-auto">ফ্রি অ্যাকাউন্ট খুলে এক্সপ্লোর করুন আমাদের সকল ফিচারসমূহ।</p>
            <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] sm:shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] sm:hover:shadow-[0_0_50px_rgba(99,102,241,0.6)] hover:-translate-y-1 whitespace-nowrap">
              ফ্রিতে শুরু করুন <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>
        </div>

      </div>
      
      {/* Floating Widget */}
      <DailyChallengeWidget />
    </div>
  );
};

export default AcademicHome;
