import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';
import {
  CheckCircle2, Circle, Trash2, RotateCcw, Sparkles,
  ArrowRight, Flame, Trophy, Clock, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { db } from '../../../config/firebase';
import { recordReviewResult, dismissMistake } from '../../../lib/mistakes';
import { toBn } from '../../../lib/format';
import { useConfirm } from '../../../hooks/useConfirm';
import { Skeleton, SkeletonList } from '../../../components/UI/Skeleton';
import toast from 'react-hot-toast';

const MarkdownRenderer = ({ content }) => (
  <span className="prose prose-invert max-w-none prose-p:inline prose-p:leading-relaxed prose-p:my-0">
    <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>
      {content || ''}
    </ReactMarkdown>
  </span>
);

function optionsOf(item) {
  if (Array.isArray(item.options)) return item.options;
  if (item.options && typeof item.options === 'object') return Object.values(item.options);
  return [];
}

/**
 * পরের পুনরালোচনা কখন — মিলিসেকেন্ডে। ফায়ারস্টোর থেকে এলে Timestamp,
 * লোকাল স্টোরেজ থেকে এলে সাধারণ সংখ্যা (nextReviewAtMs)। কোনোটাই না থাকলে
 * ০ ফেরত — অর্থাৎ এখনই বাকি।
 */
function dueAtMs(item) {
  if (!item) return 0;
  if (typeof item.nextReviewAtMs === 'number') return item.nextReviewAtMs;
  const ts = item.nextReviewAt;
  if (typeof ts?.toMillis === 'function') return ts.toMillis();
  if (typeof ts?.seconds === 'number') return ts.seconds * 1000;
  if (typeof ts === 'number') return ts;
  return 0;
}

function formatDue(item) {
  const ms = dueAtMs(item);
  if (!ms) return '';
  return new Date(ms).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' });
}

const OPT_LABELS = ['ক', 'খ', 'গ', 'ঘ'];

/** পুনরালোচনার সময় একটা প্রশ্ন — অপশন বেছে নিলেই সঠিক/ভুল দেখায়। */
function ReviewCard({ item, index, total, selected, revealed, onSelect, onNext, onFinish }) {
  const options = optionsOf(item);
  const isLast = index === total - 1;

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 sm:p-7 shadow-xl backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg">
          প্রশ্ন {toBn(index + 1)} / {toBn(total)}
        </span>
        {item.subjectTitle && (
          <span className="rounded-lg bg-slate-800 border border-slate-700/60 px-2.5 py-1 text-xs font-bold text-slate-300">
            {item.subjectTitle}{item.chapterName ? ` · ${item.chapterName}` : ''}
          </span>
        )}
      </div>

      <div className="mb-5 text-base font-medium leading-relaxed text-slate-100 sm:text-lg">
        <MarkdownRenderer content={item.question} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {options.map((option, optIdx) => {
          const isCorrect = optIdx === item.answer;
          const isPicked = optIdx === selected;

          let btnStyle = 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/80 text-slate-300';
          let badgeStyle = 'bg-slate-800 text-slate-400 border-slate-700';

          if (revealed) {
            if (isCorrect) {
              btnStyle = 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300 font-bold';
              badgeStyle = 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]';
            } else if (isPicked) {
              btnStyle = 'border-rose-500/50 bg-rose-500/15 text-rose-300 font-bold';
              badgeStyle = 'bg-rose-500 text-white border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.4)]';
            } else {
              btnStyle = 'border-slate-800/60 bg-slate-900/30 opacity-50 text-slate-500';
            }
          }

          return (
            <button
              key={optIdx}
              type="button"
              disabled={revealed}
              onClick={() => onSelect(optIdx)}
              className={`flex items-center gap-3 rounded-2xl border p-3 sm:p-3.5 text-left text-sm transition-all ${btnStyle} disabled:cursor-default`}
            >
              <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center border shrink-0 transition-all ${badgeStyle}`}>
                {OPT_LABELS[optIdx] || optIdx + 1}
              </span>
              <span className="min-w-0 flex-1 leading-snug"><MarkdownRenderer content={option} /></span>
              {revealed && isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className={`text-sm font-bold ${selected === item.answer ? 'text-emerald-400' : 'text-rose-400'}`}>
            {selected === item.answer ? 'সঠিক উত্তর! এগিয়ে চলুন 🎉' : 'ভুল হয়েছে — পুনরালোচনায় আবার আসবে।'}
          </p>
          <button
            type="button"
            onClick={isLast ? onFinish : onNext}
            className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-rose-500 active:scale-95 shadow-md shadow-rose-900/30 shrink-0"
          >
            {isLast ? 'রিভিউ সমাপ্ত করুন' : 'পরের প্রশ্ন'} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function InteractiveMistakeItem({ item, idx, dueNow, handleDismiss }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleOptionClick = (optIdx) => {
    if (showAnswer) return;
    setSelectedOption(optIdx);
    setShowAnswer(true);

    const isCorrect = optIdx === item.answer;
    if (isCorrect) {
      toast.success('সঠিক উত্তর! খাতা থেকে স্বয়ংক্রিয়ভাবে সরানো হচ্ছে...', { icon: '👏' });
      setTimeout(() => {
        handleDismiss(item, false); // false = bypass confirm dialog
      }, 4000);
    }
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800/90 rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:border-slate-700/80 relative">
      <button
        type="button"
        onClick={() => handleDismiss(item, true)}
        title="খাতা থেকে সরান"
        className="absolute top-4 right-4 shrink-0 rounded-xl p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition z-10"
      >
        <Trash2 className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
      </button>

      <div className="flex items-start gap-3 mb-3.5">
        <div className="font-black text-rose-400 text-base sm:text-lg shrink-0 mt-0.5">
          {toBn(idx + 1)}.
        </div>
        <div className="flex-1 min-w-0 pr-8">
          <div className="text-slate-100 text-sm sm:text-base font-medium leading-relaxed mb-2.5">
            <MarkdownRenderer content={item.question} />
            {(item.imageUrl || item.image || item.image_url) && (
              <div className="mt-3 mb-3 rounded-xl overflow-hidden border border-slate-700/50 bg-slate-900/50 inline-block">
                <img src={item.imageUrl || item.image || item.image_url} alt="Question Diagram" className="max-w-full h-auto max-h-64 object-contain" loading="lazy" />
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {item.subjectTitle && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700/60">
                {item.subjectTitle}
              </span>
            )}
            {item.chapterName && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-slate-800/80 text-slate-400 border border-slate-700/40">
                {item.chapterName}
              </span>
            )}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium border ${dueNow.includes(item) ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
              <Clock className="h-3 w-3" />
              {dueNow.includes(item) ? 'এখনই বাকি' : `আবার ${formatDue(item)}`}
            </span>
            {item.timesWrong > 1 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                {toBn(item.timesWrong)} বার ভুল
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 sm:ml-7">
        {optionsOf(item).map((opt, optIdx) => {
          let btnClass = "border-slate-800/90 bg-slate-900/60 hover:bg-slate-800 hover:border-slate-700 text-slate-300 cursor-pointer";
          let badgeClass = "bg-slate-800 text-slate-400 border-slate-700";

          if (showAnswer) {
            if (optIdx === item.answer) {
              btnClass = "border-emerald-500/50 bg-emerald-500/15 text-emerald-300 font-bold";
              badgeClass = "bg-emerald-500 text-white border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]";
            } else if (optIdx === selectedOption) {
              btnClass = "border-rose-500/50 bg-rose-500/15 text-rose-300 font-bold";
              badgeClass = "bg-rose-500 text-white border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.4)]";
            } else {
              btnClass = "opacity-40 border-slate-800/60 bg-slate-900/30 text-slate-500";
            }
          }

          return (
            <div
              key={optIdx}
              onClick={() => handleOptionClick(optIdx)}
              className={`flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl border text-left text-sm transition-all ${btnClass}`}
            >
              <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center border shrink-0 transition-all ${badgeClass}`}>
                {OPT_LABELS[optIdx] || optIdx + 1}
              </span>
              <span className="text-xs sm:text-sm flex-grow"><MarkdownRenderer content={opt} /></span>
              {showAnswer && optIdx === item.answer && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
            </div>
          );
        })}
      </div>
      
      {showAnswer && item.explanation && (
        <div className="sm:ml-7 mt-3.5 space-y-2">
          <div className="bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
            <h4 className="text-rose-400 font-bold text-xs mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> ব্যাখ্যা:
            </h4>
            <div className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              <MarkdownRenderer content={item.explanation} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const PROGRAM_SUBJECTS = {
  medical: ['জীববিজ্ঞান', 'রসায়ন', 'পদার্থবিজ্ঞান', 'ইংরেজি', 'সাধারণ জ্ঞান', 'Biology', 'Chemistry', 'Physics', 'English', 'GK', 'Medical', 'MBBS', 'BDS'],
  nursing: ['জীববিজ্ঞান', 'সাধারণ বিজ্ঞান', 'বাংলা', 'ইংরেজি', 'সাধারণ গণিত', 'সাধারণ জ্ঞান', 'Biology', 'Science', 'Bangla', 'English', 'Math', 'GK', 'Nursing'],
  engineering: ['উচ্চতর গণিত', 'পদার্থবিজ্ঞান', 'রসায়ন', 'ইংরেজি', 'Higher Math', 'Math', 'Physics', 'Chemistry', 'English', 'BUET', 'CKET', 'Engineering'],
  'varsity-a': ['পদার্থবিজ্ঞান', 'রসায়ন', 'উচ্চতর গণিত', 'জীববিজ্ঞান', 'Physics', 'Chemistry', 'Higher Math', 'Biology', 'DU A', 'Varsity A'],
  gst: ['পদার্থবিজ্ঞান', 'রসায়ন', 'গণিত', 'জীববিজ্ঞান', 'বাংলা', 'ইংরেজি', 'GST'],
  hsc: ['তথ্য ও যোগাযোগ প্রযুক্তি', 'আইসিটি', 'পদার্থবিজ্ঞান', 'রসায়ন', 'উচ্চতর গণিত', 'জীববিজ্ঞান', 'বাংলা', 'ইংরেজি'],
  ssc: ['পদার্থবিজ্ঞান', 'রসায়ন', 'উচ্চতর গণিত', 'জীববিজ্ঞান', 'সাধারণ গণিত', 'সাধারণ বিজ্ঞান', 'বাংলা', 'ইংরেজি']
};

export default function MistakeNotebook({ program = null }) {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [confirm, confirmDialog] = useConfirm();

  const [reviewQueue, setReviewQueue] = useState(null);
  const [cursor, setCursor] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [sessionScore, setSessionScore] = useState({ correct: 0, total: 0 });
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [programScope, setProgramScope] = useState(Boolean(program));

  const queryKey = ['mistakes', currentUser?.uid || 'guest'];

  const { data: rawMistakes = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      let firestoreMistakes = [];
      if (currentUser?.uid) {
        try {
          const snap = await getDocs(collection(db, 'users', currentUser.uid, 'mistakes'));
          firestoreMistakes = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        } catch (e) {
          console.warn('Could not fetch firestore mistakes, using local storage backup:', e);
        }
      }

      // Also read local storage mistakes
      let localMistakes = [];
      try {
        const userKey = currentUser?.uid ? `academic_mistakes_${currentUser.uid}` : 'academic_guest_mistakes';
        const raw = localStorage.getItem(userKey);
        if (raw) localMistakes = JSON.parse(raw);

        // Merge guest mistakes if user just logged in
        if (currentUser?.uid) {
          const guestRaw = localStorage.getItem('academic_guest_mistakes');
          if (guestRaw) {
            const guestList = JSON.parse(guestRaw);
            localMistakes = [...localMistakes, ...guestList];
          }
        }
      } catch (e) {
        console.warn('Local mistake parse error:', e);
      }

      // Combine and deduplicate by questionId
      const map = new Map();
      firestoreMistakes.forEach(m => map.set(String(m.questionId || m.id), m));
      localMistakes.forEach(m => {
        const id = String(m.questionId || m.id);
        if (!map.has(id)) {
          map.set(id, m);
        }
      });

      return Array.from(map.values());
    },
    staleTime: 1000 * 5, // 5 seconds for instant refresh
  });

  // Filter mistakes by program if active
  const mistakes = useMemo(() => {
    if (!program || !programScope) return rawMistakes;
    const allowedSubjects = PROGRAM_SUBJECTS[program] || [];
    return rawMistakes.filter(m => {
      if (m.program && m.program.toLowerCase() === program.toLowerCase()) return true;
      const subj = m.subjectTitle || m.subject || m.subjectId || '';
      return allowedSubjects.some(as => subj.toLowerCase().includes(as.toLowerCase()));
    });
  }, [rawMistakes, program, programScope]);

  // Date.now() রেন্ডারের সময় সরাসরি ডাকা "impure" ধরা হয়, তাই একবার state
  // এ ধরে রাখা হলো — পেজ খোলা থাকা অবস্থায় নতুন কিছু due হলে রিফ্রেশেই দেখা যাবে।
  const [now] = useState(() => Date.now());

  const subjectsList = useMemo(() => {
    const counts = {};
    mistakes.forEach(m => {
      const title = m.subjectTitle || 'অন্যান্য';
      if (!counts[title]) counts[title] = 0;
      counts[title]++;
    });
    const list = Object.entries(counts).map(([title, count]) => ({ title, count }));
    list.sort((a, b) => b.count - a.count);
    return list;
  }, [mistakes]);

  const { dueNow, upcoming, masteredCount } = useMemo(() => {
    let filtered = mistakes;
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(m => (m.subjectTitle || 'অন্যান্য') === selectedSubject);
    }

    const active = filtered.filter((m) => !m.mastered);
    const due = [];
    const later = [];
    active.forEach((m) => {
      if (dueAtMs(m) <= now) due.push(m);
      else later.push(m);
    });
    later.sort((a, b) => dueAtMs(a) - dueAtMs(b));
    return { dueNow: due, upcoming: later, masteredCount: filtered.length - active.length };
  }, [mistakes, now, selectedSubject]);

  const startReview = () => {
    setReviewQueue(dueNow);
    setCursor(0);
    setSelected(null);
    setRevealed(false);
    setSessionScore({ correct: 0, total: 0 });
  };

  const handleSelect = (optIdx) => {
    if (revealed) return;
    const item = reviewQueue[cursor];
    const wasCorrect = optIdx === item.answer;
    setSelected(optIdx);
    setRevealed(true);
    setSessionScore((prev) => ({ correct: prev.correct + (wasCorrect ? 1 : 0), total: prev.total + 1 }));
    recordReviewResult(currentUser.uid, item, wasCorrect).catch((err) => {
      console.error(err);
      toast.error('অগ্রগতি সেভ করা যায়নি।');
    });
  };

  const goNext = () => {
    setCursor((c) => c + 1);
    setSelected(null);
    setRevealed(false);
  };

  const finishReview = () => {
    queryClient.invalidateQueries({ queryKey });
    setReviewQueue(null);
  };

  const handleDismiss = async (item, requireConfirm = true) => {
    if (requireConfirm) {
      if (!(await confirm({
        title: 'প্রশ্নটি সরিয়ে ফেলবেন?',
        message: 'এটি ভুলের খাতা থেকে পুরোপুরি মুছে যাবে।',
      }))) return;
    }

    try {
      await dismissMistake(currentUser.uid, item.questionId);
      queryClient.invalidateQueries({ queryKey });
      if (requireConfirm) {
        toast.success('খাতা থেকে সরানো হয়েছে।');
      }
    } catch (err) {
      console.error(err);
      if (requireConfirm) {
        toast.error('সরানো যায়নি।');
      }
    }
  };

  return (
    <div>
      {confirmDialog}

      {isLoading ? (
        <>
          <div className="mb-6 grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
          <SkeletonList count={3} />
        </>
      ) : reviewQueue ? (
        cursor < reviewQueue.length ? (
          <ReviewCard
            item={reviewQueue[cursor]}
            index={cursor}
            total={reviewQueue.length}
            selected={selected}
            revealed={revealed}
            onSelect={handleSelect}
            onNext={goNext}
            onFinish={finishReview}
          />
        ) : (
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-8 text-center">
            <Sparkles className="mx-auto mb-3 h-9 w-9 text-emerald-400" />
            <h2 className="text-lg font-black text-white">আজকের রিভিউ শেষ!</h2>
            <p className="mt-1 text-sm text-slate-400">
              {toBn(sessionScore.correct)} / {toBn(sessionScore.total)} টি সঠিক হয়েছে।
            </p>
            <button
              type="button"
              onClick={finishReview}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-500"
            >
              তালিকায় ফিরে যাও
            </button>
          </div>
        )
      ) : (
        <>
          {/* Subject Filter & Stats */}
          {rawMistakes.length > 0 && (
            <div className="space-y-4 mb-5">
              {/* Program Scope Selector if program specified */}
              {program && (
                <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 w-max text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => { setProgramScope(true); setSelectedSubject('all'); }}
                    className={`px-3 py-1.5 rounded-xl transition ${
                      programScope ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    এই প্রোগ্রামের ভুল ({toBn(mistakes.length)})
                  </button>
                  <button
                    type="button"
                    onClick={() => { setProgramScope(false); setSelectedSubject('all'); }}
                    className={`px-3 py-1.5 rounded-xl transition ${
                      !programScope ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    সকল ভুল ({toBn(rawMistakes.length)})
                  </button>
                </div>
              )}

              {/* Subject Filter Pills */}
              <div className="overflow-x-auto pb-1 custom-scrollbar">
                <div className="flex items-center gap-2 w-max">
                  <button
                    onClick={() => setSelectedSubject('all')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      selectedSubject === 'all'
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    সব বিষয় ({toBn(mistakes.length)})
                  </button>
                  {subjectsList.map(subj => (
                    <button
                      key={subj.title}
                      onClick={() => setSelectedSubject(subj.title)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        selectedSubject === subj.title
                          ? 'bg-rose-500 text-white shadow-sm'
                          : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {subj.title} ({toBn(subj.count)})
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-3 sm:p-4 text-center">
                  <p className="text-xl sm:text-2xl font-black text-rose-400">{toBn(dueNow.length)}</p>
                  <p className="mt-0.5 text-[10px] sm:text-xs font-bold text-slate-400">আজ রিভিউ বাকি</p>
                </div>
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3 sm:p-4 text-center">
                  <p className="text-xl sm:text-2xl font-black text-amber-400">{toBn(upcoming.length)}</p>
                  <p className="mt-0.5 text-[10px] sm:text-xs font-bold text-slate-400">আসছে</p>
                </div>
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3 sm:p-4 text-center">
                  <p className="text-xl sm:text-2xl font-black text-emerald-400">{toBn(masteredCount)}</p>
                  <p className="mt-0.5 text-[10px] sm:text-xs font-bold text-slate-400">আয়ত্ত করেছ</p>
                </div>
              </div>
            </div>
          )}

          {mistakes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Trophy className="h-8 w-8" />
              </div>
              <h3 className="mb-1.5 text-lg font-bold text-slate-100">কোনো ভুল প্রশ্ন রেকর্ড নেই</h3>
              <p className="mx-auto mb-5 max-w-sm text-xs sm:text-sm text-slate-400 leading-relaxed">
                মডেল টেস্ট বা লাইভ এক্সাম দেওয়ার সময় যেসব প্রশ্নে ভুল হবে, সেগুলো এখানে স্বয়ংক্রিয়ভাবে তালিকাভুক্ত হবে।
              </p>
              <Link
                to="/academic/admission/model-test"
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 px-5 py-2.5 text-xs sm:text-sm font-bold text-white transition shadow-lg shadow-rose-900/20"
              >
                মডেল টেস্ট শুরু করুন <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          ) : dueNow.length > 0 ? (
            <button
              type="button"
              onClick={startReview}
              className="mb-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-orange-500 px-6 py-3.5 text-sm sm:text-base font-black text-white shadow-lg shadow-rose-950/30 transition hover:from-rose-500 hover:to-orange-400 active:scale-[0.99]"
            >
              <RotateCcw className="h-4.5 w-4.5" /> {toBn(dueNow.length)} টি প্রশ্ন রিভিউ শুরু করো
            </button>
          ) : (
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-3.5">
              <Flame className="h-5 w-5 shrink-0 text-emerald-400" />
              <p className="text-xs sm:text-sm font-semibold text-emerald-200">
                আজকে রিভিউ করার মতো কিছু নেই — আপনার সব ভুল প্রশ্ন রিভিশন দেওয়া হয়েছে! 🎉
              </p>
            </div>
          )}

          {/* সব ভুলের তালিকা */}
          {mistakes.length > 0 && (
            <div className="space-y-2.5">
              {[...dueNow, ...upcoming].map((item, idx) => (
                <InteractiveMistakeItem
                  key={item.id}
                  item={item}
                  idx={idx}
                  dueNow={dueNow}
                  handleDismiss={handleDismiss}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
