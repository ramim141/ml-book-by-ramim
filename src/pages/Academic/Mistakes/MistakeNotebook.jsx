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

function formatDue(ts) {
  if (!ts) return '';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' });
}

/** পুনরালোচনার সময় একটা প্রশ্ন — অপশন বেছে নিলেই সঠিক/ভুল দেখায়। */
function ReviewCard({ item, index, total, selected, revealed, onSelect, onNext, onFinish }) {
  const options = optionsOf(item);
  const isLast = index === total - 1;

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/50 p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500">
          প্রশ্ন {toBn(index + 1)} / {toBn(total)}
        </span>
        {item.subjectTitle && (
          <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[11px] font-bold text-indigo-300">
            {item.subjectTitle}{item.chapterName ? ` · ${item.chapterName}` : ''}
          </span>
        )}
      </div>

      <div className="mb-5 text-base font-medium leading-relaxed text-slate-100 sm:text-lg">
        <MarkdownRenderer content={item.question} />
      </div>

      <div className="space-y-2.5">
        {options.map((option, optIdx) => {
          const isCorrect = optIdx === item.answer;
          const isPicked = optIdx === selected;

          let tone = 'border-slate-700/60 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800';
          if (revealed) {
            if (isCorrect) tone = 'border-emerald-500/60 bg-emerald-500/10';
            else if (isPicked) tone = 'border-rose-500/60 bg-rose-500/10';
            else tone = 'border-slate-800 bg-slate-900/40 opacity-60';
          }

          return (
            <button
              key={optIdx}
              type="button"
              disabled={revealed}
              onClick={() => onSelect(optIdx)}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium text-slate-200 transition ${tone} disabled:cursor-default`}
            >
              {revealed && isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />}
              {revealed && isPicked && !isCorrect && <span className="h-4 w-4 shrink-0 rounded-full border-2 border-rose-400" />}
              {!revealed && <Circle className="h-4 w-4 shrink-0 text-slate-600" />}
              <span className="min-w-0 flex-1"><MarkdownRenderer content={option} /></span>
            </button>
          );
        })}
      </div>

      {revealed && (
        <div className="mt-5 flex items-center justify-between gap-3">
          <p className={`text-sm font-bold ${selected === item.answer ? 'text-emerald-400' : 'text-rose-400'}`}>
            {selected === item.answer ? 'সঠিক! এগিয়ে যাচ্ছ 🎉' : 'এবার ভুল হয়েছে — আবার দেখা হবে।'}
          </p>
          <button
            type="button"
            onClick={isLast ? onFinish : onNext}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-500 active:scale-95"
          >
            {isLast ? 'রিভিউ শেষ করো' : 'পরের প্রশ্ন'} <ArrowRight className="h-4 w-4" />
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
      toast.success('সঠিক উত্তর! একটু পর তালিকা থেকে সরানো হচ্ছে...', { icon: '👏' });
      setTimeout(() => {
        handleDismiss(item, false); // false = bypass confirm dialog
      }, 6000);
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 transition-all duration-300 relative">
      <button
        type="button"
        onClick={() => handleDismiss(item, true)}
        title="খাতা থেকে সরান"
        className="absolute top-4 right-4 shrink-0 rounded-lg p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition z-10"
      >
        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>

      <div className="flex items-start gap-3 sm:gap-4 mb-4">
        <div className="font-bold w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0 text-sm bg-indigo-500/10 text-indigo-400">
          {toBn(idx + 1)}
        </div>
        <div className="flex-1 mt-1 min-w-0 pr-10">
          <div className="text-slate-200 text-sm sm:text-base font-semibold leading-relaxed mb-2.5">
            <MarkdownRenderer content={item.question} />
            {(item.imageUrl || item.image || item.image_url) && (
              <div className="mt-4 mb-4 rounded-xl overflow-hidden border border-slate-700/50 bg-slate-900/50 inline-block">
                <img src={item.imageUrl || item.image || item.image_url} alt="Question Diagram" className="max-w-full h-auto max-h-64 object-contain" loading="lazy" />
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {item.subjectTitle && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {item.subjectTitle}
              </span>
            )}
            {item.chapterName && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {item.chapterName}
              </span>
            )}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium border ${dueNow.includes(item) ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
              <Clock className="h-3 w-3" />
              {dueNow.includes(item) ? 'এখনই বাকি' : `আবার ${formatDue(item.nextReviewAt)}`}
            </span>
            {item.timesWrong > 1 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                {toBn(item.timesWrong)} বার ভুল হয়েছে
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:ml-12">
        {optionsOf(item).map((opt, optIdx) => {
          let optionClass = "border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/80 hover:border-slate-600 text-slate-300 cursor-pointer";
          let Icon = Circle;

          if (showAnswer) {
            if (optIdx === item.answer) {
              optionClass = "border-emerald-500/50 bg-emerald-500/10 text-emerald-400";
              Icon = CheckCircle2;
            } else if (optIdx === selectedOption) {
              optionClass = "border-rose-500/50 bg-rose-500/10 text-rose-400";
            }
          } else if (selectedOption === optIdx) {
            optionClass = "border-indigo-500 bg-indigo-500/10 text-indigo-300";
            Icon = CheckCircle2;
          }

          return (
            <div
              key={optIdx}
              onClick={() => handleOptionClick(optIdx)}
              className={`flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl border transition-all ${optionClass} ${showAnswer && optIdx !== item.answer && optIdx !== selectedOption ? 'opacity-50' : ''}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-xs sm:text-sm"><MarkdownRenderer content={opt} /></span>
            </div>
          );
        })}
      </div>
      
      {showAnswer && item.explanation && (
        <div className="sm:ml-12 mt-4 space-y-3">
          <div className="bg-indigo-500/10 border border-indigo-500/20 p-3.5 rounded-xl animate-in fade-in slide-in-from-top-4 duration-300">
            <h4 className="text-indigo-400 font-bold text-xs mb-1.5 flex items-center gap-1.5">
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

export default function MistakeNotebook() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [confirm, confirmDialog] = useConfirm();

  const [reviewQueue, setReviewQueue] = useState(null);
  const [cursor, setCursor] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [sessionScore, setSessionScore] = useState({ correct: 0, total: 0 });
  const [selectedSubject, setSelectedSubject] = useState('all');

  const queryKey = ['mistakes', currentUser?.uid];

  const { data: mistakes = [], isLoading } = useQuery({
    queryKey,
    enabled: Boolean(currentUser?.uid),
    queryFn: async () => {
      const snap = await getDocs(collection(db, 'users', currentUser.uid, 'mistakes'));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
  });

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
      const at = m.nextReviewAt?.toMillis ? m.nextReviewAt.toMillis() : 0;
      if (at <= now) due.push(m);
      else later.push(m);
    });
    later.sort((a, b) => (a.nextReviewAt?.toMillis?.() || 0) - (b.nextReviewAt?.toMillis?.() || 0));
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
          {/* Subject Filter */}
          {mistakes.length > 0 && (
            <div className="mb-6 overflow-x-auto pb-2 custom-scrollbar">
              <div className="flex items-center gap-2 w-max">
                <button
                  onClick={() => setSelectedSubject('all')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                    selectedSubject === 'all'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                      : 'bg-slate-900/50 text-slate-400 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  সব বিষয় ({toBn(mistakes.length)})
                </button>
                {subjectsList.map(subj => (
                  <button
                    key={subj.title}
                    onClick={() => setSelectedSubject(subj.title)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                      selectedSubject === subj.title
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                        : 'bg-slate-900/50 text-slate-400 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {subj.title} ({toBn(subj.count)})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* সারাংশ */}
          <div className="mb-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4 text-center">
              <p className="text-2xl font-black text-rose-400">{toBn(dueNow.length)}</p>
              <p className="mt-1 text-[11px] font-bold text-slate-500">আজ রিভিউ বাকি</p>
            </div>
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4 text-center">
              <p className="text-2xl font-black text-amber-400">{toBn(upcoming.length)}</p>
              <p className="mt-1 text-[11px] font-bold text-slate-500">আসছে</p>
            </div>
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4 text-center">
              <p className="text-2xl font-black text-emerald-400">{toBn(masteredCount)}</p>
              <p className="mt-1 text-[11px] font-bold text-slate-500">আয়ত্ত করেছ</p>
            </div>
          </div>

          {mistakes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/30 px-6 py-14 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/60">
                <Trophy className="h-8 w-8 text-slate-500" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-200">এখনো কোনো ভুল রেকর্ড হয়নি</h3>
              <p className="mx-auto mb-5 max-w-sm text-sm text-slate-400">
                মডেল টেস্ট বা লাইভ এক্সাম দিলে যেসব প্রশ্নে ভুল হবে, সেগুলো এখানে নিজে থেকেই জমা হবে।
              </p>
              <Link
                to="/academic/model-test"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-500"
              >
                মডেল টেস্ট দাও <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          ) : dueNow.length > 0 ? (
            <button
              type="button"
              onClick={startReview}
              className="mb-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-orange-500 px-6 py-4 text-base font-black text-white shadow-lg shadow-rose-950/30 transition hover:from-rose-500 hover:to-orange-400 active:scale-[0.99]"
            >
              <RotateCcw className="h-5 w-5" /> {toBn(dueNow.length)} টি প্রশ্ন রিভিউ শুরু করো
            </button>
          ) : (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4">
              <Flame className="h-5 w-5 shrink-0 text-emerald-400" />
              <p className="text-sm font-semibold text-emerald-200">
                আজকে রিভিউ করার মতো কিছু নেই — সব আপ টু ডেট! 🎉
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
