import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, BookOpen, Layers, HelpCircle, X } from 'lucide-react';
import { collection, query, where, orderBy, startAt, endAt, limit, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { getSubjectPath } from '../../utils/academicRoutes';

export default function GlobalSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState({ subjects: [], chapters: [], questions: [] });
  const [isOpen, setIsOpen] = useState(false);
  
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (!searchTerm.trim()) {
        setResults({ subjects: [], chapters: [], questions: [] });
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      const queryText = searchTerm.trim();
      const lowerQuery = queryText.toLowerCase();

      try {
        // 1. Fetch Subjects and Chapters locally from admin_settings
        const subjectsSnap = await getDoc(doc(db, 'admin_settings', 'subjects'));
        let matchedSubjects = [];
        let matchedChapters = [];

        if (subjectsSnap.exists() && subjectsSnap.data().list) {
          const list = subjectsSnap.data().list;
          
          list.forEach(subject => {
            // Check subject match
            if (subject.label?.toLowerCase().includes(lowerQuery) || subject.id?.toLowerCase().includes(lowerQuery)) {
              matchedSubjects.push(subject);
            }
            
            // Check chapter match
            if (subject.chapters) {
              subject.chapters.forEach(chapter => {
                const chapterTitle = chapter.title || chapter.name || chapter.chapterNo || '';
                if (chapterTitle.toLowerCase().includes(lowerQuery)) {
                  matchedChapters.push({
                    ...chapter,
                    subjectLabel: subject.label,
                    subjectPath: getSubjectPath(subject)
                  });
                }
              });
            }
          });
        }

        // 2. Fetch Questions from academic_content (Prefix search on 'question' field)
        let matchedQuestions = [];
        try {
          const q = query(
            collection(db, 'academic_content'),
            orderBy('question'),
            startAt(queryText),
            endAt(queryText + '\uf8ff'),
            limit(5)
          );
          const qSnap = await getDocs(q);
          matchedQuestions = qSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (err) {
          console.warn("Question search failed (might need index or no question field):", err);
        }

        setResults({
          subjects: matchedSubjects.slice(0, 5),
          chapters: matchedChapters.slice(0, 5),
          questions: matchedQuestions
        });
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleNavigate = (path) => {
    setIsOpen(false);
    setSearchTerm('');
    navigate(path);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto z-50" ref={searchRef}>
      
      {/* Search Input */}
      <div className={`relative flex items-center bg-slate-900/60 backdrop-blur-xl border transition-all duration-300 ${
        isOpen && searchTerm ? 'border-indigo-500/50 rounded-t-2xl shadow-[0_0_30px_rgba(99,102,241,0.2)]' : 'border-slate-700/50 rounded-full hover:border-slate-600/50'
      }`}>
        <div className="pl-5 pr-3 py-4 flex items-center justify-center text-slate-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="সার্চ করো যেকোনো বিষয়, অধ্যায় বা প্রশ্ন..."
          className="flex-1 bg-transparent border-none text-white placeholder-slate-400 focus:outline-none focus:ring-0 py-4 text-sm sm:text-base pr-12"
        />
        {searchTerm && (
          <button 
            onClick={() => { setSearchTerm(''); setIsOpen(false); }}
            className="absolute right-4 p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && searchTerm.trim() && (
        <div className="absolute top-full left-0 w-full bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 border-t-0 rounded-b-2xl shadow-2xl overflow-hidden max-h-[70vh] overflow-y-auto custom-scrollbar flex flex-col">
          
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-500" />
              <p className="text-sm font-medium">খোঁজা হচ্ছে...</p>
            </div>
          ) : (
            results.subjects.length === 0 && results.chapters.length === 0 && results.questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                <Search className="w-10 h-10 mb-3 opacity-20" />
                <p className="text-sm">কোনো রেজাল্ট পাওয়া যায়নি।</p>
              </div>
            ) : (
              <div className="p-2 space-y-4">
                
                {/* Subjects */}
                {results.subjects.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 mb-2 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" /> বিষয় (Subjects)
                    </h4>
                    <div className="space-y-1">
                      {results.subjects.map((sub, i) => (
                        <button
                          key={i}
                          onClick={() => handleNavigate(getSubjectPath(sub))}
                          className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-indigo-500/10 flex items-center gap-3 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                            {sub.emoji || '📚'}
                          </div>
                          <div>
                            <div className="text-slate-200 font-bold group-hover:text-indigo-300 transition-colors text-sm">{sub.label}</div>
                            <div className="text-xs text-slate-500">{sub.level}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chapters */}
                {results.chapters.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 mb-2 flex items-center gap-1.5 mt-4">
                      <Layers className="w-3.5 h-3.5" /> অধ্যায় (Chapters)
                    </h4>
                    <div className="space-y-1">
                      {results.chapters.map((chap, i) => (
                        <button
                          key={i}
                          onClick={() => handleNavigate(`${chap.subjectPath}/chapter/${encodeURIComponent(chap.chapterNo || chap.id)}`)}
                          className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-emerald-500/10 flex items-center gap-3 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <Layers className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-slate-200 font-bold group-hover:text-emerald-300 transition-colors text-sm truncate max-w-[250px] sm:max-w-[400px]">
                              {chap.title || chap.name || chap.chapterNo}
                            </div>
                            <div className="text-xs text-slate-500">{chap.subjectLabel}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Questions */}
                {results.questions.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 mb-2 flex items-center gap-1.5 mt-4">
                      <HelpCircle className="w-3.5 h-3.5" /> প্রশ্নসমূহ (Questions)
                    </h4>
                    <div className="space-y-1">
                      {results.questions.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            // If it's a board question or MCQ, we just navigate to the subject home or a specific route if available.
                            // Currently, we don't have a single question viewer route globally unless it's in Question Bank Dashboard.
                            // We can link to the Question Bank Dashboard and let them search there, or just the subject path.
                            handleNavigate('/academic/question-bank');
                          }}
                          className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-fuchsia-500/10 flex items-start gap-3 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center shrink-0 mt-0.5">
                            <HelpCircle className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-slate-200 font-semibold group-hover:text-fuchsia-300 transition-colors text-sm line-clamp-2">
                              {q.question || q.scenario || 'একটি প্রশ্ন'}
                            </div>
                            <div className="text-xs text-slate-500 mt-1 capitalize inline-flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded-md">
                              {q.type}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
