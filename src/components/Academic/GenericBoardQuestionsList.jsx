import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, ArrowLeft, FileText, Loader2, Database } from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useQuery } from '@tanstack/react-query';
import { SkeletonGrid } from '../UI/Skeleton';
const enToBnNumber = (numStr) => {
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(numStr).replace(/[0-9]/g, w => bn[w]);
};

export default function GenericBoardQuestionsList({ subjectId, subjectPath }) {
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedBoard, setSelectedBoard] = useState('all');
  const [selectedChapter, setSelectedChapter] = useState('all');
  const navigate = useNavigate();

  const { data, isLoading: loadingCqs } = useQuery({
    queryKey: ['board_questions', subjectId],
    queryFn: async () => {
      // Fetch Subject Info
      const snap = await getDoc(doc(db, 'admin_settings', 'subjects'));
      let subjectTitle = '';
      let chapters = [];
      if (snap.exists() && snap.data().list) {
        const sub = snap.data().list.find(s => s.id === subjectId);
        if (sub) {
          subjectTitle = sub.label;
          if (sub.chapters) chapters = sub.chapters;
        }
      }

      // Fetch CQs from Firestore
      const q = query(
        collection(db, "academic_content"),
        where("subject", "==", subjectId),
        where("type", "==", "cq")
      );
      const cqSnap = await getDocs(q);
      
      const grouped = {};
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
          let chapterId = data.chapterId || data.chapter;
          if (chapterId && chapterId.startsWith('chapter_')) {
            const num = parseInt(chapterId.split('_')[1], 10);
            chapterId = `chapter-${num}`;
          }
          if (!chapterId) chapterId = 'unknown';
          if (!grouped[chapterId]) grouped[chapterId] = { chapter: chapterId, cqs: [] };
          grouped[chapterId].cqs.push({ ...data, firebaseId: docSnap.id, boards: boardList });
        }
      });

      return {
        subjectTitle,
        chapters,
        cqsDataWithChapter: Object.values(grouped)
      };
    }
  });

  const subjectTitle = data?.subjectTitle || '';
  const chapters = data?.chapters || [];
  const cqsDataWithChapter = data?.cqsDataWithChapter || [];

  const boardSet = useMemo(() => {
    const m = new Map();
    cqsDataWithChapter.forEach(({ chapter, cqs }) => {
      if (selectedChapter !== 'all' && chapter !== selectedChapter) return;
      cqs.forEach(cq => {
        if (cq.boards) {
          cq.boards.forEach(board => {
            if (!board.name || !board.year) return;
            const key = `${board.name}-${board.year}`;
            if (!m.has(key)) {
              m.set(key, {
                id: key,
                boardName: board.name,
                year: board.year,
                status: 'available',
                cqCount: 1
              });
            } else {
              m.get(key).cqCount += 1;
            }
          });
        }
      });
    });
    return Array.from(m.values()).sort((a, b) => b.year.localeCompare(a.year) || a.boardName.localeCompare(b.boardName));
  }, [cqsDataWithChapter, selectedChapter]);

  const uniqueYears = useMemo(() => Array.from(new Set(boardSet.map(b => b.year))).sort((a, b) => b.localeCompare(a)), [boardSet]);
  const uniqueBoards = useMemo(() => Array.from(new Set(boardSet.map(b => b.boardName))).sort(), [boardSet]);

  const filteredBoards = useMemo(() => {
    return boardSet.filter(b => {
      if (selectedYear !== 'all' && b.year !== selectedYear) return false;
      if (selectedBoard !== 'all' && b.boardName !== selectedBoard) return false;
      return true;
    });
  }, [boardSet, selectedYear, selectedBoard]);

  return (
    <div className="min-h-screen bg-[#0a0f1c] pb-20 pt-24 font-bangla">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(subjectPath)}
                className="p-2 sm:p-2.5 rounded-xl bg-slate-700/30 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all border border-slate-600/30"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <div>
                <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {subjectTitle || 'লোডিং...'} বোর্ড প্রশ্নাবলি
                </h1>
                <p className="text-slate-400 text-sm mt-1">বিগত সালের বোর্ড প্রশ্নপত্রের পূর্ণাঙ্গ সমাধান</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-semibold border border-emerald-500/20">
              <FileText className="w-4 h-4" />
              মোট {boardSet.length} টি প্রশ্নপত্র
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/30 border border-slate-700/40 rounded-2xl p-4 sm:p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="col-span-2 sm:col-span-1">
              <select 
                value={selectedChapter} 
                onChange={(e) => setSelectedChapter(e.target.value)} 
                className="w-full bg-[#0f172a] border border-slate-700/80 hover:border-indigo-500/50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 text-slate-200 text-sm outline-none transition-all shadow-sm cursor-pointer"
              >
                <option value="all">সকল অধ্যায়</option>
                {chapters.map(c => <option key={c.id} value={c.id}>{c.title || c.name || c.id}</option>)}
              </select>
            </div>
            <div className="col-span-1">
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)} 
                className="w-full bg-[#0f172a] border border-slate-700/80 hover:border-indigo-500/50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 text-slate-200 text-sm outline-none transition-all shadow-sm cursor-pointer"
              >
                <option value="all">সকল সাল</option>
                {uniqueYears.map(y => <option key={y} value={y}>{enToBnNumber(y)}</option>)}
              </select>
            </div>
            <div className="col-span-1">
              <select 
                value={selectedBoard} 
                onChange={(e) => setSelectedBoard(e.target.value)} 
                className="w-full bg-[#0f172a] border border-slate-700/80 hover:border-indigo-500/50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 text-slate-200 text-sm outline-none transition-all shadow-sm cursor-pointer"
              >
                <option value="all">সকল বোর্ড</option>
                {uniqueBoards.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {loadingCqs ? (
          <div className="py-4"><SkeletonGrid count={8} columns="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" /></div>
        ) : filteredBoards.length === 0 ? (
          <div className="text-center py-20 text-slate-400 bg-slate-800/20 rounded-2xl border border-slate-700/50">
            <Database className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">কোনো বোর্ড প্রশ্ন পাওয়া যায়নি</p>
            <p className="text-sm mt-1">দয়া করে অন্য ফিল্টার চেষ্টা করুন</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredBoards.map(board => (
              <Link 
                key={board.id} 
                to={`${subjectPath}/board-questions/${encodeURIComponent(board.boardName)}/${board.year}`}
                className="group relative bg-slate-800/40 hover:bg-slate-800/80 rounded-2xl p-5 border border-slate-700/50 hover:border-indigo-500/30 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-lg border border-indigo-500/20">
                    {enToBnNumber(board.year.slice(-2))}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{board.boardName}</h3>
                    <p className="text-slate-400 text-sm mt-0.5">{enToBnNumber(board.year)} সাল • {enToBnNumber(board.cqCount)} টি প্রশ্ন</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
