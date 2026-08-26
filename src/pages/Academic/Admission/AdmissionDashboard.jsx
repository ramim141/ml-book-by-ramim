import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Calculator, CalendarDays, ChevronRight, FileText, 
  GraduationCap, LayoutDashboard, Library, Lightbulb, 
  Settings, Target, Trophy, Clock, Search, Zap, Microscope, Globe, Activity, 
  Cpu, School, FlaskConical, Stethoscope, HeartPulse, Compass, Sparkles, Building2, Briefcase, ExternalLink
} from 'lucide-react';

import { useAdmissionPrograms, DEFAULT_ADMISSION_PROGRAMS, useAdmissionExamSchedules } from '../../../hooks/useAdmissionData';

export const ADMISSION_PROGRAMS = DEFAULT_ADMISSION_PROGRAMS;

// Helper to calculate days remaining until exam
function getDaysRemaining(dateStr) {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return null;
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export default function AdmissionDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: admissionPrograms = DEFAULT_ADMISSION_PROGRAMS } = useAdmissionPrograms();
  const { data: examSchedules = [] } = useAdmissionExamSchedules();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const quickActions = [
    { title: 'যোগ্যতা ও চান্স ক্যালকুলেটর', icon: Calculator, path: '/academic/admission/calculator', color: 'from-violet-500 to-indigo-600', shadow: 'shadow-indigo-500/20' },
    { title: 'প্রশ্নব্যাংক', icon: Library, path: '/academic/admission/question-bank', color: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-500/20' },
    { title: 'মডেল টেস্ট', icon: Target, path: '/academic/admission/model-test', color: 'from-fuchsia-500 to-pink-500', shadow: 'shadow-fuchsia-500/20' },
    { title: 'এক্সাম শিডিউল', icon: CalendarDays, path: '/academic/admission/exam-schedule', color: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-500/20' },
    { title: 'শর্টকাট', icon: Zap, path: '/academic/admission/shortcuts', color: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-500/20' },
  ];

  const studyTools = [
    { title: 'ভর্তি যোগ্যতা ক্যালকুলেটর', icon: Calculator, path: '/academic/admission/calculator' },
    { title: 'পর্যায় সারণি', icon: FlaskConical, path: '/academic/periodic-table' },
    { title: 'স্মার্ট ফর্মুলা', icon: BookOpen, path: '/academic/formula-sheet' },
  ];

  const upcomingExams = useMemo(() => {
    return examSchedules
      .filter(s => s.active !== false)
      .map(s => ({ ...s, daysRemaining: getDaysRemaining(s.examDate) }))
      .slice(0, 4);
  }, [examSchedules]);

  const filteredPrograms = useMemo(() => {
    const list = admissionPrograms.filter(p => p.active !== false);
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(p => 
      p.title?.toLowerCase().includes(q) ||
      p.subtitle?.toLowerCase().includes(q) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
    );
  }, [admissionPrograms, searchQuery]);

  return (
    <div className="min-h-screen bg-[#0a0f1c] pb-24 sm:pb-12 pt-4 sm:pt-10 font-bangla selection:bg-rose-500/30 text-slate-100">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
        
        {/* Header Section */}
        <div className="relative">
          <div className="absolute -top-10 -left-10 w-32 sm:w-40 h-32 sm:h-40 bg-rose-500/20 rounded-full blur-[50px] pointer-events-none"></div>
          <div className="absolute top-10 right-0 w-28 sm:w-32 h-28 sm:h-32 bg-orange-500/20 rounded-full blur-[50px] pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] sm:text-xs font-bold mb-2.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ভর্তি প্রস্তুতি হাব ২০২৪-২৫</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-rose-100 to-rose-400 drop-shadow-sm mb-1.5 leading-tight">
              অ্যাডমিশন (Admission)
            </h1>
            <p className="text-slate-400 text-xs sm:text-base font-medium">
              বিশ্ববিদ্যালয়, মেডিকেল, ডেন্টাল, নার্সিং ও ইঞ্জিনিয়ারিং ভর্তি প্রস্তুতি
            </p>
          </div>
          
          {/* Global Search Bar */}
          <div className="mt-4 sm:mt-6 relative z-10">
            <div className="flex items-center bg-slate-900/80 border border-slate-700/60 rounded-2xl p-1.5 sm:p-2 shadow-inner backdrop-blur-md focus-within:border-rose-500/60 focus-within:ring-1 focus-within:ring-rose-500/60 transition-all">
              <div className="pl-2.5 pr-2 flex items-center pointer-events-none">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="মেডিকেল, ডেন্টাল, নার্সিং, বুয়েট, ঢাবি ক, সাস্ট খুঁজুন..."
                className="flex-grow bg-transparent border-none text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-0 py-1.5 sm:py-2 placeholder:text-slate-500 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-white"
                >
                  ক্লিয়ার
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions (Responsive 5-column / 3-column Grid) */}
        <section className="relative z-10">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-200 flex items-center gap-2">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" /> 
              <span>কুইক অ্যাকশন</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
            {quickActions.map((action, idx) => (
              <Link 
                key={idx} 
                to={action.path}
                className={`relative overflow-hidden group rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex flex-col items-center justify-center gap-2 sm:gap-3 bg-gradient-to-br ${action.color} shadow-lg ${action.shadow} transition-all duration-300 hover:scale-[1.03] hover:shadow-xl active:scale-95 ${
                  idx === quickActions.length - 1 ? 'col-span-2 sm:col-span-1' : ''
                }`}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="bg-white/20 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl shadow-inner backdrop-blur-md">
                  <action.icon className="h-5 w-5 sm:h-7 sm:w-7 text-white drop-shadow-md" />
                </div>
                <span className="text-white font-bold text-xs sm:text-sm text-center drop-shadow-md tracking-wide leading-tight">
                  {action.title}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Upcoming Exam Routine Live Marquee Widget */}
        {upcomingExams.length > 0 && (
          <section className="relative z-10 space-y-2.5 sm:space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm sm:text-xl font-bold text-slate-100 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
                <span>আসন্ন ভর্তি পরীক্ষার সময়সূচী</span>
              </h2>
              <Link
                to="/academic/admission/exam-schedule"
                className="text-[11px] sm:text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
              >
                <span>সকল শিডিউল ({examSchedules.length}টি)</span>
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            </div>

            {/* Continuous Smooth Marquee Track */}
            <div className="relative overflow-hidden w-full py-1">
              {/* Left & Right Fade Gradients */}
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 sm:w-16 bg-gradient-to-r from-[#0a0f1c] to-transparent z-20" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 sm:w-16 bg-gradient-to-l from-[#0a0f1c] to-transparent z-20" />

              {/* Marquee Content */}
              <div className="flex w-max gap-3 sm:gap-4 animate-marquee-right hover:[animation-play-state:paused] py-1">
                {[...upcomingExams, ...upcomingExams, ...upcomingExams].map((exam, idx) => (
                  <div
                    key={`${exam.id}-${idx}`}
                    className="w-[250px] sm:w-[320px] shrink-0 bg-slate-900/80 border border-slate-800/90 hover:border-amber-500/50 rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between space-y-2.5 sm:space-y-3 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 backdrop-blur-md"
                  >
                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-[9.5px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60 truncate max-w-[130px] sm:max-w-[150px]">
                          {exam.category}
                        </span>
                        <span className={`text-[9.5px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${exam.statusColor}`}>
                          {exam.statusLabel}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-100 text-xs sm:text-sm leading-snug line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
                        {exam.title}
                      </h3>

                      <div className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1.5 pt-0.5">
                        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
                        <span className="font-semibold text-slate-200 truncate">{exam.examDateBangla || exam.examDate}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      {exam.daysRemaining !== null && exam.daysRemaining >= 0 ? (
                        <span className="text-[10.5px] sm:text-[11px] font-black text-amber-400">
                          {exam.daysRemaining === 0 ? 'আজ পরীক্ষা!' : `${exam.daysRemaining} দিন বাকি`}
                        </span>
                      ) : (
                        <span className="text-[10.5px] sm:text-[11px] text-slate-400">{exam.examTime || 'শীঘ্রই'}</span>
                      )}

                      <Link
                        to="/academic/admission/exam-schedule"
                        className="text-slate-400 hover:text-amber-300 font-bold text-[10.5px] sm:text-[11px] flex items-center gap-0.5 transition-colors"
                      >
                        <span>বিস্তারিত</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Admission Programs / Tracks (মেডিকেল, নার্সিং, বুয়েট, ঢাবি ক, ইত্যাদি) */}
        <section className="relative z-10 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-xl font-bold text-slate-100 flex items-center gap-2">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 text-rose-400" /> 
              <span>ভর্তি প্রস্তুতি প্রোগ্রামসমূহ ({filteredPrograms.length}টি)</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredPrograms.map((program) => (
              <Link 
                key={program.id} 
                to={program.path}
                className="group flex flex-col justify-between bg-slate-900/70 border border-slate-800 hover:border-rose-500/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-slate-800/60 active:scale-[0.98] shadow-lg relative overflow-hidden"
              >
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl sm:text-3xl p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-slate-800/80 border border-slate-700/80 group-hover:scale-110 transition-transform">
                      {program.emoji}
                    </span>
                    <span className={`text-[10px] sm:text-[11px] font-black px-2 sm:px-2.5 py-0.5 rounded-full border ${program.badgeColor}`}>
                      {program.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-slate-100 font-bold text-sm sm:text-lg group-hover:text-rose-300 transition-colors leading-snug">
                      {program.title}
                    </h3>
                    <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed line-clamp-2">
                      {program.subtitle}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 pt-1 sm:pt-2">
                    {program.tags.slice(0, 3).map((tag, tIdx) => (
                      <span key={tIdx} className="text-[9.5px] sm:text-[10px] font-medium bg-slate-800/80 text-slate-400 px-2 py-0.5 rounded-md border border-slate-700/50">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-bold text-rose-400 group-hover:translate-x-0.5 transition-transform">
                  <span className="text-[11px] sm:text-xs">প্রস্তুতি শুরু করুন</span>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-colors">
                    <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Study Tools */}
        <section className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-200 flex items-center gap-2">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-teal-400" /> 
              <span>স্টাডি টুলস</span>
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
            {studyTools.map((tool, idx) => (
              <Link
                key={idx}
                to={tool.path}
                className="flex flex-col items-center justify-center gap-2 sm:gap-3 bg-slate-900/60 border border-slate-800/80 p-3 sm:p-5 rounded-2xl transition-all hover:bg-slate-800/60 hover:border-teal-500/40 active:scale-95 group text-center"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:border-teal-500/50 transition-all duration-300">
                  <tool.icon className="h-4 w-4 sm:h-5 sm:w-5 text-teal-400" />
                </div>
                <span className="text-slate-300 font-bold text-[10.5px] sm:text-sm group-hover:text-white transition-colors leading-tight">
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
