import { useState, useEffect, useCallback } from 'react';
import { X, Save, FolderOpen, Trash2, Loader2, FileText, AlertTriangle, LayoutTemplate } from 'lucide-react';
import { listPapers, savePaper, deletePaper, estimatePaperSize, PAPER_SIZE_LIMIT } from '../../../../../lib/savedPapers';
import { enToBn } from '../../helpers.jsx';

/**
 * সংরক্ষিত প্রশ্নপত্র — সেভ, তালিকা, খোলা ও মুছে ফেলা।
 * খোলার সময় বর্তমান কাজ হারিয়ে যায় বলে নিশ্চিত করে নেওয়া হয়।
 */
export default function SavedPapersPanel({
  isOpen, onClose, uid, cart, headerInfo, marksConfig, printSettings, onLoad, confirm,
}) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);

  // ফলাফল কোন অনুরোধের জন্য এসেছে সেটাও রাখি — তাহলে "লোড হচ্ছে" অবস্থাটা
  // আলাদা state ছাড়াই বের করা যায়, আর ইফেক্টের ভিতরে সরাসরি setState
  // করতে হয় না (তাতে বাড়তি রেন্ডার-চক্র হতো)
  const [reloadTick, setReloadTick] = useState(0);
  const [result, setResult] = useState({ key: null, rows: [] });

  const loadKey = uid ? `${uid}:${reloadTick}` : null;
  const loading = Boolean(isOpen && uid && result.key !== loadKey);
  const papers = result.key === loadKey ? result.rows : [];

  const refresh = useCallback(() => setReloadTick((t) => t + 1), []);

  useEffect(() => {
    if (!isOpen || !uid || result.key === loadKey) return;
    let cancelled = false;

    listPapers(uid)
      .then((rows) => { if (!cancelled) setResult({ key: loadKey, rows }); })
      .catch((err) => {
        console.error(err);
        if (!cancelled) {
          setResult({ key: loadKey, rows: [] });
          setError('তালিকা আনা যায়নি।');
        }
      });

    return () => { cancelled = true; };
  }, [isOpen, uid, loadKey, result.key]);

  const size = estimatePaperSize(cart);
  const tooBig = size > PAPER_SIZE_LIMIT;

  const handleSave = async () => {
    if (!saveAsTemplate) {
      if (cart.length === 0) { setError('আগে কিছু প্রশ্ন নির্বাচন করুন।'); return; }
      if (tooBig) { setError('কাগজটি অনেক বড় — কিছু প্রশ্ন কমিয়ে আবার চেষ্টা করুন।'); return; }
    }

    setSaving(true);
    setError(null);
    try {
      await savePaper(uid, { name, cart, headerInfo, marksConfig, printSettings, isTemplate: saveAsTemplate });
      setName('');
      refresh();
    } catch (err) {
      console.error(err);
      setError('সেভ করা যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setSaving(false);
    }
  };

  const handleOpen = async (paper) => {
    if (!paper.isTemplate && cart.length > 0) {
      const ok = await confirm({
        title: 'এই প্রশ্নপত্রটি খুলবেন?',
        message: 'এখন নির্বাচিত প্রশ্নগুলো সরে গিয়ে সংরক্ষিত কাগজটি আসবে।',
        confirmLabel: 'হ্যাঁ, খুলুন',
      });
      if (!ok) return;
    }
    onLoad(paper);
    onClose();
  };

  const handleDelete = async (paper) => {
    const ok = await confirm({
      title: 'মুছে ফেলবেন?',
      message: `"${paper.name}" স্থায়ীভাবে মুছে যাবে।`,
    });
    if (!ok) return;
    try {
      await deletePaper(uid, paper.id);
      refresh();
    } catch (err) {
      console.error(err);
      setError('মুছে ফেলা যায়নি।');
    }
  };

  return (
    <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}>
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      <aside className={`absolute bottom-0 right-0 top-0 flex w-full max-w-[420px] flex-col border-l border-slate-800 bg-[#0b0f19] shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-800 px-4 py-3.5">
          <h2 className="flex items-center gap-2 text-sm font-black text-white">
            <FolderOpen className="h-4 w-4 text-indigo-400" /> সংরক্ষিত প্রশ্নপত্র
          </h2>
          <button type="button" onClick={onClose} aria-label="বন্ধ করুন"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* এখনকার কাগজ সেভ করা */}
        <div className="shrink-0 space-y-2 border-b border-slate-800 p-4">
          <p className="text-[11px] font-bold text-slate-400">
            {saveAsTemplate ? 'হেডার, নম্বর ও প্রিন্ট সেটআপ টেমপ্লেট হিসেবে সেভ করুন' : (
              <>এখনকার কাগজ সেভ করুন — <span className="text-slate-300">{enToBn(cart.length)} টি প্রশ্ন</span></>
            )}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder={saveAsTemplate ? 'টেমপ্লেটের নাম (যেমন: স্ট্যান্ডার্ড A4 ফরম্যাট)' : 'কাগজের নাম (যেমন: ICT ১ম সাময়িক)'}
              className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500 placeholder:text-slate-600"
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || (!saveAsTemplate && (cart.length === 0 || tooBig))}
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} সেভ
            </button>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-[11px] font-semibold text-slate-400">
            <input
              type="checkbox"
              checked={saveAsTemplate}
              onChange={(e) => setSaveAsTemplate(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-900 accent-indigo-600"
            />
            টেমপ্লেট হিসেবে সেভ করুন (প্রশ্ন ছাড়া শুধু বিন্যাস)
          </label>

          {!saveAsTemplate && tooBig && (
            <p className="flex items-start gap-1.5 text-[11px] font-semibold text-amber-400">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              কাগজটি অনেক বড় ({Math.round(size / 1024)}KB) — প্রশ্ন কমাতে হবে।
            </p>
          )}
          {error && <p className="text-[11px] font-semibold text-rose-400">{error}</p>}
        </div>

        {/* তালিকা */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-indigo-500" /></div>
          ) : papers.length === 0 ? (
            <div className="py-10 text-center">
              <FileText className="mx-auto mb-3 h-9 w-9 text-slate-700" />
              <p className="text-sm text-slate-500">এখনো কোনো কাগজ সেভ করা হয়নি।</p>
            </div>
          ) : (
            <div className="space-y-5">
              <PaperGroup
                title="সংরক্ষিত কাগজ"
                rows={papers.filter((p) => !p.isTemplate)}
                onOpen={handleOpen}
                onDelete={handleDelete}
              />
              <PaperGroup
                title="টেমপ্লেট"
                icon={LayoutTemplate}
                rows={papers.filter((p) => p.isTemplate)}
                onOpen={handleOpen}
                onDelete={handleDelete}
              />
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function PaperGroup({ title, icon: Icon, rows, onOpen, onDelete }) {
  if (rows.length === 0) return null;
  return (
    <div>
      <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-slate-500">
        {Icon && <Icon className="h-3.5 w-3.5" />} {title}
      </h3>
      <div className="space-y-2">
        {rows.map((p) => (
          <div key={p.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
            <div className="mb-2 min-w-0">
              <p className="truncate text-sm font-bold text-slate-100">{p.name}</p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {p.isTemplate ? 'শুধু বিন্যাস' : `${enToBn(p.questionCount || 0)} টি প্রশ্ন`}
                {p.subject ? ` · ${p.subject}` : ''}
                {p.updatedAt ? ` · ${p.updatedAt.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })}` : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onOpen(p)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-[11px] font-bold text-slate-200 transition hover:bg-slate-700"
              >
                <FolderOpen className="h-3.5 w-3.5" /> {p.isTemplate ? 'প্রয়োগ করুন' : 'খুলুন'}
              </button>
              <button
                type="button"
                onClick={() => onDelete(p)}
                aria-label="মুছে ফেলুন"
                className="rounded-lg border border-slate-800 px-2.5 py-1.5 text-slate-500 transition hover:border-rose-500/40 hover:text-rose-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
