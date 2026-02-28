import { supabase } from './supabase';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
const API_URL = import.meta.env.VITE_FLASK_API_URL;

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.labels',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');

export function initiateGmailAuth() {
  const authUrl = 
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(SCOPES)}&` +
    `access_type=offline&` +
    `prompt=consent`;
  
  window.location.href = authUrl;
}

export async function handleGmailCallback(code: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const response = await fetch(`${API_URL}/api/gmail/oauth/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        code,
        user_id: user.id 
      })
    });
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Gmail OAuth error:', error);
    return false;
  }
}

export async function checkGmailConnection(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;
    
    const { data } = await supabase
      .from('user_gmail_tokens')
      .select('is_connected')
      .eq('user_id', user.id)
      .single();
    
    return data?.is_connected || false;
  } catch {
    return false;
  }
}