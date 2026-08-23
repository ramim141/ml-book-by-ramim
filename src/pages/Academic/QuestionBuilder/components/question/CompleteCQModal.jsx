import React, { useState, useMemo, useEffect } from 'react';
import { X, Sparkles, Wand2, Check, HelpCircle, BookOpen, ChevronDown, ChevronUp, Search, PenLine, ListChecks } from 'lucide-react';
import { enToBn, MarkdownRenderer, cleanPrefix } from '../../helpers.jsx';

/**
 * পূর্ণ CQ মেকার মোডাল:
 * যে সব CQ-তে শুধু গ ও ঘ আছে, সেগুলোতে অধ্যায়ের জ্ঞানমূলক (ক) ও অনুধাবনমূলক (খ)
 * প্রশ্ন বাছাই করে বা নিজে লিখে দিয়ে পূর্ণ সৃজনশীল (ক, খ, গ, ঘ) তৈরির ইন্টারঅ্যাক্টিভ উইন্ডো।
 */
const CompleteCQModal = ({
  isOpen,
  onClose,
  cq,
  knowledgePool = [],
  onSave,
}) => {
  const [kaMode, setKaMode] = useState('pool'); // 'pool' | 'custom'
  const [khaMode, setKhaMode] = useState('pool'); // 'pool' | 'custom'

  const [kaText, setKaText] = useState('');
  const [kaAnswer, setKaAnswer] = useState('');
  const [selectedKaId, setSelectedKaId] = useState('');

  const [khaText, setKhaText] = useState('');
  const [khaAnswer, setKhaAnswer] = useState('');
  const [selectedKhaId, setSelectedKhaId] = useState('');

  const [kaSearch, setKaSearch] = useState('');
  const [khaSearch, setKhaSearch] = useState('');

  const [showStemPreview, setShowStemPreview] = useState(true);

  // অধ্যায়ের সাথে মিলে এমন জ্ঞান (ক) ও অনুধাবন (খ) প্রশ্ন ফিল্টার
  const chapterKQuestions = useMemo(() => {
    if (!cq) return [];
    return knowledgePool.filter((q) => {
      const isK = q.type === 'k';
      const isSameChapter = cq.chapterId ? q.chapterId === cq.chapterId : true;
      return isK && isSameChapter;
    });
  }, [knowledgePool, cq]);

  const allKQuestions = useMemo(() => {
    return knowledgePool.filter((q) => q.type === 'k');
  }, [knowledgePool]);

  const availableKList = chapterKQuestions.length > 0 ? chapterKQuestions : allKQuestions;

  const chapterKhQuestions = useMemo(() => {
    if (!cq) return [];
    return knowledgePool.filter((q) => {
      const isKh = q.type === 'kh';
      const isSameChapter = cq.chapterId ? q.chapterId === cq.chapterId : true;
      return isKh && isSameChapter;
    });
  }, [knowledgePool, cq]);

  const allKhQuestions = useMemo(() => {
    return knowledgePool.filter((q) => q.type === 'kh');
  }, [knowledgePool]);

  const availableKhList = chapterKhQuestions.length > 0 ? chapterKhQuestions : allKhQuestions;

  // মোডাল ওপেন হলে বর্তমান CQ-এর ক ও খ ইনিশিয়ালাইজ করা
  useEffect(() => {
    if (!isOpen || !cq) return;

    const existingKa = cq.questions?.ka || '';
    const existingKha = cq.questions?.kha || '';

    setKaText(existingKa);
    setKaAnswer(cq.answers?.ka || '');
    setKhaText(existingKha);
    setKhaAnswer(cq.answers?.kha || '');

    setKaMode(existingKa ? 'custom' : 'pool');
    setKhaMode(existingKha ? 'custom' : 'pool');
    setSelectedKaId('');
    setSelectedKhaId('');
    setKaSearch('');
    setKhaSearch('');
  }, [isOpen, cq]);

  // ফিল্টার্ড সার্চ লিস্ট
  const filteredKList = useMemo(() => {
    if (!kaSearch.trim()) return availableKList;
    const term = kaSearch.toLowerCase();
    return availableKList.filter((q) => (q.question || '').toLowerCase().includes(term) || (q.topic || '').toLowerCase().includes(term));
  }, [availableKList, kaSearch]);

  const filteredKhList = useMemo(() => {
    if (!khaSearch.trim()) return availableKhList;
    const term = khaSearch.toLowerCase();
    return availableKhList.filter((q) => (q.question || '').toLowerCase().includes(term) || (q.topic || '').toLowerCase().includes(term));
  }, [availableKhList, khaSearch]);

  // ক নির্বাচন করা
  const handleSelectKa = (kItem) => {
    setSelectedKaId(kItem.uniqueId);
    setKaText(cleanPrefix(kItem.question || ''));
    setKaAnswer(kItem.answer || '');
  };

  // খ নির্বাচন করা
  const handleSelectKha = (khItem) => {
    setSelectedKhaId(khItem.uniqueId);
    setKhaText(cleanPrefix(khItem.question || ''));
    setKhaAnswer(khItem.answer || '');
  };

  // ১-ক্লিকে স্বয়ংক্রিয় মেলানো (Random match from chapter)
  const handleAutoMatchBoth = () => {
    if (availableKList.length > 0) {
      const randK = availableKList[Math.floor(Math.random() * availableKList.length)];
      handleSelectKa(randK);
      setKaMode('pool');
    }
    if (availableKhList.length > 0) {
      const randKh = availableKhList[Math.floor(Math.random() * availableKhList.length)];
      handleSelectKha(randKh);
      setKhaMode('pool');
    }
  };

  // ক এর জন্য র‍্যান্ডম
  const handleRandomKa = () => {
    if (availableKList.length > 0) {
      const randK = availableKList[Math.floor(Math.random() * availableKList.length)];
      handleSelectKa(randK);
      setKaMode('pool');
    }
  };

  // খ এর জন্য র‍্যান্ডম
  const handleRandomKha = () => {
    if (availableKhList.length > 0) {
      const randKh = availableKhList[Math.floor(Math.random() * availableKhList.length)];
      handleSelectKha(randKh);
      setKhaMode('pool');
    }
  };

  // সংরক্ষণ করা
  const handleSave = () => {
    if (!cq) return;

    const updatedCq = {
      ...cq,
      questions: {
        ...(cq.questions || {}),
        ka: kaText.trim(),
        kha: khaText.trim(),
        ga: cq.questions?.ga || '',
        gha: cq.questions?.gha || '',
      },
      answers: {
        ...(cq.answers || {}),
        ka: kaAnswer?.trim() || '',
        kha: khaAnswer?.trim() || '',
        ga: cq.answers?.ga || '',
        gha: cq.answers?.gha || '',
      },
      isFullCq: Boolean(kaText.trim() && khaText.trim()),
    };

    onSave(updatedCq);
    onClose();
  };

  if (!isOpen || !cq) return null;

  const isComplete = Boolean(kaText.trim() && khaText.trim());

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-5">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-700/70 bg-[#0d121f] text-slate-200 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/[0.08] bg-slate-900/60 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-500/15 p-2 text-violet-400 border border-violet-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">পূর্ণ CQ মেকার (ক, খ, গ, ঘ)</h2>
                <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-black text-emerald-300 border border-emerald-500/30">
                  ১০ নম্বর
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {cq.chapterName || 'অধ্যায়'} {cq.topic ? `· ${cq.topic}` : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Magic Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] bg-violet-950/20 px-5 py-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-violet-200">
            <Wand2 className="h-4 w-4 text-violet-400" />
            <span>অধ্যায়ে <strong className="text-white">{enToBn(availableKList.length)}</strong> টি জ্ঞান ও <strong className="text-white">{enToBn(availableKhList.length)}</strong> টি অনুধাবন প্রশ্ন আছে</span>
          </div>

          <button
            type="button"
            onClick={handleAutoMatchBoth}
            className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-violet-600/30 transition hover:bg-violet-500 active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5" /> ১-ক্লিকে ক ও খ স্বয়ংক্রিয় মেলান
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {/* CQ Stem & Existing (গ ও ঘ) Preview */}
          <div className="rounded-xl border border-white/[0.07] bg-slate-900/40 p-3.5">
            <button
              type="button"
              onClick={() => setShowStemPreview(!showStemPreview)}
              className="flex w-full items-center justify-between text-left text-xs font-bold text-slate-300"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-400" />
                <span>উদ্দীপক ও বর্তমান (গ ও ঘ) প্রশ্নাবলী</span>
              </div>
              {showStemPreview ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
            </button>

            {showStemPreview && (
              <div className="mt-3 space-y-2.5 border-t border-white/[0.05] pt-3 text-xs leading-relaxed text-slate-300">
                {cq.stem && (
                  <div className="rounded-lg bg-black/20 p-2.5">
                    <span className="font-bold text-slate-400">উদ্দীপক: </span>
                    <MarkdownRenderer content={cq.stem} className="prose-p:my-0 text-slate-300 text-xs" />
                  </div>
                )}
                {cq.questions?.ga && (
                  <div className="flex gap-2">
                    <span className="shrink-0 font-bold text-emerald-400">(গ)</span>
                    <div className="min-w-0 flex-1">
                      <MarkdownRenderer content={cleanPrefix(cq.questions.ga)} className="prose-p:my-0 text-slate-300 text-xs" />
                    </div>
                  </div>
                )}
                {cq.questions?.gha && (
                  <div className="flex gap-2">
                    <span className="shrink-0 font-bold text-emerald-400">(ঘ)</span>
                    <div className="min-w-0 flex-1">
                      <MarkdownRenderer content={cleanPrefix(cq.questions.gha)} className="prose-p:my-0 text-slate-300 text-xs" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section: 'ক' (জ্ঞানমূলক প্রশ্ন - ১ নম্বর) */}
          <div className="rounded-xl border border-violet-500/20 bg-slate-900/30 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-500/20 text-xs font-black text-violet-300">
                  ক
                </span>
                <span className="text-xs font-extrabold text-white">জ্ঞানমূলক প্রশ্ন (১ নম্বর)</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleRandomKa}
                  className="rounded-lg bg-white/5 px-2 py-1 text-[11px] font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition"
                  title="অধ্যায় থেকে র‍্যান্ডম ক প্রশ্ন বাছাই"
                >
                  🎲 র‍্যান্ডম ক
                </button>
                <div className="flex rounded-lg bg-slate-950 p-0.5 border border-white/10 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setKaMode('pool')}
                    className={`rounded-md px-2 py-1 transition ${kaMode === 'pool' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    অধ্যায় থেকে
                  </button>
                  <button
                    type="button"
                    onClick={() => setKaMode('custom')}
                    className={`rounded-md px-2 py-1 transition ${kaMode === 'custom' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    নিজে লিখুন
                  </button>
                </div>
              </div>
            </div>

            {kaMode === 'pool' ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 rounded-lg bg-slate-950 border border-slate-800 px-2.5 py-1.5 text-xs">
                  <Search className="h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={kaSearch}
                    onChange={(e) => setKaSearch(e.target.value)}
                    placeholder="জ্ঞানমূলক প্রশ্ন খুঁজুন..."
                    className="w-full bg-transparent text-white focus:outline-none text-xs"
                  />
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                  {filteredKList.length === 0 && (
                    <p className="text-center py-3 text-xs text-slate-500">কোনো জ্ঞানমূলক প্রশ্ন পাওয়া যায়নি।</p>
                  )}
                  {filteredKList.map((item) => {
                    const isSelected = selectedKaId === item.uniqueId || kaText === cleanPrefix(item.question);
                    return (
                      <div
                        key={item.uniqueId || item.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleSelectKa(item)}
                        className={`flex items-start gap-2 rounded-lg p-2.5 text-xs transition cursor-pointer border ${
                          isSelected
                            ? 'border-violet-500/50 bg-violet-500/15 text-white ring-1 ring-violet-500/30'
                            : 'border-white/[0.04] bg-white/[0.02] text-slate-300 hover:bg-white/[0.05]'
                        }`}
                      >
                        <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                          isSelected ? 'border-violet-500 bg-violet-600 text-white' : 'border-slate-600 text-transparent'
                        }`}>
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium leading-relaxed">{cleanPrefix(item.question)}</p>
                          {item.topic && <span className="text-[10px] text-slate-500">টপিক: {item.topic}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  rows={2}
                  value={kaText}
                  onChange={(e) => setKaText(e.target.value)}
                  placeholder="জ্ঞানমূলক প্রশ্ন (ক) লিখুন..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 p-2.5 text-xs text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={kaAnswer}
                  onChange={(e) => setKaAnswer(e.target.value)}
                  placeholder="জ্ঞানমূলক প্রশ্নের উত্তর (ঐচ্ছিক — উত্তরপত্রে ছাপার জন্য)"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/50 px-2.5 py-1.5 text-xs text-slate-300 placeholder:text-slate-600 focus:border-violet-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Section: 'খ' (অনুধাবনমূলক প্রশ্ন - ২ নম্বর) */}
          <div className="rounded-xl border border-indigo-500/20 bg-slate-900/30 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/20 text-xs font-black text-indigo-300">
                  খ
                </span>
                <span className="text-xs font-extrabold text-white">অনুধাবনমূলক প্রশ্ন (২ নম্বর)</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleRandomKha}
                  className="rounded-lg bg-white/5 px-2 py-1 text-[11px] font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition"
                  title="অধ্যায় থেকে র‍্যান্ডম খ প্রশ্ন বাছাই"
                >
                  🎲 র‍্যান্ডম খ
                </button>
                <div className="flex rounded-lg bg-slate-950 p-0.5 border border-white/10 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setKhaMode('pool')}
                    className={`rounded-md px-2 py-1 transition ${khaMode === 'pool' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    অধ্যায় থেকে
                  </button>
                  <button
                    type="button"
                    onClick={() => setKhaMode('custom')}
                    className={`rounded-md px-2 py-1 transition ${khaMode === 'custom' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    নিজে লিখুন
                  </button>
                </div>
              </div>
            </div>

            {khaMode === 'pool' ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 rounded-lg bg-slate-950 border border-slate-800 px-2.5 py-1.5 text-xs">
                  <Search className="h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={khaSearch}
                    onChange={(e) => setKhaSearch(e.target.value)}
                    placeholder="অনুধাবনমূলক প্রশ্ন খুঁজুন..."
                    className="w-full bg-transparent text-white focus:outline-none text-xs"
                  />
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                  {filteredKhList.length === 0 && (
                    <p className="text-center py-3 text-xs text-slate-500">কোনো অনুধাবনমূলক প্রশ্ন পাওয়া যায়নি।</p>
                  )}
                  {filteredKhList.map((item) => {
                    const isSelected = selectedKhaId === item.uniqueId || khaText === cleanPrefix(item.question);
                    return (
                      <div
                        key={item.uniqueId || item.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleSelectKha(item)}
                        className={`flex items-start gap-2 rounded-lg p-2.5 text-xs transition cursor-pointer border ${
                          isSelected
                            ? 'border-indigo-500/50 bg-indigo-500/15 text-white ring-1 ring-indigo-500/30'
                            : 'border-white/[0.04] bg-white/[0.02] text-slate-300 hover:bg-white/[0.05]'
                        }`}
                      >
                        <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                          isSelected ? 'border-indigo-500 bg-indigo-600 text-white' : 'border-slate-600 text-transparent'
                        }`}>
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium leading-relaxed">{cleanPrefix(item.question)}</p>
                          {item.topic && <span className="text-[10px] text-slate-500">টপিক: {item.topic}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  rows={2}
                  value={khaText}
                  onChange={(e) => setKhaText(e.target.value)}
                  placeholder="অনুধাবনমূলক প্রশ্ন (খ) লিখুন..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 p-2.5 text-xs text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={khaAnswer}
                  onChange={(e) => setKhaAnswer(e.target.value)}
                  placeholder="অনুধাবনমূলক প্রশ্নের উত্তর (ঐচ্ছিক — উত্তরপত্রে ছাপার জন্য)"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/50 px-2.5 py-1.5 text-xs text-slate-300 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-white/[0.08] bg-slate-900/80 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isComplete ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-amber-400'}`} />
            <span className="text-xs font-semibold text-slate-300">
              {isComplete ? 'ক, খ, গ, ঘ সম্পন্ন (১০ নম্বর)' : 'ক বা খ এখনও ফাঁকা'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-bold text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!kaText.trim() && !khaText.trim()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2 text-xs font-black text-white shadow-lg shadow-violet-600/25 transition hover:from-violet-500 hover:to-indigo-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Check className="h-4 w-4" /> পূর্ণ CQ সংরক্ষণ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteCQModal;
