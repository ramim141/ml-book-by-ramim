import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Lightbulb, LightbulbOff, Cpu, List, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const gates = [
  { id: 'AND', label: 'AND Gate', type: 'basic', color: 'from-blue-500 to-cyan-400', stroke: 'text-cyan-400', desc: 'দুটি ইনপুটই 1 হলে আউটপুট 1 হবে', formula: 'Y = A · B', truthTable: [[0,0,0], [0,1,0], [1,0,0], [1,1,1]] },
  { id: 'OR', label: 'OR Gate', type: 'basic', color: 'from-fuchsia-500 to-pink-500', stroke: 'text-pink-400', desc: 'যেকোনো একটি ইনপুট 1 হলে আউটপুট 1 হবে', formula: 'Y = A + B', truthTable: [[0,0,0], [0,1,1], [1,0,1], [1,1,1]] },
  { id: 'NOT', label: 'NOT Gate', type: 'basic', color: 'from-amber-400 to-orange-500', stroke: 'text-orange-400', desc: 'ইনপুট 1 হলে আউটপুট 0, আর 0 হলে 1', formula: 'Y = Ā', truthTable: [[0,1], [1,0]] },
  { id: 'NAND', label: 'NAND Gate', type: 'universal', color: 'from-emerald-400 to-teal-500', stroke: 'text-emerald-400', desc: 'AND গেইটের বিপরীত (দুটি ইনপুট 1 হলে 0)', formula: 'Y = (A · B)\'', truthTable: [[0,0,1], [0,1,1], [1,0,1], [1,1,0]] },
  { id: 'NOR', label: 'NOR Gate', type: 'universal', color: 'from-rose-500 to-red-500', stroke: 'text-rose-400', desc: 'OR গেইটের বিপরীত (দুটি ইনপুট 0 হলে 1)', formula: 'Y = (A + B)\'', truthTable: [[0,0,1], [0,1,0], [1,0,0], [1,1,0]] },
  { id: 'XOR', label: 'XOR Gate', type: 'special', color: 'from-indigo-400 to-purple-500', stroke: 'text-indigo-400', desc: 'বিজোড় সংখ্যক ইনপুট 1 হলে আউটপুট 1', formula: 'Y = A ⊕ B', truthTable: [[0,0,0], [0,1,1], [1,0,1], [1,1,0]] },
  { id: 'XNOR', label: 'XNOR Gate', type: 'special', color: 'from-sky-400 to-blue-500', stroke: 'text-sky-400', desc: 'XOR গেইটের বিপরীত (জোড় সংখ্যক ইনপুট 1 হলে 1)', formula: 'Y = (A ⊕ B)\'', truthTable: [[0,0,1], [0,1,0], [1,0,0], [1,1,1]] }
];

