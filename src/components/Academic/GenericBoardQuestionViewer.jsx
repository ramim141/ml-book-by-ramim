import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import 'katex/dist/katex.min.css';
import SharedCQItem from './SharedCQItem';
import { SkeletonList } from '../UI/Skeleton';

const enToBnNumber = (numStr) => {
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(numStr).replace(/[0-9]/g, w => bn[w]);
};

export default function GenericBoardQuestionViewer({ subjectId, subjectPath }) {
  const { boardName, year } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectTitle, setSubjectTitle] = useState('');
  const [chapters, setChapters] = useState([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    
    const fetchData = async () => {
      try {
        const snap = await getDoc(doc(db, 'admin_settings', 'subjects'));
        let foundChapters = [];
        if (snap.exists() && snap.data().list) {
          const sub = snap.data().list.find(s => s.id === subjectId);
          if (sub) {
            if (!cancelled) setSubjectTitle(sub.label);
            if (sub.chapters) {
              foundChapters = sub.chapters;
              if (!cancelled) setChapters(sub.chapters);
            }
          }
        }

        const q = query(
          collection(db, "academic_content"),
          where("subject", "==", subjectId),
          where("type", "==", "cq")
        );
        const cqSnap = await getDocs(q);
        
        const matchedQuestions = [];
        cqSnap.forEach(docSnap => {
          const data = docSnap.data();
          let boardList = [];
          if (data.boards && Array.isArray(data.boards)) {
            boardList = data.boards;
          } else if (data.board) {
            boardList = data.board.split(',').map(b => {
              const match = b.trim().match(/^(.*?)\s*([০-৯0-9]{4})$/);
              if (match) {
                return { name: match[1].trim(), year: match[2] };
              }
              return { name: b.trim(), year: 'অজানা' };
            });
          }

          if (boardList.length > 0) {
            const hasBoard = boardList.some(b => b.name === decodeURIComponent(boardName) && String(b.year) === String(year));
            if (hasBoard) {
              let chapterId = data.chapterId || data.chapter;
              if (chapterId && chapterId.startsWith('chapter_')) {
                const num = parseInt(chapterId.split('_')[1], 10);
                chapterId = `chapter-${num}`;
              }
              if (!chapterId) chapterId = 'unknown';
              const chName = foundChapters.find(c => c.id === chapterId)?.title || data.chapterName || `অধ্যায় ${chapterId}`;
              matchedQuestions.push({ ...data, firebaseId: docSnap.id, chapterId, chapterName: chName, boards: boardList });
            }
          }
        });

        if (!cancelled) {
          setQuestions(matchedQuestions);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setLoading(false);
      }
    };
    
    fetchData();
    return () => { cancelled = true; };
  }, [subjectId, boardName, year]);

  return (
    <div className="min-h-screen bg-[#0a0f1c] pb-24 pt-24 font-bangla">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-6 sm:mb-10">
          <button onClick={() => navigate(`${subjectPath}/board-questions`)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> ফিরে যান
          </button>
          
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-indigo-400 font-medium text-sm mb-2">
                  <FileText className="w-4 h-4" /> {subjectTitle || 'লোডিং...'}
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
                  {decodeURIComponent(boardName)} বোর্ড {enToBnNumber(year)}
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-4"><SkeletonList count={4} /></div>
        ) : questions.length === 0 ? (
          <div className="text-center py-20 text-slate-400 bg-slate-800/20 rounded-2xl border border-slate-700/50">
            <p className="text-lg font-medium">কোনো প্রশ্ন পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {questions.map((cq, idx) => (
              <div key={cq.firebaseId || idx} className="relative">
                <div className="absolute top-0 right-0 sm:-right-4 bg-slate-700/80 text-slate-300 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-bl-xl sm:rounded-full border-b border-l sm:border border-slate-600/50 shadow-lg z-10">
                  {cq.chapterName}
                </div>
                <SharedCQItem cq={cq} index={idx} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
