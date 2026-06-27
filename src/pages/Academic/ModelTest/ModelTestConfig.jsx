import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Target, ChevronDown, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import chaptersIct from '../../../components/Academic/HSC/ICT/ICT_data/chapters.json';
import chaptersChemistry from '../../../components/Academic/HSC/Chemistry/Chemistry_data/chapters.json';

const subjectConfigs = {
  'hsc-ict': {
    title: 'এইচএসসি আইসিটি (ICT)',
    chapters: chaptersIct.chapters,
    mcqs: import.meta.glob('../../../components/Academic/HSC/ICT/ICT_data/chapter_*_Json/chapter_*_MCQs.json'),
  },
  'hsc-chemistry': {
    title: 'এইচএসসি রসায়ন ১ম পত্র',
    chapters: chaptersChemistry.chapters,
    mcqs: import.meta.glob('../../../components/Academic/HSC/Chemistry/Chemistry_data/chapter_*_Json/chapter_*_MCQs.json'),
  }
};

const DURATION_OPTIONS = [
  { label: '১০ মিনিট', value: 10 },
  { label: '১৫ মিনিট', value: 15 },
  { label: '২০ মিনিট', value: 20 },
  { label: '২৫ মিনিট', value: 25 },
  { label: '৩০ মিনিট', value: 30 },
];

const QUESTION_COUNT_OPTIONS = [
  { label: '১০ টি', value: 10 },
  { label: '১৫ টি', value: 15 },
  { label: '২০ টি', value: 20 },
  { label: '২৫ টি', value: 25 },
];

export default function ModelTestConfig() {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('all');
  const [questionCount, setQuestionCount] = useState(10);
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleStartExam = async () => {
    if (!selectedSubject) {
      setError('দয়া করে একটি বিষয় নির্বাচন করুন।');
      return;
    }
    
    setError(null);
    setIsLoading(true);

    try {
      const config = subjectConfigs[selectedSubject];
      let loadedData = [];
      const files = config.mcqs;
      
      for (const path in files) {
        const match = path.match(/chapter_(\d+)_MCQs\.json/);
        if (match) {
          const chapNum = match[1].replace(/^0+/, '');
          if (selectedChapter === 'all' || selectedChapter === `chapter-${chapNum}`) {
            const module = await files[path]();
            // Append chapterName to each MCQ so we know where it came from
            const chName = config.chapters.find(c => c.id === `chapter-${chapNum}`)?.title || 'Unknown Chapter';
            const mcqsWithChapter = (module.default || []).map(m => ({ ...m, chapterName: chName }));
            loadedData = [...loadedData, ...mcqsWithChapter];
          }
        }
      }

      if (loadedData.length === 0) {
        setError('নির্বাচিত অধ্যায়ের জন্য কোনো প্রশ্ন পাওয়া যায়নি!');
        setIsLoading(false);
        return;
      }

      // Shuffle array
      const shuffled = loadedData.sort(() => 0.5 - Math.random());
      
      // Select subset based on requested count, but don't exceed available
      const finalQuestions = shuffled.slice(0, Math.min(questionCount, shuffled.length));

      // Route to exam engine with state
      navigate('/academic/model-test/exam', {
        state: {
          questions: finalQuestions,
          durationSeconds: durationMinutes * 60,
          subjectTitle: config.title
        }
      });

    } catch (err) {
      console.error(err);
      setError('প্রশ্ন লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedConfig = selectedSubject ? subjectConfigs[selectedSubject] : null;

  return (
    <div className="min-h-screen bg-[#0a0f1c] pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-bangla selection:bg-fuchsia-500/30">
      <div className="max-w-xl mx-auto">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-xl">
          
          <div className="flex items-center gap-4 mb-6 border-b border-slate-700/50 pb-5">
            <div className="bg-fuchsia-500/20 p-2.5 rounded-2xl border border-fuchsia-500/30">
              <Target className="w-7 h-7 text-fuchsia-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white mb-1">মডেল টেস্ট কনফিগারেশন</h1>
              <p className="text-slate-400 text-xs sm:text-sm font-medium">আপনার পছন্দমতো কাস্টমাইজ করে পরীক্ষা দিন</p>
            </div>
          </div>

          <div className="space-y-5">
            
            {/* Subject Selection */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">বিষয় নির্বাচন করুন <span className="text-rose-500">*</span></label>
              <select 
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all font-medium appearance-none"
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSelectedChapter('all');
                  setError(null);
                }}
              >
                <option value="" className="bg-slate-800">-- বিষয় নির্বাচন করুন --</option>
                {Object.entries(subjectConfigs).map(([key, config]) => (
                  <option key={key} value={key} className="bg-slate-800">{config.title}</option>
                ))}
              </select>
            </div>

            {/* Chapter Selection */}
            {selectedConfig && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">অধ্যায় নির্বাচন করুন</label>
                <select 
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all font-medium appearance-none"
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                >
                  <option value="all" className="bg-slate-800">সব অধ্যায় একসাথে (Full Book)</option>
                  {selectedConfig.chapters.map(chap => (
                    <option key={chap.id} value={chap.id} className="bg-slate-800">{chap.chapterNo}: {chap.title}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              {/* Question Count */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">প্রশ্নের সংখ্যা</label>
                <select 
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all font-medium appearance-none"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                >
                  {QUESTION_COUNT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-slate-800">{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Time Limit */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">সময়সীমা</label>
                <select 
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all font-medium appearance-none"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                >
                  {DURATION_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-slate-800">{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              onClick={handleStartExam}
              disabled={isLoading || !selectedSubject}
              className={`w-full py-4 mt-6 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                isLoading || !selectedSubject 
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-fuchsia-600 to-pink-500 hover:from-fuchsia-500 hover:to-pink-400 text-white shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:shadow-[0_0_25px_rgba(217,70,239,0.5)] active:scale-[0.98]'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  লোড হচ্ছে...
                </>
              ) : (
                <>
                  <Settings className="w-6 h-6" />
                  মডেল টেস্ট শুরু করুন
                </>
              )}
            </button>
            
          </div>
        </div>
      </div>
    </div>
  );
}
