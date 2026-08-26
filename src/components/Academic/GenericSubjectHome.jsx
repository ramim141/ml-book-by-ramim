import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import {
  PlayCircle, FileText, HelpCircle, CheckCircle, BookOpen,
  ArrowUpRight, Layers, Video, ListChecks
} from 'lucide-react';
import { Skeleton, SkeletonGrid } from '../UI/Skeleton';
import SubjectWorkspace from './SubjectWorkspace';
import {
  VideoTabContent, NotesTabContent, MCQTabContent, CQTabContent, KnowledgeTabContent
} from './GenericChapterDetails';

const EMPTY_CONTENT = { videos: [], notes: [], cqs: [], mcqs: [], kQs: [] };

// The admin subject editor only offers these three levels, and each has a
// dashboard route at /academic/<level>. Used for the breadcrumb + back button.
const LEVEL_LABELS = {
  ssc: 'এসএসসি',
  hsc: 'এইচএসসি',
  admission: 'ভর্তি প্রস্তুতি'
};

/**
 * Subject dashboard for every SSC / HSC / admin-added subject.
 * Uses the shared SubjectWorkspace shell: chapters live in the smart filter
 * panel on the left, and each chapter's content opens inline in tabs rather
 * than navigating away to the chapter-detail route.
 */
export default function GenericSubjectHome({ subjectId, subjectPath }) {
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [activeTab, setActiveTab] = useState('videos');
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [subjectId]);

  // Subject meta + every content doc for the subject, grouped by chapter.
  // One read serves both the chapter badges and the inline tab content.
  const { data, isLoading, isError } = useQuery({
    queryKey: ['subject_home', subjectId],
    queryFn: async () => {
      const subSnap = await getDoc(doc(db, 'admin_settings', 'subjects'));
      let subData = null;
      if (subSnap.exists() && subSnap.data().list) {
        subData = subSnap.data().list.find(s => s.id === subjectId);
      }
      if (!subData) throw new Error('Subject not found');

      const contentSnap = await getDocs(
        query(collection(db, 'academic_content'), where('subject', '==', subjectId))
      );
      const docs = contentSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Group by the chapter's numeric part so that "chapter-1", "ch1" and "1"
      // all land on the same chapter — the same normalisation the chapter
      // detail page falls back to.
      const byChapter = {};
      docs.forEach(d => {
        const key = String(d.chapterId || '').replace(/\D/g, '') || d.chapterId;
        if (!key) return;
        if (!byChapter[key]) byChapter[key] = { videos: [], notes: [], cqs: [], mcqs: [], kQs: [] };
        if (d.type === 'video') byChapter[key].videos.push(d);
        else if (d.type === 'note') byChapter[key].notes.push(d);
        else if (d.type === 'cq') byChapter[key].cqs.push(d);
        else if (d.type === 'mcq') byChapter[key].mcqs.push(d);
        else if (d.type === 'knowledge') byChapter[key].kQs.push(d);
      });

      return { subject: subData, byChapter };
    }
  });

  const subject = data?.subject;
  const chapters = useMemo(() => subject?.chapters || [], [subject]);

  const chapterKey = (id) => String(id || '').replace(/\D/g, '') || id;

  useEffect(() => {
    if (chapters.length > 0) {
      const exists = chapters.some(c => c.id === selectedChapterId);
      if (!exists) setSelectedChapterId(chapters[0].id);
    }
  }, [chapters, selectedChapterId]);

  const currentChapter = useMemo(
    () => chapters.find(c => c.id === selectedChapterId) || chapters[0] || null,
    [chapters, selectedChapterId]
  );

  const chapterContent = useMemo(() => {
    if (!currentChapter || !data?.byChapter) return EMPTY_CONTENT;
    return data.byChapter[chapterKey(currentChapter.id)] || EMPTY_CONTENT;
  }, [currentChapter, data]);

  // The tab components expect one merged chapter object
  const mergedChapter = useMemo(
    () => ({ ...(currentChapter || {}), ...chapterContent }),
    [currentChapter, chapterContent]
  );

  // Reset the video player whenever the chapter changes
  useEffect(() => {
    setActiveVideo(chapterContent.videos[0] || null);
  }, [chapterContent]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-16">
        <Skeleton className="h-4 w-48 mb-8" />
        <Skeleton className="h-48 w-full rounded-3xl mb-12" />
        <Skeleton className="h-24 w-full rounded-2xl mb-12" />
        <Skeleton className="h-8 w-40 mb-6" />
        <SkeletonGrid count={6} columns="sm:grid-cols-2 lg:grid-cols-3" />
      </div>
    );
  }

  if (isError || !subject) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        বিষয় খুঁজে পাওয়া যায়নি।
      </div>
    );
  }

  const level = String(subject.level || '').toLowerCase();
  const levelLabel = LEVEL_LABELS[level] || subject.level;

  const totals = Object.values(data.byChapter || {}).reduce((acc, c) => ({
    videos: acc.videos + c.videos.length,
    notes: acc.notes + c.notes.length,
    cqs: acc.cqs + c.cqs.length,
    mcqs: acc.mcqs + c.mcqs.length
  }), { videos: 0, notes: 0, cqs: 0, mcqs: 0 });

  const CONTENT_TABS = [
    { key: 'videos', label: 'ভিডিও ক্লাস', icon: PlayCircle, count: mergedChapter.videos?.length || 0 },
    { key: 'notes', label: 'ক্লাস নোটস', icon: FileText, count: mergedChapter.notes?.length || 0 },
    { key: 'knowledge', label: 'জ্ঞান ও অনুধাবন', icon: BookOpen, count: mergedChapter.kQs?.length || 0 },
    { key: 'cqs', label: 'সৃজনশীল প্রশ্ন', icon: HelpCircle, count: mergedChapter.cqs?.length || 0 },
    { key: 'mcqs', label: 'বহুনির্বাচনী', icon: CheckCircle, count: mergedChapter.mcqs?.length || 0 }
  ];

  return (
    <SubjectWorkspace
      accent="indigo"
      storageKey={`subject_${subjectId}`}
      breadcrumbs={[
        { label: 'একাডেমিক', to: '/academic' },
        { label: levelLabel, to: `/academic/${level}` },
        { label: subject.label }
      ]}
      backLink={{ to: `/academic/${level}`, label: `${levelLabel}-এ ফিরে যান` }}
      primaryAction={{ to: `${subjectPath}/board-questions`, label: 'বোর্ড প্রশ্নাবলি', icon: FileText }}
      hero={{
        icon: BookOpen,
        title: subject.label,
        subtitle: 'বিগত সালের সকল বোর্ড প্রশ্ন ও অধ্যায়ভিত্তিক সম্পূর্ণ প্রস্তুতি।',
        chips: [
          ...(subject.emoji ? [{ label: `${subject.emoji} ${subject.label}`, tone: 'accent' }] : []),
          ...(levelLabel ? [{ label: levelLabel }] : [])
        ]
      }}
      stats={[
        { label: 'মোট অধ্যায়', value: `${chapters.length}টি`, icon: Layers, tone: 'text-indigo-300' },
        { label: 'ভিডিও', value: `${totals.videos}টি`, icon: Video, tone: 'text-sky-300' },
        { label: 'সৃজনশীল', value: `${totals.cqs}টি`, icon: HelpCircle, tone: 'text-emerald-300' },
        { label: 'MCQ', value: `${totals.mcqs}টি`, icon: ListChecks, tone: 'text-amber-300' }
      ]}
      chapters={chapters.map(ch => {
        const c = data.byChapter?.[chapterKey(ch.id)];
        const total = c ? c.videos.length + c.notes.length + c.cqs.length + c.mcqs.length + c.kQs.length : 0;
        return { id: ch.id, name: ch.title || ch.name, badge: total > 0 ? String(total) : null };
      })}
      selectedChapterId={currentChapter?.id || ''}
      onSelectChapter={(id) => {
        setSelectedChapterId(id);
        setActiveTab('videos');
      }}
      chapterHeading={currentChapter?.title || currentChapter?.name}
      chapterBadge={currentChapter ? `অধ্যায় ${chapters.findIndex(c => c.id === currentChapter.id) + 1}` : null}
      chapterAction={currentChapter && (
        <Link
          to={`${subjectPath}/${currentChapter.id}`}
          className="text-indigo-400 hover:text-indigo-300 text-xs font-bold transition flex items-center gap-1"
        >
          <span>মডেল টেস্ট ও আলোচনা</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      )}
      tabs={CONTENT_TABS}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      emptyState={(
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center space-y-3">
          <Layers className="w-9 h-9 text-slate-600 mx-auto" />
          <h4 className="text-sm sm:text-base font-bold text-slate-200">এই বিষয়ের অধ্যায় যুক্ত হচ্ছে</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            শীঘ্রই {subject.label} বিষয়ের অধ্যায়ভিত্তিক ভিডিও, নোটস ও প্রশ্ন যোগ করা হবে।
          </p>
        </div>
      )}
    >
      <div className="rounded-2xl bg-slate-900/60 border border-white/[0.08] p-3.5 sm:p-5">
        {activeTab === 'videos' && (
          <VideoTabContent chapter={mergedChapter} activeVideo={activeVideo} setActiveVideo={setActiveVideo} />
        )}
        {activeTab === 'notes' && <NotesTabContent chapter={mergedChapter} />}
        {activeTab === 'knowledge' && <KnowledgeTabContent chapter={mergedChapter} />}
        {activeTab === 'cqs' && <CQTabContent chapter={mergedChapter} />}
        {activeTab === 'mcqs' && <MCQTabContent chapter={mergedChapter} />}
      </div>
    </SubjectWorkspace>
  );
}
