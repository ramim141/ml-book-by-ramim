import { useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, limit, startAfter, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Users, Search, Filter, ArrowUpDown, Eye, Ban, Plus, Trash2, Edit2, Save, X, Loader2, AlertTriangle, Send } from 'lucide-react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function UserManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('All');
  const [sortBy, setSortBy] = useState('xp_desc'); // Note: For complex combinations, firestore indexes are required.
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ xp: 0, level: 'HSC' });
  const [messageModal, setMessageModal] = useState({ isOpen: false, user: null, title: '', message: '', loading: false });
  
  const USERS_PER_PAGE = 20;

  const fetchUsersPage = async ({ pageParam = null }) => {
    let q;
    if (pageParam) {
      q = query(collection(db, 'users'), orderBy('xp', 'desc'), startAfter(pageParam), limit(USERS_PER_PAGE));
    } else {
      q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(USERS_PER_PAGE));
    }
    const snap = await getDocs(q);
    const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const lastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;
    return { users, lastDoc, hasMore: snap.docs.length === USERS_PER_PAGE };
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useInfiniteQuery({
    queryKey: ['admin_users'],
    queryFn: fetchUsersPage,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.lastDoc : undefined,
  });

  const users = data?.pages.flatMap(page => page.users) || [];

  const mutation = useMutation({
    mutationFn: async ({ uid, actionType }) => {
      const userRef = doc(db, 'users', uid);
      if (actionType === 'suspend') await updateDoc(userRef, { isSuspended: true });
      else if (actionType === 'unsuspend') await updateDoc(userRef, { isSuspended: false });
      else if (actionType === 'reset_xp') await updateDoc(userRef, { xp: 0 });
      else if (actionType === 'delete_data') await updateDoc(userRef, { examHistory: [], xp: 0, questionsBySubject: {} });
      else if (actionType === 'delete_user') await deleteDoc(userRef);
      return { uid, actionType };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_users'] });
      setActionLoading(null);
    },
    onError: (error) => {
      console.error(error);
      alert("Error executing action");
      setActionLoading(null);
    }
  });

  const handleAction = async (uid, actionType, event) => {
    if (event) event.stopPropagation();
    if (!confirm(`Are you sure you want to ${actionType} this user?`)) return;
    setActionLoading(uid);
    mutation.mutate({ uid, actionType });
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    setActionLoading('save');
    try {
      await updateDoc(doc(db, 'users', selectedUser.id), {
        xp: Number(editForm.xp),
        educationLevel: editForm.level
      });
      queryClient.invalidateQueries({ queryKey: ['admin_users'] });
      setEditMode(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save user data.");
    }
    setActionLoading(null);
  };

  const handleSendMessage = async () => {
    if (!messageModal.title.trim() || !messageModal.message.trim()) {
      alert("Please enter both title and message.");
      return;
    }
    setMessageModal(prev => ({ ...prev, loading: true }));
    try {
      const notifRef = doc(collection(db, 'notifications'));
      await updateDoc(notifRef, {
        title: messageModal.title,
        message: messageModal.message,
        target: messageModal.user.id,
        createdAt: new Date(),
        type: 'info',
        readBy: []
      });
      alert("Message sent successfully!");
      setMessageModal({ isOpen: false, user: null, title: '', message: '', loading: false });
    } catch (error) {
      // It's a new document, so we should use setDoc not updateDoc
      console.error(error);
      alert("Failed to send message.");
      setMessageModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSendMessageFixed = async () => {
    if (!messageModal.title.trim() || !messageModal.message.trim()) {
      alert("Please enter both title and message.");
      return;
    }
    setMessageModal(prev => ({ ...prev, loading: true }));
    try {
      const { addDoc, serverTimestamp } = await import('firebase/firestore');
      await addDoc(collection(db, 'notifications'), {
        title: messageModal.title,
        message: messageModal.message,
        target: messageModal.user.id,
        createdAt: serverTimestamp(),
        type: 'info',
        readBy: []
      });
      alert("Message sent successfully!");
      setMessageModal({ isOpen: false, user: null, title: '', message: '', loading: false });
    } catch (error) {
      console.error(error);
      alert("Failed to send message.");
      setMessageModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Client-side filtering on the currently loaded data
  let filteredUsers = users.filter(u =>
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  if (filterLevel !== 'All') filteredUsers = filteredUsers.filter(u => u.educationLevel === filterLevel);
  filteredUsers.sort((a, b) => {
    if (sortBy === 'xp_desc') return (b.xp || 0) - (a.xp || 0);
    if (sortBy === 'xp_asc') return (a.xp || 0) - (b.xp || 0);
    if (sortBy === 'exams_desc') return (b.examHistory?.length || 0) - (a.examHistory?.length || 0);
    return 0;
  });

  return (
    <div>
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Users className="text-indigo-400" /> বিস্তারিত ইউজার ম্যানেজমেন্ট</h2>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" placeholder="নাম বা ইমেইল দিয়ে খুঁজুন (বর্তমানে লোড করা ডেটার উপর)..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:border-indigo-500 outline-none text-slate-200" />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}
              className="pl-9 pr-8 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:border-indigo-500 outline-none text-slate-200 appearance-none">
              <option value="All">সব লেভেল</option>
              <option value="SSC">SSC</option>
              <option value="HSC">HSC</option>
              <option value="Admission">Admission</option>
            </select>
          </div>
          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="pl-9 pr-8 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:border-indigo-500 outline-none text-slate-200 appearance-none">
              <option value="xp_desc">XP (বেশি থেকে কম)</option>
              <option value="xp_asc">XP (কম থেকে বেশি)</option>
              <option value="exams_desc">সবচেয়ে বেশি পরীক্ষা</option>
            </select>
          </div>
        </div>
      </div>

     {isLoading ? <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div> : isError ? <div className="flex justify-center p-12 text-rose-500"><AlertTriangle className="w-8 h-8" /> Error loading users.</div> : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-700/50">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-800/50 text-slate-400 font-medium">
                <tr>
                  <th className="px-4 py-3">স্টুডেন্ট</th>
                  <th className="px-4 py-3">লেভেল</th>
                  <th className="px-4 py-3">XP</th>
                  <th className="px-4 py-3">স্ট্রিক / পরীক্ষা</th>
                  <th className="px-4 py-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-6 text-slate-500">কোনো ইউজার পাওয়া যায়নি।</td></tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id} onClick={() => setSelectedUser(user)}
                      className={`hover:bg-slate-800/50 transition-colors cursor-pointer ${user.isSuspended ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.name || 'User'}&background=random`} alt="avatar" className="w-8 h-8 rounded-full border border-slate-700" />
                          <div>
                            <p className="font-bold text-slate-200">{user.name || 'Unknown User'}</p>
                            {user.isSuspended && <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold">ব্যানড</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{user.educationLevel || 'N/A'}</td>
                      <td className="px-4 py-3 font-bold text-indigo-400">{user.xp || 0} XP</td>
                      <td className="px-4 py-3 text-slate-400">🔥 {user.streak || 0} দিন • 📝 {user.examHistory?.length || 0} টি</td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button onClick={(e) => { e.stopPropagation(); setMessageModal({ isOpen: true, user, title: '', message: '', loading: false }); }} className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors" title="Send Message"><Send className="w-4 h-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }} className="p-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                        <button onClick={(e) => handleAction(user.id, user.isSuspended ? 'unsuspend' : 'suspend', e)} disabled={actionLoading === user.id}
                          className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${user.isSuspended ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}>
                          {user.isSuspended ? <Plus className="w-4 h-4 rotate-45" /> : <Ban className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {hasNextPage && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isFetchingNextPage ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isFetchingNextPage ? 'লোড হচ্ছে...' : 'আরও লোড করুন (Load More)'}
            </button>
          </div>
        )}
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50">
              <h3 className="font-bold text-lg text-white flex items-center gap-2"><Users className="w-5 h-5 text-indigo-400" /> ইউজার প্রোফাইল: {selectedUser.name}</h3>
              <button onClick={() => { setSelectedUser(null); setEditMode(false); }} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="flex flex-col md:flex-row gap-6 mb-8">
                <img src={selectedUser.photoURL || `https://ui-avatars.com/api/?name=${selectedUser.name || 'User'}&background=random`} alt="avatar" className="w-24 h-24 rounded-2xl border-2 border-indigo-500/30 object-cover" />
                <div className="flex-1">
                  {!editMode ? (
                    <>
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-white">{selectedUser.name}</h2>
                        <button onClick={() => { setEditMode(true); setEditForm({ xp: selectedUser.xp || 0, level: selectedUser.educationLevel || 'HSC' }); }}
                          className="p-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-xl flex items-center gap-2 text-sm font-bold">
                          <Edit2 className="w-4 h-4" /> এডিট
                        </button>
                      </div>
                      <p className="text-slate-400 text-sm mb-4">{selectedUser.email || 'Email not provided'}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: 'Education Level', val: selectedUser.educationLevel || 'N/A', cls: 'text-slate-200' },
                          { label: 'Total XP', val: selectedUser.xp || 0, cls: 'text-indigo-400' },
                          { label: 'Exams Taken', val: selectedUser.examHistory?.length || 0, cls: 'text-emerald-400' },
                          { label: 'Target', val: selectedUser.target || 'None', cls: 'text-amber-400' },
                        ].map(({ label, val, cls }) => (
                          <div key={label} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                            <p className="text-xs text-slate-500">{label}</p>
                            <p className={`font-bold ${cls}`}>{val}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-indigo-500/30">
                      <h4 className="font-bold text-slate-200 mb-3 flex items-center gap-2"><Edit2 className="w-4 h-4 text-indigo-400" /> ডেটা এডিট করুন</h4>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">XP</label>
                          <input type="number" value={editForm.xp} onChange={e => setEditForm({ ...editForm, xp: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-indigo-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Level</label>
                          <select value={editForm.level} onChange={e => setEditForm({ ...editForm, level: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-indigo-500">
                            <option value="SSC">SSC</option>
                            <option value="HSC">HSC</option>
                            <option value="Admission">Admission</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setEditMode(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-bold">Cancel</button>
                        <button onClick={handleSaveEdit} disabled={actionLoading === 'save'} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold flex items-center gap-2">
                          {actionLoading === 'save' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-bold text-slate-200 mb-3 border-b border-slate-800 pb-2">বিষয়ভিত্তিক প্রগ্রেস</h4>
                {(!selectedUser.questionsBySubject || Object.keys(selectedUser.questionsBySubject).length === 0) ? (
                  <p className="text-slate-500 text-sm">কোনো প্রগ্রেস পাওয়া যায়নি।</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selectedUser.questionsBySubject).map(([subId, count]) => (
                      <div key={subId} className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-2 text-sm">
                        <span className="text-slate-300 font-medium">{subId}:</span>
                        <span className="text-emerald-400 font-bold">{count} সঠিক</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-slate-200 mb-3 border-b border-slate-800 pb-2">সর্বশেষ পরীক্ষার রেজাল্ট</h4>
                {(!selectedUser.examHistory || selectedUser.examHistory.length === 0) ? (
                  <p className="text-slate-500 text-sm">এখনো কোনো পরীক্ষা দেয়নি।</p>
                ) : (
                  <div className="space-y-2">
                    {selectedUser.examHistory.slice(0, 5).map((exam, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-slate-800/30 rounded-xl border border-slate-700/50 text-sm">
                        <div>
                          <p className="font-bold text-slate-200">{exam.subject}</p>
                          <p className="text-xs text-slate-500">{new Date(exam.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-emerald-400 font-bold">{exam.score} / {exam.total}</p>
                          <p className="text-xs text-amber-400">{exam.xpEarned} XP</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex justify-between">
              <button onClick={() => { setSelectedUser(null); setMessageModal({ isOpen: true, user: selectedUser, title: '', message: '', loading: false }); }}
                className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                <Send className="w-4 h-4" /> মেসেজ পাঠান
              </button>
              <button onClick={(e) => handleAction(selectedUser.id, 'delete_data', e)} disabled={actionLoading === selectedUser.id}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                <Trash2 className="w-4 h-4" /> ইউজার ডেটা মুছুন
              </button>
            </div>
          </div>
        </div>
      )}
      {messageModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50">
              <h3 className="font-bold text-lg text-white flex items-center gap-2"><Send className="w-5 h-5 text-blue-400" /> Message {messageModal.user?.name}</h3>
              <button onClick={() => setMessageModal({ ...messageModal, isOpen: false })} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-300 mb-2">Title</label>
                <input 
                  type="text" 
                  value={messageModal.title} 
                  onChange={e => setMessageModal({ ...messageModal, title: e.target.value })} 
                  placeholder="e.g., Warning, Congratulations!"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 outline-none focus:border-indigo-500" 
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-300 mb-2">Message</label>
                <textarea 
                  value={messageModal.message} 
                  onChange={e => setMessageModal({ ...messageModal, message: e.target.value })} 
                  placeholder="Type your message here..."
                  rows="4"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 outline-none focus:border-indigo-500 resize-none custom-scrollbar" 
                ></textarea>
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setMessageModal({ ...messageModal, isOpen: false })} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-colors">Cancel</button>
                <button onClick={handleSendMessageFixed} disabled={messageModal.loading} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50">
                  {messageModal.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
