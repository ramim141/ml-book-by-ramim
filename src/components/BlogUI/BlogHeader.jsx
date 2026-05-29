import React from 'react';
import { Calendar, Clock, Share2 } from 'lucide-react';

export default function BlogHeader({ title, category, date, readTime, image, author, titleClassName }) {
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: title,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="mb-12">
      {/* 1. Full Width Banner Image */}
      <div className="w-full h-[40vh] md:h-[60vh] overflow-hidden mb-10">
        <img src={image} alt={title} className="object-cover w-full h-full" />
      </div>

      {/* 2. Meta Info & Title */}
      <div className="px-5 mx-auto max-w-7xl">
        <div className="flex items-center gap-3 text-sm text-[#00daf3] font-bold uppercase tracking-widest mb-4">
          <span>{category}</span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1 font-medium text-slate-400"><Clock size={14}/> {readTime} পাঠ</span>
        </div>

        <h1 className={`font-black text-white leading-[1.2] mb-8 ${titleClassName || 'text-3xl md:text-5xl lg:text-6xl'}`}>
          {title}
        </h1>

        {/* 3. Author Info & Share Action */}
        <div className="flex items-center justify-between py-4 border-y border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 overflow-hidden rounded-full bg-slate-800">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Ramim`} alt="Author" className="object-cover w-full h-full" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{author}</p>
              <p className="text-xs text-slate-400">{date}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
             <button onClick={handleShare} className="transition-colors hover:text-white" title="Share this post">
               <Share2 size={18} />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}