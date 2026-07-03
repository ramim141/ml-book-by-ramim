import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isAdmin } from '../../config/roles';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin(currentUser.email)) {
    return <Navigate to="/academic" replace />;
  }

  return children;
}
