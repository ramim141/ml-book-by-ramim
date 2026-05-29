import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function SimulationLab() {
  const [algoMode, setAlgoMode] = useState('noodle'); // 'noodle' or 'rubik'

  // --- Noodle Algorithm State ---
  const initialNoodleSteps = [
    { id: 'water', text: '১. পাত্রে ২ কাপ পানি দিন', order: 1, icon: '🚰' },
    { id: 'boil', text: '২. চুলা জ্বালিয়ে পানি ফোটান', order: 2, icon: '🔥' },
    { id: 'noodle', text: '৩. ফুটন্ত পানিতে নুডলস দিন', order: 3, icon: '🍜' },
    { id: 'spice', text: '৪. দুই মিনিট পর মশলা দিন', order: 4, icon: '🌶️' },
    { id: 'serve', text: '৫. বাটিতে নামিয়ে পরিবেশন করুন', order: 5, icon: '🍽️' },
  ];

  const [selectedNoodleSequence, setSelectedNoodleSequence] = useState([]);
  const [noodleExecutionStatus, setNoodleExecutionStatus] = useState('idle'); // 'idle', 'running', 'success', 'failed'
  const [noodleErrorMessage, setNoodleErrorMessage] = useState('');

  // --- Rubik's Cube State ---
  const initialCubeColors = [
    '#3b82f6', '#3b82f6', '#ef4444', 
    '#10b981', '#ef4444', '#10b981', 
    '#f59e0b', '#f59e0b', '#ffffff'
  ];
  const solvedCubeColors = [
    '#ef4444', '#ef4444', '#ef4444',
    '#ef4444', '#ef4444', '#ef4444',
    '#ef4444', '#ef4444', '#ef4444'
  ];
  const [cubeColors, setCubeColors] = useState([...initialCubeColors]);
  const [cubeStep, setCubeStep] = useState(0);
  const [isSolvingCube, setIsSolvingCube] = useState(false);

  // --- Noodle Logic ---
  const handleSelectStep = (step) => {
    if (selectedNoodleSequence.find(s => s.id === step.id)) return;
    setSelectedNoodleSequence([...selectedNoodleSequence, step]);
  };

  const handleRemoveStep = (stepId) => {
    setSelectedNoodleSequence(selectedNoodleSequence.filter(s => s.id !== stepId));
    setNoodleExecutionStatus('idle');
  };

  const runNoodleAlgorithm = () => {
    if (selectedNoodleSequence.length < 5) {
      setNoodleExecutionStatus('failed');
      setNoodleErrorMessage('অ্যালগরিদম অসম্পূর্ণ! ৫টি ধাপই সাজাতে হবে।');
      return;
    }

    setNoodleExecutionStatus('running');
    setNoodleErrorMessage('');

    setTimeout(() => {
      if (selectedNoodleSequence[0].id !== 'water') {
        setNoodleExecutionStatus('failed');
        setNoodleErrorMessage('ভুল অ্যালগরিদম! পাত্রে পানি না দিয়ে চুলা বা মশলা দিলে প্যান পুড়ে ধোঁয়া বের হবে! 💥');
        return;
      }
      if (selectedNoodleSequence[1].id !== 'boil') {
        setNoodleExecutionStatus('failed');
        setNoodleErrorMessage('ভুল অ্যালগরিদম! ঠান্ডা পানিতে সরাসরি নুডলস বা মশলা দিলে জগাখিচুড়ি পাকিয়ে যাবে! 🤢');
        return;
      }
      if (selectedNoodleSequence[2].id !== 'noodle') {
        setNoodleExecutionStatus('failed');
        setNoodleErrorMessage('ভুল অ্যালগরিদম! নুডলস দেওয়ার আগেই মশলা দিয়ে অনেকক্ষণ ফোটালে গন্ধ নষ্ট হয়ে যাবে!');
        return;
      }
      if (selectedNoodleSequence[3].id !== 'spice') {
        setNoodleExecutionStatus('failed');
        setNoodleErrorMessage('ভুল অ্যালগরিদম! মশলা না দিয়ে আগেই নামিয়ে নিলে কোনো টেস্টই পাবেন না।');
        return;
      }
      setNoodleExecutionStatus('success');
    }, 1500);
  };

  const resetNoodleGame = () => {
    setSelectedNoodleSequence([]);
    setNoodleExecutionStatus('idle');
    setNoodleErrorMessage('');
  };

  // --- Rubik's Cube Logic ---
  const scrambleCube = () => {
    setCubeColors([...initialCubeColors]);
    setCubeStep(0);
    setIsSolvingCube(false);
  };

  const playRubikAlgorithm = () => {
    if (isSolvingCube) return;
    setIsSolvingCube(true);
    setCubeStep(0);

    setTimeout(() => {
      setCubeColors(prev => { const next = [...prev]; next[2] = '#ef4444'; next[5] = '#ef4444'; next[8] = '#ef4444'; return next; });
      setCubeStep(1);
    }, 1000);

    setTimeout(() => {
      setCubeColors(prev => { const next = [...prev]; next[0] = '#ef4444'; next[1] = '#ef4444'; next[2] = '#ef4444'; return next; });
      setCubeStep(2);
    }, 2000);

    setTimeout(() => {
      setCubeColors(prev => { const next = [...prev]; next[3] = '#ef4444'; next[4] = '#ef4444'; next[5] = '#ef4444'; return next; });
      setCubeStep(3);
    }, 3000);

    setTimeout(() => {
      setCubeColors([...solvedCubeColors]);
      setCubeStep(4);
      setIsSolvingCube(false);
    }, 4000);
  };

  return (
    <div className="w-full space-y-6 md:space-y-8 font-sans text-gray-200">
      
      {/* Header Area */}
      <div className="pb-3 space-y-3 text-center sm:pb-4">
        <h2 className="flex flex-wrap items-center justify-center gap-2 text-xl font-bold text-white sm:text-2xl md:gap-3 md:text-3xl">
          <span className="bg-indigo-600 text-white text-xs px-2.5 py-1 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)] sm:px-3 sm:text-sm">ল্যাব-০৭</span>
          অ্যালগরিদম (Algorithm)
        </h2>
        <p className="max-w-2xl mx-auto mt-2 px-2 text-sm sm:text-base md:text-lg text-gray-400 sm:px-0">
          কোনো নির্দিষ্ট কাজ বা সমস্যা সমাধান করার জন্য ধাপে ধাপে সাজানো নির্দেশিকা (Step-by-step instructions)।
        </p>
      </div>

      {/* Simulation Guide Card */}
      <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5 md:p-6 shadow-md font-sans">
        <h3 className="flex items-center gap-2 text-base font-bold text-slate-100 sm:text-lg mb-3">
          <span className="text-indigo-400 animate-pulse">💡</span> ল্যাব সিমুলেটর গাইড
        </h3>
        <p className="text-sm sm:text-base leading-relaxed text-slate-300 mb-4">
          এই সিমুলেটরের মাধ্যমে আপনি বাস্তব জীবনের সাধারণ উদাহরণ এবং গাণিতিক সূত্র ব্যবহার করে অ্যালগরিদম কীভাবে কাজ করে তা নিজে হাতে চালিয়ে বুঝতে পারবেন।
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="bg-[#0b0f19]/60 border border-white/5 p-4 rounded-xl space-y-2">
            <span className="font-bold text-indigo-300 flex items-center gap-1.5">
              <span className="text-base">🍜</span> ১. নুডলস রান্নার অ্যালগরিদম
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              একটি সঠিক নুডলস রান্না করার জন্য উপলব্ধ ধাপগুলো ক্রমানুসারে সাজান এবং রান করুন। ভুল ক্রমানুসারে সাজালে কী ধরনের জটিলতা তৈরি হতে পারে তা স্বচক্ষে দেখুন।
            </p>
          </div>
          <div className="bg-[#0b0f19]/60 border border-white/5 p-4 rounded-xl space-y-2">
            <span className="font-bold text-[#d8b4fe] flex items-center gap-1.5">
              <span className="text-base">🧩</span> ২. রুবিক্স কিউবের সূত্র
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              কোটি কোটি কালার কম্বিনেশনের মধ্য থেকে মাত্র ৪টি সুনির্দিষ্ট ধাপের (U → R → U' → R') অ্যালগরিদম লুপ চালিয়ে কীভাবে ওলটপালট কিউব সমাধান করা যায় তা পর্যবেক্ষণ করুন।
            </p>
          </div>
          <div className="bg-[#0b0f19]/60 border border-white/5 p-4 rounded-xl space-y-2">
            <span className="font-bold text-[#fbcfe8] flex items-center gap-1.5">
              <span className="text-base">🤖</span> ৩. প্রচলিত বনাম এমএল অ্যালগরিদম
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              প্রচলিত অ্যালগরিদম (যা হার্ডকোডেড নিয়মে চলে) এবং মেশিন লার্নিং অ্যালগরিদম (যা ডেটা দেখে নিজের নিয়ম নিজে বানিয়ে নেয়) এর মধ্যকার মূল দার্শনিক পার্থক্যটি ডান পাশের প্যানেল থেকে বুঝুন।
            </p>
          </div>
        </div>
      </div>

      {/* Selector Sub-menu */}
      <div className="flex justify-center bg-[#1e2430] p-1.5 rounded-xl border border-gray-700 max-w-md mx-auto w-full gap-2 shadow-lg">
        <button 
          onClick={() => setAlgoMode('noodle')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm md:text-base font-bold transition-all ${algoMode === 'noodle' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
        >
          🍜 নুডলস রান্নার অ্যালগরিদম
        </button>
        <button 
          onClick={() => setAlgoMode('rubik')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm md:text-base font-bold transition-all ${algoMode === 'rubik' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
        >
          🧩 রুবিক্স কিউবের সূত্র
        </button>
      </div>

      {/* --- SUB-TAB 1: NOODLE ALGORITHM BUILDER --- */}
      {algoMode === 'noodle' && (
        <div className="grid items-stretch grid-cols-1 gap-5 md:gap-6 lg:grid-cols-12">
          
          {/* Left: Drag / Click Steps List */}
          <div className="lg:col-span-5 bg-[#1e2430] p-4 sm:p-5 rounded-2xl border border-gray-700 flex flex-col justify-between shadow-xl">
            <div>
              <h3 className="flex items-center gap-2 pb-2 mb-3 text-base sm:text-lg font-bold text-indigo-400 border-b border-gray-700">
                <span>📋</span> উপলব্ধ ধাপসমূহ
              </h3>
              <p className="mb-4 text-xs sm:text-sm leading-relaxed text-gray-400">
                সঠিক অ্যালগরিদম তৈরি করতে নিচের ধাপগুলোতে ক্রমানুসারে ক্লিক করুন:
              </p>

              <div className="space-y-2">
                {initialNoodleSteps.map((step) => {
                  const isSelected = selectedNoodleSequence.find(s => s.id === step.id);
                  return (
                    <button
                      key={step.id}
                      disabled={isSelected || noodleExecutionStatus === 'running'}
                      onClick={() => handleSelectStep(step)}
                      className={`w-full text-left p-3 rounded-xl border text-sm sm:text-base font-bold transition-all flex items-center gap-3 ${
                        isSelected 
                          ? 'bg-gray-800/40 border-gray-800 text-gray-600 cursor-not-allowed' 
                          : 'bg-[#12161f] border-gray-700 hover:border-indigo-500 text-gray-200 shadow-sm'
                      }`}
                    >
                      <span className="text-xl bg-gray-800 p-1.5 rounded-lg">{step.icon}</span>
                      <span>{step.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button 
                onClick={runNoodleAlgorithm}
                disabled={selectedNoodleSequence.length === 0 || noodleExecutionStatus === 'running'}
                className="flex-[2] py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs sm:text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-50"
              >
                🚀 অ্যালগরিদম চালান (Run)
              </button>
              <button 
                onClick={resetNoodleGame}
                className="flex-1 px-4 py-3 text-xs sm:text-sm font-bold text-gray-300 transition-colors bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700"
              >
                রিসেট
              </button>
            </div>
          </div>

          {/* Right: Selected Sequence & Animation Cooking Area */}
          <div className="lg:col-span-7 bg-[#1e2430] p-4 sm:p-6 rounded-2xl border border-gray-700 flex flex-col justify-between gap-6 shadow-xl">
            <div>
              <h3 className="flex items-center gap-2 pb-2 mb-4 text-base sm:text-lg font-bold text-white border-b border-gray-700">
                <span className="text-indigo-400">🛠️</span> আপনার সাজানো অ্যালগরিদম
              </h3>

              <div className="min-h-[80px] bg-[#12161f] p-3 sm:p-4 rounded-xl border border-gray-800 flex flex-wrap gap-2 items-center shadow-inner">
                {selectedNoodleSequence.length === 0 ? (
                  <p className="w-full text-xs sm:text-sm italic text-center text-gray-500">বাম পাশের প্যানেল থেকে ধাপগুলো সাজান...</p>
                ) : (
                  selectedNoodleSequence.map((step, idx) => (
                    <div key={step.id} className="bg-indigo-900/30 border border-indigo-500/50 pl-3 pr-2 py-1.5 rounded-lg flex items-center gap-2 text-xs sm:text-sm font-bold text-indigo-200 animate-fade-in shadow-sm">
                      <span>{idx + 1}. {step.icon}</span>
                      <button 
                        onClick={() => handleRemoveStep(step.id)}
                        className="text-gray-400 hover:text-rose-400 hover:bg-gray-800 p-0.5 rounded-full transition-colors ml-1"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Animated Kitchen Simulator */}
            <div className="bg-[#12161f] p-4 sm:p-6 rounded-2xl border border-gray-800 text-center relative overflow-hidden flex-1 flex flex-col justify-center items-center shadow-inner text-sm sm:text-base">
              {noodleExecutionStatus === 'idle' && (
                <div className="space-y-3 text-gray-500">
                  <div className="text-5xl sm:text-6xl opacity-50">🍳</div>
                  <p className="text-sm sm:text-base font-bold text-gray-400">রান্নাঘর প্রস্তুত। অ্যালগরিদম সাজিয়ে রান করুন!</p>
                </div>
              )}

              {noodleExecutionStatus === 'running' && (
                <div className="space-y-4 text-indigo-400">
                  <div className="text-5xl sm:text-6xl animate-bounce">🍲</div>
                  <p className="px-4 py-2 font-mono text-xs sm:text-sm font-bold border rounded-lg animate-pulse bg-indigo-900/20 border-indigo-500/30">
                    নির্দেশিকা অনুসরণ করে পানি ও নুডলস রান্না হচ্ছে...
                  </p>
                </div>
              )}

              {noodleExecutionStatus === 'success' && (
                <div className="space-y-3 text-emerald-400 animate-fade-in">
                  <div className="text-6xl sm:text-7xl animate-bounce">🍜✨</div>
                  <p className="text-base sm:text-lg font-bold text-emerald-300">অ্যালগরিদম সফল! সুস্বাদু নুডলস তৈরি হয়েছে!</p>
                  <p className="text-xs sm:text-sm text-emerald-400/70">কারণ প্রতিটি ধাপ সঠিক ক্রমানুসারে (১, ২, ৩, ৪, ৫) কাজ করেছে।</p>
                </div>
              )}

              {noodleExecutionStatus === 'failed' && (
                <div className="space-y-4 text-rose-400 animate-fade-in">
                  <div className="text-6xl sm:text-7xl">💨🌋</div>
                  <p className="text-base sm:text-lg font-bold text-rose-300">রান্না ব্যর্থ হয়েছে!</p>
                  <p className="max-w-sm p-3 mx-auto text-xs sm:text-sm leading-relaxed border shadow-sm text-rose-200 bg-rose-900/30 border-rose-500/50 rounded-xl">
                    {noodleErrorMessage}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-[#12161f] p-4 rounded-xl text-xs sm:text-sm text-gray-400 leading-relaxed border border-gray-800">
              <strong className="text-indigo-400">💡 অ্যালগরিদম কী?</strong> ম্যাগি নুডলস রান্নার জন্য আমরা যে ধাপে ধাপে নিয়মগুলো মেনে চললাম—এটাই অ্যালগরিদম। পানির আগে খালি চুলায় মশলা দিলে কিংবা সেদ্ধ হওয়ার আগে পরিবেশন করলে পুরো সিস্টেম ক্র্যাশ করে!
            </div>
          </div>
        </div>
      )}

      {/* --- SUB-TAB 2: RUBIK'S CUBE ALGORITHM SOLVER --- */}
      {algoMode === 'rubik' && (
        <div className="grid items-stretch grid-cols-1 gap-5 md:gap-6 lg:grid-cols-12">
          
          {/* Left: 2D Cube representation & State display */}
          <div className="lg:col-span-5 bg-[#1e2430] p-4 sm:p-6 rounded-2xl border border-gray-700 flex flex-col justify-between shadow-xl">
            <div>
              <h3 className="flex items-center gap-2 pb-2 mb-2 text-base sm:text-lg font-bold text-indigo-400 border-b border-gray-700">
                <span>🧩</span> ওলটপালট রুবিক্স কিউব
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 mb-6 leading-relaxed">
                অ্যালগরিদম ছাড়া এই কোটি কোটি কালারের কম্বিনেশন মেলানো অসম্ভব!
              </p>

              {/* 2D Rubik Cube View (Front Face Grid) */}
              <div className="grid grid-cols-3 gap-2 max-w-[180px] mx-auto bg-[#0b0f19] p-3 rounded-xl border border-gray-700 shadow-inner mb-8">
                {cubeColors.map((color, idx) => (
                  <div 
                    key={idx} 
                    style={{ backgroundColor: color }}
                    className="transition-all duration-700 border rounded-md shadow-sm aspect-square border-black/40"
                  />
                ))}
              </div>

              {/* Step Indicators */}
              <div className="space-y-2.5 max-w-[280px] mx-auto">
                {[
                  { id: 1, label: "১. Right Up (R)" },
                  { id: 2, label: "২. Top Left (U)" },
                  { id: 3, label: "৩. Right Down (R')" },
                  { id: 4, label: "৪. Top Right (U')" }
                ].map((step) => (
                  <div 
                    key={step.id} 
                    className={`p-2.5 rounded-lg text-xs sm:text-sm font-mono font-bold flex justify-between items-center transition-colors ${
                      cubeStep >= step.id 
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
                        : 'bg-black/20 text-gray-500 border border-gray-800'
                    }`}
                  >
                    <span>{step.label}</span>
                    {cubeStep >= step.id && <span className="text-xs uppercase tracking-wider">✓ সম্পন্ন</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 mt-8">
              <button 
                onClick={playRubikAlgorithm}
                disabled={isSolvingCube || cubeStep === 4}
                className="flex-[2] py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs sm:text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-50"
              >
                {"🚀 অ্যালগরিদম চালান (U → R → U' → R')"}
              </button>
              <button 
                onClick={scrambleCube}
                className="flex-1 py-3 text-xs sm:text-sm font-bold text-gray-300 transition-colors bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700"
              >
                ওলটপালট (Scramble)
              </button>
            </div>
          </div>

          {/* Right: Explanation of Rubik's and traditional vs ML algorithms */}
          <div className="lg:col-span-7 bg-[#1e2430] p-4 sm:p-6 rounded-2xl border border-gray-700 flex flex-col justify-between gap-6 shadow-xl">
            <div>
              <h3 className="flex items-center gap-2 pb-2 mb-4 text-base sm:text-lg font-bold text-white border-b border-gray-700">
                <span className="text-indigo-400">🔮</span> অ্যালগরিদমের শক্তি
              </h3>

              <div className="space-y-4">
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed bg-[#12161f] p-4 rounded-xl border border-gray-800">
                  রুবিক্স কিউবের কোটি কোটি কম্বিনেশন থাকলেও, সুনির্দিষ্ট গাণিতিক <strong>অ্যালগরিদম (যেমন: U R U' R')</strong> ব্যবহার করলে যে কেউ মাত্র কয়েক মিনিটে এটি মেলাতে পারবে। 
                </p>
                
                <div className="bg-[#12161f] p-4 sm:p-5 rounded-xl border border-gray-800 space-y-4 shadow-inner mt-4">
                  <h4 className="pb-2 text-xs sm:text-sm font-bold tracking-widest text-indigo-400 uppercase border-b border-gray-700">প্রচলিত অ্যালগরিদম বনাম এমএল অ্যালগরিদম:</h4>
                  <ul className="space-y-4 text-xs sm:text-sm text-gray-400">
                    <li className="flex items-start gap-3">
                      <span className="text-lg">🤖</span>
                      <div>
                        <strong className="block mb-1 font-bold text-gray-200">প্রচলিত অ্যালগরিদম:</strong> 
                        "আমি তোমাকে সব নিয়ম বলে দিচ্ছি, তুমি শুধু এই নিয়ম মেনে অন্ধের মতো হিসাব করো।" (যেমন: সর্টিং অ্যালগরিদম)।
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-lg">🧠</span>
                      <div>
                        <strong className="block mb-1 font-bold text-indigo-300">মেশিন লার্নিং অ্যালগরিদম:</strong> 
                        "আমি তোমাকে শুধু শেখার গাণিতিক ইঞ্জিনটা দিচ্ছি (যেমন: ডিসিশন ট্রি), তুমি নিজে ডেটা ঘেঁটে নিয়ম ও সমাধান তৈরি করে নাও।"
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 text-xs sm:text-sm leading-relaxed text-indigo-200 border bg-indigo-900/10 rounded-xl border-indigo-500/20">
              <strong>রিমিশার টেক-ইনসাইট:</strong> অ্যালগরিদম কোনো জাদুর কাঠি নয়, এটি স্রেফ নিখুঁত যুক্তির এক সুন্দর মালা। একটি ভালো অ্যালগরিদম একটি সাধারণ কম্পিউটারকে জিনিয়াসে রূপান্তর করতে পারে, আর একটি ভুল অ্যালগরিদম সুপারকম্পিউটারকেও বোকা বানিয়ে দিতে পারে!
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
