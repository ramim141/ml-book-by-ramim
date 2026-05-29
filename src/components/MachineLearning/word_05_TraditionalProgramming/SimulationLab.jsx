import React, { useState } from 'react';

export default function SimulationLab() {
  const [sandboxMode, setSandboxMode] = useState('five'); // 'five' or 'atm'

  // --- State for "Draw a 5" Challenge ---
  const [grid, setGrid] = useState(Array(25).fill(0));
  const [showFiveExplanation, setShowFiveExplanation] = useState(false);

  // --- State for ATM Simulator ---
  const [pin, setPin] = useState('');
  const [atmStatus, setAtmStatus] = useState('idle'); // 'idle', 'success', 'fail'
  const [atmLogs, setAtmLogs] = useState([]);

  // Ideal patterns for "5" in 5x5 grid
  const idealFive = [
    1, 1, 1, 1, 1,
    1, 0, 0, 0, 0,
    1, 1, 1, 1, 1,
    0, 0, 0, 0, 1,
    1, 1, 1, 1, 1
  ];

  const idealRightFive = [
    0, 1, 1, 1, 1,
    0, 1, 0, 0, 0,
    0, 1, 1, 1, 1,
    0, 0, 0, 0, 1,
    0, 1, 1, 1, 1
  ];

  const idealTiltedFive = [
    1, 1, 1, 1, 0,
    1, 0, 0, 0, 0,
    0, 1, 1, 1, 0,
    0, 0, 0, 1, 0,
    1, 1, 1, 1, 0
  ];

  // --- Grid Operations ---
  const togglePixel = (index) => {
    const newGrid = [...grid];
    newGrid[index] = newGrid[index] === 1 ? 0 : 1;
    setGrid(newGrid);
    setShowFiveExplanation(true);
  };

  const clearGrid = () => {
    setGrid(Array(25).fill(0));
    setShowFiveExplanation(false);
  };

  const loadPreset = (type) => {
    if (type === 'perfect') setGrid([...idealFive]);
    if (type === 'shifted') setGrid([...idealRightFive]);
    if (type === 'tilted') setGrid([...idealTiltedFive]);
    setShowFiveExplanation(true);
  };

  // --- Rules Evaluation ---
  const evalTraditionalFive = () => {
    for (let i = 0; i < 25; i++) {
      if (grid[i] !== idealFive[i]) return false;
    }
    return true;
  };

  const evalMLFive = () => {
    const checkMatch = (pattern) => {
      let hits = 0;
      let activePattern = 0;
      let totalDrawn = grid.filter((p) => p === 1).length;

      for (let i = 0; i < 25; i++) {
        if (pattern[i] === 1) activePattern++;
        if (grid[i] === 1 && pattern[i] === 1) hits++;
      }

      if (totalDrawn === 0) return 0;
      const excess = Math.max(0, totalDrawn - hits);
      const score = (hits / activePattern) * 100 - excess * 8;
      return Math.max(0, Math.min(100, Math.round(score)));
    };

    const s1 = checkMatch(idealFive);
    const s2 = checkMatch(idealRightFive);
    const s3 = checkMatch(idealTiltedFive);
    return Math.max(s1, s2, s3);
  };

  const traditionalPassed = evalTraditionalFive();
  const mlScore = evalMLFive();

  // --- ATM Simulator Logic ---
  const correctPin = '1234';
  const handleAtmSubmit = (enteredPin) => {
    if (enteredPin.length < 4) return;
    if (enteredPin === correctPin) {
      setAtmStatus('success');
      setAtmLogs([
        "IF (pin == '1234') -> True",
        'Dispensing Cash... Success!',
        'Deterministic Output: 100% Match.',
      ]);
    } else {
      setAtmStatus('fail');
      setAtmLogs([
        "IF (pin == '1234') -> False",
        'Error: Pin Mismatch!',
        'Deterministic Output: Access Denied.',
      ]);
    }
  };

  const resetAtm = () => {
    setPin('');
    setAtmStatus('idle');
    setAtmLogs([]);
  };

  return (
    <div className="w-full space-y-6 md:space-y-8 font-sans text-slate-200">
      
      {/* Header Area */}
      <div className="pb-3 space-y-3 text-center sm:pb-4">
        <h2 className="flex flex-wrap items-center justify-center gap-2 text-xl font-bold text-white sm:text-2xl md:gap-3 md:text-3xl">
          <span className="px-2.5 py-1 text-xs border rounded-full bg-amber-500/20 text-amber-400 border-amber-500/30 sm:px-3 sm:text-sm">ল্যাব-০৫</span>
          প্রচলিত প্রোগ্রামিং (Traditional)
        </h2>
        <p className="max-w-2xl mx-auto px-2 text-sm sm:text-base md:text-lg text-slate-400 sm:px-0">
          এখানে মানুষ নিয়ম বানায় আর কম্পিউটার অন্ধের মতো হুকুম তামিল করে। নিয়মের বাইরে এক চুলও নড়ার শক্তি তার নেই!
        </p>
      </div>

      {/* Simulation Guide Card */}
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 md:p-6 shadow-md font-sans">
        <h3 className="flex items-center gap-2 text-base font-bold text-slate-100 sm:text-lg mb-3">
          <span className="text-amber-400 animate-pulse">💡</span> ল্যাব সিমুলেটর গাইড
        </h3>
        <p className="text-sm sm:text-base leading-relaxed text-slate-300 mb-4">
          এই সিমুলেটরের সাহায্যে আপনি প্রচলিত প্রোগ্রামিংয়ের কঠোর নিয়মাবলী এবং বাস্তব জীবনে এর সীমাবদ্ধতা হাতে-কলমে দেখতে পাবেন। নিচে ২টি ল্যাব এক্সপেরিমেন্ট রয়েছে:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="bg-[#0b0f19]/60 border border-white/5 p-4 rounded-xl space-y-2">
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <span className="text-base">🔢</span> ১. ৫ আঁকার চ্যালেঞ্জ
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              গ্রিডে ক্লিক করে একটি "৫" আঁকার চেষ্টা করুন। নিচে থাকা প্রিসেটগুলো ব্যবহার করে দেখুন কীভাবে প্রচলিত রুল-বেজড সিস্টেমে ১টি পিক্সেল পরিবর্তন হলেই সে আর চিনতে পারে না, কিন্তু মেশিন লার্নিং সঠিক সম্ভাবনার পার্সেন্টেজ স্কোর দেখায়।
            </p>
          </div>
          <div className="bg-[#0b0f19]/60 border border-white/5 p-4 rounded-xl space-y-2">
            <span className="font-bold text-[#d8b4fe] flex items-center gap-1.5">
              <span className="text-base">💳</span> ২. এটিএম বুথ সিমুলেটর
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              একটি এটিএম বুথ কীভাবে ডিটারমিনিস্টিক (১০০% নিখুঁত) `if-else` লজিক ব্যবহার করে কাজ করে তা দেখুন। সঠিক পিন (1234) দিয়ে সাবমিট করার মাধ্যমে ক্যাশ সংগ্রহ করার ট্রাই করুন।
            </p>
          </div>
          <div className="bg-[#0b0f19]/60 border border-white/5 p-4 rounded-xl space-y-2">
            <span className="font-bold text-[#fbcfe8] flex items-center gap-1.5">
              <span className="text-base">💻</span> ৩. কোড ও এক্সিকিউশন লগ
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              এটিএম বুথে কোডটি রান হওয়ার পর পেছনের সোর্স কোডের কোন লাইনগুলো কাজ করছে এবং এক্সিকিউশন লগে কোন কোন ডাটা প্রসেস হচ্ছে তা লাইভ দেখুন।
            </p>
          </div>
        </div>
      </div>

      {/* Simulator Selector Sub-menu */}
      <div className="bg-white/[0.02] p-1.5 mx-auto flex w-full max-w-md justify-center gap-2 rounded-xl border border-white/5 text-center shadow-lg">
        <button
          onClick={() => setSandboxMode('five')}
          className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition-all sm:text-sm md:text-base ${
            sandboxMode === 'five' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          🔢 ৫ আঁকার চ্যালেঞ্জ
        </button>
        <button
          onClick={() => setSandboxMode('atm')}
          className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition-all sm:text-sm md:text-base ${
            sandboxMode === 'atm' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          💳 এটিএম বুথ সিমুলেটর
        </button>
      </div>

      {/* --- SIMULATOR 1: DRAW A 5 CHALLENGE --- */}
      {sandboxMode === 'five' && (
        <div className="grid items-stretch grid-cols-1 gap-5 lg:grid-cols-12 md:gap-6">
          
          {/* Left: Pixel Drawer */}
          <div className="bg-white/[0.02] p-4 sm:p-5 flex flex-col justify-between rounded-2xl border border-white/5 lg:col-span-4 shadow-lg">
            <div>
              <h3 className="flex items-center gap-2 pb-2 mb-3 text-base sm:text-lg font-bold border-b text-amber-400 border-white/5">
                <span>✏️</span> গ্রিডে ৫ আঁকুন
              </h3>
              <p className="mb-4 text-xs sm:text-sm leading-relaxed text-slate-400">
                পিক্সেলগুলোতে ক্লিক করে আপনার নিজস্ব ভঙ্গিতে '৫' আঁকার চেষ্টা করুন।
              </p>

              {/* 5x5 Grid */}
              <div className="mx-auto mb-6 grid max-w-[200px] grid-cols-5 gap-1">
                {grid.map((pixel, i) => (
                  <button
                    key={i}
                    onClick={() => togglePixel(i)}
                    className={`aspect-square w-full rounded border transition-all duration-200 ${
                      pixel === 1
                        ? 'border-amber-400 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                        : 'border-white/5 bg-black/20 hover:bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Presets and Controls */}
            <div className="pt-4 space-y-3 border-t border-white/5">
              <div className="flex flex-wrap justify-center gap-2">
                <button onClick={() => loadPreset('perfect')} className="bg-white/5 border border-white/10 px-2 py-1.5 text-xs sm:text-sm font-bold text-slate-300 rounded hover:bg-white/10 transition-colors">নিখুঁত ৫</button>
                <button onClick={() => loadPreset('shifted')} className="bg-white/5 border border-white/10 px-2 py-1.5 text-xs sm:text-sm font-bold text-slate-300 rounded hover:bg-white/10 transition-colors">স্থানান্তরিত ৫</button>
                <button onClick={() => loadPreset('tilted')} className="bg-white/5 border border-white/10 px-2 py-1.5 text-xs sm:text-sm font-bold text-slate-300 rounded hover:bg-white/10 transition-colors">একটু বাঁকা ৫</button>
              </div>
              <button onClick={clearGrid} className="w-full py-2 text-xs sm:text-sm font-bold transition-colors border rounded-lg bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20">
                মুছে ফেলুন (Reset)
              </button>
            </div>
          </div>

          {/* Middle: Engine Processing Comparison */}
          <div className="bg-gradient-to-br from-white/[0.03] to-transparent p-4 sm:p-5 flex flex-col justify-between rounded-2xl border border-white/5 lg:col-span-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-sky-500"></div>
            <div>
              <h3 className="flex items-center gap-2 pb-2 mb-4 text-base sm:text-lg font-bold text-white border-b border-white/5">
                ⚙️ রিয়েল-টাইম সিদ্ধান্ত
              </h3>

              <div className="space-y-4">
                {/* Traditional Engine Card */}
                <div className={`rounded-xl border p-4 transition-all ${traditionalPassed ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-rose-500/20 bg-rose-500/10'}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">১. প্রচলিত প্রোগ্রামিং (রুল-বেজড)</span>
                    <span className={`rounded px-2 py-0.5 text-xs font-bold ${traditionalPassed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {traditionalPassed ? 'শনাক্ত হয়েছে' : 'ব্যর্থ'}
                    </span>
                  </div>
                  <p className={`mb-1 text-sm sm:text-base font-bold ${traditionalPassed ? 'text-emerald-300' : 'text-rose-300'}`}>
                    সিদ্ধান্ত: {traditionalPassed ? 'এটি নিখুঁত ৫!' : 'এটি ৫ নয়!'}
                  </p>
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-400 mt-2">
                    লজিক: <span className="bg-black/30 text-white rounded px-1.5 py-0.5 font-mono border border-white/5">IF (pixels !== ideal) THEN Error</span>
                  </p>
                </div>

                {/* Machine Learning Engine Card */}
                <div className={`rounded-xl border p-4 transition-all ${mlScore > 70 ? 'border-emerald-500/30 bg-emerald-500/10' : mlScore > 30 ? 'border-amber-500/20 bg-amber-500/10' : 'border-rose-500/20 bg-rose-500/10'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-sky-400">২. মেশিন লার্নিং (প্যাটার্ন-বেজড)</span>
                    <span className={`rounded px-2 py-0.5 text-xs font-bold ${mlScore > 70 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      ম্যাচ স্কোর: {mlScore}%
                    </span>
                  </div>
                  <p className={`mb-1 text-sm sm:text-base font-bold ${mlScore > 50 ? 'text-emerald-300' : 'text-rose-300'}`}>
                    সিদ্ধান্ত: {mlScore > 50 ? 'এটি খুব সম্ভবত একটি ৫!' : 'এটি ৫ হওয়ার সম্ভাবনা কম!'}
                  </p>
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-400 mt-2">
                    লজিক: <span className="bg-black/30 text-white rounded px-1.5 py-0.5 font-mono border border-white/5">Prob(৫ | Pattern) = {mlScore}%</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Instant feedback message */}
            {showFiveExplanation && (
              <div className="bg-amber-500/10 mt-4 rounded-lg border border-amber-500/20 p-3 text-xs sm:text-sm leading-relaxed text-amber-200">
                💡 <strong>রায়ান সাহেবের রিয়েলাইজেশন:</strong> দেখুন, আপনি যখন নিখুঁত ৫-কে একটু <strong>স্থানান্তরিত</strong> বা <strong>বাঁকা</strong> করে আঁকেন, প্রচলিত প্রোগ্রামিংয়ের কঠোর নিয়ম ধসে পড়ে। কারণ তার কাছে কোনো 'বাঁকা ৫' এর IF-ELSE কোড লেখা নেই।
              </div>
            )}
          </div>

          {/* Right: Difference Panel */}
          <div className="bg-white/[0.02] p-4 sm:p-5 flex flex-col justify-between rounded-2xl border border-white/5 lg:col-span-3 shadow-lg">
            <div>
              <h3 className="flex items-center gap-2 pb-2 mb-4 text-base sm:text-lg font-bold text-white border-b border-white/5">
                <span>⚖️</span> সমীকরণের তফাৎ
              </h3>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="p-3 border rounded-lg bg-black/20 border-white/5">
                  <p className="mb-1 font-bold text-amber-500">প্রচলিত প্রোগ্রামিং:</p>
                  <p className="mb-1 font-mono text-white text-xs sm:text-sm">Data + Rules = Output</p>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    প্রোগ্রামার লজিক বা নিয়মটি তৈরি করেন, কম্পিউটার তা দিয়ে আউটপুট জেনারেট করে।
                  </p>
                </div>

                <div className="p-3 border rounded-lg bg-black/20 border-white/5">
                  <p className="mb-1 font-bold text-sky-400">মেশিন লার্নিং:</p>
                  <p className="mb-1 font-mono text-white text-xs sm:text-sm">Data + Output = Rules</p>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    কম্পিউটারকে ডেটা এবং সঠিক উত্তর দিলে সে নিজেই ঘেঁটে নিয়ম বা লজিক তৈরি করে নেয়।
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-rose-500/10 border-rose-500/20 mt-4 rounded-xl border p-3 text-xs sm:text-sm text-rose-200 leading-relaxed">
              <strong>পরীক্ষা:</strong> নিখুঁত ৫ এর বাটন চেপে গ্রিড লোড করুন, এরপর একটি মাত্র পিক্সেল মুছে দিন। দেখবেন প্রচলিত সিস্টেমের সিদ্ধান্ত মুহূর্তে ব্যর্থ হয়ে গেছে!
            </div>
          </div>
        </div>
      )}

      {/* --- SIMULATOR 2: ATM SIMULATOR --- */}
      {sandboxMode === 'atm' && (
        <div className="grid items-stretch grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Left: ATM Device UI */}
          <div className="bg-white/[0.02] p-6 flex flex-col justify-between rounded-2xl border border-white/5 shadow-lg">
            <div>
              <h3 className="flex items-center gap-2 pb-2 mb-4 text-base sm:text-lg font-bold text-white border-b border-white/5">
                <span>🏧</span> ক্যাশ ডিসপেন্সার
              </h3>

              {/* Simulated Screen */}
              <div className="bg-[#0f172a] border-slate-700 p-5 shadow-inner mb-6 flex h-40 flex-col justify-center space-y-3 rounded-xl border-2 text-center relative overflow-hidden">
                {/* Screen Glare Effect */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-white/5"></div>

                {atmStatus === 'idle' && (
                  <div className="relative z-10 text-emerald-400">
                    <p className="mb-1 font-mono text-xs uppercase tracking-wider opacity-70">Secure Portal</p>
                    <p className="text-sm sm:text-base font-bold">৪ ডিজিটের পিন কোড দিন</p>
                    <p className="text-slate-500 mt-2 text-xs sm:text-sm italic">(সঠিক পিন: 1234)</p>
                  </div>
                )}

                {atmStatus === 'success' && (
                  <div className="relative z-10 space-y-1 animate-pulse text-emerald-400">
                    <p className="text-2xl">💰</p>
                    <p className="font-mono text-xs font-bold uppercase tracking-widest">Transaction Approved</p>
                    <p className="text-xs sm:text-sm text-white">টাকা বের হচ্ছে...</p>
                  </div>
                )}

                {atmStatus === 'fail' && (
                  <div className="relative z-10 space-y-1 text-rose-400">
                    <p className="text-2xl">🚨</p>
                    <p className="font-mono text-xs font-bold uppercase tracking-widest">Access Denied</p>
                    <p className="text-xs sm:text-sm text-white">ভুল পিন কোড!</p>
                  </div>
                )}
              </div>

              {/* Pin Input Display */}
              <div className="mb-6 text-center">
                <span className="px-6 py-2 font-mono text-2xl font-bold tracking-widest border rounded-lg text-amber-500 bg-black/30 border-white/5">
                  {pin ? pin.split('').map(() => '●').join(' ') : '- - - -'}
                </span>
              </div>

              {/* Keypad */}
              <div className="mx-auto grid max-w-[180px] grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '✓'].map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      if (key === 'C') { setPin(''); setAtmStatus('idle'); } 
                      else if (key === '✓') { handleAtmSubmit(pin); } 
                      else { if (pin.length < 4 && atmStatus === 'idle') setPin((prev) => prev + key); }
                    }}
                    className={`rounded-lg py-2.5 text-center text-sm font-bold transition-all border ${
                      key === 'C' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20' : 
                      key === '✓' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' : 
                      'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 shadow-sm'
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={resetAtm} className="w-full py-2 mt-6 text-xs sm:text-sm font-bold transition-colors border rounded-lg bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white">
              মেশিন রিস্টার্ট করুন
            </button>
          </div>

          {/* Middle: Code Logic */}
          <div className="bg-white/[0.02] p-6 flex flex-col justify-between rounded-2xl border border-white/5 shadow-lg">
            <div>
              <h3 className="flex items-center gap-2 pb-2 mb-4 text-base sm:text-lg font-bold border-b text-amber-400 border-white/5">
                <span>💻</span> ইফ-এলস (If-Else) লজিক
              </h3>
              <p className="mb-4 text-xs sm:text-sm leading-relaxed text-slate-400">
                `DB_PIN` এর সাথে ব্যবহারকারীর টাইপ করা পিন চেক করার ব্যাকএন্ড সোর্স কোড:
              </p>

              <div className="bg-[#0f172a] shadow-inner border-white/5 p-4 space-y-3 rounded-xl border font-mono text-xs sm:text-sm leading-relaxed">
                <div className={`rounded p-1.5 transition-all ${pin.length >= 4 ? 'bg-amber-500/10 text-amber-300' : 'text-slate-500'}`}>
                  const DB_PIN = "1234";
                </div>
                <div className={`rounded p-1.5 transition-all ${
                    atmStatus === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 border text-emerald-300' : 
                    atmStatus === 'fail' ? 'text-slate-500 opacity-50' : 
                    pin.length >= 4 ? 'bg-sky-500/10 text-sky-300' : 'text-slate-500'
                  }`}
                >
                  {'if (enteredPin === DB_PIN) {'}<br/>
                  &nbsp;&nbsp;<span className="text-emerald-400/50">// Approved!</span><br/>
                  &nbsp;&nbsp;dispenseCash();
                </div>
                <div className={`rounded p-1.5 transition-all ${
                    atmStatus === 'fail' ? 'bg-rose-500/10 border-rose-500/30 border text-rose-300' : 
                    atmStatus === 'success' ? 'text-slate-500 opacity-50' : 'text-slate-500'
                  }`}
                >
                  {'} else {'}<br/>
                  &nbsp;&nbsp;<span className="text-rose-400/50">// Reject!</span><br/>
                  &nbsp;&nbsp;throwError();<br/>
                  {'}'}
                </div>
              </div>
            </div>

            <div className="bg-sky-500/10 border-sky-500/20 mt-4 rounded-xl border p-4 text-xs sm:text-sm leading-relaxed text-sky-200">
              <strong>ডিটারমিনিস্টিক (Deterministic):</strong> এটিএম বুথে কোনো "আন্দাজ" বা সম্ভাবনার স্থান নেই। পিন ১০০% মিললেই কেবল কাজ সম্পন্ন হবে।
            </div>
          </div>

          {/* Right: Execution logs */}
          <div className="bg-white/[0.02] p-6 flex flex-col justify-between rounded-2xl border border-white/5 shadow-lg">
            <div>
              <h3 className="flex items-center gap-2 pb-2 mb-4 text-base sm:text-lg font-bold text-white border-b border-white/5">
                <span>📋</span> এক্সিকিউশন লগ
              </h3>
              <div className="space-y-3">
                {atmLogs.length === 0 ? (
                  <p className="mt-16 text-center text-xs sm:text-sm italic text-slate-500">
                    কিবোর্ডে পিন টাইপ করে টিক (✓) চাপলে এখানে লগ দেখা যাবে...
                  </p>
                ) : (
                  atmLogs.map((log, idx) => (
                    <div key={idx} className="bg-black/20 border-white/5 rounded-lg border p-3 font-mono text-xs text-slate-300 shadow-sm">
                      <span className="mr-2 text-amber-500">❯</span>{log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
