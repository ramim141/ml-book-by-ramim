import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Copy, RefreshCw, Hash, Binary, Divide, Hexagon, Calculator } from 'lucide-react';
import { motion } from 'framer-motion';

const bases = [
  { id: 'bin', label: 'বাইনারি (Base 2)', base: 2, icon: Binary, placeholder: 'যেমন: 1010', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 'oct', label: 'অক্টাল (Base 8)', base: 8, icon: Divide, placeholder: 'যেমন: 75', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { id: 'dec', label: 'ডেসিমাল (Base 10)', base: 10, icon: Hash, placeholder: 'যেমন: 125', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'hex', label: 'হেক্সাডেসিমাল (Base 16)', base: 16, icon: Hexagon, placeholder: 'যেমন: 2F', color: 'text-purple-400', bg: 'bg-purple-500/10' },
];

export default function BaseConverter() {
  const [values, setValues] = useState({ bin: '', oct: '', dec: '', hex: '' });
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const isValidInput = (val, base) => {
    if (!val) return true;
    const regexes = {
      2: /^[01]+$/,
      8: /^[0-7]+$/,
      10: /^[0-9]+$/,
      16: /^[0-9A-Fa-f]+$/
    };
    return regexes[base].test(val);
  };

  const handleInputChange = (e, sourceBase, sourceId) => {
    const val = e.target.value;
    const cleanVal = val.trim();
    
    if (!cleanVal) {
      setValues({ bin: '', oct: '', dec: '', hex: '' });
      setError('');
      return;
    }

    if (!isValidInput(cleanVal, sourceBase)) {
      setError(`ভুল ইনপুট! এটি সঠিক ${sourceBase}-ভিত্তিক সংখ্যা নয়।`);
      setValues(prev => ({ ...prev, [sourceId]: val }));
      return;
    }

    setError('');
    try {
      const decimalValue = parseInt(cleanVal, sourceBase);
      setValues({
        bin: decimalValue.toString(2),
        oct: decimalValue.toString(8),
        dec: decimalValue.toString(10),
        hex: decimalValue.toString(16).toUpperCase(),
      });
    } catch (err) {
      setError('হিসাবে ত্রুটি হয়েছে!');
    }
  };

  const handleCopy = (text, id) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const clearAll = () => {
    setValues({ bin: '', oct: '', dec: '', hex: '' });
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white pt-24 pb-16 px-4 font-bangla">
      <Helmet>
        <title>বেইজ কনভার্টার (Base Converter) | আইসিটি টুলস | একাডেমিক হাব</title>
        <meta name="description" content="এইচএসসি আইসিটি (HSC ICT) এর সংখ্যা পদ্ধতি (Number System) অধ্যায়ের জন্য একটি চমৎকার বেইজ কনভার্টার। খুব সহজেই বাইনারি, ডেসিমাল, অক্টাল এবং হেক্সাডেসিমাল সংখ্যা একে অপরটিতে রূপান্তর করুন।" />
        <meta name="keywords" content="base converter, number system converter, ict chapter 3, hsc ict, binary converter, decimal converter, octal, hexadecimal, সংখ্যা পদ্ধতি, আইসিটি" />
        <meta property="og:title" content="বেইজ কনভার্টার (Base Converter) | আইসিটি টুলস" />
        <meta property="og:description" content="বাইনারি, ডেসিমাল, অক্টাল এবং হেক্সাডেসিমাল সংখ্যার মধ্যে দ্রুত রূপান্তর করার একটি পারফেক্ট টুল।" />
      </Helmet>

      <div className="max-w-3xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-indigo-500/10 rounded-2xl mb-4 border border-indigo-500/20 shadow-inner">
            <Calculator className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400 drop-shadow-sm mb-4">
            সংখ্যা পদ্ধতি কনভার্টার
          </h1>
          <p className="text-slate-400 text-sm sm:text-base font-medium max-w-lg mx-auto">
            বাইনারি, অক্টাল, ডেসিমাল এবং হেক্সাডেসিমাল সংখ্যাগুলোর মধ্যে সহজেই রূপান্তর করুন।
          </p>
        </div>

        {/* Main Converter Card */}
        <div className="bg-slate-900/50 rounded-3xl border border-slate-800/80 backdrop-blur-sm p-5 sm:p-8 shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h2 className="text-xl font-bold text-slate-200">কনভার্সন প্যানেল</h2>
            <button 
              onClick={clearAll}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 hover:border-slate-600"
            >
              <RefreshCw className="w-4 h-4" /> <span>মুছে ফেলুন</span>
            </button>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm text-center font-medium relative z-10"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-4 relative z-10">
            {bases.map((b) => (
              <div key={b.id} className="relative group">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 hover:border-slate-600/60 transition-colors focus-within:border-indigo-500/50 focus-within:bg-slate-800/60">
                  
                  <div className="flex items-center gap-3 sm:w-48">
                    <div className={`p-2 rounded-xl ${b.bg}`}>
                      <b.icon className={`w-5 h-5 ${b.color}`} />
                    </div>
                    <label htmlFor={b.id} className="text-slate-300 font-bold text-sm sm:text-base">
                      {b.label}
                    </label>
                  </div>
                  
                  <div className="relative flex-grow flex items-center mt-2 sm:mt-0">
                    <input
                      id={b.id}
                      type="text"
                      value={values[b.id]}
                      onChange={(e) => handleInputChange(e, b.base, b.id)}
                      placeholder={b.placeholder}
                      className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-600 placeholder:font-sans"
                    />
                    
                    <button 
                      onClick={() => handleCopy(values[b.id], b.id)}
                      disabled={!values[b.id]}
                      className={`absolute right-2 p-2 rounded-lg transition-colors ${!values[b.id] ? 'text-slate-600 cursor-not-allowed' : copiedId === b.id ? 'bg-green-500/20 text-green-400' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                      title="Copy to clipboard"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Information Section */}
        <div className="mt-8 bg-indigo-500/5 border border-indigo-500/20 rounded-3xl p-6 sm:p-8 relative z-10 text-center">
           <h3 className="text-lg font-bold text-indigo-300 mb-3">কীভাবে ব্যবহার করবেন?</h3>
           <p className="text-slate-400 text-sm leading-relaxed max-w-2xl mx-auto">
             যেকোনো একটি বক্সে (যেমন: ডেসিমাল) আপনার কাঙ্ক্ষিত সংখ্যাটি লিখুন। বাকি বক্সগুলোতে স্বয়ংক্রিয়ভাবে অন্যান্য সংখ্যা পদ্ধতির মান চলে আসবে। ভুল সংখ্যা লিখলে সতর্কবার্তা দেখানো হবে।
           </p>
        </div>

      </div>
    </div>
  );
}