const GateSymbol = ({ type, className }) => {
  const svgProps = {
    viewBox: "0 0 100 60",
    className: `w-full h-full drop-shadow-[0_0_12px_rgba(255,255,255,0.15)] ${className}`,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 3,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  };

  switch (type) {
    case 'AND':
      return (
        <svg {...svgProps}>
          <path d="M 20 10 L 50 10 A 20 20 0 0 1 50 50 L 20 50 Z" />
          <line x1="0" y1="20" x2="20" y2="20" />
          <line x1="0" y1="40" x2="20" y2="40" />
          <line x1="70" y1="30" x2="100" y2="30" />
        </svg>
      );
    case 'OR':
      return (
        <svg {...svgProps}>
          <path d="M 20 10 Q 35 30 20 50" />
          <path d="M 20 10 Q 50 10 70 30" />
          <path d="M 20 50 Q 50 50 70 30" />
          <line x1="0" y1="20" x2="26" y2="20" />
          <line x1="0" y1="40" x2="26" y2="40" />
          <line x1="70" y1="30" x2="100" y2="30" />
        </svg>
      );
    case 'NOT':
      return (
        <svg {...svgProps}>
          <path d="M 20 15 L 60 30 L 20 45 Z" />
          <circle cx="65" cy="30" r="5" />
          <line x1="0" y1="30" x2="20" y2="30" />
          <line x1="70" y1="30" x2="100" y2="30" />
        </svg>
      );
    case 'NAND':
      return (
        <svg {...svgProps}>
          <path d="M 20 10 L 50 10 A 20 20 0 0 1 50 50 L 20 50 Z" />
          <circle cx="75" cy="30" r="5" />
          <line x1="0" y1="20" x2="20" y2="20" />
          <line x1="0" y1="40" x2="20" y2="40" />
          <line x1="80" y1="30" x2="100" y2="30" />
        </svg>
      );
    case 'NOR':
      return (
        <svg {...svgProps}>
          <path d="M 20 10 Q 35 30 20 50" />
          <path d="M 20 10 Q 50 10 70 30" />
          <path d="M 20 50 Q 50 50 70 30" />
          <circle cx="75" cy="30" r="5" />
          <line x1="0" y1="20" x2="26" y2="20" />
          <line x1="0" y1="40" x2="26" y2="40" />
          <line x1="80" y1="30" x2="100" y2="30" />
        </svg>
      );
    case 'XOR':
      return (
        <svg {...svgProps}>
          <path d="M 12 10 Q 27 30 12 50" />
          <path d="M 20 10 Q 35 30 20 50" />
          <path d="M 20 10 Q 50 10 70 30" />
          <path d="M 20 50 Q 50 50 70 30" />
          <line x1="0" y1="20" x2="18" y2="20" />
          <line x1="0" y1="40" x2="18" y2="40" />
          <line x1="70" y1="30" x2="100" y2="30" />
        </svg>
      );
    case 'XNOR':
      return (
        <svg {...svgProps}>
          <path d="M 12 10 Q 27 30 12 50" />
          <path d="M 20 10 Q 35 30 20 50" />
          <path d="M 20 10 Q 50 10 70 30" />
          <path d="M 20 50 Q 50 50 70 30" />
          <circle cx="75" cy="30" r="5" />
          <line x1="0" y1="20" x2="18" y2="20" />
          <line x1="0" y1="40" x2="18" y2="40" />
          <line x1="80" y1="30" x2="100" y2="30" />
        </svg>
      );
    default:
      return null;
  }
};

