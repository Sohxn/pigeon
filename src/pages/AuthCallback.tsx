/**
 * OAuth Callback Page
 * Handles Google OAuth redirect
 * 
 * Google redirects here after user authorizes
 * We exchange the code for tokens and save account
 */

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as api from '@/services/apiClient';
import { useEmailStore } from '@/store/emailStore';
import { toast } from 'sonner';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAccounts = useEmailStore(state => state.setAccounts);
  
  useEffect(() => {
    handleCallback();
  }, []);
  
  const handleCallback = async () => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    
    // User denied access
    if (error) {
      toast.error('Gmail connection cancelled');
      navigate('/dashboard');
      return;
    }
    
    // No code provided
    if (!code) {
      toast.error('Invalid OAuth callback');
      navigate('/dashboard');
      return;
    }
    
    try {
      // Exchange code for tokens and save account
      await api.connectGmailAccount(code);
      
      // Reload accounts
      const accounts = await api.fetchEmailAccounts();
      setAccounts(accounts);
      
      toast.success('Gmail account connected!');
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error('OAuth callback error:', error);
      toast.error('Failed to connect Gmail account');
      navigate('/dashboard');
    }
  };
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white text-xl">Connecting your Gmail account...</p>
      </div>
    </div>
  );
}