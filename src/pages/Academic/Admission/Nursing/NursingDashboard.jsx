import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, HeartPulse, Stethoscope, Dna, BookOpen, Globe, 
  Zap, Clock, Award, ShieldAlert, Sparkles, CheckCircle2, 
  ChevronRight, Play, BookMarked, Search, PlusCircle, Layers, 
  HelpCircle, FileText, ChevronDown, BookCheck, Baby, Heart
} from 'lucide-react';
import { 
  NURSING_TRACKS, 
  NURSING_SUBJECTS_CONFIG, 
  NURSING_DEFAULT_SESSIONS 
} from '../../../../data/academic/nursingConfig';
import { useAdmissionSessions, useAdmissionShortcuts } from '../../../../hooks/useAdmissionData';

export default function NursingDashboard() {
  const [selectedTrackId, setSelectedTrackId] = useState('bsc');
  const [activeTab, setActiveTab] = useState('subjects'); // 'subjects' | 'sessions' | 'shortcuts' | 'modeltest'
  const [selectedSubjectId, setSelectedSubjectId] = useState('nur-science');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: allSessions = [] } = useAdmissionSessions();
  const { data: allShortcuts = [] } = useAdmissionShortcuts();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const currentTrack = useMemo(() => {
    return NURSING_TRACKS.find(t => t.id === selectedTrackId) || NURSING_TRACKS[0];
  }, [selectedTrackId]);

  // Filter sessions by selected track
  const trackSessions = useMemo(() => {
    const examName = 
      selectedTrackId === 'bsc' ? 'BSc Nursing' :
      selectedTrackId === 'diploma' ? 'Diploma in Nursing' : 'Midwifery';

    const liveMatches = allSessions.filter(s => 
      s.examType === examName || s.examType?.toLowerCase().includes(selectedTrackId)
    );

    if (liveMatches.length > 0) return liveMatches;
    return NURSING_DEFAULT_SESSIONS.filter(s => s.examType === examName);
  }, [allSessions, selectedTrackId]);

  // Filter shortcuts
  const nursingShortcuts = useMemo(() => {
    const trackList = allShortcuts.filter(s => 
      s.track === 'medical' || s.track === 'general' || s.track === 'gk_english'
    );
    if (!searchQuery.trim()) return trackList;
    return trackList.filter(s => 
      s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.technique?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subject?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allShortcuts, searchQuery]);

  const currentSubject = useMemo(() => {
    return NURSING_SUBJECTS_CONFIG.find(s => s.id === selectedSubjectId) || NURSING_SUBJECTS_CONFIG[0];
  }, [selectedSubjectId]);

  return (
    <div className="min-h-screen bg-[#070d1e] pb-24 sm:pb-16 pt-6 font-bangla selection:bg-emerald-500/30 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div>
          <Link 
            to="/academic/admission" 
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm font-semibold transition mb-3 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
            অ্যাডমিশন সেন্টারে ফিরে যান
          </Link>

          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-teal-950/40 border border-emerald-500/20 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
            <div className="absolute -right-10 -top-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute right-1/3 -bottom-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black tracking-wide">
                <HeartPulse className="w-4 h-4" />
                <span>NURSING ADMISSION PORTAL</span>
              </div>
              
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                নার্সিং ও মিডওয়াইফারি <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">ভর্তি প্রস্তুতি</span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                বিএসসি ইন নার্সিং, ডিপ্লোমা ইন নার্সিং এবং ডিপ্লোমা ইন মিডওয়াইফারি ভর্তি পরীক্ষার বিগত সালের প্রশ্নব্যাংক, অধ্যায়ভিত্তিক গুরুত্বপূর্ণ তথ্য ও ১০০ নম্বরের মডেল টেস্ট।
              </p>

              {/* Track Switcher Segmented Control */}
              <div className="pt-3">
                <label className="block text-slate-400 text-xs font-medium mb-2">
                  আপনার নার্সিং শাখা (Track) সিলেক্ট করুন:
                </label>
                <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-black/40 border border-white/[0.08] backdrop-blur-md">
                  {NURSING_TRACKS.map((trk) => {
                    const isSelected = selectedTrackId === trk.id;
                    const Icon = trk.id === 'bsc' ? Stethoscope : trk.id === 'diploma' ? HeartPulse : Baby;
                    return (
                      <button
                        key={trk.id}
                        onClick={() => setSelectedTrackId(trk.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                          isSelected
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 scale-[1.02]'
                            : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{trk.shortName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Track Details & Marks Distribution Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-white">
                  {currentTrack.name}
                </h2>
              </div>
              <p className="text-slate-400 text-xs mt-1">
                যোগ্যতা: {currentTrack.eligibility}
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>সময়: {currentTrack.examDuration}</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>মোট নম্বর: {currentTrack.totalMarks}</span>
              </span>
            </div>
          </div>

          {/* Marks Distribution Pills */}
          <div>
            <span className="text-[11px] font-medium text-slate-400 block mb-2">
              নম্বর বণ্টন (Marks Breakdown):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
              {currentTrack.marksDistribution.map((md, idx) => (
                <div 
                  key={idx}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-2.5 text-center space-y-0.5"
                >
                  <span className="text-[11px] text-slate-400 block">{md.subject}</span>
                  <span className={`text-base font-bold font-mono ${md.color}`}>
                    {md.marks}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-2 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('subjects')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'subjects'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookCheck className="w-4 h-4 text-emerald-400" />
            <span>বিষয় ও অধ্যায়সমূহ</span>
          </button>

          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'sessions'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>বিগত সালের প্রশ্নব্যাংক ({trackSessions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'shortcuts'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>শর্টকাট ও ট্রিকস</span>
          </button>
        </div>

        {/* ── Tab 1: SUBJECTS & CHAPTERS ────────────────────────────────────────── */}
        {activeTab === 'subjects' && (
          <div className="space-y-6">
            {/* Subject Selector Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {NURSING_SUBJECTS_CONFIG.map((subj) => (
                <button
                  key={subj.id}
                  onClick={() => setSelectedSubjectId(subj.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap border ${
                    selectedSubjectId === subj.id
                      ? 'bg-white/[0.08] text-white border-emerald-500/40 shadow-sm'
                      : 'border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{subj.name.split(' (')[0]}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/[0.06] text-slate-300">
                    {subj.chapters.length}টি অধ্যায়
                  </span>
                </button>
              ))}
            </div>

            {/* Selected Subject Header */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-base font-bold text-white">
                  {currentSubject.name}
                </h3>
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 self-start sm:self-center">
                  {currentSubject.marksText}
                </span>
              </div>
              <p className="text-slate-400 text-xs">
                {currentSubject.subTitle} • সহায়ক বই: {currentSubject.recommendedBooks.join(', ')}
              </p>
            </div>

            {/* Chapters Grid */}
            <div className="space-y-4">
              {currentSubject.chapters.map((chap) => (
                <div
                  key={chap.id}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.015] hover:border-white/10 p-5 transition space-y-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                          {chap.paper}
                        </span>
                        <span className="text-xs text-emerald-400 font-medium">
                          বিগত প্রশ্ন: {chap.repeatedQuestionsCount}টি
                        </span>
                      </div>
                      <h4 className="text-base font-semibold text-white mt-1">
                        {chap.name}
                      </h4>
                    </div>

                    <Link
                      to={`/academic/admission/medical/chapter/${chap.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition"
                    >
                      <span>অনুশীলন করুন</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* High Yield Topics */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-slate-400">বারবার আসা টপিকসমূহ:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {chap.highYieldTopics.map((top, tIdx) => (
                        <span key={tIdx} className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                          • {top}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Must-Memorize Lines */}
                  {chap.keyFacts && chap.keyFacts.length > 0 && (
                    <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-3.5 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>মূল বইয়ের দাগানো লাইনসমূহ (Must-Memorize):</span>
                      </div>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {chap.keyFacts.map((fact, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2">
                            <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                            <span className="leading-relaxed">{fact}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab 2: PAST YEARS SESSIONS ────────────────────────────────────────── */}
        {activeTab === 'sessions' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trackSessions.map((sess) => (
                <div
                  key={sess.id}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.035] hover:border-emerald-500/30 p-5 transition flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {sess.examType} {sess.session}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {sess.shortYear}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition">
                      {sess.examType} বিগত সালের প্রশ্নব্যাংক
                    </h4>

                    <p className="text-xs text-slate-400">
                      মোট ১০০টি MCQ প্রশ্ন • সময় ৬০ মিনিট • লাইভ নেগেটিভ মার্কিং সহ
                    </p>
                  </div>

                  <Link
                    to={`/academic/admission/medical/session/${sess.session}`}
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>পরীক্ষা শুরু করুন</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab 3: SHORTCUTS ──────────────────────────────────────────────────── */}
        {activeTab === 'shortcuts' && (
          <div className="space-y-4">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="শর্টকাট বা টেকনিক খুঁজুন..."
                className="w-full !pl-9"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nursingShortcuts.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {item.subject}
                      </span>
                      <span className="text-[11px] text-slate-500 italic">
                        {item.reference}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white">
                      {item.title}
                    </h4>

                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-xs font-mono text-emerald-300">
                      {item.technique}
                    </div>

                    {Array.isArray(item.details) && (
                      <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside pt-1">
                        {item.details.map((d, dIdx) => (
                          <li key={dIdx}>{d}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
