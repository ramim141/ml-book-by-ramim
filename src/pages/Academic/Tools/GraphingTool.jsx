import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import * as math from 'mathjs';
import { Activity, Info, RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GraphingTool() {
  const [equation, setEquation] = useState('x^2');
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  
  // Custom domains and step
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [step, setStep] = useState(0.5);

  const generateData = useCallback((eq) => {
    if (!eq.trim()) {
      setData([]);
      setError('সমীকরণ লিখুন');
      return;
    }

    try {
      // Test compilation to catch errors early
      const node = math.parse(eq);
      const code = node.compile();

      const points = [];
      for (let x = xMin; x <= xMax; x += step) {
        // Evaluate y for the current x
        let y = code.evaluate({ x: x });
        
        // Handle undefined or complex numbers (e.g. sqrt of negative)
        if (typeof y === 'object' && y.im !== undefined) {
          y = null; // Don't plot imaginary results on this real graph
        }
        
        if (Math.abs(y) > 1000) {
           y = null; // Limit extreme values for better rendering
        }

        points.push({
          x: Number(x.toFixed(2)),
          y: y !== null && !isNaN(y) ? Number(y.toFixed(2)) : null
        });
      }

      setData(points);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('ভুল সমীকরণ! সঠিক গাণিতিক সমীকরণ লিখুন (যেমন: x^2 + 2*x)');
    }
  }, [xMin, xMax, step]);

  useEffect(() => {
    // Generate data on mount or when dependencies change, adding a small delay for typing
    const timeoutId = setTimeout(() => {
      generateData(equation);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [equation, generateData]);

  const presetEquations = [
    { label: 'পরাবৃত্ত (Parabola)', eq: 'x^2' },
    { label: 'সরলরেখা (Linear)', eq: '2*x + 3' },
    { label: 'সাইন ওয়েভ (Sine Wave)', eq: 'sin(x)' },
    { label: 'বৃত্তের অর্ধেক (Circle half)', eq: 'sqrt(25 - x^2)' },
    { label: 'এক্সপোনেনশিয়াল (Exp)', eq: '2^x' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white pt-24 pb-16 px-4 font-bangla">
      <Helmet>
        <title>গ্রাফিং টুল | একাডেমিক হাব</title>
      </Helmet>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-fuchsia-500/10 rounded-2xl mb-4 border border-fuchsia-500/20 shadow-inner">
            <Activity className="w-8 h-8 sm:w-10 sm:h-10 text-fuchsia-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-fuchsia-200 to-fuchsia-400 drop-shadow-sm mb-4">
            গ্রাফিং টুল
          </h1>
          <p className="text-slate-400 text-sm sm:text-base font-medium max-w-lg mx-auto">
            যেকোনো গাণিতিক সমীকরণ লিখে সেটির গ্রাফ দেখুন এবং ভেরিয়েবলগুলোর মধ্যে সম্পর্ক বিশ্লেষণ করুন।
          </p>
        </div>

        {/* Main Tool Card */}
        <div className="bg-slate-900/50 rounded-3xl border border-slate-800/80 backdrop-blur-sm p-5 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row gap-8 items-start">
          <div className="absolute top-0 left-0 w-64 h-64 opacity-10 rounded-full blur-[100px] pointer-events-none bg-gradient-to-br from-fuchsia-500 to-indigo-500"></div>
          
          {/* Controls Panel (Left side on desktop) */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6 relative z-10">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                সমীকরণ (f(x) = y)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <span className="text-fuchsia-400 font-bold font-mono">f(x) =</span>
                </div>
                <input
                  type="text"
                  value={equation}
                  onChange={(e) => setEquation(e.target.value)}
                  placeholder="e.g. x^2 + 2*x"
                  className="w-full pl-16 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all shadow-inner"
                />
              </div>
              {error && (
                <div className="mt-2 flex items-center gap-1.5 text-rose-400 text-xs font-bold bg-rose-500/10 py-1.5 px-3 rounded-lg">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {error}
                </div>
              )}
            </div>

            <div className="bg-slate-800/30 rounded-2xl border border-slate-700/50 p-4">
              <h3 className="text-sm font-bold text-slate-300 mb-3 border-b border-slate-700 pb-2">উদাহরণ সমীকরণ</h3>
              <div className="flex flex-wrap gap-2">
                {presetEquations.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setEquation(preset.eq)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/30 rounded-2xl border border-slate-700/50 p-4">
               <h3 className="text-sm font-bold text-slate-300 mb-3 border-b border-slate-700 pb-2">গ্রাফ রেঞ্জ (X Axis)</h3>
               <div className="grid grid-cols-2 gap-3">
                 <div>
                   <label className="block text-xs text-slate-400 mb-1">X Min</label>
                   <input 
                     type="number" 
                     value={xMin} 
                     onChange={e => setXMin(Number(e.target.value) || -10)}
                     className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-fuchsia-500"
                   />
                 </div>
                 <div>
                   <label className="block text-xs text-slate-400 mb-1">X Max</label>
                   <input 
                     type="number" 
                     value={xMax} 
                     onChange={e => setXMax(Number(e.target.value) || 10)}
                     className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-fuchsia-500"
                   />
                 </div>
               </div>
            </div>
            
          </div>

          {/* Graph Display Area (Right side on desktop) */}
          <div className="w-full lg:w-2/3 h-[400px] lg:h-[500px] bg-slate-900/80 rounded-2xl border border-slate-700/80 p-2 sm:p-4 relative z-10 flex flex-col">
            <div className="flex justify-between items-center px-4 py-2 border-b border-slate-800 mb-4">
              <span className="text-sm font-bold text-slate-300">গ্রাফ ভিউ</span>
              <button 
                onClick={() => generateData(equation)}
                className="p-1.5 hover:bg-slate-800 rounded-md transition-colors text-slate-400 hover:text-white"
                title="Refresh Graph"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-grow w-full relative">
              {data.length > 0 && !error ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis 
                      dataKey="x" 
                      stroke="#475569" 
                      tick={{ fill: '#94a3b8', fontSize: 12 }} 
                      type="number" 
                      domain={[xMin, xMax]}
                      allowDataOverflow={true}
                    />
                    <YAxis 
                      stroke="#475569" 
                      tick={{ fill: '#94a3b8', fontSize: 12 }} 
                      domain={['auto', 'auto']}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                      itemStyle={{ color: '#e879f9', fontWeight: 'bold' }}
                      labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                      formatter={(value) => [value, 'y (output)']}
                      labelFormatter={(label) => `x = ${label}`}
                    />
                    <ReferenceLine x={0} stroke="#64748b" strokeWidth={1} />
                    <ReferenceLine y={0} stroke="#64748b" strokeWidth={1} />
                    
                    <Line 
                      type="monotone" 
                      dataKey="y" 
                      stroke="#d946ef" 
                      strokeWidth={3} 
                      dot={false}
                      activeDot={{ r: 6, fill: '#f0abfc', stroke: '#d946ef', strokeWidth: 2 }}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-slate-500 font-medium">কোনো ভ্যালিড গ্রাফ নেই</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-fuchsia-500/5 border border-fuchsia-500/20 rounded-3xl p-6 sm:p-8 relative z-10 text-center">
           <h3 className="text-lg font-bold text-fuchsia-300 mb-3">ব্যবহারের নিয়মাবলী</h3>
           <p className="text-slate-400 text-sm leading-relaxed max-w-2xl mx-auto">
             বাম পাশের ইনপুট বক্সে আপনার সমীকরণটি লিখুন। `x` কে ইনপুট ভেরিয়েবল হিসেবে ব্যবহার করুন। গুণ বোঝাতে `*` এবং পাওয়ার বোঝাতে `^` ব্যবহার করুন। যেমন: `2*x^2 + 5*x - 3`। এছাড়া ত্রিকোণমিতিক ফাংশন যেমন `sin(x)`, `cos(x)` ইত্যাদিও ব্যবহার করতে পারবেন।
           </p>
        </div>

      </div>
    </div>
  );
}
