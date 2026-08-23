import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import { enToBn, cleanPrefix } from '../../helpers.jsx';
import PaperLogo from './PaperLogo.jsx';

const CQ_LABELS = { ka: '(ক)', kha: '(খ)', ga: '(গ)', gha: '(ঘ)' };

const Answer = ({ content }) => (
  <div className="prose max-w-none text-[13px] leading-relaxed prose-p:my-0.5">
    <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>
      {content || ''}
    </ReactMarkdown>
  </div>
);

/**
 * আগে এখানে শুধু MCQ-এর বৃত্তগুলো ছাপা হতো — অথচ সৃজনশীল ও জ্ঞান/অনুধাবন
 * প্রশ্নের পূর্ণ উত্তর ডেটাতেই থাকে। এখন তিনটাই একসাথে, তাই কাগজটা আসলেই
 * উত্তরপত্র হিসেবে ব্যবহারযোগ্য।
 */
const AnswerSheetView = ({ headerInfo, cart, page, setLabel }) => {
  const mcqs = cart.filter((q) => q.type === 'mcq');
  const cqs = cart.filter((q) => q.type === 'cq');
  const kKhs = cart.filter((q) => q.type === 'k' || q.type === 'kh');

  return (
    <div
      contentEditable={true}
      suppressContentEditableWarning={true}
      className="printable-paper bg-white p-8 sm:p-12 min-h-screen shadow-2xl max-w-4xl mx-auto my-8 print:m-0 print:p-0 print:shadow-none focus:outline-none transition-shadow rounded-sm text-[14px]"
      style={{ fontFamily: "'Noto Serif Bengali', 'Kalpurush', 'SolaimanLipi', serif", color: '#000', fontSize: '14px' }}
    >
      <style>{`
        .printable-paper * { color: #000 !important; }
        .printable-paper .prose p {
          margin-top: 0 !important;
          margin-bottom: 0px !important;
          text-align: justify !important;
        }
        .mcq-answer-columns {
          column-count: 4;
          column-gap: 20px;
        }
        @media (max-width: 640px) {
          .mcq-answer-columns { column-count: 2; }
        }
        .answer-block { break-inside: avoid; page-break-inside: avoid; }

        /* প্রশ্নপত্রের অপশন-বৃত্তের মতোই — ফ্লেক্স/গ্রিড সেন্টারিং html2canvas
           ঠিকমতো আঁকে না, তাই line-height দিয়ে মাঝে বসানো হয় */
        .answer-circle {
          width: 22px; height: 22px;
          box-sizing: border-box;
          border: 2px solid #000; border-radius: 50%;
          display: inline-block;
          text-align: center;
          line-height: 18px;
          font-size: 13px; font-weight: 700;
          overflow: visible;
        }
        /* উত্তরপত্রের নিজস্ব @page ছিল না, তাই গ্লোবাল margin:0 ধরে লেখা
           পাতার একদম কিনারা ঘেঁষে ছাপা হতো। মার্জিন @page কেই দিই — তাহলে
           প্রতিটি পাতাতেই সমান জায়গা থাকে। */
        @media print {
          @page {
            size: ${page.width}mm ${page.height}mm;
            margin: ${page.margin.top}mm ${page.margin.right}mm ${page.margin.bottom}mm ${page.margin.left}mm;
          }
          .printable-paper {
            width: auto !important;
            max-width: none !important;
            min-height: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      <div className="relative pb-4 mb-6 text-center border-b-2 border-black">
        <PaperLogo url={headerInfo.logoUrl} />
        {setLabel && (
          <span className="absolute right-0 top-0 rounded-md border border-black px-2 py-0.5 text-xs font-black">
            সেট: {setLabel}
          </span>
        )}
        <h1 className="text-2xl font-bold">{headerInfo.schoolName || 'শিক্ষা প্রতিষ্ঠানের নাম'}</h1>
        <h2 className="mt-1 text-lg font-semibold">{headerInfo.examName || 'পরীক্ষার নাম'}</h2>
        <div className="mt-2 font-bold text-md">উত্তরপত্র</div>
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 text-sm font-bold">
          <span>বিষয়: {headerInfo.subject}</span>
          <span>বিষয় কোড: {headerInfo.subjectCode}</span>
        </div>
      </div>

      {cart.length === 0 && (
        <div className="py-10 font-bold text-center text-gray-500">কোনো প্রশ্ন নির্বাচন করা হয়নি।</div>
      )}

      {cqs.length > 0 && (
        <section className="mb-8">
          <h3 className="py-1 mb-4 text-base font-bold text-center border border-black">সৃজনশীল প্রশ্নের উত্তর</h3>
          <div className="space-y-4">
            {cqs.map((q, i) => (
              <div key={q.uniqueId} className="answer-block">
                <p className="mb-1 font-bold">{enToBn(i + 1)}। {q.title || q.topic || 'সৃজনশীল প্রশ্ন'}</p>
                <div className="pl-4 space-y-1.5">
                  {Object.entries(CQ_LABELS).map(([key, label]) => {
                    const text = q.answers?.[key];
                    if (!text) return null;
                    return (
                      <div key={key} className="grid grid-cols-[max-content_minmax(0,1fr)] gap-1.5">
                        <span className="font-bold">{label}</span>
                        <Answer content={text} />
                      </div>
                    );
                  })}
                  {!q.answers && <p className="text-[13px] italic">উত্তর সংরক্ষিত নেই।</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {kKhs.length > 0 && (
        <section className="mb-8">
          <h3 className="py-1 mb-4 text-base font-bold text-center border border-black">জ্ঞান ও অনুধাবনমূলক প্রশ্নের উত্তর</h3>
          <div className="space-y-3">
            {kKhs.map((q, i) => (
              <div key={q.uniqueId} className="answer-block">
                <p className="mb-0.5 font-bold">{enToBn(i + 1)}। {q.type === 'k' ? 'ক.' : 'খ.'} {cleanPrefix(q.question)}</p>
                <div className="pl-4">
                  {q.answer ? <Answer content={String(q.answer)} /> : <p className="text-[13px] italic">উত্তর সংরক্ষিত নেই।</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {mcqs.length > 0 && (
        <section>
          <h3 className="py-1 mb-4 text-base font-bold text-center border border-black">বহুনির্বাচনি উত্তর</h3>
          <div className="mcq-answer-columns">
            {mcqs.map((q, i) => (
              <div key={q.uniqueId} className="flex items-center gap-2 mb-3 break-inside-avoid">
                <span className="w-10 font-bold text-right">{enToBn(i + 1)}।</span>
                <span className="answer-circle">
                  {q.answer !== undefined && q.answer !== null ? ['ক', 'খ', 'গ', 'ঘ'][q.answer] : ''}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default AnswerSheetView;
