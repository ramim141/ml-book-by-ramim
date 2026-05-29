import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tag, Sparkles, BookOpen, ChevronRight, CheckCircle, 
  XCircle, FlaskConical, Target, Layers,
  Heart, Compass, Eye, EyeOff, PenTool, Zap
} from 'lucide-react';
import { useParams } from 'react-router-dom';

// ডেটা এবং সাব-কম্পোনেন্ট ইমপোর্ট
import outputLabelContent from './outputLevel.json';
import SimulationLab from './SimulationLab';
import StoryDialogue from '../../UI/StoryDialogue';
import ComparisonTable from '../../UI/ComparisonTable';
import LogbookContainer from '../../UI/LogbookContainer';
import LogbookItem from '../../UI/LogbookItem';
import WordNavigation from '../../UI/WordNavigation';

export default function OutputLabelDetailsPage() {
  const { bookSlug: urlBookSlug } = useParams();
  const bookSlug = urlBookSlug || 'ml-by-ramim';
  
  const [activeTab, setActiveTab] = useState('reading');
  const [pollSelected, setPollSelected] = useState(null);
  const [showLabels, setShowLabels] = useState(true);

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
          ML WORD BY WORD • WORD 11
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'reading' ? (
          <motion.div key="reading" variants={containerVariants} initial="hidden" animate="visible" exit={{ opacity: 0, y: -10 }} className="space-y-10 md:space-y-12 font-sans text-base sm:text-lg md:text-xl lg:text-[21px] leading-relaxed text-slate-300">
            
            {/* --- Header Section --- */}
            <motion.div variants={itemVariants} className="pb-3 space-y-1 font-sans border-b md:pb-4 md:space-y-2 border-white/5">
              <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-bold text-slate-500 tracking-wide uppercase">
                <span className="hidden sm:inline">{outputLabelContent.part}</span>
              </div>
              <h1 className="flex flex-col items-start gap-2 text-2xl font-extrabold sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 sm:text-3xl text-slate-100">
                <Tag className="w-6 h-6 text-slate-400 md:w-7 md:h-7 shrink-0" /> 
                <span className="flex flex-wrap items-center gap-2 leading-tight">
                  {outputLabelContent.word_bn} <span className="font-sans text-sm font-normal sm:text-lg text-slate-500">({outputLabelContent.word_en})</span>
                </span>
              </h1>
            </motion.div>

            {/* --- Real World Flash & Garden Visual --- */}
            <motion.div variants={itemVariants} className="grid items-start grid-cols-1 gap-6 md:gap-8 lg:grid-cols-12">
              <div className="space-y-3 lg:col-span-7 md:space-y-4">
                <div className="flex items-center gap-2 font-sans text-slate-400">
                  <Sparkles size={16} className="text-[#00daf3] shrink-0" />
                  <span className="text-sm font-bold leading-snug tracking-wider text-white uppercase sm:text-base md:text-lg">{outputLabelContent.real_world_flash.title}</span>
                </div>
                {outputLabelContent.real_world_flash.paragraphs.map((p, idx) => (
                  <p key={idx} className="text-justify indent-6">{p}</p>
                ))}
              </div>
              
              {/* Garden Simulator Graphic */}
              <div className="flex justify-center pt-2 lg:col-span-5">
                <div className="relative mx-auto flex w-full max-w-[280px] h-72 flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0b111b] p-5 shadow-xl overflow-hidden">
                  <div className="absolute top-0 w-20 h-3 bg-black/40 rounded-b-xl" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03),transparent)]" />
                  
                  <div className="z-10 w-full space-y-4">
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/5 shadow-inner transition-all">
                      <span className="text-sm font-bold text-slate-200">🌿 Rose Bush</span>
                      {showLabels ? (
                        <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="px-2.5 py-0.5 text-[10px] rounded-md font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)] uppercase">গোলাপ</motion.span>
                      ) : (
                        <span className="w-12 h-4 rounded bg-white/5 animate-pulse" />
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/5 shadow-inner transition-all">
                      <span className="text-sm font-bold text-slate-200">🌿 Hibiscus</span>
                      {showLabels ? (
                        <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="px-2.5 py-0.5 text-[10px] rounded-md font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)] uppercase">জবা</motion.span>
                      ) : (
                        <span className="w-12 h-4 rounded bg-white/5 animate-pulse" />
                      )}
                    </div>
                  </div>

                  <button onClick={() => setShowLabels(!showLabels)} className="mt-8 w-full px-3 py-1.5 rounded-md border border-white/10 bg-white/5 text-[10px] font-semibold text-slate-500 transition-colors hover:text-slate-200 active:scale-95 z-10 flex items-center justify-center gap-1.5">
                    {showLabels ? <EyeOff size={12} /> : <Eye size={12} />} 
                    {showLabels ? "Hide Nameplates" : "Attach Labels"}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* --- Story Prose Section --- */}
            <StoryDialogue 
              title={outputLabelContent.story_prose.title} 
              dialogues={outputLabelContent.story_prose.paragraphs.map(p => ({ text: p }))} 
              itemVariants={itemVariants} 
            />

            {/* --- Analysis Table --- */}
            <ComparisonTable 
              tableData={outputLabelContent.comparison_table} 
              itemVariants={itemVariants} 
            />

            {/* --- Engineering Logbook Timeline --- */}
            <LogbookContainer 
              title={outputLabelContent.word_bn} 
              subtitle={outputLabelContent.word_en} 
              date={outputLabelContent.engineering_logbook.date} 
              itemVariants={itemVariants}
            >
              {outputLabelContent.engineering_logbook.points.map((point, index) => (
                <LogbookItem 
                  key={index}
                  number={point.id || (index + 1).toLocaleString('bn-BD')} 
                  icon={index === 0 ? Target : index === 1 ? PenTool : index === 2 ? Layers : Heart} 
                  title={point.title} 
                  isHighlight={index === 3}
                >
                  <p className={index === 3 ? "font-serif leading-relaxed text-slate-300" : "text-justify"}>
                    {index === 3 ? `"${point.description}"` : point.description}
                  </p>
                </LogbookItem>
              ))}
            </LogbookContainer>

            {/* --- Readers Reflection Poll --- */}
            <motion.div variants={itemVariants} className="p-4 md:p-6 rounded-xl border border-white/10 bg-[#0b111b] shadow-md space-y-4 font-sans">
              <h3 className="flex items-start gap-2 text-base font-bold text-slate-100 md:text-lg">
                <Zap className="mt-1 text-slate-400 shrink-0" size={16}/> 
                <span className="leading-snug">{outputLabelContent.readers_reflection.title || "পাঠকের চিন্তার খোরাক"}</span>
              </h3>
              <p className="font-serif text-sm leading-relaxed text-justify whitespace-pre-line md:text-base text-slate-300">
                {outputLabelContent.readers_reflection.question}
              </p>
              
              <div className="grid grid-cols-1 gap-3 pt-2 md:gap-4 sm:grid-cols-2">
                {outputLabelContent.readers_reflection.options.map((option, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setPollSelected(option.id)} 
                    className={`rounded-xl border p-3 text-left transition-all flex items-start gap-2.5 text-xs md:text-sm ${
                      pollSelected === option.id 
                        ? (option.isCorrect ? 'bg-green-500/10 border-green-500/35 text-slate-100' : 'bg-red-500/10 border-red-500/35 text-slate-100') 
                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-400'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {pollSelected === option.id ? (
                        option.isCorrect ? <CheckCircle className="text-green-500" size={16}/> : <XCircle className="text-red-500" size={16}/>
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-white/30 flex items-center justify-center font-bold text-[10px]">
                          {idx === 0 ? '১' : '২'}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="block mb-0.5 font-bold text-slate-100">অপশন {idx === 0 ? '১' : '২'}</span>
                      {option.text}
                    </div>
                  </button>
                ))}
              </div>
              
              <AnimatePresence>
                {pollSelected && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }} 
                    className="p-3 md:p-4 rounded-lg border bg-white/[0.03] border-white/10 text-slate-300 mt-4 text-xs md:text-sm overflow-hidden"
                  >
                    {outputLabelContent.readers_reflection.options.map(option => pollSelected === option.id && (
                      <div key={option.id} className="space-y-1.5">
                        <span className={`flex items-center gap-1 font-bold ${option.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                          {option.isCorrect ? <CheckCircle size={14}/> : <XCircle size={14}/>} 
                          {option.isCorrect ? 'একদম সঠিক উত্তর!' : 'উত্তরটি সঠিক হয়নি!'}
                        </span>
                        <p className="leading-relaxed">{option.explanation}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* --- Next Chapter Teaser --- */}
            <motion.div variants={itemVariants} className="p-4 md:p-6 rounded-xl border border-white/10 bg-[#0b111b] font-sans">
              <div className="space-y-3">
                <span className="text-[9px] md:text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase flex items-center gap-1 mb-2">
                  <Compass size={12} className="text-slate-400" /> NEXT STEP INGREDIENT
                </span>
                <p className="text-xs leading-relaxed md:text-sm text-slate-300">{outputLabelContent.next_intro.text}</p>
                <div className="pt-2">
                  <button onClick={() => { 
                    setActiveTab('lab'); 
                    document.querySelector("[data-reader-scroll]")?.scrollTo?.({ top: 0, behavior: 'smooth' }); 
                    window.scrollTo({ top: 0, behavior: 'smooth' }); 
                  }} className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1f3a46] text-slate-100 font-bold text-sm hover:bg-[#294957] transition-all group active:scale-95">
                    ল্যাব সিমুলেটরে ডেটা ট্যাগ করুন <ChevronRight size={14} className="transition-transform group-hover:translate-x-1"/>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* --- Bottom Navigation --- */}
            <motion.div variants={itemVariants}>
              <WordNavigation fallbackPath="output-label" />
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