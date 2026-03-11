import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useEmails, useSyncEmails } from "@/hooks/useEmails";
import { toast } from "sonner";
import EmailSidebar from "@/components/email/EmailSidebar";
import EmailListItem from "@/components/email/EmailListItem";
import EmailView from "@/components/email/EmailView";
import { RefreshCw } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState("inbox");
  
  const { data: emails = [], isLoading, error } = useEmails();
  const syncEmails = useSyncEmails();

  // Check auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
      }
    });
  }, [navigate]);

  // Handle sync
  const handleSync = () => {
    toast.promise(syncEmails.mutateAsync(), {
      loading: 'Syncing emails...',
      success: (data) => `Synced ${data.synced} emails`,
      error: 'Failed to sync emails',
    });
  };

  const selectedEmail = emails.find(e => e.id === selectedEmailId);

  // Auto-select first email when emails load
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
    sent: 0, // Not implemented yet
    drafts: 0, // Not implemented yet
    archive: emails.filter(e => e.is_archived && !e.is_trashed).length,
    trash: emails.filter(e => e.is_trashed).length,
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <EmailSidebar
        activeFolder={activeFolder}
        onFolderChange={setActiveFolder}
        onCompose={() => toast.info("Compose not yet implemented")}
        onOpenSettings={() => toast.info("Settings not yet implemented")}
        folderCounts={folderCounts}
      />

      {/* Email List */}
      <div className="w-96 border-r border-border flex flex-col">
        {/* Header with sync button */}
        <div className="h-14 border-b border-border p-4 flex items-center justify-between">
          <h1 className="text-sm font-semibold">Inbox ({emails.length})</h1>
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
              <p className="mb-4">No emails yet</p>
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