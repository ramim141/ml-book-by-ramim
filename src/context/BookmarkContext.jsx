import React, { createContext, useContext, useState, useEffect } from 'react';

const BookmarkContext = createContext();

export function BookmarkProvider({ children }) {
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const storedBookmarks = localStorage.getItem('ml-book-bookmarks');
      return storedBookmarks ? JSON.parse(storedBookmarks) : [];
    } catch (error) {
      console.error('Error loading bookmarks from localStorage', error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('ml-book-bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const toggleBookmark = (item) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.id === item.id);
      if (exists) {
        return prev.filter((b) => b.id !== item.id);
      } else {
        return [...prev, { ...item, addedAt: Date.now() }];
      }
    });
  };

  const isBookmarked = (id) => {
    return bookmarks.some((b) => b.id === id);
  };

  const removeBookmark = (id) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <BookmarkContext.Provider value={{ bookmarks, toggleBookmark, isBookmarked, removeBookmark }}>
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmark() {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmark must be used within a BookmarkProvider');
  }
  return context;
}
