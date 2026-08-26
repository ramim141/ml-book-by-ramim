import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  Dna, FlaskConical, Zap, BookOpen, Globe,
  Sparkles, CheckCircle2, Play, Layers,
  Bookmark, XCircle, Highlighter, Flame,
  ChevronDown, ArrowUpRight, RotateCcw,
  Library, Flag, HeartPulse, Target, Check, X, ListChecks
} from 'lucide-react';
import { NURSING_TRACKS, NURSING_SUBJECTS_CONFIG } from '../../../../data/academic/nursingConfig';
import { useAdmissionShortcuts } from '../../../../hooks/useAdmissionData';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import MarkdownRenderer from '../../../../components/UI/MarkdownRenderer';
import { SkeletonQuestionCard } from '../../../../components/UI/Skeleton';
import FeedbackModal from '../../../../components/Academic/FeedbackModal';
import SubjectWorkspace from '../../../../components/Academic/SubjectWorkspace';
import { getMainBookWriterName } from '../../../../utils/academicWriterResolver';
import toast from 'react-hot-toast';

const SUBJECT_ICONS = { Dna, FlaskConical, Zap, BookOpen, Globe, HeartPulse };

export default function NursingSubjectHome() {
  const { trackId, subjectSlug } = useParams();
  const { data: allShortcuts = [] } = useAdmissionShortcuts();

  const currentTrack = useMemo(() => {
    return NURSING_TRACKS.find(t => t.id === trackId) || NURSING_TRACKS[0];
  }, [trackId]);

  const subject = useMemo(() => {
    return NURSING_SUBJECTS_CONFIG.find(
      s => s.id.toLowerCase() === (subjectSlug || '').toLowerCase()
    );
  }, [subjectSlug]);

  // Distinct papers in this subject
  const availablePapers = useMemo(() => {
    if (!subject?.chapters) return [];
    const list = [];
    const seen = new Set();
    subject.chapters.forEach(c => {
      const p = c.paper || 'সাধারণ';
      if (!seen.has(p)) {
        seen.add(p);
        list.push(p);
      }
    });
    return list;
  }, [subject]);

  const [selectedPaper, setSelectedPaper] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [activeContentTab, setActiveContentTab] = useState('mcq');

  // Smart filter values
  const [questionFilter, setQuestionFilter] = useState('all');
  const [unansweredSnapshot, setUnansweredSnapshot] = useState(null);

  useEffect(() => {
    if (availablePapers.length > 0 && (!selectedPaper || !availablePapers.includes(selectedPaper))) {
      setSelectedPaper(availablePapers[0]);
    }
  }, [availablePapers, selectedPaper]);

  // MCQ practice state
  const [userAnswers, setUserAnswers] = useState({});
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [searchTopicQuery, setSearchTopicQuery] = useState('');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [reportingQuestion, setReportingQuestion] = useState(null);
  const [visibleCount, setVisibleCount] = useState(20);

  useEffect(() => {
    setVisibleCount(20);
  }, [selectedChapterId, selectedPaper, activeContentTab, searchTopicQuery, questionFilter]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [subjectSlug, trackId]);

  // Fetch questions from question_bank
  const { data: allSubjectQuestions = [], isLoading: isQuestionsLoading } = useQuery({
    queryKey: ['nursing_subject_questions', subject?.id, trackId],
    queryFn: async () => {
      try {
        const snap = await getDocs(collection(db, 'question_bank'));
        if (!snap.empty) {
          const allDocs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          return allDocs.filter(q => {
            const subStr = (q.subject || '').toLowerCase();
            const targetSub = (subject?.id || '').replace('nur-', '').toLowerCase();
            const targetName = (subject?.name || '').toLowerCase();

            return subStr.includes(targetSub) ||
              targetName.includes(subStr) ||
              (targetSub.includes('science') && (subStr.includes('sci') || subStr.includes('বিজ্ঞান'))) ||
              (targetSub.includes('biology') && (subStr.includes('bio') || subStr.includes('জীব')));
          });
        }
      } catch (err) {
        console.warn('Firestore question_bank fetch failed:', err);
      }
      return [];
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!subject?.id
  });

  const currentPaperChapters = useMemo(() => {
    if (!subject?.chapters) return [];
    if (!selectedPaper || availablePapers.length <= 1) return subject.chapters;
    return subject.chapters.filter(c => c.paper === selectedPaper);
  }, [subject, selectedPaper, availablePapers]);

  useEffect(() => {
    if (currentPaperChapters.length > 0) {
      const exists = currentPaperChapters.some(c => c.id === selectedChapterId);
      if (!exists) {
        setSelectedChapterId(currentPaperChapters[0].id);
      }
    }
  }, [currentPaperChapters, selectedChapterId]);

  const currentChapter = useMemo(() => {
    return currentPaperChapters.find(c => c.id === selectedChapterId) || currentPaperChapters[0] || null;
  }, [currentPaperChapters, selectedChapterId]);

  // Live Firestore question matcher for a chapter
  const getLiveChapterQuestions = (chapterObj) => {
    if (!chapterObj) return [];
    const cId = (chapterObj.id || '').toLowerCase();
    const cName = (chapterObj.name || '').toLowerCase();
    const cleanTitle = cName.split(':')[1]?.trim().toLowerCase() || cName;

    return allSubjectQuestions.filter(q => {
      const qChapterId = (q.chapterId || '').toLowerCase();
      const qChapter = (q.chapter || '').toLowerCase();
      const qTopic = (q.topic || '').toLowerCase();

      return (
        qChapterId === cId ||
        qChapter === cName ||
        qChapter.includes(cleanTitle) ||
        qTopic.includes(cleanTitle)
      );
    });
  };

  const isQuestionMainBook = (q) => {
    if (q.isMainBook || q.category === 'main_book' || q.source === 'main_book') return true;
    const typeStr = (q.examType || '').toLowerCase();
    return typeStr.includes('main book') || typeStr.includes('বই') || typeStr.includes('অনুশীলনী');
  };

  const baseChapterQuestions = useMemo(() => {
    if (!currentChapter) return [];
    const baseMatched = getLiveChapterQuestions(currentChapter);
    if (!searchTopicQuery.trim()) return baseMatched;

    const query = searchTopicQuery.toLowerCase();
    return baseMatched.filter(q =>
      (q.question || '').toLowerCase().includes(query) ||
      (q.topic || '').toLowerCase().includes(query) ||
      (q.explanation || '').toLowerCase().includes(query)
    );
  }, [allSubjectQuestions, currentChapter, searchTopicQuery]);

  const admissionQuestions = useMemo(
    () => baseChapterQuestions.filter(q => !isQuestionMainBook(q)),
    [baseChapterQuestions]
  );

  const mainBookQuestions = useMemo(
    () => baseChapterQuestions.filter(q => isQuestionMainBook(q)),
    [baseChapterQuestions]
  );

  const tabQuestions = useMemo(() => {
    if (activeContentTab === 'main_book_mcq') return mainBookQuestions;
    return admissionQuestions.length > 0 ? admissionQuestions : baseChapterQuestions;
  }, [activeContentTab, mainBookQuestions, admissionQuestions, baseChapterQuestions]);

  const smartCounts = useMemo(() => {
    let unanswered = 0;
    let wrong = 0;
    let bookmarked = 0;
    tabQuestions.forEach(q => {
      const picked = userAnswers[q.id];
      if (picked === undefined) unanswered += 1;
      else if (picked !== q.answer) wrong += 1;
      if (bookmarkedIds.has(q.id)) bookmarked += 1;
    });
    return { all: tabQuestions.length, unanswered, wrong, bookmarked };
  }, [tabQuestions, userAnswers, bookmarkedIds]);

  const displayedQuestions = useMemo(() => {
    if (questionFilter === 'bookmarked') {
      return tabQuestions.filter(q => bookmarkedIds.has(q.id));
    }
    if (questionFilter === 'wrong') {
      return tabQuestions.filter(q => {
        const picked = userAnswers[q.id];
        return picked !== undefined && picked !== q.answer;
      });
    }
    if (questionFilter === 'unanswered') {
      // Snapshot taken when the filter was switched on, so answering a question
      // does not make it vanish from under the user's finger.
      if (!unansweredSnapshot) return tabQuestions.filter(q => userAnswers[q.id] === undefined);
      return tabQuestions.filter(q => unansweredSnapshot.has(q.id));
    }
    return tabQuestions;
  }, [questionFilter, tabQuestions, bookmarkedIds, userAnswers, unansweredSnapshot]);

  const chapterMnemonics = useMemo(() => {
    const medShortcuts = allShortcuts.filter(s => s.track === 'nursing' || s.track === 'medical');
    return medShortcuts.filter(m => {
      const matchSub = (m.subject || '').toLowerCase().includes(subject?.name?.toLowerCase().split(' ')[0] || '') ||
        (m.subject || '').toLowerCase().includes(subject?.id?.toLowerCase() || '');
      const matchChap = !currentChapter ||
        (m.chapter || '').toLowerCase().includes(currentChapter.name?.toLowerCase() || '') ||
        (m.topic || '').toLowerCase().includes(currentChapter.name?.toLowerCase() || '');
      return matchSub && matchChap;
    });
  }, [allShortcuts, subject, currentChapter]);

  const totalSubjectQuestions = useMemo(() => {
    if (!subject?.chapters) return 0;
    return subject.chapters.reduce((sum, ch) => sum + getLiveChapterQuestions(ch).length, 0);
  }, [subject, allSubjectQuestions]);

  const totalKeyFacts = useMemo(() => {
    if (!subject?.chapters) return 0;
    return subject.chapters.reduce((sum, ch) => sum + (ch.keyFacts?.length || 0), 0);
  }, [subject]);

  const answerStats = useMemo(() => {
    let attempted = 0;
    let correct = 0;
    displayedQuestions.forEach(q => {
      const picked = userAnswers[q.id];
      if (picked === undefined) return;
      attempted += 1;
      if (picked === q.answer) correct += 1;
    });
    return { attempted, correct, wrong: attempted - correct };
  }, [displayedQuestions, userAnswers]);

  if (!subject) {
    return <Navigate to={`/academic/admission/nursing/${trackId || 'bsc'}`} replace />;
  }

  const handleSelectOption = (qId, optionIdx) => {
    if (userAnswers[qId] !== undefined) return;
    setUserAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const handleToggleBookmark = (qId) => {
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (next.has(qId)) {
        next.delete(qId);
        toast.success('বুকমার্ক থেকে সরানো হয়েছে');
      } else {
        next.add(qId);
        toast.success('প্রশ্নটি বুকমার্ক করা হয়েছে');
      }
      return next;
    });
  };

  const handleSelectChapter = (chapterId) => {
    setSelectedChapterId(chapterId);
    setUserAnswers({});
    setSearchTopicQuery('');
    setQuestionFilter('all');
    setUnansweredSnapshot(null);
  };

  const handleApplyQuestionFilter = (key) => {
    if (key === 'unanswered') {
      setUnansweredSnapshot(new Set(
        tabQuestions.filter(q => userAnswers[q.id] === undefined).map(q => q.id)
      ));
    } else {
      setUnansweredSnapshot(null);
    }
    setQuestionFilter(key);
  };

  const handleResetFilters = () => {
    setSearchTopicQuery('');
    setQuestionFilter('all');
    setUnansweredSnapshot(null);
  };

  const Icon = SUBJECT_ICONS[subject.icon] || HeartPulse;
  const shortSubjectName = (subject.name || '').split('(')[0].trim();
  const isMcqTab = activeContentTab === 'mcq' || activeContentTab === 'main_book_mcq';

  const CONTENT_TABS = [
    { key: 'mcq', label: 'প্রশ্নব্যাংক', icon: Layers, count: admissionQuestions.length },
    {
      key: 'main_book_mcq', label: 'মূল বই MCQ', icon: Library, count: mainBookQuestions.length,
      activeClass: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-500/25'
    },
    {
      key: 'lines', label: 'দাগানো লাইন', icon: Highlighter, count: currentChapter?.keyFacts?.length || 0,
      activeClass: 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md shadow-teal-500/25'
    },
    {
      key: 'mnemonics', label: 'ছন্দ ও ট্রিকস', icon: Sparkles, count: chapterMnemonics.length,
      activeClass: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25'
    }
  ];

  const QUICK_FILTERS = [
    { key: 'all', label: 'সব প্রশ্ন', icon: ListChecks, count: smartCounts.all, tone: 'emerald' },
    { key: 'unanswered', label: 'বাকি আছে', icon: Target, count: smartCounts.unanswered, tone: 'sky' },
    { key: 'wrong', label: 'ভুল হয়েছে', icon: XCircle, count: smartCounts.wrong, tone: 'red' },
    { key: 'bookmarked', label: 'বুকমার্ক', icon: Bookmark, count: smartCounts.bookmarked, tone: 'amber' }
  ];

  return (
    <>
      <SubjectWorkspace
        accent="emerald"
        storageKey="nursing_subject"
        breadcrumbs={[
          { label: 'একাডেমিক', to: '/academic' },
          { label: 'ভর্তি প্রস্তুতি', to: '/academic/admission' },
          { label: 'নার্সিং', to: '/academic/admission/nursing' },
          { label: currentTrack.shortName, to: `/academic/admission/nursing/${currentTrack.id}` },
          { label: shortSubjectName }
        ]}
        backLink={{ to: `/academic/admission/nursing/${currentTrack.id}`, label: `${currentTrack.shortName}-এ ফিরে যান` }}
        primaryAction={{ to: `/academic/admission/nursing/${currentTrack.id}/model-test`, label: 'মডেল টেস্ট', icon: Play }}
        hero={{
          icon: Icon,
          iconGradient: subject.color,
          title: subject.name,
          subtitle: subject.subTitle,
          chips: [
            { label: subject.marks, tone: 'accent' },
            { label: currentTrack.shortName },
            ...(availablePapers.length > 1 && selectedPaper ? [{ label: selectedPaper, tone: 'accent' }] : [])
          ],
          footnote: subject.recommendedBooks ? (
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium flex items-start gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
              <span className="min-w-0">পাঠ্যবই: <strong className="text-slate-300">
                {Array.isArray(subject.recommendedBooks) ? subject.recommendedBooks.join(' ও ') : subject.recommendedBooks}
              </strong></span>
            </p>
          ) : null
        }}
        stats={[
          { label: 'মোট অধ্যায়', value: `${subject.chapters?.length || 0}টি`, icon: Layers, tone: 'text-emerald-300' },
          { label: 'মোট প্রশ্ন', value: `${totalSubjectQuestions}টি`, icon: Target, tone: 'text-teal-300' },
          { label: 'দাগানো লাইন', value: `${totalKeyFacts}টি`, icon: Highlighter, tone: 'text-cyan-300' },
          { label: 'শর্টকাট ট্রিকস', value: `${chapterMnemonics.length}টি`, icon: Sparkles, tone: 'text-purple-300' }
        ]}
        papers={availablePapers}
        selectedPaper={selectedPaper}
        onSelectPaper={(p) => {
          setSelectedPaper(p);
          setUserAnswers({});
          setQuestionFilter('all');
          setUnansweredSnapshot(null);
        }}
        chapters={currentPaperChapters.map(ch => ({
          id: ch.id,
          name: ch.name,
          badge: `${getLiveChapterQuestions(ch).length} Q`
        }))}
        selectedChapterId={currentChapter?.id || ''}
        onSelectChapter={handleSelectChapter}
        chapterBadge={currentChapter?.paper || currentTrack.shortName}
        chapterAction={currentChapter && (
          <>
            <Link
              to={`/academic/admission/nursing/${currentTrack.id}/highlighted-lines?subject=${subject.id}&chapter=${currentChapter.id}`}
              className="flex text-slate-400 hover:text-emerald-300 text-xs font-bold transition items-center gap-1"
            >
              <span>দাগানো লাইন</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to={`/academic/admission/nursing/${currentTrack.id}/${subject.id}/${currentChapter.id}`}
              className="text-emerald-400 hover:text-emerald-300 text-xs font-bold transition flex items-center gap-1"
            >
              <span>ফুল স্ক্রিন</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </>
        )}
        tabs={CONTENT_TABS}
        activeTab={activeContentTab}
        onSelectTab={setActiveContentTab}
        quickFilters={isMcqTab ? QUICK_FILTERS : null}
        activeQuickFilter={questionFilter}
        onSelectQuickFilter={handleApplyQuestionFilter}
        search={isMcqTab ? {
          value: searchTopicQuery,
          onChange: setSearchTopicQuery,
          placeholder: 'প্রশ্ন বা টপিক দিয়ে সার্চ করুন...'
        } : null}
        onResetFilters={handleResetFilters}
        hasActiveFilter={questionFilter !== 'all' || !!searchTopicQuery.trim()}
        emptyState={(
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center space-y-3">
            <Layers className="w-9 h-9 text-slate-600 mx-auto" />
            <h4 className="text-sm sm:text-base font-bold text-slate-200">এই বিষয়ের অধ্যায় যুক্ত হচ্ছে</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              শীঘ্রই {shortSubjectName} বিষয়ের অধ্যায়ভিত্তিক প্রশ্ন ও দাগানো লাইন যোগ করা হবে।
            </p>
          </div>
        )}
      >
        {/* Active smart-filter chip */}
        {isMcqTab && questionFilter !== 'all' && (
          <div className="flex items-center gap-2 flex-wrap text-[11.5px]">
            <span className="text-slate-500 font-bold">সক্রিয় ফিল্টার:</span>
            <button
              type="button"
              onClick={() => handleApplyQuestionFilter('all')}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1.5 hover:bg-emerald-500/25 transition"
            >
              {QUICK_FILTERS.find(f => f.key === questionFilter)?.label}
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* ── MCQ TABS ─────────────────────────────────────────────────── */}
        {isMcqTab && (
          <div className="space-y-3 sm:space-y-4">
            {isQuestionsLoading ? (
              <SkeletonQuestionCard count={3} />
            ) : displayedQuestions.length > 0 ? (
              <>
                <div className="px-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap text-[11px] sm:text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-emerald-400" />
                      মোট প্রশ্ন <strong className="text-white font-mono">{displayedQuestions.length}</strong>টি
                    </span>
                    <span className="flex items-center gap-2.5">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Check className="w-3.5 h-3.5" />
                        <strong className="font-mono">{answerStats.correct}</strong>
                      </span>
                      <span className="flex items-center gap-1 text-red-400">
                        <XCircle className="w-3.5 h-3.5" />
                        <strong className="font-mono">{answerStats.wrong}</strong>
                      </span>
                      {answerStats.attempted > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setUserAnswers({});
                            toast.success('উত্তর রিসেট করা হয়েছে');
                          }}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
                        >
                          <RotateCcw className="w-3 h-3" />
                          রিসেট
                        </button>
                      )}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                      style={{ width: `${displayedQuestions.length ? (answerStats.attempted / displayedQuestions.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {displayedQuestions.slice(0, visibleCount).map((q, idx) => {
                  const selectedOpt = userAnswers[q.id];
                  const isAnswered = selectedOpt !== undefined;
                  const isCorrect = isAnswered && selectedOpt === q.answer;
                  const isBookmarked = bookmarkedIds.has(q.id);
                  const isMainBookQ = isQuestionMainBook(q);

                  return (
                    <div
                      key={q.id || idx}
                      className={`p-3.5 sm:p-5 rounded-2xl bg-slate-900/80 border shadow-md transition-all space-y-3 ${
                        isAnswered
                          ? isCorrect
                            ? 'border-emerald-500/40 bg-emerald-950/10'
                            : 'border-red-500/40 bg-red-950/10'
                          : 'border-white/[0.08] hover:border-emerald-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 sm:gap-2.5">
                        <div className="flex items-start gap-2 sm:gap-2.5 min-w-0">
                          <span className="px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 shrink-0 mt-0.5">
                            Q{idx + 1}
                          </span>
                          <div className="min-w-0">
                            <div className="text-[13px] sm:text-sm font-semibold text-slate-100 leading-relaxed break-words">
                              <MarkdownRenderer content={q.question} />
                            </div>
                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                              {isMainBookQ ? (
                                <span className="px-1.5 sm:px-2 py-0.5 rounded text-[9.5px] sm:text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                  <BookOpen className="w-3 h-3" />
                                  {getMainBookWriterName(q, subject, currentChapter)}
                                </span>
                              ) : q.examTags?.length > 0 ? (
                                q.examTags.map((tag, tIdx) => (
                                  <span key={tIdx} className="px-1.5 sm:px-2 py-0.5 rounded text-[9.5px] sm:text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                    {tag.type || tag.name} {tag.session || tag.year}
                                  </span>
                                ))
                              ) : (q.examType || q.year) ? (
                                <span className="text-[10.5px] sm:text-[11px] font-bold text-emerald-400">
                                  {q.examType || 'Nursing'} {q.year || ''}
                                </span>
                              ) : null}
                              {q.topic && (
                                <span className="text-[10.5px] sm:text-[11px] text-slate-400 font-medium">• {q.topic}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                          <button
                            onClick={() => {
                              setReportingQuestion(q);
                              setFeedbackModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition"
                            title="প্রশ্নে ভুল থাকলে রিপোর্ট করুন"
                          >
                            <Flag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </button>

                          <button
                            onClick={() => handleToggleBookmark(q.id)}
                            className={`p-1.5 rounded-lg transition ${isBookmarked ? 'bg-amber-500/20 text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
                            title="বুকমার্ক করুন"
                          >
                            <Bookmark className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill={isBookmarked ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options?.map((opt, optIdx) => {
                          const isSelected = selectedOpt === optIdx;
                          const isTargetAnswer = q.answer === optIdx;

                          let btnStyle = 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800';
                          if (isAnswered) {
                            if (isTargetAnswer) {
                              btnStyle = 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-bold';
                            } else if (isSelected) {
                              btnStyle = 'bg-red-500/20 border-red-500/60 text-red-300 font-bold';
                            }
                          }

                          const optLabels = ['ক', 'খ', 'গ', 'ঘ'];

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectOption(q.id, optIdx)}
                              className={`flex items-start gap-2 p-2.5 sm:p-3 rounded-xl border text-left text-[12.5px] sm:text-sm font-medium transition-all ${btnStyle}`}
                            >
                              <span className={`w-5 h-5 rounded-md text-[10.5px] sm:text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                                isAnswered && isTargetAnswer
                                  ? 'bg-emerald-500 text-white'
                                  : isAnswered && isSelected
                                    ? 'bg-red-500 text-white'
                                    : 'bg-slate-700 text-slate-300'
                              }`}>
                                {optLabels[optIdx]}
                              </span>
                              <div className="flex-grow min-w-0 break-words">
                                <MarkdownRenderer content={opt} />
                              </div>
                              {isAnswered && isTargetAnswer && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />}
                              {isAnswered && isSelected && !isTargetAnswer && <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />}
                            </button>
                          );
                        })}
                      </div>

                      {isAnswered && q.explanation && (
                        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-2.5 sm:p-3 text-xs text-slate-300 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-emerald-400 text-[11px] sm:text-xs">
                            <Sparkles className="h-3.5 w-3.5 shrink-0" />
                            <span>ব্যাখ্যা ও মূল বইয়ের রেফারেন্স:</span>
                          </div>
                          <div className="leading-relaxed pl-4 sm:pl-5 text-slate-300 text-[11px] sm:text-xs break-words">
                            <MarkdownRenderer content={q.explanation} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {displayedQuestions.length > visibleCount && (
                  <button
                    type="button"
                    onClick={() => setVisibleCount((v) => v + 20)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-800 bg-slate-900/60 hover:bg-slate-800/70 hover:border-emerald-500/40 py-3.5 text-xs sm:text-sm font-bold text-slate-300 transition hover:text-emerald-200 shadow-sm"
                  >
                    <ChevronDown className="h-4 w-4 text-emerald-400" />
                    আরো ২০টি প্রশ্ন দেখুন
                    <span className="text-slate-500 font-normal">({displayedQuestions.length - visibleCount} টি বাকি)</span>
                  </button>
                )}
              </>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl sm:rounded-3xl p-8 sm:p-10 text-center space-y-3">
                <BookOpen className="w-9 h-9 text-slate-600 mx-auto" />
                <h4 className="text-sm sm:text-base font-bold text-slate-200">
                  {questionFilter !== 'all'
                    ? 'এই ফিল্টারে কোনো প্রশ্ন নেই'
                    : searchTopicQuery.trim()
                      ? 'এই সার্চে কোনো প্রশ্ন মেলেনি'
                      : activeContentTab === 'main_book_mcq'
                        ? 'মূল বইয়ের অনুশীলনী প্রশ্ন যুক্ত হচ্ছে'
                        : 'এই অধ্যায়ের কোনো ভর্তি পরীক্ষার প্রশ্ন পাওয়া যায়নি'}
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  {questionFilter !== 'all' || searchTopicQuery.trim()
                    ? 'ফিল্টার বা সার্চ পরিবর্তন করে আবার চেষ্টা করুন।'
                    : 'নার্সিং ভর্তি পরীক্ষার বিগত সালের প্রশ্নব্যাংক ও অন্যান্য অধ্যায়ের প্রশ্ন প্র্যাকটিস করতে পারেন।'}
                </p>
                {(questionFilter !== 'all' || searchTopicQuery.trim()) && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold transition inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    ফিল্টার ক্লিয়ার করুন
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── HIGHLIGHTED LINES ────────────────────────────────────────── */}
        {activeContentTab === 'lines' && (
          <div className="space-y-3.5 sm:space-y-4">
            {currentChapter?.highYieldTopics?.length > 0 && (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>হাই-ইয়েল্ড টপিকস:</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentChapter.highYieldTopics.map((top, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-200 border border-emerald-500/30 text-[11px] sm:text-xs font-medium">
                      • {top}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {currentChapter?.keyFacts?.length > 0 ? (
              <div className="space-y-2.5">
                {currentChapter.keyFacts.map((line, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-white/[0.08] shadow-md flex items-start gap-2.5 sm:gap-3 hover:border-emerald-500/30 transition"
                  >
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold font-mono flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="text-[12.5px] sm:text-sm text-slate-200 leading-relaxed flex-grow min-w-0 break-words">
                      <MarkdownRenderer content={line} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 sm:p-12 text-center space-y-3">
                <Highlighter className="w-8 h-8 text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">দাগানো লাইন যুক্ত হচ্ছে</h4>
                <p className="text-xs text-slate-500">মূল বই থেকে গুরুত্বপূর্ণ দাগানো তথ্য দ্রুতই আপডেট করা হবে।</p>
              </div>
            )}
          </div>
        )}

        {/* ── MNEMONICS ────────────────────────────────────────────────── */}
        {activeContentTab === 'mnemonics' && (
          <div className="space-y-3 sm:space-y-4">
            {chapterMnemonics.length > 0 ? (
              chapterMnemonics.map((mnem, idx) => (
                <div
                  key={mnem.id || idx}
                  className="p-3.5 sm:p-5 rounded-2xl bg-slate-900/80 border border-white/[0.08] shadow-md space-y-3 hover:border-purple-500/40 transition"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-lg text-[11px] sm:text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {mnem.topic || mnem.subject || 'শর্টকাট ট্রিক'}
                    </span>
                    {mnem.applicableTracks && (
                      <span className="text-[10.5px] text-slate-400 font-mono">{mnem.applicableTracks.join(', ')}</span>
                    )}
                  </div>

                  <h4 className="font-bold text-white text-[14px] sm:text-base leading-snug break-words">{mnem.title}</h4>

                  {mnem.mnemonic && (
                    <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30">
                      <span className="text-[10px] font-black text-emerald-400 block mb-0.5">মনে রাখার ছন্দ:</span>
                      <p className="text-[12.5px] sm:text-sm font-bold text-emerald-200 tracking-wide break-words">{mnem.mnemonic}</p>
                    </div>
                  )}

                  <div className="text-[11.5px] sm:text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-700/40">
                    <span className="font-bold text-slate-400 block mb-0.5">ব্যাখ্যা:</span>
                    <p className="break-words">{mnem.explanation || mnem.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 sm:p-12 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">এই অধ্যায়ের শর্টকাট পাওয়া যায়নি</h4>
                <p className="text-xs text-slate-500 mb-1">সকল বিষয়ের শর্টকাট দেখতে শর্টকাট হাব ভিজিট করুন।</p>
                <Link
                  to={`/academic/admission/nursing/${currentTrack.id}/mnemonics`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-bold transition"
                >
                  শর্টকাট হাব
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}
      </SubjectWorkspace>

      {feedbackModalOpen && reportingQuestion && (
        <FeedbackModal
          isOpen={feedbackModalOpen}
          onClose={() => {
            setFeedbackModalOpen(false);
            setReportingQuestion(null);
          }}
          questionId={reportingQuestion.id}
          questionType="admission_mcq"
          chapterId={reportingQuestion.chapterId || currentChapter?.id}
          subjectId={subject.id}
          questionData={reportingQuestion}
        />
      )}
    </>
  );
}
