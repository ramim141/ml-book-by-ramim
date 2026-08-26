import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, HeartPulse, Stethoscope, Dna, FlaskConical, Zap,
  BookOpen, Globe, Target, Clock, Award, ShieldAlert, Sparkles,
  CheckCircle2, ChevronRight, ChevronLeft, Play, Search, Layers, ChevronDown,
  BookCheck, Baby, FileText, Check, BookX
} from 'lucide-react';
import {
  NURSING_TRACKS,
  NURSING_SUBJECTS_CONFIG,
  NURSING_DEFAULT_SESSIONS,
  NURSING_MNEMONICS
} from '../../../../data/academic/nursingConfig';
import { useAdmissionSessions, useAdmissionShortcuts } from '../../../../hooks/useAdmissionData';

export default function NursingTrackDashboard() {
  const { trackId = 'bsc' } = useParams();
  const navigate = useNavigate();
  const subjectRowRef = useRef(null);

  const [activeTab, setActiveTab] = useState('subjects'); // 'subjects' | 'sessions' | 'mnemonics' | 'mock'
  const [selectedSubjectId, setSelectedSubjectId] = useState('nur-biology');
  const [expandedChapterId, setExpandedChapterId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const checkScroll = () => {
    if (subjectRowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = subjectRowRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

      // Estimate active slide
      const firstChild = subjectRowRef.current.children[0];
      const cardWidth = firstChild ? firstChild.getBoundingClientRect().width + 12 : 240;
      const index = Math.round(scrollLeft / cardWidth);
      setActiveSlideIndex(Math.max(0, index));
    }
  };

  const scrollSubjects = (direction) => {
    if (subjectRowRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      subjectRowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScroll, 350);
    }
  };

  const scrollToIndex = (index) => {
    if (subjectRowRef.current && subjectRowRef.current.children[index]) {
      subjectRowRef.current.children[index].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
      setActiveSlideIndex(index);
    }
  };

  const handleQuickAction = (tabKey) => {
    setActiveTab(tabKey);
    const contentEl = document.getElementById('nursing-content-section');
    if (contentEl) {
      contentEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const { data: allSessions = [] } = useAdmissionSessions();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [trackId]);

  useEffect(() => {
    // Check initial scroll state
    const timer = setTimeout(checkScroll, 200);
    window.addEventListener('resize', checkScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkScroll);
    };
  }, [trackId]);

  const currentTrack = useMemo(() => {
    return NURSING_TRACKS.find(t => t.id === trackId) || NURSING_TRACKS[0];
  }, [trackId]);

  // Track-specific subjects filter
  const trackSubjects = useMemo(() => {
    return NURSING_SUBJECTS_CONFIG.filter(s =>
      s.applicableTracks.includes(currentTrack.id)
    );
  }, [currentTrack]);

  // Track-specific sessions
  const trackSessions = useMemo(() => {
    const examName =
      currentTrack.id === 'bsc' ? 'BSc Nursing' :
        currentTrack.id === 'diploma' ? 'Diploma in Nursing' : 'Midwifery';

    const liveMatches = allSessions.filter(s =>
      s.examType === examName || s.examType?.toLowerCase().includes(currentTrack.id)
    );

    if (liveMatches.length > 0) return liveMatches;
    return NURSING_DEFAULT_SESSIONS.filter(s => s.examType === examName);
  }, [allSessions, currentTrack]);

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

  const TrackIcon = currentTrack.id === 'bsc' ? Stethoscope : currentTrack.id === 'diploma' ? HeartPulse : Baby;

  return (
    <div className="min-h-screen bg-[#0a0f1c] pb-24 sm:pb-12 pt-4 sm:pt-8 font-bangla selection:bg-emerald-500/30 text-slate-100">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">

        {/* Navigation & Header */}
        <div>
          <Link
            to="/academic/admission/nursing"
            className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 text-xs sm:text-sm font-semibold transition mb-3 sm:mb-4 group"
          >
            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:-translate-x-1 transition-transform" />
            <span>নার্সিং সেন্টারে ফিরে যান</span>
          </Link>

          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-teal-950/40 border border-emerald-500/25 p-4 sm:p-8 lg:p-10 shadow-2xl backdrop-blur-xl">
            <div className="absolute -right-10 -top-10 w-48 sm:w-72 h-48 sm:h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute right-1/3 -bottom-10 w-48 sm:w-64 h-48 sm:h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-2.5 sm:space-y-4">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10.5px] sm:text-xs font-black tracking-wide">
                  <TrackIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{currentTrack.shortName.toUpperCase()} ADMISSION PORTAL</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                {currentTrack.name} <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">ভর্তি প্রস্তুতি</span>
              </h1>

              <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
                ১০০ নম্বরের পূর্ণাঙ্গ প্রস্তুতি: বিষয় ও অধ্যায়ভিত্তিক প্রশ্নব্যাংক, পাঠ্যবইয়ের দাগানো লাইনস,
                বিগত সালের আসল সমাধান, নার্সিং ছন্দ এবং নেগেটিভ মার্কিংযুক্ত রিয়েল টেস্ট।
              </p>

              {/* Quick Info Stats */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1 sm:pt-2">
                <div className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-[10.5px] sm:text-xs font-bold text-slate-200">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>সময়: {currentTrack.examDuration}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-[10.5px] sm:text-xs font-bold text-rose-400">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>নেগেটিভ মার্কিং: -০.২৫</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[10.5px] sm:text-xs font-bold text-emerald-300">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span>মোট ১০০টি MCQ</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Quick Action Cards (Responsive 5-column / 3-column / 2-column Grid) ────────────────── */}
        <section className="relative z-10">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-200 flex items-center gap-2">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
              <span>{currentTrack.shortName} কুইক অ্যাকশন</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
            {/* 1. Past Question Bank → Dedicated Page */}
            <Link
              to={`/academic/admission/nursing/${trackId}/past-questions`}
              className="relative overflow-hidden group rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex flex-col items-center justify-center gap-2 sm:gap-3 bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl active:scale-95 text-center"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="bg-white/20 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl shadow-inner backdrop-blur-md">
                <BookOpen className="h-5 w-5 sm:h-7 sm:w-7 text-white drop-shadow-md" />
              </div>
              <span className="text-white font-bold text-xs sm:text-sm text-center drop-shadow-md tracking-wide leading-tight">
                বিগত সালের প্রশ্নব্যাংক
              </span>
            </Link>

            {/* 2. 100 Marks Model Test → Dedicated Page */}
            <Link
              to={`/academic/admission/nursing/${trackId}/model-test`}
              className="relative overflow-hidden group rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex flex-col items-center justify-center gap-2 sm:gap-3 bg-gradient-to-br from-fuchsia-500 to-pink-500 shadow-lg shadow-fuchsia-500/20 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl active:scale-95 text-center"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="bg-white/20 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl shadow-inner backdrop-blur-md">
                <Target className="h-5 w-5 sm:h-7 sm:w-7 text-white drop-shadow-md" />
              </div>
              <span className="text-white font-bold text-xs sm:text-sm text-center drop-shadow-md tracking-wide leading-tight">
                ১০০ নম্বরের মডেল টেস্ট
              </span>
            </Link>

            {/* 3. Nursing Mistake Book */}
            <Link
              to="/academic/admission/mistakes?program=nursing"
              className="relative overflow-hidden group rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex flex-col items-center justify-center gap-2 sm:gap-3 bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/20 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl active:scale-95 text-center"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="bg-white/20 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl shadow-inner backdrop-blur-md">
                <BookX className="h-5 w-5 sm:h-7 sm:w-7 text-white drop-shadow-md" />
              </div>
              <span className="text-white font-bold text-xs sm:text-sm text-center drop-shadow-md tracking-wide leading-tight">
                নার্সিং মিসটেক বুক
              </span>
            </Link>

            {/* 4. Highlighted Lines & Subjects → Dedicated Page */}
            <Link
              to={`/academic/admission/nursing/${trackId}/highlighted-lines`}
              className="relative overflow-hidden group rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex flex-col items-center justify-center gap-2 sm:gap-3 bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl active:scale-95 text-center"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="bg-white/20 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl shadow-inner backdrop-blur-md">
                <Sparkles className="h-5 w-5 sm:h-7 sm:w-7 text-white drop-shadow-md" />
              </div>
              <span className="text-white font-bold text-xs sm:text-sm text-center drop-shadow-md tracking-wide leading-tight">
                দাগানো লাইনস ও বিষয়
              </span>
            </Link>

            {/* 5. Mnemonics & Tricks → Dedicated Page */}
            <Link
              to={`/academic/admission/nursing/${trackId}/mnemonics`}
              className="relative overflow-hidden group rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex flex-col items-center justify-center gap-2 sm:gap-3 bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl active:scale-95 text-center col-span-2 sm:col-span-1"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="bg-white/20 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl shadow-inner backdrop-blur-md">
                <Zap className="h-5 w-5 sm:h-7 sm:w-7 text-white drop-shadow-md" />
              </div>
              <span className="text-white font-bold text-xs sm:text-sm text-center drop-shadow-md tracking-wide leading-tight">
                নার্সিং ছন্দ ও ট্রিকস
              </span>
            </Link>
          </div>
        </section>

        {/* ── 1. Marks Weightage & Subject Quick Grid / Slider ─────────────────────── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2.5">
            <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
              <span>বিষয়সমূহ ও নম্বর বণ্টন ({trackSubjects.length}টি)</span>
              <span className="text-[10px] sm:text-xs font-normal text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 hidden xs:inline-flex items-center gap-1">
                সোয়াইপ করুন ↔
              </span>
            </h2>

            <Link
              to={`/academic/admission/nursing/${trackId}/highlighted-lines`}
              className="text-[11px] sm:text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 shadow-sm shrink-0"
            >
              <span>সকল দাগানো লাইন</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Interactive Subject Slider Container with Floating Side Buttons */}
          <div className="relative group/slider">
            {/* Left Floating Arrow Button */}
            {canScrollLeft && (
              <button
                type="button"
                onClick={() => scrollSubjects('left')}
                className="hidden md:flex absolute -left-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-900/95 border border-emerald-500/50 text-emerald-300 shadow-xl items-center justify-center backdrop-blur-md hover:bg-emerald-600 hover:text-white transition-all hover:scale-110 active:scale-95"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {/* Right Floating Arrow Button */}
            {canScrollRight && (
              <button
                type="button"
                onClick={() => scrollSubjects('right')}
                className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-900/95 border border-emerald-500/50 text-emerald-300 shadow-xl items-center justify-center backdrop-blur-md hover:bg-emerald-600 hover:text-white transition-all hover:scale-110 active:scale-95"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {/* Edge Fade Gradients */}
            {canScrollLeft && (
              <div className="absolute left-0 top-0 bottom-0 w-6 sm:w-8 bg-gradient-to-r from-[#0a0f1c] to-transparent pointer-events-none z-10 rounded-l-2xl" />
            )}
            {canScrollRight && (
              <div className="absolute right-0 top-0 bottom-0 w-6 sm:w-8 bg-gradient-to-l from-[#0a0f1c] to-transparent pointer-events-none z-10 rounded-r-2xl" />
            )}

            {/* Single Row Horizontal Strip */}
            <div
              ref={subjectRowRef}
              onScroll={checkScroll}
              className="flex items-stretch gap-3 sm:gap-3.5 overflow-x-auto pb-2 pt-1 no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth snap-x snap-mandatory"
            >
              {trackSubjects.map((item) => {
                const Icon = getSubjectIcon(item.icon);
                return (
                  <Link
                    key={item.id}
                    to={`/academic/admission/nursing/${trackId}/${item.id}`}
                    className="w-56 sm:w-72 shrink-0 snap-start rounded-2xl border p-3.5 sm:p-4 transition-all duration-300 text-left flex flex-col justify-between group shadow-md bg-slate-900/70 border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-800/60 hover:-translate-y-0.5"
                  >
                    <div className="space-y-2.5 w-full">
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-xl bg-gradient-to-br ${item.color} text-white shadow-md group-hover:scale-105 transition-transform`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-black font-mono px-2.5 py-0.5 rounded-lg border bg-slate-800/80 text-white border-slate-700 group-hover:border-emerald-500/30 group-hover:text-emerald-300 transition-colors">
                          {item.marks}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-100 group-hover:text-emerald-300 transition-colors truncate">
                          {item.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">{item.subTitle}</p>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-800/60 mt-2.5 flex items-center justify-between w-full text-xs">
                      <span className="text-slate-400 text-[10.5px] sm:text-[11px]">{item.chapters?.length || 0}টি অধ্যায়</span>
                      <span className="text-emerald-400 font-bold text-[10.5px] sm:text-[11px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        প্রবেশ করুন <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* ── Visual Pagination Dots to indicate scrollable cards ─────────────── */}
            <div className="flex items-center justify-center gap-1.5 pt-2">
              {trackSubjects.map((s, idx) => {
                const isActive = Math.min(activeSlideIndex, trackSubjects.length - 1) === idx;
                return (
                  <button
                    key={s.id || idx}
                    type="button"
                    onClick={() => scrollToIndex(idx)}
                    aria-label={`Slide ${idx + 1} - ${s.name}`}
                    className={`h-2 transition-all duration-300 rounded-full ${
                      isActive
                        ? 'w-6 bg-gradient-to-r from-emerald-400 to-teal-400 shadow-sm shadow-emerald-500/50'
                        : 'w-2 bg-slate-700/80 hover:bg-slate-500'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 2. Smart Analytics, Daily Drill & Strategy Hub ───────────────────── */}
        <section id="nursing-content-section" className="space-y-5 sm:space-y-6 pt-1 sm:pt-2 scroll-mt-20">

          {/* 2-Column Grid: Left (Analytics & Daily Drill) | Right (Milestones & Strategy) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

            {/* Left 2 Columns */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">

              {/* Daily 10-Q Speed Drill Card */}
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/30 border border-slate-800 p-4 sm:p-7 shadow-2xl space-y-3.5 sm:space-y-4">
                <div className="absolute right-0 top-0 w-48 sm:w-64 h-48 sm:h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 relative z-10">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10.5px] sm:text-[11px] font-black">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>DAILY QUICK DRILL</span>
                    </div>
                    <h3 className="text-lg sm:text-2xl font-black text-white">দৈনিক ১০ প্রশ্নের স্পিড ড্রিল</h3>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
                      বিগত নার্সিং পরীক্ষার প্রশ্নব্যাংক থেকে ১০টি র‍্যান্ডম হাই-ইয়েল্ড প্রশ্ন নিয়ে প্রতিদিন নিজের প্রস্তুতি ঝালাই করুন।
                    </p>
                  </div>

                  <Link
                    to={`/academic/admission/medical/exam/${encodeURIComponent(currentTrack.shortName)}/${trackSessions[0]?.session || '2023-2024'}?mode=practice&count=10&duration=6&drill=true&rnd=${Date.now()}`}
                    className="w-full sm:w-auto shrink-0 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 active:scale-95 transition flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>১০-প্রশ্ন ড্রিল শুরু করুন (৬ মিনিট)</span>
                  </Link>
                </div>

                {/* Quick Subject Chips in Drill */}
                <div className="pt-2.5 sm:pt-3 border-t border-slate-800/80 flex items-center gap-1.5 sm:gap-2 flex-wrap text-xs text-slate-400">
                  <span className="font-bold text-slate-300 text-[11px] sm:text-xs">ইনক্লুডেড বিষয়:</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[10px] sm:text-[11px]">বাংলা</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[10px] sm:text-[11px]">ইংরেজি</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[10px] sm:text-[11px]">বিজ্ঞান</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[10px] sm:text-[11px]">সাধারণ জ্ঞান</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[10px] sm:text-[11px]">গণিত</span>
                </div>
              </div>

              {/* Marks Weightage Distribution Card */}
              <div className="rounded-2xl sm:rounded-3xl bg-slate-900/80 border border-slate-800 p-4 sm:p-6 space-y-3.5 sm:space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>বিষয়ভিত্তিক নম্বর ও প্রায়োরিটি ওয়েটেজ</span>
                  </h3>
                  <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-400">মোট ১০০ নম্বর</span>
                </div>

                {/* Progress Bar of Weightage */}
                <div className="w-full h-3 sm:h-3.5 rounded-full bg-slate-800 flex overflow-hidden p-0.5 gap-0.5 shadow-inner">
                  {currentTrack.marksDistribution.map((m, idx) => (
                    <div
                      key={idx}
                      style={{ width: `${m.marks}%` }}
                      className={`h-full rounded-sm ${idx === 0 ? 'bg-amber-400' :
                          idx === 1 ? 'bg-sky-400' :
                            idx === 2 ? 'bg-purple-400' :
                              idx === 3 ? 'bg-rose-400' :
                                idx === 4 ? 'bg-emerald-400' :
                                  idx === 5 ? 'bg-indigo-400' : 'bg-teal-400'
                        }`}
                      title={`${m.subject}: ${m.marks} নম্বর`}
                    />
                  ))}
                </div>

                {/* Subject Badges with percentages */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5 pt-1 sm:pt-2">
                  {currentTrack.marksDistribution.map((m, idx) => (
                    <div key={idx} className="p-2 sm:p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                      <span className="text-[11px] sm:text-xs font-bold text-slate-200">{m.subject}</span>
                      <span className={`text-[11px] sm:text-xs font-black font-mono ${m.color}`}>{m.marks} মার্কস</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Milestones & Exam Strategy */}
            <div className="space-y-4 sm:space-y-6">

              {/* Target Milestones Checklist */}
              <div className="rounded-2xl sm:rounded-3xl bg-slate-900/80 border border-slate-800 p-4 sm:p-6 space-y-3.5 sm:space-y-4 shadow-xl">
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <BookCheck className="w-4 h-4 text-emerald-400" />
                  <span>ভর্তি প্রস্তুতি চেকলিস্ট</span>
                </h3>

                <ul className="space-y-2.5 sm:space-y-3 text-xs text-slate-300">
                  <li className="flex items-start gap-2.5 p-2 sm:p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <span className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 mt-0.5 text-xs">1</span>
                    <div>
                      <strong className="text-slate-100 block text-xs">বিগত সালের প্রশ্ন সলভ</strong>
                      <span className="text-slate-400 text-[10.5px]">আসল প্রশ্ন প্র্যাকটিস ও ওএমআর টেস্ট</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5 p-2 sm:p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <span className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 mt-0.5 text-xs">2</span>
                    <div>
                      <strong className="text-slate-100 block text-xs">দাগানো লাইন রিভিশন</strong>
                      <span className="text-slate-400 text-[10.5px]">মূল বইয়ের হাই-ইয়েল্ড পয়েন্টসমূহ</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5 p-2 sm:p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <span className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 mt-0.5 text-xs">3</span>
                    <div>
                      <strong className="text-slate-100 block text-xs">পূর্ণাঙ্গ ১০০ নম্বরের মডেল টেস্ট</strong>
                      <span className="text-slate-400 text-[10.5px]">৬০ মিনিটে নেগেটিভ মার্কিং সহ এক্সাম</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5 p-2 sm:p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <span className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 mt-0.5 text-xs">4</span>
                    <div>
                      <strong className="text-slate-100 block text-xs">ছন্দ ও সাধারণ জ্ঞান শর্টকাট</strong>
                      <span className="text-slate-400 text-[10.5px]">দ্রুত মনে রাখার জন্য স্পেশাল ট্রিকস</span>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Golden Strategy Rules */}
              <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-950/20 to-slate-900 border border-amber-500/25 p-4 sm:p-5 space-y-2.5 sm:space-y-3 shadow-lg">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Zap className="w-4 h-4" />
                  <span>এক্সাম হল টাইম ও স্ট্র্যাটেজি টিপস</span>
                </div>
                <div className="space-y-1.5 sm:space-y-2 text-[10.5px] sm:text-[11px] text-slate-300 leading-relaxed">
                  <p>• <strong>প্রতি প্রশ্নে ৩৬ সেকেন্ড:</strong> কোনো প্রশ্নে আটকে গেলে স্কিপ করে পরেরটিতে যান।</p>
                  <p>• <strong>নেগেটিভ মার্কিং:</strong> প্রতিটি ভুলের জন্য ০.২৫ কাটা যাবে। আন্দাজে দাগানো থেকে বিরত থাকুন।</p>
                  <p>• <strong>কাট-অফ লক্ষ্য:</strong> সরকারি নার্সিং কলেজের জন্য ৭৫+ নিরাপদ স্কোর।</p>
                </div>
              </div>

            </div>

          </div>

        </section>

      </div>
    </div>
  );
}