export default function LogicGateSimulator() {
  const [selectedGateId, setSelectedGateId] = useState('AND');
  const [inputA, setInputA] = useState(0);
  const [inputB, setInputB] = useState(0);
  const [showTruthTable, setShowTruthTable] = useState(false);
  
  const selectedGate = gates.find(g => g.id === selectedGateId);
  const isNotGate = selectedGateId === 'NOT';

  const calculateOutput = () => {
    switch (selectedGateId) {
      case 'AND': return inputA && inputB;
      case 'OR': return inputA || inputB;
      case 'NOT': return !inputA;
      case 'NAND': return !(inputA && inputB);
      case 'NOR': return !(inputA || inputB);
      case 'XOR': return inputA !== inputB;
      case 'XNOR': return inputA === inputB;
      default: return 0;
    }
  };

  const output = calculateOutput() ? 1 : 0;
  
  const toggleInput = (input, setInput) => {
    setInput(prev => prev === 1 ? 0 : 1);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white pt-24 pb-16 px-4 font-bangla">
      <Helmet>
        <title>লজিক গেইট সিমুলেটর (Logic Gate Simulator) | আইসিটি টুলস | একাডেমিক হাব</title>
        <meta name="description" content="এইচএসসি আইসিটি (HSC ICT) এর ডিজিটাল ডিভাইস (Digital Device) অধ্যায়ের জন্য লজিক গেইট সিমুলেটর। AND, OR, NOT, NAND, NOR, XOR, XNOR গেইটগুলোর ইনপুট পরিবর্তন করে আউটপুট ও ট্রুথ টেবিল দেখুন।" />
        <meta name="keywords" content="logic gate simulator, hsc ict chapter 3, digital device, boolean algebra, truth table, AND gate, OR gate, NOT gate, লজিক গেইট, আইসিটি" />
        <meta property="og:title" content="লজিক গেইট সিমুলেটর (Logic Gate Simulator) | আইসিটি টুলস" />
        <meta property="og:description" content="ইন্টারেক্টিভ লজিক গেইট সিমুলেটর। গেইটগুলোর কাজ বুঝতে ইনপুট পরিবর্তন করে আউটপুট চেক করুন।" />
      </Helmet>

      <div className="max-w-3xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-indigo-500/10 rounded-2xl mb-4 border border-indigo-500/20 shadow-inner">
            <Cpu className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400 drop-shadow-sm mb-4 py-2">
            লজিক গেইট সিমুলেটর
          </h1>
          <p className="text-slate-400 text-sm sm:text-base font-medium max-w-lg mx-auto">
            লজিক গেইট নির্বাচন করুন, ইনপুট পরিবর্তন করুন এবং আউটপুট ও ট্রুথ টেবিল পর্যবেক্ষণ করুন।
          </p>
        </div>

        {/* Main Unified Card */}
        <div className="bg-slate-900/50 rounded-3xl border border-slate-800/80 backdrop-blur-sm p-5 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-64 h-64 opacity-20 rounded-full blur-[100px] pointer-events-none bg-gradient-to-br ${selectedGate.color}`}></div>
          
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h2 className="text-xl font-bold text-slate-200">সিমুলেশন প্যানেল</h2>
            <button 
              onClick={() => setShowTruthTable(!showTruthTable)}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 hover:border-slate-600 whitespace-nowrap flex-shrink-0"
            >
              <List className="w-4 h-4 flex-shrink-0" /> <span>{showTruthTable ? 'টেবিল লুকান' : 'টেবিল দেখুন'}</span>
            </button>
          </div>

          {/* Gate Selection Tabs */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 relative z-10">
            {gates.map(gate => (
              <button
                key={gate.id}
                onClick={() => {
                  setSelectedGateId(gate.id);
                  setInputA(0);
                  setInputB(0);
                  setShowTruthTable(false);
                }}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                  selectedGateId === gate.id 
                    ? 'bg-indigo-500 text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]' 
                    : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {gate.id}
              </button>
            ))}
          </div>

          {/* Interactive Circuit Area */}
          <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-6 sm:p-8 mb-2 relative z-10">
            <div className="flex justify-between items-start mb-8 gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">{selectedGate.label}</h2>
                <p className="text-slate-400 text-sm mt-1">{selectedGate.desc}</p>
              </div>
              <div className="px-3 py-1 bg-slate-900/80 border border-slate-700 rounded-lg flex-shrink-0 whitespace-nowrap">
                <span className="text-slate-300 font-mono font-bold text-sm">{selectedGate.formula}</span>
              </div>
            </div>

            <div className="flex items-center justify-center w-full max-w-md mx-auto py-8">
              
              {/* Inputs */}
              <div className="relative w-16 sm:w-24 h-32 sm:h-40 flex-shrink-0">
                {isNotGate ? (
                  <div className="absolute top-[50%] right-0 -translate-y-1/2 flex items-center gap-3 pr-2">
                    <span className="text-xl font-black text-indigo-400">A</span>
                    <button 
                      onClick={() => toggleInput(inputA, setInputA)}
                      className={`flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 rounded-xl border-2 text-lg sm:text-xl font-bold transition-all z-10 ${inputA === 1 ? 'bg-indigo-500 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                    >
                      {inputA}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="absolute top-[33.33%] right-0 -translate-y-1/2 flex items-center gap-3 pr-2">
                      <span className="text-xl font-black text-indigo-400">A</span>
                      <button 
                        onClick={() => toggleInput(inputA, setInputA)}
                        className={`flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 rounded-xl border-2 text-lg sm:text-xl font-bold transition-all z-10 ${inputA === 1 ? 'bg-indigo-500 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                      >
                        {inputA}
                      </button>
                    </div>
                    <div className="absolute top-[66.67%] right-0 -translate-y-1/2 flex items-center gap-3 pr-2">
                      <span className="text-xl font-black text-purple-400">B</span>
                      <button 
                        onClick={() => toggleInput(inputB, setInputB)}
                        className={`flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 rounded-xl border-2 text-lg sm:text-xl font-bold transition-all z-10 ${inputB === 1 ? 'bg-purple-500 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                      >
                        {inputB}
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Gate SVG */}
              <div className="w-28 sm:w-48 h-32 sm:h-40 flex-shrink-0 -ml-2 -mr-2 relative z-0 flex items-center">
                <GateSymbol type={selectedGate.id} className={selectedGate.stroke} />
              </div>

              {/* Output Display */}
              <div className="relative w-16 sm:w-24 h-32 sm:h-40 flex-shrink-0 flex items-center pl-2">
                <div className="flex flex-col items-center gap-3 z-10">
                  <span className="text-xl font-black text-emerald-400 mb-[-5px]">Y</span>
                  <div className={`flex flex-col items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl border-2 transition-all duration-300 ${output === 1 ? 'bg-emerald-500/20 border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.6)]' : 'bg-slate-900 border-slate-700 opacity-80'}`}>
                    {output === 1 ? (
                      <Lightbulb className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400 animate-pulse" />
                    ) : (
                      <LightbulbOff className="w-6 h-6 sm:w-8 sm:h-8 text-slate-500" />
                    )}
                  </div>
                  <span className="text-2xl font-black text-white mt-[-5px]">{output}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Truth Table */}
          <AnimatePresence>
            {showTruthTable && (
              <motion.div 
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                className="pt-6 relative z-10"
              >
                <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-indigo-500/10">
                      <List className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">{selectedGate.id} ট্রুথ টেবিল</h3>
                  </div>

                  <div className="overflow-x-auto rounded-xl">
                    <table className="w-full text-center border-collapse">
                      <thead>
                        <tr className="bg-slate-900/50 text-slate-300 text-sm uppercase tracking-wider">
                          <th className="px-4 py-3 font-medium">A</th>
                          {!isNotGate && <th className="px-4 py-3 font-medium">B</th>}
                          <th className="px-4 py-3 font-medium text-emerald-400">Y (Output)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedGate.truthTable.map((row, index) => {
                          const rowInputA = row[0];
                          const rowInputB = isNotGate ? null : row[1];
                          const rowOutput = isNotGate ? row[1] : row[2];
                          const isActive = inputA === rowInputA && (isNotGate || inputB === rowInputB);
                          
                          return (
                            <tr key={index} className={`transition-colors border-t border-slate-800/50 ${isActive ? 'bg-indigo-500/10' : 'hover:bg-slate-800/30'}`}>
                              <td className={`px-4 py-3 font-mono font-bold ${isActive ? 'text-indigo-300' : 'text-slate-400'}`}>{rowInputA}</td>
                              {!isNotGate && <td className={`px-4 py-3 font-mono font-bold ${isActive ? 'text-purple-300' : 'text-slate-400'}`}>{rowInputB}</td>}
                              <td className={`px-4 py-3 font-mono font-black ${isActive ? 'text-emerald-400' : 'text-slate-300'}`}>{rowOutput}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">
                    <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p>
                      <strong>টিপস:</strong> উপরের সার্কিটে A এবং B বাটনে ক্লিক করে ইনপুট পরিবর্তন করুন। ট্রুথ টেবিলে বর্তমান অবস্থার সারিটি হাইলাইট হয়ে থাকবে।
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Information Section */}
        <div className="mt-8 bg-indigo-500/5 border border-indigo-500/20 rounded-3xl p-6 sm:p-8 relative z-10 text-center">
           <h3 className="text-lg font-bold text-indigo-300 mb-3">কীভাবে ব্যবহার করবেন?</h3>
           <p className="text-slate-400 text-sm leading-relaxed max-w-2xl mx-auto">
             উপরের প্যানেল থেকে যেকোনো একটি গেইট নির্বাচন করুন। এরপর সার্কিট অংশে থাকা A এবং B বাটন দুটিতে ক্লিক করে ইনপুট সিগন্যাল (0 বা 1) পরিবর্তন করুন। এর ফলে ওই গেইটের লজিক অনুযায়ী ডানপাশে আউটপুট (Y) আপডেট হবে এবং আউটপুট 1 হলে বাল্বটি জ্বলে উঠবে।
           </p>
        </div>

      </div>
    </div>
  );
}
