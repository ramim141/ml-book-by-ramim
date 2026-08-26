import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, Play, Clock, ShieldAlert, Search,
  Filter, ChevronRight, Calendar, FileText, Stethoscope,
  HeartPulse, Cpu, BookMarked, FlaskConical, Sprout, GraduationCap, Baby,
  CheckCircle2, Layers, Download
} from 'lucide-react';
import { MBBS_YEARS, BDS_YEARS } from '../../../data/academic/medicalConfig';
import { NURSING_DEFAULT_SESSIONS, NURSING_TRACKS } from '../../../data/academic/nursingConfig';
import { useAdmissionSessions } from '../../../hooks/useAdmissionData';
import ExamPdfExportModal from '../../../components/Academic/ExamPdfExportModal';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { isQuestionInSession } from '../../../utils/questionSessionMatcher';

// ─── Program metadata registry ─────────────────────────────────────────────
const PROGRAM_META = {
  medical: {
    name: 'মেডিকেল ও ডেন্টাল',
    description: 'MBBS ও BDS ভর্তি পরীক্ষার বিগত বছরের সম্পূর্ণ প্রশ্নব্যাংক ও বিস্তারিত সমাধান',
    backPath: '/academic/admission/medical',
    icon: Stethoscope,
    accentFrom: 'from-rose-500',
    accentTo: 'to-pink-600',
    accentBorder: 'border-rose-500/30',
    accentBg: 'bg-rose-500/10',
    accentText: 'text-rose-400',
    accentRing: 'ring-rose-500/20',
    badgeBg: 'bg-rose-500/20 border-rose-500/30 text-rose-300',
    cardActiveBorder: 'border-rose-500',
    cardActiveRing: 'ring-rose-500/30',
    tabsActive: 'bg-rose-600 text-white shadow-rose-600/20',
    sessionBtnActive: 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20',
    sessionBtnPractice: 'text-rose-400',
    tabs: [
      { key: 'MBBS', label: 'MBBS (মেডিকেল)', icon: Stethoscope },
      { key: 'BDS', label: 'BDS (ডেন্টাল)', icon: FlaskConical },
    ],
  },
  nursing: {
    name: 'নার্সিং',
    description: 'নার্সিং ভর্তি পরীক্ষার বিগত বছরের সম্পূর্ণ প্রশ্নব্যাংক — BSc, Diploma ও Midwifery',
    backPath: '/academic/admission/nursing',
    icon: HeartPulse,
    accentFrom: 'from-emerald-500',
    accentTo: 'to-teal-600',
    accentBorder: 'border-emerald-500/30',
    accentBg: 'bg-emerald-500/10',
    accentText: 'text-emerald-400',
    accentRing: 'ring-emerald-500/20',
    badgeBg: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
    cardActiveBorder: 'border-emerald-500',
    cardActiveRing: 'ring-emerald-500/30',
    tabsActive: 'bg-emerald-600 text-white shadow-emerald-600/20',
    sessionBtnActive: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20',
    sessionBtnPractice: 'text-emerald-400',
    tabs: [
      { key: 'BSc Nursing', label: 'BSc Nursing', icon: HeartPulse },
      { key: 'Diploma in Nursing', label: 'Diploma Nursing', icon: BookMarked },
      { key: 'Midwifery', label: 'Midwifery', icon: Baby },
    ],
  },
  engineering: {
    name: 'ইঞ্জিনিয়ারিং',
    description: 'BUET, CUET, RUET, KUET, BUTEX সহ সকল প্রকৌশল বিশ্ববিদ্যালয়ের বিগত বছরের প্রশ্নব্যাংক',
    backPath: '/academic/admission/engineering',
    icon: Cpu,
    accentFrom: 'from-blue-500',
    accentTo: 'to-indigo-600',
    accentBorder: 'border-blue-500/30',
    accentBg: 'bg-blue-500/10',
    accentText: 'text-blue-400',
    accentRing: 'ring-blue-500/20',
    badgeBg: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
    cardActiveBorder: 'border-blue-500',
    cardActiveRing: 'ring-blue-500/30',
    tabsActive: 'bg-blue-600 text-white shadow-blue-600/20',
    sessionBtnActive: 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20',
    sessionBtnPractice: 'text-blue-400',
    tabs: [
      { key: 'BUET', label: 'BUET', icon: Cpu },
      { key: 'CKET', label: 'CUET / RUET / KUET', icon: Layers },
      { key: 'BUTEX', label: 'BUTEX', icon: Layers },
    ],
  },
  'varsity-a': {
    name: 'ভার্সিটি ক-ইউনিট',
    description: `ঢাকা বিশ্ববিদ্যালয় 'ক' ইউনিট, জাহাঙ্গীরনগর, রাজশাহী, চট্টগ্রাম ও সাস্টের বিগত বছরের প্রশ্নব্যাংক`,
    backPath: '/academic/admission/varsity-a',
    icon: GraduationCap,
    accentFrom: 'from-indigo-500',
    accentTo: 'to-purple-600',
    accentBorder: 'border-indigo-500/30',
    accentBg: 'bg-indigo-500/10',
    accentText: 'text-indigo-400',
    accentRing: 'ring-indigo-500/20',
    badgeBg: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300',
    cardActiveBorder: 'border-indigo-500',
    cardActiveRing: 'ring-indigo-500/30',
    tabsActive: 'bg-indigo-600 text-white shadow-indigo-600/20',
    sessionBtnActive: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20',
    sessionBtnPractice: 'text-indigo-400',
    tabs: [
      { key: 'DU-A', label: 'ঢাবি ক-ইউনিট', icon: GraduationCap },
      { key: 'SUST', label: 'সাস্ট', icon: GraduationCap },
      { key: 'JU', label: 'জাহাঙ্গীরনগর', icon: GraduationCap },
    ],
  },
  gst: {
    name: 'GST (বিজ্ঞান ও প্রযুক্তি)',
    description: 'GST গুচ্ছ ভর্তি পরীক্ষার বিগত বছরের সম্পূর্ণ প্রশ্নব্যাংক ও বিস্তারিত সমাধান',
    backPath: '/academic/admission/gst',
    icon: FlaskConical,
    accentFrom: 'from-fuchsia-500',
    accentTo: 'to-pink-600',
    accentBorder: 'border-fuchsia-500/30',
    accentBg: 'bg-fuchsia-500/10',
    accentText: 'text-fuchsia-400',
    accentRing: 'ring-fuchsia-500/20',
    badgeBg: 'bg-fuchsia-500/20 border-fuchsia-500/30 text-fuchsia-300',
    cardActiveBorder: 'border-fuchsia-500',
    cardActiveRing: 'ring-fuchsia-500/30',
    tabsActive: 'bg-fuchsia-600 text-white shadow-fuchsia-600/20',
    sessionBtnActive: 'bg-fuchsia-600 hover:bg-fuchsia-500 shadow-fuchsia-600/20',
    sessionBtnPractice: 'text-fuchsia-400',
    tabs: [
      { key: 'GST', label: 'GST গুচ্ছ', icon: FlaskConical },
    ],
  },
  agri: {
    name: 'কৃষি বিশ্ববিদ্যালয়',
    description: 'বাংলাদেশ কৃষি বিশ্ববিদ্যালয়সহ সকল কৃষি প্রতিষ্ঠানের বিগত বছরের প্রশ্নব্যাংক',
    backPath: '/academic/admission/agri',
    icon: Sprout,
    accentFrom: 'from-lime-500',
    accentTo: 'to-green-600',
    accentBorder: 'border-lime-500/30',
    accentBg: 'bg-lime-500/10',
    accentText: 'text-lime-400',
    accentRing: 'ring-lime-500/20',
    badgeBg: 'bg-lime-500/20 border-lime-500/30 text-lime-300',
    cardActiveBorder: 'border-lime-500',
    cardActiveRing: 'ring-lime-500/30',
    tabsActive: 'bg-lime-600 text-white shadow-lime-600/20',
    sessionBtnActive: 'bg-lime-600 hover:bg-lime-500 shadow-lime-600/20',
    sessionBtnPractice: 'text-lime-400',
    tabs: [
      { key: 'BAU', label: 'বাকৃবি (BAU)', icon: Sprout },
      { key: 'SAU', label: 'শেকৃবি (SAU)', icon: Sprout },
    ],
  },
  'varsity-others': {
    name: 'অন্যান্য ভার্সিটি',
    description: 'খ, গ, ঘ ইউনিট ও অন্যান্য পাবলিক বিশ্ববিদ্যালয়ের ভর্তি পরীক্ষার প্রশ্নব্যাংক',
    backPath: '/academic/admission/varsity-others',
    icon: GraduationCap,
    accentFrom: 'from-amber-500',
    accentTo: 'to-orange-600',
    accentBorder: 'border-amber-500/30',
    accentBg: 'bg-amber-500/10',
    accentText: 'text-amber-400',
    accentRing: 'ring-amber-500/20',
    badgeBg: 'bg-amber-500/20 border-amber-500/30 text-amber-300',
    cardActiveBorder: 'border-amber-500',
    cardActiveRing: 'ring-amber-500/30',
    tabsActive: 'bg-amber-600 text-white shadow-amber-600/20',
    sessionBtnActive: 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20',
    sessionBtnPractice: 'text-amber-400',
    tabs: [
      { key: 'DU-B', label: 'ঢাবি খ-ইউনিট', icon: GraduationCap },
      { key: 'DU-C', label: 'ঢাবি গ-ইউনিট', icon: GraduationCap },
      { key: 'DU-D', label: 'ঢাবি ঘ-ইউনিট', icon: GraduationCap },
    ],
  },
};

