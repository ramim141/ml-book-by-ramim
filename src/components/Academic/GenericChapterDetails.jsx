import { useState, Suspense, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link, Navigate } from 'react-router-dom';
import SharedMCQItem from './SharedMCQItem';
import SharedCQItem from './SharedCQItem';
import SharedKQItem from './SharedKQItem';
import DiscussionTabContent from './DiscussionTabContent';
import { ChevronRight, PlayCircle, FileText, HelpCircle, CheckCircle, ArrowLeft, Timer, Loader2, BookOpen, Menu, X, MessageSquare } from 'lucide-react';
import { collection, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (m) return 'https://www.youtube.com/embed/' + m[1];
  return url;
}

function VideoTabContent({ chapter, activeVideo, setActiveVideo }) {
  if (!chapter.videos?.length) {
    return (<div className='flex flex-col items-center justify-center py-24 text-slate-500'>
      <PlayCircle className='w-14 h-14 mb-4 opacity-20' />
      <h3 className='text-lg font-bold text-slate-300 mb-1'>ভিডিও লেকচার তৈরি হচ্ছে</h3>
      <p className='text-sm'>এই টপিকের ভিডিওটি খুব শীঘ্রই যুক্ত করা হবে।</p>
    </div>);
  }
  const embedUrl = activeVideo ? getYouTubeEmbedUrl(activeVideo.url) : null;
  return (<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
    <div className='lg:col-span-2'>
      {embedUrl ? (<div className='aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-800'>
        <iframe src={embedUrl} title={activeVideo?.title || 'Video'} className='w-full h-full' allowFullScreen />
      </div>) : (<div className='aspect-video rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center'><PlayCircle className='w-16 h-16 text-slate-700' /></div>)}
      {activeVideo && <h3 className='text-lg font-bold text-white mt-4'>{activeVideo.title}</h3>}
    </div>
    <div className='bg-slate-900/60 border border-slate-800 rounded-2xl p-4'>
      <h4 className='text-sm font-bold text-slate-400 mb-3'>ভিডিও লেকচার সমূহ ({chapter.videos.length}টি)</h4>
      <div className='space-y-2'>
        {chapter.videos.map((v, i) => (<button key={v.id || i} onClick={() => setActiveVideo(v)}
          className={'w-full text-left p-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ' + (activeVideo?.url === v.url ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300' : 'bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-800')}>
          <span className='w-7 h-7 shrink-0 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold'>{i + 1}</span>
          <span className='line-clamp-2'>{v.title}</span>
        </button>))}
      </div>
    </div>
  </div>);
}

function NotesTabContent({ chapter }) {
  const [selectedNote, setSelectedNote] = useState(chapter.notes?.[0] || null);
  useEffect(() => { if (chapter.notes?.length > 0) setSelectedNote(chapter.notes[0]); }, [chapter.notes]);
  if (!chapter.notes?.length) return (<div className='flex flex-col items-center justify-center py-24 text-slate-500'><FileText className='w-14 h-14 mb-4 opacity-20' /><h3 className='text-lg font-bold text-slate-300 mb-1'>ক্লাস নোটস তৈরি হচ্ছে</h3><p className='text-sm'>শীঘ্রই নোটস যুক্ত করা হবে।</p></div>);
  return (<div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
    <div className='lg:col-span-1 space-y-2'>
      {chapter.notes.map((n, i) => (<button key={n.id || i} onClick={() => setSelectedNote(n)}
        className={'w-full text-left p-3 rounded-xl text-sm font-medium transition-all ' + (selectedNote?.id === n.id ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300' : 'bg-slate-900/60 border border-slate-800 text-slate-300 hover:bg-slate-800')}>
        <FileText className='w-4 h-4 inline mr-2 opacity-60' />{n.title}
      </button>))}
    </div>
    <div className='lg:col-span-3 bg-slate-900/60 border border-slate-800 rounded-2xl p-6'>
      {selectedNote ? (<><h3 className='text-xl font-bold text-white mb-6'>{selectedNote.title}</h3><div className='text-sm text-slate-300 whitespace-pre-wrap leading-relaxed'>{selectedNote.content}</div></>) : (<p className='text-slate-500 text-center py-12'>বাম থেকে একটি নোট সিলেক্ট করুন।</p>)}
    </div>
  </div>);
}

function MCQTabContent({ chapter }) {
  const mcqs = chapter.mcqs || [];
  const [visibleCount, setVisibleCount] = useState(10);
  
  if (!mcqs.length) return (<div className='flex flex-col items-center justify-center py-24 text-slate-500'><CheckCircle className='w-14 h-14 mb-4 opacity-20' /><h3 className='text-lg font-bold text-slate-300 mb-1'>MCQ প্রশ্ন যুক্ত হচ্ছে</h3><p className='text-sm'>শীঘ্রই MCQ যুক্ত করা হবে।</p></div>);
  
  return (
    <div className='max-w-4xl mx-auto'>
      <div className='flex flex-col gap-4'>
        {mcqs.slice(0, visibleCount).map((mcq, i) => (
          <SharedMCQItem key={mcq.id || mcq.firebaseId || i} mcq={mcq} index={i} chapterName={chapter.title || chapter.name} />
        ))}
      </div>
      
      {visibleCount < mcqs.length && (
        <div className="flex justify-center mt-8 mb-8">
          <button
            onClick={() => setVisibleCount(prev => prev + 10)}
            className="px-6 py-2.5 bg-indigo-500/20 text-indigo-300 font-bold rounded-xl border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors"
          >
            আরও দেখুন ({mcqs.length - visibleCount} টি বাকি)
          </button>
        </div>
      )}
    </div>
  );
}

function CQTabContent({ chapter }) {
  const cqs = chapter.cqs || [];
  const [visibleCount, setVisibleCount] = useState(10);
  
  if (!cqs.length) return (<div className='flex flex-col items-center justify-center py-24 text-slate-500'><HelpCircle className='w-14 h-14 mb-4 opacity-20' /><h3 className='text-lg font-bold text-slate-300 mb-1'>সৃজনশীল প্রশ্ন যুক্ত হচ্ছে</h3><p className='text-sm'>শীঘ্রই সৃজনশীল প্রশ্ন যুক্ত করা হবে।</p></div>);
  
  return (
    <div className='max-w-4xl mx-auto'>
      <div className='space-y-4'>
        {cqs.slice(0, visibleCount).map((cq, i) => (
          <SharedCQItem key={cq.id || cq.firebaseId || i} cq={cq} index={i} chapterName={chapter.title || chapter.name} />
        ))}
      </div>
      
      {visibleCount < cqs.length && (
        <div className="flex justify-center mt-8 mb-8">
          <button
            onClick={() => setVisibleCount(prev => prev + 10)}
            className="px-6 py-2.5 bg-indigo-500/20 text-indigo-300 font-bold rounded-xl border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors"
          >
            আরও দেখুন ({cqs.length - visibleCount} টি বাকি)
          </button>
        </div>
      )}
    </div>
  );
}

function KnowledgeTabContent({ chapter }) {
  const kQs = chapter.kQs || [];
  const [visibleCount, setVisibleCount] = useState(10);
  
  if (!kQs.length) return (<div className='flex flex-col items-center justify-center py-24 text-slate-500'><BookOpen className='w-14 h-14 mb-4 opacity-20' /><h3 className='text-lg font-bold text-slate-300 mb-1'>জ্ঞান ও অনুধাবন যুক্ত হচ্ছে</h3><p className='text-sm'>শীঘ্রই এই বিভাগে প্রশ্ন যুক্ত করা হবে।</p></div>);
  
  return (
    <div className='max-w-4xl mx-auto'>
      <div className='space-y-4'>
        {kQs.slice(0, visibleCount).map((kq, i) => (
          <SharedKQItem key={kq.id || kq.firebaseId || i} kq={kq} chapterName={chapter.title || chapter.name} />
        ))}
      </div>
      
      {visibleCount < kQs.length && (
        <div className="flex justify-center mt-8 mb-8">
          <button
            onClick={() => setVisibleCount(prev => prev + 10)}
            className="px-6 py-2.5 bg-indigo-500/20 text-indigo-300 font-bold rounded-xl border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors"
          >
            আরও দেখুন ({kQs.length - visibleCount} টি বাকি)
          </button>
        </div>
      )}
    </div>
  );
}

function ModelTestTabContent({ chapter }) {
  const allMcqs = chapter.mcqs || [];
  const { currentUser } = useAuth();
  
  const [isConfigured, setIsConfigured] = useState(false);
  const [config, setConfig] = useState({ questionCount: Math.min(10, allMcqs.length), timePerQuestion: 1 });
  const [testMcqs, setTestMcqs] = useState([]);
  
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  if (!allMcqs.length) return (<div className='flex flex-col items-center justify-center py-24 text-slate-500'><Timer className='w-14 h-14 mb-4 opacity-20' /><h3 className='text-lg font-bold text-slate-300 mb-1'>মডেল টেস্ট তৈরি হচ্ছে</h3><p className='text-sm'>MCQ যুক্ত হলে মডেল টেস্ট স্বয়ংক্রিয়ভাবে সক্রিয় হবে।</p></div>);

  // Timer logic
  useEffect(() => {
    let timer;
    if (isConfigured && !submitted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isConfigured, submitted, timeLeft]);

  const handleSubmit = async () => {
    if (submitted) return;
    setSubmitted(true);
    
    // Calculate score
    const currentScore = testMcqs.reduce((acc,q,i) => acc + (answers[i] === q.answer ? 1 : 0), 0);
    const xpToAward = currentScore * 2; // 2 XP per correct answer
    
    if (currentUser && xpToAward > 0) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          xp: increment(xpToAward)
        });
        // Optional: you could add a toast here for XP gained
      } catch (err) {
        console.error("Error awarding XP:", err);
      }
    }
  };

  const startTest = () => {
    // Randomly pick questions
    const shuffled = [...allMcqs].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, config.questionCount);
    
    setTestMcqs(selected);
    setTimeLeft(config.questionCount * config.timePerQuestion * 60);
    setIsConfigured(true);
    setAnswers({});
    setSubmitted(false);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isConfigured) {
    return (
      <div className='max-w-md mx-auto bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl mt-4'>
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center shadow-inner">
            <Timer className="w-6 h-6" />
          </div>
        </div>
        <h3 className="text-xl font-black text-white text-center mb-1">কাস্টম মডেল টেস্ট</h3>
        <p className="text-slate-400 text-center text-xs mb-5">তোমার পছন্দমতো প্রশ্ন সংখ্যা ও সময় নির্ধারণ করে পরীক্ষা শুরু করো।</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">কতগুলো প্রশ্নের পরীক্ষা দিতে চাও?</label>
            <div className="grid grid-cols-4 gap-2">
              {[10, 15, 20, 25].map(num => (
                <button
                  key={num}
                  disabled={allMcqs.length < num}
                  onClick={() => setConfig({ ...config, questionCount: num })}
                  className={`py-1.5 rounded-lg text-sm font-bold transition-colors ${
                    config.questionCount === num 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            {allMcqs.length < 25 && <p className="text-[10px] text-amber-500/80 mt-1.5">এই অধ্যায়ে মোট {allMcqs.length} টি প্রশ্ন আছে।</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">প্রতিটি প্রশ্নের জন্য সময়</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setConfig({ ...config, timePerQuestion: 0.5 })}
                className={`py-1.5 rounded-lg text-sm font-bold transition-colors ${
                  config.timePerQuestion === 0.5 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                ৩০ সেকেন্ড
              </button>
              <button
                onClick={() => setConfig({ ...config, timePerQuestion: 1 })}
                className={`py-1.5 rounded-lg text-sm font-bold transition-colors ${
                  config.timePerQuestion === 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                ১ মিনিট
              </button>
            </div>
          </div>
        </div>

        <button 
          onClick={startTest}
          className="mt-6 w-full py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
        >
          পরীক্ষা শুরু করো
        </button>
      </div>
    );
  }

  const score = submitted ? testMcqs.reduce((acc,q,i) => acc+(answers[i]===q.answer?1:0),0) : 0;
  
  return (
    <div className='max-w-4xl mx-auto mt-4'>
      
      {/* Sticky Header with Timer */}
      <div className="sticky top-[85px] md:top-[140px] z-30 flex justify-end mb-4 pointer-events-none">
        <div className={`pointer-events-auto flex items-center gap-2 px-5 py-2 rounded-full font-bold shadow-lg backdrop-blur-md ${
          submitted 
            ? 'bg-emerald-900/80 text-emerald-400 border border-emerald-500/30' 
            : timeLeft < 60 
              ? 'bg-rose-900/80 text-rose-400 border border-rose-500/50 animate-pulse' 
              : 'bg-rose-900/80 text-rose-400 border border-rose-500/30'
        }`}>
          <Timer className="w-4 h-4" />
          <span className="tracking-wider">{submitted ? 'শেষ হয়েছে' : formatTime(timeLeft)}</span>
        </div>
      </div>

      {submitted && (
        <div className='mb-8 p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center shadow-lg'>
          <p className='text-4xl font-black text-emerald-400 mb-2'>{score} <span className="text-xl text-emerald-500/70">/ {testMcqs.length}</span></p>
          <p className='text-emerald-300 font-bold'>সঠিক উত্তর · {Math.round((score/testMcqs.length)*100)}% একিউরেসি</p>
          
          <button 
            onClick={() => setIsConfigured(false)}
            className="mt-6 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-colors border border-slate-700"
          >
            নতুন করে পরীক্ষা দিন
          </button>
        </div>
      )}
      
      <div className='space-y-5'>
        {testMcqs.map((q,i) => (
          <div key={i} className='bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-sm'>
            <p className='text-white text-sm font-medium mb-4'>{i+1}. {q.question}</p>
            <div className='grid grid-cols-1 gap-2'>
              {(q.options||[]).map((opt,j) => { 
                let cls='bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600'; 
                if(submitted){
                  if(j===q.answer) cls='bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold';
                  else if(answers[i]===j) cls='bg-rose-500/20 border-rose-500/50 text-rose-300';
                  else cls='bg-slate-800/30 border-slate-800/50 text-slate-500 opacity-50';
                } else if(answers[i]===j) {
                  cls='bg-indigo-500/20 border-indigo-500/50 text-indigo-300 font-bold ring-1 ring-indigo-500/50';
                } 
                
                return(
                  <button 
                    key={j} 
                    onClick={()=>!submitted&&setAnswers(a=>({...a,[i]:j}))} 
                    disabled={submitted}
                    className={'text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-start gap-3 ' + cls}
                  >
                    <span className={`w-5 h-5 flex items-center justify-center rounded-md text-xs shrink-0 ${submitted ? '' : answers[i]===j ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                      {['ক','খ','গ','ঘ'][j]}
                    </span> 
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {!submitted && (
        <button 
          onClick={() => {
            if(Object.keys(answers).length < testMcqs.length) {
              if(!window.confirm(`তুমি এখনো ${testMcqs.length - Object.keys(answers).length} টি প্রশ্নের উত্তর দাওনি। জমা দিতে চাও?`)) return;
            }
            handleSubmit();
          }} 
          className='mt-8 w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-2'
        >
          <CheckCircle className="w-5 h-5" /> খাতা জমা দিন
        </button>
      )}
    </div>
  );
}

export default function GenericChapterDetails({ subjectId, chaptersData, backLink, subjectLabel, subjectLevel = 'hsc' }) {
  const { chapterId } = useParams();
  const baseChapter = chaptersData?.chapters?.find((c) => c.id === chapterId);
  const [activeTab, setActiveTab] = useState('videos');
  const [activeVideo, setActiveVideo] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: chapterContent = { videos: [], notes: [], cqs: [], mcqs: [], kQs: [] }, isLoading: loadingData } = useQuery({
    queryKey: ['chapter_content', subjectId, chapterId],
    queryFn: async () => {
      if (!chapterId || !subjectId) return { videos: [], notes: [], cqs: [], mcqs: [], kQs: [] };
      
      let snap = await getDocs(query(
        collection(db, 'academic_content'),
        where('subject', '==', subjectId),
        where('chapterId', '==', chapterId)
      ));

      if (snap.empty) {
        snap = await getDocs(query(
          collection(db, 'academic_content'),
          where('subject', '==', subjectId)
        ));
        const chapterNum = chapterId.replace(/\D/g, '');
        const allDocs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const filtered = allDocs.filter(d => {
          if (d.chapterId === chapterId) return true;
          const docNum = (d.chapterId || '').replace(/\D/g, '');
          return chapterNum && docNum === chapterNum;
        });
        snap = { docs: filtered.map(d => ({ id: d.id, data: () => d })) };
      }

      const docs = snap.docs.map(d => {
        const data = typeof d.data === 'function' ? d.data() : d;
        return { id: d.id, ...data };
      });

      const r = {
        videos: docs.filter(d => d.type === 'video'),
        notes: docs.filter(d => d.type === 'note'),
        cqs: docs.filter(d => d.type === 'cq'),
        mcqs: docs.filter(d => d.type === 'mcq'),
        kQs: docs.filter(d => d.type === 'knowledge'),
      };
      
      return r;
    },
    enabled: !!chapterId && !!subjectId
  });

  useEffect(() => {
    if (chapterContent?.videos?.length > 0 && !activeVideo) {
      setActiveVideo(chapterContent.videos[0]);
    }
  }, [chapterContent, activeVideo]);
  if (chaptersData && !baseChapter) return <Navigate to={backLink} replace />;
  const chapter = { ...(baseChapter||{}), ...chapterContent };
  const tabs = [
    { id:'videos', label:'ভিডিও ক্লাস', icon:PlayCircle, count:chapter.videos?.length||0 },
    { id:'notes', label:'ক্লাস নোটস', icon:FileText, count:chapter.notes?.length||0 },
    { id:'knowledge', label:'জ্ঞান ও অনুধাবন', icon:BookOpen, count:chapter.kQs?.length||0 },
    { id:'cqs', label:'সৃজনশীল প্রশ্ন', icon:HelpCircle, count:chapter.cqs?.length||0 },
    { id:'mcqs', label:'বহুনির্বাচনী (MCQ)', icon:CheckCircle, count:chapter.mcqs?.length||0 },
    { id:'modeltest', label:'মডেল টেস্ট', icon:Timer, count:chapter.mcqs?.length||0 },
    { id:'discussion', label:'প্রশ্ন ও আলোচনা', icon:MessageSquare, count:0 },
  ];
  return (<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-28 md:py-12 relative'>
    <nav className='flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-500 mb-5 sm:mb-6 font-medium flex-wrap'>
      <Link to='/academic' className='hover:text-white transition-colors whitespace-nowrap'>একাডেমিক</Link>
      <ChevronRight className='w-3 h-3 sm:w-4 sm:h-4 shrink-0' />
      <Link to={`/academic/${String(subjectLevel).toLowerCase()}`} className='hover:text-white transition-colors whitespace-nowrap'>{String(subjectLevel).toUpperCase()}</Link>
      <ChevronRight className='w-3 h-3 sm:w-4 sm:h-4 shrink-0' />
      <Link to={backLink} className='hover:text-white transition-colors whitespace-nowrap'>{subjectLabel}</Link>
      <ChevronRight className='w-3 h-3 sm:w-4 sm:h-4 shrink-0' />
      <span className='text-indigo-400 whitespace-nowrap'>{chapter.chapterNo || chapter.name || chapter.title || chapterId}</span>
    </nav>
    <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-10'>
      <div className='min-w-0'>
        <div className='flex items-center gap-2 sm:gap-3 mb-2'>
          <Link to={backLink} className='p-1.5 sm:p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors'><ArrowLeft className='w-4 h-4 sm:w-5 sm:h-5' /></Link>
          <span className='text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 sm:px-3 sm:py-1 rounded-md border border-indigo-500/20 text-xs sm:text-sm'>{chapter.chapterNo || chapter.name || chapter.title || chapterId}</span>
        </div>
        <h1 className='text-xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight'>{chapter.title || chapter.name || 'লোড হচ্ছে...'}</h1>
      </div>
    </div>
    {loadingData && <div className='flex items-center justify-center py-20'><Loader2 className='w-8 h-8 animate-spin text-indigo-400' /></div>}
    {!loadingData && (<>
      <div className='hidden md:flex overflow-x-auto hide-scrollbar mb-8 border-b border-slate-800 sticky top-[80px] z-40 bg-[#0b0f19]/95 backdrop-blur-md pt-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8'>
        <div className='flex gap-5 lg:gap-8 min-w-max px-1'>
          {tabs.map(tab => { const Icon=tab.icon; const isActive=activeTab===tab.id; return (<button key={tab.id} onClick={()=>setActiveTab(tab.id)} className={'flex items-center gap-2 pb-4 text-sm font-semibold transition-all relative '+(isActive?'text-indigo-400':'text-slate-400 hover:text-slate-200')}><Icon className='w-4 h-4' />{tab.label}{tab.count>0&&<span className={'px-2 py-0.5 rounded-full text-[10px] '+(isActive?'bg-indigo-500/20 text-indigo-300':'bg-slate-800 text-slate-500')}>{tab.count}</span>}{isActive&&<div className='absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full' />}</button>); })}
        </div>
      </div>
      <div className='md:hidden fixed bottom-5 right-4 z-50'>
        <div className={'absolute bottom-16 right-0 bg-slate-800 border border-slate-700 rounded-2xl shadow-xl w-60 max-h-72 overflow-y-auto flex flex-col gap-1 p-2 transition-all duration-300 origin-bottom-right '+(isMobileMenuOpen?'opacity-100 scale-100 pointer-events-auto':'opacity-0 scale-95 pointer-events-none')}>
          {tabs.map(tab => { const Icon=tab.icon; const isActive=activeTab===tab.id; return (<button key={tab.id} onClick={()=>{setActiveTab(tab.id);setIsMobileMenuOpen(false);}} className={'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left '+(isActive?'bg-indigo-500/20 text-indigo-400':'text-slate-300 hover:bg-slate-700')}><Icon className='w-4 h-4' />{tab.label}{tab.count>0&&<span className='ml-auto text-[10px] bg-slate-700 px-2 py-0.5 rounded-full'>{tab.count}</span>}</button>); })}
        </div>
        <button onClick={()=>setIsMobileMenuOpen(!isMobileMenuOpen)} className='bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center'>{isMobileMenuOpen?<X className='w-5 h-5' />:<Menu className='w-5 h-5' />}</button>
      </div>
      <div className='min-h-[420px] sm:min-h-[500px]'>
        <Suspense fallback={<div className='flex justify-center items-center h-64'><Loader2 className='w-8 h-8 animate-spin text-indigo-500' /></div>}>
          {activeTab==='videos' && <VideoTabContent chapter={chapter} activeVideo={activeVideo} setActiveVideo={setActiveVideo} />}
          {activeTab==='notes' && <NotesTabContent chapter={chapter} />}
          {activeTab==='cqs' && <CQTabContent chapter={chapter} />}
          {activeTab==='mcqs' && <MCQTabContent chapter={chapter} />}
          {activeTab==='knowledge' && <KnowledgeTabContent chapter={chapter} />}
          {activeTab==='modeltest' && <ModelTestTabContent chapter={chapter} />}
          {activeTab==='discussion' && <DiscussionTabContent chapter={chapter} subjectId={subjectId} chapterId={chapter.chapterNo || chapterId} />}
        </Suspense>
      </div>
    </>)}
  </div>);
}
