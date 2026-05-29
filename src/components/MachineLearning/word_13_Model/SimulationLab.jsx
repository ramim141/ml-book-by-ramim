import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Network, Zap, CheckCircle, RefreshCcw, ArrowRight, Play, Loader2 } from 'lucide-react';

const timelineSteps = [
  { pct: 0, label: '১. ডেটা লোড', desc: 'ফিচার ও লেবেল ওভেনে ঢোকানো হচ্ছে।' },
  { pct: 33, label: '২. ট্রেনিং শুরু', desc: 'অ্যালগরিদম ডেটার ওপর কাজ করছে।' },
  { pct: 66, label: '৩. প্যাটার্ন সেভ', desc: 'মডেলটি গাণিতিক সূত্র নিখুঁত করছে।' },
  { pct: 100, label: '৪. মডেল তৈরি', desc: 'স্বাধীন ব্রেন বা মডেল ফাইল প্রস্তুত!' },
];

export default function SimulationLab() {
  const [activeTab, setActiveTab] = useState('factory');
  const [selectedAlgo, setSelectedAlgo] = useState('linear');
  const [datasetSize, setDatasetSize] = useState('small');
  const [bakingStatus, setBakingStatus] = useState('idle'); // idle, baking, baked, tested
  const [bakingProgress, setBakingProgress] = useState(0);
  const [testResult, setTestResult] = useState('');

  const startBaking = () => {
    if (bakingStatus === 'baking') return;
    setBakingStatus('baking');
    setBakingProgress(0);
    setTestResult('');

    const interval = setInterval(() => {
      setBakingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setBakingStatus('baked');
          return 100;
        }
        return prev + 4;
      });
    }, 80);
  };

  const runTest = (scenario) => {
    if (bakingStatus !== 'baked' && bakingStatus !== 'tested') return;
    setBakingStatus('tested');
    if (selectedAlgo === 'linear') {
      setTestResult(scenario === 'party' ? '🍰 হালকা ভ্যানিলা কেক প্রস্তুত (১০ জনের জন্য)।' : '☕ বিকেলের চায়ের আড্ডা সার্থক!');
    } else {
      setTestResult(scenario === 'party' ? '🍫 প্রিমিয়াম ডাবল-চকলেট মডেল কেক প্রস্তুত!' : '🧁 সুইট ডিশ মডেল কেক তৈরি।');
    }
  };

  return (
    <div className="w-full space-y-8 font-sans text-slate-200">
      
      {/* Header Area */}
      <div className="pb-4 space-y-3 text-center">
        <h2 className="flex items-center justify-center gap-3 text-xl font-bold text-white sm:text-2xl md:text-3xl">
          <span className="px-3 py-1 text-xs text-white bg-indigo-600 rounded-full shadow-lg">ল্যাব-১৩</span>
          এআই মডেল মেকার (Model Factory)
        </h2>
        <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-slate-400">
          অ্যালগরিদম নামক রেসিপি এবং ডেটা নামক উপকরণ দিয়ে নিজের মডেল 'বেক' করুন।
        </p>
      </div>

      {/* Simulation Guide Card */}
      <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5 md:p-6 shadow-md font-sans">
        <h3 className="flex items-center gap-2 text-base font-bold text-slate-100 sm:text-lg mb-3">
          <span className="text-indigo-400 animate-pulse">💡</span> ল্যাব সিমুলেটর গাইড
        </h3>
        <p className="text-sm sm:text-base leading-relaxed text-slate-300 mb-4">
          এই সিমুলেটরের মাধ্যমে আপনি দেখতে পাবেন কীভাবে অ্যালগরিদম (রেসিপি) এবং ডেটা (উপকরণ) ব্যবহার করে একটি স্বাধীন এআই মডেল (Model File) তৈরি ও ট্রেন করা হয়।
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="bg-[#0b0f19]/60 border border-white/5 p-4 rounded-xl space-y-2">
            <span className="font-bold text-indigo-300 flex items-center gap-1.5">
              <span className="text-base">🍦</span> ১. রেসিপি নির্বাচন ও বেকিং
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              সেটিংস প্যানেল থেকে আপনার পছন্দের রেসিপি (লিনিয়ার রেসিপি বা ডিসিশন ট্রি রেসিপি) নির্বাচন করুন। তারপর "ট্রেইন ও বেক করুন" বাটনে ক্লিক করে প্রসেস শুরু করুন।
            </p>
          </div>
          <div className="bg-[#0b0f19]/60 border border-white/5 p-4 rounded-xl space-y-2">
            <span className="font-bold text-[#d8b4fe] flex items-center gap-1.5">
              <span className="text-base">🔥</span> ২. মডেল ওভেনে ট্রেইনিং
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              মাঝখানের "মডেল ওভেন" প্যানেলটি লক্ষ্য করুন। এখানে ডেটা লোড হওয়া, ট্রেইনিং প্রসেস চলা এবং প্যাটার্ন সেভ করে স্বাধীন এআই মডেল তৈরির ৪টি ধাপ লাইভ ট্র্যাকিং বারসহ সম্পন্ন হতে দেখুন।
            </p>
          </div>
          <div className="bg-[#0b0f19]/60 border border-white/5 p-4 rounded-xl space-y-2">
            <span className="font-bold text-[#fbcfe8] flex items-center gap-1.5">
              <span className="text-base">🚀</span> ৩. রিয়েল লাইফ ইনফ্যারেন্স টেস্ট
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              মডেল বেক করা সফল হলে ডান পাশের "রিয়েল লাইফ টেস্ট" অ্যাক্টিভেট হবে। জন্মদিনের পার্টি বা বিকেলের আড্ডার বাটনগুলোতে ক্লিক করে আপনার মডেলের তৈরি আউটপুট প্রেডিকশন পরীক্ষা করুন।
            </p>
          </div>
        </div>
      </div>

      <div className="grid items-stretch grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Step 1: Settings */}
        <div className="lg:col-span-4 bg-[#1e2430] p-4 sm:p-6 rounded-2xl border border-gray-700 shadow-xl space-y-6">
          <h3 className="flex items-center gap-2 pb-3 text-base sm:text-lg font-bold text-indigo-400 border-b border-gray-700"><span>⚙️</span> ১. সেটিংস</h3>
          
          <div className="space-y-4">
            <p className="text-xs sm:text-sm font-bold tracking-widest uppercase text-slate-500">রেসিপি (Algorithm):</p>
            <button onClick={() => setSelectedAlgo('linear')} className={`w-full p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${selectedAlgo === 'linear' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200' : 'bg-black/20 border-gray-700 text-slate-500'}`}>
               <span className="text-xl">🍦</span> <div><p className="text-xs sm:text-sm font-bold">Linear Recipe</p><p className="text-xs text-slate-400 opacity-70">ভ্যানিলা ফ্লেভারের জন্য।</p></div>
            </button>
            <button onClick={() => setSelectedAlgo('tree')} className={`w-full p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${selectedAlgo === 'tree' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200' : 'bg-black/20 border-gray-700 text-slate-500'}`}>
               <span className="text-xl">🍫</span> <div><p className="text-xs sm:text-sm font-bold">Decision Tree Recipe</p><p className="text-xs text-slate-400 opacity-70">চকলেট ফ্লেভারের জন্য।</p></div>
            </button>
          </div>

          <button onClick={startBaking} disabled={bakingStatus === 'baking'} className="flex items-center justify-center w-full gap-2 py-4 font-black text-white transition-all shadow-lg bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 rounded-xl active:scale-95 disabled:opacity-50">
            {bakingStatus === 'baking' ? <><Loader2 className="animate-spin" size={20}/> | বেকিং হচ্ছে...</> : <><Zap size={20}/> | ট্রেইন ও বেক করুন</>}
          </button>
        </div>

        {/* Step 2: Progress */}
        <div className="lg:col-span-4 bg-[#1e2430] p-4 sm:p-6 rounded-2xl border border-gray-700 shadow-xl flex flex-col justify-between">
          <h3 className="pb-3 mb-6 text-base sm:text-lg font-bold text-white border-b border-gray-700">🔥 ২. মডেল ওভেন</h3>
          <div className="relative py-2 pl-6 ml-2 space-y-6 border-l border-gray-800">
            {timelineSteps.map((s, i) => (
              <div key={i} className={`relative ${bakingProgress >= s.pct ? 'text-indigo-300 font-bold' : 'text-slate-600'}`}>
                <span className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center text-[10px] transition-all ${bakingProgress >= s.pct ? 'bg-indigo-500 border-indigo-400 text-white font-bold' : 'bg-gray-900 border-gray-700'}`}>
                  {bakingProgress >= s.pct ? '✓' : ''}
                </span>
                <p className="text-xs sm:text-sm font-bold">{s.label}</p>
                <p className="text-xs text-slate-400 opacity-70">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="p-4 mt-6 border bg-black/20 rounded-xl border-white/5">
            <div className="flex justify-between text-xs font-mono text-indigo-400 mb-2 font-bold"><span>ওভেন তাপমাত্রা</span><span>{bakingProgress}%</span></div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full transition-all duration-100 bg-indigo-500" style={{width: `${bakingProgress}%`}}></div>
            </div>
          </div>
        </div>

        {/* Step 3: Deployment */}
        <div className="lg:col-span-4 bg-[#1e2430] p-4 sm:p-6 rounded-2xl border border-gray-700 shadow-xl flex flex-col justify-between gap-6">
          <div>
            <h3 className="pb-3 mb-4 text-base sm:text-lg font-bold border-b border-gray-700 text-emerald-400">🚀 ৩. রিয়েল লাইফ টেস্ট</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">মডেল বেক করা শেষ? এবার আপনার তৈরি করা 'স্বাধীন ব্রেন' টিকে বাস্তব ইনপুট দিয়ে পরীক্ষা করুন।</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => runTest('party')} disabled={bakingStatus !== 'baked' && bakingStatus !== 'tested'} className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs sm:text-sm font-bold border border-gray-700 transition-all disabled:opacity-30">🥳 জন্মদিনের পার্টি</button>
              <button onClick={() => runTest('tea')} disabled={bakingStatus !== 'baked' && bakingStatus !== 'tested'} className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs sm:text-sm font-bold border border-gray-700 transition-all disabled:opacity-30">☕ বিকেলের আড্ডা</button>
            </div>
            {testResult && (
              <div className="p-4 mt-6 border bg-emerald-950/20 border-emerald-500/30 rounded-2xl animate-fade-in">
                <span className="text-xs font-black uppercase text-emerald-500 tracking-widest block">Model Inference:</span>
                <p className="mt-2 text-sm sm:text-base font-bold leading-relaxed text-white">{testResult}</p>
              </div>
            )}
          </div>
          <button onClick={() => {setBakingStatus('idle'); setBakingProgress(0); setTestResult('');}} className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-xs sm:text-sm font-bold rounded-lg border border-white/10 transition-all mt-6">রিসেট ফ্যাক্টরি</button>
        </div>
      </div>
    </div>
  );
}