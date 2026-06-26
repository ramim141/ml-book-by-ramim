import SubjectCard from '../../../components/Academic/SubjectCard';

const SSCDashboard = () => {
  const subjects = [
    {
      id: 1,
      title: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)',
      description: 'এসএসসি আইসিটি সিলেবাসের খুঁটিনাটি, বেসিক থেকে এডভান্সড প্রোগ্রামিং এবং ওয়েব ডিজাইনের ধারণা।',
      code: '১৫৪',
      chaptersCount: 6,
      link: '/academic/ssc/ict',
      color: 'cyan'
    },
    {
      id: 2,
      title: 'পদার্থবিজ্ঞান',
      description: 'গতির সূত্র, বল, কাজ, ক্ষমতা, শক্তি এবং আলোর বেসিক কনসেপ্টগুলো সহজে বোঝা।',
      code: '১৩৬',
      chaptersCount: 14,
      link: '/academic/ssc/physics',
      color: 'purple'
    },
    {
      id: 3,
      title: 'উচ্চতর গণিত',
      description: 'সেট, ফাংশন, ত্রিকোণমিতি এবং স্থানাঙ্ক জ্যামিতির সহজ সমাধান।',
      code: '১২৬',
      chaptersCount: 14,
      link: '/academic/ssc/higher-math',
      color: 'indigo'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-xl sm:text-4xl font-extrabold text-white mb-4">
          এসএসসি (নবম-দশম শ্রেণি)
        </h1>
        <p className="text-slate-400 max-w-2xl text-lg">
          এসএসসি পরীক্ষার জন্য প্রয়োজনীয় বিষয়গুলোর বিস্তারিত সিলেবাস, চ্যাপ্টার ভিত্তিক ক্লাস নোটস এবং কুইজ নিচে দেওয়া হলো। আপনার প্রয়োজনীয় বিষয়টি নির্বাচন করুন।
        </p>
      </div>

      {/* Subjects Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <SubjectCard key={subject.id} {...subject} />
        ))}
      </div>

    </div>
  );
};

export default SSCDashboard;
