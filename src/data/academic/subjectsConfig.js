import chaptersIct from '../../components/Academic/HSC/ICT/ICT_data/chapters.json';
import chaptersChemistry from '../../components/Academic/HSC/Chemistry/Chemistry_data/chapters.json';

export const academicSubjects = {
  hsc: [
    {
      id: 'ict',
      name: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)',
      chapters: chaptersIct.chapters,
      cqs: import.meta.glob('../../components/Academic/HSC/ICT/ICT_data/chapter_*_Json/chapter_*_CQs.json'),
      mcqs: import.meta.glob('../../components/Academic/HSC/ICT/ICT_data/chapter_*_Json/chapter_*_MCQs.json'),
      kQs: import.meta.glob('../../components/Academic/HSC/ICT/ICT_data/chapter_*_Json/chapter_*_k_kh.json'),
    },
    {
      id: 'chemistry',
      name: 'রসায়ন ১ম পত্র',
      chapters: chaptersChemistry.chapters,
      cqs: import.meta.glob('../../components/Academic/HSC/Chemistry/Chemistry_data/chapter_*_Json/chapter_*_CQs.json'),
      mcqs: import.meta.glob('../../components/Academic/HSC/Chemistry/Chemistry_data/chapter_*_Json/chapter_*_MCQs.json'),
      kQs: import.meta.glob('../../components/Academic/HSC/Chemistry/Chemistry_data/chapter_*_Json/chapter_*_k_kh.json'),
    },
  ],
  ssc: [],
};
