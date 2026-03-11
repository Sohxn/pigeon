import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const API_URL = import.meta.env.VITE_FLASK_API_URL;


//explicitly defined TYPE: EMAIL 
interface Email {
  id: string;
  account_id: string;
  gmail_id: string;
  subject: string;
  from_email: string;
  from_name: string | null;
  to_email: string[];
  body_text: string;
  body_html: string | null;
  snippet: string | null;
  received_at: string;
  labels: string[];
  is_read: boolean;
  is_starred: boolean;
  is_archived: boolean;
  is_trashed: boolean;
}


// EMAIL FUNCTIONS 
//
//
// Fetch emails from Supabase
export function useEmails() {
  return useQuery({
    queryKey: ['emails'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('emails')
        .select(`
          *,
          email_accounts (
            email_address,
            provider
          )
        `)
        .eq('user_id', user.id)
        .eq('is_trashed', false)
        .order('received_at', { ascending: false })
        .limit(50);


      if (error) throw error;
      return data as Email[];
    },
  });
}


// Sync emails from Gmail
export function useSyncEmails() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const response = await fetch(`${API_URL}/api/gmail/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      });

      if (!response.ok) throw new Error('Sync failed');
      return response.json();
    },
    onSuccess: () => {
      // Refetch emails after sync
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });
}



// Mark as read
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (emailId: string) => {
      const { error } = await supabase
        .from('emails')
        .update({ is_read: true })
        .eq('id', emailId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });
}


// Star/unstar
export function useToggleStar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ emailId, isStarred }: { emailId: string; isStarred: boolean }) => {
      const { error } = await supabase
        .from('emails')
        .update({ is_starred: !isStarred })
        .eq('id', emailId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });
}


// Archive
export function useArchiveEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (emailId: string) => {
      const { error } = await supabase
        .from('emails')
        .update({ is_archived: true })
        .eq('id', emailId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });
}