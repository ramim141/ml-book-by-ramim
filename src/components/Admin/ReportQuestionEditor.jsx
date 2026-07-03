import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Loader2, Check, Save, Edit2, AlertCircle, X } from 'lucide-react';
import MarkdownRenderer from '../UI/MarkdownRenderer';

export default function ReportQuestionEditor({ report, onResolved }) {
  const [questionData, setQuestionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchQuestion() {
      if (!report.questionId) {
        setError('No Question ID provided');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const docRef = doc(db, 'academic_content', report.questionId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          if (!cancelled) {
            setQuestionData(snap.data());
            setFormData(snap.data());
          }
        } else if (report.questionData) {
          // Fallback to the question data attached to the report (for static JSON questions)
          if (!cancelled) {
            setQuestionData(report.questionData);
            setFormData(report.questionData);
            setIsFallback(true);
          }
        } else {
          if (!cancelled) setError('Question not found in database and no fallback data provided.');
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError('Error fetching question data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchQuestion();
    return () => { cancelled = true; };
  }, [report.questionId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      // Use setDoc with merge: true so it creates the doc if it doesn't exist
      await setDoc(doc(db, 'academic_content', report.questionId), formData, { merge: true });
      setQuestionData(formData);
      setIsEditing(false);
      if (onResolved) {
        onResolved(report.id);
      }
    } catch (err) {
      console.error(err);
      alert('Error saving the question.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 flex items-center justify-center gap-2 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /> Fetching question...</div>;
  }

  if (error) {
    return <div className="p-4 bg-rose-500/10 rounded-lg border border-rose-500/20 text-rose-400 flex items-center gap-2"><AlertCircle className="w-5 h-5" /> {error}</div>;
  }

  if (!questionData) return null;

  const renderMCQEditor = () => (
    <div className="space-y-4 mt-4">
      <div>
        <label className="text-xs text-slate-400 mb-1 block">Question</label>
        <textarea value={formData.question || ''} onChange={e => setFormData({...formData, question: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm min-h-[80px] text-slate-200 outline-none focus:border-indigo-500" />
      </div>
      <div>
        <label className="text-xs text-slate-400 mb-2 block">Options & Correct Answer</label>
        <div className="space-y-2">
          {(formData.options || ['', '', '', '']).map((opt, i) => (
            <div key={i} className="flex gap-3 items-center">
              <input type="radio" checked={formData.answer === i} onChange={() => setFormData({...formData, answer: i})} className="w-4 h-4 accent-emerald-500 shrink-0" />
              <input type="text" value={opt} onChange={e => {
                const newOpts = [...(formData.options || ['', '', '', ''])];
                newOpts[i] = e.target.value;
                setFormData({...formData, options: newOpts});
              }} className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500" />
            </div>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs text-slate-400 mb-1 block">Explanation</label>
        <textarea value={formData.explanation || ''} onChange={e => setFormData({...formData, explanation: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm min-h-[60px] text-slate-200 outline-none focus:border-indigo-500" />
      </div>
    </div>
  );

  const renderCQEditor = () => (
    <div className="space-y-4 mt-4">
      <div>
        <label className="text-xs text-slate-400 mb-1 block">Title</label>
        <input type="text" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-indigo-500" />
      </div>
      <div>
        <label className="text-xs text-slate-400 mb-1 block">Stem (উদ্দীপক)</label>
        <textarea value={formData.stem || ''} onChange={e => setFormData({...formData, stem: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm min-h-[100px] text-slate-200 outline-none focus:border-indigo-500" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['ka', 'kha', 'ga', 'gha'].map(key => {
          const labels = { ka: 'ক', kha: 'খ', ga: 'গ', gha: 'ঘ' };
          return (
            <div key={key} className="space-y-2 p-3 bg-slate-900/50 rounded-xl border border-slate-800">
              <h4 className="font-bold text-indigo-400">প্রশ্ন {labels[key]}</h4>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Question</label>
                <textarea value={formData.questions?.[key] || ''} onChange={e => setFormData({...formData, questions: {...(formData.questions || {}), [key]: e.target.value}})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 outline-none focus:border-indigo-500 min-h-[60px]" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Answer</label>
                <textarea value={formData.answers?.[key] || ''} onChange={e => setFormData({...formData, answers: {...(formData.answers || {}), [key]: e.target.value}})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 outline-none focus:border-emerald-500 min-h-[60px]" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderKQEditor = () => (
    <div className="space-y-4 mt-4">
      <div>
        <label className="text-xs text-slate-400 mb-1 block">Question</label>
        <textarea value={formData.question || ''} onChange={e => setFormData({...formData, question: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm min-h-[80px] text-slate-200 outline-none focus:border-indigo-500" />
      </div>
      <div>
        <label className="text-xs text-slate-400 mb-1 block">Answer</label>
        <textarea value={formData.answer || ''} onChange={e => setFormData({...formData, answer: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm min-h-[100px] text-slate-200 outline-none focus:border-emerald-500" />
      </div>
    </div>
  );

  const renderPreview = () => {
    const qType = questionData.type;
    return (
      <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-slate-800 text-sm">
        {qType === 'mcq' && (
          <div>
            <div className="font-bold text-slate-200 mb-3"><MarkdownRenderer content={questionData.question} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(questionData.options || []).map((opt, i) => (
                <div key={i} className={`p-2 rounded-lg border flex gap-2 ${i === questionData.answer ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
                  <span>{i+1}.</span> 
                  <div className="flex-1"><MarkdownRenderer content={opt} /></div>
                </div>
              ))}
            </div>
            {questionData.explanation && (
              <div className="mt-3 text-indigo-300 text-xs bg-indigo-500/10 p-2 rounded-lg">
                <MarkdownRenderer content={questionData.explanation} />
              </div>
            )}
          </div>
        )}
        
        {qType === 'cq' && (
          <div>
            <h4 className="font-bold text-slate-200 mb-2">{questionData.title}</h4>
            <div className="text-slate-300 mb-4 bg-slate-900/50 p-3 rounded-lg border border-slate-800"><MarkdownRenderer content={questionData.stem || ''} /></div>
            <div className="space-y-3">
              {['ka', 'kha', 'ga', 'gha'].map(key => {
                const labels = { ka: 'ক', kha: 'খ', ga: 'গ', gha: 'ঘ' };
                return questionData.questions?.[key] ? (
                  <div key={key} className="bg-slate-900/30 p-3 rounded-lg border border-slate-800/50">
                    <div className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold shrink-0">{labels[key]}.</span> 
                      <div className="flex-1 min-w-0 text-slate-300">
                        <MarkdownRenderer content={questionData.questions[key]} />
                      </div>
                    </div>
                    {questionData.answers?.[key] && (
                      <div className="mt-2 pl-4 border-l-2 border-slate-800 ml-1">
                        <div className="text-slate-400 text-xs">
                          <MarkdownRenderer content={questionData.answers[key]} />
                        </div>
                      </div>
                    )}
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        {qType === 'knowledge' && (
          <div>
            <div className="font-bold text-slate-200 mb-2"><MarkdownRenderer content={questionData.question} /></div>
            <div className="text-emerald-400 text-sm"><MarkdownRenderer content={questionData.answer} /></div>
          </div>
        )}

        {/* Fallback for other types */}
        {!['mcq', 'cq', 'knowledge'].includes(qType) && (
          <p className="text-slate-400 text-xs">Preview for type '{qType}' is not supported yet. Please edit manually.</p>
        )}
      </div>
    );
  };

  return (
    <div className="mt-4 bg-slate-900/80 border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="flex justify-between items-center p-3 bg-slate-800/80 border-b border-slate-700/50">
        <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-slate-400" />
          Question Preview
        </h4>
        <div>
          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-lg transition-colors">
            <Edit2 className="w-3.5 h-3.5" />
            Edit Question
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {isFallback && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-xs flex gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>This question is from a static JSON file. Editing it here will save it to the Firebase database, but to see the changes on the frontend, you must also update the source code (JSON files) and deploy.</p>
          </div>
        )}
        
        {renderPreview()}
        
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-800/50">
                <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-indigo-400" />
                  Edit Question
                </h3>
                <button onClick={() => { setIsEditing(false); setFormData(questionData); }} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 overflow-y-auto">
                {questionData.type === 'mcq' && renderMCQEditor()}
                {questionData.type === 'cq' && renderCQEditor()}
                {questionData.type === 'knowledge' && renderKQEditor()}
              </div>
              
              <div className="flex justify-end gap-3 p-4 border-t border-slate-700/50 bg-slate-800/30">
                <button onClick={() => { setIsEditing(false); setFormData(questionData); }} className="px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-slate-200 rounded-lg transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-emerald-500/20 disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save & Mark Resolved'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
