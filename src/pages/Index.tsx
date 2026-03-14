/**
 * Inbox Page
 * Main email interface
 * 
 * Now uses Zustand store instead of local state
 * Much simpler and easier to understand!
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEmailData } from "@/hooks/useEmailData";
import { useEmailStore } from "@/store/emailStore";
import { toast } from "sonner";
import EmailSidebar from "@/components/email/EmailSidebar";
import EmailListItem from "@/components/email/EmailListItem";
import EmailView from "@/components/email/EmailView";
import { RefreshCw, Wifi, WifiOff } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { loadData, sync, isLoading, isSyncing } = useEmailData();
  
  // Get state from store
  const accounts = useEmailStore(state => state.accounts);
  const selectedEmailId = useEmailStore(state => state.selectedEmailId);
  const selectedAccountId = useEmailStore(state => state.selectedAccountId);
  const activeFolder = useEmailStore(state => state.activeFolder);
  
  // Get actions from store
  const setSelectedEmailId = useEmailStore(state => state.setSelectedEmailId);
  const setSelectedAccountId = useEmailStore(state => state.setSelectedAccountId);
  const setActiveFolder = useEmailStore(state => state.setActiveFolder);
  
  // Get computed/filtered data
  const emails = useEmailStore(state => state.getFilteredEmails());
  const selectedEmail = useEmailStore(state => state.getSelectedEmail());
  const folderCounts = useEmailStore(state => state.getFolderCounts());
  
  // Check auth on mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);
  
  // Auto-select first email when filtered emails change
  useEffect(() => {
    if (emails.length > 0 && !selectedEmailId) {
      setSelectedEmailId(emails[0].id);
    }
  }, [emails, selectedEmailId, setSelectedEmailId]);
  
  // Loading state
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
  
  // Get selected account name for display
  const selectedAccountName = selectedAccountId
    ? accounts.find(a => a.id === selectedAccountId)?.email_address || "Unknown"
    : "All Accounts";
  
  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar with folders and account switcher */}
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
        {/* Header */}
        <div className="h-14 border-b border-border px-4 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold">
              {activeFolder.charAt(0).toUpperCase() + activeFolder.slice(1)}
            </h1>
            <p className="text-xs text-muted-foreground">{selectedAccountName}</p>
          </div>
          
          {/* Sync button */}
          <button
            onClick={sync}
            disabled={isSyncing}
            className="p-2 hover:bg-secondary rounded-md transition-colors disabled:opacity-50"
            title="Sync emails"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        {/* Email items */}
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
      
      {/* Email viewer */}
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