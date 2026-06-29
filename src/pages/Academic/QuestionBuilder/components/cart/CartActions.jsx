import React from 'react';
import { Check, Printer, Trash2 } from 'lucide-react';

const CartActions = React.memo(({
  cartLength,
  mcqCount,
  clearCart,
  onPreview,
  onPreviewAnswer,
  onClose,
  compact = false,
}) => {
  const handlePreview = () => {
    onClose?.();
    onPreview();
  };

  const handlePreviewAnswer = () => {
    onClose?.();
    onPreviewAnswer();
  };

  if (compact) {
    return (
      <div className="flex flex-col gap-2 pt-4">
        <div className="flex gap-2">
          {cartLength > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="p-3 text-red-400 transition border bg-red-500/10 border-red-500/30 hover:bg-red-500 hover:text-white rounded-xl focus:outline-none "
              title="Clear cart"
              aria-label="Clear cart"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={handlePreview}
            disabled={cartLength === 0}
            className="flex-1 bg-[#10b981] hover:bg-[#059669] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition focus:outline-none "
          >
            <Printer className="w-4 h-4" /> Preview & Print
          </button>
        </div>
        <button
          type="button"
          onClick={handlePreviewAnswer}
          disabled={mcqCount === 0}
          className="flex items-center justify-center w-full gap-2 py-3 text-sm font-bold text-white transition bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl focus:outline-none "
        >
          <Check className="w-4 h-4" /> Answer Preview
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 pt-4 mt-4 border-t border-white/5">
      <button
        type="button"
        onClick={onPreview}
        disabled={cartLength === 0}
        className="w-full bg-[#10b981] hover:bg-[#059669] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg active:scale-[0.98] text-sm flex items-center justify-center gap-2 focus:outline-none "
      >
        <Printer className="w-4 h-4" />
        <span>Preview & Print</span>
      </button>
      <button
        type="button"
        onClick={onPreviewAnswer}
        disabled={mcqCount === 0}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg active:scale-[0.98] text-sm flex items-center justify-center gap-2 focus:outline-none "
      >
        <Check className="w-4 h-4" />
        <span>Answer Preview</span>
      </button>
    </div>
  );
});

export default CartActions;
