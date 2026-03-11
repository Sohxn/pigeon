import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useEmails, useSyncEmails } from "@/hooks/useEmails";
import { toast } from "sonner";
import EmailLayout from "@/components/email/EmailLayout";
import EmailSidebar from "@/components/email/EmailSidebar";
import EmailListItem from "@/components/email/EmailListItem";
import EmailView from "@/components/email/EmailView";
// import { button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  
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
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <EmailLayout>
      <EmailSidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header with sync button */}
        <div className="border-b border-border p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Inbox</h1>
          <button
            onClick={handleSync}
            disabled={syncEmails.isPending}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncEmails.isPending ? 'animate-spin' : ''}`} />
            Sync
          </button>
        </div>

        {/* Email list */}
        <div className="flex-1 overflow-hidden flex">
          <div className="w-96 border-r border-border overflow-y-auto">
            {emails.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p className="mb-4">No emails yet</p>
                <button onClick={handleSync}>
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

          {/* Email view */}
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
      </div>
    </EmailLayout>
  );
}