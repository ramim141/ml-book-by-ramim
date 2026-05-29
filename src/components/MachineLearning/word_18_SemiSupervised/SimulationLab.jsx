import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitMerge, Brain, User, RefreshCcw, Activity, Play, Zap, 
  Flame, ShieldAlert, Award, ArrowRight, Settings, Sparkles, Check
} from 'lucide-react';

export default function SimulationLab() {
  const [activeTab, setActiveTab] = useState('propagation');
  
  // --- Photo Propagation Logic ---
  const [isTraining, setIsTraining] = useState(false);
  const [propStep, setPropStep] = useState(0); // 0: idle, 1: scanning, 2: mapping, 3: propagating, 4: complete

  const initialPhotos = [
    { id: 1, isSeed: true, trueType: 'Rimisha', name: '👧 Rimisha (Seed)', color: 'border-pink-500 text-pink-400 bg-pink-500/10 shadow-pink-500/10' },
    { id: 2, isSeed: false, trueType: 'Rimisha', name: '❓ ট্যাগহীন', color: 'border-slate-800 text-slate-500 bg-slate-950/40' },
    { id: 3, isSeed: false, trueType: 'Rayan', name: '❓ ট্যাগহীন', color: 'border-slate-800 text-slate-500 bg-slate-950/40' },
    { id: 4, isSeed: true, trueType: 'Rayan', name: '👨 Rayan (Seed)', color: 'border-blue-500 text-blue-400 bg-blue-500/10 shadow-blue-500/10' },
    { id: 5, isSeed: false, trueType: 'Rimisha', name: '❓ ট্যাগহীন', color: 'border-slate-800 text-slate-500 bg-slate-950/40' },
    { id: 6, isSeed: false, trueType: 'Rayan', name: '❓ ট্যাগহীন', color: 'border-slate-800 text-slate-500 bg-slate-950/40' },
    { id: 7, isSeed: false, trueType: 'Rimisha', name: '❓ ট্যাগহীন', color: 'border-slate-800 text-slate-500 bg-slate-950/40' },
    { id: 8, isSeed: false, trueType: 'Rayan', name: '❓ ট্যাগহীন', color: 'border-slate-800 text-slate-500 bg-slate-950/40' },
    { id: 9, isSeed: false, trueType: 'Rimisha', name: '❓ ট্যাগহীন', color: 'border-slate-800 text-slate-500 bg-slate-950/40' },
    { id: 10, isSeed: false, trueType: 'Rayan', name: '❓ ট্যাগহীন', color: 'border-slate-800 text-slate-500 bg-slate-950/40' }
  ];

  const [photos, setPhotos] = useState(initialPhotos);

  const propagationLogs = [
    { title: "১. সিড ইমেজ চিহ্নিতকরণ", desc: "১০টি ছবির মধ্যে ২ টি Labeled Seed (Rimisha ও Rayan) চিহ্নিত করা হলো।" },
    { title: "২. কোসাইন সিমিলারিটি গ্রাফ", desc: "ছবিগুলোর চেহারার গাণিতিক মিল পরিমাপ করে একটি নোড নেটওয়ার্ক তৈরি করা হচ্ছে..." },
    { title: "৩. লেবেল প্রোপাগেশন", desc: "সাদৃশ্যের ঘনত্ব অনুসরণ করে সিড নোড থেকে কাছাকাছি নোডে ট্যাগ ছড়ানো হচ্ছে..." },
    { title: "৪. সিউডো-লেবেলিং সম্পন্ন", desc: "বাকি ৮টি ট্যাগহীন ইমেজে সফলভাবে স্বয়ংক্রিয় ট্যাগ বসানো সম্পন্ন হয়েছে।" }
  ];

  const startPropagation = () => {
    setIsTraining(true);
    setPropStep(1);
    
    // Step transitions
    const t1 = setTimeout(() => setPropStep(2), 800);
    const t2 = setTimeout(() => {
      setPropStep(3);
      // Make unlabeled photos start to pulse with tentative styles
      setPhotos(prev => prev.map(p => {
        if (p.isSeed) return p;
        return {
          ...p,
          name: '🔄 গণনা চলছে...',
          color: p.trueType === 'Rimisha' 
            ? 'border-pink-500/40 text-pink-500/50 bg-pink-500/5 animate-pulse' 
            : 'border-blue-500/40 text-blue-500/50 bg-blue-500/5 animate-pulse'
        };
      }));
    }, 1600);
    
    const t3 = setTimeout(() => {
      setPropStep(4);
      setPhotos(prev => prev.map(p => {
        if (p.isSeed) return p;
        return {
          ...p,
          name: p.trueType === 'Rimisha' ? '👧 Rimisha (Auto)' : '👨 Rayan (Auto)',
          color: p.trueType === 'Rimisha' 
            ? 'border-pink-500/40 text-pink-300 bg-pink-950/20' 
            : 'border-blue-500/40 text-blue-300 bg-blue-950/20'
        };
      }));
      setIsTraining(false);
    }, 2800);
  };

  const resetPropagation = () => {
    setPhotos(initialPhotos);
    setPropStep(0);
    setIsTraining(false);
  };

  // --- Robot RL Logic (Q-learning simulation) ---
  const [robotPos, setRobotPos] = useState(0);
  const [rlScore, setRlScore] = useState(0);
  const [isTrainingRL, setIsTrainingRL] = useState(false);
  const [rlLogs, setRlLogs] = useState(["❯ এআই রোবট স্টার্ট লাইনে প্রস্তুত।"]);
  const [floatingFeedback, setFloatingFeedback] = useState(null);
  
  // Q-Table simulation states for State 1 (Tile 1)
  const [qTable, setQTable] = useState({
    walk: 0,
    jump: 0
  });

  const trackTiles = [
    { id: 0, label: 'স্টার্ট', icon: '🚀', style: 'border-sky-500/30 bg-sky-950/20' },
    { id: 1, label: 'নিরাপদ', icon: '🟢', style: 'border-slate-800 bg-slate-900/40' },
    { id: 2, label: 'আগুন', icon: '🔥', style: 'border-red-500/30 bg-red-950/20 text-red-400' },
    { id: 3, label: 'চার্জ', icon: '🔋', style: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400 animate-pulse' },
    { id: 4, label: 'নিরাপদ', icon: '🟢', style: 'border-slate-800 bg-slate-900/40' },
    { id: 5, label: 'টার্গেট', icon: '🔌', style: 'border-indigo-500/30 bg-indigo-950/20' }
  ];

  const addRlLog = (msg) => {
    setRlLogs(prev => [msg, ...prev.slice(0, 8)]);
  };

  const triggerFloatingFeedback = (text, type) => {
    setFloatingFeedback({ text, type });
    setTimeout(() => setFloatingFeedback(null), 1000);
  };

  const handleRLStep = () => {
    if (robotPos === 5) {
      addRlLog("❯ লক্ষ্য অর্জিত হয়েছে! দয়া করে রিসেট করুন।");
      return;
    }

    if (robotPos === 0) {
      // Step to Tile 1
      setRobotPos(1);
      setRlScore(s => s + 5);
      triggerFloatingFeedback("+৫ পয়েন্ট", "reward");
      addRlLog("State 0: Walk Right ➔ State 1. Reward: +5. Q-Table অপরিবর্তিত।");
      return;
    }

    if (robotPos === 1) {
      // Here the agent chooses Walk (obstacle) or Jump (battery)
      // If Q(Jump) is higher, it will choose Jump. If equal, it tries Walk first to learn.
      if (qTable.walk === 0 && qTable.jump === 0) {
        // First trial: Walk into Fire (Exploration)
        setRobotPos(2);
        setRlScore(s => s - 15);
        setQTable(prev => ({ ...prev, walk: -15 }));
        triggerFloatingFeedback("-১৫ পেনাল্টি (আগুন)", "penalty");
        addRlLog("State 1: Walk Right ➔ State 2 (🔥 আগুন!). Penalty: -15. Q(Tile 1, Walk) = -15 এ নেমেছে!");
        
        // Auto back to state 1 after 1 second (recovery/trial restart)
        setTimeout(() => {
          setRobotPos(1);
          addRlLog("❯ রোবটটি ভুল থেকে শিখে পুনরায় State 1 এ ফিরে এসেছে।");
        }, 1200);
      } else {
        // Second trial: Jump over fire to battery (Exploitation of better choice)
        setRobotPos(3);
        setRlScore(s => s + 25);
        setQTable(prev => ({ ...prev, jump: +25 }));
        triggerFloatingFeedback("+২৫ রিওয়ার্ড (ব্যাটারি)", "reward");
        addRlLog("State 1: Jump Right ➔ State 3 (🔋 ব্যাটারি!). Reward: +25. Q(Tile 1, Jump) = +25 এ উঠেছে!");
      }
      return;
    }

    if (robotPos === 3) {
      // Step to Tile 4
      setRobotPos(4);
      setRlScore(s => s + 5);
      triggerFloatingFeedback("+৫ পয়েন্ট", "reward");
      addRlLog("State 3: Walk Right ➔ State 4. Reward: +5. Q-Table আপডেট সম্পন্ন।");
      return;
    }

    if (robotPos === 4) {
      // Step to Target
      setRobotPos(5);
      setRlScore(s => s + 50);
      triggerFloatingFeedback("+৫০ টার্গেট বোনাস!", "target");
      addRlLog("State 4: Walk Right ➔ State 5 (🔌 চার্জার!). Goal Reached! Reward: +50!");
      return;
    }
  };

  // Run automatically
  const runAutoTraining = () => {
    setIsTrainingRL(true);
    setRobotPos(0);
    setRlScore(0);
    setQTable({ walk: 0, jump: 0 });
    setRlLogs(["❯ অটোমেটিক রিইনফোর্সমেন্ট ট্রেনিং শুরু হচ্ছে..."]);

    // Timeout loop simulating steps
    setTimeout(() => {
      // Step 1: Move to 1
      setRobotPos(1);
      setRlScore(s => s + 5);
      addRlLog("State 0: Walk Right ➔ State 1. (Reward: +5)");
      
      setTimeout(() => {
        // Step 2: Try Walk -> Fire
        setRobotPos(2);
        setRlScore(s => s - 15);
        setQTable(prev => ({ ...prev, walk: -15 }));
        addRlLog("State 1: Walk ➔ State 2 (🔥 Fire!). (Penalty: -15). Updating Q(Walk) = -15.");
        
        setTimeout(() => {
          // Reset to 1
          setRobotPos(1);
          addRlLog("❯ রোবট ভুল সংশোধনের জন্য State 1 এ ফিরে এসেছে।");
          
          setTimeout(() => {
            // Step 3: Try Jump -> Battery
            setRobotPos(3);
            setRlScore(s => s + 25);
            setQTable(prev => ({ ...prev, jump: +25 }));
            addRlLog("State 1: Jump ➔ State 3 (🔋 Battery!). (Reward: +25). Updating Q(Jump) = +25.");
            
            setTimeout(() => {
              // Step 4: Move to 4
              setRobotPos(4);
              setRlScore(s => s + 5);
              addRlLog("State 3: Walk ➔ State 4. (Reward: +5)");
              
              setTimeout(() => {
                // Step 5: Target
                setRobotPos(5);
                setRlScore(s => s + 50);
                addRlLog("State 4: Walk ➔ State 5 (🔌 Charger!). Target Reached! (Reward: +50)");
                setIsTrainingRL(false);
              }, 1200);
            }, 1200);
          }, 1200);
        }, 1200);
      }, 1200);
    }, 1000);
  };

  const resetRL = () => {
    setRobotPos(0);
    setRlScore(0);
    setQTable({ walk: 0, jump: 0 });
    setRlLogs(["❯ এআই রোবট রিসেট করা হয়েছে।"]);
    setIsTrainingRL(false);
  };

  return (
    <div className="w-full font-sans text-slate-200 space-y-8">
      
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 md:p-8 border border-white/10 shadow-2xl text-center space-y-4">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500" />
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
        
        <h2 className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xl font-black text-white sm:text-2xl md:text-3xl">
          <span className="px-3.5 py-1 text-xs font-mono font-bold tracking-wider text-white rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/20">
            ল্যাব-১৮
          </span>
          সেমি-সুপারভাইজড সিমুলেটর
        </h2>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-400 font-medium leading-relaxed">
          খুব অল্প লেবেলযুক্ত (Labeled) তথ্যের সাহায্যে বিশাল লেবেলহীন (Unlabeled) তথ্যের সাশ্রয়ী ও জাদুকরী লেবেলিং প্রক্রিয়াটি সরাসরি দেখুন।
        </p>
      </div>

      {/* Simulation Guide Card */}
      <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-5 md:p-6 shadow-xl relative backdrop-blur-md">
        <div className="absolute top-4 right-4 text-indigo-500/30"><Sparkles size={24} /></div>
        <h3 className="flex items-center gap-2 text-base font-bold text-slate-100 sm:text-lg mb-3">
          <span className="text-indigo-400 animate-pulse">💡</span> ল্যাব সিমুলেটর গাইড
        </h3>
        <p className="text-sm sm:text-base leading-relaxed text-slate-300 mb-5">
          এই সিমুলেটরের মাধ্যমে আপনি সেমি-সুপারভাইজড লার্নিংয়ের প্রধান বিষয়সমূহ সরাসরি পর্যবেক্ষণ ও পরীক্ষা করতে পারবেন।
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs sm:text-sm">
          <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl space-y-2 hover:border-indigo-500/30 transition-all duration-300">
            <span className="font-bold text-indigo-400 flex items-center gap-2">
              <span className="text-lg">📸</span> ১. লেবেল প্রোপাগেশন (Label Propagation)
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              এখানে ১০টি ছবির একটি ডাটা পুল রয়েছে যার মধ্যে মাত্র ২টি ছবিতে লেবেল (Seed Tag - Rimisha ও Rayan) বসানো আছে। আপনি যখন "সিউডো-লেবেলিং শুরু করুন" বাটনে ক্লিক করবেন, তখন এআই প্রতিটি ছবির চেহারার গাণিতিক মিল ও দূরত্ব হিসেব করে বাকি ৮টি ট্যাগহীন ছবিতে সঠিক লেবেল বসাবে।
            </p>
          </div>
          <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl space-y-2 hover:border-purple-500/30 transition-all duration-300">
            <span className="font-bold text-purple-400 flex items-center gap-2">
              <span className="text-lg">🤖</span> ২. রোবট ট্রায়াল (Reinforcement Learning)
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              মেশিনের নিজস্ব ট্রায়াল অ্যান্ড এররের মাধ্যমে শেখার একটি প্রিভিউ এটি। এআই রোবটটি স্টার্ট লাইন থেকে চার্জার পর্যন্ত যাবে। ট্র্যাকে প্রতিবন্ধকতা (আগুন `🔥`) ও ব্যাটারি (`🔋`) রাখা আছে। আপনি প্রতি ধাপে রোবটের শেখা দেখতে পারেন, অথবা অটো-ট্রেনিং রান করতে পারেন।
            </p>
          </div>
        </div>
      </div>

      {/* Selector Tabs */}
      <div className="flex bg-slate-950/60 p-1.5 rounded-2xl border border-white/5 max-w-xl mx-auto w-full gap-2 shadow-inner">
        <button 
          onClick={() => setActiveTab('propagation')} 
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === 'propagation' 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          📸 লেবেল প্রোপাগেশন (Faces)
        </button>
        <button 
          onClick={() => setActiveTab('robot')} 
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === 'robot' 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          🤖 রোবট ট্রায়াল (RL Preview)
        </button>
      </div>

      <div className="max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          
          {/* --- Tab 1: Label Propagation --- */}
          {activeTab === 'propagation' && (
            <motion.div 
              key="prop" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }} 
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Photo grid pool container */}
              <div className="lg:col-span-7 bg-slate-900/60 p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-6 flex flex-col justify-between backdrop-blur-md">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                    <h3 className="text-lg font-black text-indigo-400 flex items-center gap-2">
                      📸 ফেস ট্যাগিং ডাটা পুল (Face Database)
                    </h3>
                    <span className="text-[10px] px-2.5 py-1 bg-pink-500/10 border border-pink-500/20 rounded-lg text-pink-400 font-bold">
                      Seed Rate: ২০%
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                    {photos.map(p => (
                      <motion.div 
                        key={p.id} 
                        layout 
                        className={`h-24 rounded-2xl border-2 flex flex-col items-center justify-center p-2.5 text-center transition-all duration-500 relative overflow-hidden ${p.color}`}
                      >
                        {p.isSeed && (
                          <span className="absolute top-1 right-1 text-[8px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider scale-90">
                            Seed
                          </span>
                        )}
                        <span className="text-3xl select-none">{p.trueType === 'Rimisha' ? '👧' : '👨'}</span>
                        <p className="text-[10px] font-black mt-2 truncate w-full">{p.name}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3.5 pt-4">
                  <button 
                    onClick={startPropagation} 
                    disabled={isTraining || propStep === 4} 
                    className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isTraining ? (
                      <>
                        <Activity className="animate-spin" size={16}/> 
                        লেবেল ছড়াচ্ছে (Propagating)...
                      </>
                    ) : (
                      <>
                        <GitMerge size={16}/> 
                        সিউডো-লেবেলিং শুরু করুন (Pseudo-Label)
                      </>
                    )}
                  </button>
                  <button 
                    onClick={resetPropagation} 
                    className="p-3 bg-slate-950/60 hover:bg-slate-950 rounded-xl border border-slate-800 transition-colors"
                  >
                    <RefreshCcw size={18} />
                  </button>
                </div>
              </div>

              {/* Logs and Explanations */}
              <div className="lg:col-span-5 bg-slate-900/60 p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col justify-between gap-6 backdrop-blur-md">
                 <div className="space-y-4">
                    <h3 className="text-lg font-black text-white border-b border-slate-800 pb-3 mb-4">
                      ⚙️ প্রোপাগেশন ইঞ্জিন (Engine logs)
                    </h3>
                    
                    <div className="bg-slate-950/60 p-4.5 rounded-2xl border border-slate-850/80 font-mono text-xs text-indigo-400 space-y-3 shadow-inner h-[190px] overflow-y-auto custom-scrollbar">
                      <p className="text-slate-500 font-bold border-b border-slate-900 pb-1 mb-2">❯ SYSTEM_LOG_OUTPUT:</p>
                      <p>❯ ২ টি Labeled Seed ডেটাবেজে লোড করা হলো।</p>
                      
                      {propStep >= 1 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                          {propagationLogs.slice(0, propStep).map((log, index) => (
                            <p key={index} className={index === 3 ? "text-emerald-400 font-bold" : "text-indigo-400"}>
                              ❯ {log.title}: {log.desc}
                            </p>
                          ))}
                        </motion.div>
                      )}
                    </div>
                 </div>

                 <div className="p-4 bg-gradient-to-br from-indigo-950/40 to-slate-900/20 border border-indigo-500/20 rounded-2xl flex items-start gap-3.5 shadow-md">
                    <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 shrink-0"><Brain size={18} /></div>
                    <p className="text-xs leading-relaxed text-slate-400">
                      <strong className="text-slate-200">সিউডো-লেবেলিং:</strong> মডেলটি মাত্র ২টি লেবেলযুক্ত ছবির কান, নাক ও চোখের গাণিতিক দূরত্ব চিনে বাকি ৮টি ট্যাগহীন ছবির ওপর স্বয়ংক্রিয় লেবেল বসায়। এটি শ্রম ও টাকা দুটোই সাশ্রয় করে।
                    </p>
                 </div>
              </div>
            </motion.div>
          )}

          {/* --- Tab 2: Robot Trial --- */}
          {activeTab === 'robot' && (
            <motion.div 
              key="robot" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }} 
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto bg-slate-900/60 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-8 backdrop-blur-md relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full" />
              
              {/* Header metrics */}
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-purple-400 flex items-center gap-2">
                    🤖 রিইনফোর্সমেন্ট লার্নিং ট্রায়াল (RL Sandbox)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">ভুল থেকে শেখা এআই এজেন্টের সিমুলেশন (Preview)</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-purple-950/60 border border-purple-500/30 rounded-xl text-purple-400 font-mono font-black text-sm shadow-md">
                    Score: {rlScore}
                  </div>
                </div>
              </div>

              {/* Tiled track design */}
              <div className="space-y-4">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest block">১ডি লার্নিং রানওয়ে (Runway Track):</span>
                
                <div className="grid grid-cols-6 gap-2 sm:gap-3.5 bg-slate-950/80 p-4 rounded-2xl border border-slate-850 shadow-inner relative min-h-[120px] flex items-center">
                  
                  {/* Floating Action Feedback Bubble */}
                  <AnimatePresence>
                    {floatingFeedback && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: -45, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className={`absolute left-1/2 -translate-x-1/2 top-4 px-3 py-1 rounded-xl text-xs font-black border shadow-lg ${
                          floatingFeedback.type === 'reward' 
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                            : floatingFeedback.type === 'penalty'
                              ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                              : 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                        }`}
                      >
                        {floatingFeedback.text}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {trackTiles.map((tile, index) => {
                    const hasRobot = robotPos === index;
                    return (
                      <div 
                        key={tile.id} 
                        className={`h-16 sm:h-20 rounded-xl border flex flex-col items-center justify-center p-1 sm:p-2 relative transition-all duration-300 ${tile.style}`}
                      >
                        <span className="text-xs sm:text-sm font-black text-slate-500 block absolute top-1.5 left-2 font-mono">
                          {index}
                        </span>
                        
                        {hasRobot ? (
                          <motion.div 
                            layoutId="robot-avatar" 
                            animate={
                              tile.type === 'obstacle' 
                                ? { x: [0, -6, 6, -6, 6, 0] } 
                                : tile.type === 'reward'
                                  ? { scale: [1, 1.2, 1], y: [0, -5, 0] }
                                  : {}
                            }
                            transition={{ duration: 0.4 }}
                            className="text-3xl sm:text-4xl select-none z-10 filter drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                          >
                            🤖
                          </motion.div>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xl sm:text-2xl select-none opacity-60 group-hover:opacity-100 transition-opacity">
                              {tile.icon}
                            </span>
                            <span className="text-[8px] sm:text-[9px] text-slate-500 font-bold block uppercase tracking-wider">
                              {tile.label}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Grid controls, Logs, Q-table */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Simulation Control Buttons */}
                <div className="md:col-span-4 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest block">নিয়ন্ত্রণ প্যানেল (Controls):</span>
                    <button 
                      onClick={handleRLStep} 
                      disabled={isTrainingRL || robotPos === 5}
                      className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Play size={14} /> ট্রায়াল ধাপ দিন (Trial Step)
                    </button>
                    <button 
                      onClick={runAutoTraining} 
                      disabled={isTrainingRL || robotPos === 5}
                      className="w-full py-3.5 bg-purple-950/40 hover:bg-purple-900/30 text-purple-400 border border-purple-500/20 font-black text-xs sm:text-sm rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Activity size={14} className={isTrainingRL ? "animate-pulse" : ""} /> অটো-ট্রেনিং চালান
                    </button>
                  </div>
                  
                  <button 
                    onClick={resetRL} 
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs rounded-xl shadow transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
                  >
                    <RefreshCcw size={12} /> পরিবেশ রিসেট (Reset)
                  </button>
                </div>

                {/* State Q-Table display */}
                <div className="md:col-span-4 space-y-3">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest block">১ম ধাপের কিউ-টেবিল (State 1 Q-Table):</span>
                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850 space-y-2.5 text-xs sm:text-sm font-mono shadow-inner h-[135px] flex flex-col justify-center">
                    <div className="flex justify-between items-center pb-1.5 border-b border-slate-900 text-slate-500 text-[10px] font-bold">
                      <span>অ্যাকশন (Action)</span>
                      <span>ফল বা কিউ-মান (Q-Value)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">🚶 Walk Right (Tile 2)</span>
                      <span className={`font-bold transition-all ${qTable.walk < 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                        {qTable.walk === 0 ? '0' : qTable.walk}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">🦘 Jump Right (Tile 3)</span>
                      <span className={`font-bold transition-all ${qTable.jump > 0 ? 'text-emerald-400 font-black' : 'text-slate-500'}`}>
                        {qTable.jump === 0 ? '0' : `+${qTable.jump}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Agent Logs */}
                <div className="md:col-span-4 space-y-3">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest block">এজেন্ট লগ (Policy Logs):</span>
                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850 font-mono text-[10px] leading-relaxed text-indigo-400 space-y-1.5 shadow-inner h-[135px] overflow-y-auto custom-scrollbar">
                    {rlLogs.map((log, idx) => (
                      <p 
                        key={idx} 
                        className={
                          idx === 0 
                            ? 'text-white font-bold' 
                            : log.includes('Penalty')
                              ? 'text-rose-400/80'
                              : log.includes('Battery') || log.includes('Goal')
                                ? 'text-emerald-400/80'
                                : 'text-indigo-400/60'
                        }
                      >
                        {log}
                      </p>
                    ))}
                  </div>
                </div>

              </div>

              {/* Complete state overlays */}
              {robotPos === 5 && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="bg-indigo-950/20 border border-indigo-500/20 p-4 rounded-2xl flex items-center justify-between text-indigo-300 text-xs sm:text-sm shadow-md"
                >
                  <div className="flex items-center gap-2">
                    <Award className="text-indigo-400 animate-bounce" size={20} />
                    <span><strong>ট্রেনিং সফল!</strong> রোবটটি পেনাল্টি এড়িয়ে চার্জার খুঁজে পেতে সফল কিউ-পলিসি শিখে নিয়েছে।</span>
                  </div>
                  <button onClick={resetRL} className="px-4.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs transition-colors">রিসেট</button>
                </motion.div>
              )}

            </motion.div>
          )}

        </AnimatePresence>

        {/* Tech Insight Box */}
        <div className="mt-8 p-5 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 rounded-2xl flex items-start gap-4 shadow-md">
           <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 shrink-0"><ShieldAlert size={20}/></div>
           <div className="space-y-1">
             <strong className="text-white font-bold text-xs sm:text-sm block">টেক-ইনসাইট (Semi-Supervised Insight):</strong>
             <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
               বাস্তব দুনিয়ার ডেটাতে লেবেল লাগানো অনেক সময় ও ব্যয়বহুল। সেমি-সুপারভাইজড লার্নিং অল্প কিছু লেবেলযুক্ত ফেস থেকে শিখে গ্রাফের মাধ্যমে বাকি সব ফেস ছবিতে ট্যাগ বসায়। এটি মডেলের কার্যক্ষমতা সুপারভাইজড লার্নিংয়ের কাছাকাছি নেয়, কিন্তু খরচ ও মানুষের শ্রম বাঁচায় আশি শতাংশেরও বেশি!
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}