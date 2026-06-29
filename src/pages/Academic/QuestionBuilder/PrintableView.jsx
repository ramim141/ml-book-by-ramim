import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';

const optionLabels = ['ক', 'খ', 'গ', 'ঘ'];

const cqParts = [
  { key: 'ka', label: 'ক.', mark: '১' },
  { key: 'kha', label: 'খ.', mark: '২' },
  { key: 'ga', label: 'গ.', mark: '৩' },
  { key: 'gha', label: 'ঘ.', mark: '৪' },
];

const stripQuestionPrefix = (content) => (
  content || ''
).replace(/^\s*(?:\*\*)?[কখগঘ][.)।](?:\*\*)?\s*/, '');

const MarkdownRenderer = ({ content }) => (
  <div className="printable-markdown prose text-black max-w-none prose-p:leading-relaxed prose-p:my-0 prose-li:my-0 prose-ul:my-1 prose-ol:my-1">
    <ReactMarkdown
      remarkPlugins={[remarkMath, remarkGfm]}
      rehypePlugins={[rehypeKatex]}
    >
      {content || ''}
    </ReactMarkdown>
  </div>
);

const PrintableView = ({ headerInfo, cart, onDownloadPdf }) => {
  const mcqs = cart.filter((q) => q.type === 'mcq');
  const cqs = cart.filter((q) => q.type === 'cq');
  const kKhs = cart.filter((q) => q.type === 'k' || q.type === 'kh');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex justify-center min-h-screen p-4 text-black bg-white sm:p-8 print:bg-white print:p-0">
      <div className="fixed top-4 right-4 print:hidden">
        <button
          onClick={onDownloadPdf || handlePrint}
          className="px-6 py-2 font-bold text-white transition-colors bg-blue-600 rounded shadow-lg hover:bg-blue-700"
        >
          {onDownloadPdf ? 'Download PDF' : 'Print / Save PDF'}
        </button>
      </div>

      <div
        className="printable-paper w-full max-w-[210mm] min-h-[297mm] bg-white shadow-[0_0_10px_rgba(0,0,0,0.1)] print:shadow-none p-8 sm:p-12 box-border mx-auto print:mx-0 print:max-w-none print:w-full"
        style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif" }}
      >
        <style>{`
          .printable-paper,
          .printable-paper * {
            color: #000 !important;
            border-color: #000 !important;
          }
          .printable-paper {
            font-size: 14px !important;
            line-height: 1.45;
          }
          .printable-paper .printable-markdown,
          .printable-paper .printable-markdown * {
            color: #000 !important;
            font-size: inherit !important;
          }
          .printable-paper .printable-markdown p {
            margin-top: 0 !important;
            margin-bottom: 0 !important;
          }
          .printable-paper .question-row {
            display: grid;
            grid-template-columns: 28px minmax(0, 1fr);
            column-gap: 12px;
            align-items: start;
          }
          .printable-paper .sub-question-row {
            display: grid;
            grid-template-columns: 26px minmax(0, 1fr) 28px;
            column-gap: 8px;
            align-items: start;
          }
          .printable-paper .mcq-columns {
            column-count: 2;
            column-gap: 28px;
            column-rule: 1px solid #bdbdbd;
            column-fill: auto;
          }
          .printable-paper .mcq-item {
            break-inside: avoid;
            break-inside: avoid-page;
            break-inside: avoid-column;
            page-break-inside: avoid;
            display: block;
            width: 100%;
            margin-bottom: 18px;
            overflow: hidden;
          }
          .printable-paper .mcq-item .question-row {
            width: 100%;
          }
          .printable-paper .option-circle {
            width: 17px;
            height: 17px;
            border: 1px solid #000;
            border-radius: 9999px;
            display: inline-grid;
            place-items: center;
            flex: 0 0 17px;
            font-size: 10px !important;
            font-weight: 700;
            line-height: 1;
            padding: 0;
            text-align: center;
          }
          .printable-paper .option-label {
            display: block;
            line-height: 1;
            transform: translateY(-0.5px);
          }
          .printable-paper.pdf-export-mode {
            width: 186mm !important;
            max-width: 186mm !important;
            min-height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
          .printable-paper.pdf-export-mode .mcq-columns {
            column-count: 2 !important;
            column-gap: 8mm !important;
            column-rule: 1px solid #bdbdbd !important;
          }
          @media print {
            @page {
              size: A4;
              margin: 14mm 12mm;
            }
            html,
            body {
              width: auto;
              margin: 0 !important;
              padding: 0 !important;
              background: #fff !important;
            }
            .printable-paper {
              padding: 0 !important;
              width: auto !important;
              max-width: none !important;
              min-height: auto !important;
              margin: 0 !important;
              box-shadow: none !important;
            }
            .printable-paper .mcq-item {
              margin-bottom: 14px;
            }
          }
        `}</style>

        <div className="pb-4 mb-8 text-center border-b-2 border-black">
          <h1 className="mb-2 text-2xl font-bold">{headerInfo.schoolName || 'প্রতিষ্ঠানের নাম'}</h1>
          <h2 className="mb-2 text-xl font-semibold">{headerInfo.examName || 'পরীক্ষার নাম'}</h2>

          <div className="flex items-center justify-between mt-4 text-sm font-semibold">
            <div className="text-left">
              <p>বিষয়: {headerInfo.subject || '__________'}</p>
              <p>সময়: {headerInfo.time || '__________'}</p>
            </div>
            <div className="text-right">
              <p>পূর্ণমান: {headerInfo.totalMarks || '__________'}</p>
              <p>বিষয় কোড: {headerInfo.subjectCode || '___'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 text-[14px]">
          {cqs.length > 0 && (
            <div className="mb-8">
              <h3 className="py-1 mb-4 text-lg font-bold text-center border border-black">সৃজনশীল প্রশ্ন</h3>
              {cqs.map((q, index) => (
                <div key={q.uniqueId || q.id || index} className="question-row mb-6 break-inside-avoid">
                  <span className="font-bold text-right">{index + 1}.</span>
                  <div>
                    <div className="mb-3 leading-relaxed text-justify">
                      <MarkdownRenderer content={q.stem} />
                    </div>
                    <ul className="pl-0 space-y-2 list-none">
                      {cqParts.map(({ key, label, mark }) => {
                        const content = q.questions?.[key];
                        if (!content) return null;

                        return (
                          <li key={key} className="sub-question-row">
                            <span className="font-bold">{label}</span>
                            <div>
                              <MarkdownRenderer content={stripQuestionPrefix(content)} />
                            </div>
                            <span className="font-semibold text-right">{mark}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}

          {kKhs.length > 0 && (
            <div className="mb-8">
              <h3 className="py-1 mb-4 text-lg font-bold text-center border border-black">জ্ঞান ও অনুধাবনমূলক প্রশ্ন</h3>
              {kKhs.map((q, index) => (
                <div key={q.uniqueId || q.id || index} className="question-row mb-4 break-inside-avoid">
                  <span className="font-bold text-right">{index + 1}.</span>
                  <div className="grid grid-cols-[26px_minmax(0,1fr)] gap-2">
                    <span className="font-bold">{q.type === 'k' ? 'ক.' : 'খ.'}</span>
                    <MarkdownRenderer content={q.question} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {mcqs.length > 0 && (
            <div>
              <h3 className="py-1 mb-4 text-lg font-bold text-center border border-black">বহুনির্বাচনী প্রশ্ন</h3>
              <div className="mcq-columns">
                {mcqs.map((q, index) => (
                  <div key={q.uniqueId || q.id || index} className="mcq-item">
                    <div className="question-row">
                      <span className="font-bold text-right">{index + 1}.</span>
                      <div>
                        <div className="mb-2 leading-relaxed">
                          <MarkdownRenderer content={q.question} />
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[14px]">
                          {q.options?.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-start gap-2">
                              <span className="option-circle">
                                <span className="option-label">{optionLabels[optIdx] || optIdx + 1}</span>
                              </span>
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="hidden pt-4 mt-16 text-xs text-center border-t border-black print:block">
          Generated by Academic Hub Question Builder
        </div>
      </div>
    </div>
  );
};

export default PrintableView;
