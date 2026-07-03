import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2, Settings, Target } from 'lucide-react';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../config/firebase';

const DURATION_OPTIONS = [
  { label: '10 মিনিট', value: 10 },
  { label: '15 মিনিট', value: 15 },
  { label: '20 মিনিট', value: 20 },
  { label: '25 মিনিট', value: 25 },
  { label: '30 মিনিট', value: 30 },
];

const QUESTION_COUNT_OPTIONS = [
  { label: '10 টি', value: 10 },
  { label: '15 টি', value: 15 },
  { label: '20 টি', value: 20 },
  { label: '25 টি', value: 25 },
];

export default function ModelTestConfig() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('all');
  const [questionCount, setQuestionCount] = useState(10);
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSubjects() {
      try {
        const snap = await getDoc(doc(db, 'admin_settings', 'subjects'));
        const list = snap.exists() ? snap.data().list || [] : [];
        if (!cancelled) setSubjects(list);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError('বিষয় লোড করতে সমস্যা হয়েছে।');
      } finally {
        if (!cancelled) setLoadingSubjects(false);
      }
    }

    loadSubjects();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedConfig = subjects.find((subject) => subject.id === selectedSubject) || null;

  const handleStartExam = async () => {
    if (!selectedConfig) {
      setError('দয়া করে একটি বিষয় নির্বাচন করুন।');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const q = query(
        collection(db, 'academic_content'),
        where('subject', '==', selectedConfig.id),
        where('type', '==', 'mcq')
      );
      const snapshot = await getDocs(q);

      let questions = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        let chapterId = data.chapterId;
        if (chapterId && chapterId.startsWith('chapter_')) {
          const num = parseInt(chapterId.split('_')[1], 10);
          chapterId = `chapter-${num}`;
        }
        const chapter = (selectedConfig.chapters || []).find((item) => item.id === chapterId);
        return {
          firebaseId: docSnap.id,
          ...data,
          chapterId,
          chapterName: chapter?.title || chapter?.name || data.chapterName || `অধ্যায় ${chapterId}`,
        };
      });

      if (selectedChapter !== 'all') {
        questions = questions.filter((question) => question.chapterId === selectedChapter);
      }

      if (questions.length === 0) {
        setError('নির্বাচিত অধ্যায়ের জন্য কোনো প্রশ্ন পাওয়া যায়নি!');
        return;
      }

      const shuffled = [...questions].sort(() => 0.5 - Math.random());
      const finalQuestions = shuffled.slice(0, Math.min(questionCount, shuffled.length));

      navigate('/academic/model-test/exam', {
        state: {
          questions: finalQuestions,
          durationSeconds: durationMinutes * 60,
          subjectTitle: selectedConfig.label,
        },
      });
    } catch (err) {
      console.error(err);
      setError('প্রশ্ন লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

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
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">বিষয় নির্বাচন করুন <span className="text-rose-500">*</span></label>
              <select
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all font-medium appearance-none"
                value={selectedSubject}
                disabled={loadingSubjects}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSelectedChapter('all');
                  setError(null);
                }}
              >
                <option value="" className="bg-slate-800">
                  {loadingSubjects ? 'বিষয় লোড হচ্ছে...' : '-- বিষয় নির্বাচন করুন --'}
                </option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id} className="bg-slate-800">{subject.label}</option>
                ))}
              </select>
            </div>

            {selectedConfig && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">অধ্যায় নির্বাচন করুন</label>
                <select
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all font-medium appearance-none"
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                >
                  <option value="all" className="bg-slate-800">সব অধ্যায় একসাথে (Full Book)</option>
                  {(selectedConfig.chapters || []).map((chapter) => (
                    <option key={chapter.id} value={chapter.id} className="bg-slate-800">
                      {chapter.chapterNo || chapter.id}: {chapter.title || chapter.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">প্রশ্নের সংখ্যা</label>
                <select
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all font-medium appearance-none"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                >
                  {QUESTION_COUNT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-slate-800">{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">সময় সীমা</label>
                <select
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all font-medium appearance-none"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                >
                  {DURATION_OPTIONS.map((opt) => (
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
              disabled={isLoading || loadingSubjects || !selectedSubject}
              className={`w-full py-4 mt-6 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                isLoading || loadingSubjects || !selectedSubject
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
