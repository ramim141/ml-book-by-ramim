import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Users, Target, Activity, Zap, RefreshCcw, Star, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function SimulationLab() {
  const [activeTab, setActiveTab] = useState('supervised');
  
  // Supervised State
  const [supScore, setSupScore] = useState(0);
  const [supFeedback, setSupFeedback] = useState(null);

  // Unsupervised State
  const [clustered, setClustered] = useState(false);

  // Reinforcement State
  const [robotPos, setRobotPos] = useState(0);
  const [battery, setBattery] = useState(100);
  const [rlLog, setRlLog] = useState("রোবট চার্জের জন্য অপেক্ষা করছে...");

  const handleSupClick = (isSpam, choice) => {
    if (isSpam === choice) {
      setSupScore(s => s + 10);
      setSupFeedback({ status: 'correct', msg: 'সঠিক! এটি লেবেল করা ডেটা।' });
    } else {
      setSupFeedback({ status: 'wrong', msg: 'ভুল হয়েছে! শিক্ষক খুশি নন।' });
    }
    setTimeout(() => setSupFeedback(null), 1500);
  };

  const handleRLMove = () => {
    if (battery <= 0) return;
    const isSuccess = Math.random() > 0.3;
    if (isSuccess) {
      setRobotPos(p => Math.min(p + 20, 100));
      setRlLog("✅ বাধা এড়িয়ে এগিয়েছে! (+৫ পয়েন্ট)");
    } else {
      setBattery(b => Math.max(b - 20, 0));
      setRlLog("❌ দেয়ালে ধাক্কা খেয়েছে! (-২০ চার্জ)");
    }
  };

  return (
    <div className="w-full space-y-8 font-sans text-slate-200">
      
      {/* Header Area */}
      <div className="pb-4 space-y-3 text-center">
        <h2 className="flex items-center justify-center gap-3 text-xl font-bold text-white sm:text-2xl md:text-3xl">
          <span className="px-3 py-1 text-xs text-white rounded-full bg-fuchsia-600">ল্যাব-১৫</span>
          মেশিন লার্নিং প্লে-গ্রাউন্ড
        </h2>
        <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-slate-400">
          মেশিন লার্নিংয়ের ৩টি ভিন্ন ভিন্ন পদ্ধতি হাতে-কলমে পরীক্ষা করুন।
        </p>
      </div>

      {/* Simulation Guide Card */}
      <div className="rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/5 p-5 md:p-6 shadow-md font-sans">
        <h3 className="flex items-center gap-2 text-base font-bold text-slate-100 sm:text-lg mb-3">
          <span className="text-fuchsia-400 animate-pulse">💡</span> ল্যাব সিমুলেটর গাইড
        </h3>
        <p className="text-sm sm:text-base leading-relaxed text-slate-300 mb-4">
          এই সিমুলেটরের মাধ্যমে আপনি মেশিন লার্নিংয়ের ৩টি মূল ক্লাসিফিকেশন পদ্ধতি—সুপারভাইজড, আনসুপারভাইজড এবং রিইনফোর্সমেন্ট লার্নিংয়ের বাস্তব উদাহরণ নিজে চালিয়ে দেখতে পারবেন।
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="bg-[#0b0f19]/60 border border-white/5 p-4 rounded-xl space-y-2">
            <span className="font-bold text-[#a21caf] flex items-center gap-1.5">
              <span className="text-base">👨‍🏫</span> ১. সুপারভাইজড লার্নিং (Supervised)
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              এখানে আপনিই সিস্টেমের শিক্ষক। আগত ইনবক্স মেসেজটি পড়ে সঠিক আউটপুট লেবেল (স্প্যাম নাকি নরমাল) সিলেক্ট করে দিন। সঠিক লেবেলের মাধ্যমে এআই-এর ট্রেনিং স্কোর বৃদ্ধি পাওয়ার প্রক্রিয়াটি দেখুন।
            </p>
          </div>
          <div className="bg-[#0b0f19]/60 border border-white/5 p-4 rounded-xl space-y-2">
            <span className="font-bold text-[#10b981] flex items-center gap-1.5">
              <span className="text-base">🔍</span> ২. আনসুপারভাইজড লার্নিং (Unsupervised)
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              "আনসুপারভাইজড" ট্যাবে যান। অগোছালো ছড়ানো ছিটানো ডেটা পয়েন্টগুলোকে কোনো শিক্ষক বা লেবেল ছাড়াই "মেশিনকে দিয়ে গ্রুপ করান (Cluster)" ক্লিক করে মিলের ওপর ভিত্তি করে সাজিয়ে আলাদা করতে দেখুন।
            </p>
          </div>
          <div className="bg-[#0b0f19]/60 border border-white/5 p-4 rounded-xl space-y-2">
            <span className="font-bold text-[#d946ef] flex items-center gap-1.5">
              <span className="text-base">🤖</span> ৩. রিইনফোর্সমেন্ট লার্নিং (Reinforcement)
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              "রিইনফোর্সমেন্ট" ট্যাবে যান। চার্জিং ডকে পৌঁছানোর জন্য রোবটের ট্রায়াল বাটন চাপুন। সফল পদক্ষেপে পুরস্কার (এগিয়ে যাওয়া) এবং ভুল পদক্ষেপে শাস্তি (চার্জ কমে যাওয়া)-র মাধ্যমে রোবটের নিজে শেখার ট্রায়াল লগ দেখুন।
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center bg-white/[0.02] p-1.5 rounded-xl border border-white/5 max-w-2xl mx-auto w-full gap-2 shadow-lg">
        <button onClick={() => setActiveTab('supervised')} className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm md:text-base font-bold transition-all ${activeTab === 'supervised' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>👨‍🏫 সুপারভাইজড</button>
        <button onClick={() => setActiveTab('unsupervised')} className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm md:text-base font-bold transition-all ${activeTab === 'unsupervised' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>🔍 আনসুপারভাইজড</button>
        <button onClick={() => setActiveTab('reinforcement')} className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm md:text-base font-bold transition-all ${activeTab === 'reinforcement' ? 'bg-fuchsia-600 text-white' : 'text-slate-400'}`}>🤖 রিইনফোর্সমেন্ট</button>
      </div>

      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {/* --- Supervised Lab --- */}
          {activeTab === 'supervised' && (
            <motion.div key="sup" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="bg-[#1e2430] p-6 sm:p-8 rounded-3xl border border-indigo-500/30 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                 <h3 className="text-lg sm:text-xl font-bold text-indigo-400">স্প্যাম ডিটেক্টর (Supervised)</h3>
                 <span className="px-3 py-1 font-mono text-xs sm:text-sm text-indigo-300 border rounded-full bg-indigo-950 border-indigo-500/30">Score: {supScore}</span>
              </div>
              <p className="text-xs sm:text-sm italic text-slate-400">"নিচের মেসেজটি পড়ে সঠিক লেবেল নির্বাচন করুন। এখানে আপনিই সিস্টেমের শিক্ষক।"</p>
              
              <div className="bg-[#12161f] p-6 rounded-2xl border border-gray-700 text-center">
                 <p className="mb-6 text-base sm:text-lg font-bold text-white">"অভিনন্দন! আপনি ১০০০০ টাকা লটারি জিতেছেন। এখনই ক্লেইম করুন!"</p>
                 <div className="flex justify-center gap-4">
                    <button onClick={() => handleSupClick(true, true)} className="px-6 py-3 font-bold transition-all border bg-rose-500/20 hover:bg-rose-500 border-rose-500 text-rose-300 hover:text-white rounded-xl">স্প্যাম (Spam)</button>
                    <button onClick={() => handleSupClick(true, false)} className="px-6 py-3 font-bold transition-all border bg-emerald-500/20 hover:bg-emerald-500 border-emerald-500 text-emerald-300 hover:text-white rounded-xl">নরমাল (Normal)</button>
                 </div>
              </div>

              {supFeedback && (
                <div className={`p-4 rounded-xl text-center font-bold text-xs sm:text-sm ${supFeedback.status==='correct'?'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30':'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                  {supFeedback.msg}
                </div>
              )}
            </motion.div>
          )}

          {/* --- Unsupervised Lab --- */}
          {activeTab === 'unsupervised' && (
            <motion.div key="unsup" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="bg-[#1e2430] p-6 sm:p-8 rounded-3xl border border-emerald-500/30 shadow-2xl space-y-6">
              <h3 className="pb-4 text-lg sm:text-xl font-bold border-b text-emerald-400 border-white/5">ডেটা ক্লাস্টারিং (Unsupervised)</h3>
              <p className="text-xs sm:text-sm text-slate-400">"নিচে একগাদা অগোছালো ডেটা পয়েন্ট আছে। \'গ্রুপ করুন\' বাটন চাপলে মেশিন মিল দেখে আলাদা করবে।"</p>
              
              <div className="h-48 bg-[#12161f] rounded-2xl relative overflow-hidden border border-gray-700">
                 {[...Array(15)].map((_, i) => (
                   <motion.div
                     key={i}
                     animate={{ x: clustered ? (i % 2 === 0 ? 50 : 250) : Math.random() * 300, y: clustered ? (i % 2 === 0 ? 50 : 100) : Math.random() * 150 }}
                     className={`absolute w-3 h-3 rounded-full ${clustered ? (i % 2 === 0 ? 'bg-indigo-400 shadow-[0_0_10px_#5b5dfa]' : 'bg-rose-400 shadow-[0_0_10px_#f43f5e]') : 'bg-slate-500'}`}
                   />
                 ))}
                 {clustered && <div className="absolute inset-0 flex items-center justify-around pointer-events-none opacity-20"><div className="w-32 h-32 border-2 border-indigo-500 border-dashed rounded-full"/><div className="w-32 h-32 border-2 border-dashed rounded-full border-rose-500"/></div>}
              </div>

              <button onClick={() => setClustered(!clustered)} className={`w-full py-4 rounded-xl font-black transition-all text-xs sm:text-sm ${clustered ? 'bg-gray-800 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'}`}>
                {clustered ? 'রিসেট করুন' : 'মেশিনকে দিয়ে গ্রুপ করান (Cluster)'}
              </button>
            </motion.div>
          )}

          {/* --- Reinforcement Lab --- */}
          {activeTab === 'reinforcement' && (
            <motion.div key="rl" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="bg-[#1e2430] p-6 sm:p-8 rounded-3xl border border-fuchsia-500/30 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                 <h3 className="text-lg sm:text-xl font-bold text-fuchsia-400">রোবট ট্রেনিং (Reinforcement)</h3>
                 <span className={`text-xs sm:text-sm font-bold ${battery<30?'text-rose-500 animate-pulse':'text-emerald-400'}`}>🔋 চার্জ: {battery}%</span>
              </div>
              
              <div className="relative h-24 bg-[#12161f] rounded-2xl flex items-center border border-gray-700 px-4">
                 <div className="absolute left-0 z-0 w-full h-1 bg-gray-800"/>
                 <motion.div animate={{ left: `${robotPos}%` }} className="relative z-10 text-4xl">🤖</motion.div>
                 <div className="absolute text-3xl right-4">🔌</div>
              </div>

              <div className="p-4 font-mono text-xs sm:text-sm italic text-center border bg-black/20 rounded-xl border-white/5 text-slate-300">
                "{rlLog}"
              </div>

              <div className="flex gap-4">
                 <button onClick={handleRLMove} disabled={battery <= 0 || robotPos >= 100} className="flex-1 py-4 font-bold text-white transition-all shadow-lg bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-30 rounded-xl active:scale-95 text-xs sm:text-sm">
                    এগিয়ে যাওয়ার চেষ্টা করুন
                 </button>
                 <button onClick={() => {setRobotPos(0); setBattery(100); setRlLog("রোবট রিস্টার্ট হয়েছে।");}} className="px-6 text-white bg-gray-800 border border-gray-600 hover:bg-gray-700 rounded-xl"><RefreshCcw size={20}/></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}