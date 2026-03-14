/**
 * Email Data Hook
 * Loads emails and accounts into the store
 * Syncs with backend
 */

import { useEffect } from 'react';
import { useEmailStore } from '@/store/emailStore';
import * as api from '@/services/apiClient';
import { toast } from 'sonner';

export function useEmailData() {
  const store = useEmailStore();
  
  // Load initial data when component mounts
  useEffect(() => {
    loadData();
  }, []);
  
  /**
   * Load accounts and emails from database
   * Called on initial page load
   */
  const loadData = async () => {
    try {
      store.setLoading(true);
      store.setError(null);
      
      // Load in parallel for speed
      const [accounts, emails] = await Promise.all([
        api.fetchEmailAccounts(),
        api.fetchEmails(),
      ]);
      
      store.setAccounts(accounts);
      store.setEmails(emails);
      
      // Auto-select first email if none selected
      if (emails.length > 0 && !store.selectedEmailId) {
        store.setSelectedEmailId(emails[0].id);
      }
      
    } catch (error: any) {
      console.error('Failed to load data:', error);
      store.setError(error.message);
      toast.error('Failed to load emails');
    } finally {
      store.setLoading(false);
    }
  };
  
  /**
   * Sync emails from Gmail
   * Called when user clicks "Sync" button
   */
  const sync = async () => {
    try {
      store.setSyncing(true);
      
      const result = await api.syncEmails();
      
      // Reload emails after sync
      const emails = await api.fetchEmails();
      store.setEmails(emails);
      
      if (result.synced > 0) {
        toast.success(`Synced ${result.synced} new emails`);
      } else {
        toast.info('No new emails');
      }
      
    } catch (error: any) {
      console.error('Sync failed:', error);
      toast.error('Failed to sync emails');
    } finally {
      store.setSyncing(false);
    }
  };
  
  return {
    loadData,
    sync,
    isLoading: store.isLoading,
    isSyncing: store.isSyncing,
    error: store.error,
  };
}