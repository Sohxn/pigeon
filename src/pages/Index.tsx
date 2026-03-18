import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEmailData } from "@/hooks/useEmailData";
import { useEmailStore } from "@/store/emailStore";
import { toast } from "sonner";
import EmailSidebar from "@/components/email/EmailSidebar";
import EmailListItem from "@/components/email/EmailListItem";
import EmailView from "@/components/email/EmailView";
import { RefreshCw } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  // const { isAuthenticated } = useAuth();
  const { loadData, sync, isLoading, isSyncing } = useEmailData();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // ── Select only raw/primitive state from the store ──────────────────────
  const accounts          = useEmailStore(state => state.accounts);
  const allEmails         = useEmailStore(state => state.emails);
  const selectedEmailId   = useEmailStore(state => state.selectedEmailId);
  const selectedAccountId = useEmailStore(state => state.selectedAccountId);
  const activeFolder      = useEmailStore(state => state.activeFolder);

  // Actions
  const setSelectedEmailId   = useEmailStore(state => state.setSelectedEmailId);
  const setSelectedAccountId = useEmailStore(state => state.setSelectedAccountId);
  const setActiveFolder      = useEmailStore(state => state.setActiveFolder);

  // ── Derive everything with useMemo — no store functions inside selectors ─

  const emails = useMemo(() => {
    let filtered = allEmails;

    if (selectedAccountId) {
      filtered = filtered.filter(e => e.account_id === selectedAccountId);
    }

    switch (activeFolder) {
      case "inbox":
        filtered = filtered.filter(e => !e.is_archived && !e.is_trashed);
        break;
      case "starred":
        filtered = filtered.filter(e => e.is_starred && !e.is_trashed);
        break;
      case "archive":
        filtered = filtered.filter(e => e.is_archived && !e.is_trashed);
        break;
      case "trash":
        filtered = filtered.filter(e => e.is_trashed);
        break;
    }

    return [...filtered].sort(
      (a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime()
    );
  }, [allEmails, selectedAccountId, activeFolder]);

  const selectedEmail = useMemo(
    () => allEmails.find(e => e.id === selectedEmailId) ?? null,
    [allEmails, selectedEmailId]
  );

  const folderCounts = useMemo(() => {
    const base = selectedAccountId
      ? allEmails.filter(e => e.account_id === selectedAccountId)
      : allEmails;

    return {
      inbox:   base.filter(e => !e.is_archived && !e.is_trashed && !e.is_read).length,
      starred: base.filter(e => e.is_starred && !e.is_trashed).length,
      sent:    0,
      drafts:  0,
      archive: base.filter(e => e.is_archived && !e.is_trashed).length,
      trash:   base.filter(e => e.is_trashed).length,
    };
  }, [allEmails, selectedAccountId]);

  // ── Auth guard ───────────────────────────────────────────────────────────
useEffect(() => {
  if (authLoading) return;
  
  if (!isAuthenticated) {
    navigate("/login");
    return;
  }
  
  // Load emails from database immediately (FAST)
  loadData();
  
  // Auto-sync new emails in background after 2 seconds
  const syncTimer = setTimeout(() => {
    console.log('feather_task_running: Auto-syncing new emails in background...');
    sync(); // This runs in background, doesn't block UI
  }, 2000);
  
  return () => clearTimeout(syncTimer);
}, [isAuthenticated, authLoading, navigate]);



// periodic auto sync 
useEffect(() => {
  if (!isAuthenticated) return;
  
  // Auto-sync every 30 seconds
  const interval = setInterval(() => {
    console.log('🔄 Periodic sync...');
    sync();
  }, 30000); // 30 seconds
  
  return () => clearInterval(interval);
}, [isAuthenticated, sync]);



  // ── Loading state ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading emails...</p>
        </div>
      </div>
    );
  }

  const selectedAccountName = selectedAccountId
    ? accounts.find(a => a.id === selectedAccountId)?.email_address ?? "Unknown"
    : "All Accounts";

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <EmailSidebar
        activeFolder={activeFolder}
        onFolderChange={setActiveFolder}
        onCompose={() => toast.info("Compose coming soon")}
        onOpenSettings={() => toast.info("Settings coming soon")}
        folderCounts={folderCounts}
        accounts={accounts}
        selectedAccountId={selectedAccountId}
        onAccountChange={setSelectedAccountId}
      />

      {/* Email List */}
      <div className="w-96 border-r border-border flex flex-col">
        <div className="h-14 border-b border-border px-4 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold">
              {activeFolder.charAt(0).toUpperCase() + activeFolder.slice(1)}
            </h1>
            <p className="text-xs text-muted-foreground">{selectedAccountName}</p>
          </div>

          <button
            onClick={sync}
            disabled={isSyncing}
            className="p-2 hover:bg-secondary rounded-md transition-colors disabled:opacity-50"
            title="Sync emails"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {emails.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p className="mb-4">No emails</p>
              <button
                onClick={sync}
                className="px-4 py-2 bg-foreground text-background rounded-md hover:opacity-90"
              >
                Sync Emails
              </button>
            </div>
          ) : (
            emails.map(email => (
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

      {/* Email Viewer */}
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
