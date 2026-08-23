import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Check, Copy, Loader2, ShieldCheck, Clock, Sparkles, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';
import { useSubscription } from '../../../hooks/useSubscription';
import { BKASH, PREMIUM_FEATURES } from '../../../config/plans';
import { usePlans } from '../../../hooks/usePlans';
import { validateCoupon, applyDiscount } from '../../../lib/coupons';
import { submitPaymentRequest, getPendingRequest } from '../../../lib/subscription';
import { toBn } from '../../../lib/format';

/**
 * ম্যানুয়াল বিকাশ পেমেন্ট — ছাত্র টাকা পাঠিয়ে ট্রানজেকশন আইডি জমা দেয়,
 * অ্যাডমিন মিলিয়ে দেখে অনুমোদন করেন। কোনো গেটওয়ে লাগে না।
 */
export default function SubscriptionPage() {
  const { currentUser } = useAuth();
  const { premium, daysLeft, refresh } = useSubscription();

  const { plans } = usePlans();
  const [selected, setSelected] = useState(null);
  // প্ল্যান লোড হওয়ার আগে selected null; এলে জনপ্রিয়টা ধরে নিই
  const activePlan = plans.find((p) => p.id === selected) || plans.find((p) => p.popular) || plans[0] || null;
  const planId = activePlan?.id || null;

  // কুপন
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponMsg, setCouponMsg] = useState(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [trxId, setTrxId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pending, setPending] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getPendingRequest(currentUser?.uid)
      .then((r) => { if (!cancelled) { setPending(r); setChecking(false); } })
      .catch(() => { if (!cancelled) setChecking(false); });
    return () => { cancelled = true; };
  }, [currentUser?.uid]);

  const pricing = applyDiscount(activePlan?.price || 0, coupon);

  const handleApplyCoupon = async () => {
    setCheckingCoupon(true);
    setCouponMsg(null);
    const res = await validateCoupon(couponInput, planId);
    if (res.ok) {
      setCoupon(res.coupon);
      setCouponMsg({ ok: true, text: 'কুপন প্রয়োগ হয়েছে' });
    } else {
      setCoupon(null);
      setCouponMsg({ ok: false, text: res.reason });
    }
    setCheckingCoupon(false);
  };

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(BKASH.number);
      toast.success('নম্বর কপি হয়েছে');
    } catch {
      toast('নম্বরটি হাতে লিখে নিন: ' + BKASH.number);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!trxId.trim()) { toast.error('ট্রানজেকশন আইডি দিন'); return; }

    setSubmitting(true);
    try {
      await submitPaymentRequest({
        uid: currentUser.uid,
        userName: currentUser.displayName,
        email: currentUser.email,
        planId,
        trxId,
        senderNumber,
        couponCode: coupon?.code || null,
        finalAmount: pricing.final,
      });
      setPending({ trxId: trxId.trim().toUpperCase(), status: 'pending' });
      setTrxId('');
      setSenderNumber('');
      toast.success('অনুরোধ জমা হয়েছে! যাচাই করে অ্যাক্সেস চালু করা হবে।');
    } catch (err) {
      console.error(err);
      toast.error('জমা দেওয়া যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Helmet><title>সাবস্ক্রিপশন | একাডেমিক হাব</title></Helmet>

      {/* চলমান প্ল্যান */}
      {premium && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-5 py-4">
          <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400" />
          <div>
            <p className="text-sm font-bold text-emerald-200">তোমার প্রিমিয়াম চালু আছে</p>
            <p className="mt-0.5 text-xs text-emerald-300/80">
              আর <span className="font-bold">{toBn(daysLeft)}</span> দিন বাকি। মেয়াদ শেষের আগে নবায়ন
              করলে বাকি দিনগুলো যোগ হয়ে যাবে।
            </p>
          </div>
        </div>
      )}

      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
          {premium ? 'মেয়াদ বাড়াও' : 'প্রিমিয়াম নাও'}
        </h1>
        <p className="text-sm text-slate-400">
          বিকাশে টাকা পাঠিয়ে ট্রানজেকশন আইডি জমা দাও — যাচাই করে অ্যাক্সেস চালু করা হবে।
        </p>
      </div>

      {/* প্ল্যান */}
      <div className={`mb-6 grid gap-3 ${plans.length >= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {plans.map((plan) => {
          const on = planId === plan.id;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelected(plan.id)}
              className={`relative rounded-2xl border p-5 text-left transition ${
                on ? 'border-indigo-400/60 bg-indigo-500/10' : 'border-white/10 bg-white/[0.02] hover:border-white/20'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-2.5 right-4 rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] font-bold text-white">
                  জনপ্রিয়
                </span>
              )}
              <p className="text-sm font-bold text-slate-300">{plan.label}</p>
              <p className="mt-1 text-2xl font-black text-white">
                ৳{toBn(plan.price)}
              </p>
              {/* মাসে কত পড়ছে — দীর্ঘ প্ল্যান কেন সাশ্রয়ী তা এতেই বোঝা যায় */}
              {plan.days >= 60 && (
                <p className="mt-0.5 text-[11px] text-slate-500">
                  মাসে ৳{toBn(Math.round(plan.price / (plan.days / 30)))}
                </p>
              )}
              {plan.note && <p className="mt-1 text-[11px] font-semibold text-emerald-400">{plan.note}</p>}

              {/* প্রতিটি প্ল্যানের নিজস্ব বৈশিষ্ট্য — অ্যাডমিন সেট করে দেন */}
              {plan.features?.length > 0 && (
                <ul className="mt-3 space-y-1.5 border-t border-white/10 pt-3">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11.5px] leading-snug text-slate-400">
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              )}

              {on && (
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-indigo-300">
                  <Check className="h-3.5 w-3.5" /> নির্বাচিত
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* কুপন */}
      <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-0 flex-1">
            <label className="mb-1.5 block text-xs font-semibold text-slate-400">কুপন কোড থাকলে</label>
            <input
              value={couponInput}
              onChange={(e) => { setCouponInput(e.target.value); setCoupon(null); setCouponMsg(null); }}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
              placeholder="যেমন: SAVE20"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 font-mono text-sm uppercase text-slate-200 outline-none focus:border-indigo-400/50"
            />
          </div>
          <button
            type="button"
            onClick={handleApplyCoupon}
            disabled={checkingCoupon || !couponInput.trim()}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-slate-200 transition hover:border-indigo-400/40 disabled:opacity-40"
          >
            {checkingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'প্রয়োগ করুন'}
          </button>
        </div>

        {couponMsg && (
          <p className={`mt-2 text-xs font-semibold ${couponMsg.ok ? 'text-emerald-400' : 'text-rose-400'}`}>
            {couponMsg.text}
          </p>
        )}

        {/* ছাড় লাগলে দামের হিসাবটা স্পষ্ট করে দেখাই */}
        {coupon && activePlan && (
          <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-500/10 px-4 py-3">
            <div className="text-xs text-emerald-300/80">
              {activePlan.label} — <span className="line-through">৳{toBn(activePlan.price)}</span>
              {' '}ছাড় ৳{toBn(pricing.saved)}
            </div>
            <div className="text-lg font-black text-emerald-300">৳{toBn(pricing.final)}</div>
          </div>
        )}
      </div>

      {/* অ্যাডমিন কোনো প্ল্যানে আলাদা বৈশিষ্ট্য না লিখলে এই সাধারণ তালিকাটা
          দেখাই — না হলে উপরে কার্ডেই সব আছে, এখানে আবার দেখানো বাহুল্য */}
      {!plans.some((p) => p.features?.length > 0) && (
        <div className="mb-8 rounded-2xl bg-white/[0.02] p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
            <Sparkles className="h-4 w-4 text-amber-400" /> প্রিমিয়ামে যা যা পাবে
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {PREMIUM_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* অপেক্ষমাণ অনুরোধ থাকলে ফর্ম নয়, অবস্থা দেখাই */}
      {checking ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-indigo-400" /></div>
      ) : pending ? (
        <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 p-5">
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
            <div>
              <p className="text-sm font-bold text-amber-200">তোমার অনুরোধ যাচাই করা হচ্ছে</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-300/80">
                ট্রানজেকশন আইডি: <span className="font-mono font-bold">{pending.trxId}</span><br />
                সাধারণত কয়েক ঘণ্টার মধ্যে চালু হয়ে যায়। অনুমোদনের পর এই পাতাটি রিফ্রেশ করো।
              </p>
              <button
                type="button"
                onClick={() => refresh()}
                className="mt-3 rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-100 transition hover:bg-amber-500/30"
              >
                অবস্থা আবার দেখো
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {/* ধাপ ১ — টাকা পাঠাও */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">ধাপ ১ — টাকা পাঠাও</p>

            <div className="mb-3 rounded-xl bg-[#e2136e]/10 p-4 ring-1 ring-[#e2136e]/25">
              <p className="text-[11px] font-bold text-pink-200">বিকাশ ({BKASH.type})</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="font-mono text-lg font-black tracking-wide text-white">{BKASH.number}</span>
                <button
                  type="button"
                  onClick={copyNumber}
                  className="rounded-md p-1.5 text-pink-200 transition hover:bg-white/10"
                  aria-label="নম্বর কপি করুন"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-400">{BKASH.instruction}</p>
            <p className="mt-2 text-xs font-bold text-slate-300">
              পরিমাণ: ৳{toBn(pricing.final)}
            </p>
          </div>

          {/* ধাপ ২ — তথ্য দাও */}
          <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">ধাপ ২ — তথ্য দাও</p>

            <label className="mb-1.5 block text-xs font-semibold text-slate-400">ট্রানজেকশন আইডি *</label>
            <input
              value={trxId}
              onChange={(e) => setTrxId(e.target.value)}
              placeholder="যেমন: 9F7A2B1C3D"
              className="mb-3 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 font-mono text-sm uppercase text-slate-200 outline-none focus:border-indigo-400/50"
            />

            <label className="mb-1.5 block text-xs font-semibold text-slate-400">যে নম্বর থেকে পাঠিয়েছ</label>
            <input
              value={senderNumber}
              onChange={(e) => setSenderNumber(e.target.value)}
              placeholder="01XXXXXXXXX"
              inputMode="numeric"
              className="mb-4 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-400/50"
            />

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-500 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              অনুরোধ জমা দাও
            </button>

            <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-500">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
              ভুল বা ব্যবহৃত ট্রানজেকশন আইডি দিলে অনুরোধ বাতিল হবে।
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
