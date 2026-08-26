import { useState, useCallback, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Check, X, Loader2, Clock, ShieldCheck, AlertTriangle, Copy, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirm } from '../../hooks/useConfirm';
import { useAuth } from '../../contexts/AuthContext';
import { approvePayment, rejectPayment, findByTrxId, PAYMENT_STATUS } from '../../lib/subscription';
import { markCouponUsed } from '../../lib/coupons';
import { logAdminAction, AUDIT } from '../../lib/adminAudit';
import { downloadCSV, dateStamp } from '../../lib/adminExport';

const TABS = [
  { id: PAYMENT_STATUS.PENDING, label: 'অপেক্ষমাণ' },
  { id: PAYMENT_STATUS.APPROVED, label: 'অনুমোদিত' },
  { id: PAYMENT_STATUS.REJECTED, label: 'বাতিল' },
];

const fmt = (ts) => {
  const d = ts?.toDate?.() || (ts ? new Date(ts) : null);
  return d ? d.toLocaleString('bn-BD', { dateStyle: 'short', timeStyle: 'short' }) : '—';
};

/**
 * বিকাশ পেমেন্টের অনুরোধ যাচাই ও অনুমোদন।
 *
 * অনুমোদন করলেই `users/{uid}` এ `plan` ও `planExpiry` বসে — এটাই একমাত্র
 * পথ, কারণ rules অনুযায়ী ছাত্র নিজে ঐ ফিল্ড দুটো লিখতে পারে না।
 */
