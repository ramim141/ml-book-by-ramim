import React, { useState, useRef } from 'react';
import { 
  Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle, 
  Trash2, Play, Loader2, Sparkles, Layers, Eye, RefreshCw, Info 
} from 'lucide-react';
import { db } from '../../config/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { toBn } from '../../lib/format';
import toast from 'react-hot-toast';

const SAMPLE_CSV_CONTENT = `question,optionA,optionB,optionC,optionD,correctAnswer,explanation,subject,chapter,level,year,type
"কোষের পাওয়ার হাউস কাকে বলা হয়?","রাইবোজোম","মাইটোকন্ড্রিয়া","গলগি বডি","লাইসোজোম","মাইটোকন্ড্রিয়া","মাইটোকন্ড্রিয়ায় ক্রেবস চক্র ও এটিপি উৎপন্ন হয় তাই একে পাওয়ার হাউস বলে।","biology","cell_structure","Admission","2023","mcq"
"নিচের কোনটি ভেক্টর রাশি?","ভর","দ্রুতি","বেগ","কাজ","বেগ","বেগ হলো নির্দিষ্ট দিকে একক সময়ে অতিক্রান্ত দূরত্ব, তাই এটি ভেক্টর রাশি।","physics","vector","HSC","2023","mcq"
"পানির পিএইচ (pH) মান কত?","৫","৬","৭","৮","৭","বিশুদ্ধ পানি নিরপেক্ষ তাই এর pH মান ৭।","chemistry","water_ph","SSC","2022","mcq"`;

