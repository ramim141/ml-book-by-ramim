import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Info } from 'lucide-react';

export default function SimulationLab() {
  const [dataVolume, setDataVolume] = useState('low'); // 'low', 'medium', 'high'
  const [carState, setCarState] = useState('idle'); // 'idle', 'driving', 'crashed_pedestrian', 'crashed_oil', 'completed'
  const [driveProgress, setDriveProgress] = useState(0);
  const [activeWeather, setActiveWeather] = useState('sunny'); // 'sunny', 'rainy'
  const [sensorStatus, setSensorStatus] = useState('scanning'); // 'scanning', 'obstacle_detected'
  
  const [speed, setSpeed] = useState(0);
  const [steeringAngle, setSteeringAngle] = useState(0);
  const [traction, setTraction] = useState(100);

  const [logs, setLogs] = useState(["সিস্টেম প্রস্তুত। ডেটা ভলিউম সিলেক্ট করে সিমুলেশন রান করুন!"]);

  const dataSpecs = {
    low: { label: "১০০ মাইল (Low)", size: "১০০টি সাধারণ ড্রাইভ", accuracy: 25, weather: "শুধুমাত্র রোদ ☀️", cost: "বিনা মূল্যে", color: "text-rose-400" },
    medium: { label: "১০,০০০ মাইল (Mid)", size: "১০,০০০টি মিশ্র ড্রাইভ", accuracy: 65, weather: "রোদ ও সোজা রাস্তায় বৃষ্টি ☀️🌧️", cost: "মাঝারি খরচ", color: "text-amber-400" },
    high: { label: "১,০০০,০০০ মাইল (Big)", size: "১,০০০,০০০টি কর্নার কেস", accuracy: 98, weather: "রোদ, বৃষ্টি, পিচ্ছিল রাস্তা ☀️🌧️🌫️", cost: "উচ্চ ইনভেস্টমেন্ট", color: "text-emerald-400" }
  };

  useEffect(() => {
    let interval;
    if (carState === 'driving') {
      interval = setInterval(() => {
        setDriveProgress(prev => {
          const nextProgress = prev + 1;

          setSpeed(Math.min(90, 40 + nextProgress * 0.8));
          setSteeringAngle(Math.round(Math.sin(nextProgress * 0.15) * 20));

          // Event 1: Pedestrian
          if (nextProgress === 25) {
            setSensorStatus('obstacle_detected');
            if (dataVolume === 'low') {
              clearInterval(interval);
              setCarState('crashed_pedestrian');
              setSpeed(0); setTraction(0);
              setLogs(l => ["💥 ক্র্যাশ! এআই গাড়িটি হঠাৎ সামনে আসা পথচারীকে সনাক্ত করতে পারেনি!", "💡 ডিকোড: ১০০ মাইলের ডেটাসেটে কোনো পথচারীর ডেটা ছিল না। ডাটা গ্যাপের কারণে এআই ব্রেক কষতে ব্যর্থ হয়েছে!", ...l]);
              return prev;
            } else {
              setLogs(l => ["🛡️ পথচারী সনাক্ত! এআই ইমার্জেন্সি অটো-ব্রেক সক্রিয় করে পথচারীকে নিরাপদে পার হতে দিল।", ...l]);
            }
          }

          if (nextProgress === 35) setSensorStatus('scanning');

          // Event 2: Rain & Oil Spill
          if (nextProgress === 60) {
            setActiveWeather('rainy');
            setTraction(60);
            setLogs(l => ["🌧️ ওয়েদার অ্যালার্ট: হঠাৎ মুষলধারে বৃষ্টি শুরু হলো এবং রাস্তায় ওয়েল স্পিল (Oil Spill) সনাক্ত হলো!", ...l]);
          }

          if (nextProgress === 65) {
            if (dataVolume === 'medium') {
              clearInterval(interval);
              setCarState('crashed_oil');
              setSpeed(0); setTraction(10);
              setLogs(l => ["🌧️💥 পিচ্ছিল রাস্তায় ভয়াবহ ক্র্যাশ!", "💡 ডিকোড: মাঝারি ডেটাসেটে সোজা রাস্তার ডেটা থাকলেও বৃষ্টির সাথে তেলের মিশ্রণের (Oil Spill) চরম কর্নার কেস (Corner Case) ছিল না!", ...l]);
              return prev;
            } else {
              setTraction(45);
              setLogs(l => ["🛡️ অ্যান্টি-লক ব্রেকিং (ABS) সক্রিয়! বিশাল ডেটা থেকে শেখা গাণিতিক মডেল গাড়িটিকে নিরাপদে নিয়ন্ত্রণে রাখল।", ...l]);
            }
          }

          if (nextProgress >= 100) {
            clearInterval(interval);
            setCarState('completed');
            setSpeed(0); setTraction(100);
            setLogs(l => ["🏆 মিশন সফল! (Inference Success)", "💡 ডিকোড: ১,০০০,০০০ মাইলের ডেটাসেটে রোদ, বৃষ্টি, পিচ্ছিল বাঁক ও কর্নার কেসের নিখুঁত প্যাটার্ন থাকায় এআই সফলভাবে জেনারেল ডিসিশন নিতে পেরেছে।", ...l]);
            return 100;
          }
          return nextProgress;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [carState, dataVolume]);

  const runSimulation = () => {
    setCarState('driving');
    setDriveProgress(0);
    setActiveWeather('sunny');
    setTraction(100);
    setSensorStatus('scanning');
    setLogs([`🏎️ এআই রানিং! গাড়িটি "${dataSpecs[dataVolume].label}"-এর অভিজ্ঞতা ব্যবহার করে স্টার্ট নিয়েছে...`]);
  };

  const getCarY = (x) => 80 + Math.sin(x * 0.035) * 45;
  const carX = 30 + (driveProgress / 100) * 320;
  const carY = getCarY(carX);

  return (
    <div className="w-full font-sans text-slate-200 space-y-8">
      <div className="text-center space-y-3 pb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center justify-center gap-3">
          <span className="bg-indigo-600 text-white text-xs px-3 py-1 rounded-full shadow-lg">ল্যাব-২১</span>
          সেলফ-ড্রাইভিং কার ল্যাব
        </h2>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">মেশিনের ব্রেন কতটা নির্ভরযোগ্য তা নির্ভর করে ট্রেইনিং ডেটার গভীরতা ও বাস্তবসম্মত উদাহরণের ওপর।</p>
      </div>

      {/* Simulation Guide Card */}
      <div className="rounded-[2rem] border border-indigo-500/20 bg-indigo-950/20 p-6 md:p-8 shadow-2xl relative backdrop-blur-md overflow-hidden">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />
        <div className="absolute top-6 right-6 text-indigo-400/30"><Sparkles size={32} className="animate-pulse" /></div>
        
        <h3 className="flex items-center gap-3 text-lg font-black text-slate-100 sm:text-xl mb-3 relative z-10">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-inner">💡</span> 
          ল্যাব সিমুলেটর গাইড
        </h3>
        <p className="text-sm sm:text-base leading-relaxed text-slate-300 mb-6 max-w-3xl relative z-10">
          এই সিমুলেটরের মাধ্যমে আমরা দেখব, <strong>ট্রেইনিং ডেটার পরিমাণের</strong> ওপর একটি এআই (যেমন সেলফ-ড্রাইভিং কার) এর কাজের দক্ষতা কীভাবে নির্ভর করে। বামদিকের প্যানেল থেকে ডেটাসেট বেছে নিয়ে রান করুন।
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm relative z-10">
          {/* Low Data Guide */}
          <div className="bg-[#121620]/80 border border-white/5 p-5 rounded-2xl space-y-3 hover:border-rose-500/30 hover:bg-rose-950/20 transition-all duration-300 group shadow-lg">
            <span className="font-bold text-rose-400 flex items-center gap-2">
              <span className="text-2xl group-hover:scale-110 transition-transform">🥚</span> ১০০ মাইল (Low Data)
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              কম ডেটা দিয়ে ট্রেন করালে এআই সাধারণ রাস্তা চিনলেও, হঠাৎ কোনো পথচারী সামনে এলে তাকে সনাক্ত করতে পারবে না এবং ক্র্যাশ করবে।
            </p>
          </div>
          
          {/* Mid Data Guide */}
          <div className="bg-[#121620]/80 border border-white/5 p-5 rounded-2xl space-y-3 hover:border-amber-500/30 hover:bg-amber-950/20 transition-all duration-300 group shadow-lg">
            <span className="font-bold text-amber-400 flex items-center gap-2">
              <span className="text-2xl group-hover:scale-110 transition-transform">🥛</span> ১০,০০০ মাইল (Mid Data)
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              মাঝারি ডেটায় পথচারী চিনলেও, বৃষ্টির দিনে রাস্তায় ওয়েল স্পিল (Oil Spill) বা পিচ্ছিল রাস্তার মতো 'কর্নার কেস' এর ডেটা না থাকায় গাড়িটি স্লিপ করবে।
            </p>
          </div>

          {/* High Data Guide */}
          <div className="bg-[#121620]/80 border border-white/5 p-5 rounded-2xl space-y-3 hover:border-emerald-500/30 hover:bg-emerald-950/20 transition-all duration-300 group shadow-lg">
            <span className="font-bold text-emerald-400 flex items-center gap-2">
              <span className="text-2xl group-hover:scale-110 transition-transform">🏭</span> ১ মিলিয়ন মাইল (Big Data)
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              বিশাল ডেটাসেটে রোদ, বৃষ্টি, পিচ্ছিল বাঁক এবং পথচারীর সব প্যাটার্ন থাকায় মডেলটি ১০০% সফলতার সাথে গন্তব্যে পৌঁছাবে।
            </p>
          </div>
        </div>
      </div>

      <div className="relative rounded-[2.5rem] bg-[#0b111b] border border-white/5 p-6 md:p-8 lg:p-10 shadow-2xl overflow-hidden mt-8">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          
          {/* Left: Dataset Specs */}
          <div className="lg:col-span-4 bg-gradient-to-b from-[#1e2430] to-[#121620] p-6 rounded-[2rem] border border-white/5 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><span className="text-lg">📂</span></div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">ডেটাসেট ভলিউম</h3>
              </div>
              
              <div className="space-y-3">
                {['low', 'medium', 'high'].map(item => (
                  <button
                    key={item}
                    disabled={carState === 'driving'}
                    onClick={() => {setDataVolume(item); setCarState('idle'); setDriveProgress(0); setLogs(["সিস্টেম প্রস্তুত।"]);}}
                    className={`group w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none ${dataVolume === item ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_5px_20px_rgba(99,102,241,0.15)]' : 'bg-white/[0.03] border-white/5 hover:border-indigo-500/30'}`}
                  >
                    <span className="flex items-center gap-4">
                      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-black/40 text-xl shadow-inner group-hover:scale-110 transition-transform">
                        {item === 'low' ? '🥚' : item === 'medium' ? '🥛' : '🏭'}
                      </span>
                      <span className={`font-bold ${dataVolume === item ? 'text-indigo-300' : 'text-slate-300 group-hover:text-white'}`}>{dataSpecs[item].label}</span>
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded bg-black/40 ${dataVolume === item ? 'text-indigo-400' : 'text-slate-500'}`}>{dataSpecs[item].accuracy}%</span>
                  </button>
                ))}
              </div>

              <div className="mt-8 bg-black/40 p-5 rounded-2xl border border-white/5 shadow-inner">
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-4">এআই ট্রেনিং স্পেসিফিকেশন</span>
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-slate-400">মোট অভিজ্ঞতা</span><span className="font-bold text-white text-right">{dataSpecs[dataVolume].size}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-slate-400">ওয়েদার সাপোর্ট</span><span className="font-bold text-white text-right">{dataSpecs[dataVolume].weather}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">মডেল এক্যুরেসি</span><span className={`font-mono font-black text-base ${dataSpecs[dataVolume].color} drop-shadow-md`}>{dataSpecs[dataVolume].accuracy}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button 
                onClick={runSimulation} 
                disabled={carState === 'driving'} 
                className="group flex-[2] relative overflow-hidden bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-[0_10px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_15px_30px_rgba(99,102,241,0.4)] hover:-translate-y-1 active:translate-y-1 disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all text-xs flex justify-center items-center gap-2"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <span className="text-base group-hover:rotate-12 transition-transform">🏁</span> সিমুলেশন রান করুন
              </button>
              <button 
                onClick={() => {setCarState('idle'); setDriveProgress(0); setLogs(["সিস্টেম প্রস্তুত।"]);}} 
                className="flex-1 py-4 bg-slate-800 rounded-xl border border-white/5 hover:bg-slate-700 hover:border-white/20 shadow-lg hover:-translate-y-1 active:translate-y-1 transition-all text-slate-300 font-bold text-xs uppercase tracking-widest"
              >
                রিসেট
              </button>
            </div>
          </div>

          {/* Center: Live Road Simulation */}
          <div className="lg:col-span-8 bg-gradient-to-b from-[#1e2430] to-[#121620] p-6 md:p-8 rounded-[2rem] border border-white/5 shadow-xl flex flex-col justify-between gap-6 relative overflow-hidden">
            <div className="flex justify-between items-center border-b border-white/5 pb-4 z-10">
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span> লাইভ রোড ট্র্যাকার
              </h3>
              <span className={`text-[10px] px-3 py-1.5 rounded-full font-mono font-bold uppercase tracking-wider transition-all shadow-inner ${activeWeather === 'sunny' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-blue-500/10 text-blue-400 border border-blue-500/30 animate-pulse'}`}>
                {activeWeather === 'sunny' ? 'Sunny ☀️' : 'Rainy 🌧️'}
              </span>
            </div>

            {/* Road Visualizer */}
            <div className="w-full bg-[#0b0f19] p-4 rounded-2xl border border-black/50 h-56 relative overflow-hidden flex items-center justify-center shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] z-10">
              {activeWeather === 'rainy' && (
                <div className="absolute inset-0 bg-blue-900/10 pointer-events-none animate-[pulse_2s_ease-in-out_infinite] flex flex-col justify-between py-1 z-20 mix-blend-screen">
                  <div className="flex justify-around text-blue-400/20 text-xs translate-x-4 animate-[slide_1s_linear_infinite]"><span>💧</span><span>💧</span><span>💧</span><span>💧</span></div>
                  <div className="flex justify-around text-blue-400/20 text-xs -translate-x-4 animate-[slide_1.5s_linear_infinite]"><span>💧</span><span>💧</span><span>💧</span><span>💧</span></div>
                </div>
              )}

              <svg viewBox="0 0 400 160" className="w-full h-full drop-shadow-xl">
                {/* Road */}
                <path d="M 20,80 L 50,80 C 180,220 220,-60 350,80 L 380,80" fill="none" stroke="#1c2438" strokeWidth="36" strokeLinecap="round" />
                <path d="M 20,80 L 50,80 C 180,220 220,-60 350,80 L 380,80" fill="none" stroke="#0b0f19" strokeWidth="32" strokeLinecap="round" />
                {/* Center Line */}
                <path d="M 20,80 L 50,80 C 180,220 220,-60 350,80 L 380,80" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeDasharray="8,8" opacity="0.6"/>

                {/* Pedestrian */}
                <g transform="translate(125, 82)"><rect x="-10" y="5" width="20" height="4" fill="#ffffff" rx="1" opacity="0.8" /><rect x="-10" y="15" width="20" height="4" fill="#ffffff" rx="1" opacity="0.8" /><text x="-6" y="32" fontSize="16" filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.5))">🚶‍♂️</text></g>
                
                {/* Oil Spill */}
                <g transform="translate(245, 25)"><ellipse cx="15" cy="15" rx="16" ry="8" fill="#3b82f6" opacity="0.2" filter="blur(2px)" /><ellipse cx="15" cy="15" rx="12" ry="6" fill="#8b5cf6" opacity="0.3" /><text x="5" y="18" fontSize="12">🧼</text></g>
                
                {/* Finish Line */}
                <line x1="365" y1="50" x2="365" y2="110" stroke="#10b981" strokeWidth="4" strokeDasharray="4,4" opacity="0.8" />
                <text x="372" y="83" fill="#10b981" fontSize="10" fontWeight="bold" filter="drop-shadow(0 0 5px rgba(16,185,129,0.5))">GOAL 🏁</text>

                {/* Sensor Rays */}
                {carState === 'driving' && (
                  <g>
                    {sensorStatus === 'obstacle_detected' ? (
                      <><line x1={carX} y1={carY} x2={carX+50} y2={carY-20} stroke="#ef4444" strokeWidth="2" strokeDasharray="2,2" opacity="0.8" /><line x1={carX} y1={carY} x2={carX+50} y2={carY+20} stroke="#ef4444" strokeWidth="2" strokeDasharray="2,2" opacity="0.8" /><circle cx={carX+40} cy={carY} r="20" fill="none" stroke="#ef4444" strokeWidth="1.5" className="animate-ping" opacity="0.6" /></>
                    ) : (
                      <><line x1={carX} y1={carY} x2={carX+45} y2={carY-25} stroke="#10b981" strokeWidth="0.5" strokeDasharray="4,4" opacity="0.6" /><line x1={carX} y1={carY} x2={carX+60} y2={carY} stroke="#10b981" strokeWidth="0.5" strokeDasharray="4,4" opacity="0.6" /><line x1={carX} y1={carY} x2={carX+45} y2={carY+25} stroke="#10b981" strokeWidth="0.5" strokeDasharray="4,4" opacity="0.6" /></>
                    )}
                  </g>
                )}

                {/* Car */}
                <g transform={`translate(${carX - 16}, ${carY - 16})`} style={{ transition: 'transform 100ms linear' }}>
                  <text x="0" y="16" fontSize="28" className="select-none filter drop-shadow-xl">
                    {carState === 'crashed_pedestrian' || carState === 'crashed_oil' ? "💥" : "🚗"}
                  </text>
                </g>
              </svg>

              <div className="absolute top-3 left-3 text-[10px] font-mono flex gap-2 text-slate-300 bg-black/60 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
                <span className="font-bold text-slate-500">LIDAR:</span>
                <span className={sensorStatus === 'scanning' ? 'text-emerald-400' : 'text-rose-400 font-bold animate-pulse'}>
                  {sensorStatus === 'scanning' ? '🟢 Scanning' : '🔴 Alert'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 z-10">
              <div className="bg-black/30 p-4 rounded-2xl border border-white/5 text-center shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 bg-indigo-500/5"></div>
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-1">গতি (Speed)</span>
                <span className="text-lg font-bold text-white font-mono">{speed} <span className="text-xs text-slate-500 font-sans">km/h</span></span>
              </div>
              <div className="bg-black/30 p-4 rounded-2xl border border-white/5 text-center shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 bg-indigo-500/5"></div>
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-1">স্টিয়ারিং কোণ</span>
                <span className="text-lg font-bold text-indigo-400 font-mono">{steeringAngle}°</span>
              </div>
              <div className="bg-black/30 p-4 rounded-2xl border border-white/5 text-center shadow-inner relative overflow-hidden">
                <div className={`absolute inset-0 ${traction > 50 ? 'bg-emerald-500/5' : 'bg-rose-500/10 animate-pulse'}`}></div>
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-1">ট্র্যাকশন</span>
                <span className={`text-lg font-bold font-mono ${traction > 50 ? 'text-emerald-400' : 'text-rose-400'}`}>{traction}%</span>
              </div>
              <div className="bg-black/30 p-4 rounded-2xl border border-white/5 flex flex-col justify-center text-center shadow-inner relative overflow-hidden">
                <span className={`text-xs font-black uppercase tracking-widest ${carState === 'completed' ? 'text-emerald-400' : carState.includes('crashed') ? 'text-rose-400 animate-bounce' : 'text-slate-500'}`}>
                  {carState === 'completed' ? '🟢 Success' : carState.includes('crashed') ? '💥 Overfit Crash' : 'Status'}
                </span>
              </div>
            </div>

            {/* Logs Terminal */}
            <div className="bg-[#05080f] p-5 rounded-2xl border border-white/10 h-32 font-mono text-xs overflow-y-auto space-y-3 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] z-10 custom-scrollbar">
              <div className="text-slate-600 text-[10px] uppercase tracking-widest mb-2 border-b border-white/5 pb-2">Terminal Output</div>
              {logs.map((log, idx) => (
                <div key={idx} className={`flex items-start gap-3 ${idx === 0 ? 'text-indigo-300 font-bold animate-[pulse_1.5s_ease-in-out_infinite]' : 'text-slate-500'}`}>
                  <span className="text-indigo-500/50 select-none">❯</span>
                  <p className="leading-relaxed whitespace-pre-wrap">{log}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <div className="p-5 bg-indigo-950/20 border border-indigo-500/20 rounded-3xl flex items-start gap-4">
        <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400 shadow-inner"><Info size={20}/></div>
        <p className="text-sm md:text-base text-slate-400 leading-relaxed italic">
          <strong className="text-white font-bold">রিমিশার উপলব্ধি:</strong> এআই মডেল আসলে নিজে থেকে কোনো নতুন জ্ঞান সৃষ্টি করে না। আমরা তাকে বাস্তবে যতো বেশি এবং বৈচিত্র্যময় ডেটা দেবো, সে ততো ভালো সিদ্ধান্ত নিতে পারবে।
        </p>
      </div>
    </div>
  );
}