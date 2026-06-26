import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Bookmark, BookOpen, Trash2, Hash } from 'lucide-react';
import { useBookmark } from '../../context/BookmarkContext';

export default function Bookmarks() {
  const { bookmarks, removeBookmark } = useBookmark();

  const sortedBookmarks = [...bookmarks].sort((a, b) => b.addedAt - a.addedAt);
  const bookBookmarks = sortedBookmarks.filter((b) => b.type === 'book');
  const blogBookmarks = sortedBookmarks.filter((b) => b.type === 'blog');

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] pt-28 pb-20 text-slate-300 font-sans relative overflow-hidden">
      <Helmet>
        <title>আমার বুকমার্কস | শব্দে শব্দে মেশিন লার্নিং</title>
      </Helmet>

      {/* Ambient Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-[#5b5dfa]/5 to-transparent blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <header className="mb-12 border-b border-slate-800/60 pb-8">
          <div className="flex items-center gap-3 text-[#5b5dfa] mb-4">
            <div className="p-2.5 bg-[#5b5dfa]/10 rounded-xl border border-[#5b5dfa]/20">
              <Bookmark size={24} />
            </div>
            <h1 className="text-xl font-black text-white sm:text-4xl">আমার বুকমার্কস</h1>
          </div>
          <p className="text-slate-400 text-lg">আপনার সেভ করে রাখা সকল আর্টিকেল এবং বইয়ের পর্বগুলো এখানে দেখতে পাবেন।</p>
        </header>

        {bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-slate-800 bg-[#111729]/20">
            <div className="p-4 bg-slate-800/50 rounded-full mb-4">
              <Bookmark size={40} className="text-slate-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">কোনো বুকমার্ক নেই</h2>
            <p className="text-slate-400 text-center max-w-md">
              আপনি এখনো কোনো আর্টিকেল বা পর্ব সেভ করেননি। পড়ার সময় বুকমার্ক আইকনে ক্লিক করে সেভ করুন।
            </p>
            <Link to="/dashboard" className="mt-6 px-6 py-2.5 bg-teal-500/10 text-teal-400 font-bold rounded-full border border-teal-500/20 hover:bg-teal-500/20 transition-all">
              বই পড়তে শুরু করুন
            </Link>
          </div>
        ) : (
          <div className="grid gap-12 lg:grid-cols-2">
            
            {/* Book Chapters Section */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <BookOpen size={20} className="text-teal-400" />
                <h2 className="text-xl font-bold text-white">বইয়ের পর্বসমূহ ({bookBookmarks.length})</h2>
              </div>
              
              <div className="space-y-4">
                {bookBookmarks.length === 0 ? (
                  <div className="p-8 text-center border border-slate-800/60 rounded-2xl bg-[#111729]/30 text-slate-500 text-sm">
                    কোনো বইয়ের পর্ব বুকমার্ক করা হয়নি।
                  </div>
                ) : (
                  bookBookmarks.map((item) => (
                    <div key={item.id} className="group relative p-5 rounded-2xl border border-slate-800/80 bg-[#111729]/40 hover:bg-[#111729]/80 transition-colors shadow-sm">
                      <Link to={item.link} className="block pr-10">
                        <h3 className="text-lg font-bold text-slate-200 group-hover:text-teal-300 transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-2">সেভ করা হয়েছে: {formatDate(item.addedAt)}</p>
                      </Link>
                      <button
                        onClick={() => removeBookmark(item.id)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 p-2 rounded-full text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="বুকমার্ক রিমুভ করুন"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Blog Posts Section */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Hash size={20} className="text-[#5b5dfa]" />
                <h2 className="text-xl font-bold text-white">ব্লগ আর্টিকেল ({blogBookmarks.length})</h2>
              </div>

              <div className="space-y-4">
                {blogBookmarks.length === 0 ? (
                  <div className="p-8 text-center border border-slate-800/60 rounded-2xl bg-[#111729]/30 text-slate-500 text-sm">
                    কোনো ব্লগ আর্টিকেল বুকমার্ক করা হয়নি।
                  </div>
                ) : (
                  blogBookmarks.map((item) => (
                    <div key={item.id} className="group relative p-5 rounded-2xl border border-slate-800/80 bg-[#111729]/40 hover:bg-[#111729]/80 transition-colors shadow-sm">
                      <Link to={item.link} className="block pr-10">
                        <h3 className="text-lg font-bold text-slate-200 group-hover:text-[#5b5dfa] transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-2">সেভ করা হয়েছে: {formatDate(item.addedAt)}</p>
                      </Link>
                      <button
                        onClick={() => removeBookmark(item.id)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 p-2 rounded-full text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="বুকমার্ক রিমুভ করুন"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
