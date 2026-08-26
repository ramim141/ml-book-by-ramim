import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { doc, getDoc, updateDoc, increment, collection, getDocs } from 'firebase/firestore';
import { Swords, Zap, CheckCircle, X as CloseIcon, Flame, Gift } from 'lucide-react';
import { optionsOf } from '../../lib/questionUtils';

const getDayOfYear = () => {
  const now = new Date();
  return Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
};

export default function DailyChallengeWidget() {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [dynamicChallenges, setDynamicChallenges] = useState([]);
  const [profileData, setProfileData] = useState(null);
  
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [challengeSubmitted, setChallengeSubmitted] = useState(false);
  const [xpMsg, setXpMsg] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch user profile
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setProfileData(userDoc.data());
        }
        
        // Fetch challenges
        const challengesSnap = await getDocs(collection(db, 'daily_challenges'));
        setDynamicChallenges(challengesSnap.docs.map(d => d.data()));
      } catch (err) {
        console.error("Error fetching daily challenge data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser]);

  if (!currentUser || loading || !profileData) return null;

  const today = new Date().toDateString();
  const availableChallenges = dynamicChallenges.filter(c => c.level === profileData.educationLevel);
  // Fallback to all challenges if none match the exact level
  const usableChallenges = availableChallenges.length > 0 ? availableChallenges : dynamicChallenges;
  const todayQuestion = usableChallenges.length > 0 
    ? usableChallenges[getDayOfYear() % usableChallenges.length] 
    : null;
    
  const lastChallenge = profileData.lastDailyChallenge;
  const challengeCompletedToday = lastChallenge?.date === today;
  
  // If no questions are available for the user's level, we will show an empty state inside the modal

  // If already completed, set the state so it shows the completion view
  if (challengeCompletedToday && !challengeSubmitted) {
    setChallengeSubmitted(true);
    setSelectedAnswer(lastChallenge.answer);
  }

  const handleChallengeSubmit = async () => {
    if (selectedAnswer === null || challengeCompletedToday) return;
    const isCorrect = selectedAnswer === todayQuestion.answer;
    const xpEarned = isCorrect ? 25 : 5;
    const challengeRecord = { 
      date: today, 
      answer: selectedAnswer, 
      correct: isCorrect, 
      questionIdx: getDayOfYear() % usableChallenges.length 
    };

    try {
      const docRef = doc(db, 'users', currentUser.uid);
      await updateDoc(docRef, {
        lastDailyChallenge: challengeRecord,
        xp: increment(xpEarned),
        ...(isCorrect ? { 'badges.daily_challenge': true } : {}),
      });
      setProfileData(prev => ({
        ...prev,
        lastDailyChallenge: challengeRecord,
        xp: (prev.xp || 0) + xpEarned,
      }));
      setChallengeSubmitted(true);
      setXpMsg(`+${xpEarned} XP ${isCorrect ? '🎉 সঠিক উত্তর!' : '(চেষ্টার জন্য)'}`);
      setTimeout(() => setXpMsg(''), 4000);
    } catch (err) { console.error(err); }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && !challengeCompletedToday && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white rounded-full p-3 sm:p-4 shadow-[0_0_20px_rgba(192,38,211,0.4)] hover:scale-105 hover:shadow-[0_0_30px_rgba(192,38,211,0.6)] transition-all duration-300 animate-bounce"
        >
          <div className="relative">
            <Swords className="h-6 w-6 sm:h-7 sm:w-7" />
            <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 flex h-3.5 w-3.5 sm:h-4 sm:w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-full w-full bg-amber-500 border border-slate-900"></span>
            </span>
          </div>
        </button>
      )}
      
      {!isOpen && challengeCompletedToday && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-slate-800 text-emerald-400 rounded-full p-3 sm:p-4 shadow-lg border border-emerald-500/30 hover:bg-slate-700 transition-all duration-300"
        >
          <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7" />
        </button>
      )}

      {/* Modal / Widget Body */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" 
            onClick={() => setIsOpen(false)}
          ></div>
          
          <div className="relative z-10 w-full max-w-md bg-[#0f172a] border border-indigo-500/30 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Swords className="h-6 w-6 text-fuchsia-400" /> দৈনিক চ্যালেঞ্জ
              </h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
              >
                <CloseIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {!challengeSubmitted && (
                <p className="text-slate-400 text-sm mb-5">প্রতিদিন একটি নতুন প্রশ্ন। সঠিক উত্তরে <span className="text-yellow-400 font-bold">+25 XP</span>, চেষ্টার জন্য <span className="text-slate-300 font-bold">+5 XP</span>।</p>
              )}

              {xpMsg && (
                <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-center animate-in slide-in-from-top-2">
                  {xpMsg}
                </div>
              )}

              {todayQuestion ? (
                <div className="bg-gradient-to-br from-slate-900/80 to-indigo-950/40 border border-indigo-500/20 rounded-2xl p-5 mb-2">
                  {/* Subject badge */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-300 text-xs font-bold mb-4">
                    <Zap className="h-3.5 w-3.5" /> {todayQuestion.subject}
                  </span>

                  <p className="text-slate-100 text-[17px] font-bold mb-5 leading-relaxed">{todayQuestion.question}</p>
                  
                  {todayQuestion.imageUrl && (
                    <div className="mb-5 rounded-xl overflow-hidden border border-slate-700/50 bg-slate-900/50 flex justify-center max-h-[250px]">
                      <img src={todayQuestion.imageUrl} alt="Daily Challenge" className="max-w-full h-auto object-contain" />
                    </div>
                  )}

                  {/* Options */}
                  <div className="space-y-3 mb-5">
                    {optionsOf(todayQuestion).map((opt, idx) => {
                      let cls = 'border-slate-700/50 bg-slate-800/40 hover:border-indigo-500/50 hover:bg-indigo-500/5 cursor-pointer';
                      if (challengeSubmitted) {
                        if (idx === todayQuestion.answer) cls = 'border-emerald-500/60 bg-emerald-500/10 cursor-default';
                        else if (idx === selectedAnswer && idx !== todayQuestion.answer) cls = 'border-red-500/60 bg-red-500/10 cursor-default';
                        else cls = 'border-slate-700/30 bg-slate-800/20 opacity-50 cursor-default';
                      } else if (selectedAnswer === idx) {
                        cls = 'border-indigo-500/70 bg-indigo-500/10 cursor-pointer';
                      }
                      return (
                        <button
                          key={idx}
                          disabled={challengeSubmitted}
                          onClick={() => !challengeSubmitted && setSelectedAnswer(idx)}
                          className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium text-slate-200 transition-all ${cls}`}
                        >
                          <span className="mr-2 font-bold text-slate-400">{['ক', 'খ', 'গ', 'ঘ'][idx]})</span> {opt}
                          {challengeSubmitted && idx === todayQuestion.answer && <CheckCircle className="inline h-4 w-4 text-emerald-400 ml-2" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {challengeSubmitted && (
                    <div className="mb-5 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl animate-in fade-in duration-300">
                      <p className="text-slate-300 text-sm"><span className="font-bold text-indigo-300">ব্যাখ্যা:</span> {todayQuestion.explanation}</p>
                    </div>
                  )}

                  {/* Submit or status */}
                  {!challengeSubmitted ? (
                    <button
                      onClick={handleChallengeSubmit}
                      disabled={selectedAnswer === null}
                      className="w-full py-3.5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl font-bold transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                      <Swords className="h-5 w-5" /> উত্তর জমা দাও
                    </button>
                  ) : (
                    <div className={`text-center py-3 rounded-xl font-bold text-sm ${lastChallenge?.correct ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'}`}>
                      {lastChallenge?.correct ? '🎉 চমৎকার! সঠিক উত্তর দিয়েছ!' : '💪 চেষ্টার জন্য ধন্যবাদ! আবার চেষ্টা করো!'} <br/> আগামীকাল নতুন প্রশ্ন আসবে।
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 text-center mt-4">
                  <Swords className="h-12 w-12 text-slate-500 mx-auto mb-3 opacity-50" />
                  <h3 className="text-lg font-bold text-slate-300">আজকের জন্য কোনো চ্যালেঞ্জ নেই</h3>
                  <p className="text-slate-500 text-sm mt-1">পরবর্তীতে আবার চেক করুন।</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
