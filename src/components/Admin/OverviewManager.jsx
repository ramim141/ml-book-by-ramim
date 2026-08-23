import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Users, Swords, BookOpen, Trophy, AlertTriangle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { Skeleton, SkeletonGrid, SkeletonList } from '../UI/Skeleton';
import { STALE } from '../../lib/queryConfig';

export default function OverviewManager() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['admin_overview_stats'],
    // ⚠️ এই কোয়েরিটা পুরো `users` কালেকশন নামায় (নিচের getDocs দেখুন) —
    // অর্থাৎ প্রতিবার রিফেচ মানে ব্যবহারকারীর সংখ্যার সমান Firestore read।
    // ডিফল্ট ৫ মিনিটের বদলে STATS (৬০ মিনিট) রাখা হলো, কারণ ড্যাশবোর্ডের
    // সংখ্যাগুলো মিনিটে মিনিটে বদলায় না। বড় হলে এই হিসাবগুলো Cloud
    // Function এ সরানো দরকার, ক্লায়েন্টে গোনা টেকসই নয়।
    staleTime: STALE.STATS,
    queryFn: async () => {
        let totalUsers = 0;
        let totalExams = 0;
        let totalXP = 0;
        let dailyActive = 0;
        let students = [];
        
        const todayStr = new Date().toDateString();
        
        // For Charts
        const last7DaysMap = {};
        const subjectMap = {};
        
        // Initialize last 7 days with 0
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateKey = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          last7DaysMap[dateKey] = 0;
        }

        const usersSnap = await getDocs(collection(db, 'users'));

        usersSnap.forEach(docSnap => {
          const data = docSnap.data();
          totalUsers++;
          totalXP += (data.xp || 0);
          if (data.lastVisit === todayStr) dailyActive++;
          
          students.push({
            id: docSnap.id,
            name: data.name || 'Unknown',
            xp: data.xp || 0,
            level: data.educationLevel || 'HSC',
          });

          // Join Date Stats (assuming createdAt exists as string or Firestore Timestamp)
          if (data.createdAt) {
            let d;
            if (data.createdAt.toDate) d = data.createdAt.toDate();
            else d = new Date(data.createdAt);
            
            const dateKey = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (last7DaysMap[dateKey] !== undefined) {
              last7DaysMap[dateKey]++;
            }
          }

          // Exam Stats
          if (data.examHistory && Array.isArray(data.examHistory)) {
            totalExams += data.examHistory.length;
            data.examHistory.forEach(exam => {
              if (exam.subject) {
                subjectMap[exam.subject] = (subjectMap[exam.subject] || 0) + 1;
              }
            });
          }
        });

        students.sort((a, b) => b.xp - a.xp);
        
        const joinData = Object.keys(last7DaysMap).map(date => ({
          date,
          count: last7DaysMap[date]
        }));

        const subjectData = Object.keys(subjectMap)
          .map(subject => ({ subject, count: subjectMap[subject] }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5); // top 5 subjects

        return { 
          totalUsers, 
          totalExams, 
          totalXP, 
          dailyActive, 
          topStudents: students.slice(0, 10),
          joinData,
          subjectData
        };
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-8 mt-4">
        <Skeleton className="h-8 w-48 rounded-lg mb-6" />
        <SkeletonGrid count={4} columns="grid-cols-2 lg:grid-cols-4" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <Skeleton className="h-64 w-full rounded-2xl" />
           <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
        <SkeletonList count={5} />
      </div>
    );
  }
  if (isError || !stats) return <div className="flex justify-center p-12 text-rose-500"><AlertTriangle className="w-8 h-8" /></div>;

  return (
    <div>
      {/* শিরোনাম প্যানেল হেডারেই আছে — এখানে রাখলে ডেস্কটপে দুবার দেখাত */}
      
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'মোট স্টুডেন্ট', value: stats.totalUsers, icon: Users, color: 'from-blue-500 to-indigo-600' },
          { label: 'আজকের এক্টিভ', value: stats.dailyActive, icon: Swords, color: 'from-emerald-500 to-teal-600' },
          { label: 'মোট পরীক্ষা', value: stats.totalExams, icon: BookOpen, color: 'from-amber-500 to-orange-600' },
          { label: 'সর্বমোট XP', value: stats.totalXP, icon: Trophy, color: 'from-purple-500 to-fuchsia-600' },
        ].map((s, i) => (
          <div key={i} className="bg-slate-900/50 rounded-2xl p-5 border border-slate-700/50 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 h-16 w-16 bg-gradient-to-br ${s.color} opacity-10 rounded-full translate-x-4 -translate-y-4`} />
            <s.icon className="h-5 w-5 text-slate-400 mb-2" />
            <p className="text-3xl font-black text-white">{s.value}</p>
            <p className="text-sm text-slate-400 mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* New Users Chart */}
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/50">
          <h3 className="font-bold text-white mb-6 flex items-center gap-2"><Users className="h-5 w-5 text-indigo-400" /> গত ৭ দিনে নতুন জয়েন</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.joinData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="count" name="স্টুডেন্ট" stroke="#818cf8" strokeWidth={3} dot={{ r: 4, fill: '#818cf8', strokeWidth: 2, stroke: '#1e293b' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Subjects Chart */}
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/50">
          <h3 className="font-bold text-white mb-6 flex items-center gap-2"><BookOpen className="h-5 w-5 text-emerald-400" /> সবচেয়ে জনপ্রিয় বিষয় (পরীক্ষা)</h3>
          <div className="h-64 w-full">
            {stats.subjectData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">কোনো পরীক্ষার ডেটা নেই।</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.subjectData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="subject" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={100} />
                  <Tooltip 
                    cursor={{ fill: '#1e293b' }}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                    itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="count" name="পরীক্ষা" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/50">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-400" /> টপ ১০ লিডারবোর্ড (XP ভিত্তিক)</h3>
        {stats.topStudents.length === 0 ? (
          <p className="text-slate-500">কোনো স্টুডেন্ট নেই।</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.topStudents.map((s, i) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/30">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                    i === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                    i === 1 ? 'bg-slate-300/20 text-slate-300' :
                    i === 2 ? 'bg-amber-700/20 text-amber-500' :
                    'bg-slate-700/50 text-slate-400'
                  }`}>
                    #{i + 1}
                  </div>
                  <div>
                    <p className="font-bold text-slate-200 text-sm">{s.name}</p>
                    <p className="text-xs text-slate-500">{s.level}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-indigo-300 font-bold text-sm">{s.xp} XP</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
