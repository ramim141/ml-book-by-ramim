import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { BookOpen, ChevronRight, FileText, ArrowRight, PlayCircle, CheckCircle, HelpCircle, Loader2 } from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useQuery } from '@tanstack/react-query';
import { Skeleton, SkeletonGrid } from '../UI/Skeleton';

const ChapterCard = ({ chapter, counts, subjectPath }) => {
  const vCount = counts?.videos || 0;
  const nCount = counts?.notes || 0;
  const mcqCount = counts?.mcqs || 0;
  const cqCount = counts?.cqs || 0;
  const kCount = counts?.kQs || 0;

  return (
    <Link
      to={`${subjectPath}/${chapter.id}`}
      className="flex flex-col h-full bg-slate-800/40 border border-slate-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 transition-all duration-300 hover:bg-slate-800 hover:border-indigo-500/30 sm:hover:-translate-y-1 active:scale-[0.98] group"
    >
      <div className="flex justify-between items-start gap-3 mb-3 sm:mb-4">
        <span className="text-xs sm:text-sm font-bold text-indigo-400 bg-indigo-500/10 px-2.5 sm:px-3 py-1 rounded-full border border-indigo-500/20 shrink-0">
          {chapter.name.split(':')[0]}
        </span>
      </div>
      
      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-4 group-hover:text-indigo-300 transition-colors leading-snug">
        {chapter.name.includes(':') ? chapter.name.split(':').slice(1).join(':').trim() : chapter.name}
      </h3>
      
      <div className="flex flex-wrap items-center gap-2 mb-4 mt-auto">
        {vCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-800/80 px-2 py-1 rounded border border-slate-700/50">
            <PlayCircle className="w-3.5 h-3.5 text-blue-400" /> {vCount} ভিডিও
          </div>
        )}
        {cqCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-800/80 px-2 py-1 rounded border border-slate-700/50">
            <FileText className="w-3.5 h-3.5 text-emerald-400" /> {cqCount} CQ
          </div>
        )}
        {mcqCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-800/80 px-2 py-1 rounded border border-slate-700/50">
            <CheckCircle className="w-3.5 h-3.5 text-amber-400" /> {mcqCount} MCQ
          </div>
        )}
        {kCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-800/80 px-2 py-1 rounded border border-slate-700/50">
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" /> {kCount} ক/খ
          </div>
        )}
        {nCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-800/80 px-2 py-1 rounded border border-slate-700/50">
            <FileText className="w-3.5 h-3.5 text-rose-400" /> {nCount} নোট
          </div>
        )}
      </div>

      <div className="flex items-center text-indigo-400 text-xs sm:text-sm font-medium gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
        অধ্যায় শুরু করুন <ChevronRight className="w-4 h-4" />
      </div>
    </Link>
  );
};

