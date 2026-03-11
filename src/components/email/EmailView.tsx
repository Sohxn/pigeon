import { format } from "date-fns";
import { useMarkAsRead, useToggleStar, useArchiveEmail } from "@/hooks/useEmails";
// import { Button } from "@/components/ui/button";
import { Star, Archive, Trash2 } from "lucide-react";
import { useEffect } from "react";

interface EmailViewProps {
  email: {
    id: string;
    subject: string;
    from_name: string | null;
    from_email: string;
    to_email: string[];
    received_at: string;
    body_text: string;
    body_html: string | null;
    is_read: boolean;
    is_starred: boolean;
  };
}

export default function EmailView({ email }: EmailViewProps) {
  const markAsRead = useMarkAsRead();
  const toggleStar = useToggleStar();
  const archiveEmail = useArchiveEmail();

  // Mark as read when opened
  useEffect(() => {
    if (!email.is_read) {
      markAsRead.mutate(email.id);
    }
  }, [email.id, email.is_read]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-6">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl font-bold flex-1">
            {email.subject || "(No Subject)"}
          </h1>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleStar.mutate({ emailId: email.id, isStarred: email.is_starred })}
            >
              <Star className={`w-4 h-4 ${email.is_starred ? 'fill-yellow-500 text-yellow-500' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => archiveEmail.mutate(email.id)}
            >
              <Archive className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold">From:</span>
            <span>{email.from_name || email.from_email}</span>
            <span className="text-muted-foreground">&lt;{email.from_email}&gt;</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">To:</span>
            <span>{email.to_email.join(', ')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Date:</span>
            <span>{format(new Date(email.received_at), 'PPpp')}</span>
          </div>
        </div>
      </div>

      {/* EMAIL BODY (PRE FORMATTED TEXT WE WONT TOUCH THAT FR) */}
      <div className="flex-1 overflow-y-auto p-6">
        {email.body_html ? (
          <div 
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: email.body_html }}
          />
        ) : (
          <pre className="whitespace-pre-wrap font-sans text-sm">
            {email.body_text}
          </pre>
        )}
      </div>
    </div>
  );
}