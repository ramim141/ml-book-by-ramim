import React, { useRef, useLayoutEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';
import { enToBn, cleanPrefix } from './helpers.jsx';
import { CQ_PART_MARKS, DEFAULT_MARKS, markOf } from './marks.js';
import {
  DEFAULT_PRINT_SETTINGS, SECTION_META, resolvePage, fontStackOf, optionLabelFor,
} from './printSettings.js';
import EditableText from './components/preview/EditableText.jsx';
import PaperLogo from './components/preview/PaperLogo.jsx';
import StudentInfoBox from './components/preview/StudentInfoBox.jsx';

const cqParts = [
  { key: 'ka', label: '(ক)' },
  { key: 'kha', label: '(খ)' },
  { key: 'ga', label: '(গ)' },
  { key: 'gha', label: '(ঘ)' },
];

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

/** ফাঁকা উত্তর-রেখা — হাতে লেখা পরীক্ষার জন্য */
const AnswerLines = ({ count }) => {
  if (!count) return null;
  return (
    <div className="mt-2 space-y-3.5">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="border-b border-dotted border-black/50" />
      ))}
    </div>
  );
};

const getBoardList = (q) => {
  return [
    ...(Array.isArray(q.boards)
      ? q.boards.map((b) =>
          typeof b === 'object' && b !== null
            ? `${b.name || b.type || ''}${b.year || b.session ? ` ${b.year || b.session}` : ''}`.trim()
            : String(b).trim()
        )
      : []),
    ...(Array.isArray(q.board) && !Array.isArray(q.boards)
      ? q.board.map((b) =>
          typeof b === 'object' && b !== null
            ? `${b.name || b.type || ''}${b.year || b.session ? ` ${b.year || b.session}` : ''}`.trim()
            : String(b).trim()
        )
      : []),
  ].filter((str) => Boolean(str) && str !== '[object Object]');
};