export default function PaymentManager() {
  const [confirm, confirmDialog] = useConfirm();
  const { currentUser } = useAuth();

  const [tab, setTab] = useState(PAYMENT_STATUS.PENDING);
  const [busyId, setBusyId] = useState(null);

  // ফলাফল কোন অনুরোধের জন্য এসেছে সেটাও রাখি — তাহলে "লোড হচ্ছে" অবস্থাটা
  // derived হয়, ইফেক্টের ভিতরে সরাসরি setState করতে হয় না
  const [result, setResult] = useState({ key: null, rows: [], dupes: {} });
  const [tick, setTick] = useState(0);

  const loadKey = `${tab}:${tick}`;
  const loading = result.key !== loadKey;
  const rows = result.key === loadKey ? result.rows : [];
  // একই ট্রানজেকশন আইডি আগে ব্যবহার হয়েছে কি না — {reqId: কতবার}
  const dupes = result.key === loadKey ? result.dupes : {};

  const load = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const snap = await getDocs(query(collection(db, 'payment_requests'), where('status', '==', tab)));
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));

        // অপেক্ষমাণগুলোর ক্ষেত্রেই কেবল ডুপ্লিকেট যাচাই করি — অনুমোদিত
        // তালিকায় এটা অপ্রয়োজনীয় রিড খরচ করত
        const found = {};
        if (tab === PAYMENT_STATUS.PENDING) {
          const dupeResults = await Promise.all(list.map((r) => findByTrxId(r.trxId)));
          list.forEach((r, i) => {
            if (dupeResults[i].length > 1) found[r.id] = dupeResults[i].length;
          });
        }

        if (!cancelled) setResult({ key: loadKey, rows: list, dupes: found });
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setResult({ key: loadKey, rows: [], dupes: {} });
          toast.error('তালিকা আনা যায়নি।');
        }
      }
    })();

    return () => { cancelled = true; };
  }, [loadKey, tab]);

  const handleApprove = async (req) => {
    const warnDupe = dupes[req.id]
      ? `\n\n⚠️ এই ট্রানজেকশন আইডি ${dupes[req.id]} বার জমা পড়েছে — বিকাশ অ্যাপে মিলিয়ে দেখুন।`
      : '';
    const ok = await confirm({
      title: 'অনুমোদন করবেন?',
      message: `${req.userName || req.email} কে ${req.planLabel} (৳${req.amount}) প্রিমিয়াম দেওয়া হবে।${warnDupe}`,
      confirmLabel: 'হ্যাঁ, অনুমোদন করুন',
      tone: 'primary',
    });
    if (!ok) return;

    setBusyId(req.id);
    try {
      const expiry = await approvePayment({ requestId: req.id, request: req, adminEmail: currentUser?.email });
      // কুপনের ব্যবহার এখানেই গোনা হয় — জমা দেওয়ার সময় নয়, কারণ
      // অনুরোধ বাতিলও হতে পারত
      if (req.couponCode) await markCouponUsed(req.couponCode);
      logAdminAction({
        action: AUDIT.UPDATE,
        area: 'পেমেন্ট',
        summary: `${req.userName || req.email} — ${req.planLabel} প্রিমিয়াম অনুমোদিত`,
        details: { uid: req.uid, trxId: req.trxId, amount: req.amount, until: expiry.toISOString().slice(0, 10) },
        actorEmail: currentUser?.email,
      });
      toast.success('অনুমোদিত হয়েছে');
      load();
    } catch (err) {
      console.error(err);
      toast.error('অনুমোদন করা যায়নি।');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (req) => {
    const ok = await confirm({
      title: 'বাতিল করবেন?',
      message: `${req.userName || req.email} এর অনুরোধটি বাতিল হবে।`,
    });
    if (!ok) return;

    setBusyId(req.id);
    try {
      await rejectPayment({ requestId: req.id, adminEmail: currentUser?.email });
      logAdminAction({
        action: AUDIT.UPDATE,
        area: 'পেমেন্ট',
        summary: `${req.userName || req.email} এর পেমেন্ট অনুরোধ বাতিল`,
        details: { uid: req.uid, trxId: req.trxId },
        actorEmail: currentUser?.email,
      });
      load();
    } catch (err) {
      console.error(err);
      toast.error('বাতিল করা যায়নি।');
    } finally {
      setBusyId(null);
    }
  };

  const exportRows = () => {
    downloadCSV(
      rows,
      [
        { key: 'userName', label: 'নাম' },
        { key: 'email', label: 'ইমেইল' },
        { key: 'planLabel', label: 'প্ল্যান' },
        { key: 'amount', label: 'টাকা' },
        { key: 'trxId', label: 'ট্রানজেকশন আইডি' },
        { key: 'senderNumber', label: 'প্রেরকের নম্বর' },
        { key: 'status', label: 'অবস্থা' },
        { key: 'createdAt', label: 'জমার সময়', map: (r) => fmt(r.createdAt) },
      ],
      `payments-${tab}-${dateStamp()}`
    );
  };

  const totalTaka = rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);

  return (
    <div>
      {confirmDialog}

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border border-white/[0.08] bg-white/[0.02] p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${
                tab === t.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button type="button" onClick={load}
          className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:text-white">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> রিফ্রেশ
        </button>

        <div className="ml-auto flex items-center gap-3">
          {rows.length > 0 && (
            <span className="text-xs font-bold text-emerald-400">মোট ৳{totalTaka}</span>
          )}
          <button type="button" onClick={exportRows} disabled={rows.length === 0}
            className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:text-emerald-300 disabled:opacity-40">
            CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-14"><Loader2 className="h-7 w-7 animate-spin text-indigo-500" /></div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl bg-white/[0.02] py-14 text-center">
          <Clock className="mx-auto mb-3 h-9 w-9 text-slate-700" />
          <p className="text-sm text-slate-500">এই তালিকায় কিছু নেই।</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-100">{r.userName || 'নামহীন'}</p>
                  <p className="truncate text-xs text-slate-500">{r.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-emerald-400">৳{r.amount}</p>
                  <p className="text-[11px] text-slate-500">{r.planLabel}</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                <span className="flex items-center gap-1.5 text-slate-400">
                  TrxID:
                  <span className="font-mono font-bold text-slate-200">{r.trxId}</span>
                  <button type="button" onClick={() => navigator.clipboard?.writeText(r.trxId)}
                    className="rounded p-0.5 text-slate-600 transition hover:text-slate-300" aria-label="কপি">
                    <Copy className="h-3 w-3" />
                  </button>
                </span>
                {r.senderNumber && <span className="text-slate-500">থেকে: {r.senderNumber}</span>}
                {r.couponCode && (
                  <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-300">
                    {r.couponCode}{r.listPrice > r.amount ? ' · ছাড় ৳' + (r.listPrice - r.amount) : ''}
                  </span>
                )}
                <span className="text-slate-600">{fmt(r.createdAt)}</span>
              </div>

              {dupes[r.id] && (
                <p className="mt-2 flex items-start gap-1.5 rounded-lg border border-amber-500/25 bg-amber-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-amber-200">
                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                  এই ট্রানজেকশন আইডি {dupes[r.id]} বার জমা পড়েছে — বিকাশ অ্যাপে মিলিয়ে দেখুন।
                </p>
              )}

              {r.status === PAYMENT_STATUS.PENDING ? (
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleApprove(r)}
                    disabled={busyId === r.id}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {busyId === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    অনুমোদন
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(r)}
                    disabled={busyId === r.id}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-300 transition hover:bg-rose-500/20 disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" /> বাতিল
                  </button>
                </div>
              ) : (
                <p className={`mt-2 flex items-center gap-1.5 text-[11px] font-bold ${
                  r.status === PAYMENT_STATUS.APPROVED ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {r.status === PAYMENT_STATUS.APPROVED ? <ShieldCheck className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                  {r.status === PAYMENT_STATUS.APPROVED ? 'অনুমোদিত' : 'বাতিল'}
                  {r.reviewedBy ? ` · ${r.reviewedBy}` : ''}
                  {r.grantedUntil ? ` · মেয়াদ ${fmt(r.grantedUntil)}` : ''}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
