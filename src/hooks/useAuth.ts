/**
 * Authentication Hook
 * Manages user login, signup, and session
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import * as api from '@/services/apiClient';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Check if user is logged in on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
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
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };
}