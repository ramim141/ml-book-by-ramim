import React, { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Sparkles, BookOpen, ChevronRight, CheckCircle, XCircle, FlaskConical, Target, Layers, Activity, Heart, Compass, CheckSquare, Zap, ShieldAlert } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import testingData from './TestingSet.json';
import SEO from '../../SEO';

const SimulationLab = lazy(() => import('./SimulationLab'));
import StoryDialogue from '../../UI/StoryDialogue';
import ComparisonTable from '../../UI/ComparisonTable';
import LogbookContainer from '../../UI/LogbookContainer';
import LogbookItem from '../../UI/LogbookItem';
import WordNavigation from '../../UI/WordNavigation';

export default function TestingSetDetailsPage() {
  const { bookSlug: urlBookSlug } = useParams();
  const bookSlug = urlBookSlug || 'ml-by-ramim';
  
  const [activeTab, setActiveTab] = useState('reading');
  const [pollSelected, setPollSelected] = useState(null);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  const seoSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": `${testingData.word_bn} (${testingData.word_en}) - Machine Learning Book`,
    "description": "টেস্টিং সেট কী? মেশিন লার্নিংয়ে মডেল মূল্যায়নের জন্য কেন টেস্টিং সেট ব্যবহার করা হয় এবং ডেটা লিকেজ কীভাবে রোধ করা যায় তার বিস্তারিত আলোচনা।",
    "author": {
      "@type": "Person",
      "name": "Ramim"
    },
    "keywords": "Testing Set, টেস্টিং সেট, Machine Learning, Data Leakage, ডেটা লিকেজ, Overfitting, Model Evaluation, ML in Bengali"
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 py-4 md:py-8 space-y-6 md:space-y-8 text-slate-300 bg-[#070b12]">
      <SEO 
        title={`${testingData.word_bn} (${testingData.word_en})`}
        description="টেস্টিং সেট কী? মেশিন লার্নিংয়ে মডেল মূল্যায়নের জন্য কেন টেস্টিং সেট ব্যবহার করা হয় এবং ডেটা লিকেজ কীভাবে রোধ করা যায় তার বিস্তারিত আলোচনা।"
        schema={seoSchema}
      />
      <Helmet>
        <meta name="keywords" content="Testing Set, টেস্টিং সেট, Machine Learning, Data Leakage, ডেটা লিকেজ, Overfitting, Model Evaluation, ML in Bengali" />
      </Helmet>
      
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
        <div className="hidden sm:block text-[10px] md:text-xs font-mono tracking-widest text-slate-500 uppercase">ML Word by Word • Word 26</div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'reading' ? (
          <motion.div key="reading" variants={containerVariants} initial="hidden" animate="visible" exit={{ opacity: 0, y: -10 }} className="space-y-10 md:space-y-12 font-sans text-base sm:text-lg md:text-xl lg:text-[21px] leading-relaxed">
            
            <motion.div variants={itemVariants} className="pb-3 space-y-1 border-b md:pb-4 border-white/5">
              <div className="text-[10px] md:text-xs font-bold text-slate-500 uppercase">{testingData.chapter} / {testingData.part}</div>
              <h1 className="flex flex-wrap items-center gap-2 text-2xl font-extrabold text-slate-100 sm:text-3xl lg:text-4xl">
                <Lock className="w-6 h-6 text-[#f43f5e] md:w-8 md:h-8" /> {testingData.word_bn} <span className="text-sm font-normal text-slate-500 sm:text-lg">({testingData.word_en})</span>
              </h1>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="space-y-4 lg:col-span-7">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider"><Sparkles size={16} className="text-[#f43f5e]"/> {testingData.real_world_flash.title}</div>
                {testingData.real_world_flash.paragraphs.map((p, i) => <p key={i} className="text-justify indent-6">{p}</p>)}
              </div>
              <div className="lg:col-span-5 bg-[#0b111b] border border-white/5 rounded-3xl p-8 text-center relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 w-20 h-3 bg-black/40 rounded-b-xl left-1/2 -translate-x-1/2" />
                 <div className="text-6xl mb-4 text-rose-500 animate-pulse">🔒</div>
                 <p className="text-sm font-bold text-slate-200 mb-4 tracking-widest uppercase">Evaluation Phase</p>
                 <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 font-mono text-[10px] text-rose-400 text-left space-y-1 shadow-inner">
                    <p>Load: 20% Unseen Data</p>
                    <p>Action: Testing Generalization...</p>
                    <p>Rule: Do not peek before exam!</p>
                 </div>
                 <button onClick={() => { setActiveTab('lab'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="mt-6 w-full py-3 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 rounded-xl text-xs font-bold transition-all active:scale-95">ডেটা লিকেজ ল্যাবে যান</button>
              </div>
            </motion.div>

            <StoryDialogue title={testingData.story_prose.title} dialogues={testingData.story_prose.paragraphs.map(p => ({text: p}))} itemVariants={itemVariants} />
            <ComparisonTable tableData={testingData.comparison_table} itemVariants={itemVariants} />

            <LogbookContainer title={testingData.word_bn} subtitle={testingData.word_en} date={testingData.engineering_logbook.date} itemVariants={itemVariants}>
               {testingData.engineering_logbook.points.map((pt, i) => (
                 <LogbookItem key={i} number={pt.id} title={pt.title} icon={i === 3 ? Heart : i === 2 ? ShieldAlert : i === 1 ? Activity : Target} isHighlight={i === 3}>
                    <p className={i === 3 ? 'font-serif italic text-slate-300 leading-relaxed' : ''}>{pt.description}</p>
                 </LogbookItem>
               ))}
            </LogbookContainer>

            {/* Inline Reflection Poll */}
            <motion.div variants={itemVariants} className="p-4 md:p-6 rounded-xl border border-white/10 bg-[#0b111b] shadow-md space-y-4 font-sans">
              <h3 className="flex items-start gap-2 text-base font-bold text-slate-100 md:text-lg">
                <Sparkles className="mt-1 text-slate-400 shrink-0" size={16} />
                <span className="leading-snug">{testingData.readers_reflection.title}</span>
              </h3>
              <p className="font-serif text-sm leading-relaxed text-justify md:text-base text-slate-300">
                {testingData.readers_reflection.question}
              </p>
              
              <div className="grid grid-cols-1 gap-3 pt-2 md:gap-4 sm:grid-cols-2">
                {testingData.readers_reflection.options.map((opt, i) => (
                  <button key={opt.id} onClick={() => setPollSelected(opt.id)} className={`p-3 md:p-4 rounded-xl border text-left transition-all flex items-start gap-2.5 text-xs md:text-sm ${pollSelected === opt.id ? (opt.isCorrect ? 'bg-green-500/10 border-green-500/35 text-slate-100' : 'bg-red-500/10 border-red-500/35 text-slate-100') : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-400'}`}>
                    <div className="mt-0.5 shrink-0">{pollSelected === opt.id ? (opt.isCorrect ? <CheckCircle className="text-green-500" size={16} /> : <XCircle className="text-red-500" size={16} />) : <div className="w-4 h-4 rounded-full border border-white/30 flex items-center justify-center font-bold text-[10px]">{i === 0 ? '১' : '২'}</div>}</div>
                    <div><span className="font-bold block text-slate-100 mb-0.5">অপশন {i === 0 ? '১' : '২'} {opt.isCorrect && '(সঠিক উত্তর)'}</span>{opt.text}</div>
                  </button>
                ))}
              </div>

              <AnimatePresence>
                {pollSelected && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-3 md:p-4 rounded-lg border bg-white/[0.03] border-white/10 text-slate-300 mt-4 text-xs md:text-sm overflow-hidden">
                    {testingData.readers_reflection.options.map(o => o.id === pollSelected && (
                      <div key={o.id} className="space-y-1.5"><span className={`flex items-center gap-1 font-bold ${o.isCorrect ? 'text-green-400' : 'text-red-400'}`}>{o.isCorrect ? <CheckCircle size={14} /> : <XCircle size={14} />} {o.isCorrect ? 'চমৎকার! একদম সঠিক উত্তর!' : 'উত্তরটি সঠিক হয়নি মা!'}</span><p className="leading-relaxed">{o.explanation}</p></div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Next Chapter CTA */}
            <motion.div variants={itemVariants} className="p-4 md:p-6 rounded-xl border border-white/10 bg-[#0b111b] font-sans">
              <div className="space-y-3">
                <span className="text-[9px] md:text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase flex items-center gap-1">
                  <Compass size={12} /> ENTERING EVALUATION REFINEMENT
                </span>
                <h3 className="text-base font-bold text-slate-100 md:text-lg">পরবর্তী ধাপে যেতে প্রস্তুত?</h3>
                <p className="text-xs leading-relaxed md:text-sm text-slate-300">{testingData.next_intro.text}</p>
                <div className="pt-2">
                  <Link to={`/book/${bookSlug}/foundation/27`} className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1f3a46] text-slate-100 font-bold text-sm hover:bg-[#294957] transition-all group active:scale-95">
                    পরবর্তী শব্দে যান (Validation Set) <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-4">
              <WordNavigation fallbackPath="testing-set" />
            </motion.div>

          </motion.div>
        ) : (
          <motion.div key="lab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pt-2 pb-10 md:pt-4">
            <Suspense fallback={<div className="py-20 text-center text-slate-400 animate-pulse">ল্যাব লোড হচ্ছে...</div>}>
              <SimulationLab />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}