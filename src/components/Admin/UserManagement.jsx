import { useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, limit, startAfter, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Users, Search, Filter, ArrowUpDown, Eye, Ban, Plus, Trash2, Edit2, Save, X, Loader2, AlertTriangle, Send, Download } from 'lucide-react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useConfirm } from '../../hooks/useConfirm';
import { useAuth } from '../../contexts/AuthContext';
import { logAdminAction, AUDIT } from '../../lib/adminAudit';
import { downloadCSV, dateStamp } from '../../lib/adminExport';
import { SkeletonList } from '../UI/Skeleton';

/**
 * পরীক্ষার সংখ্যা — নতুন ফল `examCount` কাউন্টারে গোনা হয় (ইতিহাস এখন
 * সাবকালেকশনে), পুরনো অ্যাকাউন্টে এখনো `examHistory` অ্যারেটাই আছে।
 * দুটোর মধ্যে যেটা বড়, সেটাই ধরি — মাইগ্রেশন ছাড়াই দুই ধরনের ডেটা চলে।
 */
const examCountOf = (user) => Math.max(user?.examCount || 0, user?.examHistory?.length || 0);

export default function UserManagement() {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  const [confirm, confirmDialog] = useConfirm();
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
    mutationFn: async ({ uid, actionType, userLabel }) => {
      const userRef = doc(db, 'users', uid);
      if (actionType === 'suspend') await updateDoc(userRef, { isSuspended: true });
      else if (actionType === 'unsuspend') await updateDoc(userRef, { isSuspended: false });
      else if (actionType === 'reset_xp') await updateDoc(userRef, { xp: 0 });
      else if (actionType === 'delete_data') await updateDoc(userRef, { examHistory: [], xp: 0, questionsBySubject: {} });
      else if (actionType === 'delete_user') await deleteDoc(userRef);

      // কে কার উপর কী করল তার রেকর্ড — বিশেষ করে delete_data / delete_user
      // এর মতো অপূরণীয় কাজে। লগ ব্যর্থ হলেও কাজটা আটকাবে না।
      const meta = {
        suspend: { action: AUDIT.UPDATE, text: 'সাসপেন্ড করা হয়েছে' },
        unsuspend: { action: AUDIT.UPDATE, text: 'সাসপেন্ড তুলে নেওয়া হয়েছে' },
        reset_xp: { action: AUDIT.RESET, text: 'XP শূন্য করা হয়েছে' },
        delete_data: { action: AUDIT.RESET, text: 'পরীক্ষার ইতিহাস ও XP মুছে ফেলা হয়েছে' },
        delete_user: { action: AUDIT.DELETE, text: 'ব্যবহারকারী মুছে ফেলা হয়েছে' },
      }[actionType];

      if (meta) {
        logAdminAction({
          action: meta.action,
          area: 'ইউজার',
          summary: `${userLabel || uid} — ${meta.text}`,
          details: { uid, actionType },
          actorEmail: currentUser?.email,
        });
      }

      return { uid, actionType };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_users'] });
      setActionLoading(null);
    },
    onError: (error) => {
      console.error(error);
      toast.error('কাজটি সম্পন্ন করা যায়নি।');
      setActionLoading(null);
    }
  });

  const handleAction = async (uid, actionType, event) => {
    if (event) event.stopPropagation();

    // আগে ডায়ালগে কাঁচা কী (delete_data) দেখাত — কী হারাবে তা বোঝা যেত না
    const WARN = {
      suspend: { title: 'সাসপেন্ড করবেন?', message: 'এই ব্যবহারকারী আর লগইন করে ব্যবহার করতে পারবেন না।' },
      unsuspend: { title: 'সাসপেন্ড তুলে নেবেন?', message: 'ব্যবহারকারী আবার স্বাভাবিকভাবে ব্যবহার করতে পারবেন।' },
      reset_xp: { title: 'XP শূন্য করবেন?', message: 'অর্জিত সব XP ও লেভেল হারিয়ে যাবে। এটি ফেরানো যাবে না।' },
      delete_data: { title: 'সব শেখার তথ্য মুছবেন?', message: 'পরীক্ষার ইতিহাস, XP ও বিষয়ভিত্তিক অগ্রগতি — সব স্থায়ীভাবে মুছে যাবে। এটি ফেরানো যাবে না।' },
      delete_user: { title: 'ব্যবহারকারী মুছে ফেলবেন?', message: 'অ্যাকাউন্টটি স্থায়ীভাবে মুছে যাবে। এটি ফেরানো যাবে না।' },
    }[actionType] || { title: 'নিশ্চিত?', message: 'কাজটি সম্পন্ন করা হবে।' };

    if (!(await confirm(WARN))) return;

    const target = users.find((u) => u.id === uid);
    setActionLoading(uid);
    mutation.mutate({ uid, actionType, userLabel: target?.name || target?.email || uid });
  };

  /** এখন পর্যন্ত লোড হওয়া ব্যবহারকারীদের CSV — Excel এ খুলে হিসাব করা যায় */
  const handleExportUsers = () => {
    downloadCSV(
      users,
      [
        { key: 'name', label: 'নাম' },
        { key: 'email', label: 'ইমেইল' },
        { key: 'educationLevel', label: 'স্তর' },
        { key: 'xp', label: 'XP', map: (u) => u.xp || 0 },
        { key: 'exams', label: 'পরীক্ষা', map: examCountOf },
        { key: 'streak', label: 'স্ট্রিক', map: (u) => u.streak || 0 },
        { key: 'target', label: 'টার্গেট' },
        { key: 'isSuspended', label: 'সাসপেন্ডেড', map: (u) => (u.isSuspended ? 'হ্যাঁ' : 'না') },
      ],
      `users-${dateStamp()}`
    );
    logAdminAction({
      action: AUDIT.UPDATE,
      area: 'ইউজার',
      summary: `${users.length} জন ব্যবহারকারীর তালিকা রপ্তানি করা হয়েছে`,
      actorEmail: currentUser?.email,
    });
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
      toast.error('ব্যবহারকারীর তথ্য সেভ করা যায়নি।');
    }
    setActionLoading(null);
  };

  const handleSendMessage = async () => {
    if (!messageModal.title.trim() || !messageModal.message.trim()) {
      toast.error('টাইটেল ও মেসেজ দুটোই দিন।');
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
      toast.success('মেসেজ পাঠানো হয়েছে।');
      setMessageModal({ isOpen: false, user: null, title: '', message: '', loading: false });
    } catch (error) {
      // It's a new document, so we should use setDoc not updateDoc
      console.error(error);
      toast.error('মেসেজ পাঠানো যায়নি।');
      setMessageModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSendMessageFixed = async () => {
    if (!messageModal.title.trim() || !messageModal.message.trim()) {
      toast.error('টাইটেল ও মেসেজ দুটোই দিন।');
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
      toast.success('মেসেজ পাঠানো হয়েছে।');
      setMessageModal({ isOpen: false, user: null, title: '', message: '', loading: false });
    } catch (error) {
      console.error(error);
      toast.error('মেসেজ পাঠানো যায়নি।');
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
    if (sortBy === 'exams_desc') return examCountOf(b) - examCountOf(a);
    return 0;
  });

  return (
    <div>
      {confirmDialog}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-bold"><Users className="text-indigo-400" /> বিস্তারিত ইউজার ম্যানেজমেন্ট</h2>
        <button
          type="button"
          onClick={handleExportUsers}
          disabled={users.length === 0}
          title="এখন যতজন লোড হয়েছে তাদের তালিকা CSV তে"
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-emerald-500/40 hover:text-emerald-300 disabled:opacity-40"
        >
          <Download className="h-4 w-4" /> CSV ডাউনলোড ({users.length})
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" placeholder="নাম বা ইমেইল দিয়ে খুঁজুন (বর্তমানে লোড করা ডেটার উপর)..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm focus:border-indigo-500 outline-none text-slate-200" />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-0 flex-1">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm focus:border-indigo-500 outline-none text-slate-200 appearance-none">
              <option value="All">সব লেভেল</option>
              <option value="SSC">SSC</option>
              <option value="HSC">HSC</option>
              <option value="Admission">Admission</option>
            </select>
          </div>
          <div className="relative min-w-0 flex-1">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm focus:border-indigo-500 outline-none text-slate-200 appearance-none">
              <option value="xp_desc">XP (বেশি থেকে কম)</option>
              <option value="xp_asc">XP (কম থেকে বেশি)</option>
              <option value="exams_desc">সবচেয়ে বেশি পরীক্ষা</option>
            </select>
          </div>
        </div>
      </div>

     {isLoading ? <div className="p-4"><SkeletonList count={10} /></div> : isError ? <div className="flex justify-center p-12 text-rose-500"><AlertTriangle className="w-8 h-8" /> Error loading users.</div> : (
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
                      <td className="px-4 py-3 text-slate-400">🔥 {user.streak || 0} দিন • 📝 {examCountOf(user)} টি</td>
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
                        <h2 className="text-xl font-semibold tracking-tight text-white">{selectedUser.name}</h2>
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
                          { label: 'Exams Taken', val: examCountOf(selectedUser), cls: 'text-emerald-400' },
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
                          <input type="number" value={editForm.xp} onChange={e => setEditForm({ ...editForm, xp: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-indigo-500 text-base sm:text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Level</label>
                          <select value={editForm.level} onChange={e => setEditForm({ ...editForm, level: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-indigo-500 text-base sm:text-sm">
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
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 outline-none focus:border-indigo-500 text-base sm:text-sm" 
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-300 mb-2">Message</label>
                <textarea 
                  value={messageModal.message} 
                  onChange={e => setMessageModal({ ...messageModal, message: e.target.value })} 
                  placeholder="Type your message here..."
                  rows="4"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 outline-none focus:border-indigo-500 resize-none custom-scrollbar text-base sm:text-sm" 
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
