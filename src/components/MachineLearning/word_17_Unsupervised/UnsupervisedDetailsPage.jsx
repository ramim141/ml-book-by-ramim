import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Sparkles, BookOpen, FlaskConical, Target, Layers, Heart, Compass, Zap, CheckCircle, XCircle, ChevronRight, Grid, ScatterChart } from 'lucide-react';
import { useParams } from 'react-router-dom';

import unsupervisedData from './UnsupervisedLearning.json';
import SimulationLab from './SimulationLab';
import StoryDialogue from '../../UI/StoryDialogue';
import ComparisonTable from '../../UI/ComparisonTable';
import LogbookContainer from '../../UI/LogbookContainer';
import LogbookItem from '../../UI/LogbookItem';
import WordNavigation from '../../UI/WordNavigation';

export default function UnsupervisedDetailsPage() {
  const [activeTab, setActiveTab] = useState('reading');
  const [pollSelected, setPollSelected] = useState(null);
  const [clusteringActive, setClusteringActive] = useState(false);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 py-4 md:py-8 space-y-6 md:space-y-8 text-slate-300 bg-[#070b12]">

      {/* --- Tab Switcher --- */}
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
        <div className="hidden sm:block text-[10px] md:text-xs font-mono tracking-widest text-slate-500 uppercase">ML WORD BY WORD • WORD 17</div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'reading' ? (
          <motion.div key="reading" variants={containerVariants} initial="hidden" animate="visible" exit={{ opacity: 0, y: -10 }} className="space-y-10 md:space-y-12 font-sans text-base sm:text-lg md:text-xl lg:text-[21px] leading-relaxed text-slate-300">

            {/* --- Header --- */}
            <motion.div variants={itemVariants} className="pb-3 space-y-1 font-sans border-b md:pb-4 md:space-y-2 border-white/5">
              <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-bold text-slate-500 tracking-wide uppercase">
                <span>{unsupervisedData.part}</span>
              </div>
              <h1 className="flex flex-col items-start gap-2 text-2xl font-extrabold sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 sm:text-3xl text-slate-100">
                <Users className="w-6 h-6 text-[#0ea5e9] md:w-7 md:h-7 shrink-0" />
                <span className="flex flex-wrap items-center gap-2 leading-tight">
                  {unsupervisedData.word_bn} <span className="font-sans text-sm font-normal sm:text-lg text-slate-500">({unsupervisedData.word_en})</span>
                </span>
              </h1>
            </motion.div>

            {/* --- Hero Section & Clustering Simulation --- */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-12 items-center">
              <div className="space-y-3 lg:col-span-7 md:space-y-4">
                <div className="flex items-center gap-2 font-sans text-slate-400">
                  <Sparkles size={16} className="text-[#0ea5e9] shrink-0" />
                  <span className="text-sm font-bold text-white uppercase tracking-wider">{unsupervisedData.real_world_flash.title}</span>
                </div>
                {unsupervisedData.real_world_flash.paragraphs.map((p, i) => <p key={i} className="text-justify indent-6">{p}</p>)}
              </div>
              
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-[280px] h-72 rounded-3xl bg-[#0b111b] border border-white/10 p-6 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
                   <div className="absolute top-0 w-24 h-4 bg-black/40 rounded-b-xl" />
                   <div className="relative w-28 h-28 border border-dashed border-sky-500/30 flex items-center justify-center rounded-2xl mb-4 bg-white/[0.01]">
                      <motion.div animate={clusteringActive ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 2, repeat: Infinity }} className="grid grid-cols-3 gap-2">
                        {[...Array(9)].map((_, i) => (
                          <div key={i} className={`w-3 h-3 rounded-full transition-colors duration-700 ${clusteringActive ? (i % 3 === 0 ? "bg-cyan-400" : i % 3 === 1 ? "bg-purple-400" : "bg-amber-400") : "bg-slate-600"}`} />
                        ))}
                      </motion.div>
                   </div>
                   <p className="text-[10px] font-mono text-sky-400 h-8 text-center uppercase tracking-widest font-black leading-tight">
                    {clusteringActive ? "CLUSTERING ACTIVE \n Grouped by Distance" : "UNLABELED NOISE \n No tags attached"}
                   </p>
                   <button onClick={() => setClusteringActive(!clusteringActive)} className="mt-4 px-4 py-2 w-full rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 hover:text-white transition-all active:scale-95 shadow-lg">
                    {clusteringActive ? "Reset Raw Dataset" : "Run K-Means Explorer"}
                  </button>
                </div>
              </div>
            </motion.div>

            <StoryDialogue title={unsupervisedData.story_prose.title} dialogues={unsupervisedData.story_prose.paragraphs.map(p => ({ text: p }))} itemVariants={itemVariants} />
            <ComparisonTable tableData={unsupervisedData.comparison_table} itemVariants={itemVariants} />

            <LogbookContainer title={unsupervisedData.word_bn} subtitle={unsupervisedData.word_en} date={unsupervisedData.engineering_logbook.date} itemVariants={itemVariants}>
              {unsupervisedData.engineering_logbook.points.map((pt, i) => (
                <LogbookItem key={i} number={pt.id} title={pt.title} icon={i === 3 ? Heart : i === 1 ? Zap : i === 0 ? Grid : ScatterChart} isHighlight={i === 3}>
                  <p className={i === 3 ? 'font-serif italic leading-relaxed text-slate-300' : 'text-justify'}>{pt.description}</p>
                </LogbookItem>
              ))}
            </LogbookContainer>

            {/* --- Readers Reflection --- */}
            <motion.div variants={itemVariants} className="p-4 md:p-6 rounded-xl border border-white/10 bg-[#0b111b] shadow-md space-y-4 font-sans">
              <h3 className="flex items-start gap-2 text-base font-bold text-slate-100 md:text-lg">
                <Zap className="mt-1 text-amber-400 shrink-0" size={16} />
                <span className="leading-snug">{unsupervisedData.readers_reflection.title}</span>
              </h3>
              <p className="font-serif text-sm leading-relaxed text-justify md:text-base text-slate-300 italic">{unsupervisedData.readers_reflection.question}</p>

              <div className="grid grid-cols-1 gap-3 pt-2 md:gap-4 sm:grid-cols-2">
                {unsupervisedData.readers_reflection.options.map((option) => (
                  <button key={option.id} onClick={() => setPollSelected(option.id)} className={`rounded-xl border p-3 text-left transition-all flex items-start gap-2.5 text-xs md:text-sm ${pollSelected === option.id ? (option.isCorrect ? 'bg-green-500/10 border-green-500/35 text-slate-100 shadow-lg shadow-green-500/5' : 'bg-red-500/10 border-red-500/35 text-slate-100') : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-400'}`}>
                    <div className="mt-0.5 shrink-0">{pollSelected === option.id ? (option.isCorrect ? <CheckCircle className="text-green-500" size={16} /> : <XCircle className="text-red-500" size={16} />) : <div className="w-4 h-4 rounded-full border border-white/30 flex items-center justify-center font-bold text-[10px]">{option.id}</div>}</div>
                    <div><span className="block mb-0.5 font-bold text-slate-100">অপশন {option.id}</span>{option.text}</div>
                  </button>
                ))}
              </div>

              <AnimatePresence>
                {pollSelected && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-3 md:p-4 rounded-lg border bg-white/[0.03] border-white/10 text-slate-300 mt-4 text-xs md:text-sm overflow-hidden">
                    {unsupervisedData.readers_reflection.options.map(option => pollSelected === option.id && (
                      <div key={option.id} className="space-y-1.5">
                        <span className={`flex items-center gap-1 font-bold ${option.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                          {option.isCorrect ? <CheckCircle size={14} /> : <XCircle size={14} />} {option.isCorrect ? 'চমৎকার উত্তর!' : 'উত্তরটি সঠিক হয়নি!'}
                        </span>
                        <p className="leading-relaxed opacity-90">{option.explanation}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* --- Next Chapter Teaser --- */}
            <motion.div variants={itemVariants} className="p-4 md:p-6 rounded-xl border border-white/10 bg-[#0b111b] font-sans">
              <div className="space-y-3">
                <span className="text-[9px] md:text-[10px] font-mono font-bold tracking-widest text-[#0ea5e9] uppercase flex items-center gap-1 mb-2">
                  <Compass size={12} className="text-[#0ea5e9] animate-spin-slow" /> HYBRID LEARNING STRUCTURES
                </span>
                <p className="text-xs leading-relaxed md:text-sm text-slate-300 italic opacity-80">
                  {unsupervisedData.next_intro?.text}
                </p>
                <div className="pt-2">
                  <button onClick={() => { setActiveTab('lab'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-6 py-2.5 rounded-lg bg-[#112a3d] text-sky-100 font-bold text-sm hover:bg-[#1a3a52] transition-all group active:scale-95 border border-sky-900/30">
                    ল্যাবরেটরিতে ক্লাস্টার খুঁজুন <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <WordNavigation fallbackPath="unsupervised-ml" />
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