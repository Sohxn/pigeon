import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { initiateGmailAuth } from "@/lib/google_auth";
import { EmailAccount } from "@/types/email";

//email syncing 
import { useSyncEmails } from "@/hooks/useEmails";
import { toast } from "sonner";

export default function Dashboard() {

  const syncEmails = useSyncEmails();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [loading, setLoading] = useState(true);


  //email syncing 
  const handleSyncAll = () => {
      toast.promise(syncEmails.mutateAsync(), {
      loading: 'Syncing all accounts...',
      success: (data) => `Synced ${data.synced} emails from ${data.accounts_synced} accounts`,
      error: 'Failed to sync',
    });
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Check auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }
    setUser(session.user);

    // Load connected email accounts
    const { data: accountsData } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', session.user.id)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true });

    setAccounts(accountsData || []);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleAddGmail = () => {
    // Store state to know we're adding an account
    localStorage.setItem('adding_account', 'true');
    initiateGmailAuth();
  };

  const handleGoToInbox = () => {
    if (accounts.length === 0) {
      alert('Please add at least one email account first');
      return;
    }
    navigate("/");
  };

  const handleRemoveAccount = async (accountId: string) => {
    if (!confirm('Remove this email account? All synced emails will be deleted.')) {
      return;
    }

    await supabase
      .from('email_accounts')
      .delete()
      .eq('id', accountId);

    loadData();
  };

  const handleSetPrimary = async (accountId: string) => {
    // Unset all primary flags
    await supabase
      .from('email_accounts')
      .update({ is_primary: false })
      .eq('user_id', user.id);

    // Set this one as primary
    await supabase
      .from('email_accounts')
      .update({ is_primary: true })
      .eq('id', accountId);

    loadData();
  };

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
          <h1 className="text-xl font-bold">Pigeon Mail</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <button
              onClick={handleLogout}
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
            Manage your connected email accounts. All emails will appear in a unified inbox.
          </p>
        </div>

        {/* Connected Accounts */}
        <div className="space-y-4 mb-8">
          {accounts.length === 0 ? (
            <div className="border border-dashed border-border rounded-lg p-12 text-center">
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
                      {/* Add more provider icons */}
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

                  {/* BUTTON TO SYNC EMAILS */}
                  {accounts.length > 0 && (
                    <button onClick={handleSyncAll} disabled={syncEmails.isPending}>
                        {syncEmails.isPending ? 'Syncing' : 'Sync All Accounts'}
                    </button>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!account.is_primary && (
                      <button
                        onClick={() => handleSetPrimary(account.id)}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        Set as primary
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveAccount(account.id)}
                      className="text-sm text-red-600 hover:text-red-700"
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
              onClick={() => {/* Implement sync all */}}
              className="px-6 py-3 border border-border rounded-md hover:bg-secondary"
            >
              Sync All Accounts
            </button>
          </div>
        )}
      </main>
    </div>
  );
}