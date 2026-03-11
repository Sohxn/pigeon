import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useEmails, useSyncEmails } from "@/hooks/useEmails";
import { toast } from "sonner";
import EmailSidebar from "@/components/email/EmailSidebar";
import EmailListItem from "@/components/email/EmailListItem";
import EmailView from "@/components/email/EmailView";
import { RefreshCw } from "lucide-react";

interface EmailAccount {
  id: string;
  email_address: string;
  provider: string;
  is_primary: boolean;
}

export default function Index() {
  const navigate = useNavigate();
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState("inbox");
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null); // null = All Accounts
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  
  const { data: allEmails = [], isLoading, error } = useEmails();
  const syncEmails = useSyncEmails();

  // Load user's email accounts
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('email_accounts')
      .select('id, email_address, provider, is_primary')
      .eq('user_id', user.id)
      .order('is_primary', { ascending: false });

    if (data) {
      setAccounts(data);
    }
  };

  // Check auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
      }
    });
  }, [navigate]);

  // Filter emails by selected account
  const emails = selectedAccountId 
    ? allEmails.filter(e => e.account_id === selectedAccountId)
    : allEmails;

  // Handle sync
  const handleSync = () => {
    toast.promise(syncEmails.mutateAsync(), {
      loading: 'Syncing emails...',
      success: (data) => `Synced ${data.synced} emails`,
      error: 'Failed to sync emails',
    });
  };

  const selectedEmail = emails.find(e => e.id === selectedEmailId);

  // Auto-select first email when emails change
  useEffect(() => {
    if (emails.length > 0 && !selectedEmailId) {
      setSelectedEmailId(emails[0].id);
    }
  }, [emails, selectedEmailId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading emails...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load emails</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-foreground text-background rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const folderCounts = {
    inbox: emails.filter(e => !e.is_archived && !e.is_trashed && !e.is_read).length,
    starred: emails.filter(e => e.is_starred && !e.is_trashed).length,
    sent: 0,
    drafts: 0,
    archive: emails.filter(e => e.is_archived && !e.is_trashed).length,
    trash: emails.filter(e => e.is_trashed).length,
  };

  // Get selected account name
  const selectedAccountName = selectedAccountId
    ? accounts.find(a => a.id === selectedAccountId)?.email_address
    : "All Accounts";

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <EmailSidebar
        activeFolder={activeFolder}
        onFolderChange={setActiveFolder}
        onCompose={() => toast.info("Compose not yet implemented")}
        onOpenSettings={() => toast.info("Settings not yet implemented")}
        folderCounts={folderCounts}
        accounts={accounts}
        selectedAccountId={selectedAccountId}
        onAccountChange={setSelectedAccountId}
      />

      {/* Email List */}
      <div className="w-96 border-r border-border flex flex-col">
        {/* Header with account name and sync button */}
        <div className="h-14 border-b border-border px-4 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold">{activeFolder.charAt(0).toUpperCase() + activeFolder.slice(1)}</h1>
            <p className="text-xs text-muted-foreground">{selectedAccountName}</p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncEmails.isPending}
            className="p-2 hover:bg-secondary rounded-md transition-colors disabled:opacity-50"
            title="Sync emails"
          >
            <RefreshCw className={`w-4 h-4 ${syncEmails.isPending ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Email List */}
        <div className="flex-1 overflow-y-auto">
          {emails.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p className="mb-4">No emails in this account</p>
              <button 
                onClick={handleSync}
                className="px-4 py-2 bg-foreground text-background rounded-md hover:opacity-90"
              >
                Sync Emails
              </button>
            </div>
          ) : (
            emails.map((email) => (
              <EmailListItem
                key={email.id}
                email={email}
                isSelected={email.id === selectedEmailId}
                onClick={() => setSelectedEmailId(email.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Email View */}
      <div className="flex-1 overflow-y-auto">
        {selectedEmail ? (
          <EmailView email={selectedEmail} />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Select an email to read
          </div>
        )}
      </div>
    </div>
  );
}