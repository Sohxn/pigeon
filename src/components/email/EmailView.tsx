import { format } from "date-fns";
import { useMarkAsRead, useToggleStar, useArchiveEmail } from "@/hooks/useEmails";
import { Star, Archive, Trash2 } from "lucide-react";
import { useEffect } from "react";
import DOMPurify from 'dompurify';

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
  }, [email.id, email.is_read, markAsRead]);

  // Sanitize HTML to prevent XSS and remove problematic styles
  const getSanitizedHTML = (html: string) => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span', 'img', 'table', 'tr', 'td', 'th', 'thead', 'tbody'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
      FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed'],
      FORBID_ATTR: ['style', 'onclick', 'onload', 'onerror']
    });
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-6 bg-background">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl font-bold flex-1 text-foreground">
            {email.subject || "(No Subject)"}
          </h1>
          
          <div className="flex gap-2">
            <button
              onClick={() => toggleStar.mutate({ emailId: email.id, isStarred: email.is_starred })}
              className="p-2 hover:bg-secondary rounded-md transition-colors"
              title={email.is_starred ? "Unstar" : "Star"}
            >
              <Star className={`w-4 h-4 ${email.is_starred ? 'fill-yellow-500 text-yellow-500' : ''}`} />
            </button>
            <button
              onClick={() => archiveEmail.mutate(email.id)}
              className="p-2 hover:bg-secondary rounded-md transition-colors"
              title="Archive"
            >
              <Archive className="w-4 h-4" />
            </button>
            <button 
              className="p-2 hover:bg-secondary rounded-md transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2 text-sm text-foreground">
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

      {/* Body - FIXED FORMATTING */}
      <div className="flex-1 overflow-y-auto p-6 bg-background">
        {email.body_html ? (
          <div 
            className="email-content"
            dangerouslySetInnerHTML={{ __html: getSanitizedHTML(email.body_html) }}
            style={{
              fontFamily: 'inherit',
              fontSize: '14px',
              lineHeight: '1.6',
              color: 'inherit'
            }}
          />
        ) : (
          <div 
            className="whitespace-pre-wrap text-sm leading-relaxed text-foreground"
            style={{
              fontFamily: 'ui-sans-serif, system-ui, sans-serif',
              fontSize: '14px'
            }}
          >
            {email.body_text}
          </div>
        )}
      </div>
    </div>
  );
}