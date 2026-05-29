import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Grid, ShoppingCart, RefreshCcw, Info, Lightbulb, Package,
  Settings, Sliders, Database, ArrowRight, Sparkles, Check, Trash2,
  BarChart3, Activity
} from 'lucide-react';

export default function SimulationLab() {
  const [activeTab, setActiveTab] = useState('laundry');
  
  // --- Laundry Clustering Logic ---
  const [clusteringMetric, setClusteringMetric] = useState('color');
  const [kValue, setKValue] = useState(3);
  const [clusteredState, setClusteredState] = useState('idle'); // 'idle', 'processing', 'done'
  const [processingStep, setProcessingStep] = useState(0);

  const laundryItems = [
    { id: 1, name: 'লাল শার্ট', icon: '👕', color: 'red', type: 'shirt', cardStyle: 'from-rose-500/10 to-rose-950/20 border-rose-500/30 text-rose-300' },
    { id: 2, name: 'নীল ফ্রক', icon: '👗', color: 'blue', type: 'dress', cardStyle: 'from-blue-500/10 to-blue-950/20 border-blue-500/30 text-blue-300' },
    { id: 3, name: 'সাদা মোজা', icon: '🧦', color: 'white', type: 'socks', cardStyle: 'from-slate-200/10 to-slate-800/20 border-slate-300/30 text-slate-300' },
    { id: 4, name: 'সাদা টি-শার্ট', icon: '👕', color: 'white', type: 'shirt', cardStyle: 'from-slate-200/10 to-slate-800/20 border-slate-300/30 text-slate-300' },
    { id: 5, name: 'লাল স্কার্ট', icon: '👗', color: 'red', type: 'dress', cardStyle: 'from-rose-500/10 to-rose-950/20 border-rose-600/30 text-rose-200' },
    { id: 6, name: 'নীল মোজা', icon: '🧦', color: 'blue', type: 'socks', cardStyle: 'from-blue-500/10 to-blue-950/20 border-blue-600/30 text-blue-200' }
  ];

  // Steps for clustering simulation log
  const clusteringSteps = [
    { title: "১. সেন্ট্রয়েড ইনিশিয়ালাইজেশন", desc: `র্যান্ডম উপায়ে ${kValue}টি ক্লাস্টার সেন্টার (Centroid) বসানো হচ্ছে...` },
    { title: "২. দূরত্ব গণনা (Distance Calculation)", desc: "কাপড়ের বৈশিষ্ট্যগুলোর মধ্যকার গাণিতিক দূরত্ব (ইউক্লিডিয়ান দূরত্ব) নির্ণয় করা হচ্ছে..." },
    { title: "৩. অপ্টিমাইজেশন ও বিন্যাস", desc: "কাপড়গুলোকে তাদের নিকটতম সেন্ট্রয়েড যুক্ত Hampers-এ সাজানো হচ্ছে..." }
  ];

  useEffect(() => {
    if (clusteredState === 'processing') {
      const step1 = setTimeout(() => setProcessingStep(1), 800);
      const step2 = setTimeout(() => setProcessingStep(2), 1600);
      const step3 = setTimeout(() => {
        setClusteredState('done');
      }, 2400);

      return () => {
        clearTimeout(step1);
        clearTimeout(step2);
        clearTimeout(step3);
      };
    }
  }, [clusteredState]);

  const handleRunClustering = () => {
    setClusteredState('processing');
    setProcessingStep(0);
  };

  const handleResetClustering = () => {
    setClusteredState('idle');
    setProcessingStep(0);
  };

  const getClusters = () => {
    if (clusteringMetric === 'color') {
      if (kValue === 3) {
        return [
          { id: 'c1', title: '🔴 লাল কাপড় (Cluster 1)', style: 'border-rose-500/30 bg-rose-950/10 text-rose-300 shadow-rose-950/20', filter: (i) => i.color === 'red' },
          { id: 'c2', title: '🔵 নীল কাপড় (Cluster 2)', style: 'border-blue-500/30 bg-blue-950/10 text-blue-300 shadow-blue-950/20', filter: (i) => i.color === 'blue' },
          { id: 'c3', title: '⚪ সাদা কাপড় (Cluster 3)', style: 'border-slate-500/30 bg-slate-900/40 text-slate-300 shadow-slate-900/20', filter: (i) => i.color === 'white' },
        ];
      } else {
        return [
          { id: 'c1', title: '🎨 রঙিন কাপড় (Cluster 1)', style: 'border-purple-500/30 bg-purple-950/10 text-purple-300 shadow-purple-950/20', filter: (i) => i.color === 'red' || i.color === 'blue' },
          { id: 'c2', title: '🏳️ নিরপেক্ষ কাপড় (Cluster 2)', style: 'border-slate-500/30 bg-slate-900/40 text-slate-300 shadow-slate-900/20', filter: (i) => i.color === 'white' },
        ];
      }
    } else {
      if (kValue === 3) {
        return [
          { id: 'c1', title: '👕 শার্ট সমূহ (Cluster 1)', style: 'border-amber-500/30 bg-amber-950/10 text-amber-300 shadow-amber-950/20', filter: (i) => i.type === 'shirt' },
          { id: 'c2', title: '👗 ফ্রক ও স্কার্ট (Cluster 2)', style: 'border-fuchsia-500/30 bg-fuchsia-950/10 text-fuchsia-300 shadow-fuchsia-950/20', filter: (i) => i.type === 'dress' },
          { id: 'c3', title: '🧦 মোজা সমূহ (Cluster 3)', style: 'border-teal-500/30 bg-teal-950/10 text-teal-300 shadow-teal-950/20', filter: (i) => i.type === 'socks' },
        ];
      } else {
        return [
          { id: 'c1', title: '👔 পরিধানের পোশাক (Cluster 1)', style: 'border-sky-500/30 bg-sky-950/10 text-sky-300 shadow-sky-950/20', filter: (i) => i.type === 'shirt' || i.type === 'dress' },
          { id: 'c2', title: '🧦 এক্সেসরিজ (Cluster 2)', style: 'border-teal-500/30 bg-teal-950/10 text-teal-300 shadow-teal-950/20', filter: (i) => i.type === 'socks' },
        ];
      }
    }
  };

  // --- Market Basket Logic ---
  const [cart, setCart] = useState([]);
  const storeItems = [
    { id: 'diaper', name: 'ডায়াপার', icon: '👶', category: 'বেবি কেয়ার', price: '৳ ৮৫০' },
    { id: 'milk', name: 'বেবি মিল্ক', icon: '🥛', category: 'বেবি কেয়ার', price: '৳ ৭২০' },
    { id: 'bread', name: 'পাউরুটি', icon: '🍞', category: 'বেকারি', price: '৳ ৬০' },
    { id: 'butter', name: 'মাখন', icon: '🧈', category: 'ডেইরি', price: '৳ ২১০' }
  ];

  const getAssociation = () => {
    if (cart.includes('diaper') && !cart.includes('milk')) {
      return { 
        rule: "IF 👶 Diaper THEN 🥛 Baby Milk", 
        conf: 85, 
        msg: "আমাদের সুপারমার্কেট ডাটাবেজ অনুসারে ৮৫% ক্রেতা ডায়াপার কেনার সময় একই সাথে দুধও কেনেন! এটি একটি শক্তিশালী অ্যাসোসিয়েশন।",
        suggest: { id: 'milk', name: 'বেবি মিল্ক', icon: '🥛' },
        stats: { support: 22, confidence: 85, lift: 3.4 }
      };
    }
    if (cart.includes('bread') && !cart.includes('butter')) {
      return { 
        rule: "IF 🍞 Bread THEN 🧈 Butter", 
        conf: 90, 
        msg: "৯‌০% ক্রেতা পাউরুটি কেনার সাথে সাথে মাখনও ক্রয় করেন। সুপারমার্কেটে এদের কাছাকাছি রাখলে বিক্রি বাড়ে!",
        suggest: { id: 'butter', name: 'মাখন', icon: '🧈' },
        stats: { support: 35, confidence: 90, lift: 2.8 }
      };
    }
    return null;
  };

  const toggleCartItem = (id) => {
    if (cart.includes(id)) {
      setCart(cart.filter(item => item !== id));
    } else {
      setCart([...cart, id]);
    }
  };

  const assoc = getAssociation();

  // Active check for network nodes
  const isDiaperActive = cart.includes('diaper');
  const isMilkActive = cart.includes('milk');
  const isBreadActive = cart.includes('bread');
  const isButterActive = cart.includes('butter');

  const isDiaperRuleActive = isDiaperActive && !isMilkActive;
  const isBreadRuleActive = isBreadActive && !isButterActive;

  return (
    <div className="w-full space-y-8 font-sans text-slate-200">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 p-6 md:p-8 border border-white/10 shadow-2xl text-center space-y-4">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-cyan-500" />
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
        
        <h2 className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xl font-black text-white sm:text-2xl md:text-3xl">
          <span className="px-3.5 py-1 text-xs font-mono font-bold tracking-wider text-white rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 shadow-lg shadow-sky-500/20">
            ল্যাব-১৭
          </span>
          আনসুপারভাইজড ল্যাবরেটরি
        </h2>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-400 font-medium leading-relaxed">
          কোনো শিক্ষক বা লেবেল ছাড়াই মেশিন কীভাবে অগোছালো তথ্যের ভেতর থেকে নিজস্ব গাণিতিক বিচারে লুকানো প্যাটার্ন খুঁজে বের করে তা নিজে চালিয়ে দেখুন।
        </p>
      </div>

      {/* Simulation Guide Card */}
      <div className="rounded-2xl border border-sky-500/20 bg-sky-950/20 p-5 md:p-6 shadow-xl relative backdrop-blur-md">
        <div className="absolute top-4 right-4 text-sky-500/30"><Sparkles size={24} /></div>
        <h3 className="flex items-center gap-2 text-base font-bold text-slate-100 sm:text-lg mb-3">
          <span className="text-sky-400 animate-pulse">💡</span> ল্যাব সিমুলেটর গাইড
        </h3>
        <p className="text-sm sm:text-base leading-relaxed text-slate-300 mb-5">
          এই সিমুলেটরের সাহায্যে আপনি আনসুপারভাইজড লার্নিংয়ের প্রধান দুটি দিক—**ক্লাস্টারিং (Clustering)** এবং **অ্যাসোসিয়েশন রুলস (Association Rules)** রিয়েল-টাইমে পর্যবেক্ষণ করতে পারবেন।
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs sm:text-sm">
          <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl space-y-2 hover:border-sky-500/30 transition-all duration-300">
            <span className="font-bold text-sky-400 flex items-center gap-2">
              <span className="text-lg">🧺</span> ১. লন্ড্রি ক্লাস্টারিং (Clustering)
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              অগোছালো কাপড়গুলোকে অ্যালগরিদমের সাহায্যে 'রং' অথবা 'কাপড়ের ধরন' অনুযায়ী আলাদা আলাদা ডালিতে (Cluster) সাজিয়ে গ্রুপ করার প্রক্রিয়া দেখুন। এখানে কোনো শিক্ষক কাপড় চিহ্নিত করে দেয়নি, মেশিন নিজে থেকেই গাণিতিক মিল দেখে ভাগ করে।
            </p>
          </div>
          <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl space-y-2 hover:border-indigo-500/30 transition-all duration-300">
            <span className="font-bold text-indigo-400 flex items-center gap-2">
              <span className="text-lg">🛒</span> ২. অ্যাসোসিয়েশন মাইনার (Association Rules)
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              সুপারমার্কেটের কেনাকাটার ডেটা বিশ্লেষণ করে ক্রেতাদের আচরণ বা পণ্য ক্রয়ের পারস্পরিক সম্পর্ক (যেমন: ডায়াপার কিনলে বেবি মিল্কও কেনার সম্ভাবনা) খুঁজে বের করার এআই ইঞ্জিন টেস্ট করুন।
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex bg-slate-950/60 p-1.5 rounded-2xl border border-white/5 max-w-xl mx-auto w-full gap-2 shadow-inner">
        <button 
          onClick={() => setActiveTab('laundry')} 
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === 'laundry' 
              ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-lg' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          🧺 লন্ড্রি ক্লাস্টারিং
        </button>
        <button 
          onClick={() => setActiveTab('market')} 
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === 'market' 
              ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-lg' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          🛒 অ্যাসোসিয়েশন মাইনার
        </button>
      </div>

      <div className="max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          
          {/* --- Tab 1: Laundry Clustering --- */}
          {activeTab === 'laundry' && (
            <motion.div 
              key="laundry" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }} 
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              
              {/* Settings Controller Panel */}
              <div className="lg:col-span-5 bg-slate-900/60 p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-6 flex flex-col justify-between backdrop-blur-md">
                <div className="space-y-6">
                  <h3 className="text-lg font-black text-sky-400 flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Settings size={18} /> ক্লাস্টারিং সেটিংস (Hyperparameters)
                  </h3>
                  
                  {/* Metric Switch */}
                  <div className="space-y-3">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Sliders size={12} /> ক্লাস্টার ভিত্তি (Feature Metric):
                    </p>
                    <div className="flex gap-2.5">
                      <button 
                        onClick={() => { setClusteringMetric('color'); handleResetClustering(); }} 
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all duration-200 ${
                          clusteringMetric === 'color'
                            ? 'bg-sky-600/10 border-sky-500 text-sky-400 shadow-lg shadow-sky-500/5'
                            : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:text-slate-400'
                        }`}
                      >
                        🎨 রঙ (Color)
                      </button>
                      <button 
                        onClick={() => { setClusteringMetric('type'); handleResetClustering(); }} 
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all duration-200 ${
                          clusteringMetric === 'type'
                            ? 'bg-sky-600/10 border-sky-500 text-sky-400 shadow-lg shadow-sky-500/5'
                            : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:text-slate-400'
                        }`}
                      >
                        🧥 ধরন (Type)
                      </button>
                    </div>
                  </div>

                  {/* K-Value (Number of Clusters) Selector */}
                  <div className="space-y-3">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Sliders size={12} /> ক্লাস্টারের সংখ্যা (K Value):
                    </p>
                    <div className="flex gap-2.5">
                      <button 
                        onClick={() => { setKValue(2); handleResetClustering(); }} 
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all duration-200 ${
                          kValue === 2
                            ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-500/5'
                            : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:text-slate-400'
                        }`}
                      >
                        K = ২ (2 Clusters)
                      </button>
                      <button 
                        onClick={() => { setKValue(3); handleResetClustering(); }} 
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all duration-200 ${
                          kValue === 3
                            ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-500/5'
                            : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:text-slate-400'
                        }`}
                      >
                        K = ৩ (3 Clusters)
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-500 block leading-normal mt-1">
                      *K-Means অ্যালগরিদমে K নির্দেশ করে ডেটাকে কতগুলো ভিন্ন গ্রুপে বিভক্ত করা হবে।
                    </span>
                  </div>
                </div>

                <div className="space-y-3 pt-6">
                  {clusteredState === 'done' ? (
                    <button 
                      onClick={handleResetClustering}
                      className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <RefreshCcw size={14} /> আবার শুরু করুন (Reset)
                    </button>
                  ) : (
                    <button 
                      onClick={handleRunClustering} 
                      disabled={clusteredState === 'processing'}
                      className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {clusteredState === 'processing' ? 'বিশ্লেষণ চলছে...' : 'অ্যালগরিদম চালান (Run K-Means)'}
                    </button>
                  )}
                </div>
              </div>

              {/* Simulation Visual Area */}
              <div className="lg:col-span-7 bg-slate-900/60 p-6 rounded-3xl border border-slate-850 shadow-2xl flex flex-col justify-between min-h-[420px] backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl" />
                
                {clusteredState === 'idle' && (
                  <div className="space-y-6 flex-1 flex flex-col justify-center">
                    <div className="text-center">
                      <span className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-4">অগোছালো কাপড় (Unlabeled Input Pool):</span>
                      <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-w-md mx-auto">
                        {laundryItems.map(item => (
                          <motion.div 
                            key={item.id} 
                            layoutId={`laundry-item-${item.id}`}
                            className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 shadow-md hover:border-sky-500/40 hover:shadow-sky-500/5 transition-all duration-300 flex flex-col items-center gap-1.5"
                          >
                            <span className="text-3xl select-none">{item.icon}</span>
                            <span className="text-xs font-bold text-slate-200">{item.name}</span>
                            <div className="flex gap-1.5 text-[9px] font-bold">
                              <span className="px-1.5 py-0.5 rounded-md bg-slate-900 text-slate-400 capitalize">{item.color}</span>
                              <span className="px-1.5 py-0.5 rounded-md bg-slate-900 text-slate-400 capitalize">{item.type}</span>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  </div>
                )}

                {clusteredState === 'processing' && (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center text-indigo-400"><Activity size={24} className="animate-pulse" /></div>
                    </div>
                    
                    <div className="space-y-4 text-center max-w-sm">
                      <p className="text-sm font-black text-indigo-400 uppercase tracking-wider">মেশিন সেলফ-লার্নিং চালাচ্ছে...</p>
                      
                      <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-left space-y-2 font-mono text-xs">
                        {clusteringSteps.map((step, idx) => (
                          <div 
                            key={idx} 
                            className={`flex items-start gap-2.5 transition-all duration-300 ${
                              idx === processingStep 
                                ? 'text-sky-400 font-bold scale-[1.02]' 
                                : idx < processingStep 
                                  ? 'text-emerald-500 opacity-60' 
                                  : 'text-slate-600'
                            }`}
                          >
                            <span className="shrink-0">{idx < processingStep ? '✓' : '•'}</span>
                            <div>
                              <p className="font-bold">{step.title}</p>
                              {idx === processingStep && <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">{step.desc}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {clusteredState === 'done' && (
                  <div className="space-y-5 flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">গঠিত ক্লাস্টারসমূহ (Sorted Cluster Hampers):</span>
                        <p className="text-[10px] text-emerald-400 mt-1 font-semibold flex items-center gap-1">
                          <Check size={12} /> Euclidean Distance অপ্টিমাইজেশন সম্পন্ন হয়েছে।
                        </p>
                      </div>
                      <button onClick={handleResetClustering} className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-all"><RefreshCcw size={12}/> রিসেট</button>
                    </div>

                    <div className={`grid gap-4 ${kValue === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
                      {getClusters().map(group => {
                        const items = laundryItems.filter(group.filter);
                        return (
                          <div 
                            key={group.id} 
                            className={`rounded-2xl border p-4 shadow-xl flex flex-col justify-between gap-4 transition-all duration-300 ${group.style}`}
                          >
                            <div>
                              <div className="border-b border-white/5 pb-2 mb-3">
                                <span className="text-xs font-black uppercase tracking-wider block text-slate-200">{group.title}</span>
                              </div>
                              
                              <div className="grid grid-cols-1 gap-2.5">
                                {items.length > 0 ? (
                                  items.map(i => (
                                    <motion.div 
                                      key={i.id} 
                                      layoutId={`laundry-item-${i.id}`}
                                      className={`p-2.5 rounded-xl bg-slate-950/70 border border-white/5 flex items-center gap-2.5 shadow-md`}
                                    >
                                      <span className="text-2xl select-none">{i.icon}</span>
                                      <div className="text-left">
                                        <p className="text-xs font-bold text-slate-200">{i.name}</p>
                                        <p className="text-[9px] font-mono text-slate-500 uppercase">{i.color} • {i.type}</p>
                                      </div>
                                    </motion.div>
                                  ))
                                ) : (
                                  <p className="text-[10px] text-slate-500 italic py-2 text-center">কোনো আইটেম পাওয়া যায়নি</p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center text-[9px] font-mono opacity-60 border-t border-white/5 pt-2">
                              <span>Hamper Count</span>
                              <span className="font-bold text-xs">{items.length}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* --- Tab 2: Market Basket --- */}
          {activeTab === 'market' && (
            <motion.div 
              key="market" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }} 
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
               
               {/* Left Column: Supermarket Shelf */}
               <div className="lg:col-span-6 bg-slate-900/60 p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col justify-between gap-6 backdrop-blur-md">
                  <div className="space-y-4">
                    <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-black text-sky-400 flex items-center gap-2">
                          <Package size={18} /> শপিং সেলফ (Supermarket Shelf)
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">তাক থেকে আইটেমগুলো কার্টে যুক্ত করতে ক্লিক করুন</p>
                      </div>
                      <span className="text-xs px-2.5 py-1 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-400 font-mono font-bold">
                        items: {storeItems.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {storeItems.map(item => {
                        const inCart = cart.includes(item.id);
                        return (
                          <button
                            key={item.id}
                            onClick={() => toggleCartItem(item.id)}
                            className={`p-4 rounded-2xl border text-left flex flex-col justify-between gap-4 transition-all duration-300 relative group overflow-hidden ${
                              inCart 
                                ? 'bg-sky-600/10 border-sky-500 text-sky-300 shadow-lg shadow-sky-500/5' 
                                : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {inCart && (
                              <div className="absolute top-2 right-2 text-sky-500 bg-sky-500/10 p-0.5 rounded-full border border-sky-500/20">
                                <Check size={10} />
                              </div>
                            )}
                            <div className="space-y-1">
                              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">{item.category}</span>
                              <h4 className="font-black text-sm text-slate-200 mt-0.5">{item.name}</h4>
                            </div>
                            
                            <div className="flex justify-between items-center w-full mt-2">
                              <span className="text-2xl select-none group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                              <span className="text-xs font-mono font-bold text-slate-500">{item.price}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Shopping Cart Container */}
                  <div className="bg-slate-950/60 p-4.5 rounded-2xl border border-slate-800/80 space-y-3 shadow-inner">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <ShoppingCart size={13} /> আপনার কার্ট ({cart.length})
                      </span>
                      {cart.length > 0 && (
                        <button 
                          onClick={() => setCart([])} 
                          className="text-[10px] font-black text-rose-400 hover:text-rose-300 flex items-center gap-0.5 transition-colors"
                        >
                          <Trash2 size={10} /> খালি করুন
                        </button>
                      )}
                    </div>

                    {cart.length > 0 ? (
                      <div className="flex flex-wrap gap-2.5">
                        {cart.map(id => {
                          const item = storeItems.find(i => i.id === id);
                          return (
                            <span 
                              key={id} 
                              className="bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                            >
                              {item?.icon} {item?.name}
                              <button onClick={() => toggleCartItem(id)} className="text-sky-500 hover:text-sky-300 text-[10px] font-bold ml-1">×</button>
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <span className="text-xs text-slate-600 italic">কার্ট বর্তমানে খালি আছে। উপরে তাক থেকে পণ্য যোগ করুন।</span>
                      </div>
                    )}
                  </div>
               </div>

               {/* Right Column: Association Engine & Graph Node */}
               <div className="lg:col-span-6 bg-slate-900/60 p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col justify-between gap-6 backdrop-blur-md">
                  
                  <div className="space-y-4">
                    <div className="border-b border-slate-800 pb-3">
                      <h3 className="text-lg font-black text-white flex items-center gap-2">
                        <Database size={18} /> অ্যাসোসিয়েশন ইঞ্জিন (Association Network)
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">১০,০০০ কাস্টমার কেনাকাটা থেকে খোঁজা অ্যাসোসিয়েশন নেটওয়ার্ক</p>
                    </div>

                    {/* SVG Association Graph */}
                    <div className="relative w-full h-[180px] bg-slate-950/60 rounded-2xl border border-slate-800/80 p-4 overflow-hidden flex items-center justify-center shadow-inner">
                      <svg viewBox="0 0 360 160" className="w-full h-full">
                        <defs>
                          <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#38bdf8" />
                            <stop offset="100%" stopColor="#10b981" />
                          </linearGradient>
                          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                          </filter>
                        </defs>
                        <style>{`
                          @keyframes dash {
                            to {
                              stroke-dashoffset: -20;
                            }
                          }
                          .crawling-path {
                            stroke-dasharray: 6, 6;
                            animation: dash 1.5s linear infinite;
                          }
                        `}</style>

                        {/* Path: Diaper -> Milk */}
                        <path
                          d="M 80 40 L 280 40"
                          stroke={isDiaperRuleActive ? "url(#activeGradient)" : "#1e293b"}
                          strokeWidth={isDiaperRuleActive ? 4 : 2}
                          className={isDiaperRuleActive ? "crawling-path" : ""}
                          filter={isDiaperRuleActive ? "url(#glow)" : "none"}
                        />
                        
                        {/* Path: Bread -> Butter */}
                        <path
                          d="M 80 120 L 280 120"
                          stroke={isBreadRuleActive ? "url(#activeGradient)" : "#1e293b"}
                          strokeWidth={isBreadRuleActive ? 4 : 2}
                          className={isBreadRuleActive ? "crawling-path" : ""}
                          filter={isBreadRuleActive ? "url(#glow)" : "none"}
                        />

                        {/* Node 1: Diaper */}
                        <g transform="translate(80, 40)">
                          <circle
                            r={22}
                            fill={isDiaperActive ? "#0369a1" : "#0f172a"}
                            stroke={isDiaperActive ? "#38bdf8" : "#334155"}
                            strokeWidth={2}
                            className="transition-all duration-300"
                          />
                          <text y={6} textAnchor="middle" className="text-xl select-none">👶</text>
                          <text y={36} textAnchor="middle" fill="#94a3b8" className="text-[9px] font-sans font-bold">ডায়াপার</text>
                        </g>

                        {/* Node 2: Baby Milk */}
                        <g transform="translate(280, 40)">
                          <circle
                            r={22}
                            fill={isMilkActive ? "#065f46" : isDiaperRuleActive ? "#451a03" : "#0f172a"}
                            stroke={isMilkActive ? "#10b981" : isDiaperRuleActive ? "#f59e0b" : "#334155"}
                            strokeWidth={2}
                            className="transition-all duration-300"
                          />
                          <text y={6} textAnchor="middle" className="text-xl select-none">🥛</text>
                          <text y={36} textAnchor="middle" fill="#94a3b8" className="text-[9px] font-sans font-bold">বেবি মিল্ক</text>
                        </g>

                        {/* Node 3: Bread */}
                        <g transform="translate(80, 120)">
                          <circle
                            r={22}
                            fill={isBreadActive ? "#0369a1" : "#0f172a"}
                            stroke={isBreadActive ? "#38bdf8" : "#334155"}
                            strokeWidth={2}
                            className="transition-all duration-300"
                          />
                          <text y={6} textAnchor="middle" className="text-xl select-none">🍞</text>
                          <text y={36} textAnchor="middle" fill="#94a3b8" className="text-[9px] font-sans font-bold">পাউরুটি</text>
                        </g>

                        {/* Node 4: Butter */}
                        <g transform="translate(280, 120)">
                          <circle
                            r={22}
                            fill={isButterActive ? "#065f46" : isBreadRuleActive ? "#451a03" : "#0f172a"}
                            stroke={isButterActive ? "#10b981" : isBreadRuleActive ? "#f59e0b" : "#334155"}
                            strokeWidth={2}
                            className="transition-all duration-300"
                          />
                          <text y={6} textAnchor="middle" className="text-xl select-none">🧈</text>
                          <text y={36} textAnchor="middle" fill="#94a3b8" className="text-[9px] font-sans font-bold">মাখন</text>
                        </g>
                      </svg>
                    </div>
                  </div>

                  {/* Association Metrics display */}
                  <div className="space-y-3">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest block flex items-center gap-1">
                      <BarChart3 size={12} /> অ্যাসোসিয়েশন রুলস প্যারামিটারস (Apriori Stats):
                    </span>
                    
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                        <span className="text-[9px] font-bold text-slate-500 block uppercase">সাপোর্ট (Support)</span>
                        <span className="text-lg font-black text-sky-400 mt-1 block">
                          {assoc ? `${assoc.stats.support}%` : '---'}
                        </span>
                        <span className="text-[8px] text-slate-600 block mt-0.5">সব ক্রয়ের কতভাগে আছে</span>
                      </div>
                      <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                        <span className="text-[9px] font-bold text-slate-500 block uppercase">কনফিডেন্স (Confidence)</span>
                        <span className="text-lg font-black text-emerald-400 mt-1 block">
                          {assoc ? `${assoc.stats.confidence}%` : '---'}
                        </span>
                        <span className="text-[8px] text-slate-600 block mt-0.5">একসাথে কেনার নিশ্চয়তা</span>
                      </div>
                      <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                        <span className="text-[9px] font-bold text-slate-500 block uppercase">লিফট (Lift Ratio)</span>
                        <span className="text-lg font-black text-amber-400 mt-1 block">
                          {assoc ? `${assoc.stats.lift}x` : '---'}
                        </span>
                        <span className="text-[8px] text-slate-600 block mt-0.5">সম্পর্কের শক্তি বা টান</span>
                      </div>
                    </div>
                  </div>

                  {/* Live Prediction Display */}
                  <div className="p-5 bg-gradient-to-br from-sky-950/30 to-indigo-950/20 border border-sky-500/20 rounded-2xl relative overflow-hidden flex flex-col justify-center min-h-[140px] shadow-lg">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 to-indigo-500 animate-pulse" />
                     
                     {assoc ? (
                      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-3">
                         <span className="text-emerald-400 font-black text-xs uppercase tracking-widest flex items-center gap-1.5">
                           <Lightbulb size={14} className="animate-bounce" /> লাইভ সুপারিশ (AI Recommendation)
                         </span>
                         
                         <div className="flex items-center gap-3">
                           <span className="text-4xl bg-slate-950/50 p-2 rounded-xl border border-slate-800">{assoc.suggest.icon}</span>
                           <div>
                             <p className="text-white font-black text-base">{assoc.rule}</p>
                             <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{assoc.msg}</p>
                           </div>
                         </div>

                         <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800 mt-2">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${assoc.conf}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className="bg-gradient-to-r from-sky-500 to-emerald-400 h-full rounded-full" 
                            />
                         </div>
                         <p className="text-[10px] text-slate-500 font-mono text-right">Confidence Level: {assoc.conf}%</p>
                      </motion.div>
                     ) : (
                      <div className="text-center py-4 space-y-2.5">
                        <ShoppingCart size={32} className="mx-auto text-slate-600 animate-pulse opacity-40" />
                        <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                          তাক থেকে **ডায়াপার** বা **পাউরুটি** যোগ করে অ্যাসোসিয়েশন মাইনার কীভাবে সম্পর্কিত সুপারিশ করে তা দেখুন।
                        </p>
                      </div>
                     )}
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tech Insight Box */}
        <div className="mt-8 p-5 bg-gradient-to-r from-sky-500/5 to-indigo-500/5 border border-sky-500/10 rounded-2xl flex items-start gap-4 shadow-md">
           <div className="p-2.5 bg-sky-500/10 rounded-xl text-sky-400 shrink-0"><Info size={20}/></div>
           <div className="space-y-1">
             <strong className="text-white font-bold text-xs sm:text-sm block">টেক-ইনসাইট (Unsupervised Insight):</strong>
             <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
               আনসুপারভাইজড লার্নিংয়ের কোনো উত্তরপত্র থাকে না। K-Means ক্লাস্টারিং গাণিতিক দূরত্বের ক্ষুদ্রকরণ করে গ্রুপ বানায়। অন্যদিকে অ্যাসোসিয়েশন মাইন রুলস সাপোর্ট, কনফিডেন্স ও লিফটের পরিমাপ দিয়ে কাস্টমার ট্রানজ্যাকশন আচরণ বিশ্লেষণ করে ব্যবসার লাভ বৃদ্ধিতে সাহায্য করে।
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}