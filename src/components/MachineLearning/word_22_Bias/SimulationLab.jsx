import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function SimulationLab() {
  const [biasType, setBiasType] = useState('biased'); // 'biased' or 'de-biased'
  const [dataSkew, setDataSkew] = useState(85); // Male percentage (50 to 100)
  const [selectedCandidate, setSelectedCandidate] = useState(null); // 'male' or 'female'
  const [scanState, setScanState] = useState('idle'); // 'idle', 'scanning', 'calculated'
  const [auditScore, setAuditScore] = useState(0);

  const candidates = {
    male: {
      name: "তানভীর রহমান (Tanveer)",
      gender: "পুরুষ (Male)",
      skills: 90,
      extra: "সভাপতি, ইউনিভার্সিটি কোডিং ক্লাব",
      trigger: "কোডিং ক্লাব",
      penalty: 0
    },
    female: {
      name: "তাসনিয়া ইসলাম (Tasnia)",
      gender: "নারী (Female)",
      skills: 90,
      extra: "সভাপতি, উইমেন ইন টেক ক্লাব",
      trigger: "উইমেন ইন টেক",
      penalty: -25 // Skewed Bias weight
    }
  };

  const handleAuditCandidate = (gender) => {
    setSelectedCandidate(gender);
    setScanState('scanning');
    setAuditScore(0);

    setTimeout(() => {
      setScanState('calculated');
      const activePenalty = biasType === 'biased' ? candidates[gender].penalty : 0;
      setAuditScore(candidates[gender].skills + activePenalty);
    }, 2000);
  };

  const handleResetLab = () => {
    setSelectedCandidate(null);
    setScanState('idle');
    setAuditScore(0);
  };

  return (
    <div className="w-full font-sans text-slate-200 space-y-8">
      
      <div className="text-center space-y-3 pb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center justify-center gap-3">
          <span className="bg-rose-600/20 text-rose-500 border border-rose-500/30 text-xs px-3 py-1 rounded-full animate-pulse shadow-lg">ল্যাব-২২</span>
          এআই বায়াস অডিট ল্যাব
        </h2>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
          ঐতিহাসিক অসামঞ্জস্য ডেটার কারণে এআই কীভাবে নারী ও পুরুষের সমান যোগ্যতার সিভিতে বৈষম্য তৈরি করে তা পরীক্ষা করুন।
        </p>
      </div>

      {/* Simulation Guide Card */}
      <div className="rounded-2xl border border-rose-500/20 bg-rose-950/20 p-5 md:p-6 shadow-xl relative backdrop-blur-md">
          <div className="absolute top-4 right-4 text-rose-500/30"><Sparkles size={24} /></div>
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-100 sm:text-lg mb-3">
              <span className="text-rose-400 animate-pulse">💡</span> ল্যাব সিমুলেটর গাইড
          </h3>
          <p className="text-sm sm:text-base leading-relaxed text-slate-300 mb-5">
              এই সিমুলেটরের মাধ্যমে আপনি দেখতে পারবেন কীভাবে ঐতিহাসিক ডেটার কারণে এআই মডেলে জেন্ডার বায়াস (Gender Bias) তৈরি হয়।
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs sm:text-sm">
              <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl space-y-2 hover:border-rose-500/30 transition-all duration-300">
                  <span className="font-bold text-rose-400 flex items-center gap-2">
                      <span className="text-lg">⚠️</span> বায়াসড মোড (ঐতিহাসিক ডেটা)
                  </span>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                      এই মোডে ডেটাবেসে পুরুষের সিভির আধিক্য থাকে। ফলে এআই মডেল নারী প্রার্থীদের সিভিতে (সমান যোগ্যতা থাকা সত্ত্বেও) স্বয়ংক্রিয়ভাবে একটি গাণিতিক পেনাল্টি দেয় এবং তাদের সিলেকশন থেকে বাতিল করে দেয়।
                  </p>
              </div>
              <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl space-y-2 hover:border-emerald-500/30 transition-all duration-300">
                  <span className="font-bold text-emerald-400 flex items-center gap-2">
                      <span className="text-lg">🍀</span> ডিবায়াসড মোড (নিরপেক্ষ ডেটা)
                  </span>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                      এই মোডে নারী ও পুরুষের সিভির অনুপাত ৫০:৫০ রাখা হয়। ফলশ্রুতিতে এআই মডেল কোনো জেন্ডারকে পেনাল্টি না দিয়ে শুধুমাত্র যোগ্যতার ভিত্তিতে সঠিক মূল্যায়ন করে।
                  </p>
              </div>
          </div>
      </div>

      {/* Global Control: Toggle AI Bias State */}
      <div className="bg-[#0b111b] p-5 md:p-8 rounded-[2rem] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-3xl rounded-full" />
        <div className="text-left flex-1 relative z-10">
          <span className="text-base md:text-lg font-bold block text-white mb-2">⚙️ এআই মডেল কনফিগারেশন:</span>
          <span className="text-sm md:text-base text-slate-400 leading-relaxed block">
            ঐতিহাসিক পুরুষ-প্রধান ডেটা বনাম জেন্ডার নিরপেক্ষ বৈচিত্র্যপূর্ণ ডেটাসেট চয়ন।
          </span>
        </div>
        <div className="flex gap-3 w-full md:w-auto relative z-10">
          <button
            onClick={() => { setBiasType('biased'); handleResetLab(); }}
            className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-sm font-bold border transition-all ${
              biasType === 'biased' 
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.2)]' 
                : 'bg-white/5 text-slate-400 border-white/10 hover:text-slate-200 hover:bg-white/10'
            }`}
          >
            ⚠️ বায়াসড মোড
          </button>
          <button
            onClick={() => { setBiasType('de-biased'); handleResetLab(); }}
            className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-sm font-bold border transition-all ${
              biasType === 'de-biased' 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                : 'bg-white/5 text-slate-400 border-white/10 hover:text-slate-200 hover:bg-white/10'
            }`}
          >
            🍀 ডিবায়াসড মোড
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* COLUMN 1: SKEWED FULCRUM / BALANCE */}
        <div className="lg:col-span-5 bg-[#0b111b] p-6 md:p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-base md:text-lg font-bold text-indigo-400 mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
              <span>⚖️</span> ১. ডেটার ভারসাম্য পরিমাপ
            </h3>
            <p className="text-sm md:text-base text-slate-400 mb-6 leading-relaxed">
              স্লাইডার দিয়ে রিক্রুটিং ডেটার অনুপাত পরিবর্তন করুন। দেখুন ডেটার অসামঞ্জস্যতা কীভাবে এআই-এর পাল্লাকে ঝুঁকিয়ে দেয়:
            </p>

            <div className="bg-white/5 p-5 md:p-6 rounded-2xl border border-white/10 space-y-4 mb-6">
              <div className="flex justify-between text-sm md:text-base font-bold font-mono">
                <span className="text-blue-400">👨 পুরুষ: {dataSkew}%</span>
                <span className="text-pink-400">👩 নারী: {100 - dataSkew}%</span>
              </div>
              <input 
                type="range" min="50" max="100" step="10" value={dataSkew}
                disabled={biasType === 'de-biased'}
                onChange={(e) => { setDataSkew(parseInt(e.target.value)); handleResetLab(); }}
                className="w-full accent-rose-500 cursor-pointer disabled:opacity-30 h-2 md:h-3 bg-white/10 rounded-lg appearance-none"
              />
              {biasType === 'de-biased' && (
                <p className="text-[11px] md:text-xs text-emerald-400 font-bold pt-2">✨ ডিবায়াসড মোডে ডেটা কৃত্রিমভাবে সমান (50:50) রাখা হয়েছে।</p>
              )}
            </div>

            <div className="bg-white/5 p-4 md:p-6 rounded-2xl border border-white/10 flex items-center justify-center h-56 relative shadow-inner">
              <span className="absolute top-4 left-4 text-xs uppercase tracking-widest text-slate-500 font-bold">লাইভ ডেটা স্কেল</span>
              
              <svg viewBox="0 0 400 200" className="w-full h-full max-w-[280px]">
                <polygon points="190,190 210,190 200,100" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                <line x1="200" y1="100" x2="200" y2="40" stroke="#334155" strokeWidth="4" />
                <circle cx="200" cy="40" r="6" fill="#6366f1" />

                <g 
                  transform={`rotate(${biasType === 'biased' ? (dataSkew - 50) * 0.45 : 0}, 200, 40)`} 
                  className="transition-transform duration-700 ease-out"
                >
                  <line x1="100" y1="40" x2="300" y2="40" stroke="#6366f1" strokeWidth="4" />
                  
                  <line x1="100" y1="40" x2="70" y2="120" stroke="#475569" strokeWidth="1.5" />
                  <line x1="100" y1="40" x2="130" y2="120" stroke="#475569" strokeWidth="1.5" />
                  <rect x="60" y="120" width="80" height="5" rx="2" fill="#3b82f6" />
                  <text x="75" y="115" fontSize="20">👨</text>
                  <text x="95" y="115" fontSize="20">👨</text>
                  {dataSkew > 70 && <text x="85" y="95" fontSize="20">👨</text>}

                  <line x1="300" y1="40" x2="270" y2="120" stroke="#475569" strokeWidth="1.5" />
                  <line x1="300" y1="40" x2="330" y2="120" stroke="#475569" strokeWidth="1.5" />
                  <rect x="260" y="120" width="80" height="5" rx="2" fill="#ec4899" />
                  <text x="275" y="115" fontSize="20">👩</text>
                  {biasType === 'de-biased' || dataSkew < 70 ? (
                    <text x="295" y="115" fontSize="20">👩</text>
                  ) : (
                    <text x="295" y="115" fontSize="14" fill="#4b5563" fontWeight="bold">?</text>
                  )}
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* COLUMN 2 & 3: THE AI NEURAL SCANNER AND RESULT */}
        <div className="lg:col-span-7 bg-[#0b111b] p-6 md:p-8 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-base md:text-lg font-bold text-white mb-4 border-b border-white/10 pb-3 flex justify-between items-center">
              <span className="flex items-center gap-2"><span>🧠</span> ২. নিউরাল অডিটর ল্যাব</span>
            </h3>
            <p className="text-sm md:text-base text-slate-400 mb-6 leading-relaxed">
              আবেদনকারীদের সিভিতে ক্লিক করে সেটিকে এআই স্ক্যানারের ভেতরে রান করুন। দুজনের স্কিল সমান হলেও আউটপুট লেবেলে কী হয় লক্ষ্য করুন:
            </p>

            <div className="grid grid-cols-2 gap-4 md:gap-6 w-full mb-6 md:mb-8">
              <button
                disabled={scanState === 'scanning'}
                onClick={() => handleAuditCandidate('male')}
                className={`p-4 md:p-5 rounded-2xl border text-left transition-all active:scale-95 ${
                  selectedCandidate === 'male' ? 'bg-blue-500/10 border-blue-500 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 text-slate-300'
                }`}
              >
                <span className="text-3xl block mb-2">👨</span>
                <span className="block font-bold text-sm md:text-base text-white mb-1">Tanveer (পুরুষ)</span>
                <span className="text-xs md:text-sm text-slate-400">Skills: 90% | Coding Club</span>
              </button>

              <button
                disabled={scanState === 'scanning'}
                onClick={() => handleAuditCandidate('female')}
                className={`p-4 md:p-5 rounded-2xl border text-left transition-all active:scale-95 ${
                  selectedCandidate === 'female' ? 'bg-pink-500/10 border-pink-500 text-pink-200 shadow-[0_0_15px_rgba(236,72,153,0.2)]' : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 text-slate-300'
                }`}
              >
                <span className="text-3xl block mb-2">👩</span>
                <span className="block font-bold text-white text-sm md:text-base mb-1">Tasnia (নারী)</span>
                <span className="text-xs md:text-sm text-slate-400">Skills: 90% | Women In Tech</span>
              </button>
            </div>

            {/* Neural Scanner Screen */}
            <div className="w-full bg-[#030712] p-6 md:p-8 rounded-2xl border border-white/5 min-h-[180px] md:min-h-[200px] flex flex-col justify-center items-center relative overflow-hidden shadow-inner mb-6 md:mb-8">
              {scanState === 'idle' && (
                <div className="text-slate-500 space-y-3 text-center">
                  <span className="text-5xl block">📋</span>
                  <p className="text-xs md:text-sm font-bold uppercase tracking-widest">সিভি সিলেক্ট করার জন্য অপেক্ষারত</p>
                </div>
              )}

              {scanState === 'scanning' && (
                <div className="space-y-4 text-center text-indigo-400 z-10">
                  <div className="text-5xl animate-spin inline-block">⚙️</div>
                  <p className="text-xs md:text-sm font-mono tracking-widest font-bold bg-indigo-500/10 px-4 py-2 rounded-lg">AI SCANNING CV DATA...</p>
                </div>
              )}

              {/* Laser Animation */}
              {scanState === 'scanning' && <div className="absolute left-0 w-full h-0.5 bg-rose-500/60 shadow-[0_0_15px_#ef4444] top-0 animate-[scan_1.5s_infinite]"></div>}

              {scanState === 'calculated' && selectedCandidate && (
                <div className="w-full animate-fade-in z-10">
                  <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4 md:mb-5">
                    <span className="font-bold text-white text-base md:text-lg">{candidates[selectedCandidate].name}</span>
                    <span className="text-2xl md:text-3xl">{selectedCandidate === 'male' ? '👨' : '👩'}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <span className="text-slate-400 block mb-1.5 text-xs md:text-sm font-bold uppercase tracking-wider">১. যোগ্যতা বেস স্কোর:</span>
                      <span className="font-mono text-emerald-400 font-bold text-xl md:text-2xl">{candidates[selectedCandidate].skills} pt</span>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <span className="text-slate-400 block mb-1.5 text-xs md:text-sm font-bold uppercase tracking-wider">২. ঐতিহাসিক বায়াস পেনাল্টি:</span>
                      <span className={`font-mono font-bold text-xl md:text-2xl ${biasType === 'biased' && selectedCandidate === 'female' ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                        {biasType === 'biased' && selectedCandidate === 'female' ? '-২৫ pt (জরিমানা)' : '০ pt'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex justify-between items-center bg-[#0b111b] p-4 md:p-5 rounded-xl border border-white/10">
                    <span className="text-slate-300 font-bold text-sm md:text-base uppercase tracking-widest">চূড়ান্ত এআই স্কোর:</span>
                    <span className={`text-3xl md:text-4xl font-mono font-black ${auditScore >= 80 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {auditScore} <span className="text-lg md:text-xl text-slate-500">/ ১০০</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {scanState === 'calculated' && (
              <div className={`p-5 md:p-6 rounded-2xl border text-center animate-fade-in ${auditScore >= 80 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
                <span className="text-sm md:text-base font-black uppercase tracking-widest mb-2 block">
                  {auditScore >= 80 ? 'APPROVED 🟢 (অনুমোদিত)' : 'REJECTED ❌ (বাতিল)'}
                </span>
                <p className="text-xs md:text-sm leading-relaxed opacity-90 md:leading-loose">
                  {auditScore >= 80 ? 'চমৎকার! এআই-এর কাছে সিভিটির মান নিরপেক্ষ মনে হয়েছে এবং সে জেন্ডার না দেখে যোগ্যতা বিচার করেছে।' : 'ওহ না! যোগ্যতা ৯০% হওয়া সত্ত্বেও জেন্ডার বায়াসের গাণিতিক পেনাল্টির কারণে সিভিটি পাস মার্ক (৮০) ছুঁতে ব্যর্থ হয়েছে!'}
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0.8; }
          50% { top: 100%; opacity: 0.8; }
          100% { top: 0%; opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}