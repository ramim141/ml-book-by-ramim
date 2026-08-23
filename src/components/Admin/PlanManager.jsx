import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Save, Loader2, Tag, Package, Check, X, Percent, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirm } from '../../hooks/useConfirm';
import { useAuth } from '../../contexts/AuthContext';
import { usePlans, savePlans } from '../../hooks/usePlans';
import { listCoupons, saveCoupon, deleteCoupon, normalizeCode, applyDiscount } from '../../lib/coupons';
import { COUPON_TYPES } from '../../config/plans';
import { logAdminAction, AUDIT } from '../../lib/adminAudit';

const emptyPlan = () => ({
  id: `plan-${Date.now()}`, label: '', days: 30, price: 0, note: '', popular: false, active: true,
  features: [],
});

/**
 * প্ল্যানের বৈশিষ্ট্য — প্রতি লাইনে একটা।
 * টেক্সট-এরিয়া বেছে নিয়েছি কারণ একটা একটা করে ইনপুট যোগ/মোছার চেয়ে
 * অ্যাডমিনের পক্ষে পুরো তালিকা একসাথে লিখে ফেলা অনেক দ্রুত।
 */
const FeatureEditor = ({ value = [], onChange }) => (
  <div>
    <label className="mb-1 block text-[11px] font-semibold text-slate-500">
      বৈশিষ্ট্য — প্রতি লাইনে একটি ({value.length} টি)
    </label>
    <textarea
      rows={4}
      value={value.join('\n')}
      onChange={(e) => onChange(e.target.value.split('\n'))}
      onBlur={(e) => onChange(e.target.value.split('\n').map((l) => l.trim()).filter(Boolean))}
      placeholder={'আনলিমিটেড মডেল টেস্ট\nসব লাইভ এক্সামে অংশগ্রহণ\nPDF ডাউনলোড'}
      className="w-full resize-y"
    />
  </div>
);

const emptyCoupon = () => ({
  code: '', type: COUPON_TYPES.PERCENT, value: 10, maxUses: 0, planIds: [], active: true, expiresAt: '', note: '',
});

