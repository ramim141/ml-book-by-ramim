import React from 'react';
import { enToBn } from '../../helpers.jsx';

const AnswerSheetView = ({ headerInfo, cart }) => {
  const mcqs = cart.filter((q) => q.type === 'mcq');

  return (
    <div
      contentEditable={true}
      suppressContentEditableWarning={true}
      className="bg-white p-8 sm:p-12 min-h-screen shadow-2xl max-w-4xl mx-auto my-8 print:m-0 print:p-0 print:px-[20mm] print:shadow-none focus:outline-none transition-shadow rounded-sm text-[14px]"
      style={{ fontFamily: "'Noto Serif Bengali', 'Kalpurush', 'SolaimanLipi', serif", color: '#000', fontSize: '14px' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@400;600;700&display=swap'); 
        * { color: #000 !important; }
        .prose p {
          margin-top: 0 !important;
          margin-bottom: 0px !important;
          text-align: justify !important;
        }
        .mcq-answer-columns {
          column-count: 4;
          column-gap: 20px;
        }
        @media (max-width: 640px) {
          .mcq-answer-columns {
            column-count: 2;
          }
        }
      `}</style>

      <table className="w-full">
        <thead className="hidden print:table-header-group">
          <tr><td><div className="h-[20mm]" /></td></tr>
        </thead>
        <tfoot className="hidden print:table-footer-group">
          <tr><td><div className="h-[20mm]" /></td></tr>
        </tfoot>
        <tbody>
          <tr>
            <td>
              <div className="pb-4 mb-8 text-center border-b-2 border-black">
                <h1 className="text-2xl font-bold">{headerInfo.schoolName || 'শিক্ষা প্রতিষ্ঠানের নাম'}</h1>
                <h2 className="mt-1 text-lg font-semibold">{headerInfo.examName || 'পরীক্ষার নাম'}</h2>
                <div className="mt-2 font-bold text-md">উত্তরপত্র (বহুনির্বাচনি)</div>
                <div className="flex flex-wrap items-center justify-between gap-2 mt-4 text-sm font-bold">
                  <span>বিষয়: {headerInfo.subject}</span>
                  <span>বিষয় কোড: {headerInfo.subjectCode}</span>
                </div>
              </div>

              {mcqs.length > 0 ? (
                <div className="mcq-answer-columns">
                  {mcqs.map((q, i) => (
                    <div key={q.uniqueId} className="flex items-center gap-2 mb-3 break-inside-avoid">
                      <span className="w-10 font-bold text-right">{enToBn(i + 1)}।</span>
                      <span className="flex items-center justify-center w-[22px] h-[22px] border-2 border-black rounded-full text-[12px] font-bold">
                        {q.answer !== undefined && q.answer !== null ? ['ক', 'খ', 'গ', 'ঘ'][q.answer] : ''}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 font-bold text-center text-gray-500">কোনো বহুনির্বাচনি প্রশ্ন নেই।</div>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default AnswerSheetView;
