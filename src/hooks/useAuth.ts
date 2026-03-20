/**
 * Authentication Hook
 * Manages user login, signup, and session
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import * as api from '@/services/apiClient';

// dev mode
import { isDev, devUser } from '@/lib/devMode';

export function useAuth() {
  // added development condition
  const [user, setUser] = useState<any>(isDev? devUser : null);
  const [loading, setLoading] = useState(!isDev); // Add loading state
  const navigate = useNavigate();
  
  // Check if user is logged in on mount
  useEffect(() => {
    // dev mode
    if(isDev) return;

    // production
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false); // Auth check complete
    });
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  const signUp = async (email: string, password: string) => {
    const { user } = await api.signUp(email, password);
    navigate('/dashboard');
    return user;
  };
  
  const signIn = async (email: string, password: string) => {
    await api.signIn(email, password);
    navigate('/dashboard');
  };
  
  const signOut = async () => {
    await api.signOut();
    navigate('/login');
  };
  
  return {
    user,
    loading, // Expose loading state
    signUp,
    signIn,
    signOut,
    isAuthenticated: isDev? true : !!user, 
  };
}