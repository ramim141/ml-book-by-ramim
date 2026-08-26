import React, { useState, useRef } from 'react';
import { 
  FileText, Download, Printer, X, Check, Settings2, 
  Layers, Eye, CheckCircle2, Circle, Sparkles, Loader2 
} from 'lucide-react';
import { toBn } from '../../lib/format';
import toast from 'react-hot-toast';

export default function ExamPdfExportModal({
  isOpen,
  onClose,
  examTitle = 'মডেল টেস্ট প্রশ্নপত্র',
  questions = [],
  examInfo = { totalMarks: 100, timeLimitMinutes: 60, subject: 'সকল বিষয়' },
}) {
  const printAreaRef = useRef(null);
  const [mode, setMode] = useState('with_answers'); // 'question_only' | 'with_answers' | 'answer_key_only'
  const [includeOmr, setIncludeOmr] = useState(true);
  const [instituteName, setInstituteName] = useState('অ্যাকাডেমিক এডমিশন ও মডেল টেস্ট হাব');
  const [studentNameField, setStudentNameField] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!isOpen) return null;

  // Browser Native Print
  const handlePrint = () => {
    window.print();
  };

  // html2pdf.js export
  const handleDownloadPdf = async () => {
    if (!printAreaRef.current) return;
    setIsGeneratingPdf(true);
    toast.loading('PDF তৈরি করা হচ্ছে...', { id: 'pdf-gen' });

    try {
      if (document.fonts) {
        await document.fonts.ready;
      }
      const html2pdf = (await import('html2pdf.js')).default;
      const element = printAreaRef.current;
      
      const opt = {
        margin: [8, 8, 8, 8],
        filename: `${examTitle.replace(/\s+/g, '_')}_Question_Paper.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          letterRendering: true,
          logging: false,
          scrollY: 0,
          scrollX: 0
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
      toast.success('PDF সফলভাবে ডাউনলোড হয়েছে! 📄', { id: 'pdf-gen' });
    } catch (err) {
      console.error('PDF export failed:', err);
      toast.error('PDF ডাউনলোডে সমস্যা হয়েছে। প্রিন্ট বাটন ব্যবহার করুন।', { id: 'pdf-gen' });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md font-bangla">
      
      {/* Print-specific & Font-specific style isolating #print-paper-content */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700;800&family=Hind+Siliguri:wght@400;500;600;700&display=swap');
        
        #print-paper-content, #print-paper-content * {
          font-family: 'Noto Sans Bengali', 'Hind Siliguri', 'Kalpurush', 'SolaimanLipi', -apple-system, sans-serif !important;
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }

        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-paper-content, #print-paper-content * {
            visibility: visible !important;
            color: #000000 !important;
          }
          #print-paper-content {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      {/* Modal Container */}
      <div className="relative w-full max-w-6xl h-[94vh] flex flex-col bg-[#0d1322] border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">প্রিন্টেবল প্রশ্নপত্র ও উত্তরপত্র জেনারেটর</h3>
              <p className="text-[11px] sm:text-xs text-slate-400">অফিশিয়াল পরীক্ষার পেপারের মতো সাজানো PDF ডাউনলোড ও প্রিন্ট করুন</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Settings (Left) + Live Sheet (Right) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left Settings Panel */}
          <div className="w-full lg:w-96 p-5 sm:p-6 bg-slate-900/95 border-b lg:border-b-0 lg:border-r border-slate-800 overflow-y-auto space-y-5 shrink-0">
            
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
              <Settings2 className="w-4 h-4" />
              <span>PDF কাস্টমাইজেশন</span>
            </div>

            {/* Mode Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">পিডিএফ এর ধরন:</label>
              <div className="space-y-1.5">
                {[
                  { id: 'with_answers', label: '✅ প্রশ্ন + সঠিক উত্তর ও ব্যাখ্যা', desc: 'রিভিশন ও পড়ার উপযোগী' },
                  { id: 'question_only', label: '📝 শুধুমাত্র প্রশ্নপত্র (উত্তর ছাড়া)', desc: 'ঘরে বসে পরীক্ষার উপযোগী' },
                  { id: 'answer_key_only', label: '📊 প্রশ্ন + শেষে সংক্ষিপ্ত Answer Sheet', desc: 'কম্প্যাক্ট ওএমআর অ্যানসার কি' },
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                      mode === item.id 
                        ? 'bg-indigo-600/15 border-indigo-500/50 text-white shadow-sm' 
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="pdf_mode"
                      checked={mode === item.id}
                      onChange={() => setMode(item.id)}
                      className="mt-0.5 text-indigo-600 focus:ring-0"
                    />
                    <div>
                      <span className="text-xs font-bold block">{item.label}</span>
                      <span className="text-[10px] text-slate-400">{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Institute Name */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">প্রতিষ্ঠানের নাম (Header Title):</label>
              <input
                type="text"
                value={instituteName}
                onChange={(e) => setInstituteName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Options Toggles */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800">
              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeOmr}
                  onChange={(e) => setIncludeOmr(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-0 cursor-pointer"
                />
                <span>শেষে ব্ল্যাঙ্ক ওএমআর শিট (OMR Grid) যুক্ত করুন</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={studentNameField}
                  onChange={(e) => setStudentNameField(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-0 cursor-pointer"
                />
                <span>শিক্ষার্থীর নাম ও রোল লেখার বক্স রাখুন</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 space-y-2.5">
              <button
                type="button"
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition"
              >
                <Printer className="w-4 h-4" />
                <span>প্রিন্ট করুন / Save as PDF (ব্রাউজার)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition disabled:opacity-50"
              >
                {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>সরাসরি PDF ফাইল ডাউনলোড</span>
              </button>
            </div>

          </div>

          {/* Right Live Printable Paper Preview Panel */}
          <div className="flex-1 h-full overflow-y-auto p-4 sm:p-8 bg-[#030712] flex justify-center items-start">
            
            {/* Paper Container (Print Target) */}
            <div 
              ref={printAreaRef}
              id="print-paper-content"
              className="w-full max-w-[720px] bg-white text-slate-950 p-6 sm:p-10 rounded-lg shadow-2xl font-bangla text-[13px] leading-relaxed select-text border border-slate-200 min-h-[900px] my-2"
              style={{
                fontFamily: "'Noto Sans Bengali', 'Hind Siliguri', 'Kalpurush', sans-serif",
                WebkitFontSmoothing: 'antialiased'
              }}
            >
              
              {/* Header Box */}
              <div className="text-center border-b-2 border-slate-900 pb-3 mb-4 space-y-1">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-950">{instituteName}</h2>
                <h3 className="text-sm font-bold text-slate-800">{examTitle}</h3>
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 pt-1">
                  <span>বিষয়: {examInfo.subject || 'সাধারণ'}</span>
                  <span>সময়: {toBn(examInfo.timeLimitMinutes || 60)} মিনিট</span>
                  <span>পূর্ণমান: {toBn(examInfo.totalMarks || questions.length || 100)}</span>
                </div>
              </div>

              {/* Student Info Fields */}
              {studentNameField && (
                <div className="border border-slate-900 p-2.5 mb-4 text-[11px] grid grid-cols-2 gap-2 text-slate-900">
                  <div>শিক্ষার্থীর নাম: _______________________</div>
                  <div>রোল নম্বর: ___________________</div>
                  <div>পরীক্ষার তারিখ: ___________________</div>
                  <div>প্রাপ্ত নম্বর: ________ / {toBn(questions.length)}</div>
                </div>
              )}

              {/* Instructions */}
              <div className="text-[11px] italic text-slate-600 mb-4 pb-2 border-b border-slate-300">
                * প্রতিটি প্রশ্নের মান ১। ভুল উত্তরের জন্য ০.২৫ নম্বর কাটা যাবে। সঠিক উত্তরের বৃত্তটি পূরণ করো।
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {questions.map((q, idx) => {
                  const opts = Array.isArray(q.options) 
                    ? q.options.map(o => (typeof o === 'object' ? (o.text || o.title || '') : String(o)))
                    : [];
                  const correct = q.correctAnswer !== undefined ? q.correctAnswer : q.answer;
                  
                  return (
                    <div key={idx} className="break-inside-avoid space-y-1.5 pb-2 border-b border-slate-100 last:border-b-0">
                      
                      {/* Question Prompt */}
                      <div className="font-bold text-slate-950 flex items-start gap-1">
                        <span>{toBn(idx + 1)}.</span>
                        <span>{q.question || q.title || ''}</span>
                      </div>

                      {/* Options Grid (2x2) */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pl-4 text-[12px]">
                        {opts.map((opt, oIdx) => {
                          const prefix = ['(ক)', '(খ)', '(গ)', '(ঘ)'][oIdx] || `(${oIdx + 1})`;
                          const isCorrect = (mode === 'with_answers') && (
                            opt === correct || 
                            oIdx === correct || 
                            ['a','b','c','d'][oIdx] === String(correct).toLowerCase() ||
                            ['ক','খ','গ','ঘ'][oIdx] === correct
                          );

                          return (
                            <div 
                              key={oIdx} 
                              className={`flex items-start gap-1 ${
                                isCorrect 
                                  ? 'font-bold text-emerald-900 bg-emerald-100/90 px-1.5 py-0.5 rounded border border-emerald-300' 
                                  : 'text-slate-800'
                              }`}
                            >
                              <span className="font-semibold shrink-0">{prefix}</span>
                              <span>{opt}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation (if with_answers mode) */}
                      {mode === 'with_answers' && q.explanation && (
                        <div className="pl-4 pt-1 text-[11px] text-slate-700 bg-slate-50 p-2 rounded border-l-2 border-indigo-600 mt-1">
                          <span className="font-bold text-indigo-800">ব্যাখ্যা: </span>
                          <span>{q.explanation}</span>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>

              {/* Compact Answer Key Table (if answer_key_only mode) */}
              {mode === 'answer_key_only' && (
                <div className="mt-8 pt-4 border-t-2 border-slate-900 break-before-page">
                  <h4 className="font-bold text-center text-sm mb-3 text-slate-950">উত্তরমালা (Answer Sheet)</h4>
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 text-[11px] text-center">
                    {questions.map((q, i) => {
                      // উপরের তালিকার মতোই দুই রকম ফিল্ড — `answer` ই বেশিরভাগ
                      // প্রশ্নে থাকে, শুধু correctAnswer দেখায় বলে উত্তরমালা
                      // প্রায় সবসময় '-' ছাপত
                      const correct = q.correctAnswer !== undefined ? q.correctAnswer : q.answer;
                      return (
                        <div key={i} className="border border-slate-300 p-1 rounded bg-slate-50">
                          <span className="font-bold text-slate-900">{toBn(i + 1)}: </span>
                          <span className="font-bold text-indigo-800">
                            {typeof correct === 'number'
                              ? (['ক', 'খ', 'গ', 'ঘ'][correct] || toBn(correct + 1))
                              : correct || '-'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Blank OMR Grid */}
              {includeOmr && (
                <div className="mt-8 pt-4 border-t-2 border-slate-900 break-before-page">
                  <div className="text-center mb-3">
                    <h4 className="font-bold text-sm text-slate-950">ওএমআর শিট (OMR Answer Sheet)</h4>
                    <p className="text-[10px] text-slate-500">সঠিক উত্তরের বৃত্তটি বলপেন দিয়ে সম্পূর্ণ ভরাট করো</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                    {questions.map((_, i) => (
                      <div key={i} className="flex items-center justify-between border-b border-slate-200 pb-1 text-slate-800">
                        <span className="w-5 font-bold text-slate-900">{toBn(i + 1)}.</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-700 font-sans font-bold">
                          <span className="h-4 w-4 rounded-full border border-slate-800 flex items-center justify-center">A</span>
                          <span className="h-4 w-4 rounded-full border border-slate-800 flex items-center justify-center">B</span>
                          <span className="h-4 w-4 rounded-full border border-slate-800 flex items-center justify-center">C</span>
                          <span className="h-4 w-4 rounded-full border border-slate-800 flex items-center justify-center">D</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-8 pt-3 border-t border-slate-300 text-center text-[10px] text-slate-500">
                Designed & Generated with Academic Exam Hub · All Rights Reserved
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