export default function BulkQuestionUploader() {
  const fileInputRef = useRef(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'valid' | 'invalid'
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Download Sample Template
  const handleDownloadSample = () => {
    const blob = new Blob(['\uFEFF' + SAMPLE_CSV_CONTENT], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_questions_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('স্যাম্পল CSV ফাইল ডাউনলোড হয়েছে! 📥');
  };

  // Robust CSV Line Parser
  const parseCSV = (text) => {
    const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) return [];

    // Simple CSV parser supporting quotes
    const parseLine = (line) => {
      const result = [];
      let cur = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if ((char === ',' || char === '\t') && !inQuotes) {
          result.push(cur.trim());
          cur = '';
        } else {
          cur += char;
        }
      }
      result.push(cur.trim());
      return result;
    };

    const headers = parseLine(lines[0]).map(h => h.replace(/^["']|["']$/g, '').trim());
    
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const vals = parseLine(lines[i]).map(v => v.replace(/^["']|["']$/g, '').trim());
      if (vals.length <= 1) continue;

      const rowObj = {};
      headers.forEach((h, idx) => {
        rowObj[h] = vals[idx] || '';
      });

      // Construct options array
      const options = [
        rowObj.optionA || rowObj['অপশন ক'] || rowObj.opt1 || '',
        rowObj.optionB || rowObj['অপশন খ'] || rowObj.opt2 || '',
        rowObj.optionC || rowObj['অপশন গ'] || rowObj.opt3 || '',
        rowObj.optionD || rowObj['অপশন ঘ'] || rowObj.opt4 || '',
      ].filter(Boolean);

      const questionText = rowObj.question || rowObj['প্রশ্ন'] || '';
      const correctAns = rowObj.correctAnswer || rowObj['সঠিক উত্তর'] || rowObj.correct || '';

      const errors = [];
      if (!questionText) errors.push('প্রশ্ন নেই');
      if (options.length < 2) errors.push('ন্যূনতম ২টি অপশন আবশ্যক');
      if (!correctAns) errors.push('সঠিক উত্তর মিসিং');

      rows.push({
        id: `bulk_${i}_${Date.now()}`,
        question: questionText,
        options,
        correctAnswer: correctAns,
        explanation: rowObj.explanation || rowObj['ব্যাখ্যা'] || '',
        subject: rowObj.subject || rowObj['বিষয়'] || 'general',
        chapter: rowObj.chapter || rowObj['অধ্যায়'] || 'general',
        level: rowObj.level || rowObj['লেভেল'] || 'HSC',
        year: rowObj.year || rowObj['বছর'] || '2024',
        type: rowObj.type || 'mcq',
        isValid: errors.length === 0,
        errors,
      });
    }

    return rows;
  };

  // Handle File Upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result || '';
        const parsed = parseCSV(text);
        setParsedRows(parsed);
        if (parsed.length === 0) {
          toast.error('ফাইলে কোনো প্রশ্ন পাওয়া যায়নি। সঠিক ফরম্যাট ব্যবহার করুন।');
        } else {
          toast.success(`${toBn(parsed.length)}টি প্রশ্ন সফলভাবে প্রসেস করা হয়েছে!`);
        }
      } catch (err) {
        console.error('Parsing error:', err);
        toast.error('ফাইল পড়তে ত্রুটি হয়েছে।');
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  // Batch Upload to Firestore
  const handleBatchUpload = async () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      toast.error('আপলোড করার মতো কোনো বৈধ প্রশ্ন নেই।');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    const loadingToast = toast.loading('ডাটাবেসে বাল্ক আপলোড হচ্ছে...', { id: 'bulk-upload' });

    try {
      const batchSize = 400; // Firestore limit 500
      const chunks = [];
      for (let i = 0; i < validRows.length; i += batchSize) {
        chunks.push(validRows.slice(i, i + batchSize));
      }

      let uploadedCount = 0;
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const batch = writeBatch(db);

        chunk.forEach(q => {
          const docRef = doc(collection(db, 'academic_content'));
          batch.set(docRef, {
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            subject: q.subject,
            chapter: q.chapter,
            level: q.level,
            year: q.year,
            type: q.type,
            createdAt: new Date().toISOString(),
          });
        });

        await batch.commit();
        uploadedCount += chunk.length;
        setUploadProgress(Math.round((uploadedCount / validRows.length) * 100));
      }

      toast.success(`${toBn(uploadedCount)}টি প্রশ্ন সফলভাবে ডাটাবেসে যুক্ত হয়েছে! 🎉`, { id: 'bulk-upload' });
      setParsedRows([]);
      setFileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Batch upload failed:', err);
      toast.error('আপলোডে সমস্যা হয়েছে। আবার চেষ্টা করুন।', { id: 'bulk-upload' });
    } finally {
      setUploading(false);
    }
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const errorCount = parsedRows.filter(r => !r.isValid).length;

  const displayRows = parsedRows.filter(r => {
    if (filterMode === 'valid') return r.isValid;
    if (filterMode === 'invalid') return !r.isValid;
    return true;
  });

  return (
    <div className="space-y-6 font-bangla">
      
      {/* Top Banner Card */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white">বাল্ক প্রশ্ন আপলোডার (Bulk Question Importer)</h2>
          </div>
          <p className="text-xs text-slate-400">
            এক্সেলে তৈরি করা প্রশ্নাবলী এক ক্লিকে CSV ফরম্যাটে আপলোড ও ভ্যালিডেশন করে ডাটাবেসে সেভ করুন।
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadSample}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition"
        >
          <Download className="w-4 h-4 text-indigo-400" />
          <span>স্যাম্পল CSV ফরম্যাট ডাউনলোড</span>
        </button>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="group relative cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed border-slate-700 hover:border-indigo-500/60 bg-slate-900/40 hover:bg-slate-900/70 p-8 text-center transition-all shadow-xl"
      >
        <input 
          ref={fileInputRef} 
          type="file" 
          accept=".csv, .txt, .tsv" 
          className="hidden" 
          onChange={handleFileChange} 
        />
        
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Upload className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-white">
              {fileName ? fileName : 'CSV ফাইল এখানে ড্র্যাগ করুন অথবা ক্লিক করে সিলেক্ট করুন'}
            </h3>
            <p className="text-xs text-slate-400">
              সাপোর্টেড ফরম্যাট: .csv (UTF-8 Encoded Bangla Support)
            </p>
          </div>
        </div>
      </div>

      {/* Parsed Rows Preview & Action Bar */}
      {parsedRows.length > 0 && (
        <div className="space-y-4 p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
          
          {/* Header Ribbon */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-white">
                মোট প্রশ্ন: {toBn(parsedRows.length)}টি
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                ✓ {toBn(validCount)}টি প্রস্তুত
              </span>
              {errorCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-xs font-bold">
                  ⚠️ {toBn(errorCount)}টিতে ত্রুটি
                </span>
              )}
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800">
              {[
                { id: 'all', label: 'সকল' },
                { id: 'valid', label: 'শুধুমাত্র সঠিক' },
                { id: 'invalid', label: 'ত্রুটিপূর্ণ' },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterMode(tab.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    filterMode === tab.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table Preview */}
          <div className="overflow-x-auto max-h-96 divide-y divide-white/5">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-950 text-slate-400 font-bold border-b border-white/10">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">প্রশ্ন</th>
                  <th className="py-2.5 px-3">অপশনসমূহ</th>
                  <th className="py-2.5 px-3">সঠিক উত্তর</th>
                  <th className="py-2.5 px-3">বিষয় ও অধ্যায়</th>
                  <th className="py-2.5 px-3">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {displayRows.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 font-bold text-slate-500">{toBn(idx + 1)}</td>
                    <td className="py-2.5 px-3 max-w-xs truncate font-medium text-slate-200">
                      {row.question || <span className="text-rose-400 italic">প্রশ্ন নেই</span>}
                    </td>
                    <td className="py-2.5 px-3 max-w-xs truncate text-[11px] text-slate-400">
                      {row.options.join(', ') || '-'}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-emerald-400">
                      {row.correctAnswer || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-indigo-300">
                      {row.subject} · {row.chapter} ({row.level})
                    </td>
                    <td className="py-2.5 px-3">
                      {row.isValid ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> সঠিক
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-bold" title={row.errors.join(', ')}>
                          <AlertCircle className="w-3.5 h-3.5" /> {row.errors.join(', ')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Bar */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/5">
            <button
              type="button"
              onClick={() => setParsedRows([])}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> তালিকা পরিষ্কার করুন
            </button>

            <button
              type="button"
              onClick={handleBatchUpload}
              disabled={uploading || validCount === 0}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>আপলোড হচ্ছে ({toBn(uploadProgress)}%)...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>{toBn(validCount)}টি প্রশ্ন ডাটাবেসে আপলোড করুন</span>
                </>
              )}
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
