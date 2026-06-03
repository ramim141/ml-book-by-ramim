import { createContext, useContext, useState, useEffect } from 'react';
import { getAllWords } from '../data/wordsIndex';

const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const [completedWords, setCompletedWords] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on initial mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('ml_book_progress');
    if (savedProgress) {
      try {
        setCompletedWords(JSON.parse(savedProgress));
      } catch (e) {
        console.error("Error parsing progress from local storage", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage whenever progress changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('ml_book_progress', JSON.stringify(completedWords));
    }
  }, [completedWords, isLoaded]);

  const markAsComplete = (wordPath) => {
    setCompletedWords((prev) => {
      if (!prev.includes(wordPath)) {
        return [...prev, wordPath];
      }
      return prev;
    });
  };

  const markAsIncomplete = (wordPath) => {
    setCompletedWords((prev) => prev.filter(path => path !== wordPath));
  };

  const isCompleted = (wordPath) => {
    return completedWords.includes(wordPath);
  };

  const toggleComplete = (wordPath) => {
    if (isCompleted(wordPath)) {
      markAsIncomplete(wordPath);
    } else {
      markAsComplete(wordPath);
    }
  };

  // Calculate percentage
  const totalWords = getAllWords().length;
  const completedCount = completedWords.length;
  const progressPercentage = totalWords > 0 ? Math.round((completedCount / totalWords) * 100) : 0;

  return (
    <ProgressContext.Provider value={{
      completedWords,
      isCompleted,
      toggleComplete,
      progressPercentage,
      completedCount,
      totalWords
    }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return context;
}