const dateInput = (ts) => {
  const d = ts?.toDate?.() || (ts ? new Date(ts) : null);
  if (!d || Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
};

/**
 * প্ল্যান ও কুপন — দুটোই অ্যাডমিনের সম্পূর্ণ নিয়ন্ত্রণে।
 * দাম বদলাতে আর কোড ডিপ্লয় করতে হয় না।
 */
export default function PlanManager() {
  const [confirm, confirmDialog] = useConfirm();
  const { currentUser } = useAuth();
  const { plans: allPlans, loading: plansLoading, refresh } = usePlans({ activeOnly: false });

  const [tab, setTab] = useState('plans');
  const [savingPlans, setSavingPlans] = useState(false);

  // খসড়া সরাসরি state এ না রেখে "সম্পাদনা শুরু হয়েছে কি না" দিয়ে বের করি।
  // এতে সার্ভারের তালিকা এলে ইফেক্ট দিয়ে setState করতে হয় না — টাইপ করার
  // সময় রিফেচ হলেও লেখা মুছে যায় না।
  const [edited, setEdited] = useState(null);
  const dirty = edited !== null;
  const draft = edited ?? allPlans.map((p) => ({ ...p }));

  const updatePlan = (i, patch) => {
    setEdited(draft.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  };

  const handleSavePlans = async () => {
    const bad = draft.find((p) => !p.label?.trim() || !(Number(p.days) > 0));
    if (bad) { toast.error('প্রতিটি প্ল্যানে নাম ও মেয়াদ (দিন) দিতে হবে।'); return; }

    setSavingPlans(true);
    try {
      const clean = draft.map((p) => ({
        ...p,
        label: p.label.trim(),
        days: Number(p.days) || 30,
        price: Number(p.price) || 0,
        note: (p.note || '').trim(),
        // টাইপ করার সময় ফাঁকা লাইন থাকতে পারে; সেভের আগে ছেঁটে নিই যাতে
        // ছাত্রের পাতায় খালি বুলেট না দেখায়
        features: (p.features || []).map((f) => String(f).trim()).filter(Boolean),
      }));
      await savePlans(clean);
      setEdited(null);
      refresh();
      logAdminAction({
        action: AUDIT.UPDATE, area: 'প্ল্যান',
        summary: `${clean.length} টি প্ল্যান হালনাগাদ করা হয়েছে`,
        actorEmail: currentUser?.email,
      });
      toast.success('প্ল্যান সেভ হয়েছে');
    } catch (err) {
      console.error(err);
      toast.error('সেভ করা যায়নি।');
    } finally {
      setSavingPlans(false);
    }
  };

  const removePlan = async (i) => {
    const ok = await confirm({
      title: 'প্ল্যানটি মুছবেন?',
      message: 'নতুন কেউ আর এটি কিনতে পারবে না। যাদের চলছে তাদের মেয়াদ ঠিকই থাকবে।',
    });
    if (!ok) return;
    setEdited(draft.filter((_, idx) => idx !== i));
  };

  // ── কুপন ────────────────────────────────────────────────────────
  const [couponsTick, setCouponsTick] = useState(0);
  const [couponsResult, setCouponsResult] = useState({ key: null, rows: [] });
  const [form, setForm] = useState(emptyCoupon());
  const [savingCoupon, setSavingCoupon] = useState(false);

  const couponsKey = `coupons:${couponsTick}`;
  const couponsLoading = couponsResult.key !== couponsKey;
  const coupons = couponsResult.key === couponsKey ? couponsResult.rows : [];

  useEffect(() => {
    let cancelled = false;
    listCoupons()
      .then((rows) => { if (!cancelled) setCouponsResult({ key: couponsKey, rows }); })
      .catch(() => { if (!cancelled) setCouponsResult({ key: couponsKey, rows: [] }); });
    return () => { cancelled = true; };
  }, [couponsKey]);

  const reloadCoupons = useCallback(() => setCouponsTick((t) => t + 1), []);

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    if (!normalizeCode(form.code)) { toast.error('কুপন কোড দিন'); return; }
    if (!(Number(form.value) > 0)) { toast.error('ছাড়ের পরিমাণ দিন'); return; }

    setSavingCoupon(true);
    try {
      const code = await saveCoupon(form);
      logAdminAction({
        action: AUDIT.CREATE, area: 'কুপন',
        summary: `কুপন ${code} সংরক্ষিত (${form.type === COUPON_TYPES.PERCENT ? form.value + '%' : '৳' + form.value})`,
        actorEmail: currentUser?.email,
      });
      setForm(emptyCoupon());
      reloadCoupons();
      toast.success(`কুপন ${code} সেভ হয়েছে`);
    } catch (err) {
      console.error(err);
      toast.error('কুপন সেভ করা যায়নি।');
    } finally {
      setSavingCoupon(false);
    }
  };

  const handleDeleteCoupon = async (c) => {
    const ok = await confirm({ title: `${c.code} মুছবেন?`, message: 'কোডটি আর কাজ করবে না।' });
    if (!ok) return;
    try {
      await deleteCoupon(c.code);
      logAdminAction({
        action: AUDIT.DELETE, area: 'কুপন',
        summary: `কুপন ${c.code} মুছে ফেলা হয়েছে`,
        actorEmail: currentUser?.email,
      });
      reloadCoupons();
    } catch (err) {
      console.error(err);
      toast.error('মুছে ফেলা যায়নি।');
    }
  };

  return (
    <div>
      {confirmDialog}

      <div className="mb-5 flex rounded-lg border border-white/[0.08] bg-white/[0.02] p-1">
        {[['plans', 'প্ল্যান', Package], ['coupons', 'কুপন', Tag]].map(([id, label, Icon]) => (
          <button key={id} type="button" onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition ${
              tab === id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}>
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      {tab === 'plans' ? (
        plansLoading ? (
          <div className="flex justify-center py-14"><Loader2 className="h-7 w-7 animate-spin text-indigo-500" /></div>
        ) : (
          <>
            <div className="space-y-3">
              {draft.map((p, i) => (
                <div key={p.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="grid gap-3 sm:grid-cols-[1fr_100px_110px]">
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-slate-500">নাম</label>
                      <input value={p.label} onChange={(e) => updatePlan(i, { label: e.target.value })} placeholder="যেমন: ৩ মাস" />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-slate-500">মেয়াদ (দিন)</label>
                      <input type="number" min="1" value={p.days} onChange={(e) => updatePlan(i, { days: e.target.value })} />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-slate-500">দাম (৳)</label>
                      <input type="number" min="0" value={p.price} onChange={(e) => updatePlan(i, { price: e.target.value })} />
                    </div>
                  </div>

                  <div className="mt-3">
                    <FeatureEditor
                      value={p.features || []}
                      onChange={(features) => updatePlan(i, { features })}
                    />
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-slate-500">ছোট নোট (ঐচ্ছিক)</label>
                      <input value={p.note || ''} onChange={(e) => updatePlan(i, { note: e.target.value })} placeholder="যেমন: সাশ্রয় ৯৮ টাকা" />
                    </div>
                    <div className="flex items-end gap-4 pb-1">
                      <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-300">
                        <input type="checkbox" checked={p.active !== false} onChange={(e) => updatePlan(i, { active: e.target.checked })} className="h-4 w-4 accent-indigo-500" />
                        চালু
                      </label>
                      <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-300">
                        <input type="checkbox" checked={!!p.popular} onChange={(e) => updatePlan(i, { popular: e.target.checked })} className="h-4 w-4 accent-indigo-500" />
                        জনপ্রিয় ব্যাজ
                      </label>
                      <button type="button" onClick={() => removePlan(i)} aria-label="মুছুন"
                        className="ml-auto rounded-lg p-1.5 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => setEdited([...draft, emptyPlan()])}
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-xs font-bold text-slate-300 transition hover:text-white">
                <Plus className="h-3.5 w-3.5" /> নতুন প্ল্যান
              </button>
              <button type="button" onClick={handleSavePlans} disabled={savingPlans || !dirty}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-500 disabled:opacity-40">
                {savingPlans ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                {dirty ? 'পরিবর্তন সেভ করুন' : 'সব সেভ করা আছে'}
              </button>
            </div>
          </>
        )
      ) : (
        <>
          {/* কুপন তৈরি */}
          <form onSubmit={handleSaveCoupon} className="mb-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">নতুন কুপন / সম্পাদনা</p>

            <div className="grid gap-3 sm:grid-cols-[1fr_120px_100px_120px]">
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-slate-500">কোড</label>
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="SAVE20" className="font-mono uppercase" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-slate-500">ধরন</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value={COUPON_TYPES.PERCENT}>শতাংশ (%)</option>
                  <option value={COUPON_TYPES.FIXED}>টাকা (৳)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-slate-500">পরিমাণ</label>
                <input type="number" min="1" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-slate-500">সর্বোচ্চ ব্যবহার</label>
                <input type="number" min="0" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} placeholder="০ = সীমাহীন" />
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-slate-500">মেয়াদ শেষ (ঐচ্ছিক)</label>
                <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-slate-500">কোন প্ল্যানে চলবে (কিছু না বাছলে সব)</label>
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {allPlans.map((p) => {
                    const on = form.planIds.includes(p.id);
                    return (
                      <button key={p.id} type="button"
                        onClick={() => setForm({ ...form, planIds: on ? form.planIds.filter((x) => x !== p.id) : [...form.planIds, p.id] })}
                        className={`rounded-md px-2 py-1 text-[11px] font-bold transition ${
                          on ? 'bg-indigo-500/20 text-indigo-200' : 'bg-white/5 text-slate-500 hover:text-slate-300'
                        }`}>
                        {p.label || p.id}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ছাড়ের ফল আগেই দেখাই — ভুল মান বসালে এখানেই ধরা পড়ে */}
            {Number(form.value) > 0 && allPlans.length > 0 && (
              <p className="mt-3 text-[11px] font-semibold text-emerald-400">
                উদাহরণ: ৳{allPlans[0].price} →{' '}
                ৳{applyDiscount(allPlans[0].price, { type: form.type, value: form.value }).final}
                {' '}({allPlans[0].label})
              </p>
            )}

            <button type="submit" disabled={savingCoupon}
              className="mt-4 flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-500 disabled:opacity-50">
              {savingCoupon ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} কুপন সেভ করুন
            </button>
          </form>

          {/* কুপনের তালিকা */}
          {couponsLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-indigo-500" /></div>
          ) : coupons.length === 0 ? (
            <div className="rounded-xl bg-white/[0.02] py-12 text-center">
              <Tag className="mx-auto mb-3 h-8 w-8 text-slate-700" />
              <p className="text-sm text-slate-500">কোনো কুপন নেই।</p>
            </div>
          ) : (
            <div className="space-y-2">
              {coupons.map((c) => {
                const expired = c.expiresAt?.toDate && c.expiresAt.toDate() < new Date();
                const exhausted = c.maxUses > 0 && (c.usedCount || 0) >= c.maxUses;
                const dead = c.active === false || expired || exhausted;
                return (
                  <div key={c.code} className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 ${
                    dead ? 'border-white/[0.06] bg-white/[0.01] opacity-60' : 'border-white/[0.06] bg-white/[0.02]'
                  }`}>
                    <span className="rounded-md bg-white/5 px-2 py-1 font-mono text-sm font-black text-white">{c.code}</span>

                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                      {c.type === COUPON_TYPES.PERCENT ? <Percent className="h-3 w-3" /> : <Banknote className="h-3 w-3" />}
                      {c.value}{c.type === COUPON_TYPES.PERCENT ? '%' : '৳'}
                    </span>

                    <span className="text-[11px] text-slate-500">
                      ব্যবহার {c.usedCount || 0}{c.maxUses > 0 ? `/${c.maxUses}` : ' (সীমাহীন)'}
                    </span>

                    {c.expiresAt && (
                      <span className="text-[11px] text-slate-500">মেয়াদ {dateInput(c.expiresAt)}</span>
                    )}

                    {c.planIds?.length > 0 && (
                      <span className="text-[11px] text-slate-600">
                        {c.planIds.length} টি প্ল্যানে
                      </span>
                    )}

                    <span className={`ml-auto flex items-center gap-1 text-[11px] font-bold ${dead ? 'text-slate-500' : 'text-emerald-400'}`}>
                      {dead ? <X className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                      {c.active === false ? 'বন্ধ' : expired ? 'মেয়াদ শেষ' : exhausted ? 'শেষ' : 'চালু'}
                    </span>

                    <button type="button" onClick={() => setForm({
                      code: c.code, type: c.type, value: c.value, maxUses: c.maxUses || 0,
                      planIds: c.planIds || [], active: c.active !== false,
                      expiresAt: dateInput(c.expiresAt), note: c.note || '',
                    })}
                      className="rounded-lg px-2 py-1 text-[11px] font-bold text-slate-400 transition hover:text-indigo-300">
                      সম্পাদনা
                    </button>
                    <button type="button" onClick={() => handleDeleteCoupon(c)} aria-label="মুছুন"
                      className="rounded-lg p-1.5 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
