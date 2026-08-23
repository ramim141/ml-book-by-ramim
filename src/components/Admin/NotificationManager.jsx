import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, limit, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';
import { useConfirm } from '../../hooks/useConfirm';
import { Bell, Send, Trash2, Globe, Users, Loader2, AlertTriangle, Check } from 'lucide-react';

export default function NotificationManager() {
  const [confirm, confirmDialog] = useConfirm();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [loading, setLoading] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchRecent = async () => {
    try {
      setLoadingHistory(true);
      const q = query(
        collection(db, 'notifications'),
        where('target', '==', 'global'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const snap = await getDocs(q);
      const notifs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setRecentNotifications(notifs);
    } catch (error) {
      console.error("Error fetching global notifications:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchRecent();
  }, []);

  const handleSendGlobal = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('দয়া করে টাইটেল এবং মেসেজ দিন।');
      return;
    }
    if (!(await confirm({ title: 'সবাইকে পাঠাবেন?', message: 'এই নোটিফিকেশনটি সব ব্যবহারকারীর কাছে চলে যাবে।', confirmLabel: 'হ্যাঁ, পাঠান', tone: 'default' }))) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'notifications'), {
        title: title.trim(),
        message: message.trim(),
        target: 'global',
        type: type,
        createdAt: serverTimestamp(),
        readBy: []
      });
      toast.success('সবাইকে নোটিফিকেশন পাঠানো হয়েছে।');
      setTitle('');
      setMessage('');
      setType('info');
      fetchRecent();
    } catch (error) {
      console.error(error);
      toast.error('নোটিফিকেশন পাঠাতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!(await confirm({ title: 'নোটিফিকেশন মুছে ফেলবেন?', message: 'এটি আর ফিরে পাওয়া যাবে না।' }))) return;
    try {
      await deleteDoc(doc(db, 'notifications', id));
      setRecentNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error(error);
      toast.error('মুছে ফেলা যায়নি।');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {confirmDialog}
      <div className="flex items-center gap-3 border-b border-slate-700/50 pb-5">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
          <Globe className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Global Notifications</h2>
          <p className="text-slate-400 text-sm">Send alerts and announcements to all users simultaneously</p>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-3 min-w-0">
          <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full"></div>
            
            <form onSubmit={handleSendGlobal} className="space-y-5 relative z-10">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Notification Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g., System Update, New Feature Added!"
                  className="w-full bg-[#0b1120] border border-slate-700 rounded-xl px-4 py-3 text-base sm:text-sm text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Message Content</label>
                <textarea 
                  value={message} 
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Write the detailed message here..."
                  rows="4"
                  className="w-full bg-[#0b1120] border border-slate-700 rounded-xl px-4 py-3 text-base sm:text-sm text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all custom-scrollbar resize-none" 
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-3">Notification Type</label>
                <div className="flex gap-4">
                  <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${type === 'info' ? 'bg-blue-500/20 border-blue-500 text-blue-400 font-bold' : 'bg-[#0b1120] border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                    <input type="radio" name="type" value="info" checked={type === 'info'} onChange={() => setType('info')} className="hidden text-base sm:text-sm" />
                    <Bell className="w-4 h-4" /> Info
                  </label>
                  <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${type === 'success' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold' : 'bg-[#0b1120] border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                    <input type="radio" name="type" value="success" checked={type === 'success'} onChange={() => setType('success')} className="hidden text-base sm:text-sm" />
                    <Check className="w-4 h-4" /> Success
                  </label>
                  <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${type === 'warning' ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-bold' : 'bg-[#0b1120] border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                    <input type="radio" name="type" value="warning" checked={type === 'warning'} onChange={() => setType('warning')} className="hidden text-base sm:text-sm" />
                    <AlertTriangle className="w-4 h-4" /> Warning
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700/50">
                <button 
                  type="submit" 
                  disabled={loading || !title.trim() || !message.trim()}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  Send to All Users
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="md:col-span-2 min-w-0 space-y-4">
          <h3 className="font-bold text-white flex items-center gap-2"><Bell className="w-4 h-4 text-slate-400" /> Recent Broadcasts</h3>
          {loadingHistory ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-slate-500" /></div>
          ) : recentNotifications.length === 0 ? (
            <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6 text-center text-slate-500 text-sm">
              No global notifications sent recently.
            </div>
          ) : (
            <div className="space-y-3">
              {recentNotifications.map(notif => (
                <div key={notif.id} className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 flex gap-3 group transition-colors hover:bg-slate-800/80">
                  <div className="flex-shrink-0 mt-1">
                     {notif.type === 'success' ? (
                       <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center"><Check size={14} /></div>
                     ) : notif.type === 'warning' ? (
                       <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center"><AlertTriangle size={14} /></div>
                     ) : (
                       <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center"><Bell size={14} /></div>
                     )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-white truncate">{notif.title}</h4>
                      <button onClick={() => handleDelete(notif.id)} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3" /></button>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{notif.message}</p>
                    <p className="text-[10px] text-slate-500 mt-2">
                      {notif.createdAt?.toDate().toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
