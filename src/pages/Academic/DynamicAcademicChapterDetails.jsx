import { useParams, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import GenericChapterDetails from '../../components/Academic/GenericChapterDetails';
import { getSubjectPath, useResolvedSubject } from '../../utils/academicRoutes';

export default function DynamicAcademicChapterDetails() {
  const { educationLevel, subject, chapterId } = useParams();
  const { data: resolved, isLoading: loading } = useResolvedSubject(educationLevel, subject);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!resolved) return <Navigate to="/academic" replace />;

  return (
    <GenericChapterDetails
      subjectId={resolved.id}
      chaptersData={{ chapters: resolved.chapters || [] }}
      backLink={getSubjectPath(resolved)}
      subjectLabel={resolved.label}
      subjectLevel={resolved.level}
    />
  );
}
