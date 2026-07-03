import { useState, useEffect, useRef } from 'react';
import { Bell, Check } from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

export default function NotificationBell() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    // We fetch notifications that are either target='global' or target=currentUser.uid
    // Note: Due to Firestore limitations, we can't do OR queries across different fields or 'in' arrays effectively for this structure in a single query without complex composite indexes if we sort. 
    // Two separate queries are cleaner and easier to index if needed.
    const qGlobal = query(collection(db, 'notifications'), where('target', '==', 'global'), orderBy('createdAt', 'desc'));
    const qPersonal = query(collection(db, 'notifications'), where('target', '==', currentUser.uid), orderBy('createdAt', 'desc'));

    let globalNotifs = [];
    let personalNotifs = [];

    const updateCombined = () => {
      const combined = [...globalNotifs, ...personalNotifs].sort((a, b) => (b.createdAt?.toMillis() || Date.now()) - (a.createdAt?.toMillis() || Date.now()));
      setNotifications(combined.slice(0, 20)); // Limit to recent 20
    };

    const unsubscribeGlobal = onSnapshot(qGlobal, (snapshot) => {
      globalNotifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      updateCombined();
    }, (error) => {
      console.warn("Global notifications error (likely missing index):", error.message);
    });

    const unsubscribePersonal = onSnapshot(qPersonal, (snapshot) => {
      personalNotifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      updateCombined();
    }, (error) => {
      console.warn("Personal notifications error (likely missing index):", error.message);
    });

    return () => {
      unsubscribeGlobal();
      unsubscribePersonal();
    };
  }, [currentUser]);

  const markAsRead = async (notificationId) => {
    try {
      const notifRef = doc(db, 'notifications', notificationId);
      await updateDoc(notifRef, {
        readBy: arrayUnion(currentUser.uid)
      });
    } catch (error) {
      console.error("Error marking notification as read", error);
    }
  };
  
  const unreadCount = notifications.filter(n => !n.readBy?.includes(currentUser?.uid)).length;

  if (!currentUser) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-amber-400 transition-colors"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-[#0f172a] shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute -right-12 sm:right-0 mt-2 w-[300px] max-w-[calc(100vw-32px)] sm:w-[380px] bg-[#0f172a] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-[100]">
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-800/30">
            <h3 className="font-bold text-white text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => notifications.filter(n => !n.readBy?.includes(currentUser.uid)).forEach(n => markAsRead(n.id))}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-500 mb-3">
                  <Bell size={20} />
                </div>
                <p className="text-slate-400 text-sm font-medium">No new notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700/30">
                {notifications.map(notif => {
                  const isRead = notif.readBy?.includes(currentUser.uid);
                  return (
                    <div 
                      key={notif.id} 
                      onClick={() => !isRead && markAsRead(notif.id)}
                      className={`p-4 transition-colors ${isRead ? 'opacity-70 hover:bg-slate-800/30' : 'bg-indigo-500/5 hover:bg-indigo-500/10 cursor-pointer'}`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {notif.type === 'success' ? (
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                              <Check size={14} />
                            </div>
                          ) : notif.type === 'warning' ? (
                            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/20">
                              <Bell size={14} />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                              <Bell size={14} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-bold ${isRead ? 'text-slate-300' : 'text-white'}`}>{notif.title}</h4>
                          <p className="text-sm text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
                          <p className="text-[10px] text-slate-500 mt-2 font-medium uppercase tracking-wider">
                            {notif.createdAt?.toDate().toLocaleString() || 'Just now'}
                          </p>
                        </div>
                        {!isRead && (
                          <div className="flex-shrink-0 flex items-center">
                            <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] mt-2"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
