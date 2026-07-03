import { useParams, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import GenericBoardQuestionsList from '../../components/Academic/GenericBoardQuestionsList';
import { getSubjectPath, useResolvedSubject } from '../../utils/academicRoutes';

export default function DynamicBoardQuestionsList() {
  const { educationLevel, subject } = useParams();
  const { data: resolved, isLoading: loading } = useResolvedSubject(educationLevel, subject);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!resolved) return <Navigate to="/academic/question-bank" replace />;

  return <GenericBoardQuestionsList subjectId={resolved.id} subjectPath={getSubjectPath(resolved)} />;
}
