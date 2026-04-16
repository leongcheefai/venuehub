import { useSession } from './useSession';

export function useAdminCheck() {
  const { session, loading } = useSession();
  // In mock mode, any signed-in user is an admin
  return {
    isAdmin: !!session,
    loading,
    session,
  };
}
