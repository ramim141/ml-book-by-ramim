import SubjectCard from '../../../components/Academic/SubjectCard';

const HSCDashboard = () => {
  const subjects = [
    {
      id: 1,
      title: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)',
      description: 'সি প্রোগ্রামিং, ওয়েব ডিজাইন (HTML), ডেটাবেস ম্যানেজমেন্ট এবং লজিক গেটের সহজ বাংলা টিউটোরিয়াল।',
      code: '২৭৫',
      chaptersCount: 6,
      link: '/academic/hsc/ict',
      color: 'pink'
    },
    {
      id: 2,
      title: 'রসায়ন ১ম পত্র',
      description: 'পরিবেশ রসায়ন, গুণগত রসায়ন, পর্যায়বৃত্ত ধর্ম ও অন্যান্য অধ্যায়ের বিস্তারিত আলোচনা।',
      code: '২৬৭',
      chaptersCount: 3,
      link: '/academic/hsc/chemistry',
      color: 'blue'
    },

  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14">
      
      {/* Header */}
      <div className="mb-6 sm:mb-10 lg:mb-12">
        <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-2.5 sm:mb-3 lg:mb-4 leading-tight">
          এইচএসসি (একাদশ-দ্বাদশ শ্রেণি)
        </h1>
        <p className="text-slate-400 max-w-2xl text-sm sm:text-base lg:text-lg leading-relaxed">
          এইচএসসি পরীক্ষার প্রস্তুতির জন্য শর্টকাট টেকনিক, বোর্ড প্রশ্নের সমাধান, হ্যান্ডনোট এবং বিস্তারিত ভিডিও লেকচার। নিচে থেকে বিষয় নির্বাচন করুন।
        </p>
      </div>

      {/* Subjects Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        {subjects.map((subject) => (
          <SubjectCard key={subject.id} {...subject} />
        ))}
      </div>

    </div>
  );
};

export default HSCDashboard;
