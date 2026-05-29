import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitMerge, Sparkles, BookOpen, FlaskConical, Target, Layers, Heart, Compass, Zap, CheckCircle, XCircle, ChevronRight, AlertTriangle, ArrowRight } from 'lucide-react';
import { useParams } from 'react-router-dom';

import semiData from './SemiSupervisedLearning.json';
import SimulationLab from './SimulationLab';
import StoryDialogue from '../../UI/StoryDialogue';
import ComparisonTable from '../../UI/ComparisonTable';
import LogbookContainer from '../../UI/LogbookContainer';
import LogbookItem from '../../UI/LogbookItem';
import WordNavigation from '../../UI/WordNavigation';

export default function SemiSupervisedLearningDetailsPage() {
  const [activeTab, setActiveTab] = useState('reading');
  const [pollSelected, setPollSelected] = useState(null);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 py-4 md:py-8 space-y-6 md:space-y-8 text-slate-300 bg-[#070b12]">
      
      {/* Header Tabs */}
      <div className="flex flex-col gap-3 pb-3 border-b sm:flex-row sm:items-center sm:justify-between border-white/10 md:pb-2">
        <div className="flex w-full gap-2 sm:gap-4 sm:w-auto">
          <button onClick={() => setActiveTab('reading')} className={`flex-1 sm:flex-none relative flex items-center justify-center sm:justify-start gap-2 pb-2 font-bold text-xs sm:text-sm transition-colors ${activeTab === 'reading' ? 'text-slate-100' : 'text-slate-500 hover:text-slate-300'}`}>
            <BookOpen size={16} className="shrink-0" /> <span className="whitespace-nowrap">📖 পাঠ্যক্রম</span>
            {activeTab === 'reading' && <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-500" />}
          </button>
          <button onClick={() => setActiveTab('lab')} className={`flex-1 sm:flex-none relative flex items-center justify-center sm:justify-start gap-2 pb-2 font-bold text-xs sm:text-sm transition-colors ${activeTab === 'lab' ? 'text-slate-100' : 'text-slate-500 hover:text-slate-300'}`}>
            <FlaskConical size={16} className="shrink-0" /> <span className="whitespace-nowrap">🔬 ল্যাব সিমুলেটর</span>
            {activeTab === 'lab' && <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-500" />}
          </button>
        </div>
        <div className="hidden sm:block text-[10px] md:text-xs font-mono tracking-widest text-slate-500 uppercase">ML Word by Word • Word 18</div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'reading' ? (
          <motion.div key="reading" variants={containerVariants} initial="hidden" animate="visible" exit={{ opacity: 0, y: -10 }} className="space-y-10 md:space-y-12 font-sans text-base sm:text-lg md:text-xl lg:text-[21px] leading-relaxed">
            
            <motion.div variants={itemVariants} className="pb-3 space-y-1 border-b md:pb-4 border-white/5">
              <div className="text-[10px] md:text-xs font-bold text-slate-500 uppercase">{semiData.part}</div>
              <h1 className="flex flex-wrap items-center gap-2 text-2xl font-extrabold text-slate-100 sm:text-3xl lg:text-4xl">
                <GitMerge className="w-6 h-6 text-[#5b5dfa] md:w-8 md:h-8" /> {semiData.word_bn} <span className="text-sm font-normal text-slate-500 sm:text-lg">({semiData.word_en})</span>
              </h1>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="space-y-4 lg:col-span-12">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider"><Sparkles size={16} className="text-indigo-400"/> {semiData.real_world_flash.title}</div>
                {semiData.real_world_flash.paragraphs.map((p, i) => <p key={i} className="text-justify indent-6">{p}</p>)}
              </div>
            </motion.div>

            <StoryDialogue title={semiData.story_prose.title} dialogues={semiData.story_prose.paragraphs.map(p => ({text: p}))} itemVariants={itemVariants} />
            <ComparisonTable tableData={semiData.comparison_table} itemVariants={itemVariants} />

            <LogbookContainer title={semiData.word_bn} subtitle={semiData.word_en} date={semiData.engineering_logbook.date} itemVariants={itemVariants}>
               {semiData.engineering_logbook.points.map((pt, i) => (
                 <LogbookItem key={i} number={pt.id} title={pt.title} icon={i === 3 ? Heart : i === 1 ? Zap : i === 0 ? Layers : AlertTriangle} isHighlight={i === 3}>
                    <p>{pt.description}</p>
                 </LogbookItem>
               ))}
            </LogbookContainer>

            {/* Reflection Poll */}
            <motion.div variants={itemVariants} className="p-5 md:p-8 rounded-[2.5rem] border border-white/5 bg-[#0b111b] shadow-2xl space-y-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#5b5dfa]/5 blur-3xl rounded-full" />
               <h3 className="flex items-start gap-3 text-base font-bold text-slate-100 md:text-xl relative z-10"><Sparkles className="mt-1 text-amber-400 shrink-0" size={20}/> {semiData.readers_reflection.title}</h3>
               <p className="font-serif text-sm italic leading-relaxed text-justify md:text-lg text-slate-300 relative z-10">{semiData.readers_reflection.question}</p>
               <div className="grid grid-cols-1 gap-4 pt-2 md:gap-5 sm:grid-cols-2 relative z-10">
                  {semiData.readers_reflection.options.map(opt => (
                    <button key={opt.id} onClick={() => setPollSelected(opt.id)} className={`group p-4 md:p-5 rounded-2xl border text-left transition-all flex items-start gap-4 ${pollSelected === opt.id ? (opt.isCorrect ? 'bg-green-500/10 border-green-500/40 text-slate-100' : 'bg-red-500/10 border-red-500/40 text-slate-100') : 'bg-white/[0.02] border-white/5 hover:border-white/10 text-slate-400'}`}>
                      <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-full border flex items-center justify-center font-black text-xs ${pollSelected === opt.id ? (opt.isCorrect ? 'bg-green-500 border-green-400 text-white' : 'bg-rose-500 border-rose-400 text-white') : 'border-white/20'}`}>{opt.id}</div>
                      <div><span className="block mb-1 text-xs font-black uppercase tracking-widest opacity-50">Option {opt.id}</span><span className="text-sm font-bold md:text-base">{opt.text}</span></div>
                    </button>
                  ))}
               </div>
               <AnimatePresence>
                  {pollSelected && (
                    <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="p-4 rounded-2xl border bg-white/[0.02] border-white/10 text-slate-300 mt-4 text-sm md:text-base">
                      {semiData.readers_reflection.options.map(o => o.id === pollSelected && <p key={o.id} className="leading-relaxed"><span className={`font-black uppercase mr-2 ${o.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>{o.isCorrect ? 'Correct!' : 'Wrong!'}</span>{o.explanation}</p>)}
                    </motion.div>
                  )}
               </AnimatePresence>
            </motion.div>

            <motion.div variants={itemVariants} className="p-6 md:p-10 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-[#0b111b] to-[#070b12] relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full group-hover:bg-indigo-500/10 transition-all duration-700" />
               <div className="relative z-10 space-y-4 text-slate-400">
                  <span className="text-[10px] md:text-xs font-mono font-bold tracking-[0.3em] uppercase flex items-center gap-2 mb-2"><Compass size={14} className="animate-spin-slow text-indigo-400" /> Learning Without Guidance</span>
                  <p className="text-base italic leading-relaxed md:text-lg">{semiData.next_intro.text}</p>
                  <div className="pt-4">
                    <button onClick={() => { setActiveTab('lab'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-full sm:w-auto inline-flex justify-center items-center gap-3 px-8 py-4 rounded-2xl bg-white text-[#070b12] font-black text-sm hover:bg-slate-200 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">ল্যাব সিমুলেটরে ট্যাগ প্রোপাগেট করুন <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/></button>
                  </div>
               </div>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-4">
              <WordNavigation fallbackPath="semi-supervised-ml" />
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