const PrintableView = ({
  headerInfo,
  cart,
  summary,
  marksConfig = DEFAULT_MARKS,
  settings = DEFAULT_PRINT_SETTINGS,
  edits = {},
  editing = false,
  onEdit,
  onContentHeightChange,
  setLabel,
}) => {
  const page = resolvePage(settings);

  // পাতাসংখ্যার আনুমানিক হিসাবের জন্য কনটেন্টের প্রকৃত উচ্চতা উপরে জানিয়ে দেওয়া —
  // এই কম্পোনেন্ট নিজে পাতাসংখ্যা নিয়ে ভাবে না, শুধু কাঁচা উচ্চতাটা রিপোর্ট করে
  const paperRef = useRef(null);
  useLayoutEffect(() => {
    const el = paperRef.current;
    if (!el || !onContentHeightChange) return undefined;
    const report = () => onContentHeightChange(el.scrollHeight);
    report();
    const observer = new ResizeObserver(report);
    observer.observe(el);
    return () => observer.disconnect();
  }, [onContentHeightChange, cart, settings, headerInfo, edits]);

  const circle = (() => {
    const size = Math.round(settings.fontSize + 7);
    const font = Math.max(8, Math.floor(size * 0.58));
    return { size, line: size - 2, font };
  })();

  const mcqs = cart.filter((q) => q.type === 'mcq');
  const cqs = cart.filter((q) => q.type === 'cq');
  const kKhs = cart.filter((q) => q.type === 'k' || q.type === 'kh');

  /** সম্পাদিত মান থাকলে সেটাই, না হলে মূল প্রশ্নের লেখা */
  const valueOf = (q, field, fallback) => {
    const edit = edits[q.uniqueId];
    if (edit && edit[field] !== undefined && edit[field] !== null) return edit[field];
    return fallback;
  };
  const editField = (q, field) => (next) => onEdit?.(q.uniqueId, field, next);

  const sectionNote = (items) => {
    const marks = items.reduce((sum, q) => sum + markOf(q, marksConfig), 0);
    const per = items.length ? marks / items.length : 0;
    return `${enToBn(items.length)} × ${enToBn(Number.isInteger(per) ? per : per.toFixed(1))} = ${enToBn(marks)}`;
  };

  const printedTotal = headerInfo.totalMarks?.trim()
    || (summary ? enToBn(summary.totalMarks) : '');

  const renderOptionLabel = (idx) => optionLabelFor(settings, idx);

  const spacingClass = {
    compact: 'mb-3',
    normal: 'mb-5',
    relaxed: 'mb-7',
  }[settings.spacingPreset || 'normal'] || 'mb-5';

  const SectionHeading = ({ label, items }) => (
    <h3
      className="section-heading py-1 mb-3.5 text-center font-bold border border-black select-none"
      style={{ fontSize: settings.fontSize + 2 }}
    >
      {label}
      {settings.showSectionNote && items.length > 0 && (
        <span className="font-semibold" style={{ fontSize: settings.fontSize - 1.5 }}> ({sectionNote(items)})</span>
      )}
    </h3>
  );

  const renderCq = () => cqs.length > 0 && !settings.hiddenSections?.includes('cq') && (
    <div className="mb-6" key="cq">
      <SectionHeading label={SECTION_META.cq.label} items={cqs} />
      <div style={settings.cqColumns > 1 ? { columnCount: settings.cqColumns, columnGap: '8mm' } : undefined}>
        {cqs.map((q, index) => {
          const boards = getBoardList(q);

          return (
            <div key={q.uniqueId || q.id || index} className={`q-block ${spacingClass}`}>
              <div className="question-row">
                <span className="font-bold text-right leading-relaxed select-none">{enToBn(index + 1)}.</span>
                <div className="min-w-0">
                  {/* Stem & Tags */}
                  <div className="mb-2.5 leading-relaxed text-justify">
                    <EditableText
                      editing={editing}
                      value={valueOf(q, 'stem', q.stem)}
                      original={q.stem}
                      onSave={editField(q, 'stem')}
                    >
                      <MarkdownRenderer content={valueOf(q, 'stem', q.stem)} />
                    </EditableText>

                    {/* Optional Board & Type Tags */}
                    {(settings.showBoardNames || settings.showQuestionType) && (
                      <div className="mt-1 flex flex-wrap items-center justify-end gap-1.5 text-right text-[11px] font-bold italic text-slate-700 select-none">
                        {settings.showQuestionType && (
                          <span>{q.topic ? `টপিক: ${q.topic}` : 'সৃজনশীল'}</span>
                        )}
                        {settings.showBoardNames && boards.length > 0 && (
                          <span>[{boards.join(', ')}]</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Subquestions ক, খ, গ, ঘ */}
                  <ul className="pl-0 space-y-1.5 list-none">
                    {cqParts.map(({ key, label }) => {
                      const raw = q.questions?.[key];
                      if (!raw) return null;
                      const current = valueOf(q, `q_${key}`, raw);
                      const partAns = q.answers?.[key];

                      return (
                        <li key={key} className="sub-question-row">
                          <span className="font-bold">{label}</span>
                          <div className="min-w-0 text-justify">
                            <EditableText
                              editing={editing}
                              value={current}
                              original={raw}
                              onSave={editField(q, `q_${key}`)}
                            >
                              <MarkdownRenderer content={cleanPrefix(current)} />
                            </EditableText>

                            {/* Inline Answer for CQ (Master Solution Sheet) */}
                            {settings.showAnswersInline && partAns && (
                              <div className="mt-1 p-2 bg-slate-100 border-l-2 border-black text-[12px] text-justify font-medium">
                                <span className="font-bold">উত্তর: </span>
                                <MarkdownRenderer content={partAns} />
                              </div>
                            )}
                          </div>
                          {settings.showMarks && (
                            <span className="font-semibold text-right">{enToBn(CQ_PART_MARKS[key])}</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  <AnswerLines count={settings.showAnswerLines} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderKkh = () => kKhs.length > 0 && !settings.hiddenSections?.includes('kkh') && (
    <div className="mb-6" key="kkh">
      <SectionHeading label={SECTION_META.kkh.label} items={kKhs} />
      <div style={settings.kkhColumns > 1 ? { columnCount: settings.kkhColumns, columnGap: '8mm' } : undefined}>
        {kKhs.map((q, index) => {
          const current = valueOf(q, 'question', q.question);
          const boards = getBoardList(q);
          const typeLabel = q.type === 'k' ? 'ক' : 'খ';

          return (
            <div key={q.uniqueId || q.id || index} className={`q-block ${spacingClass}`}>
              <div className={`grid items-start gap-x-2 ${settings.showMarks ? 'grid-cols-[40px_minmax(0,1fr)_28px]' : 'grid-cols-[40px_minmax(0,1fr)]'}`}>
                <span className="font-bold text-right leading-relaxed select-none">
                  {enToBn(index + 1)}. {typeLabel}.
                </span>
                <div className="min-w-0 text-justify">
                  <EditableText editing={editing} value={current} original={q.question} onSave={editField(q, 'question')}>
                    <MarkdownRenderer content={cleanPrefix(current)} />
                  </EditableText>

                  {/* Optional Board & Type Tags */}
                  {(settings.showBoardNames || settings.showQuestionType) && (
                    <div className="mt-1 flex flex-wrap items-center justify-end gap-1.5 text-right text-[10.5px] font-bold italic text-slate-700 select-none">
                      {settings.showQuestionType && (
                        <span>{q.type === 'k' ? 'জ্ঞানমূলক' : 'অনুধাবনমূলক'}</span>
                      )}
                      {settings.showBoardNames && boards.length > 0 && (
                        <span>[{boards.join(', ')}]</span>
                      )}
                    </div>
                  )}

                  {/* Inline Answer for K/KH */}
                  {settings.showAnswersInline && q.answer && (
                    <div className="mt-1 p-2 bg-slate-100 border-l-2 border-black text-[12px] text-justify font-medium">
                      <span className="font-bold">উত্তর: </span>
                      <MarkdownRenderer content={String(q.answer)} />
                    </div>
                  )}
                </div>
                {settings.showMarks && (
                  <span className="font-semibold text-right leading-relaxed">{enToBn(markOf(q, marksConfig))}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderMcq = () => mcqs.length > 0 && !settings.hiddenSections?.includes('mcq') && (
    <div className="mb-6" key="mcq">
      <SectionHeading label={SECTION_META.mcq.label} items={mcqs} />
      <div className="mcq-columns">
        {mcqs.map((q, index) => {
          const current = valueOf(q, 'question', q.question);
          const boards = getBoardList(q);
          let optionCols = settings.mcqColumns >= 2 ? 'grid-cols-1' : 'grid-cols-2';
          if (settings.mcqOptionLayout === '4col') optionCols = 'grid-cols-4';
          else if (settings.mcqOptionLayout === '2col') optionCols = 'grid-cols-2';
          else if (settings.mcqOptionLayout === '1col') optionCols = 'grid-cols-1';

          return (
            <div key={q.uniqueId || q.id || index} className={`mcq-item ${spacingClass}`}>
              <div className="question-row">
                <span className="font-bold text-right leading-relaxed select-none">{enToBn(index + 1)}.</span>
                <div className="min-w-0">
                  {/* Question Stem */}
                  <div className="mb-1.5 leading-relaxed text-justify">
                    <EditableText editing={editing} value={current} original={q.question} onSave={editField(q, 'question')}>
                      <MarkdownRenderer content={cleanPrefix(current)} />
                    </EditableText>

                    {/* Optional Board & Type Tags */}
                    {(settings.showBoardNames || settings.showQuestionType) && (
                      <div className="mt-0.5 mb-1 flex flex-wrap items-center justify-end gap-1.5 text-right text-[10.5px] font-bold italic text-slate-700 select-none">
                        {settings.showQuestionType && (
                          <span>{q.topic ? `টপিক: ${q.topic}` : 'MCQ'}</span>
                        )}
                        {settings.showBoardNames && boards.length > 0 && (
                          <span>[{boards.join(', ')}]</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Options */}
                  <div className={`grid items-start gap-x-3 gap-y-1.5 ${optionCols}`}>
                    {q.options?.map((opt, optIdx) => {
                      const optVal = valueOf(q, `opt_${optIdx}`, opt);
                      const isCircle = settings.mcqOptionBulletStyle === 'circle' || !settings.mcqOptionBulletStyle;
                      const isCorrect = q.answer === optIdx || q.answer === String(optIdx);

                      return (
                        <div
                          key={optIdx}
                          className={`flex items-start gap-1.5 rounded-md ${
                            settings.showAnswersInline
                              ? `-mx-1.5 px-1.5 py-0.5 ${isCorrect ? 'font-bold bg-yellow-200' : ''}`
                              : ''
                          }`}
                        >
                          {isCircle ? (
                            <span className="option-circle">
                              <span className="option-label">{renderOptionLabel(optIdx)}</span>
                            </span>
                          ) : (
                            <span className="font-bold text-black select-none shrink-0">
                              {renderOptionLabel(optIdx)}
                            </span>
                          )}
                          <EditableText editing={editing} value={optVal} original={opt} onSave={editField(q, `opt_${optIdx}`)}>
                            <span className="leading-snug">{optVal}</span>
                          </EditableText>
                        </div>
                      );
                    })}
                  </div>

                  {/* Inline Answer / Solution for MCQ */}
                  {settings.showAnswersInline && q.answer !== undefined && q.answer !== null && (
                    <div className="mt-2 p-2 bg-slate-100 border border-black/30 rounded-sm text-[11.5px]">
                      <span className="block font-bold">
                        সঠিক উত্তর: {renderOptionLabel(Number(q.answer))}
                      </span>
                      {settings.showExplanation && q.explanation && (
                        <div className="mt-1.5 border-t border-black/10 pt-1.5 text-[12.5px] text-slate-800">
                          <span className="block font-semibold">ব্যাখ্যা:</span>
                          <div className="text-justify">
                            <MarkdownRenderer content={q.explanation} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const sectionRenderers = {
    cq: renderCq,
    kkh: renderKkh,
    mcq: renderMcq,
  };

  const headerBorderClass = {
    double: 'border-b-4 border-double border-black',
    single: 'border-b-2 border-black',
    boxed: 'border-2 border-black p-3.5 rounded-sm',
    none: 'border-none',
  }[settings.headerBorderStyle || 'double'] || 'border-b-4 border-double border-black';

  return (
    <div className="flex justify-center min-h-screen p-4 text-black bg-slate-100 sm:p-8 print:bg-white print:p-0">
      <div
        ref={paperRef}
        className="printable-paper relative bg-white shadow-[0_0_15px_rgba(0,0,0,0.12)] print:shadow-none box-border mx-auto print:mx-0 overflow-hidden"
        style={{
          width: `${page.width}mm`,
          minHeight: `${page.height}mm`,
          paddingTop: `${page.margin.top}mm`,
          paddingRight: `${page.margin.right}mm`,
          paddingBottom: `${page.margin.bottom}mm`,
          paddingLeft: `${page.margin.left}mm`,
          fontFamily: fontStackOf(settings.fontId),
          fontSize: `${settings.fontSize}px`,
          lineHeight: settings.lineHeight,
        }}
      >
        <style>{`
          .printable-paper,
          .printable-paper * { color: #000 !important; border-color: #000 !important; }
          .printable-paper .printable-markdown,
          .printable-paper .printable-markdown * { color: #000 !important; font-size: inherit !important; }
          .printable-paper .printable-markdown p { margin-top: 0 !important; margin-bottom: 0 !important; }

          .printable-paper .question-row {
            display: grid !important;
            grid-template-columns: 26px minmax(0, 1fr) !important;
            column-gap: 8px !important;
            align-items: start !important;
          }
          .printable-paper .sub-question-row {
            display: grid !important;
            grid-template-columns: max-content minmax(0, 1fr)${settings.showMarks ? ' 28px' : ''} !important;
            column-gap: 5px !important;
            align-items: start !important;
          }

          .printable-paper .mcq-columns {
            column-count: ${settings.mcqColumns};
            column-gap: 8mm;
            ${settings.mcqColumns > 1 ? 'column-rule: 1px solid #bdbdbd;' : ''}
            column-fill: auto;
          }
          .printable-paper .mcq-item,
          .printable-paper .q-block {
            break-inside: avoid;
            page-break-inside: avoid;
            width: 100%;
          }

          /* শিরোনামের ঠিক পরেই পাতা শেষ হলে বিভাগের নাম একা পড়ে থাকত */
          .printable-paper .section-heading { break-after: avoid; page-break-after: avoid; }
          .printable-paper p { orphans: 2; widows: 2; }

          .printable-paper .option-circle {
            width: ${circle.size}px; height: ${circle.size}px;
            box-sizing: border-box;
            border: 1px solid #000; border-radius: 50%;
            display: inline-block;
            flex: 0 0 ${circle.size}px;
            font-size: ${circle.font}px; font-weight: 700;
            line-height: ${circle.line}px;
            padding: 0; text-align: center;
            overflow: visible;
          }
          .printable-paper .option-label {
            display: inline;
            line-height: inherit;
            vertical-align: baseline;
          }

          .printable-paper .qb-editable:hover {
            outline: 1px dashed #6366f1;
            outline-offset: 2px;
            background: rgba(99, 102, 241, 0.05);
          }

          @media print {
            @page {
              size: ${page.width}mm ${page.height}mm;
              margin: ${page.margin.top}mm ${page.margin.right}mm ${page.margin.bottom}mm ${page.margin.left}mm;
            }
            html, body { width: auto; margin: 0 !important; padding: 0 !important; background: #fff !important; }
            .printable-paper {
              width: auto !important;
              min-height: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
            }
            .qb-editable:hover { outline: none !important; background: none !important; }

            .qb-page-number {
              position: fixed;
              bottom: 0;
              right: 0;
              font-size: 10px;
            }
            .qb-page-number::after { content: counter(page); }
          }
          .qb-page-number { display: none; }
          @media print { .qb-page-number { display: block; } }
        `}</style>

        {/* Watermark */}
        {settings.showWatermark && (settings.watermarkText || headerInfo.schoolName) && (
          <div
            className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden select-none"
            style={{ opacity: (settings.watermarkOpacity || 12) / 100 }}
          >
            <div className="rotate-[-32deg] transform whitespace-nowrap text-center text-5xl sm:text-6xl font-black text-black tracking-widest">
              {settings.watermarkText || headerInfo.schoolName}
            </div>
          </div>
        )}

        {/* Paper Header */}
        <div className={`relative z-10 pb-3 mb-4 ${headerBorderClass}`}>
          {/* Top Row: Left Logo, Center Titles & Subject, Right Set Badge */}
          <div className="flex items-start justify-between gap-4">
            <div className="w-20 shrink-0 flex items-center justify-start pt-1">
              <PaperLogo url={headerInfo.logoUrl} />
            </div>

            <div className="min-w-0 flex-1 text-center">
              <h1 className="mb-1 font-bold tracking-tight" style={{ fontSize: settings.fontSize + 8 }}>
                {headerInfo.schoolName || 'প্রতিষ্ঠানের নাম'}
              </h1>
              <h2 className="mb-1 font-semibold" style={{ fontSize: settings.fontSize + 3.5 }}>
                {headerInfo.examName || 'পরীক্ষার নাম'}
              </h2>
              <div className="font-bold" style={{ fontSize: settings.fontSize + 1.5 }}>
                <span>বিষয়: {headerInfo.subject || '—'}</span>
                {headerInfo.subjectCode && <span className="ml-2 font-semibold text-slate-800">({`বিষয় কোড: ${headerInfo.subjectCode}`})</span>}
              </div>
            </div>

            <div className="w-20 shrink-0 flex items-center justify-end pt-1">
              {setLabel ? (
                <span className="rounded-md border border-black px-2.5 py-1 text-xs font-black">
                  সেট: {setLabel}
                </span>
              ) : null}
            </div>
          </div>

          {/* Time & Full Marks Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-1 border-t border-black/15 font-semibold" style={{ fontSize: settings.fontSize }}>
            <span>সময়: {headerInfo.time || '—'}</span>
            <span>পূর্ণমান: {printedTotal || '—'}</span>
          </div>

          {/* Student Info Box */}
          {settings.showStudentInfo && <StudentInfoBox style={settings.studentInfoStyle} />}

          {/* Special Instructions */}
          {settings.instructions && (
            <div className="mt-2 text-center text-[12px] italic font-medium">
              [{settings.instructions}]
            </div>
          )}
        </div>

        {cqs.length === 0 && mcqs.length === 0 && kKhs.length === 0 && (
          <div className="py-12 font-bold text-center text-slate-500">
            কোনো প্রশ্ন নির্বাচন করা হয়নি।
          </div>
        )}

        {/* Render sections according to sectionOrder */}
        {settings.sectionOrder?.map((secId) => {
          const fn = sectionRenderers[secId];
          return fn ? fn() : null;
        })}

        {/* Ending Footer */}
        {settings.showFooter && (
          <div className="mt-8 pt-4 pb-2 text-center text-xs font-semibold border-t border-black/20 text-black select-none">
            {settings.footerText || '— সমাপ্ত —'}
          </div>
        )}

        {settings.showPageNumber && <div className="qb-page-number" />}
      </div>
    </div>
  );
};

export default PrintableView;
