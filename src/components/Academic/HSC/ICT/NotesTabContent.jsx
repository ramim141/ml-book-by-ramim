import { FileText, Eye, Share2, Download } from 'lucide-react';

const NotesTabContent = ({ chapter }) => {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {chapter.notes.length > 0 ? (
        chapter.notes.map((note) => (
          <div key={note.id} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 sm:p-6 transition-colors hover:bg-slate-800 group flex flex-col h-full">
            <div className="flex items-start gap-3 sm:gap-4 mb-4">
              <div className="hidden sm:block bg-red-500/10 p-2 sm:p-3 rounded-xl text-red-400 shrink-0">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base sm:text-lg group-hover:text-red-400 transition-colors line-clamp-2">
                  {note.title}
                </h3>
                <div className="flex items-center flex-wrap gap-2 sm:gap-3 mt-1 sm:mt-2 text-[10px] sm:text-xs font-medium text-slate-500">
                  <span className="bg-slate-900 px-2 py-1 rounded-md">{note.type}</span>
                  {note.size && <span>{note.size}</span>}
                  {note.pages && <span>{note.pages} Pages</span>}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 pt-4 border-t border-slate-700/50 mt-auto">
              <button 
                onClick={() => window.open(note.url, '_blank')}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-all"
              >
                <Eye className="w-4 h-4" /> পড়ুন
              </button>
              <button className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white p-2.5 rounded-xl transition-all" title="Share">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white p-2.5 rounded-xl transition-all" title="Download">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full bg-slate-800/30 border border-slate-700/50 rounded-2xl p-12 text-center">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">এই অধ্যায়ের কোনো নোট পাওয়া যায়নি।</p>
        </div>
      )}
    </div>
  );
};

export default NotesTabContent;
