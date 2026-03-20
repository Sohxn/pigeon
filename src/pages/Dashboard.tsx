/**
 * Dashboard Page
 * Manage email accounts
 * 
 * Shows connected accounts, allows adding/removing accounts
 * Simplified with hooks and store
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEmailStore } from "@/store/emailStore";
import { initiateGmailAuth } from "@/lib/google_auth";
import * as api from "@/services/apiClient";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
 const { user, signOut, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  
  // Get accounts from store
  const accounts = useEmailStore(state => state.accounts);
  const setAccounts = useEmailStore(state => state.setAccounts);
  
  // Load accounts on mount
 useEffect(() => {
    // Wait until Supabase has resolved the session before acting
    if (authLoading) return;
 
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
 
    loadAccounts();
  }, [isAuthenticated, authLoading, navigate]);
  
  /**
   * Load user's email accounts from database
   */
  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await api.fetchEmailAccounts();
      setAccounts(data);
    } catch (error: any) {
      console.error('Failed to load accounts:', error);
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Add a new Gmail account via OAuth
   */
  const handleAddGmail = () => {
    // Store flag to know we're adding account
    localStorage.setItem('adding_account', 'true');
    initiateGmailAuth();
  };
  
  /**
   * Navigate to inbox (main email view)
   */
  const handleGoToInbox = () => {
    if (accounts.length === 0) {
      toast.error('Please add at least one email account first');
      return;
    }
    navigate("/");
  };
  
  /**
   * Remove an email account
   */
  const handleRemoveAccount = async (accountId: string) => {
    if (!confirm('Remove this email account? All synced emails will be deleted.')) {
      return;
    }
    
    try {
      await api.removeEmailAccount(accountId);
      await loadAccounts(); // Reload list
      toast.success('Account removed');
    } catch (error: any) {
      console.error('Failed to remove account:', error);
      toast.error('Failed to remove account');
    }
  };
  
  /**
   * Set an account as primary
   */
  const handleSetPrimary = async (accountId: string) => {
    try {
      await api.setPrimaryAccount(accountId);
      await loadAccounts(); // Reload list
      toast.success('Primary account updated');
    } catch (error: any) {
      console.error('Failed to set primary:', error);
      toast.error('Failed to update primary account');
    }
  };
  
  /**
   * Sync all email accounts
   */
  const handleSyncAll = async () => {
    try {
      setSyncing(true);
      const result = await api.syncEmails();
      
      if (result.synced > 0) {
        toast.success(`Synced ${result.synced} emails from ${result.accounts_synced} accounts`);
      } else {
        toast.info('No new emails');
      }
    } catch (error: any) {
      console.error('Sync failed:', error);
      toast.error('Failed to sync emails');
    } finally {
      setSyncing(false);
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold" style={{ fontFamily: "'Magnolia Script', cursive" }}>Feathermail</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <button
              onClick={signOut}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Email Accounts</h2>
          <p className="text-muted-foreground">
            Manage your connected email accounts. All emails appear in a unified inbox.
          </p>
        </div>
        
        {/* Connected Accounts */}
        <div className="space-y-4 mb-8">
          {accounts.length === 0 ? (
            // Empty state
            <div className="border border-dashed border-border rounded-2xl rounded-2xl shadow-[28px_28px_50px_rgba(0,0,0,0.15),_-23px_-23px_45px_rgba(255,255,255,0.8)] p-12 text-center">
              <div className="w-16 h-16 bg-foreground/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">No email accounts connected</h3>
              <p className="text-muted-foreground mb-6">
                Add your first email account to get started
              </p>
              <button
                onClick={handleAddGmail}
                className="px-4 py-2 bg-foreground text-background rounded-md hover:opacity-90"
              >
                Add Email Account
              </button>
            </div>
          ) : (
            // Account list
            <>
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="border border-border rounded-lg p-4 flex items-center justify-between hover:border-foreground/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Provider Icon */}
                    <div className="w-12 h-12 bg-foreground/10 rounded-full flex items-center justify-center">
                      {account.provider === 'gmail' && (
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                        </svg>
                      )}
                    </div>
                    
                    {/* Account Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{account.email_address}</span>
                        {account.is_primary && (
                          <span className="text-xs bg-foreground text-background px-2 py-0.5 rounded">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {account.provider.charAt(0).toUpperCase() + account.provider.slice(1)}
                        {account.last_sync && (
                          <span> • Last synced {new Date(account.last_sync).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!account.is_primary && (
                      <button
                        onClick={() => handleSetPrimary(account.id)}
                        className="text-sm text-muted-foreground hover:text-foreground px-3 py-1 rounded-md hover:bg-secondary"
                      >
                        Set as primary
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveAccount(account.id)}
                      className="text-sm text-red-600 hover:text-red-700 px-3 py-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Add Another Account */}
              <button
                onClick={handleAddGmail}
                className="w-full border border-dashed border-border rounded-lg p-4 text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
              >
                + Add another email account
              </button>
            </>
          )}
        </div>
        
        {/* Action Buttons */}
        {accounts.length > 0 && (
          <div className="flex gap-3">
            <button
              onClick={handleGoToInbox}
              className="px-6 py-3 bg-foreground text-background rounded-md hover:opacity-90 font-medium"
            >
              Go to Inbox →
            </button>
            <button
              onClick={handleSyncAll}
              disabled={syncing}
              className="px-6 py-3 border border-border rounded-md hover:bg-secondary disabled:opacity-50"
            >
              {syncing ? 'Syncing...' : 'Sync All Accounts'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}