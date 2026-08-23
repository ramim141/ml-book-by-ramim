import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Trophy, Medal, ArrowLeft, Loader2, Crown, Star, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { Skeleton, SkeletonList } from '../../../components/UI/Skeleton';

const enToBnNumber = (numStr) => {
  if (!numStr) return numStr;
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(numStr).replace(/[0-9]/g, w => bn[w]);
};

export default function LiveExamLeaderboard() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [examConfig, setExamConfig] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [examFinished, setExamFinished] = useState(false);
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [examId]);

  const fetchLeaderboard = async () => {
    try {
      const examDoc = await getDoc(doc(db, 'live_exams', examId));
      if (!examDoc.exists()) {
        navigate('/academic/live-exams');
        return;
      }
      
      const configData = examDoc.data();
      const endTime = configData.endTime?.toDate();
      const now = new Date();
      setExamConfig({ id: examDoc.id, ...configData, endTime });
      
      const isFinished = now > endTime;
      setExamFinished(isFinished);

      if (isFinished) {
        // Fetch all submissions, sort by totalScore desc, then submittedAt asc
        const q = query(
          collection(db, 'live_exams', examId, 'submissions'),
          orderBy('totalScore', 'desc'),
          orderBy('submittedAt', 'asc')
        );
        const snapshot = await getDocs(q);
        
        const data = [];
        let rank = 1;
        snapshot.docs.forEach((docSnap) => {
          const sData = docSnap.data();
          if (docSnap.id === currentUser?.uid) {
            setUserRank(rank);
          }
          data.push({
            id: docSnap.id,
            rank,
            ...sData
          });
          rank++;
        });
        
        setLeaderboard(data);
      }
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050914] pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-bangla">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-48 w-full rounded-3xl" />
          <SkeletonList count={6} />
        </div>
      </div>
    );
  }

  if (!examFinished) {
    return (
      <div className="min-h-screen bg-[#050914] flex flex-col items-center justify-center pt-20 px-4">
        <div className="bg-slate-900/80 p-8 rounded-3xl border border-slate-700/50 max-w-md w-full text-center">
          <Clock className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Results Not Published Yet</h2>
          <p className="text-slate-400 mb-6">The global leaderboard will be available once the exam officially ends at {examConfig?.endTime?.toLocaleString()}.</p>
          <button onClick={() => navigate('/academic/live-exams')} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors">
            Back to Exams
          </button>
        </div>
      </div>
    );
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-amber-400" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-slate-300" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-orange-400" />;
    return <span className="font-bold text-slate-400 text-lg">{enToBnNumber(rank)}</span>;
  };

  const getRankStyle = (rank, isUser) => {
    let base = "flex items-center gap-4 p-4 sm:p-5 rounded-2xl border transition-all ";
    if (isUser) {
      base += "bg-indigo-500/20 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]";
    } else if (rank === 1) {
      base += "bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30";
    } else if (rank === 2) {
      base += "bg-slate-800/80 border-slate-600/50";
    } else if (rank === 3) {
      base += "bg-orange-500/10 border-orange-500/20";
    } else {
      base += "bg-slate-900/50 border-slate-800 hover:bg-slate-800";
    }
    return base;
  };

  return (
    <div className="min-h-screen bg-[#050914] pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-bangla">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-amber-500/20 blur-3xl rounded-full pointer-events-none"></div>
          
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4 relative z-10">
            <Trophy className="h-8 w-8 text-amber-400" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 relative z-10">
            Global Merit List
          </h1>
          <p className="text-slate-400 text-lg relative z-10 max-w-xl mx-auto line-clamp-2">
            {examConfig.title}
          </p>

          <div className="flex justify-center gap-4 mt-6 relative z-10">
            <button onClick={() => navigate('/academic/live-exams')} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-bold transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={() => navigate(`/academic/live-exam/${examId}/result`)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors">
              <Star className="w-4 h-4" /> My Result
            </button>
          </div>
        </div>

        {/* User Summary Stats (If user participated) */}
        {userRank && (
          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <p className="text-indigo-300 text-sm font-bold uppercase tracking-wider mb-1">Your Current Rank</p>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Crown className="w-6 h-6 text-indigo-400" />
                <span className="text-3xl font-black text-white">{enToBnNumber(userRank)}</span>
                <span className="text-slate-400">/ {enToBnNumber(leaderboard.length)}</span>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-indigo-300 text-sm font-bold uppercase tracking-wider mb-1">Your Score</p>
              <span className="text-3xl font-black text-white">
                {enToBnNumber(leaderboard.find(p => p.id === currentUser.uid)?.totalScore.toFixed(2))}
              </span>
            </div>
          </div>
        )}

        {/* Leaderboard List */}
        <div className="space-y-3">
          {leaderboard.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-800">
              <AlertCircle className="h-12 w-12 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400 font-medium text-lg">No one participated in this exam.</p>
            </div>
          ) : (
            leaderboard.map((participant) => {
              const isUser = participant.id === currentUser?.uid;
              return (
                <div key={participant.id} className={getRankStyle(participant.rank, isUser)}>
                  
                  {/* Rank Column */}
                  <div className="w-12 h-12 shrink-0 flex items-center justify-center bg-slate-900/50 rounded-xl border border-slate-700/50">
                    {getRankIcon(participant.rank)}
                  </div>

                  {/* Details Column */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold truncate text-base sm:text-lg ${isUser ? 'text-indigo-300' : 'text-slate-200'}`}>
                      {participant.userName || 'Student'} {isUser && '(You)'}
                    </h3>
                    <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md">
                        {enToBnNumber(participant.correct)} Correct
                      </span>
                      <span className="flex items-center gap-1.5 bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-md">
                        {enToBnNumber(participant.wrong)} Wrong
                      </span>
                    </div>
                  </div>

                  {/* Score Column */}
                  <div className="text-right shrink-0">
                    <p className="text-xs sm:text-sm text-slate-400 font-bold mb-0.5 uppercase">Score</p>
                    <p className={`text-xl sm:text-2xl font-black ${
                      participant.rank === 1 ? 'text-amber-400' : 
                      participant.rank === 2 ? 'text-slate-300' :
                      participant.rank === 3 ? 'text-orange-400' : 'text-white'
                    }`}>
                      {enToBnNumber(participant.totalScore.toFixed(2))}
                    </p>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
