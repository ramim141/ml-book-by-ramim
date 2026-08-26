import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Stethoscope, Dna, FlaskConical, Zap, BookOpen, Globe,
  Target, Clock, Award, ShieldAlert, Sparkles, CheckCircle2,
  ChevronRight, Play, BookMarked, Search, PlusCircle, Layers, HelpCircle, FileText, ChevronDown, BookCheck, BookX
} from 'lucide-react';
import {
  MEDICAL_SUBJECTS_DETAILED,
  MBBS_YEARS,
  BDS_YEARS,
  MEDICAL_MNEMONICS
} from '../../../../data/academic/medicalConfig';
import { useAdmissionSessions, useAdmissionShortcuts, useMedicalConfig } from '../../../../hooks/useAdmissionData';
import { useAuth } from '../../../../contexts/AuthContext';

export default function MedicalDashboard() {
  const { currentUser } = useAuth();
  const { data: dynamicMedicalSubjects = MEDICAL_SUBJECTS_DETAILED } = useMedicalConfig();
  const { data: allSessions = [] } = useAdmissionSessions();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const mbbsSessions = useMemo(() => {
    const list = allSessions.filter(s => s.examType === 'MBBS' && s.active !== false);
    return list.length ? list : MBBS_YEARS;
  }, [allSessions]);

  const bdsSessions = useMemo(() => {
    const list = allSessions.filter(s => s.examType === 'BDS' && s.active !== false);
    return list.length ? list : BDS_YEARS;
  }, [allSessions]);

  const getSubjectIcon = (iconName) => {
    switch (iconName) {
      case 'Dna': return Dna;
      case 'FlaskConical': return FlaskConical;
      case 'Zap': return Zap;
      case 'BookOpen': return BookOpen;
      case 'Globe': return Globe;
      default: return BookOpen;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] pb-24 sm:pb-12 pt-8 font-bangla selection:bg-rose-500/30 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* Navigation & Header */}
        <div>
          <Link
            to="/academic/admission"
            className="inline-flex items-center gap-2 text-rose-400 hover:text-rose-300 text-sm font-semibold transition mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            অ্যাডমিশন সেন্টারে ফিরে যান
          </Link>

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-indigo-950/40 border border-rose-500/20 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
            <div className="absolute -right-10 -top-10 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute right-1/3 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-black tracking-wide">
                <Stethoscope className="w-4 h-4" />
                <span>MBBS & BDS ADMISSION PORTAL</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                মেডিকেল ও ডেন্টাল <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-pink-500">ভর্তি প্রস্তুতি</span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                ১০০ নম্বরের পূর্ণাঙ্গ প্রস্তুতি: বিষয় ও অধ্যায়ভিত্তিক প্রশ্নব্যাংক, পাঠ্যবইয়ের দাগানো লাইনস,
                বিগত ২৫+ বছরের MBBS ও BDS সমাধান, মেডি ছন্দ এবং নেগেটিভ মার্কিংযুক্ত রিয়েল টেস্ট।
              </p>

              {/* Quick Info Stats */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs font-bold text-slate-200">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>সময়: ৬০ মিনিট</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-bold text-rose-400">
                  <ShieldAlert className="w-4 h-4" />
                  <span>নেগেটিভ মার্কিং: -০.২৫</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs font-bold text-indigo-300">
                  <Award className="w-4 h-4 text-indigo-400" />
                  <span>মোট ১০০টি MCQ</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <section className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400" />
              মেডিকেল কুইক অ্যাকশন
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <Link
              to="/academic/admission/medical/past-questions"
              className="relative overflow-hidden group rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl active:scale-95 text-left"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="bg-white/20 p-3 rounded-2xl shadow-inner backdrop-blur-md">
                <BookOpen className="h-7 w-7 sm:h-8 sm:w-8 text-white drop-shadow-md" />
              </div>
              <span className="text-white font-bold text-xs sm:text-sm text-center drop-shadow-md tracking-wide">
                বিগত সালের প্রশ্নব্যাংক
              </span>
            </Link>

            <Link
              to="/academic/admission/medical/model-test"
              className="relative overflow-hidden group rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-fuchsia-500 to-pink-500 shadow-lg shadow-fuchsia-500/20 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl active:scale-95 text-left"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="bg-white/20 p-3 rounded-2xl shadow-inner backdrop-blur-md">
                <Target className="h-7 w-7 sm:h-8 sm:w-8 text-white drop-shadow-md" />
              </div>
              <span className="text-white font-bold text-xs sm:text-sm text-center drop-shadow-md tracking-wide">
                ১০০ নম্বরের মডেল টেস্ট
              </span>
            </Link>

            <Link
              to="/academic/admission/mistakes?program=medical"
              className="relative overflow-hidden group rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/20 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl active:scale-95 text-left"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="bg-white/20 p-3 rounded-2xl shadow-inner backdrop-blur-md">
                <BookX className="h-7 w-7 sm:h-8 sm:w-8 text-white drop-shadow-md" />
              </div>
              <span className="text-white font-bold text-xs sm:text-sm text-center drop-shadow-md tracking-wide">
                মেডিকেল মিসটেক বুক
              </span>
            </Link>

            <Link
              to="/academic/admission/medical/highlighted-lines"
              className="relative overflow-hidden group rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl active:scale-95 text-left"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="bg-white/20 p-3 rounded-2xl shadow-inner backdrop-blur-md">
                <Sparkles className="h-7 w-7 sm:h-8 sm:w-8 text-white drop-shadow-md" />
              </div>
              <span className="text-white font-bold text-xs sm:text-sm text-center drop-shadow-md tracking-wide">
                দাগানো লাইনস ও বিষয়
              </span>
            </Link>

            <Link
              to="/academic/admission/medical/mnemonics"
              className="relative overflow-hidden group rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl active:scale-95 text-left"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="bg-white/20 p-3 rounded-2xl shadow-inner backdrop-blur-md">
                <Zap className="h-7 w-7 sm:h-8 sm:w-8 text-white drop-shadow-md" />
              </div>
              <span className="text-white font-bold text-xs sm:text-sm text-center drop-shadow-md tracking-wide">
                মেডি ছন্দ ও ট্রিকস
              </span>
            </Link>
          </div>
        </section>

        {/* 1. Marks Weightage & Subject Quick Grid */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-rose-400" />
              <span>মেডিকেল ও ডেন্টাল বিষয়সমূহ ও নম্বর বণ্টন ({dynamicMedicalSubjects.length}টি বিষয়)</span>
            </h2>

            <div className="flex items-center gap-2">
              <Link
                to="/academic/admission/medical/highlighted-lines"
                className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
              >
                সকল দাগানো লাইন দেখুন <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {dynamicMedicalSubjects.map((item) => {
              const Icon = getSubjectIcon(item.icon);
              return (
                <Link
                  key={item.id}
                  to={`/academic/admission/medical/${item.id}`}
                  className="rounded-2xl border p-4 transition-all duration-300 text-left flex flex-col justify-between group shadow-lg bg-slate-900/60 border-slate-800/80 hover:border-rose-500/40 hover:bg-slate-800/60 hover:-translate-y-0.5"
                >
                  <div className="space-y-3 w-full">
                    <div className="flex items-center justify-between">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${item.color} text-white shadow-md group-hover:scale-105 transition-transform`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xl font-black font-mono px-2.5 py-0.5 rounded-lg border bg-slate-800/80 text-white border-slate-700 group-hover:border-rose-500/30 group-hover:text-rose-300 transition-colors">
                        {item.marks}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-100 group-hover:text-rose-300 transition-colors truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{item.subTitle}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/60 mt-3 flex items-center justify-between w-full text-xs">
                    <span className="text-slate-400">{item.chapters?.length || 0}টি অধ্যায়</span>
                    <span className="text-rose-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      প্রবেশ করুন <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 2. Smart Analytics, Daily Drill & Strategy Hub */}
        <section id="medical-content-section" className="space-y-6 pt-2 scroll-mt-20">

          {/* 2-Column Grid: Left (Analytics & Daily Drill) | Right (Milestones & Strategy) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left 2 Columns */}
            <div className="lg:col-span-2 space-y-6">

              {/* Daily 10-Q Speed Drill Card */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-rose-950/30 border border-slate-800 p-6 sm:p-7 shadow-2xl space-y-4">
                <div className="absolute right-0 top-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[11px] font-black">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>DAILY MEDICAL DRILL</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">দৈনিক ১০ প্রশ্নের স্পিড ড্রিল</h3>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
                      বিগত ২৫ বছরের মেডিকেল ও ডেন্টাল প্রশ্নব্যাংক থেকে ১০টি হাই-ইয়েল্ড প্রশ্ন নিয়ে প্রতিদিন নিজের প্রস্তুতি যাচাই করুন।
                    </p>
                  </div>

                  <Link
                    to={`/academic/admission/medical/exam/MBBS/2023-2024?mode=practice&count=10&duration=6&drill=true&rnd=${Date.now()}`}
                    className="shrink-0 px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-rose-600/25 active:scale-95 transition flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    ১০-প্রশ্ন ড্রিল শুরু করুন (৬ মিনিট)
                  </Link>
                </div>

                {/* Quick Subject Chips in Drill */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2 flex-wrap text-xs text-slate-400">
                  <span className="font-bold text-slate-300">ইনক্লুডেড বিষয়:</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">বায়োলজি (৩০)</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">রসায়ন (২৫)</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">পদার্থ (২০)</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">ইংরেজি (১৫)</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">জিকে (১০)</span>
                </div>
              </div>

              {/* Marks Weightage Distribution Card */}
              <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>মেডিকেল বিষয়ভিত্তিক নম্বর বণ্টন ও ওয়েটেজ</span>
                  </h3>
                  <span className="text-xs font-mono font-bold text-slate-400">মোট ১০০ নম্বর</span>
                </div>

                {/* Progress Bar of Weightage */}
                <div className="w-full h-3.5 rounded-full bg-slate-800 flex overflow-hidden p-0.5 gap-0.5 shadow-inner">
                  <div style={{ width: '30%' }} className="h-full rounded-sm bg-emerald-500" title="জীববিজ্ঞান: ৩০ নম্বর" />
                  <div style={{ width: '25%' }} className="h-full rounded-sm bg-rose-500" title="রসায়ন: ২৫ নম্বর" />
                  <div style={{ width: '20%' }} className="h-full rounded-sm bg-blue-500" title="পদার্থবিজ্ঞান: ২০ নম্বর" />
                  <div style={{ width: '15%' }} className="h-full rounded-sm bg-amber-500" title="ইংরেজি: ১৫ নম্বর" />
                  <div style={{ width: '10%' }} className="h-full rounded-sm bg-teal-500" title="সাধারণ জ্ঞান: ১০ নম্বর" />
                </div>

                {/* Subject Badges with percentages */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">জীববিজ্ঞান</span>
                    <span className="text-xs font-black font-mono text-emerald-400">৩০</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">রসায়ন</span>
                    <span className="text-xs font-black font-mono text-rose-400">২৫</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">পদার্থবিজ্ঞান</span>
                    <span className="text-xs font-black font-mono text-blue-400">২০</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">ইংরেজি</span>
                    <span className="text-xs font-black font-mono text-amber-400">১৫</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">সাধারণ জ্ঞান</span>
                    <span className="text-xs font-black font-mono text-teal-400">১০</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Milestones & Exam Strategy */}
            <div className="space-y-6">

              {/* Target Milestones Checklist */}
              <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4 shadow-xl">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BookCheck className="w-4 h-4 text-rose-400" />
                  <span>মেডিকেল প্রস্তুতি চেকলিস্ট</span>
                </h3>

                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <span className="w-5 h-5 rounded-lg bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <div>
                      <strong className="text-slate-100 block">বিগত ২৫ বছরের প্রশ্ন সলভ</strong>
                      <span className="text-slate-400 text-[11px]">MBBS ও BDS আসল প্রশ্ন প্র্যাকটিস</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <span className="w-5 h-5 rounded-lg bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <div>
                      <strong className="text-slate-100 block">পাঠ্যবইয়ের দাগানো লাইন রিভিশন</strong>
                      <span className="text-slate-400 text-[11px]">আজমল, হাসান ও কবির স্যারের বইয়ের নোটস</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <span className="w-5 h-5 rounded-lg bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <div>
                      <strong className="text-slate-100 block">পূর্ণাঙ্গ ১০০ নম্বরের মডেল টেস্ট</strong>
                      <span className="text-slate-400 text-[11px]">৬০ মিনিটে নেগেটিভ মার্কিং সহ এক্সাম</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <span className="w-5 h-5 rounded-lg bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
                    <div>
                      <strong className="text-slate-100 block">মেডি ছন্দ ও ট্রিকস রিভিশন</strong>
                      <span className="text-slate-400 text-[11px]">কনফিউজিং টপিক দ্রুত মনে রাখার উপায়</span>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Golden Strategy Rules */}
              <div className="rounded-3xl bg-gradient-to-br from-rose-950/20 to-slate-900 border border-rose-500/25 p-5 space-y-3 shadow-lg">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                  <Zap className="w-4 h-4" />
                  <span>এক্সাম হল টাইম ও স্ট্র্যাটেজি টিপস</span>
                </div>
                <div className="space-y-2 text-[11px] text-slate-300 leading-relaxed">
                  <p>• <strong>প্রতি প্রশ্নে ৩৬ সেকেন্ড:</strong> বায়োলজি ও জিকে দ্রুত উত্তর করে ফিজিক্স ও কেমিস্ট্রি ক্যালকুলেশনের সময় বাঁচান।</p>
                  <p>• <strong>নেগেটিভ মার্কিং:</strong> প্রতিটি ভুলের জন্য ০.২৫ কাটা যাবে। শতভাগ নিশ্চিত না হলে দাগাবেন না।</p>
                  <p>• <strong>কাট-অফ লক্ষ্য:</strong> সরকারি মেডিকেলের জন্য ৭২-৭৫+ নম্বর নিরাপদ স্কোর।</p>
                </div>
              </div>

            </div>

          </div>

        </section>

      </div>
    </div>
  );
}
