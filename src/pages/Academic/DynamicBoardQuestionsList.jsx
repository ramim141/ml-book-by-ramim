import { useParams, Navigate } from 'react-router-dom';
import GenericBoardQuestionsList from '../../components/Academic/GenericBoardQuestionsList';
import { getSubjectPath, useResolvedSubject } from '../../utils/academicRoutes';
import { Skeleton, SkeletonGrid } from '../../components/UI/Skeleton';

export default function DynamicBoardQuestionsList() {
  const { educationLevel, subject } = useParams();
  const { data: resolved, isLoading: loading } = useResolvedSubject(educationLevel, subject);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1c] pb-20 pt-24 font-bangla">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <SkeletonGrid count={8} columns="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" />
        </div>
      </div>
    );
  }

  if (!resolved) return <Navigate to="/academic/question-bank" replace />;

  return <GenericBoardQuestionsList subjectId={resolved.id} subjectPath={getSubjectPath(resolved)} />;
}
