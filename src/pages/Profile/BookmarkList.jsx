import { collection, query, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { BookmarkX, Trash2, HelpCircle } from 'lucide-react';
import SharedMCQItem from '../../components/Academic/SharedMCQItem';
import SharedCQItem from '../../components/Academic/SharedCQItem';
import SharedKQItem from '../../components/Academic/SharedKQItem';
import { SkeletonList } from '../../components/UI/Skeleton';
import { STALE } from '../../lib/queryConfig';

const TYPE_LABELS = { mcq: 'MCQ', cq: 'সৃজনশীল', kq: 'জ্ঞান/অনুধাবন' };

function BookmarkCard({ bookmark, index, onDelete, deleting }) {
  const label = TYPE_LABELS[bookmark.type] || 'প্রশ্ন';

  let body = null;
  if (bookmark.type === 'mcq') body = <SharedMCQItem mcq={bookmark} index={index} />;
  else if (bookmark.type === 'cq') body = <SharedCQItem cq={bookmark} index={index} />;
  else if (bookmark.type === 'kq') body = <SharedKQItem kq={bookmark} />;

  return (
    <div className="group relative rounded-2xl border border-slate-700/50 bg-slate-900/40 p-3 transition-colors hover:border-slate-600/70 sm:p-4">
      <div className="mb-2.5 flex items-center gap-2">
        <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-indigo-300">
          {label}
        </span>
        {bookmark.chapterName && (
          <span className="truncate text-[11px] font-semibold text-slate-500">{bookmark.chapterName}</span>
        )}

        <button
          type="button"
          onClick={() => onDelete(bookmark.id)}
          disabled={deleting}
          title="বুকমার্ক থেকে সরান"
          aria-label="বুকমার্ক থেকে সরান"
          className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {body ?? (
        /* অজানা ধরনের বুকমার্ক আগে নীরবে কিছুই দেখাত না — এখন অন্তত জানা যায় */
        <div className="flex items-start gap-2.5 rounded-xl border border-slate-800 bg-slate-950/40 p-3">
          <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
          <p className="text-sm text-slate-400">
            {bookmark.question || bookmark.title || 'এই প্রশ্নটি আর দেখানো যাচ্ছে না।'}
          </p>
        </div>
      )}
    </div>
  );
}

export default function BookmarkList() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const uid = currentUser?.uid;
  const queryKey = ['bookmarks', uid];

  const { data: bookmarks = [], isLoading } = useQuery({
    queryKey,
    enabled: Boolean(uid),
    staleTime: STALE.CONTENT,
    queryFn: async () => {
      const snapshot = await getDocs(
        query(collection(db, 'users', uid, 'bookmarks'), orderBy('bookmarkedAt', 'desc'))
      );
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
  });

  const { mutate: removeBookmark, isPending } = useMutation({
    mutationFn: (bookmarkId) => deleteDoc(doc(db, 'users', uid, 'bookmarks', bookmarkId)),
    // তালিকা থেকে সাথে সাথেই সরিয়ে দিই, সার্ভারের উত্তরের অপেক্ষা না করে
    onMutate: async (bookmarkId) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old = []) => old.filter((b) => b.id !== bookmarkId));
      return { previous };
    },
    onError: (err, _id, context) => {
      console.error(err);
      queryClient.setQueryData(queryKey, context?.previous);
      toast.error('বুকমার্ক সরানো যায়নি।');
    },
    onSuccess: () => toast.success('বুকমার্ক সরানো হয়েছে।'),
  });

  if (isLoading) return <SkeletonList count={4} />;

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/30 px-6 py-14 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/60">
          <BookmarkX className="h-8 w-8 text-slate-500" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-slate-200">কোনো বুকমার্ক নেই</h3>
        <p className="max-w-sm text-sm text-slate-400">
          প্র্যাকটিস করার সময় কোনো প্রশ্ন গুরুত্বপূর্ণ মনে হলে বুকমার্ক আইকনে ক্লিক করে সেভ করে রাখো — সেগুলো এখানে জমা হবে।
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <p className="text-xs font-bold text-slate-500">
        মোট {bookmarks.length} টি সেভ করা প্রশ্ন
      </p>

      {bookmarks.map((bookmark, index) => (
        <BookmarkCard
          key={bookmark.id}
          bookmark={bookmark}
          index={index}
          onDelete={removeBookmark}
          deleting={isPending}
        />
      ))}
    </div>
  );
}
