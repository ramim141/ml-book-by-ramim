import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles } from 'lucide-react';

export default function SimulationLab() {
  const [activeTab, setActiveTab] = useState('arena');
  const [speed, setSpeed] = useState(80); 
  const [braking, setBraking] = useState(30); 
  const [sensors, setSensors] = useState(5); 
  const [directTuning, setDirectTuning] = useState(false); 

  const [selectedTrack, setSelectedTrack] = useState('train'); 
  const [isDriving, setIsDriving] = useState(false);
  const [driveProgress, setDriveProgress] = useState(0);
  const [logs, setLogs] = useState(['সিস্টেম রেডি। গাড়ি টিউন করে ট্র্যাক সিলেক্ট করুন।']);
  const [crashEvent, setCrashEvent] = useState(null); 

  const [trainScore, setTrainScore] = useState(null);
  const [valScore, setValScore] = useState(null);
  const [testScore, setTestScore] = useState(null);
  const [realWorldScore, setRealWorldScore] = useState(null);

  const calculateResult = useCallback((trackType) => {
    let trainVal = 100;
    if (speed > 160) trainVal = 90;
    if (sensors < 5) trainVal -= 10;

    let valVal = 100;
    if (speed > 110) valVal -= (speed - 110) * 0.95; 
    else if (speed < 70) valVal -= (70 - speed) * 0.6;
    if (braking < 25) valVal -= (25 - braking) * 1.8; 
    else if (braking > 45) valVal -= (braking - 45) * 0.8;
    valVal += (sensors - 5) * 4;

    let testVal = 100;
    if (speed > 130) testVal -= (speed - 130) * 1.2;
    else if (speed < 90) testVal -= (90 - speed) * 0.4;
    if (braking < 20) testVal -= (20 - braking) * 2.5;
    else if (braking > 35) testVal -= (braking - 35) * 1.2;
    testVal += (sensors - 5) * 2.5;

    let realVal = 100;
    if (speed > 85) realVal -= (speed - 85) * 1.6;
    else if (speed < 55) realVal -= (55 - speed) * 0.5;
    if (braking < 32) realVal -= (32 - braking) * 2.8; 
    realVal += (sensors - 5) * 5;

    let finalTrain = Math.max(10, Math.min(100, Math.round(trainVal)));
    let finalVal = Math.max(10, Math.min(100, Math.round(valVal)));
    let finalTest = Math.max(10, Math.min(100, Math.round(testVal)));
    let finalReal = Math.max(5, Math.min(100, Math.round(realVal)));

    if (directTuning) {
      if (speed >= 125 && braking <= 20 && sensors <= 5) {
        finalTest = 98;
        finalReal = 12; 
      } else {
        finalTest = Math.min(95, finalTest + 20);
        finalReal = Math.max(5, finalReal - 40);
      }
    }

    return { train: finalTrain, val: finalVal, test: finalTest, real: finalReal };
  }, [speed, braking, sensors, directTuning]);

  const runDriveSimulation = useCallback(() => {
    if (isDriving) return;

    if (directTuning && selectedTrack === 'validation') {
      setLogs(prev => [
        `⚠️ ত্রুটি: আপনি 'সরাসরি চ্যাম্পিয়নশিপ টিউনিং' (প্রশ্ন ফাঁস) সচল রেখেছেন!`,
        `ভ্যালিডেশন প্র্যাকটিস ট্র্যাক এখন নিষিদ্ধ!`,
        ...prev
      ]);
      return;
    }

    setIsDriving(true);
    setDriveProgress(0);
    setCrashEvent(null);
    setLogs([`🚀 গাড়ি স্টার্ট হয়েছে! ট্র্যাক: ${selectedTrack === 'train' ? 'সোজা ট্রেনিং রোড' : selectedTrack === 'validation' ? 'আঁকাবাঁকা প্র্যাকটিস রোড (Validation)' : 'গোপন চ্যাম্পিয়নশিপ রোড (Testing)'}`]);

    const results = calculateResult(selectedTrack);
    let currentPct = 0;

    const interval = setInterval(() => {
      currentPct += 2;
      setDriveProgress(currentPct);

      if (currentPct === 20) setLogs(prev => [`📡 রাডার সেন্সর স্ক্যান সক্রিয়। সামনে মোড় পর্যবেক্ষণ করা হচ্ছে।`, ...prev]);
      
      if (currentPct === 50) {
        setLogs(prev => [`⚡ গতি নিয়ন্ত্রণ এবং এআই ব্রেকিং প্যাটার্ন পরীক্ষা করা হচ্ছে...`, ...prev]);
        
        if (selectedTrack === 'validation' && (speed > 115 || braking < 22)) {
          setCrashEvent('crashed');
          setLogs(prev => [`💥 দুর্ঘটনা! অতিরিক্ত স্পিড বা কম ব্রেক করার কারণে গাড়িটি প্র্যাকটিস ট্র্যাকে উল্টে গেছে!`, ...prev]);
          clearInterval(interval);
          setIsDriving(false);
          setValScore(15);
          return;
        }
        if (selectedTrack === 'test' && (speed > 135 || braking < 18)) {
          setCrashEvent('crashed');
          setLogs(prev => [`💥 বিপর্যয়! চ্যাম্পিয়নশিপ ট্র্যাকে হঠাৎ মারাত্মক বাঁকে গাড়িটি নিয়ন্ত্রণ হারিয়ে বাউন্ডারি ওয়ালে আঘাত করেছে!`, ...prev]);
          clearInterval(interval);
          setIsDriving(false);
          setTestScore(10);
          setRealWorldScore(5);
          return;
        }
      }
      
      if (currentPct === 80) setLogs(prev => [`🏁 গাড়িটি শেষ ল্যাপ অতিক্রম করছে। টাইমিং হিসেব করা হচ্ছে...`, ...prev]);

      if (currentPct >= 100) {
        clearInterval(interval);
        setIsDriving(false);
        setLogs(prev => [`✅ ল্যাপ সম্পূর্ণ! নিখুঁতভাবে শেষ সীমায় পৌঁছেছে।`, ...prev]);
        
        if (selectedTrack === 'train') { setTrainScore(results.train); setCrashEvent('perfect'); }
        else if (selectedTrack === 'validation') { setValScore(results.val); setCrashEvent(results.val >= 85 ? 'perfect' : 'sluggish'); }
        else if (selectedTrack === 'test') { setTestScore(results.test); setRealWorldScore(results.real); setCrashEvent(results.test >= 85 ? 'perfect' : 'sluggish'); }
      }
    }, 40);
  }, [isDriving, directTuning, selectedTrack, calculateResult, speed, braking]);

  const getCarCoordinates = () => {
    const t = driveProgress / 100;
    if (selectedTrack === 'train') {
      const angle = t * Math.PI * 2;
      return { x: 50 + 35 * Math.cos(angle), y: 50 + 35 * Math.sin(angle) };
    } else if (selectedTrack === 'validation') {
      return { x: t * 80 + 10, y: 50 + 25 * Math.sin(t * Math.PI * 3) };
    } else {
      let x = t * 80 + 10;
      let y = 50;
      if (t > 0.4 && t < 0.7) y = 50 + (t - 0.4) * 100; 
      else if (t >= 0.7) y = 80;
      return { x, y };
    }
  };

  const carPos = getCarCoordinates();

  const handleReset = useCallback(() => {
    setSpeed(80); setBraking(30); setSensors(5); setDirectTuning(false);
    setTrainScore(null); setValScore(null); setTestScore(null); setRealWorldScore(null);
    setDriveProgress(0); setIsDriving(false); setCrashEvent(null);
    setLogs(['রিসেট সম্পন্ন। নতুন স্ট্র্যাটেজিতে টিউনিং শুরু করুন।']);
  }, []);

  return (
    <div className="w-full font-sans text-slate-200 space-y-8">
      <div className="text-center space-y-3 pb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center justify-center gap-3">
          <span className="bg-amber-600/20 text-amber-500 border border-amber-500/30 text-xs px-3 py-1 rounded-full shadow-lg">ল্যাব-২৭</span>
          এআই সেলফ-ড্রাইভিং কার টিউনিং
        </h2>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">গোপন চ্যাম্পিয়নশিপের ট্রফি জিততে ডেটা ফাঁস না করে কিভাবে আমাদের নিজস্ব প্র্যাকটিস ট্র্যাকে এআই গাড়ির সেটিংস নিখুঁত করতে হয় তা পরীক্ষা করুন।</p>
      </div>

      {/* Simulation Guide Card */}
      <div className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-5 md:p-6 shadow-xl relative backdrop-blur-md mb-8">
          <div className="absolute top-4 right-4 text-amber-500/30"><Sparkles size={24} /></div>
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-100 sm:text-lg mb-3">
              <span className="text-amber-400 animate-pulse">💡</span> ল্যাব সিমুলেটর গাইড
          </h3>
          <p className="text-sm sm:text-base leading-relaxed text-slate-300 mb-5">
              এই ল্যাবে আপনি দেখতে পারবেন কীভাবে ভ্যালিডেশন সেটে প্যারামিটার টিউন করে মডেল উন্নত করা যায়, এবং টেস্টিং সেটে টিউন করলে (ডেটা লিকেজ) রিয়েল ওয়ার্ল্ডে কী ভয়াবহ পরিণতি হয়!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs sm:text-sm">
              <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl space-y-2 hover:border-amber-500/30 transition-all duration-300">
                  <span className="font-bold text-amber-400 flex items-center gap-2">
                      <span className="text-lg">🏎️</span> প্র্যাকটিস ট্র্যাক (Validation)
                  </span>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                      এখানে গাড়ির স্পিড ও ব্রেক বারবার পরিবর্তন করে সেরা টিউনিং বের করুন। এই ট্র্যাকের ডেটা মডেলের পারফরম্যান্স ইমপ্রুভ করতে ব্যবহৃত হয়।
                  </p>
              </div>
              <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl space-y-2 hover:border-emerald-500/30 transition-all duration-300">
                  <span className="font-bold text-emerald-400 flex items-center gap-2">
                      <span className="text-lg">🏆</span> চ্যাম্পিয়নশিপ ট্র্যাক (Testing)
                  </span>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                      ভ্যালিডেশনে সেরা রেজাল্ট পাওয়ার পর শুধু একবার এই ট্র্যাকে ফাইনাল পরীক্ষা দিন। ভুলেও এই ট্র্যাকের ওপর ভিত্তি করে টিউনিং করবেন না!
                  </p>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: Cockpit Tuning */}
        <div className="lg:col-span-5 bg-[#1e2430] p-6 rounded-3xl border border-gray-700 flex flex-col justify-between gap-6 shadow-xl">
          <div>
            <h3 className="text-sm font-bold text-amber-400 mb-4 border-b border-gray-700 pb-2 flex items-center gap-2">
              <span>🎛️</span> ককপিট টিউনিং কনসোল
            </h3>
            
            <div className="space-y-4">
              <div className="bg-[#12161f] p-4 rounded-xl border border-gray-800">
                <div className="flex justify-between text-xs font-bold mb-2 text-gray-300">
                  <span>🏎️ সর্বোচ্চ গতি (Speed):</span>
                  <span className="text-amber-400 font-mono">{speed} km/h</span>
                </div>
                <input type="range" min="40" max="180" step="5" value={speed} onChange={(e) => setSpeed(parseInt(e.target.value))} disabled={isDriving} className="w-full accent-amber-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
              </div>

              <div className="bg-[#12161f] p-4 rounded-xl border border-gray-800">
                <div className="flex justify-between text-xs font-bold mb-2 text-gray-300">
                  <span>🛑 ব্রেকিং রেঞ্জ (Brake):</span>
                  <span className="text-indigo-400 font-mono">{braking} মিটার</span>
                </div>
                <input type="range" min="10" max="60" step="5" value={braking} onChange={(e) => setBraking(parseInt(e.target.value))} disabled={isDriving} className="w-full accent-indigo-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
              </div>

              <div className="bg-[#12161f] p-4 rounded-xl border border-gray-800">
                <div className="flex justify-between text-xs font-bold mb-2 text-gray-300">
                  <span>📡 রাডার সেন্সর:</span>
                  <span className="text-emerald-400 font-mono">{sensors} টি</span>
                </div>
                <input type="range" min="3" max="9" step="2" value={sensors} onChange={(e) => setSensors(parseInt(e.target.value))} disabled={isDriving} className="w-full accent-emerald-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
              </div>

              {/* Data Leakage Toggle */}
              <div className="bg-red-950/20 p-4 rounded-xl border border-red-500/30 flex items-center justify-between group">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-red-400">⚠️ চ্যাম্পিয়নশিপ ট্র্যাকে সরাসরি উঁকি মারা!</span>
                  <span className="text-[10px] text-gray-400 mt-1">(প্রশ্ন ফাঁস বা Data Leakage)</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={directTuning} onChange={(e) => { setDirectTuning(e.target.checked); if(e.target.checked) setValScore(null); }} disabled={isDriving} className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block text-center">চালানোর জন্য ট্র্যাক পছন্দ করুন:</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'train', label: 'ট্রেনিং', icon: '🚙' },
                { id: 'validation', label: 'প্র্যাকটিস', icon: '🏎️', disabled: directTuning },
                { id: 'test', label: 'ফাইনাল রেস', icon: '🏆' }
              ].map(t => (
                <button key={t.id} onClick={() => setSelectedTrack(t.id)} disabled={isDriving || t.disabled} className={`py-3 rounded-xl border text-[11px] font-bold transition-all flex flex-col items-center gap-1 ${t.disabled ? 'bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed' : selectedTrack === t.id ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md' : 'bg-[#12161f] border-gray-800 text-gray-400 hover:border-gray-700'}`}>
                  <span className="text-lg">{t.icon}</span> <span>{t.label}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={runDriveSimulation} disabled={isDriving} className="flex-[2] py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50 flex justify-center gap-2">
                {isDriving ? 'রানিং...' : '🏁 ড্রাইভ শুরু করুন'}
              </button>
              {driveProgress > 0 && !isDriving && (
                <button onClick={handleReset} className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 text-xs font-bold rounded-xl">রিসেট</button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Visual Arena and Track Dashboard */}
        <div className="lg:col-span-7 bg-[#1e2430] p-6 rounded-3xl border border-gray-700 flex flex-col justify-between shadow-xl">
          <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-6">
            <h3 className="text-sm font-bold text-white tracking-wider">লাইভ রেস ভিজ্যুয়ালাইজার</h3>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
              Track: {selectedTrack === 'train' ? 'ওভাল' : selectedTrack === 'validation' ? 'এস-কার্ভ' : 'হেয়ারপিন'}
            </span>
          </div>

          <div className="relative w-full h-56 bg-[#0b0f19] rounded-2xl border border-gray-800 overflow-hidden shadow-inner flex items-center justify-center">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:16px_16px]"></div>

            {selectedTrack === 'train' && (
              <div className="absolute flex items-center justify-center border-4 border-dashed rounded-full w-36 h-36 border-indigo-500/20">
                <span className="text-[10px] text-indigo-500/50 font-bold uppercase tracking-wider">ট্রেণিং লুপ</span>
              </div>
            )}
            {selectedTrack === 'validation' && (
              <svg className="absolute inset-0 w-full h-full p-6 text-amber-500/25">
                <path d="M 20,90 Q 150,0 200,90 T 380,90" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="6,6" strokeLinecap="round" />
                <text x="20" y="30" className="text-[9px] fill-amber-500/40 font-bold uppercase">ভ্যালিডেশন এস-কার্ভ</text>
              </svg>
            )}
            {selectedTrack === 'test' && (
              <svg className="absolute inset-0 w-full h-full p-6 text-emerald-500/20">
                <path d="M 20,50 L 160,50 L 200,130 L 380,130" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="6,6" strokeLinecap="round" />
                <circle cx="200" cy="130" r="14" className="fill-red-500/10 stroke-red-500/40" />
              </svg>
            )}

            {crashEvent === 'crashed' && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-red-950/40 backdrop-blur-sm animate-fade-in">
                <span className="text-5xl animate-bounce">💥 CRASHED!</span>
                <span className="text-[11px] text-red-400 font-bold mt-2">গাড়িটি ট্র্যাকে নিয়ন্ত্রণ হারিয়েছে!</span>
              </div>
            )}

            {isDriving && (
              <div className="absolute z-10 text-3xl transition-all duration-75" style={{ left: `${carPos.x}%`, top: `${carPos.y}%`, transform: 'translate(-50%, -50%)' }}>
                🏎️
              </div>
            )}

            {!isDriving && !crashEvent && (
              <div className="text-center text-gray-500 z-10 space-y-2">
                <span className="text-4xl block">🚥</span>
                <span className="text-xs font-bold">ড্রাইভ স্টার্ট বাটনে ক্লিক করুন</span>
              </div>
            )}
          </div>

          {/* Performance Report Card */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#12161f] p-4 rounded-xl border border-indigo-500/20 text-center shadow-inner">
              <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest block mb-1">Train Score</span>
              <p className="text-2xl font-black text-white font-mono">{trainScore !== null ? `${trainScore}%` : 'N/A'}</p>
            </div>
            <div className={`bg-[#12161f] p-4 rounded-xl border text-center shadow-inner ${directTuning ? 'border-red-900/30 opacity-40' : 'border-amber-500/20'}`}>
              <span className="text-[9px] text-amber-400 font-bold uppercase tracking-widest block mb-1">Val Score</span>
              <p className="text-2xl font-black text-white font-mono">{directTuning ? 'N/A' : valScore !== null ? `${valScore}%` : 'N/A'}</p>
            </div>
            <div className="bg-[#12161f] p-4 rounded-xl border border-emerald-500/20 text-center shadow-inner">
              <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest block mb-1">Test Score</span>
              <p className="text-2xl font-black text-white font-mono">{testScore !== null ? `${testScore}%` : 'N/A'}</p>
            </div>
            <div className="bg-[#12161f] p-4 rounded-xl border border-rose-500/20 text-center shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-rose-500 text-black text-[7px] font-black px-1.5 rounded-bl">Real</div>
              <span className="text-[9px] text-rose-400 font-bold uppercase tracking-widest block mb-1">World Perf.</span>
              <p className={`text-2xl font-black font-mono ${realWorldScore !== null && realWorldScore < 40 ? 'text-rose-400 animate-pulse' : 'text-white'}`}>{realWorldScore !== null ? `${realWorldScore}%` : 'N/A'}</p>
            </div>
          </div>
          
          <div className="bg-[#12161f] p-4 rounded-xl border border-gray-800 mt-6 text-xs text-gray-400 leading-relaxed font-sans text-center">
            {directTuning && testScore ? <span className="text-rose-400 font-bold">🚨 বিপদ! আপনি টেস্ট ট্র্যাক দেখে কার টিউন করেছেন (Data Leakage)। তাই টেস্টে ৯৮% পেলেও রিয়েল ওয়ার্ল্ডে গাড়িটি চরমভাবে ব্যর্থ হয়েছে!</span> : <span>ভ্যালিডেশন সেটের স্কোর দেখে প্যারামিটার টিউন করুন। টেস্ট সেটে ভুলেও হাত দেওয়া যাবে না!</span>}
          </div>
        </div>
      </div>

    </div>
  );
}