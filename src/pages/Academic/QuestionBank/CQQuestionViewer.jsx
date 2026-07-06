import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, Navigate, useParams } from 'react-router-dom';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { ArrowLeft, LayoutGrid, Loader2, Search, SlidersHorizontal } from 'lucide-react';
import SharedCQItem from '../../../components/Academic/SharedCQItem';
import FilterSelect from '../../../components/UI/FilterSelect';
import { db } from '../../../config/firebase';
import { resolveSubjectFromRoute } from '../../../utils/academicRoutes';

const normalizeYear = (value) => String(value || '').replace(/[০-৯]/g, (digit) => '০১২৩৪৫৬৭৮৯'.indexOf(digit));

export default function CQQuestionViewer({ educationLevel: propEdu, subject: propSub } = {}) {
  const { educationLevel: paramEdu, subject: paramSub } = useParams();
  const educationLevel = propEdu || paramEdu;
  const subjectSlug = propSub || paramSub;
  const [notFound, setNotFound] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('all');
  const [selectedBoard, setSelectedBoard] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [showAdvanceFilters, setShowAdvanceFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(15);

  useEffect(() => {
    setVisibleCount(15);
  }, [searchQuery, selectedChapter, selectedBoard, selectedYear, selectedTopic]);

  const { data = { config: null, questions: [] }, isLoading: loading, isError, error } = useQuery({
    queryKey: ['cqQuestions', educationLevel, subjectSlug],
    queryFn: async () => {
      const subjectsSnap = await getDoc(doc(db, 'admin_settings', 'subjects'));
      const subjects = subjectsSnap.exists() ? subjectsSnap.data().list || [] : [];
      const resolved = resolveSubjectFromRoute(subjects, educationLevel, subjectSlug);

      if (!resolved) {
        throw new Error('NotFound');
      }

      const contentSnap = await getDocs(query(
        collection(db, 'academic_content'),
        where('subject', '==', resolved.id),
        where('type', '==', 'cq')
      ));

      const chapters = resolved.chapters || [];
      const questions = contentSnap.docs.map((docSnap) => {
        const data = docSnap.data();
        const chapter = chapters.find((item) => item.id === data.chapterId);
        return {
          firebaseId: docSnap.id,
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
    const boards = new Set();
    const years = new Set();
    const topics = new Set();

    allQuestions.forEach((cq) => {
      cq.boards?.forEach((board) => {
        if (board.name) boards.add(board.name);
        if (board.year) years.add(normalizeYear(board.year));
      });
      if (cq.topic && (selectedChapter === 'all' || cq.chapterId === selectedChapter)) {
        topics.add(cq.topic);
      }
    });

    return {
      chapters: (subjectConfig?.chapters || []).map((chapter) => ({ value: chapter.id, label: chapter.title || chapter.name || chapter.id })),
      boards: Array.from(boards).map((board) => ({ value: board, label: board })),
      years: Array.from(years).sort((a, b) => Number(b) - Number(a)).map((year) => ({ value: year, label: year })),
      topics: Array.from(topics).map((topic) => ({ value: topic, label: topic })),
    };
  }, [allQuestions, subjectConfig, selectedChapter]);

  const renderFilters = () => (
    <>
      <FilterSelect value={selectedChapter} onChange={setSelectedChapter} options={[{ value: 'all', label: 'সব অধ্যায়' }, ...filterOptions.chapters]} />
      <FilterSelect value={selectedBoard} onChange={setSelectedBoard} options={[{ value: 'all', label: 'সব বোর্ড' }, ...filterOptions.boards]} />
      <FilterSelect value={selectedYear} onChange={setSelectedYear} options={[{ value: 'all', label: 'সব সাল' }, ...filterOptions.years]} />
      <FilterSelect value={selectedTopic} onChange={setSelectedTopic} options={[{ value: 'all', label: 'সব টপিক' }, ...filterOptions.topics]} />
    </>
  );

  const filteredQuestions = useMemo(() => {
    const search = searchQuery.toLowerCase();
    return allQuestions.filter((cq) => {
      const matchesSearch = !search ||
        cq.title?.toLowerCase().includes(search) ||
        cq.stem?.toLowerCase().includes(search) ||
        cq.topic?.toLowerCase().includes(search) ||
        Object.values(cq.questions || {}).some((item) => String(item).toLowerCase().includes(search));

      const matchesChapter = selectedChapter === 'all' || cq.chapterId === selectedChapter;
      const matchesBoard = selectedBoard === 'all' || cq.boards?.some((board) => board.name === selectedBoard);
      const matchesYear = selectedYear === 'all' || cq.boards?.some((board) => normalizeYear(board.year) === selectedYear);
      const matchesTopic = selectedTopic === 'all' || cq.topic === selectedTopic;

      return matchesSearch && matchesChapter && matchesBoard && matchesYear && matchesTopic;
    });
  }, [allQuestions, searchQuery, selectedChapter, selectedBoard, selectedYear, selectedTopic]);

  if (notFound) return <Navigate to="/academic/question-bank" replace />;

  return (
    <div className="min-h-screen bg-[#0b0f19] py-6 sm:py-8 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <Link to="/academic/question-bank" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold mb-6">
          <ArrowLeft className="w-4 h-4" />
          ড্যাশবোর্ডে ফিরুন
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{subjectConfig?.label || 'লোডিং...'} সৃজনশীল (CQ)</h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">Admin panel থেকে যোগ করা সকল CQ প্রশ্ন।</p>
          </div>
          <div className="inline-flex text-xs sm:text-sm bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-indigo-300 font-bold self-start md:self-center">
            মোট প্রশ্ন: {filteredQuestions.length} টি
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="p-4 sm:p-5 border shadow-xl bg-slate-800/20 backdrop-blur-xl border-slate-700/50 rounded-3xl relative z-40">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex items-center gap-3 w-full lg:w-auto flex-1">
              <div className="flex items-center bg-slate-900/50 border border-slate-700/50 rounded-full p-1.5 flex-1">
                <Search className="h-5 w-5 text-slate-400 ml-4 mr-2" />
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="প্রশ্ন বা টপিক খুঁজুন..." className="w-full bg-transparent border-none text-slate-100 text-sm sm:text-base focus:outline-none py-2 min-w-0" />
              </div>
              <button onClick={() => setShowAdvanceFilters(!showAdvanceFilters)} className="lg:hidden p-3.5 rounded-full border bg-slate-800/60 text-slate-300 border-slate-700/50 shrink-0 hover:bg-slate-700/50 transition-colors">
                <SlidersHorizontal className="h-5 w-5" />
              </button>
            </div>
            <div className="hidden lg:grid grid-cols-4 gap-3 flex-1">{renderFilters()}</div>
            {showAdvanceFilters && <div className="lg:hidden grid gap-3">{renderFilters()}</div>}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="text-slate-400 text-sm">প্রশ্ন লোড হচ্ছে...</p>
          </div>
        ) : filteredQuestions.length > 0 ? (
          <div className="flex flex-col gap-4 pb-8">
            {filteredQuestions.slice(0, visibleCount).map((cq, index) => <SharedCQItem key={cq.firebaseId || cq.id || index} cq={cq} index={index} />)}
            {visibleCount < filteredQuestions.length && (
              <div className="flex justify-center mt-4 mb-8">
                <button onClick={() => setVisibleCount((prev) => prev + 15)} className="px-6 py-2.5 bg-indigo-500/20 text-indigo-300 font-bold rounded-xl border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors">
                  আরও দেখুন
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 border border-slate-700/30 rounded-3xl bg-slate-800/10">
            <LayoutGrid className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-semibold">কোনো প্রশ্ন পাওয়া যায়নি</p>
          </div>
        )}
      </div>
    </div>
  );
}
