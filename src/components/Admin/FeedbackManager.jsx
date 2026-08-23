import { useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { MessageSquareWarning, Check, Eye, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import ReportQuestionEditor from './ReportQuestionEditor';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useConfirm } from '../../hooks/useConfirm';

export default function FeedbackManager() {
  const queryClient = useQueryClient();
  const [confirm, confirmDialog] = useConfirm();
  const [expandedReportId, setExpandedReportId] = useState(null);

  const { data: reports, isLoading, isError } = useQuery({
    queryKey: ['admin_reports'],
    queryFn: async () => {
      const snap = await getDocs(query(collection(db, 'reported_errors'), orderBy('createdAt', 'desc')));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  });

  const resolveMutation = useMutation({
    mutationFn: async (id) => {
      await updateDoc(doc(db, 'reported_errors', id), { status: 'resolved' });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin_reports'] }),
    onError: () => toast.error('স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await deleteDoc(doc(db, 'reported_errors', id));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin_reports'] }),
    onError: (err) => console.error(err)
  });

  const markResolved = (id) => {
    resolveMutation.mutate(id);
  };

  const deleteReport = async (id) => {
    if (!(await confirm({ title: 'রিপোর্ট মুছে ফেলবেন?', message: 'রিপোর্টটি স্থায়ীভাবে মুছে যাবে।' }))) return;
    deleteMutation.mutate(id);
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  if (isError) return <div className="flex justify-center p-12 text-rose-500"><AlertTriangle className="w-8 h-8" /></div>;

  return (
    <div>
      {confirmDialog}
      <h2 className="text-xl font-bold flex items-center gap-2 mb-6"><MessageSquareWarning className="text-amber-400" /> স্টুডেন্ট রিপোর্ট ও ফিডব্যাক</h2>

      {reports.length === 0 ? (
        <div className="text-center p-12 bg-slate-800/30 rounded-xl border border-slate-700/50">
          <MessageSquareWarning className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-bold">এখনও কোনো রিপোর্ট নেই।</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className={`p-5 rounded-xl border ${report.status === 'resolved' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-800/50 border-amber-500/30'}`}>
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${report.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {report.status === 'resolved' ? 'Resolved' : 'Pending'}
                    </span>
                    <span className="text-slate-400 text-xs">
                      {report.createdAt ? report.createdAt.toDate().toLocaleString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Unknown Date'}
                    </span>
                  </div>
                  <h3 className="text-slate-200 font-bold text-lg">{report.errorType || 'Unknown Error'}</h3>
                  <p className="text-sm text-slate-400">Question ID: <span className="text-indigo-400 font-mono text-xs bg-indigo-500/10 px-1.5 py-0.5 rounded">{report.questionId}</span> ({report.questionType})</p>
                </div>
                <div className="flex gap-2 h-fit">
                  {report.status !== 'resolved' && (
                    <button onClick={() => markResolved(report.id)} className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors" title="Mark as Resolved">
                      <Check className="w-5 h-5" />
                    </button>
                  )}
                  <button onClick={() => setExpandedReportId(expandedReportId === report.id ? null : report.id)}
                    className={`p-2 rounded-lg transition-colors ${expandedReportId === report.id ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}>
                    <Eye className="w-5 h-5" />
                  </button>
                  <button onClick={() => deleteReport(report.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 mb-3">
                <span className="text-xs font-bold text-slate-500 mb-2 block">Context:</span>
                <div className="flex gap-3 text-xs text-slate-400">
                  <span className="bg-slate-800 px-2 py-1 rounded">Subject: {report.subjectId}</span>
                  <span className="bg-slate-800 px-2 py-1 rounded">Chapter: {report.chapterId}</span>
                </div>
              </div>

              {report.details && (
                <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/20 mb-3">
                  <span className="text-xs font-bold text-amber-500 mb-1 block">Details:</span>
                  <p className="text-amber-100 text-sm whitespace-pre-wrap">{report.details}</p>
                </div>
              )}

              {expandedReportId === report.id && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <ReportQuestionEditor report={report} onResolved={markResolved} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
