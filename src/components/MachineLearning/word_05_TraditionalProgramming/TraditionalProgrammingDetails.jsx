import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Binary, Sparkles, CreditCard, BookOpen, ChevronRight, CheckCircle, XCircle, FlaskConical, Target, Code2, ShieldAlert, Heart } from 'lucide-react';

import traditionalData from './traditionalProgramming.json';
import SimulationLab from './SimulationLab';
import StoryDialogue from '../../UI/StoryDialogue';
import ComparisonTable from '../../UI/ComparisonTable';
import LogbookContainer from '../../UI/LogbookContainer';
import LogbookItem from '../../UI/LogbookItem';
import WordNavigation from '../../UI/WordNavigation';

export default function TraditionalProgrammingDetails() {
  const [activeTab, setActiveTab] = useState('reading');
  const [pollSelected, setPollSelected] = useState(null);
  const [pinMatched, setPinMatched] = useState(true);

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
          ML WORD BY WORD • WORD 5
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'reading' ? (
          <motion.div key="reading" variants={containerVariants} initial="hidden" animate="visible" exit={{ opacity: 0, y: -10 }} className="space-y-10 md:space-y-12 font-sans text-base sm:text-lg md:text-xl lg:text-[21px] leading-relaxed text-slate-300">
            
            {/* --- Header --- */}
            <motion.div variants={itemVariants} className="pb-3 space-y-1 font-sans border-b md:pb-4 md:space-y-2 border-white/5">
              <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-bold text-slate-500 tracking-wide uppercase">
                <span className="hidden sm:inline">{traditionalData.part}</span>
              </div>
              <h1 className="flex flex-wrap items-center gap-2 text-2xl font-extrabold text-slate-100 sm:text-3xl">
                <Binary className="w-6 h-6 text-slate-400 md:w-7 md:h-7 shrink-0" /> {traditionalData.word_bn} <span className="font-sans text-sm font-normal sm:text-lg text-slate-500">({traditionalData.word_en})</span>
              </h1>
            </motion.div>

            {/* --- Real World Flash & Pin Simulator --- */}
            <motion.div variants={itemVariants} className="grid items-start grid-cols-1 gap-6 md:gap-8 lg:grid-cols-12">
              <div className="space-y-3 lg:col-span-7 md:space-y-4">
                <div className="flex items-center gap-2 font-sans text-slate-400">
                  <Sparkles size={16} className="shrink-0" />
                  <span className="text-sm font-bold leading-snug tracking-wider text-white uppercase sm:text-base md:text-lg">{traditionalData.real_world_flash.title}</span>
                </div>
                {traditionalData.real_world_flash.paragraphs.map((p, idx) => <p key={idx} className="text-justify indent-6">{p}</p>)}
              </div>
              <div className="flex justify-center pt-2 lg:col-span-5">
                <div className="w-full max-w-[280px] rounded-2xl bg-[#0b111b] border border-white/10 p-5 shadow-xl flex flex-col items-center mx-auto">
                  <div className="relative flex items-center justify-center w-24 h-24 mb-4 border border-dashed rounded-full border-slate-500/30">
                    <CreditCard size={36} className="text-slate-400 opacity-80" />
                    {pinMatched ? (
                      <div className="absolute -bottom-2 bg-green-500/10 text-green-400 text-[10px] px-2 py-0.5 rounded border border-green-500/20 font-bold">PIN Valid</div>
                    ) : (
                      <div className="absolute -bottom-2 bg-red-500/10 text-red-400 text-[10px] px-2 py-0.5 rounded border border-red-500/20 font-bold">Wrong PIN</div>
                    )}
                  </div>
                  <span className="mb-4 font-mono text-xs font-bold leading-relaxed text-center whitespace-pre-wrap text-slate-400">
                    {pinMatched ? "IF PIN === DB_PIN \n-> DISPENSE CASH" : "ELSE \n-> REJECT TRANSACTION"}
                  </span>
                  <button onClick={() => setPinMatched(!pinMatched)} className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-semibold text-slate-500 hover:text-slate-200 transition-colors w-full active:scale-95">
                    {pinMatched ? "Simulate Incorrect Input" : "Simulate Correct Input"}
                  </button>
                </div>
              </div>
            </motion.div>

            <StoryDialogue title={traditionalData.story_prose.title} dialogues={traditionalData.story_prose.paragraphs.map(p => ({text: p}))} itemVariants={itemVariants} />
            <ComparisonTable tableData={traditionalData.comparison_table} itemVariants={itemVariants} />

            <LogbookContainer title={traditionalData.word_bn} subtitle={traditionalData.word_en} date={traditionalData.engineering_logbook.date} itemVariants={itemVariants}>
              <LogbookItem number="১" icon={Target} title={traditionalData.engineering_logbook.points[0].title}><p className="text-justify">{traditionalData.engineering_logbook.points[0].description}</p></LogbookItem>
              <LogbookItem number="২" icon={Code2} title={traditionalData.engineering_logbook.points[1].title}>
                <div className="bg-[#030712] border border-white/10 rounded-lg p-3 mb-3 max-w-xs text-center font-mono font-bold text-slate-300 text-sm md:text-base">{traditionalData.engineering_logbook.points[1].description.split('\n')[0]}</div>
                <p className="text-justify">{traditionalData.engineering_logbook.points[1].description.split('\n')[1]}</p>
              </LogbookItem>
              <LogbookItem number="৩" icon={ShieldAlert} title={traditionalData.engineering_logbook.points[2].title}><p className="text-justify">{traditionalData.engineering_logbook.points[2].description}</p></LogbookItem>
              <LogbookItem number="৪" icon={Heart} title={traditionalData.engineering_logbook.points[3].title} isHighlight={true}><p className="font-serif italic leading-relaxed text-slate-300">"{traditionalData.engineering_logbook.points[3].description}"</p></LogbookItem>
            </LogbookContainer>

            {/* Inline Reflection Poll */}
            <motion.div variants={itemVariants} className="p-4 md:p-6 rounded-xl border border-white/10 bg-[#0b111b] shadow-md space-y-4 font-sans">
              <h3 className="flex items-start gap-2 text-base font-bold text-slate-100 md:text-lg">
                <Sparkles className="mt-1 text-slate-400 shrink-0" size={16}/>
                <span className="leading-snug">{traditionalData.readers_reflection.title}</span>
              </h3>
              <p className="font-serif text-sm leading-relaxed text-justify whitespace-pre-line md:text-base text-slate-300">{traditionalData.readers_reflection.question}</p>
              
              <div className="grid grid-cols-1 gap-3 pt-2 md:gap-4 sm:grid-cols-2">
                {traditionalData.readers_reflection.options.map((option, idx) => (
                  <button key={idx} onClick={() => setPollSelected(option.id)} className={`p-3 md:p-4 rounded-xl border text-left transition-all flex items-start gap-2.5 text-xs md:text-sm ${pollSelected === option.id ? (option.isCorrect ? 'bg-green-500/10 border-green-500/35 text-slate-100' : 'bg-red-500/10 border-red-500/35 text-slate-100') : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-400'}`}>
                    <div className="mt-0.5 shrink-0">{pollSelected === option.id ? (option.isCorrect ? <CheckCircle className="text-green-500" size={16}/> : <XCircle className="text-red-500" size={16}/>) : <div className="w-4 h-4 rounded-full border border-white/30 flex items-center justify-center font-bold text-[10px]">{idx === 0 ? '১' : '২'}</div>}</div>
                    <div><span className="block mb-0.5 font-bold text-slate-100">অপশন {idx === 0 ? '১' : '২'}</span>{option.text}</div>
                  </button>
                ))}
              </div>
              
              <AnimatePresence>
                {pollSelected && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-3 md:p-4 rounded-lg border bg-white/[0.03] border-white/10 text-slate-300 mt-4 text-xs md:text-sm overflow-hidden">
                    {traditionalData.readers_reflection.options.map(option => pollSelected === option.id && (
                      <div key={option.id} className="space-y-1.5">
                        <span className={`flex items-center gap-1 font-bold ${option.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                          {option.isCorrect ? <CheckCircle size={14}/> : <XCircle size={14}/>} 
                          {option.isCorrect ? 'একদম সঠিক উত্তর!' : 'উত্তরটি সঠিক হয়নি!'}
                        </span>
                        <p className="leading-relaxed">{option.explanation}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Visualizer Teaser */}
            <motion.div variants={itemVariants} className="p-4 md:p-6 rounded-xl border border-white/10 bg-[#0b111b] font-sans">
              <div className="space-y-3">
                <span className="text-[9px] md:text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase flex items-center gap-1">
                  <FlaskConical size={12} /> interactive sandbox simulator
                </span>
                <p className="text-xs leading-relaxed md:text-sm text-slate-300">উপরে থাকা <strong>"🔬 ল্যাব সিমুলেটর"</strong> ট্যাবে ক্লিক করে নিজে "৫" আঁকার চ্যালেঞ্জ এবং এটিএম বুথ সিমুলেটর ট্রাই করুন!</p>
                <div className="pt-2">
                  <button onClick={() => { setActiveTab('lab'); document.querySelector("[data-reader-scroll]")?.scrollTo?.({ top: 0, behavior: 'smooth' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1f3a46] text-slate-100 font-bold text-sm hover:bg-[#294957] transition-all group active:scale-95">
                    লাইভ ল্যাব সিমুলেটর খুলুন <ChevronRight size={14} className="transition-transform group-hover:translate-x-1"/>
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <WordNavigation fallbackPath="traditional-programming" />
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