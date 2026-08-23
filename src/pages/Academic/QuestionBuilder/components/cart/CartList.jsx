import React from 'react';
import { ListOrdered } from 'lucide-react';
import CartItem from './CartItem.jsx';
import { enToBn } from '../../helpers.jsx';

/**
 * নির্বাচিত প্রশ্নগুলোর তালিকা। প্রশ্নপত্রে এই ক্রমেই প্রশ্নগুলো ছাপা হবে,
 * তাই এখান থেকেই উপরে/নিচে সরানো ও আলাদাভাবে বাদ দেওয়া যায়।
 */
const CartList = React.memo(({ cart, onRemove, onMoveUp, onMoveDown }) => (
  <section className="animate-[fade-up_200ms_ease-out] rounded-2xl border border-slate-700/50 bg-slate-800/30 p-5 shadow-xl shadow-slate-950/20 transition duration-150 hover:border-slate-600 hover:bg-slate-800/45">
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-sm font-extrabold text-slate-100">প্রশ্নের তালিকা</h2>
        <p className="mt-1 text-xs font-semibold text-slate-500">
          প্রশ্নপত্রে এই ক্রমেই বসবে
        </p>
      </div>
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-300">
        <ListOrdered className="h-4 w-4" />
      </div>
    </div>

    <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1 custom-scrollbar">
      {cart.map((q, index) => (
        <CartItem
          key={q.uniqueId}
          q={q}
          index={index}
          onRemove={onRemove}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          isFirst={index === 0}
          isLast={index === cart.length - 1}
        />
      ))}
    </div>

    <p className="mt-3 text-center text-[10px] font-semibold text-slate-600">
      মোট {enToBn(cart.length)} টি প্রশ্ন
    </p>
  </section>
));

CartList.displayName = 'CartList';

export default CartList;
