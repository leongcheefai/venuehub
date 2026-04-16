import { Navigate, Outlet } from 'react-router-dom';
import { useAdminCheck } from '@/shared/hooks/useAdminCheck';

export function RequireAdmin() {
  const { isAdmin, loading, session } = useAdminCheck();
  if (loading) return <div className="p-8">Loading…</div>;
  if (!session || !isAdmin) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}
