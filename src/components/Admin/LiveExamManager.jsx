import { useState, useEffect } from 'react';
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { CalendarClock, Plus, Edit, Trash2, Loader2, Save, X, Settings2, Users } from 'lucide-react';

export default function LiveExamManager() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: 'physics', // default
    startTime: '',
    endTime: '',
    duration: 30,
    totalQuestions: 25,
    marksPerQuestion: 1,
    negativeMarking: 0.25,
    questions: [] // Will implement question picking later
  });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const q = query(collection(db, 'live_exams'), orderBy('startTime', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
          startTime: d.startTime?.toDate(),
          endTime: d.endTime?.toDate(),
        };
      });
      setExams(data);
    } catch (err) {
      console.error('Error fetching live exams:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        startTime: Timestamp.fromDate(new Date(formData.startTime)),
        endTime: Timestamp.fromDate(new Date(formData.endTime)),
        duration: Number(formData.duration),
        totalQuestions: Number(formData.totalQuestions),
        marksPerQuestion: Number(formData.marksPerQuestion),
        negativeMarking: Number(formData.negativeMarking),
        updatedAt: Timestamp.now()
      };

      if (editingId) {
        await updateDoc(doc(db, 'live_exams', editingId), payload);
      } else {
        payload.createdAt = Timestamp.now();
        await addDoc(collection(db, 'live_exams'), payload);
      }
      
      setShowForm(false);
      setEditingId(null);
      fetchExams();
    } catch (err) {
      console.error('Error saving exam:', err);
      alert('Error saving exam. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (exam) => {
    // format dates for input type="datetime-local"
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const formatForInput = (dateObj) => {
      if (!dateObj) return '';
      const localISOTime = (new Date(dateObj - tzoffset)).toISOString().slice(0,16);
      return localISOTime;
    };

    setFormData({
      title: exam.title || '',
      description: exam.description || '',
      subject: exam.subject || 'physics',
      startTime: formatForInput(exam.startTime),
      endTime: formatForInput(exam.endTime),
      duration: exam.duration || 30,
      totalQuestions: exam.totalQuestions || 25,
      marksPerQuestion: exam.marksPerQuestion || 1,
      negativeMarking: exam.negativeMarking || 0.25,
      questions: exam.questions || []
    });
    setEditingId(exam.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this live exam?')) return;
    try {
      await deleteDoc(doc(db, 'live_exams', id));
      setExams(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('Error deleting exam:', err);
    }
  };

  const getStatus = (start, end) => {
    const now = new Date();
    if (now < start) return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Upcoming</span>;
    if (now >= start && now <= end) return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse">Ongoing</span>;
    return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">Completed</span>;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 text-indigo-500 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <CalendarClock className="h-6 w-6 text-fuchsia-400" />
            লাইভ এক্সাম ম্যানেজমেন্ট
          </h2>
          <p className="text-slate-400 text-sm mt-1">Schedule and manage live mock tests for students.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setFormData({
                title: '', description: '', subject: 'physics', startTime: '', endTime: '', duration: 30, totalQuestions: 25, marksPerQuestion: 1, negativeMarking: 0.25, questions: []
              });
              setEditingId(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors"
          >
            <Plus className="h-5 w-5" /> Create Exam
          </button>
        )}
      </div>

      {showForm ? (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">{editingId ? 'Edit Exam' : 'Create New Exam'}</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Exam Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500" placeholder="e.g. Physics Grand Mock Test" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Subject</label>
                <select required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500">
                  <option value="physics">Physics</option>
                  <option value="chemistry">Chemistry</option>
                  <option value="math">Math</option>
                  <option value="biology">Biology</option>
                  <option value="ict">ICT</option>
                  <option value="bangla">Bangla</option>
                  <option value="english">English</option>
                  <option value="gk">General Knowledge</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-300 mb-2">Description / Syllabus</label>
                <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500" placeholder="e.g. Chapter 1 to 4" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Start Time</label>
                <input required type="datetime-local" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">End Time</label>
                <input required type="datetime-local" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Duration (minutes)</label>
                <input required type="number" min="1" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Total Questions</label>
                <input required type="number" min="1" value={formData.totalQuestions} onChange={e => setFormData({...formData, totalQuestions: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Marks per Question</label>
                <input required type="number" min="0.1" step="0.1" value={formData.marksPerQuestion} onChange={e => setFormData({...formData, marksPerQuestion: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Negative Marking</label>
                <input required type="number" min="0" step="0.01" value={formData.negativeMarking} onChange={e => setFormData({...formData, negativeMarking: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500" />
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
              <h4 className="text-white font-bold mb-2 flex items-center gap-2"><Settings2 className="h-4 w-4" /> Questions Configuration</h4>
              <p className="text-sm text-slate-400 mb-4">
                Currently, the system will randomly pull {formData.totalQuestions || 25} questions from the {formData.subject} Question Bank. (Specific question selection feature coming soon).
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors">
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                {editingId ? 'Update Exam' : 'Save Exam'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-bold transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-slate-800/20 border border-slate-700/50 rounded-2xl">
              <CalendarClock className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">No live exams scheduled yet.</p>
            </div>
          ) : (
            exams.map(exam => (
              <div key={exam.id} className="bg-slate-800/40 backdrop-blur border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  {getStatus(exam.startTime, exam.endTime)}
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(exam)} className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(exam.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{exam.title}</h3>
                <p className="text-sm text-slate-400 mb-4 line-clamp-1">{exam.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-slate-700/50 pb-2">
                    <span className="text-slate-400">Subject:</span>
                    <span className="text-white font-medium capitalize">{exam.subject}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700/50 pb-2">
                    <span className="text-slate-400">Questions:</span>
                    <span className="text-white font-medium">{exam.totalQuestions} ({exam.duration} mins)</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-400 text-xs">Starts:</span>
                    <span className="text-indigo-300 text-xs font-bold">
                      {exam.startTime?.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700/50 flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors">
                    <Users className="h-3.5 w-3.5" /> Participants
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
