import { useParams, Navigate } from 'react-router-dom';
import GenericSubjectHome from '../../components/Academic/GenericSubjectHome';
import { getSubjectPath, useResolvedSubject } from '../../utils/academicRoutes';
import { Skeleton, SkeletonGrid } from '../../components/UI/Skeleton';

export default function DynamicAcademicSubjectHome() {
  const { educationLevel, subject } = useParams();
  const { data: resolved, isLoading: loading } = useResolvedSubject(educationLevel, subject);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-16">
        <Skeleton className="h-4 w-48 mb-8" />
        <Skeleton className="h-48 w-full rounded-3xl mb-12" />
        <Skeleton className="h-24 w-full rounded-2xl mb-12" />
        <Skeleton className="h-8 w-40 mb-6" />
        <SkeletonGrid count={6} columns="sm:grid-cols-2 lg:grid-cols-3" />
      </div>
    );
  }

  if (!resolved) return <Navigate to="/academic" replace />;

  return <GenericSubjectHome subjectId={resolved.id} subjectPath={getSubjectPath(resolved)} />;
}
