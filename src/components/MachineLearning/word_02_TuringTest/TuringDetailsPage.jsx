import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, BookOpen, ChevronRight, CheckCircle, XCircle, FlaskConical, HelpCircle, Target, MessageSquare, ShieldAlert, Heart, Terminal } from 'lucide-react';

import turingData from './Turing_Test.json';
import SimulationLab from './SimulationLab';
import StoryDialogue from '../../UI/StoryDialogue';
import ComparisonTable from '../../UI/ComparisonTable';
import LogbookContainer from '../../UI/LogbookContainer';
import LogbookItem from '../../UI/LogbookItem';
import WordNavigation from '../../UI/WordNavigation';

const SIM_DIALOGUES = [
  { sender: 'judge', text: 'Are you a human?' },
  { sender: 'roomX', text: 'Of course! Why would you doubt that? 😊' },
  { sender: 'roomY', text: 'I process language patterns to simulate human responses.' },
  { sender: 'system', text: 'JUDGE DECISION: ROOM X IS HUMAN (SUCCESS!)' }
];

export default function TuringDetailsPage() {
  const [activeTab, setActiveTab] = useState('reading');
  const [pollSelected, setPollSelected] = useState(null);
  const [imitationStage, setImitationStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setImitationStage((prev) => (prev + 1) % SIM_DIALOGUES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 py-4 md:py-8 space-y-6 md:space-y-8 text-slate-300 bg-[#070b12]">
      
      {/* --- Tab Switcher Header --- */}
      <div className="flex flex-col gap-3 pb-3 border-b sm:flex-row sm:items-center sm:justify-between border-white/10 md:pb-2">
        <div className="flex w-full gap-2 sm:gap-4 sm:w-auto">
          <button onClick={() => setActiveTab('reading')} className={`flex-1 sm:flex-none relative flex items-center justify-center sm:justify-start gap-2 pb-2 font-bold text-xs sm:text-sm transition-colors ${activeTab === 'reading' ? 'text-slate-100' : 'text-slate-500 hover:text-slate-300'}`}>
            <BookOpen size={16} className="shrink-0" /> <span className="whitespace-nowrap">📖 পাঠ্যক্রম (Lesson)</span>
            {activeTab === 'reading' && <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-500" />}
          </button>
          <button onClick={() => setActiveTab('lab')} className={`flex-1 sm:flex-none relative flex items-center justify-center sm:justify-start gap-2 pb-2 font-bold text-xs sm:text-sm transition-colors ${activeTab === 'lab' ? 'text-slate-100' : 'text-slate-500 hover:text-slate-300'}`}>
            <FlaskConical size={16} className="shrink-0" /> <span className="whitespace-nowrap">🔬 ল্যাব সিমুলেটর</span>
            {activeTab === 'lab' && <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-500" />}
          </button>
        </div>
        <div className="hidden sm:block text-[10px] md:text-xs font-mono tracking-widest text-slate-500">
          ML WORD BY WORD • WORD 2
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'reading' ? (
          <motion.div key="reading" variants={containerVariants} initial="hidden" animate="visible" exit={{ opacity: 0, y: -10 }} className="space-y-10 md:space-y-12 font-sans text-base sm:text-lg md:text-xl lg:text-[21px] leading-relaxed text-slate-300">
            
            {/* --- Header --- */}
            <motion.div variants={itemVariants} className="pb-3 space-y-1 font-sans border-b md:pb-4 md:space-y-2 border-white/5">
              <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-bold text-slate-500 tracking-wide uppercase">
                <span className="hidden sm:inline">{turingData.part}</span>
              </div>
              <h1 className="flex flex-wrap items-center gap-2 text-2xl font-extrabold text-slate-100 sm:text-3xl">
                <Brain className="w-6 h-6 text-slate-400 md:w-7 md:h-7 shrink-0" /> {turingData.word_bn} <span className="font-sans text-sm font-normal sm:text-lg text-slate-500">({turingData.word_en})</span>
              </h1>
            </motion.div>

            {/* --- Real World Flash & Terminal Scan --- */}
            <motion.div variants={itemVariants} className="grid items-start grid-cols-1 gap-6 md:gap-8 lg:grid-cols-12">
              <div className="space-y-3 lg:col-span-7 md:space-y-4">
                <div className="flex items-center gap-2 font-sans text-slate-400">
                  <Sparkles size={16} className="shrink-0" />
                  <span className="text-sm font-bold leading-snug tracking-wider text-white uppercase sm:text-base md:text-lg">{turingData.real_world_flash.title}</span>
                </div>
                {turingData.real_world_flash.paragraphs.map((p, idx) => <p key={idx} className="text-justify indent-6">{p}</p>)}
              </div>
              
              <div className="flex justify-center pt-2 lg:col-span-5">
                <div className="w-full max-w-[320px] rounded-2xl bg-[#0b111b] border border-white/10 p-3 sm:p-4 shadow-md mx-auto">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
                    <div className="flex gap-1.5 items-center text-[10px] sm:text-xs font-mono font-bold text-slate-400"><Terminal size={14} /> IMITATION GAME TERMINAL</div>
                    <div className="flex gap-1"><span className="w-2 h-2 rounded-full bg-slate-600"/><span className="w-2 h-2 rounded-full bg-slate-500"/><span className="w-2 h-2 rounded-full bg-slate-400"/></div>
                  </div>
                  <div className="bg-[#030712] border border-white/5 p-2.5 sm:p-3 min-h-[150px] sm:min-h-[160px] flex flex-col gap-2 rounded-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:12px_20px]" />
                    <div className="relative z-10 flex flex-col w-full gap-2">
                      {SIM_DIALOGUES.slice(0, imitationStage + 1).map((msg, i) => (
                        <div key={i} className={`flex flex-col ${msg.sender === 'judge' ? 'items-end' : msg.sender === 'system' ? 'items-center border-t border-white/10 pt-2 mt-1' : 'items-start'}`}>
                          {msg.sender !== 'system' && <span className={`text-[9px] sm:text-[10px] font-mono font-bold text-slate-500 mb-0.5`}>{msg.sender.toUpperCase()}:</span>}
                          <span className={`text-[11px] sm:text-xs px-2.5 py-1.5 rounded-lg border ${msg.sender === 'judge' ? 'bg-white/5 border-white/10 text-slate-300 rounded-tr-none' : msg.sender === 'system' ? 'border-none text-[10px] font-mono font-black text-slate-400 animate-pulse tracking-wide' : 'bg-[#1f3a46]/30 border-white/10 text-slate-200 rounded-tl-none'}`}>{msg.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <StoryDialogue title={turingData.story_dialogue.title} dialogues={turingData.story_dialogue.dialogues} itemVariants={itemVariants} />
            <ComparisonTable tableData={turingData.comparison_table} itemVariants={itemVariants} />

            <LogbookContainer title={turingData.word_bn} subtitle={turingData.word_en} date={turingData.logbook.date} itemVariants={itemVariants}>
              <LogbookItem number="১" icon={HelpCircle} title="সংজ্ঞা"><p className="text-justify">{turingData.logbook.points[0].split(':')[1]}</p></LogbookItem>
              <LogbookItem number="২" icon={Target} title="মূলনীতি (The Imitation Game)"><p className="text-justify">{turingData.logbook.points[1].split(':')[1]}</p></LogbookItem>
              <LogbookItem number="৩" icon={MessageSquare} title="গুরুত্ব"><p className="text-justify">{turingData.logbook.points[2].split(':')[1]}</p></LogbookItem>
              <LogbookItem number="৪" icon={ShieldAlert} title="সমালোচনা (চাইনিজ রুম আর্গুমেন্ট)">
                <p className="mb-4 text-justify">{turingData.logbook.points[3].split(':')[1]}</p>
                {/* Updated Diagram Styling */}
                <div className="bg-[#0b111b] border border-white/10 rounded-lg p-4 flex flex-col md:flex-row items-center justify-around gap-4 text-xs font-mono">
                  <div className="flex flex-col items-center p-2 border rounded-lg bg-white/5 border-white/10"><span className="font-bold text-slate-300">Input (চীনা লিপি)</span></div>
                  <div className="font-black text-slate-500">➔</div>
                  <div className="flex flex-col items-center p-3 border rounded-lg bg-white/[0.08] border-white/20"><span className="font-bold text-slate-100">চীনা ঘর (The Room)</span><span className="text-[10px] text-slate-400">নিয়ম দেখে সাজানো</span></div>
                  <div className="font-black text-slate-500">➔</div>
                  <div className="flex flex-col items-center p-2 border rounded-lg bg-white/5 border-white/10"><span className="font-bold text-slate-300">Output (সঠিক উত্তর)</span></div>
                </div>
              </LogbookItem>
              <LogbookItem number="৫" icon={Heart} title="রিমিশার টেক-ইনসাইট" isHighlight={true}>
                <p className="font-serif italic leading-relaxed text-slate-300">"আধুনিক লার্জ ল্যাঙ্গুয়েজ মডেল খুব সহজেই সাধারণ মানুষকে ধোঁকা দিতে পারে..."</p>
              </LogbookItem>
            </LogbookContainer>

            {/* Inline Reflection Poll */}
            <motion.div variants={itemVariants} className="p-4 md:p-6 rounded-xl border border-white/10 bg-[#0b111b] font-sans">
              <div className="space-y-3">
                <span className="text-[9px] md:text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase flex items-center gap-1 mb-2">
                  <Sparkles size={12} className="shrink-0 text-slate-400" /> পাঠকের চিন্তার খোরাকঃ
                </span>
                <p className="text-xs leading-relaxed md:text-sm text-slate-300">{turingData.readers_reflection.question}</p>
              
                <div className="grid grid-cols-1 gap-3 pt-2 md:gap-4 sm:grid-cols-2">
                <button onClick={() => setPollSelected('A')} className={`p-3 md:p-4 rounded-xl border text-left transition-all flex items-start gap-2.5 text-xs md:text-sm ${pollSelected === 'A' ? 'bg-green-500/10 border-green-500/35 text-slate-100' : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-400'}`}>
                  <div className="mt-0.5 shrink-0">{pollSelected === 'A' ? <CheckCircle className="text-green-500" size={16}/> : <div className="w-4 h-4 rounded-full border border-white/30 flex items-center justify-center font-bold text-[10px]">১</div>}</div>
                  <div><span className="font-bold block text-slate-100 mb-0.5">অপশন ১ (সঠিক)</span>হ্যাঁ, টুরিং টেস্ট পাস করেছে।</div>
                </button>
                <button onClick={() => setPollSelected('B')} className={`p-3 md:p-4 rounded-xl border text-left transition-all flex items-start gap-2.5 text-xs md:text-sm ${pollSelected === 'B' ? 'bg-red-500/10 border-red-500/35 text-slate-100' : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-400'}`}>
                  <div className="mt-0.5 shrink-0">{pollSelected === 'B' ? <XCircle className="text-red-500" size={16}/> : <div className="w-4 h-4 rounded-full border border-white/30 flex items-center justify-center font-bold text-[10px]">২</div>}</div>
                  <div><span className="font-bold block text-slate-100 mb-0.5">অপশন ২</span>এক্সপার্ট সিস্টেম টেস্ট পাস করেছে।</div>
                </button>
                </div>
              </div>
            </motion.div>

            {/* Visualizer Teaser */}
            <motion.div variants={itemVariants} className="p-4 md:p-6 rounded-xl border border-white/10 bg-[#0b111b] font-sans">
              <div className="space-y-3">
                <span className="text-[9px] md:text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase flex items-center gap-1 mb-2">
                  <FlaskConical size={12} /> interactive sandbox simulator
                </span>
                <p className="text-xs leading-relaxed md:text-sm text-slate-300">উপরে থাকা <strong>"🔬 ল্যাব সিমুলেটর"</strong> ট্যাবে ক্লিক করে নিজে টুরিং টেস্টের বিচারক হোন!</p>
                <div className="pt-2">
                  <button onClick={() => { setActiveTab('lab'); document.querySelector("[data-reader-scroll]")?.scrollTo?.({ top: 0, behavior: 'smooth' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1f3a46] text-slate-100 font-bold text-sm hover:bg-[#294957] transition-all group active:scale-95">
                    লাইভ ল্যাব সিমুলেটর খুলুন <ChevronRight size={14} className="transition-transform group-hover:translate-x-1"/>
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <WordNavigation fallbackPath="turing-test" />
            </motion.div>

          </motion.div>
        ) : (
          <motion.div key="lab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pt-2 pb-10 md:pt-4">
            <SimulationLab />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}