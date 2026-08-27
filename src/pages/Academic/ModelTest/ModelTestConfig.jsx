import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, Loader2, Settings, Target, Layers, Tag, Check, Sparkles, BookOpen } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { shuffle } from '../../../lib/questionUtils';
import { useAcademicSubjects } from '../../../hooks/useAcademicSubjects';
import { toBn } from '../../../lib/format';

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
  { label: '৩০ টি', value: 30 },
];

const normalizeChapterId = (id) => {
  if (!id) return '';
  const str = String(id).trim();
  if (str.startsWith('chapter_') || str.startsWith('chapter-')) {
    const num = parseInt(str.replace(/\D/g, ''), 10);
    return isNaN(num) ? str.toLowerCase() : `chapter-${num}`;
  }
  const num = parseInt(str.replace(/\D/g, ''), 10);
  return isNaN(num) ? str.toLowerCase() : `chapter-${num}`;
};

const matchChapter = (qChapterId, targetChapterId) => {
  if (!targetChapterId || targetChapterId === 'all') return true;
  if (!qChapterId) return false;
  return qChapterId === targetChapterId || normalizeChapterId(qChapterId) === normalizeChapterId(targetChapterId);
};

export default function ModelTestConfig() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const { data: subjects = [], isLoading: loadingSubjects } = useAcademicSubjects();
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subject') || '');
  const [selectedChapter, setSelectedChapter] = useState(searchParams.get('chapter') || 'all');
  const [selectedTopics, setSelectedTopics] = useState([]); // empty array means all topics
  const [allSubjectQuestions, setAllSubjectQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionCount, setQuestionCount] = useState(10);
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [isStartingExam, setIsStartingExam] = useState(false);
  const [error, setError] = useState(null);

  // Set default subject if URL param is given or when subjects load
  useEffect(() => {
    const paramSub = searchParams.get('subject');
    if (paramSub && subjects.some((s) => s.id === paramSub)) {
      setSelectedSubject(paramSub);
    }
  }, [searchParams, subjects]);

  const selectedConfig = useMemo(
    () => subjects.find((subject) => subject.id === selectedSubject) || null,
    [subjects, selectedSubject]
  );

  // Load subject MCQs whenever selectedSubject changes
  useEffect(() => {
    if (!selectedConfig) {
      setAllSubjectQuestions([]);
      return;
    }

    let cancelled = false;
    setLoadingQuestions(true);
    setError(null);

    async function loadMCQs() {
      try {
        const q = query(
          collection(db, 'academic_content'),
          where('subject', '==', selectedConfig.id),
          where('type', '==', 'mcq')
        );
        const snapshot = await getDocs(q);

        const loaded = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const qChapterId = data.chapterId || '';
          const matchedChapter = (selectedConfig.chapters || []).find((c) => matchChapter(qChapterId, c.id));
          return {
            firebaseId: docSnap.id,
            ...data,
            chapterId: qChapterId,
            chapterName: matchedChapter?.title || matchedChapter?.name || data.chapterName || qChapterId,
            topic: (data.topic || '').trim(),
          };
        });

        if (!cancelled) {
          setAllSubjectQuestions(loaded);
        }
      } catch (err) {
        console.error('MCQ loading error:', err);
        if (!cancelled) {
          setError('প্রশ্ন লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
        }
      } finally {
        if (!cancelled) {
          setLoadingQuestions(false);
        }
      }
    }

    loadMCQs();
    return () => {
      cancelled = true;
    };
  }, [selectedConfig]);

  // Questions filtered by chapter
  const chapterFilteredQuestions = useMemo(() => {
    if (!selectedSubject || allSubjectQuestions.length === 0) return [];
    return allSubjectQuestions.filter((q) => matchChapter(q.chapterId, selectedChapter));
  }, [allSubjectQuestions, selectedSubject, selectedChapter]);

  // Available topics in the selected chapter(s) with question counts
  const availableTopics = useMemo(() => {
    const topicMap = new Map();
    chapterFilteredQuestions.forEach((q) => {
      if (q.topic) {
        topicMap.set(q.topic, (topicMap.get(q.topic) || 0) + 1);
      }
    });

    return Array.from(topicMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [chapterFilteredQuestions]);

  // Reset or prune selectedTopics when chapter or subject changes
  useEffect(() => {
    setSelectedTopics([]);
  }, [selectedSubject, selectedChapter]);

  // Final pool of questions after Chapter + Topic filters
  const eligibleQuestions = useMemo(() => {
    if (selectedTopics.length === 0) {
      return chapterFilteredQuestions;
    }
    return chapterFilteredQuestions.filter((q) => q.topic && selectedTopics.includes(q.topic));
  }, [chapterFilteredQuestions, selectedTopics]);

  const toggleTopic = (topicName) => {
    setSelectedTopics((prev) =>
      prev.includes(topicName) ? prev.filter((t) => t !== topicName) : [...prev, topicName]
    );
  };

  const handleSelectAllTopics = () => {
    setSelectedTopics([]);
  };

  const handleStartExam = () => {
    if (!selectedConfig) {
      setError('দয়া করে একটি বিষয় নির্বাচন করুন।');
      return;
    }

    if (eligibleQuestions.length === 0) {
      setError('নির্বাচিত অধ্যায় বা টপিকের জন্য কোনো প্রশ্ন পাওয়া যায়নি!');
      return;
    }

    setError(null);
    setIsStartingExam(true);

    const shuffled = shuffle(eligibleQuestions);
    const finalQuestions = shuffled.slice(0, Math.min(questionCount, shuffled.length));

    navigate('/academic/model-test/exam', {
      state: {
        questions: finalQuestions,
        durationSeconds: durationMinutes * 60,
        subjectTitle: selectedConfig.label || selectedConfig.name,
        subjectId: selectedConfig.id,
        // বিষয়ের স্তর (SSC/HSC/Admission) — ভুলের খাতায় স্কোপ ফিল্টারের জন্য
        program: String(selectedConfig.level || '').toLowerCase(),
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] pt-24 pb-16 px-4 sm:px-6 lg:px-8 font-bangla selection:bg-fuchsia-500/30">
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6 border-b border-slate-700/50 pb-5">
            <div className="bg-fuchsia-500/20 p-2.5 rounded-2xl border border-fuchsia-500/30">
              <Target className="w-7 h-7 text-fuchsia-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white mb-1">মডেল টেস্ট কনফিগারেশন</h1>
              <p className="text-slate-400 text-xs sm:text-sm font-medium">
                বিষয়, অধ্যায় ও টপিক পছন্দমতো বেছে নিয়ে পরীক্ষা দিন
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Subject Selector */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-fuchsia-400" />
                বিষয় নির্বাচন করুন <span className="text-rose-500">*</span>
              </label>
              <select
                className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all font-medium appearance-none"
                value={selectedSubject}
                disabled={loadingSubjects}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSelectedChapter('all');
                  setSelectedTopics([]);
                  setError(null);
                }}
              >
                <option value="" className="bg-slate-800">
                  {loadingSubjects ? 'বিষয় লোড হচ্ছে...' : '-- বিষয় নির্বাচন করুন --'}
                </option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id} className="bg-slate-800">
                    {subject.label || subject.name} ({subject.level || 'HSC'})
                  </option>
                ))}
              </select>
            </div>

            {/* Chapter Selector */}
            {selectedConfig && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  অধ্যায় নির্বাচন করুন
                </label>
                <select
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all font-medium appearance-none"
                  value={selectedChapter}
                  onChange={(e) => {
                    setSelectedChapter(e.target.value);
                    setSelectedTopics([]);
                  }}
                >
                  <option value="all" className="bg-slate-800">
                    সব অধ্যায় একসাথে (Full Book)
                  </option>
                  {(selectedConfig.chapters || []).map((chapter) => (
                    <option key={chapter.id} value={chapter.id} className="bg-slate-800">
                      {chapter.chapterNo || chapter.id}: {chapter.title || chapter.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Topic Filter Section */}
            {selectedConfig && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-amber-400" />
                    টপিক নির্বাচন করুন (Topic Wise Filter)
                  </label>
                  {availableTopics.length > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={handleSelectAllTopics}
                        className={`font-semibold px-2 py-1 rounded-md transition ${
                          selectedTopics.length === 0
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        সব টপিক ({toBn(availableTopics.length)})
                      </button>
                      {selectedTopics.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedTopics([])}
                          className="text-slate-500 hover:text-slate-300 transition"
                        >
                          রিসেট
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {loadingQuestions ? (
                  <div className="flex items-center gap-2 py-4 px-3 text-slate-400 text-xs rounded-xl bg-slate-900/40 border border-slate-800">
                    <Loader2 className="w-4 h-4 animate-spin text-fuchsia-400" />
                    টপিক ও প্রশ্ন প্রস্তুত হচ্ছে...
                  </div>
                ) : availableTopics.length === 0 ? (
                  <div className="py-3 px-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400">
                    {chapterFilteredQuestions.length > 0
                      ? 'এই অধ্যায়ের সকল প্রশ্ন একসাথে অন্তর্ভুক্ত থাকবে।'
                      : 'এই অধ্যায়ে কোনো প্রশ্ন পাওয়া যায়নি।'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar p-2 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                      {availableTopics.map((topic) => {
                        const isSelected = selectedTopics.includes(topic.name);
                        const isAllActive = selectedTopics.length === 0;
                        return (
                          <button
                            key={topic.name}
                            type="button"
                            onClick={() => toggleTopic(topic.name)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 border text-left ${
                              isSelected
                                ? 'bg-amber-500/20 text-amber-200 border-amber-500/40 shadow-sm shadow-amber-500/10'
                                : isAllActive
                                ? 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:border-amber-500/30'
                                : 'bg-slate-900/80 text-slate-500 border-slate-800/80 hover:text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <span
                              className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[10px] ${
                                isSelected
                                  ? 'bg-amber-500 border-amber-400 text-black'
                                  : isAllActive
                                  ? 'border-slate-600 bg-slate-800 text-slate-400'
                                  : 'border-slate-700 bg-slate-950 text-transparent'
                              }`}
                            >
                              {(isSelected || isAllActive) && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </span>
                            <span className="truncate max-w-[200px]">{topic.name}</span>
                            <span className="text-[10px] opacity-70 px-1 py-0.5 rounded bg-black/30 font-mono">
                              {toBn(topic.count)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {selectedTopics.length > 0 && (
                      <p className="text-[11px] text-amber-300/80 font-medium pl-1">
                        ✓ {toBn(selectedTopics.length)} টি টপিক নির্দিষ্ট করা হয়েছে
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Question count & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">প্রশ্নের সংখ্যা</label>
                <select
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all font-medium appearance-none"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                >
                  {QUESTION_COUNT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-slate-800">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">সময় সীমা</label>
                <select
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all font-medium appearance-none"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                >
                  {DURATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-slate-800">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Questions count info pill */}
            {selectedConfig && !loadingQuestions && (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>উপলব্ধ প্রশ্নভাণ্ডার:</span>
                </div>
                <span className="font-bold text-sm text-white">
                  {toBn(eligibleQuestions.length)} টি প্রশ্ন প্রস্তুত
                </span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleStartExam}
              disabled={isStartingExam || loadingSubjects || loadingQuestions || !selectedSubject || eligibleQuestions.length === 0}
              className={`w-full py-4 mt-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                isStartingExam || loadingSubjects || loadingQuestions || !selectedSubject || eligibleQuestions.length === 0
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-fuchsia-600 to-pink-500 hover:from-fuchsia-500 hover:to-pink-400 text-white shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:shadow-[0_0_25px_rgba(217,70,239,0.5)] active:scale-[0.98]'
              }`}
            >
              {isStartingExam ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  মডেল টেস্ট শুরু হচ্ছে...
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
