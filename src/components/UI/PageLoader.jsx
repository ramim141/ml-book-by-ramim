import { SkeletonList } from './Skeleton';

export default function PageLoader() {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 mt-10 space-y-6">
      <SkeletonList count={5} />
    </div>
  );
}
