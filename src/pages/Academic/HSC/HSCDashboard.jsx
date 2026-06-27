import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Calculator, CalendarDays, ChevronRight, FileText, 
  GraduationCap, LayoutDashboard, Library, Lightbulb, 
  Settings, Target, Trophy, Clock, Search, Zap, Microscope, Globe
} from 'lucide-react';

export default function HSCDashboard() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const quickActions = [
    { title: 'প্রশ্নব্যাংক', icon: Library, path: '/academic/question-bank', color: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-500/20' },
    { title: 'মডেল টেস্ট', icon: Target, path: '/academic/model-test', color: 'from-fuchsia-500 to-pink-500', shadow: 'shadow-fuchsia-500/20' },
    { title: 'সাজেশন', icon: Lightbulb, path: '/academic/suggestion', color: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-500/20' },
    { title: 'শর্টকাট', icon: Zap, path: '/academic/shortcut/all/all/all', color: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-500/20' },
  ];

  const subjects = [
    { title: 'তথ্য ও যোগাযোগ প্রযুক্তি', subtitle: 'আইসিটি (ICT)', icon: LayoutDashboard, path: '/academic/hsc/ict', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    { title: 'রসায়ন ১ম পত্র', subtitle: 'গুণগত রসায়ন ও অন্যান্য', icon: Microscope, path: '/academic/hsc/chemistry', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    { title: 'পদার্থবিজ্ঞান', subtitle: 'ভেক্টর ও বলবিদ্যা', icon: Zap, path: '/academic/hsc/physics', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
    { title: 'উচ্চতর গণিত', subtitle: 'ম্যাট্রিক্স ও ক্যালকুলাস', icon: Calculator, path: '/academic/hsc/math', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { title: 'জীববিজ্ঞান', subtitle: 'উদ্ভিদ ও প্রাণিবিজ্ঞান', icon: BookOpen, path: '/academic/hsc/biology', color: 'bg-lime-500/10 text-lime-400 border-lime-500/20' },
    { title: 'English', subtitle: 'Grammar & Writing', icon: Globe, path: '/academic/hsc/english', color: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
  ];

  const studyTools = [
    { title: 'সিলেবাস', icon: BookOpen, path: '/academic/syllabus' },
    { title: 'রুটিন', icon: CalendarDays, path: '/academic/routine' },
    { title: 'রেজাল্ট', icon: Trophy, path: '/academic/result' },
    { title: 'স্টাডি টাইমার', icon: Clock, path: '/academic/timer' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1c] pb-24 sm:pb-10 pt-10 font-bangla selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        
        {/* Header Section */}
        <div className="relative">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-[60px] pointer-events-none"></div>
          <div className="absolute top-10 right-0 w-32 h-32 bg-fuchsia-500/20 rounded-full blur-[60px] pointer-events-none"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400 drop-shadow-sm mb-2">
              এইচএসসি (HSC)
            </h1>
            <p className="text-slate-400 text-sm sm:text-base font-medium">একাদশ-দ্বাদশ শ্রেণির সকল বিষয় ও স্টাডি ম্যাটেরিয়াল</p>
          </div>
          
          {/* Global Search Bar (Mobile focused) */}
          <div className="mt-6 relative z-10">
            <div className="flex items-center bg-slate-800/40 border border-slate-700/50 rounded-2xl p-2 shadow-inner backdrop-blur-md focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
              <div className="pl-3 pr-2 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="যেকোনো বিষয় বা টপিক খুঁজুন..."
                className="flex-grow bg-transparent border-none text-slate-100 text-sm focus:outline-none focus:ring-0 py-2 placeholder:text-slate-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Quick Actions (Grid for mobile) */}
        <section className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400" /> 
              কুইক অ্যাকশন
            </h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {quickActions.map((action, idx) => (
              <Link 
                key={idx} 
                to={action.path}
                className={`relative overflow-hidden group rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-center gap-3 bg-gradient-to-br ${action.color} shadow-lg ${action.shadow} transition-all duration-300 hover:scale-[1.03] hover:shadow-xl active:scale-95`}
              >
                {/* Glassy overlay */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="bg-white/20 p-3 rounded-2xl shadow-inner backdrop-blur-md">
                  <action.icon className="h-7 w-7 sm:h-8 sm:w-8 text-white drop-shadow-md" />
                </div>
                <span className="text-white font-bold text-xs sm:text-sm text-center drop-shadow-md tracking-wide">
                  {action.title}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Subjects */}
        <section className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-400" /> 
              এইচএসসি বিষয়সমূহ
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {subjects.map((subject, idx) => (
              <Link 
                key={idx} 
                to={subject.path}
                className="group flex items-center gap-4 bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl transition-all hover:bg-slate-800 hover:border-slate-600 active:scale-[0.98]"
              >
                <div className={`p-3 rounded-xl border ${subject.color}`}>
                  <subject.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-slate-200 font-bold text-sm sm:text-base group-hover:text-white transition-colors">{subject.title}</h3>
                  <p className="text-slate-500 text-[11px] sm:text-xs font-medium mt-0.5">{subject.subtitle}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Study Tools (Horizontal Scroll for Mobile) */}
        <section className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Settings className="h-5 w-5 text-teal-400" /> 
              স্টাডি টুলস
            </h2>
          </div>

          <div className="flex overflow-x-auto sm:grid sm:grid-cols-4 gap-3 pb-4 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 custom-scrollbar snap-x">
            {studyTools.map((tool, idx) => (
              <Link
                key={idx}
                to={tool.path}
                className="shrink-0 w-[120px] sm:w-auto snap-center flex flex-col items-center justify-center gap-3 bg-slate-800/30 border border-slate-700/40 p-5 rounded-2xl transition-all hover:bg-slate-700/50 hover:border-slate-600 active:scale-95 group"
              >
                <div className="w-12 h-12 rounded-full bg-slate-900/50 border border-slate-700/50 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:border-teal-500/50 transition-all duration-300">
                  <tool.icon className="h-5 w-5 text-teal-400" />
                </div>
                <span className="text-slate-300 font-bold text-[11px] sm:text-sm group-hover:text-white transition-colors text-center">
                  {tool.title}
                </span>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
