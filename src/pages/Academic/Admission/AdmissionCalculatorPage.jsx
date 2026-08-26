import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calculator, CheckCircle2, XCircle, AlertTriangle, ArrowRight, 
  TrendingUp, Sparkles, Filter, Info, Award, GraduationCap, 
  Search, RefreshCw, BarChart2, ShieldCheck, Zap
} from 'lucide-react';
import { ADMISSION_UNIVERSITIES } from '../../../data/academic/admissionRequirements';
import { toBn } from '../../../lib/format';

const GRADE_POINTS = [
  { label: 'A+ (5.00)', value: 5.0 },
  { label: 'A (4.00)', value: 4.0 },
  { label: 'A- (3.50)', value: 3.5 },
  { label: 'B (3.00)', value: 3.0 },
  { label: 'C (2.00)', value: 2.0 },
  { label: 'D (1.00)', value: 1.0 },
];

export default function AdmissionCalculatorPage() {
  const [activeTab, setActiveTab] = useState('eligibility'); // 'eligibility' | 'chances'

  // Eligibility Inputs
  const [sscGpa, setSscGpa] = useState(5.0);
  const [hscGpa, setHscGpa] = useState(5.0);
  const [bioGrade, setBioGrade] = useState(5.0);
  const [phyGrade, setPhyGrade] = useState(5.0);
  const [chemGrade, setChemGrade] = useState(5.0);
  const [mathGrade, setMathGrade] = useState(5.0);
  const [isSecondTime, setIsSecondTime] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Chances Predictor Inputs
  const [selectedUnivId, setSelectedUnivId] = useState('medical-mbbs');
  const [estimatedScore, setEstimatedScore] = useState(72);

  // Evaluate Eligibility
  const evaluatedUniversities = useMemo(() => {
    return ADMISSION_UNIVERSITIES.map(u => {
      const evaluation = u.checkEligibility({
        sscGpa: Number(sscGpa) || 0,
        hscGpa: Number(hscGpa) || 0,
        bioGrade: Number(bioGrade) || 0,
        phyGrade: Number(phyGrade) || 0,
        chemGrade: Number(chemGrade) || 0,
        mathGrade: Number(mathGrade) || 0,
        isSecondTime,
      });
      return {
        ...u,
        ...evaluation,
      };
    });
  }, [sscGpa, hscGpa, bioGrade, phyGrade, chemGrade, mathGrade, isSecondTime]);

  const eligibleCount = evaluatedUniversities.filter(u => u.eligible).length;

  const filteredList = useMemo(() => {
    return evaluatedUniversities.filter(u => {
      const matchCat = categoryFilter === 'All' || u.category === categoryFilter;
      const matchSearch = !searchQuery || u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.badge.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [evaluatedUniversities, categoryFilter, searchQuery]);

  // Selected University for Chances Predictor
  const currentUniv = useMemo(() => {
    return ADMISSION_UNIVERSITIES.find(u => u.id === selectedUnivId) || ADMISSION_UNIVERSITIES[0];
  }, [selectedUnivId]);

  // Chance Calculation
  const chanceAnalysis = useMemo(() => {
    const score = Number(estimatedScore) || 0;
    const safe = currentUniv.safeExamScore;
    const moderate = currentUniv.moderateExamScore;

    let percentage = 0;
    let status = 'risky';
    let statusLabel = 'ঝুঁকিপূর্ণ জোন (আরও প্রস্তুতি দরকার)';
    let statusColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    let advice = 'বিগত বছরের কাট-মার্কসের চেয়ে কম স্কোর। দুর্বল অধ্যায়গুলোতে বেশি মনোযোগ দাও ও মডেল টেস্ট দাও।';

    if (score >= safe) {
      percentage = Math.min(Math.round(85 + ((score - safe) / (currentUniv.examMarks - safe || 1)) * 14), 99);
      status = 'safe';
      statusLabel = 'নিরাপদ জোন (চান্স পাওয়ার প্রবল সম্ভাবনা)';
      statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      advice = 'চমৎকার প্রস্তুতি! রিভিশন ধরে রাখো এবং নেগেটিভ মার্কিং এড়াতে সতর্ক থাকো।';
    } else if (score >= moderate) {
      percentage = Math.round(55 + ((score - moderate) / (safe - moderate || 1)) * 29);
      status = 'moderate';
      statusLabel = 'প্রতিযোগিতাপূর্ণ জোন (কাট-মার্কস বাউন্ডারি)';
      statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      advice = 'তুমি কাট-মার্কসের খুব কাছাকাছি আছো। আর ৩-৫ নম্বর বাড়াতে পারলে চান্স নিশ্চিত হবে।';
    } else {
      percentage = Math.max(Math.round((score / moderate) * 50), 10);
    }

    return { percentage, status, statusLabel, statusColor, advice };
  }, [currentUniv, estimatedScore]);

  return (
    <div className="relative mx-auto w-full min-h-screen max-w-7xl px-4 py-6 sm:px-6 sm:py-10 font-bangla">
      
      {/* Background Glows */}
      <div className="pointer-events-none absolute -top-16 left-1/4 h-96 w-96 rounded-full bg-indigo-600/10 blur-[130px]" />
      <div className="pointer-events-none absolute top-72 right-0 h-96 w-96 rounded-full bg-fuchsia-600/10 blur-[130px]" />

      {/* Header Banner */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold shadow-sm">
          <Calculator className="w-4 h-4" />
          <span>ভর্তি প্রস্তুতি ও অ্যানালিটিক্স টুলকিট</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
          ভর্তি যোগ্যতা ও চান্স প্রেডিক্টর ক্যালকুলেটর
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto">
          তোমার SSC ও HSC জিপিএ এবং বিষয়ভিত্তিক গ্রেড দিয়ে জেনে নাও কোন কোন ভার্সিটিতে তুমি যোগ্য, এবং মডেল টেস্টের স্কোরের ভিত্তিতে চান্স পাওয়ার সম্ভাবনা পরিমাপ করো।
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-lg">
          <button
            type="button"
            onClick={() => setActiveTab('eligibility')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'eligibility'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>১. ভর্তি যোগ্যতা ও জিপিএ চেকার</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('chances')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'chances'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>২. কাট-মার্কস ও চান্স প্রেডিক্টর</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: ELIGIBILITY & GPA CHECKER ───────────────────────────────── */}
      {activeTab === 'eligibility' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Left Form: Input GPA & Grades */}
          <div className="lg:col-span-4 space-y-5">
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-indigo-400" />
                  <span>তোমার ফলাফল ইনপুট দাও</span>
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setSscGpa(5.0); setHscGpa(5.0); setBioGrade(5.0);
                    setPhyGrade(5.0); setChemGrade(5.0); setMathGrade(5.0);
                    setIsSecondTime(false);
                  }}
                  className="text-[11px] text-slate-400 hover:text-indigo-400 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> রিসেট
                </button>
              </div>

              {/* SSC & HSC GPA */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">SSC GPA (১.০০-৫.০০)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.0"
                    max="5.0"
                    value={sscGpa}
                    onChange={(e) => setSscGpa(Math.min(5, Math.max(0, parseFloat(e.target.value) || 0)))}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-sm font-bold focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">HSC GPA (১.০০-৫.০০)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.0"
                    max="5.0"
                    value={hscGpa}
                    onChange={(e) => setHscGpa(Math.min(5, Math.max(0, parseFloat(e.target.value) || 0)))}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-sm font-bold focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Combined GPA Pill */}
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
                <span className="text-xs text-indigo-300 font-semibold">SSC + HSC মোট জিপিএ:</span>
                <span className="text-base font-black text-indigo-400">
                  {toBn((Number(sscGpa) + Number(hscGpa)).toFixed(2))}
                </span>
              </div>

              {/* Subject Specific Grades */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-300">
                  HSC বিষয়ভিত্তিক গ্রেড পয়েন্ট (GP)
                </label>
                
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <span className="block text-[11px] text-slate-400 mb-1">🧬 জীববিজ্ঞান (Bio)</span>
                    <select
                      value={bioGrade}
                      onChange={(e) => setBioGrade(parseFloat(e.target.value))}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 font-bold focus:border-indigo-500 focus:outline-none"
                    >
                      {GRADE_POINTS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <span className="block text-[11px] text-slate-400 mb-1">⚡ পদার্থবিজ্ঞান (Phy)</span>
                    <select
                      value={phyGrade}
                      onChange={(e) => setPhyGrade(parseFloat(e.target.value))}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 font-bold focus:border-indigo-500 focus:outline-none"
                    >
                      {GRADE_POINTS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <span className="block text-[11px] text-slate-400 mb-1">⚗️ রসায়ন (Chem)</span>
                    <select
                      value={chemGrade}
                      onChange={(e) => setChemGrade(parseFloat(e.target.value))}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 font-bold focus:border-indigo-500 focus:outline-none"
                    >
                      {GRADE_POINTS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <span className="block text-[11px] text-slate-400 mb-1">📐 উচ্চতর গণিত (Math)</span>
                    <select
                      value={mathGrade}
                      onChange={(e) => setMathGrade(parseFloat(e.target.value))}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 font-bold focus:border-indigo-500 focus:outline-none"
                    >
                      {GRADE_POINTS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Second Time Switcher */}
              <div className="pt-2 border-t border-white/5">
                <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-950/80 border border-slate-800/80 transition">
                  <input
                    type="checkbox"
                    checked={isSecondTime}
                    onChange={(e) => setIsSecondTime(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-0 focus:outline-none cursor-pointer"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-200 block">আমি ২য় বার (2nd Time) পরীক্ষার্থী</span>
                    <span className="text-[10px] text-slate-400">সেকেন্ড টাইম নীতি ও মার্কস কর্তন হিসাব হবে</span>
                  </div>
                </label>
              </div>

            </div>

            {/* Quick Result Summary Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-slate-900/60 border border-indigo-500/20 backdrop-blur-xl shadow-lg space-y-2">
              <span className="text-xs font-semibold text-indigo-300">তোমার ফলাফলের সারসংক্ষেপ</span>
              <p className="text-xl sm:text-2xl font-black text-white">
                তুমি <span className="text-emerald-400">{toBn(eligibleCount)}টি</span> ইউনিটে আবেদনের যোগ্য! 🎉
              </p>
              <p className="text-xs text-slate-300">
                নিচের তালিকা থেকে বিস্তারিত ক্রাইটেরিয়া ও আসন সংখ্যা দেখে নাও।
              </p>
            </div>

          </div>

          {/* Right Results Grid */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Filter & Search Ribbon */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
              
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                {[
                  { id: 'All', label: 'সকল' },
                  { id: 'Medical', label: '🩺 মেডিকেল' },
                  { id: 'Engineering', label: '⚡ ইঞ্জিনিয়ারিং' },
                  { id: 'Varsity', label: '🏛️ বিশ্ববিদ্যালয়' },
                  { id: 'GST', label: '🏢 গুচ্ছ' },
                  { id: 'Agri', label: '🌾 কৃষি' },
                  { id: 'Nursing', label: '💉 নার্সিং' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      categoryFilter === cat.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-48">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

            </div>

            {/* University Cards Grid */}
            <div className="space-y-3.5">
              {filteredList.map(u => (
                <div
                  key={u.id}
                  className={`p-4 sm:p-5 rounded-2xl bg-slate-900/60 border transition-all ${
                    u.eligible
                      ? 'border-emerald-500/30 hover:border-emerald-500/50 shadow-emerald-500/5'
                      : 'border-rose-500/20 opacity-85 hover:opacity-100'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    
                    {/* Title & Badge */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-indigo-300">
                          {u.badge}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          আসন: {u.seatsCount}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white">
                        {u.name}
                      </h4>
                    </div>

                    {/* Eligibility Status Pill */}
                    <div className="shrink-0">
                      {u.eligible ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black shadow-sm">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>আবেদনের যোগ্য</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-black">
                          <XCircle className="w-4 h-4 text-rose-400" />
                          <span>শর্ত পূরণ হয়নি</span>
                        </span>
                      )}
                    </div>

                  </div>

                  {/* Exam Pattern & Minimum GPA Details */}
                  <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="text-slate-300">
                      <span className="text-slate-500 font-medium">নম্বর বণ্টন: </span>
                      {u.examPattern}
                    </div>
                    <div className="text-slate-300">
                      <span className="text-slate-500 font-medium">ন্যূনতম জিপিএ: </span>
                      মোট {toBn(u.minCombinedGpa)} (প্রতিটিতে {toBn(u.minIndividualGpa)})
                    </div>
                  </div>

                  {/* If Ineligible: Show reasons */}
                  {!u.eligible && u.reasons?.length > 0 && (
                    <div className="mt-3 p-3 rounded-xl bg-rose-500/[0.07] border border-rose-500/20 space-y-1">
                      <span className="text-[11px] font-bold text-rose-300 block">যেসব শর্ত বাকি রয়েছে:</span>
                      <ul className="list-disc list-inside text-xs text-rose-300/90 space-y-0.5">
                        {u.reasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Special Note / Second Time Note */}
                  {u.note && (
                    <div className="mt-2 text-[11px] text-amber-400/90 flex items-center gap-1">
                      <Info className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>{u.note}</span>
                    </div>
                  )}

                  {/* 1-Click Link to Chance Predictor */}
                  <div className="mt-3 pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUnivId(u.id);
                        setActiveTab('chances');
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-bold inline-flex items-center gap-1"
                    >
                      <span>কাট-মার্কস ও চান্স প্রেডিকশন দেখুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              ))}
            </div>

          </div>

        </div>
      )}

      {/* ── TAB 2: HISTORICAL CUT-OFF & CHANCES PREDICTOR ──────────────────── */}
      {activeTab === 'chances' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Left: Predictor Controls */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-5 shadow-xl">
              
              <div className="space-y-1">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">টপিক নির্বাচন</span>
                <h3 className="text-base font-bold text-white">বিশ্ববিদ্যালয় ও সম্ভাব্য স্কোর</h3>
              </div>

              {/* University Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">বিশ্ববিদ্যালয় বা ইউনিট নির্বাচন করো</label>
                <select
                  value={selectedUnivId}
                  onChange={(e) => setSelectedUnivId(e.target.value)}
                  className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  {ADMISSION_UNIVERSITIES.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.badge})</option>
                  ))}
                </select>
              </div>

              {/* Estimated Exam Score Slider */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">
                    তোমার মডেল টেস্ট বা প্রত্যাশিত স্কোর:
                  </label>
                  <span className="text-lg font-black text-indigo-400">
                    {toBn(estimatedScore)} / {toBn(currentUniv.examMarks)}
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max={currentUniv.examMarks}
                  step="0.5"
                  value={estimatedScore}
                  onChange={(e) => setEstimatedScore(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 h-2 bg-slate-950 rounded-lg cursor-pointer"
                />

                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>০ নম্বর</span>
                  <span>কাট-মার্কস জোন ({toBn(currentUniv.moderateExamScore)})</span>
                  <span>পূর্ণমান ({toBn(currentUniv.examMarks)})</span>
                </div>
              </div>

              {/* Benchmark Pill */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>নিরাপদ জোন বেঞ্চমার্ক:</span>
                  <span className="font-bold text-emerald-400">{toBn(currentUniv.safeExamScore)}+</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>কাট-মার্কস সীমা (আনুমানিক):</span>
                  <span className="font-bold text-amber-400">{toBn(currentUniv.moderateExamScore)}</span>
                </div>
              </div>

            </div>

            {/* Quick Practice Link */}
            <div className="p-5 rounded-3xl bg-slate-900/40 border border-slate-800/80 space-y-3">
              <span className="text-xs font-bold text-slate-300 block">স্কোর আরও বাড়াতে চাও?</span>
              <p className="text-xs text-slate-400">
                বিগত ২০ বছরের প্রশ্নব্যাংক এবং চ্যাপ্টারভিত্তিক মডেল টেস্ট দিয়ে নিজের ভুলগুলো সংশোধন করে নাও।
              </p>
              <Link
                to="/academic/admission/question-bank"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>প্রশ্নব্যাংক প্র্যাকটিস শুরু</span>
              </Link>
            </div>

          </div>

          {/* Right: Chance Gauge & Historical Cut-offs */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Probability Gauge Card */}
            <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-5">
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400">চান্স পাওয়ার সম্ভাবনা সূচক</span>
                  <h3 className="text-lg font-bold text-white">{currentUniv.name}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${chanceAnalysis.statusColor}`}>
                  {chanceAnalysis.statusLabel}
                </span>
              </div>

              {/* Large Percentage Meter */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                    {toBn(chanceAnalysis.percentage)}%
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">সম্ভাবনা স্কোর</span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-950 ring-1 ring-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      chanceAnalysis.status === 'safe' ? 'bg-gradient-to-r from-indigo-500 to-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]' :
                      chanceAnalysis.status === 'moderate' ? 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]' :
                      'bg-gradient-to-r from-rose-500 to-pink-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                    }`}
                    style={{ width: `${chanceAnalysis.percentage}%` }}
                  />
                </div>
              </div>

              {/* Personalized Suggestion & Advice */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>অ্যানালিস্ট পরামর্শ:</span>
                </span>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {chanceAnalysis.advice}
                </p>
              </div>

            </div>

            {/* Historical Cut-off Table */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-bold text-white">বিগত বছরগুলোর কাট-মার্কস পরিসংখ্যান</h4>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 font-bold">
                      <th className="pb-2.5">সেশন (Session)</th>
                      <th className="pb-2.5">কাট-মার্কস (MCQ)</th>
                      <th className="pb-2.5">মোট স্কোর (GPA সহ)</th>
                      <th className="pb-2.5">শীর্ষ ইন্সটিটিউট বা বিষয়</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {currentUniv.cutOffHistory?.map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02]">
                        <td className="py-2.5 font-bold text-slate-200">{row.year}</td>
                        <td className="py-2.5 font-bold text-indigo-400">{toBn(row.examScore)}</td>
                        <td className="py-2.5 text-slate-300">{toBn(row.totalScore)}</td>
                        <td className="py-2.5 text-emerald-400 font-medium">{row.topCollege || 'সাধারণ কাট-অফ'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                * কাট-মার্কস হলো সেই সর্বনিম্ন মার্কস যার মাধ্যমে সংশ্লিষ্ট সেশনে সর্বশেষ শিক্ষার্থী মেধা তালিকায় সুযোগ পেয়েছিল।
              </p>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
