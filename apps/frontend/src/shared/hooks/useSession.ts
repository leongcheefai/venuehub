import { useState, useCallback } from 'react';

// Mock session for development without Supabase Auth
export interface MockSession {
  user: { id: string; email: string };
  access_token: string;
}

export function useSession() {
  const [session, setSession] = useState<MockSession | null>(() => {
    const stored = sessionStorage.getItem('mock-session');
    return stored ? JSON.parse(stored) : null;
  });

  const signIn = useCallback((email: string, _password: string) => {
    // Accept any admin@venuehub.com / admin123 combo
    if (email === 'admin@venuehub.com') {
      const s: MockSession = {
        user: { id: 'admin-001', email },
        access_token: 'mock-token',
      };
      sessionStorage.setItem('mock-session', JSON.stringify(s));
      setSession(s);
      return { error: null };
    }
    return { error: { message: 'Invalid credentials' } };
  }, []);

  const signOut = useCallback(() => {
    sessionStorage.removeItem('mock-session');
    setSession(null);
  }, []);

  return { session, loading: false, signIn, signOut };
}
