import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { MessageSquare, Send, User, Reply, Loader2, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { bn } from 'date-fns/locale';

export default function DiscussionTabContent({ chapter, subjectId, chapterId }) {
  const { currentUser } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null); // id of discussion being replied to
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    if (!chapterId || !subjectId) return;

    const q = query(
      collection(db, 'chapter_discussions'),
      where('subjectId', '==', subjectId),
      where('chapterId', '==', chapterId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort client-side by createdAt descending to avoid composite index requirement
      data.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
      
      setDiscussions(data);
      setLoading(false);
    }, (error) => {
      console.error("Discussion loading error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [subjectId, chapterId]);

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || !currentUser) return;

    try {
      setIsSubmitting(true);
      await addDoc(collection(db, 'chapter_discussions'), {
        subjectId,
        chapterId,
        studentId: currentUser.uid,
        studentName: currentUser.displayName || 'অজ্ঞাত শিক্ষার্থী',
        studentPhoto: currentUser.photoURL || null,
        questionText: newQuestion.trim(),
        createdAt: serverTimestamp(),
        replies: []
      });
      setNewQuestion('');
    } catch (error) {
      console.error("Error posting question:", error);
      alert("দুঃখিত, প্রশ্নটি পোস্ট করা যায়নি।");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = async (e, discussionId) => {
    e.preventDefault();
    if (!replyText.trim() || !currentUser || !discussionId) return;

    try {
      setSubmittingReply(true);
      const docRef = doc(db, 'chapter_discussions', discussionId);
      const newReply = {
        userId: currentUser.uid,
        userName: currentUser.displayName || 'অজ্ঞাত শিক্ষার্থী',
        userPhoto: currentUser.photoURL || null,
        text: replyText.trim(),
        createdAt: new Date().toISOString()
      };

      await updateDoc(docRef, {
        replies: arrayUnion(newReply)
      });
      
      setReplyText('');
      setReplyingTo(null);
    } catch (error) {
      console.error("Error posting reply:", error);
      alert("দুঃখিত, রিপ্লাই দেওয়া যায়নি।");
    } finally {
      setSubmittingReply(false);
    }
  };

  const formatTime = (dateInput) => {
    if (!dateInput) return '';
    // Handle Firestore Timestamp
    let date = dateInput?.toDate ? dateInput.toDate() : new Date(dateInput);
    try {
      return formatDistanceToNow(date, { addSuffix: true, locale: bn });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Ask Question Box */}
      <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4 sm:p-6 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-indigo-400" />
          তোমার ডাউট বা প্রশ্ন লেখো
        </h3>
        
        {!currentUser ? (
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-center text-indigo-300">
            প্রশ্ন করতে বা রিপ্লাই দিতে দয়া করে <a href="/login" className="font-bold underline underline-offset-2">লগইন</a> করো।
          </div>
        ) : (
          <form onSubmit={handleSubmitQuestion} className="space-y-3">
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="এই অধ্যায়ের কোনো টপিক বুঝতে সমস্যা হলে এখানে বিস্তারিত লিখে প্রশ্ন করো..."
              className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 resize-none min-h-[100px]"
              required
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !newQuestion.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                পোস্ট করুন
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Discussions Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : discussions.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 border border-slate-800 rounded-2xl">
            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">এখনও কোনো প্রশ্ন করা হয়নি।</p>
            <p className="text-slate-500 text-sm mt-1">প্রথম প্রশ্নটি তুমিই করো!</p>
          </div>
        ) : (
          discussions.map((discussion) => (
            <div key={discussion.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              
              {/* Question Header */}
              <div className="p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  {discussion.studentPhoto ? (
                    <img src={discussion.studentPhoto} alt={discussion.studentName} className="w-10 h-10 rounded-full border border-slate-700 object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-200 text-sm">{discussion.studentName}</h4>
                      <span className="text-xs text-slate-500">{formatTime(discussion.createdAt)}</span>
                    </div>
                    <p className="text-slate-300 mt-2 text-sm leading-relaxed whitespace-pre-wrap">
                      {discussion.questionText}
                    </p>
                  </div>
                </div>
              </div>

              {/* Replies Section */}
              <div className="bg-slate-950/50 border-t border-slate-800/50 p-4 sm:p-5">
                
                {/* Existing Replies */}
                {discussion.replies && discussion.replies.length > 0 && (
                  <div className="space-y-4 mb-4">
                    {discussion.replies.map((reply, idx) => (
                      <div key={idx} className="flex items-start gap-3 pl-2 sm:pl-4 border-l-2 border-slate-800">
                        {reply.userPhoto ? (
                          <img src={reply.userPhoto} alt={reply.userName} className="w-6 h-6 rounded-full border border-slate-700 object-cover shrink-0" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                            <User className="w-3 h-3 text-slate-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 bg-slate-800/40 rounded-xl p-3 border border-slate-700/30">
                          <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                            <span className="font-bold text-slate-300 text-xs">{reply.userName}</span>
                            <span className="text-[10px] text-slate-500">{formatTime(reply.createdAt)}</span>
                          </div>
                          <p className="text-slate-400 text-sm whitespace-pre-wrap">{reply.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Actions */}
                <div className="flex justify-between items-center mt-2 pl-2 sm:pl-4 border-l-2 border-transparent">
                  <span className="text-xs font-semibold text-slate-500">
                    {discussion.replies?.length || 0} টি রিপ্লাই
                  </span>
                  
                  {currentUser && replyingTo !== discussion.id && (
                    <button 
                      onClick={() => setReplyingTo(discussion.id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Reply className="w-3.5 h-3.5" /> রিপ্লাই দিন
                    </button>
                  )}
                </div>

                {/* Reply Form */}
                {replyingTo === discussion.id && (
                  <form onSubmit={(e) => handleReplySubmit(e, discussion.id)} className="mt-4 pl-2 sm:pl-4 border-l-2 border-indigo-500/30 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="আপনার উত্তর বা মতামত লিখুন..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={submittingReply || !replyText.trim()}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50 shrink-0"
                      >
                        {submittingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : 'সেন্ড'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setReplyingTo(null); setReplyText(''); }}
                        className="px-3 py-2 hover:bg-slate-800 text-slate-400 rounded-xl text-sm transition-colors"
                      >
                        বাতিল
                      </button>
                    </div>
                  </form>
                )}
                
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
