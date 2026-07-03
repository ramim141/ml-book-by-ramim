import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, BookmarkX, Trash2 } from 'lucide-react';
import SharedMCQItem from '../../components/Academic/SharedMCQItem';
import SharedCQItem from '../../components/Academic/SharedCQItem';
import SharedKQItem from '../../components/Academic/SharedKQItem';

export default function BookmarkList() {
  const { currentUser } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchBookmarks() {
      if (!currentUser) return;
      try {
        const bookmarksRef = collection(db, 'users', currentUser.uid, 'bookmarks');
        const q = query(bookmarksRef, orderBy('bookmarkedAt', 'desc'));
        const snapshot = await getDocs(q);
        
        if (isMounted) {
          const list = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setBookmarks(list);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
        if (isMounted) setLoading(false);
      }
    }

    fetchBookmarks();
    return () => { isMounted = false; };
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-400">বুকমার্ক লোড হচ্ছে...</p>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
          <BookmarkX className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-200 mb-2">কোনো বুকমার্ক নেই</h3>
        <p className="text-slate-400 text-sm max-w-sm">
          তুমি এখনও কোনো প্রশ্ন বুকমার্ক করোনি। প্র্যাকটিস করার সময় কোনো প্রশ্ন গুরুত্বপূর্ণ মনে হলে বুকমার্ক আইকনে ক্লিক করে সেভ করে রাখতে পারো।
        </p>
      </div>
    );
  }

  // Group bookmarks by type (optional, but we can just render them in order)
  return (
    <div className="space-y-4">
      {bookmarks.map((bookmark, index) => {
        if (bookmark.type === 'mcq') {
          return <SharedMCQItem key={bookmark.id} mcq={bookmark} index={index} />;
        }
        if (bookmark.type === 'cq') {
          return <SharedCQItem key={bookmark.id} cq={bookmark} index={index} />;
        }
        if (bookmark.type === 'kq') {
          return <SharedKQItem key={bookmark.id} kq={bookmark} />;
        }
        return null;
      })}
    </div>
  );
}
