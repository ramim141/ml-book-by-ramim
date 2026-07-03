import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FlaskConical } from 'lucide-react';
import { elements } from '../../../data/elements';

const PeriodicTable = () => {
  const [selectedElement, setSelectedElement] = useState(null);

  // Helper to determine background color based on category
  const getCategoryColor = (category) => {
    switch (category) {
      case 'nonmetal': return 'bg-green-500/20 border-green-500/40 text-green-300 hover:bg-green-500/30';
      case 'noble': return 'bg-purple-500/20 border-purple-500/40 text-purple-300 hover:bg-purple-500/30';
      case 'alkali': return 'bg-orange-500/20 border-orange-500/40 text-orange-300 hover:bg-orange-500/30';
      case 'alkaline': return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/30';
      case 'metalloid': return 'bg-teal-500/20 border-teal-500/40 text-teal-300 hover:bg-teal-500/30';
      case 'halogen': return 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30';
      case 'transition': return 'bg-pink-500/20 border-pink-500/40 text-pink-300 hover:bg-pink-500/30';
      case 'post-transition': return 'bg-blue-500/20 border-blue-500/40 text-blue-300 hover:bg-blue-500/30';
      case 'lanthanide': return 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/30';
      case 'actinide': return 'bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30';
      default: return 'bg-slate-700/30 border-slate-600/50 text-slate-300 hover:bg-slate-700/50';
    }
  };

  const getCategoryName = (category) => {
    const categories = {
      'nonmetal': 'অধাতু (Nonmetal)',
      'noble': 'নিষ্ক্রিয় গ্যাস (Noble Gas)',
      'alkali': 'ক্ষার ধাতু (Alkali Metal)',
      'alkaline': 'মৃৎক্ষার ধাতু (Alkaline Earth Metal)',
      'metalloid': 'অপধাতু (Metalloid)',
      'halogen': 'হ্যালোজেন (Halogen)',
      'transition': 'অবস্থান্তর ধাতু (Transition Metal)',
      'post-transition': 'পোস্ট-ট্রানজিশন ধাতু',
      'lanthanide': 'ল্যান্থানাইড (Lanthanide)',
      'actinide': 'অ্যাক্টিনাইড (Actinide)',
      'unknown': 'অজানা (Unknown)'
    };
    return categories[category] || category;
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] pb-24 pt-8 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      <Helmet>
        <title>পর্যায় সারণি (Periodic Table) | একাডেমিক হাব</title>
        <meta name="description" content="ইন্টারেক্টিভ আধুনিক পর্যায় সারণি। সহজে মৌলগুলোর পারমাণবিক সংখ্যা, ভর, ইলেকট্রন বিন্যাস এবং গ্রুপ বা পর্যায় সম্পর্কে বিস্তারিত জানুন।" />
        <meta name="keywords" content="periodic table, chemistry, পর্যায় সারণি, রসায়ন, মৌল, পারমাণবিক সংখ্যা, hsc chemistry, ssc chemistry" />
        <meta property="og:title" content="পর্যায় সারণি | একাডেমিক হাব" />
        <meta property="og:description" content="বাংলায় ইন্টারেক্টিভ আধুনিক পর্যায় সারণি। রসায়নের সকল মৌলের বিস্তারিত তথ্য।" />
      </Helmet>

      <div className="max-w-[1400px] mx-auto px-2 sm:px-4 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl mb-4 border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
            <FlaskConical className="h-8 w-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-bangla tracking-wide drop-shadow-md">
            ইন্টারেক্টিভ পর্যায় সারণি
          </h1>
          <p className="text-slate-400 mt-2 font-bangla">মৌলগুলোর বিস্তারিত জানতে ক্লিক করুন</p>
        </div>

        <div className="w-full overflow-x-auto pb-8 custom-scrollbar">
          <div className="min-w-full w-max px-2 sm:px-6 py-2">
            <div className="mx-auto w-max grid grid-cols-[repeat(18,45px)] sm:grid-cols-[repeat(18,50px)] md:grid-cols-[repeat(18,55px)] lg:grid-cols-[repeat(18,60px)] xl:grid-cols-[repeat(18,65px)] gap-1 sm:gap-1.5 p-2 sm:p-4 bg-slate-900/50 rounded-3xl border border-slate-800/80 backdrop-blur-sm text-left">
            
            {/* Main Elements + Placeholders */}
            {[
              ...elements,
              { num: '57-71', sym: 'La-Lu', name: 'Lanthanides', cat: 'lanthanide', period: 6, group: 3, isPlaceholder: true },
              { num: '89-103', sym: 'Ac-Lr', name: 'Actinides', cat: 'actinide', period: 7, group: 3, isPlaceholder: true }
            ].map((el) => {
              // Special positioning for Lanthanides and Actinides to pull them out of the main grid
              const isLanthanide = el.cat === 'lanthanide' && !el.isPlaceholder;
              const isActinide = el.cat === 'actinide' && !el.isPlaceholder;
              
              // Shift lanthanides and actinides down by 1 row to create a gap at row 8
              let gridRow = el.period;
              if (isLanthanide) gridRow = 9;
              if (isActinide) gridRow = 10;

              const gridCol = el.group;

              return (
                <motion.div
                  key={el.num}
                  whileHover={!el.isPlaceholder ? { scale: 1.1, zIndex: 10 } : {}}
                  whileTap={!el.isPlaceholder ? { scale: 0.95 } : {}}
                  onClick={() => !el.isPlaceholder && setSelectedElement(el)}
                  className={`
                    relative p-0.5 sm:p-1 border rounded-md sm:rounded-lg flex flex-col items-center justify-center transition-colors shadow-sm aspect-square min-w-0 overflow-hidden
                    ${el.isPlaceholder ? 'cursor-default opacity-80' : 'cursor-pointer'}
                    ${getCategoryColor(el.cat)}
                  `}
                  style={{
                    gridRow: gridRow,
                    gridColumn: gridCol
                  }}
                >
                  <span className="absolute top-0.5 left-1 text-[0.5rem] sm:text-[0.6rem] font-bold opacity-70">{el.num}</span>
                  <span className="text-xs sm:text-base font-bold mt-2">{el.sym}</span>
                  <span className="text-[0.4rem] sm:text-[0.55rem] truncate w-full text-center opacity-80 mt-auto leading-none mb-0.5">{el.name}</span>
                </motion.div>
              );
            })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 flex flex-wrap gap-3 justify-center max-w-4xl mx-auto">
          {['alkali', 'alkaline', 'transition', 'post-transition', 'metalloid', 'nonmetal', 'halogen', 'noble', 'lanthanide', 'actinide'].map(cat => (
            <div key={cat} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full border ${getCategoryColor(cat).split(' ').slice(0,2).join(' ')}`}></div>
              <span className="text-slate-400 text-xs sm:text-sm font-bangla">{getCategoryName(cat)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Element Details using React Portal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedElement && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                onClick={() => setSelectedElement(null)}
              ></motion.div>
              
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.9, opacity: 0, y: 20 }} 
                className={`relative z-10 w-[90%] max-w-[340px] max-h-[90vh] overflow-y-auto custom-scrollbar rounded-3xl border p-5 sm:p-6 shadow-2xl bg-slate-900 border-slate-700`}
              >
                <div className={`absolute top-0 left-0 w-full h-32 opacity-20 pointer-events-none ${getCategoryColor(selectedElement.cat).split(' ')[0]}`}></div>
                
                <button 
                  onClick={() => setSelectedElement(null)}
                  className="absolute top-4 right-4 z-20 p-2 bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center relative z-10">
                  <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 flex flex-col items-center justify-center shadow-lg mb-4 sm:mb-6 ${getCategoryColor(selectedElement.cat)}`}>
                    <span className="text-xs sm:text-sm font-bold opacity-70 mb-0.5 sm:mb-1">{selectedElement.num}</span>
                    <span className="text-3xl sm:text-4xl font-black">{selectedElement.sym}</span>
                  </div>
                  
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">{selectedElement.name}</h2>
                  <p className="text-indigo-400 font-bangla text-xs sm:text-sm mb-4 sm:mb-6">{getCategoryName(selectedElement.cat)}</p>
                  
                  <div className="w-full space-y-2 sm:space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                      <span className="text-slate-400 text-sm">পারমাণবিক সংখ্যা</span>
                      <span className="text-white font-bold">{selectedElement.num}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                      <span className="text-slate-400 text-sm">পারমাণবিক ভর</span>
                      <span className="text-white font-bold">{selectedElement.mass}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                        <span className="text-slate-400 text-xs">পর্যায়</span>
                        <span className="text-white font-bold">{selectedElement.period <= 7 ? selectedElement.period : (selectedElement.period === 8 ? '6' : '7')}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                        <span className="text-slate-400 text-xs">গ্রুপ</span>
                        <span className="text-white font-bold">{selectedElement.group}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                      <span className="text-slate-400 text-sm">যোজনী (Valency)</span>
                      <span className="text-white font-bold text-sm sm:text-base">{selectedElement.valency || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                      <span className="text-slate-400 text-sm">ইলেকট্রন বিন্যাস</span>
                      <span className="text-white font-bold font-mono text-xs sm:text-sm">{selectedElement.eConfig || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default PeriodicTable;
