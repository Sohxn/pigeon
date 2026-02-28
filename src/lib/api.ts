import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_FLASK_API_URL;


//GMAIL API -> supabase (not in the app)
//will set a frequency for auto refresh
export async function syncEmails() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');
  
  const response = await fetch(`${API_URL}/api/gmail/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: user.id })
  });
  
  return response.json();
}


// supabase -> app (not touching the GMAIL API)
export async function getEmails() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');
  
  const response = await fetch(`${API_URL}/api/emails?user_id=${user.id}`);
  return response.json();
}


//more function for sending mails etc 
//.....