export default function GenericSubjectHome({ subjectId, subjectPath }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [subjectId]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['subject_home', subjectId],
    queryFn: async () => {
      // 1. Fetch Subject Info from admin_settings
      const subSnap = await getDoc(doc(db, 'admin_settings', 'subjects'));
      let subData = null;
      if (subSnap.exists() && subSnap.data().list) {
        subData = subSnap.data().list.find(s => s.id === subjectId);
      }
      if (!subData) {
        throw new Error('Subject not found');
      }

      // 2. Fetch all academic_content for this subject to compute counts
      const q = query(collection(db, 'academic_content'), where('subject', '==', subjectId));
      const contentSnap = await getDocs(q);
      const counts = {};
      
      contentSnap.forEach(docSnap => {
        const docData = docSnap.data();
        const chId = docData.chapterId;
        if (!chId) return;
        
        if (!counts[chId]) counts[chId] = { videos: 0, notes: 0, cqs: 0, mcqs: 0, kQs: 0 };
        if (docData.type === 'video') counts[chId].videos++;
        if (docData.type === 'note') counts[chId].notes++;
        if (docData.type === 'cq') counts[chId].cqs++;
        if (docData.type === 'mcq') counts[chId].mcqs++;
        if (docData.type === 'knowledge') counts[chId].kQs++;
      });

      const normalizedCounts = {};
      Object.keys(counts).forEach(key => {
        const numMatch = key.match(/\d+/);
        if (numMatch) {
          normalizedCounts[numMatch[0]] = counts[key];
        }
      });
      
      return { subject: subData, contentCounts: normalizedCounts };
    }
  });

  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-16">
      <Skeleton className="h-4 w-48 mb-8" />
      <Skeleton className="h-48 w-full rounded-3xl mb-12" />
      <Skeleton className="h-24 w-full rounded-2xl mb-12" />
      <Skeleton className="h-8 w-40 mb-6" />
      <SkeletonGrid count={6} columns="sm:grid-cols-2 lg:grid-cols-3" />
    </div>
  );
  if (isError || !data || !data.subject) return <div className="min-h-screen flex items-center justify-center text-slate-400">বিষয় খুঁজে পাওয়া যায়নি।</div>;

  const { subject, contentCounts } = data;
  const chapters = subject.chapters || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-16 font-bangla">
      <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-500 mb-5 sm:mb-8 font-medium flex-wrap">
        <Link to="/academic" className="hover:text-white transition-colors whitespace-nowrap">একাডেমিক</Link>
        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
        <Link to={`/academic/${String(subject.level || '').toLowerCase()}`} className="hover:text-white transition-colors whitespace-nowrap">{subject.level}</Link>
        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
        <span className="text-indigo-400 whitespace-nowrap">{subject.label}</span>
      </nav>

      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 mb-7 sm:mb-10 lg:mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-10 pointer-events-none">
          <BookOpen className="w-28 h-28 sm:w-40 sm:h-40 lg:w-48 lg:h-48 text-indigo-400" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <span className="bg-indigo-500/20 text-indigo-300 font-bold px-2.5 sm:px-3 py-1 rounded-md text-xs sm:text-sm border border-indigo-500/30">
              {subject.emoji} {subject.label}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-3 sm:mb-5 lg:mb-6 leading-tight">
            {subject.label}
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed">
            বিগত সালের সকল বোর্ড প্রশ্ন ও অধ্যায়ভিত্তিক সম্পূর্ণ প্রস্তুতি।
          </p>
        </div>
      </div>

      <Link to={`${subjectPath}/board-questions`} className="block mb-8 sm:mb-10 lg:mb-12">
        <div className="bg-gradient-to-r from-emerald-900/30 to-slate-800/50 border border-emerald-500/20 hover:border-emerald-500/50 rounded-2xl p-4 sm:p-6 lg:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 group transition-all active:scale-[0.99]">
          <div className="flex items-start sm:items-center gap-3 sm:gap-5 min-w-0">
            <div className="bg-emerald-500/10 p-3 sm:p-4 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform shrink-0">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-xl lg:text-2xl font-bold text-white mb-1">সম্পূর্ণ বোর্ড প্রশ্নাবলি</h3>
              <p className="text-slate-400 text-xs sm:text-sm lg:text-base">বিগত বছরের সকল বোর্ডের প্রশ্নপত্র ও সমাধান একত্রে দেখুন</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold group-hover:translate-x-1 transition-transform self-end sm:self-auto">
            <span className="text-sm sm:text-base">আর্কাইভ দেখুন</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </Link>

      <div className="mb-8">
        <h2 className="text-lg sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
          সকল অধ্যায় <span className="text-slate-500 text-sm sm:text-lg font-medium">({chapters.length})</span>
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {chapters.map((chapter) => {
            const numMatch = chapter.id.match(/\d+/);
            const numKey = numMatch ? numMatch[0] : chapter.id;
            const counts = contentCounts[numKey] || {};
            return <ChapterCard key={chapter.id} chapter={chapter} counts={counts} subjectPath={subjectPath} />;
          })}
        </div>
      </div>
    </div>
  );
}
