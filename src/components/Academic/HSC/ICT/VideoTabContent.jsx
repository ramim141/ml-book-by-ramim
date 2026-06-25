import { PlayCircle } from 'lucide-react';

const VideoTabContent = ({ chapter, activeVideo, setActiveVideo }) => {
  const validVideos = chapter.videos?.filter(v => v.title && v.title.trim() !== '') || [];

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Video Player */}
      <div className="flex-1">
        {activeVideo ? (
          <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl h-full flex flex-col">
            {activeVideo.youtubeId ? (
              <div className="aspect-video relative bg-black">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${activeVideo.youtubeId}`}
                  title={activeVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0"
                ></iframe>
              </div>
            ) : (
              <div className="aspect-video relative bg-slate-800 flex flex-col items-center justify-center text-center p-4 sm:p-6 border-b border-slate-700/50">
                <PlayCircle className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600 mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-slate-300 mb-1 sm:mb-2">ভিডিও লেকচার তৈরি হচ্ছে</h3>
                <p className="text-sm sm:text-base text-slate-400">এই টপিকের ভিডিওটি খুব শীঘ্রই যুক্ত করা হবে।</p>
              </div>
            )}
            <div className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-2xl font-bold text-white mb-2">{activeVideo.title}</h2>
              <p className="text-slate-400 text-sm flex items-center gap-2">
                <PlayCircle className="w-4 h-4" /> {activeVideo.duration || 'N/A'}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center min-h-[300px]">
            <PlayCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-300 mb-2">ভিডিও লেকচার পাওয়া যায়নি</h3>
            <p className="text-slate-400">শীঘ্রই এই অধ্যায়ের ভিডিও লেকচার যুক্ত করা হবে।</p>
          </div>
        )}
      </div>

      {/* Video Playlist */}
      <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden h-[600px] flex flex-col">
          <div className="p-4 border-b border-slate-700/50 bg-slate-800/50">
            <h3 className="font-bold text-white">ভিডিও লেকচার সমূহ</h3>
            <p className="text-xs text-slate-400 mt-1">{validVideos.length} টি ভিডিও</p>
          </div>
          <div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
            {validVideos.length > 0 ? (
              validVideos.map((video, idx) => (
                <button
                  key={video.id}
                  onClick={() => setActiveVideo(video)}
                  className={`w-full text-left p-3 rounded-xl flex items-start gap-3 transition-colors mb-1 ${
                    activeVideo?.id === video.id 
                      ? 'bg-indigo-500/20 border border-indigo-500/30' 
                      : 'hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  <span className={`text-sm font-bold mt-0.5 ${activeVideo?.id === video.id ? 'text-indigo-400' : 'text-slate-500'}`}>
                    {idx + 1}.
                  </span>
                  <div>
                    <p className={`text-sm font-semibold line-clamp-2 ${activeVideo?.id === video.id ? 'text-white' : 'text-slate-300'}`}>
                      {video.title}
                    </p>
                    {video.duration && <p className="text-xs text-slate-500 mt-1">{video.duration}</p>}
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-slate-500 text-sm mt-10">
                শীঘ্রই ভিডিও লেকচার যুক্ত করা হবে
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoTabContent;
