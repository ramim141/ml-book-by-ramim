import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays, Clock, ArrowLeft, Search, ExternalLink,
  ShieldAlert, Award, Sparkles, Building2, CheckCircle2,
  Bell, Filter, AlertCircle, ChevronRight, Zap, Target, BookOpen
} from 'lucide-react';
import { useAdmissionExamSchedules } from '../../../../hooks/useAdmissionData';

// Helper to calculate days remaining until exam
function getDaysRemaining(dateStr) {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return null;
  const now = new Date();
  // reset time to midnight for clean day calculation
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export default function ExamSchedulePage() {
  const { data: schedules = [] } = useAdmissionExamSchedules();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const activeSchedules = useMemo(() => {
    return schedules.filter(s => s.active !== false);
  }, [schedules]);

  const filteredSchedules = useMemo(() => {
    return activeSchedules.filter(s => {
      const matchCat = selectedCategory === 'all' || s.category === selectedCategory || s.program === selectedCategory;
      const matchSearch = !searchQuery.trim() ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.badge?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeSchedules, selectedCategory, searchQuery]);

  // Featured upcoming exams (those with a future examDate)
  const featuredExams = useMemo(() => {
    return activeSchedules
      .map(s => ({ ...s, daysRemaining: getDaysRemaining(s.examDate) }))
      .filter(s => s.daysRemaining !== null && s.daysRemaining >= 0)
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .slice(0, 4);
  }, [activeSchedules]);

  return (
    <div className="min-h-screen bg-[#070d1e] pb-24 sm:pb-16 pt-6 font-bangla selection:bg-amber-500/30 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">

        {/* Navigation & Header */}
        <div>
          <Link
            to="/academic/admission"
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm font-semibold transition mb-3 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            অ্যাডমিশন সেন্টারে ফিরে যান
          </Link>

          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-orange-950/50 border border-amber-500/25 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
            <div className="absolute -right-10 -top-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute right-1/3 -bottom-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black tracking-wide">
                <CalendarDays className="w-4 h-4" />
                <span>ADMISSION EXAM ROUTINE & DEADLINES</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                ভর্তি পরীক্ষার <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-400">সময়সূচী ও রুটিন</span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                মেডিকেল, ডেন্টাল, নার্সিং, বুয়েট, ঢাবি ‘ক’ ইউনিট ও গুচ্ছ বিশ্ববিদ্যালয় ভর্তি পরীক্ষার অফিসিয়াল সময়সূচী, আবেদনের ডেডলাইন, প্রবেশপত্র প্রকাশের তারিখ ও পরীক্ষার কেন্দ্র সংক্রান্ত সকল তথ্য।
              </p>
            </div>
          </div>
        </div>

        {/* ── Featured Countdown Cards ────────────────────────────────────── */}
        {featuredExams.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>আসন্ন শীর্ষ পরীক্ষাসমূহ ও কাউন্টডাউন</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredExams.map((exam) => (
                <div
                  key={exam.id}
                  className="group relative overflow-hidden rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 p-5 transition-all duration-300 hover:-translate-y-1 shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        {exam.daysRemaining === 0 ? 'আজকে পরীক্ষা!' : `আর মাত্র ${exam.daysRemaining} দিন বাকি`}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${exam.statusColor}`}>
                        {exam.statusLabel}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-100 text-sm sm:text-base leading-snug group-hover:text-amber-300 transition-colors">
                      {exam.title}
                    </h3>

                    <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
                      <CalendarDays className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{exam.examDateBangla || exam.examDate}</span>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">{exam.examTime}</span>
                    {exam.officialUrl && (
                      <a
                        href={exam.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                      >
                        <span>নোটিশ</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Search & Filter Controls ───────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="পরীক্ষার নাম বা প্রতিষ্ঠান খুঁজুন..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50"
            />
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {[
              { id: 'all', label: 'সব' },
              { id: 'মেডিকেল ও ডেন্টাল', label: '🩺 মেডিকেল' },
              { id: 'নার্সিং', label: '🏥 নার্সিং' },
              { id: 'প্রকৌশল ও প্রযুক্তি', label: '⚙️ ইঞ্জিনিয়ারিং' },
              { id: 'বিশ্ববিদ্যালয়', label: '🔬 ঢাবি / ভার্সিটি' },
              { id: 'গুচ্ছ বিশ্ববিদ্যালয়', label: '🌐 গুচ্ছ (GST)' },
              { id: 'কৃষি বিশ্ববিদ্যালয়', label: '🌾 কৃষি গুচ্ছ' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition active:scale-95 ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Detailed Exam Schedule Cards ───────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-amber-400" />
              <span>সকল ভর্তি পরীক্ষার তালিকা ({filteredSchedules.length}টি)</span>
            </h2>
          </div>

          {filteredSchedules.length === 0 ? (
            <div className="py-20 text-center bg-slate-900/40 rounded-3xl border border-slate-800 text-slate-400">
              কোনো ভর্তি পরীক্ষার সময়সূচী পাওয়া যায়নি।
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredSchedules.map((item) => {
                const days = getDaysRemaining(item.examDate);
                return (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-2xl"
                  >
                    <div className="space-y-4">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-black px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700/80">
                            {item.category}
                          </span>
                          <span className={`text-xs font-black px-3 py-1 rounded-full border ${item.statusColor || 'bg-blue-500/15 text-blue-300 border-blue-500/30'}`}>
                            {item.statusLabel}
                          </span>
                        </div>

                        {days !== null && days >= 0 && (
                          <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {days === 0 ? 'আজকে' : `${days} দিন বাকি`}
                          </span>
                        )}
                      </div>

                      {/* Title & Badge */}
                      <div>
                        <h3 className="text-lg sm:text-xl font-black text-white leading-snug">
                          {item.title}
                        </h3>
                        {item.badge && (
                          <p className="text-xs font-semibold text-amber-400/90 mt-1">
                            {item.badge}
                          </p>
                        )}
                        {item.description && (
                          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Important Timings Matrix */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                        <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50 space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
                            <CalendarDays className="w-3.5 h-3.5 text-amber-400" />
                            <span>পরীক্ষার তারিখ</span>
                          </div>
                          <div className="font-bold text-slate-100 text-xs sm:text-sm">
                            {item.examDateBangla || item.examDate || 'ঘোষণা হয়নি'}
                          </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50 space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
                            <Clock className="w-3.5 h-3.5 text-cyan-400" />
                            <span>পরীক্ষার সময় ও নম্বর</span>
                          </div>
                          <div className="font-bold text-slate-100 text-xs sm:text-sm">
                            {item.examTime || item.totalMarks || '১ ঘণ্টা'}
                          </div>
                        </div>

                        {item.applicationStart && (
                          <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/40 space-y-1">
                            <span className="text-[11px] text-slate-400 block font-medium">আবেদনের সময়সীমা</span>
                            <span className="font-semibold text-slate-200 block text-xs">
                              {item.applicationStart} থেকে {item.applicationEnd || '—'}
                            </span>
                          </div>
                        )}

                        {item.admitCardDate && (
                          <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/40 space-y-1">
                            <span className="text-[11px] text-slate-400 block font-medium">প্রবেশপত্র ও ফলাফল</span>
                            <span className="font-semibold text-slate-200 block text-xs">
                              প্রবেশপত্র: {item.admitCardDate}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Notice Box */}
                      {item.noticeText && (
                        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                          <strong className="text-amber-400 font-bold">নম্বর বণ্টন ও নির্দেশিকা: </strong>
                          {item.noticeText}
                        </div>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-800/80 text-xs text-slate-400">
                      <div>
                        <span>যোগ্যতা: </span>
                        <strong className="text-slate-200">{item.minGpa || '—'}</strong>
                      </div>

                      <div className="flex items-center gap-3">
                        {item.officialUrl && (
                          <a
                            href={item.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold transition"
                          >
                            <span>অফিসিয়াল ওয়েবসাইট</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
