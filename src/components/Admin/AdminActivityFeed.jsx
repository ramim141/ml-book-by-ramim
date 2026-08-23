import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { LogIn, MessageSquareWarning, Flag, Check, Loader2, RefreshCw, Bell, Trash2, RotateCcw, Pencil, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { AUDIT, AUDIT_LABELS } from '../../lib/adminAudit';

export default function AdminActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedFilter, setFeedFilter] = useState('all'); // all | admin | student

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'admin_activity'),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setActivities(data);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const markAllAsRead = async () => {
    try {
      const batch = writeBatch(db);
      activities.forEach(activity => {
        if (!activity.read) {
          const ref = doc(db, 'admin_activity', activity.id);
          batch.update(ref, { read: true });
        }
      });
      await batch.commit();
      setActivities(activities.map(a => ({ ...a, read: true })));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'login': return <LogIn className="w-5 h-5 text-blue-400" />;
      case 'feedback': return <MessageSquareWarning className="w-5 h-5 text-amber-400" />;
      case 'report': return <Flag className="w-5 h-5 text-rose-400" />;
      // অ্যাডমিনের নিজের কাজ — ধ্বংসাত্মকগুলো আলাদা করে চোখে পড়া দরকার
      case AUDIT.DELETE:
      case AUDIT.BULK_DELETE: return <Trash2 className="w-5 h-5 text-rose-400" />;
      case AUDIT.RESET: return <RotateCcw className="w-5 h-5 text-amber-400" />;
      case AUDIT.UPDATE: return <Pencil className="w-5 h-5 text-indigo-400" />;
      case AUDIT.CREATE: return <Plus className="w-5 h-5 text-emerald-400" />;
      default: return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  // ছাত্রদের ঘটনা আর অ্যাডমিনের কাজ — দুটো আলাদা করে দেখার সুযোগ
  const visible = activities.filter((a) =>
    feedFilter === 'all' ? true
      : feedFilter === 'admin' ? a.source === 'admin'
        : a.source !== 'admin'
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">অ্যাক্টিভিটি ফিড</h2>
          <p className="text-slate-400 text-sm mt-1">রিয়েল-টাইম সিস্টেম লগ এবং ইউজার নোটিফিকেশন</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-slate-800 bg-slate-900 p-1">
            {[['all','সব'],['admin','অ্যাডমিন'],['student','ছাত্র']].map(([id,label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setFeedFilter(id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  feedFilter === id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button 
            onClick={fetchActivities}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center gap-2 text-sm font-medium transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            রিফ্রেশ
          </button>
          <button 
            onClick={markAllAsRead}
            className="px-4 py-2 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-xl flex items-center gap-2 text-sm font-medium transition-all"
          >
            <Check className="w-4 h-4" />
            Mark all read
          </button>
        </div>
      </div>

      <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center items-center">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : visible.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <Bell className="w-12 h-12 mb-3 opacity-20" />
            <p>কোনো নতুন অ্যাক্টিভিটি নেই</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {visible.map((activity) => (
              <div 
                key={activity.id} 
                className={`p-4 hover:bg-slate-800/50 transition-colors flex items-start gap-4 ${!activity.read ? 'bg-indigo-500/5' : ''}`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${!activity.read ? 'bg-slate-800' : 'bg-slate-900'}`}>
                  {getIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <p className={`text-sm ${!activity.read ? 'text-white font-medium' : 'text-slate-300'}`}>
                      {activity.message}
                    </p>
                    <span className="text-xs text-slate-500 shrink-0 whitespace-nowrap">
                      {activity.timestamp ? formatDistanceToNow(activity.timestamp.toDate(), { addSuffix: true }) : 'Just now'}
                    </span>
                  </div>
                  
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    {activity.source === 'admin' && (
                      <span className="rounded bg-indigo-500/15 px-1.5 py-0.5 font-bold text-indigo-300">
                        অ্যাডমিন{activity.area ? ` · ${activity.area}` : ''}
                      </span>
                    )}
                    {AUDIT_LABELS[activity.type] && (
                      <span className="text-slate-400">{AUDIT_LABELS[activity.type]}</span>
                    )}
                    {(activity.actorEmail || activity.userEmail) && (
                      <span className="text-slate-400">{activity.actorEmail || activity.userEmail}</span>
                    )}
                  </div>

                  {/* details এখন অবজেক্ট (id, সংখ্যা ইত্যাদি) — সরাসরি রেন্ডার
                      করলে React ক্র্যাশ করত, তাই কী-মান জোড়া করে দেখাই */}
                  {activity.details && (
                    <div className="mt-2 rounded-lg border border-slate-800/50 bg-slate-950/50 p-3 text-xs text-slate-400">
                      {typeof activity.details === 'object' ? (
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          {Object.entries(activity.details).map(([k, v]) => (
                            <span key={k}>
                              <span className="text-slate-600">{k}:</span> {String(v)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        String(activity.details)
                      )}
                    </div>
                  )}
                </div>
                
                {!activity.read && (
                  <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-2"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
