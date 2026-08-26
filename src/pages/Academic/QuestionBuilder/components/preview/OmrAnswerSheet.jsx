import { enToBn } from '../../helpers.jsx';
import { resolvePage, optionLabelFor } from '../../printSettings.js';
import PaperLogo from './PaperLogo.jsx';
import StudentInfoBox from './StudentInfoBox.jsx';

/**
 * শুধু প্রিন্টের জন্য — বৃত্ত ভরাট করে উত্তর দেওয়ার শীট। স্ক্যান করে
 * স্বয়ংক্রিয়ভাবে নম্বর দেওয়ার কোনো ব্যবস্থা এখানে নেই, এটা কাগজে-কলমে
 * উত্তর দেওয়া ও শিক্ষক নিজে মিলিয়ে দেখার জন্য একটা বিন্যাস মাত্র।
 */
const OmrAnswerSheet = ({ headerInfo, cart, settings }) => {
  const page = resolvePage(settings);
  const mcqs = cart.filter((q) => q.type === 'mcq');
  const columns = settings.omrColumns || 2;

  return (
    <div className="flex justify-center min-h-screen p-4 text-black bg-slate-100 sm:p-8 print:bg-white print:p-0">
      <div
        className="printable-paper relative bg-white shadow-[0_0_15px_rgba(0,0,0,0.12)] print:shadow-none box-border mx-auto print:mx-0"
        style={{
          width: `${page.width}mm`,
          minHeight: `${page.height}mm`,
          paddingTop: `${page.margin.top}mm`,
          paddingRight: `${page.margin.right}mm`,
          paddingBottom: `${page.margin.bottom}mm`,
          paddingLeft: `${page.margin.left}mm`,
          color: '#000',
          fontSize: `${settings.fontSize}px`,
        }}
      >
        <style>{`
          .omr-row { break-inside: avoid; page-break-inside: avoid; }
          .omr-bubble {
            width: 20px; height: 20px;
            box-sizing: border-box;
            border: 1.5px solid #000; border-radius: 50%;
            display: inline-flex; align-items: center; justify-content: center;
            font-size: 10.5px; font-weight: 700;
          }
          @media print {
            @page {
              size: ${page.width}mm ${page.height}mm;
              margin: ${page.margin.top}mm ${page.margin.right}mm ${page.margin.bottom}mm ${page.margin.left}mm;
            }
            .printable-paper {
              width: auto !important; min-height: 0 !important;
              padding: 0 !important; margin: 0 !important; box-shadow: none !important;
            }
          }
        `}</style>

        <div className="relative z-10 pb-3 mb-4 border-b-4 border-double border-black">
          {/* Top Row: Left Logo, Center Titles & Subject, Right Spacer */}
          <div className="flex items-start justify-between gap-4">
            <div className="w-20 shrink-0 flex items-center justify-start pt-1">
              <PaperLogo url={headerInfo.logoUrl} />
            </div>

            <div className="min-w-0 flex-1 text-center">
              <h1 className="mb-1 font-bold tracking-tight" style={{ fontSize: settings.fontSize + 8 }}>
                {headerInfo.schoolName || 'প্রতিষ্ঠানের নাম'}
              </h1>
              <h2 className="mb-0.5 font-semibold" style={{ fontSize: settings.fontSize + 3.5 }}>
                {headerInfo.examName || 'পরীক্ষার নাম'}
              </h2>
              <div className="font-bold" style={{ fontSize: settings.fontSize + 1 }}>
                <span>বিষয়: {headerInfo.subject || '—'}</span>
                {headerInfo.subjectCode && <span className="ml-2 font-semibold">({`বিষয় কোড: ${headerInfo.subjectCode}`})</span>}
              </div>
              <div className="mt-1 font-bold text-sm bg-black/5 py-0.5 px-3 rounded inline-block" style={{ fontSize: settings.fontSize + 0.5 }}>উত্তরপত্র (OMR)</div>
            </div>

            <div className="w-20 shrink-0 flex items-center justify-end" />
          </div>

          <StudentInfoBox style={settings.studentInfoStyle} />
        </div>

        {mcqs.length === 0 ? (
          <div className="py-10 font-bold text-center text-gray-500">কোনো MCQ নির্বাচন করা হয়নি।</div>
        ) : (
          <div style={{ columnCount: columns, columnGap: '10mm' }}>
            {mcqs.map((q, i) => {
              const optionCount = Array.isArray(q.options) ? q.options.length : 4;
              return (
                <div key={q.uniqueId || q.id || i} className="omr-row flex items-center gap-2 mb-3">
                  <span className="w-6 shrink-0 font-bold text-right">{enToBn(i + 1)}.</span>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: optionCount }, (_, optIdx) => (
                      <span key={optIdx} className="omr-bubble">
                        {optionLabelFor(settings, optIdx)}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OmrAnswerSheet;
