import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

const errorTypes = [
  { id: 'wrong_question', label: 'প্রশ্নে ভুল আছে' },
  { id: 'wrong_answer', label: 'উত্তরে ভুল আছে' },
  { id: 'spelling_mistake', label: 'টাইপিং বা বানান ভুল' },
  { id: 'other', label: 'অন্যান্য সমস্যা' }
];

export default function FeedbackModal({ isOpen, onClose, questionId, questionType, chapterId, subjectId, questionData }) {
  const [selectedType, setSelectedType] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedType) {
      setError('দয়া করে একটি কারণ নির্বাচন করুন।');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await addDoc(collection(db, 'reported_errors'), {
        questionId: questionId || 'Unknown',
        questionType: questionType || 'Unknown',
        chapterId: chapterId || 'Unknown',
        subjectId: subjectId || 'Unknown',
        questionData: questionData || null,
        errorType: selectedType,
        details: details.trim(),
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setSelectedType('');
        setDetails('');
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error submitting report:', err);
      setError('রিপোর্ট জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-bangla">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-lg font-bold">ভুল রিপোর্ট করুন</h3>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto overflow-x-hidden">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">ধন্যবাদ!</h4>
              <p className="text-slate-400 text-sm">আপনার রিপোর্টটি সফলভাবে জমা হয়েছে। আমরা দ্রুত এটি সমাধান করার চেষ্টা করবো।</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  কী ধরনের ভুল পেয়েছেন? <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-2">
                  {errorTypes.map((type) => (
                    <label 
                      key={type.id} 
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        selectedType === type.label 
                          ? 'bg-rose-500/10 border-rose-500/50 text-rose-300' 
                          : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="errorType"
                        value={type.label}
                        checked={selectedType === type.label}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-4 h-4 text-rose-500 bg-slate-900 border-slate-700 focus:ring-rose-500 focus:ring-offset-slate-900"
                      />
                      <span className="text-sm font-medium">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  বিস্তারিত (ঐচ্ছিক)
                </label>
                <textarea 
                  rows="3"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="ভুলটি সম্পর্কে বিস্তারিত লিখুন..."
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all resize-none"
                ></textarea>
              </div>

              {error && (
                <p className="text-xs text-rose-400 font-medium text-center">{error}</p>
              )}

              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-semibold text-sm hover:bg-slate-800 transition-colors"
                >
                  বাতিল
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  রিপোর্ট করুন
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
