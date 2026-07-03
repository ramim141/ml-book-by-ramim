import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

export function useBookmark(questionId, questionData) {
  const { currentUser } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    async function checkBookmark() {
      if (!currentUser || !questionId) {
        if (isMounted) setIsLoading(false);
        return;
      }
      
      try {
        const qIdStr = String(questionId);
        const docRef = doc(db, 'users', currentUser.uid, 'bookmarks', qIdStr);
        const docSnap = await getDoc(docRef);
        if (isMounted) {
          setIsBookmarked(docSnap.exists());
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error checking bookmark:", error);
        if (isMounted) setIsLoading(false);
      }
    }

    checkBookmark();

    return () => {
      isMounted = false;
    };
  }, [currentUser, questionId]);

  const toggleBookmark = async () => {
    if (!currentUser) {
      window.alert('বুকমার্ক করতে লগইন করুন!');
      return;
    }
    
    if (!questionId) {
      window.alert('প্রশ্ন আইডি পাওয়া যায়নি!');
      return;
    }

    const previousState = isBookmarked;
    // Optimistic update
    setIsBookmarked(!previousState);

    try {
      const qIdStr = String(questionId);
      const docRef = doc(db, 'users', currentUser.uid, 'bookmarks', qIdStr);
      
      if (previousState) {
        // Remove bookmark
        await deleteDoc(docRef);
      } else {
        // Add bookmark
        const bookmarkData = {
          ...questionData,
          bookmarkedAt: new Date().toISOString(),
          questionId: qIdStr
        };
        await setDoc(docRef, bookmarkData);
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      window.alert('বুকমার্ক আপডেট করতে সমস্যা হয়েছে');
      // Revert on error
      setIsBookmarked(previousState);
    }
  };

  return { isBookmarked, toggleBookmark, isLoading };
}
