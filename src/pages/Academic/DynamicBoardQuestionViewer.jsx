import { useParams, Navigate } from 'react-router-dom';
import GenericBoardQuestionViewer from '../../components/Academic/GenericBoardQuestionViewer';
import { getSubjectPath, useResolvedSubject } from '../../utils/academicRoutes';
import { SkeletonList, Skeleton } from '../../components/UI/Skeleton';

export default function DynamicBoardQuestionViewer() {
  const { educationLevel, subject, boardName, year } = useParams();
  const { data: resolved, isLoading: loading } = useResolvedSubject(educationLevel, subject);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0f1c] pb-24 pt-24 font-bangla">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Skeleton className="h-24 w-full rounded-2xl mb-10" />
        <SkeletonList count={4} />
      </div>
    </div>
  );

  if (!resolved) return <Navigate to="/academic/question-bank" replace />;

  return <GenericBoardQuestionViewer subjectId={resolved.id} subjectPath={getSubjectPath(resolved)} />;
}
