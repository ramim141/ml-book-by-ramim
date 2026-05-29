import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, CheckCircle, XCircle, RefreshCcw, Activity, Play, Zap, Gamepad2, Landmark, Compass, MousePointer2, Sparkles } from 'lucide-react';

export default function SimulationLab() {
  const [activeTab, setActiveTab] = useState('robot');
  
  // --- Robot Adventure Logic ---
  const [robotPos, setRobotPos] = useState({ r: 0, c: 0 });
  const [rlScore, setRlScore] = useState(0);
  const [collectedCoins, setCollectedCoins] = useState([]);
  const [isRobotRunning, setIsRobotRunning] = useState(false);
  
  const gridLayout = [
    ['E', 'C', 'W', 'E', 'E'],
    ['E', 'O', 'E', 'C', 'O'], 
    ['C', 'E', 'W', 'E', 'E'],
    ['E', 'O', 'E', 'E', 'C'],
    ['E', 'E', 'C', 'W', 'G']  
  ];

  const handleRobotMove = (direction) => {
    if (isRobotRunning) return;
    let { r, c } = robotPos;
    if (direction === 'UP' && r > 0) r--;
    else if (direction === 'DOWN' && r < 4) r++;
    else if (direction === 'LEFT' && c > 0) c--;
    else if (direction === 'RIGHT' && c < 4) c++;

    const cell = gridLayout[r][c];
    if (cell === 'O') {
      setRlScore(s => s - 15);
      return; // Bounce back
    }
    
    if (cell === 'W') setRlScore(s => s - 5);
    else if (cell === 'C' && !collectedCoins.includes(`${r}-${c}`)) {
      setRlScore(s => s + 20);
      setCollectedCoins([...collectedCoins, `${r}-${c}`]);
    } else if (cell === 'G') setRlScore(s => s + 100);
    else setRlScore(s => s - 1);

    setRobotPos({ r, c });
  };

  // --- Bicycle Logic ---
  const [angle, setAngle] = useState(0);
  const [isBalancing, setIsBalancing] = useState(false);
  const [bestTime, setBestTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    let interval;
    if (isBalancing) {
      interval = setInterval(() => {
        setAngle(prev => {
          const drift = (Math.random() - 0.5) * 12 + (prev > 0 ? 1 : -1);
          const next = prev + drift;
          setCurrentTime(t => t + 1);
          if (Math.abs(next) > 40) {
            setIsBalancing(false);
            if (currentTime > bestTime) setBestTime(currentTime);
            return next;
          }
          return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isBalancing, currentTime, bestTime]);

  return (
    <div className="w-full font-sans text-slate-200 space-y-8">
      <div className="text-center space-y-3 pb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center justify-center gap-3">
          <span className="bg-amber-600 text-white text-xs px-3 py-1 rounded-full shadow-lg">ল্যাব-১৯</span>
          রিইনফোর্সমেন্ট লার্নিং ল্যাব
        </h2>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">ভুল থেকে শেখার গাণিতিক ফিডব্যাক লুপটি সরাসরি অনুভব করুন।</p>
      </div>

      {/* Simulation Guide Card */}
      <div className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-5 md:p-6 shadow-xl relative backdrop-blur-md">
        <div className="absolute top-4 right-4 text-amber-500/30"><Sparkles size={24} /></div>
        <h3 className="flex items-center gap-2 text-base font-bold text-slate-100 sm:text-lg mb-3">
          <span className="text-amber-400 animate-pulse">💡</span> ল্যাব সিমুলেটর গাইড
        </h3>
        <p className="text-sm sm:text-base leading-relaxed text-slate-300 mb-5">
          এই সিমুলেটরের মাধ্যমে আপনি রিইনফোর্সমেন্ট লার্নিংয়ের প্রধান বিষয়সমূহ (Reward, Penalty, Trial and Error) সরাসরি পরীক্ষা করতে পারবেন।
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs sm:text-sm">
          <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl space-y-2 hover:border-amber-500/30 transition-all duration-300">
            <span className="font-bold text-amber-400 flex items-center gap-2">
              <span className="text-lg">🤖</span> ১. রোবট অ্যাডভেঞ্চার (Grid World)
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              একটি ৫x৫ গ্রিডে আপনার রোবটটিকে লক্ষ্য (🔋) পর্যন্ত নিয়ে যান। প্রতিটি সঠিক পদক্ষেপে কয়েন (+২০) পাবেন, কিন্তু আগুনে (🔥) পড়লে বা কাদা (💧) মাড়ালে পয়েন্ট কাটা যাবে। প্রতি পদক্ষেপে (-১) পয়েন্ট কাটা যায়, তাই সবচেয়ে কম ধাপে লক্ষ্যে পৌঁছানোই আসল চ্যালেঞ্জ!
            </p>
          </div>
          <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl space-y-2 hover:border-amber-500/30 transition-all duration-300">
            <span className="font-bold text-amber-400 flex items-center gap-2">
              <span className="text-lg">🚲</span> ২. সাইকেল ব্যালেন্সার (Balancing Act)
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              একটি এআই এজেন্ট কীভাবে বারবার পড়ে গিয়ে সাইকেল চালানো শেখে তা দেখুন। "ট্রেনিং শুরু" বাটনে চাপ দিলে এজেন্ট সাইকেলের ভারসাম্য রাখার চেষ্টা করবে। পড়ে যাওয়ার (Penalty) মাধ্যমে সে শিখবে কীভাবে বেশিক্ষণ সোজা (Reward) থাকা যায়।
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center bg-white/[0.02] p-1.5 rounded-xl border border-white/5 max-w-md mx-auto w-full gap-2 shadow-lg">
        <button onClick={() => setActiveTab('robot')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'robot' ? 'bg-amber-600 text-white' : 'text-slate-400'}`}>🤖 রোবট অ্যাডভেঞ্চার</button>
        <button onClick={() => setActiveTab('bike')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'bike' ? 'bg-amber-600 text-white' : 'text-slate-400'}`}>🚲 সাইকেল ব্যালেন্সার</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {activeTab === 'robot' ? (
          <>
            <div className="lg:col-span-7 bg-[#1e2430] p-6 rounded-3xl border border-gray-700 shadow-xl space-y-6">
              <h3 className="text-lg font-bold text-amber-400 border-b border-gray-700 pb-3 flex justify-between">
                <span>🛸 এনভায়রনমেন্ট ম্যাপ</span>
                <span className="text-xs font-mono text-emerald-400">Score: {rlScore}</span>
              </h3>
              <div className="grid grid-cols-5 gap-2 max-w-[300px] mx-auto bg-black/40 p-4 rounded-2xl border border-white/5">
                {gridLayout.map((row, r) => row.map((cell, c) => {
                  const isRobot = robotPos.r === r && robotPos.c === c;
                  const isCollected = collectedCoins.includes(`${r}-${c}`);
                  return (
                    <div key={`${r}-${c}`} className={`aspect-square rounded-lg flex items-center justify-center text-xl border ${isRobot ? 'bg-amber-600 border-amber-400 shadow-[0_0_15px_#f59e0b] scale-105 z-10' : 'bg-white/5 border-white/5'}`}>
                      {isRobot ? '🛸' : cell === 'C' && !isCollected ? '🪙' : cell === 'O' ? '🔥' : cell === 'W' ? '💧' : cell === 'G' ? '🔋' : ''}
                    </div>
                  );
                }))}
              </div>
              <div className="flex flex-col items-center gap-3">
                 <div className="flex gap-2">
                    <button onClick={() => handleRobotMove('UP')} className="w-12 h-10 bg-gray-800 rounded-xl border border-gray-600 font-bold">▲</button>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => handleRobotMove('LEFT')} className="w-12 h-10 bg-gray-800 rounded-xl border border-gray-600 font-bold">◀</button>
                    <button onClick={() => handleRobotMove('DOWN')} className="w-12 h-10 bg-gray-800 rounded-xl border border-gray-600 font-bold">▼</button>
                    <button onClick={() => handleRobotMove('RIGHT')} className="w-12 h-10 bg-gray-800 rounded-xl border border-gray-600 font-bold">▶</button>
                 </div>
              </div>
            </div>
            <div className="lg:col-span-5 bg-[#1e2430] p-6 rounded-3xl border border-gray-700 shadow-xl flex flex-col justify-between">
               <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white border-b border-gray-700 pb-2 uppercase tracking-widest text-slate-500">রিওয়ার্ড মেকানিজম</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-black/20 rounded-xl border border-emerald-500/20 text-center"><p className="text-[10px] text-emerald-500 font-bold">কয়েন</p><p className="text-lg font-black text-white">+২০</p></div>
                    <div className="p-3 bg-black/20 rounded-xl border border-rose-500/20 text-center"><p className="text-[10px] text-rose-500 font-bold">আগুন</p><p className="text-lg font-black text-white">-১৫</p></div>
                    <div className="p-3 bg-black/20 rounded-xl border border-blue-500/20 text-center"><p className="text-[10px] text-blue-500 font-bold">কাদা</p><p className="text-lg font-black text-white">-৫</p></div>
                    <div className="p-3 bg-black/20 rounded-xl border border-slate-500/20 text-center"><p className="text-[10px] text-slate-500 font-bold">স্টেপ</p><p className="text-lg font-black text-white">-১</p></div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed italic">"লক্ষ্য হলো সবচেয়ে কম ধাপে সবচেয়ে বেশি কয়েন নিয়ে ব্যাটারি (🔋) চার্জ করা।"</p>
               </div>
               <button onClick={() => {setRobotPos({r:0,c:0}); setRlScore(0); setCollectedCoins([]);}} className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-xs font-bold rounded-xl border border-gray-600">রিসেট এডভেঞ্চার</button>
            </div>
          </>
        ) : (
          <div className="lg:col-span-12 bg-[#1e2430] p-10 rounded-[3rem] border border-gray-700 shadow-2xl text-center space-y-8">
             <div className="flex justify-around items-center max-w-lg mx-auto border-b border-white/5 pb-6">
                <div><p className="text-[10px] text-slate-500 font-bold uppercase">বর্তমান সময়</p><p className="text-3xl font-black text-white font-mono">{currentTime} s</p></div>
                <div className="w-[1px] h-10 bg-gray-800"></div>
                <div><p className="text-[10px] text-emerald-600 font-bold uppercase">সেরা রেকর্ড</p><p className="text-3xl font-black text-emerald-400 font-mono">{bestTime} s</p></div>
             </div>
             <div className="h-48 bg-black/40 rounded-3xl relative flex flex-col justify-center items-center shadow-inner overflow-hidden border border-white/5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.05),transparent)]" />
                <motion.div animate={{ rotate: angle }} transition={{ type: 'spring', stiffness: 100 }} className="relative z-10 flex flex-col items-center">
                   <span className="text-7xl mb-2">🚴‍♂️</span>
                   <div className="w-1 h-12 bg-amber-500 rounded-full" />
                </motion.div>
                <div className="absolute bottom-4 flex gap-4 text-[10px] font-bold text-slate-500"><span>◀ বামে পতন</span><span>ব্যালেন্স</span><span>ডানে পতন ▶</span></div>
             </div>
             <div className="flex justify-center gap-4">
                <button onClick={() => {setIsBalancing(true); setCurrentTime(0); setAngle(0);}} disabled={isBalancing} className="px-10 py-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95">ট্রেনিং শুরু (Start Trial)</button>
                <button onClick={() => {setIsBalancing(false); setAngle(0); setCurrentTime(0); setBestTime(0);}} className="p-4 bg-gray-800 rounded-2xl border border-gray-700"><RefreshCcw size={20}/></button>
             </div>
             <p className="text-xs text-slate-500 italic max-w-sm mx-auto">"এআই এজেন্টটি প্রতিবার পড়ে গিয়ে (পেনাল্টি) শিখছে ঠিক কোন কোণে স্টিয়ারিং ঘুরালে সে বেশিক্ষণ সোজা থাকতে পারবে।"</p>
          </div>
        )}
      </div>
    </div>
  );
}