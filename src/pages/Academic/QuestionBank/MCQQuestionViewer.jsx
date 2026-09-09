import { useState, useEffect, useMemo, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Search, SlidersHorizontal, LayoutGrid, FileText } from 'lucide-react';
import FilterSelect from '../../../components/UI/FilterSelect';
import SharedMCQItem from '../../../components/Academic/SharedMCQItem';
import ExamPdfExportModal from '../../../components/Academic/ExamPdfExportModal';
import { SkeletonList } from '../../../components/UI/Skeleton';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { resolveSubjectFromRoute, DEFAULT_ACADEMIC_SUBJECTS } from '../../../utils/academicRoutes';
import { optionsOf } from '../../../lib/questionUtils';

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const enToBnNumber = (numStr) => {
  if (numStr === null || numStr === undefined || numStr === '') return numStr;
  return String(numStr).replace(/[0-9]/g, w => BN_DIGITS[w] || w);
};

const normalizeYear = (yearStr) => {
  if (!yearStr) return yearStr;
  const bnToEn = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
  let enYear = String(yearStr).replace(/[০-৯]/g, w => bnToEn[w] || w);
  if (enYear.length === 2) {
    enYear = "20" + enYear;
  }
  return enYear;
};

export default function MCQQuestionViewer({ educationLevel: propEdu, subject: propSub } = {}) {
  const { educationLevel: paramEdu, subject: paramSub } = useParams();
  const educationLevel = propEdu || paramEdu;
  const subject = propSub || paramSub;
  const [notFound, setNotFound] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('all');
  const [selectedBoard, setSelectedBoard] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedInstitution, setSelectedInstitution] = useState('all');
  const [showAdvanceFilters, setShowAdvanceFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(15);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  useEffect(() => {
    setVisibleCount(15);
  }, [searchQuery, selectedChapter, selectedBoard, selectedYear, selectedTopic, selectedInstitution]);

  const { data = { config: null, questions: [] }, isLoading: loading, isError, error } = useQuery({
    queryKey: ['mcqQuestions', educationLevel, subject],
    queryFn: async () => {
      let subjects = DEFAULT_ACADEMIC_SUBJECTS;
      try {
        const subjectsSnap = await getDoc(doc(db, 'admin_settings', 'subjects'));
        if (subjectsSnap.exists() && subjectsSnap.data().list?.length > 0) {
          subjects = subjectsSnap.data().list;
        }
      } catch (e) {
        console.warn('Using default subjects fallback for MCQ:', e);
      }

      const resolved = resolveSubjectFromRoute(subjects, educationLevel, subject);

      if (!resolved) {
        throw new Error('NotFound');
      }

      const subjectVariants = Array.from(new Set([
        resolved.id,
        `${educationLevel}-${subject}`.toLowerCase(),
        String(subject).toLowerCase(),
        resolved.id.replace(/-1$/, '')
      ])).filter(Boolean);

      let contentSnapDocs = [];
      try {
        const snap = await getDocs(query(
          collection(db, 'academic_content'),
          where('subject', 'in', subjectVariants),
          where('type', '==', 'mcq')
        ));
        contentSnapDocs = snap.docs;
      } catch (err) {
        const snap = await getDocs(query(
          collection(db, 'academic_content'),
          where('subject', '==', resolved.id),
          where('type', '==', 'mcq')
        ));
        contentSnapDocs = snap.docs;
      }

      const chapters = resolved.chapters || [];
      const questions = contentSnapDocs.map((docSnap) => {
        const data = docSnap.data();
        const chapter = chapters.find((item) => {
          if (item.id === data.chapterId) return true;
          const itemNum = String(item.id || '').replace(/\D/g, '');
          const docNum = String(data.chapterId || '').replace(/\D/g, '');
          return Boolean(itemNum && docNum && itemNum === docNum);
        });
        return {
          firebaseId: docSnap.id,
          id: docSnap.id,
          ...data,
          chapterName: chapter?.title || chapter?.name || data.chapterName || data.chapterId,
        };
      });

      return { config: resolved, questions };
    },
    retry: false
  });

  const subjectConfig = data?.config;
  const allQuestions = data?.questions || [];
  
  useEffect(() => {
    if (isError && error?.message === 'NotFound') {
      setNotFound(true);
    }
  }, [isError, error]);

  const filterOptions = useMemo(() => {
    const chapters = (subjectConfig?.chapters || []).map(c => ({ value: c.id, label: c.title || c.name || c.id }));

    const boardsSet = new Set();
    const yearsSet = new Set();
    const topicsSet = new Set();
    const institutionsSet = new Set();

    allQuestions.forEach(mcq => {
      if (mcq.boards) {
        mcq.boards.forEach(b => {
          if (b.name) boardsSet.add(b.name);
          if (b.year) yearsSet.add(normalizeYear(b.year));
        });
      }
      if (mcq.institutions) {
        mcq.institutions.forEach(i => {
          if (i.name) institutionsSet.add(i.name);
          if (i.year) yearsSet.add(normalizeYear(i.year));
        });
      }
      const matchesChapter = selectedChapter === 'all' || 
        mcq.chapterId === selectedChapter ||
        (String(mcq.chapterId || '').replace(/\D/g, '') === String(selectedChapter).replace(/\D/g, '') && String(selectedChapter).replace(/\D/g, '') !== '');

      if (mcq.topic && matchesChapter) {
        topicsSet.add(mcq.topic);
      }
    });

    const boards = Array.from(boardsSet).map(b => ({ value: b, label: b }));
    const years = Array.from(yearsSet)
      .sort((a, b) => parseInt(b) - parseInt(a))
      .map(y => ({ value: y, label: enToBnNumber(y) }));
    const topics = Array.from(topicsSet).map(t => ({ value: t, label: t }));
    const institutions = Array.from(institutionsSet).map(i => ({ value: i, label: i }));

    return { chapters, boards, years, topics, institutions };
  }, [allQuestions, subjectConfig, selectedChapter]);

  const filteredQuestions = useMemo(() => {
    return allQuestions.filter(mcq => {
      const matchesSearch = searchQuery === '' ||
        mcq.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mcq.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        optionsOf(mcq).some(o => String(o ?? '').toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesChapter = selectedChapter === 'all' || 
        mcq.chapterId === selectedChapter ||
        (String(mcq.chapterId || '').replace(/\D/g, '') === String(selectedChapter).replace(/\D/g, '') && String(selectedChapter).replace(/\D/g, '') !== '');

      const matchesBoard = selectedBoard === 'all' || mcq.boards?.some(b => b.name === selectedBoard);
      const matchesInstitution = selectedInstitution === 'all' || mcq.institutions?.some(i => i.name === selectedInstitution);
      const matchesYear = selectedYear === 'all' ||
        mcq.boards?.some(b => normalizeYear(b.year) === selectedYear) ||
        mcq.institutions?.some(i => normalizeYear(i.year) === selectedYear);
      const matchesTopic = selectedTopic === 'all' || mcq.topic === selectedTopic;

      return matchesSearch && matchesChapter && matchesBoard && matchesYear && matchesTopic && matchesInstitution;
    });
  }, [allQuestions, searchQuery, selectedChapter, selectedBoard, selectedYear, selectedTopic, selectedInstitution]);

  const renderFilters = () => (
    <>
      <div>
        <label className="text-[10px] font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">অধ্যায়</label>
        <FilterSelect
          value={selectedChapter}
          onChange={setSelectedChapter}
          options={[{ value: 'all', label: 'সব অধ্যায়' }, ...filterOptions.chapters]}
        />
      </div>

      <div>
        <label className="text-[10px] font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">বোর্ড</label>
        <FilterSelect
          value={selectedBoard}
          onChange={setSelectedBoard}
          options={[{ value: 'all', label: 'সব বোর্ড' }, ...filterOptions.boards]}
        />
      </div>

      {filterOptions.institutions.length > 0 && (
        <div>
          <label className="text-[10px] font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">স্কুল/কলেজ</label>
          <FilterSelect
            value={selectedInstitution}
            onChange={setSelectedInstitution}
            options={[{ value: 'all', label: 'সব কলেজ' }, ...filterOptions.institutions]}
          />
        </div>
      )}

      <div>
        <label className="text-[10px] font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">সাল</label>
        <FilterSelect
          value={selectedYear}
          onChange={setSelectedYear}
          options={[{ value: 'all', label: 'সব সাল' }, ...filterOptions.years]}
        />
      </div>

      <div>
        <label className="text-[10px] font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">টপিক</label>
        <FilterSelect
          value={selectedTopic}
          onChange={setSelectedTopic}
          options={[{ value: 'all', label: 'সব টপিক' }, ...filterOptions.topics]}
        />
      </div>
    </>
  );

  if (notFound) {
    return <Navigate to="/academic/question-bank" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] py-6 sm:py-8 text-slate-200">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-10">
        <Link
          to="/academic/question-bank"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          ড্যাশবোর্ডে ফিরুন
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {subjectConfig?.label || 'লোড হচ্ছে...'} বহুনির্বাচনী (MCQ) প্রশ্নব্যাংক
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              সকল অধ্যায়ের বিগত সালের গুরুত্বপূর্ণ বোর্ড ও কলেজ প্রশ্ন সমাধান একসাথে।
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
            <button
              type="button"
              onClick={() => setIsPdfModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>প্রশ্নপত্র ও সমাধান PDF</span>
            </button>
            <div className="text-xs sm:text-sm bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-indigo-300 font-bold">
              মোট প্রশ্ন: {enToBnNumber(filteredQuestions.length)} টি
            </div>
          </div>
        </div>
      </div>

      {/* Printable PDF Export Modal */}
      <ExamPdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        examTitle={`${subjectConfig?.label || ''} MCQ প্রশ্নব্যাংক`}
        questions={filteredQuestions}
        examInfo={{
          totalMarks: filteredQuestions.length,
          timeLimitMinutes: Math.max(15, Math.round(filteredQuestions.length * 0.8)),
          subject: subjectConfig?.label || subject || 'সকল বিষয়',
        }}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Search & Filter Bar */}
        <div className="p-4 sm:p-5 border shadow-xl bg-slate-800/20 backdrop-blur-xl border-slate-700/50 rounded-3xl relative z-40">
          <div className="flex flex-col lg:flex-row lg:items-end gap-4 relative w-full">
            <div className="flex items-end gap-3 w-full lg:w-auto lg:max-w-xs xl:max-w-sm shrink-0">
              {/* Search Box */}
              <div className="flex-grow w-full">
                <label className="hidden lg:block text-[10px] font-bold text-transparent mb-1.5 select-none">Search</label>
                <div className="flex items-center bg-slate-900/50 border border-slate-700/50 rounded-full p-1.5 shadow-inner focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all min-w-0">
                  <div className="pl-4 pr-2 flex items-center pointer-events-none shrink-0">
                    <Search className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="প্রশ্ন বা টপিক খুঁজুন..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-grow w-full min-w-0 bg-transparent border-none text-slate-100 text-sm sm:text-base focus:outline-none focus:ring-0 py-2 sm:py-2.5"
                  />
                </div>
              </div>

              {/* Advance Filter Toggle (Mobile Only) */}
              <div className="lg:hidden relative shrink-0">
                <button
                  onClick={() => setShowAdvanceFilters(!showAdvanceFilters)}
                  className={`p-3 sm:p-3.5 rounded-2xl sm:rounded-[1.25rem] border transition-all flex items-center justify-center ${showAdvanceFilters
                    ? 'bg-indigo-500/30 text-indigo-200 border-indigo-500/50 shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/80 border-slate-700/50'
                    }`}
                >
                  <SlidersHorizontal className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>

                {/* Expanded Filters Popup */}
                {showAdvanceFilters && (
                  <div className="absolute right-0 top-full mt-3 w-[260px] sm:w-[320px] p-4 rounded-2xl bg-slate-800/95 border border-slate-700/70 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 z-50 flex flex-col gap-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {renderFilters()}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Filters Row (Hidden on mobile) */}
            <div className="hidden lg:flex flex-row flex-wrap items-center gap-3 w-full flex-1 [&>div]:flex-1 [&>div]:min-w-[100px]">
              {renderFilters()}
            </div>
          </div>
        </div>

        {/* Loader or Questions Grid */}
        {loading ? (
          <div className="py-8">
            <SkeletonList count={5} />
          </div>
        ) : filteredQuestions.length > 0 ? (
          <div className="flex flex-col gap-4 pb-8">
            {filteredQuestions.slice(0, visibleCount).map((mcq, idx) => (
              <SharedMCQItem key={mcq.firebaseId || mcq.id || idx} mcq={mcq} index={idx} />
            ))}

            {visibleCount < filteredQuestions.length && (
              <div className="flex justify-center mt-4 mb-8">
                <button
                  onClick={() => setVisibleCount(prev => prev + 15)}
                  className="px-6 py-2.5 bg-indigo-500/20 text-indigo-300 font-bold rounded-xl border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors"
                >
                  আরো দেখুন
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 border border-slate-700/30 rounded-3xl bg-slate-800/10">
            <LayoutGrid className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-semibold">কোনো প্রশ্ন পাওয়া যায়নি</p>
            <p className="text-slate-500 text-xs mt-1">অনুগ্রহ করে ফিল্টার পরিবর্তন করে চেষ্টা করুন।</p>
          </div>
        )}
      </div>
    </div>
  );
}
