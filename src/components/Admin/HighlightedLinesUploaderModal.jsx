import React from 'react';
import { X, Sparkles } from 'lucide-react';
import HighlightedLinesManagerTab from './HighlightedLinesManagerTab';

export default function HighlightedLinesUploaderModal({
  isOpen,
  onClose,
  initialProgramId = 'medical',
  initialSubjectId = '',
  initialChapterId = '',
  programSubjectsMap = {},
  onSuccess
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-950 border border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-slate-900/90 backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white">
                হাইলাইটেড লাইনস ও টপিক এডিটর (CRUD)
              </h2>
              <p className="text-[11px] text-slate-400">
                টপিক ও দাগানো লাইনস তৈরি, সম্পাদনা, ডিলিট ও JSON কোড ম্যানেজ করুন
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          <HighlightedLinesManagerTab
            programId={initialProgramId}
            programSubjectsMap={programSubjectsMap}
            onDataUpdated={() => {
              if (onSuccess) onSuccess();
            }}
          />
        </div>

      </div>
    </div>
  );
}