// ─── Fallback session generators for programs without live data ─────────────
function getFallbackSessions(program, examType) {
  const baseYears = ['2023-2024', '2022-2023', '2021-2022', '2020-2021', '2019-2020'];
  return baseYears.map((session, i) => ({
    id: `${program}-${examType}-${i}`,
    session,
    examType,
    totalQuestions: 100,
    examDate: `বিগত সেশন`,
    status: 'প্রশ্নব্যাংক'
  }));
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function PastQuestionsPage() {
  const { trackId } = useParams();
  const { pathname } = useLocation();

  // Detect program from URL pathname
  const program = useMemo(() => {
    if (pathname.includes('/nursing/')) return 'nursing';
    if (pathname.includes('/medical')) return 'medical';
    if (pathname.includes('/engineering')) return 'engineering';
    if (pathname.includes('/varsity-a')) return 'varsity-a';
    if (pathname.includes('/varsity-others')) return 'varsity-others';
    if (pathname.includes('/gst')) return 'gst';
    if (pathname.includes('/agri')) return 'agri';
    return 'medical';
  }, [pathname]);

  const meta = PROGRAM_META[program] || PROGRAM_META['medical'];
  const Icon = meta.icon;

  const [activeExamType, setActiveExamType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync active tab default whenever the program changes (e.g. navigating between programs)
  useEffect(() => {
    const defaultTab = PROGRAM_META[program]?.tabs?.[0]?.key || '';
    if (program === 'nursing' && trackId) {
      const nursingTrack = NURSING_TRACKS.find(t => t.id === trackId);
      setActiveExamType(nursingTrack?.shortName || defaultTab);
    } else {
      setActiveExamType(defaultTab);
    }
  }, [program, trackId]);

  const { data: allSessions = [] } = useAdmissionSessions();

  // Fetch all questions from question_bank for dynamic session matching
  const { data: allQuestions = [], isLoading: isQuestionsLoading } = useQuery({
    queryKey: ['question_bank_all_admission_questions'],
    queryFn: async () => {
      try {
        const snap = await getDocs(collection(db, 'question_bank'));
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        console.warn('Failed to load admission questions for session page:', err);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  // Compute sessions for each tab
  const sessions = useMemo(() => {
    // Medical: use static data
    if (program === 'medical') {
      if (activeExamType === 'MBBS') {
        const live = allSessions.filter(s => s.examType === 'MBBS');
        return live.length ? live : MBBS_YEARS.map(y => ({ ...y, examType: 'MBBS' }));
      }
      if (activeExamType === 'BDS') {
        const live = allSessions.filter(s => s.examType === 'BDS');
        return live.length ? live : BDS_YEARS.map(y => ({ ...y, examType: 'BDS' }));
      }
    }
    // Nursing
    if (program === 'nursing') {
      const live = allSessions.filter(s => s.examType === activeExamType);
      if (live.length) return live;
      return NURSING_DEFAULT_SESSIONS.filter(s => s.examType === activeExamType);
    }
    // Others: fallback
    const live = allSessions.filter(s => s.examType === activeExamType || s.program === program);
    return live.length ? live : getFallbackSessions(program, activeExamType);
  }, [program, activeExamType, allSessions]);

  // Filter by search
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const q = searchQuery.toLowerCase();
    return sessions.filter(s =>
      (s.session || '').includes(q) ||
      (s.examDate || '').toLowerCase().includes(q) ||
      (s.status || '').toLowerCase().includes(q)
    );
  }, [sessions, searchQuery]);

  const [selectedSessionForPdf, setSelectedSessionForPdf] = useState(null);

  // Build exam URL for each session
  const getExamUrl = (session, mode = 'practice') =>
    `/academic/admission/medical/exam/${encodeURIComponent(session.examType || activeExamType)}/${session.session}?mode=${mode}`;

  // Back URL
  const backUrl = program === 'nursing' && trackId
    ? `/academic/admission/nursing/${trackId}`
    : meta.backPath;

  return (
    <div className="min-h-screen bg-[#0a0f1c] pb-24 sm:pb-12 pt-8 font-bangla text-slate-100 selection:bg-rose-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* ── Back Navigation ────────────────────────────────────────────── */}
        <Link
          to={backUrl}
          className={`inline-flex items-center gap-2 ${meta.accentText} hover:opacity-80 text-sm font-semibold transition group`}
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          {meta.name} ড্যাশবোর্ডে ফিরে যান
        </Link>

        {/* ── Hero Section ────────────────────────────────────────────────── */}
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${meta.accentFrom}/10 via-slate-900 ${meta.accentTo}/5 border ${meta.accentBorder} p-6 sm:p-10 shadow-2xl`}>
          <div className={`absolute -right-16 -top-16 w-72 h-72 bg-gradient-to-br ${meta.accentFrom} ${meta.accentTo} opacity-10 rounded-full blur-3xl pointer-events-none`} />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${meta.accentBg} border ${meta.accentBorder} ${meta.accentText} text-xs font-black tracking-wide`}>
                <Icon className="w-4 h-4" />
                <span>{meta.name.toUpperCase()} QUESTION BANK</span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.badgeBg}`}>
                {filteredSessions.length}টি সেশন উপলব্ধ
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              বিগত সালের{' '}
              <span className={`bg-clip-text text-transparent bg-gradient-to-r ${meta.accentFrom} ${meta.accentTo}`}>
                প্রশ্নব্যাংক
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">{meta.description}</p>

            {/* Quick Stats */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs font-bold text-slate-200`}>
                <Clock className="w-4 h-4 text-amber-400" />
                পরীক্ষার সময়: ৬০ মিনিট
              </span>
              <span className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs font-bold text-slate-200`}>
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                নেগেটিভ: -০.২৫
              </span>
              <span className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs font-bold text-slate-200`}>
                <FileText className="w-4 h-4 ${meta.accentText}" />
                ১০০ MCQ প্রশ্নপত্র
              </span>
            </div>
          </div>
        </div>

        {/* ── Exam Type Tabs + Search Bar ─────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {meta.tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeExamType === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveExamType(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${
                    isActive
                      ? `${meta.tabsActive} shadow-lg`
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                  {isActive && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-md bg-white/20 text-[10px] font-black">
                      {filteredSessions.length}টি
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="সাল বা তারিখ দিয়ে খুঁজুন..."
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-${meta.accentText.replace('text-', '')}`}
            />
          </div>
        </div>

        {/* ── Sessions Grid ────────────────────────────────────────────────── */}
        {filteredSessions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSessions.map((y, idx) => {
              const targetType = y.examType || activeExamType;
              const targetSess = y.session;
              const matchedQuestions = allQuestions.filter(q => isQuestionInSession(q, targetType, targetSess));

              return (
                <div
                  key={y.id || `${y.examType || activeExamType}-${y.session}-${idx}`}
                  className="group bg-slate-900/60 border border-slate-800 hover:border-slate-600 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between gap-5 shadow-lg hover:shadow-xl"
                >
                  {/* Card Header */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-black border ${meta.badgeBg}`}>
                        {y.examType || activeExamType} {y.session}
                      </span>
                      <span className="text-xs font-bold text-slate-400 shrink-0">
                        {matchedQuestions.length > 0 ? `${matchedQuestions.length}টি MCQ` : (y.totalQuestions ? `${y.totalQuestions} MCQ` : 'সেশন উপলব্ধ')}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-white text-base leading-snug">
                        {meta.name} ভর্তি পরীক্ষা
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <p className="text-xs text-slate-400">অনুষ্ঠিত: {y.examDate || 'বিগত সেশন'}</p>
                      </div>
                    </div>

                    {y.status && (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[11px] text-emerald-400 font-medium">{y.status}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-3 border-t border-slate-800/80">
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to={getExamUrl(y, 'practice')}
                        className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold text-center transition flex items-center justify-center gap-1.5 group-hover:border group-hover:border-slate-700"
                      >
                        <BookOpen className={`w-3.5 h-3.5 ${meta.sessionBtnPractice}`} />
                        প্র্যাকটিস
                      </Link>
                      <Link
                        to={getExamUrl(y, 'exam')}
                        className={`w-full py-2 rounded-xl text-white text-xs font-bold text-center transition shadow-md flex items-center justify-center gap-1.5 bg-gradient-to-r ${meta.accentFrom} ${meta.accentTo} hover:opacity-90 active:scale-95`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        রিয়েল টেস্ট
                      </Link>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedSessionForPdf({
                        ...y,
                        examTitle: `${meta.name} ভর্তি পরীক্ষা — সেশন ${y.session}`,
                        questions: matchedQuestions,
                        totalQuestions: matchedQuestions.length || y.totalQuestions || 100
                      })}
                      className="w-full py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>প্রশ্ন ও সমাধান PDF {matchedQuestions.length > 0 ? `(${matchedQuestions.length})` : ''}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
            <div className={`w-16 h-16 rounded-2xl ${meta.accentBg} border ${meta.accentBorder} flex items-center justify-center`}>
              <BookOpen className={`w-8 h-8 ${meta.accentText}`} />
            </div>
            <h3 className="text-lg font-bold text-slate-300">
              কোনো প্রশ্নব্যাংক পাওয়া যায়নি
            </h3>
            <p className="text-sm text-slate-500 max-w-sm">
              এই সেশনের জন্য এখনো প্রশ্নব্যাংক আপলোড হয়নি অথবা আপনার সার্চে কিছু মিলছে না।
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-200 underline"
              >
                সার্চ ক্লিয়ার করুন
              </button>
            )}
          </div>
        )}

        {/* ── Info footer ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/60">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            ✅ প্র্যাকটিস মোডে: তাৎক্ষণিক সমাধান ও ব্যাখ্যা দেখতে পাবেন &nbsp;|&nbsp; ⏱ রিয়েল টেস্টে: লাইভ টাইমার ও নেগেটিভ মার্কিং সক্রিয় থাকবে
          </p>
          <Link
            to={backUrl}
            className={`shrink-0 inline-flex items-center gap-2 text-xs font-bold ${meta.accentText} hover:opacity-80 transition`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            ড্যাশবোর্ডে ফিরুন
          </Link>
        </div>

        {/* ── Printable PDF Export Modal ─────────────────────────────────── */}
        {selectedSessionForPdf && (
          <ExamPdfExportModal
            isOpen={Boolean(selectedSessionForPdf)}
            onClose={() => setSelectedSessionForPdf(null)}
            examTitle={`${meta.name} ভর্তি পরীক্ষা — সেশন ${selectedSessionForPdf.session}`}
            questions={selectedSessionForPdf.questions || []}
            examInfo={{
              totalMarks: selectedSessionForPdf.totalQuestions || 100,
              timeLimitMinutes: 60,
              subject: meta.name,
            }}
          />
        )}

      </div>
    </div>
  );
}
