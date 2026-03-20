import { format } from "date-fns";
import { useEmailStore } from "@/store/emailStore";
import * as api from "@/services/apiClient";
import { Star, Archive, Trash2, Reply, Sparkles } from "lucide-react";
import { useEffect } from "react";
import DOMPurify from 'dompurify';
import { toast } from 'sonner';
import { ComposeInitData } from "./ComposeModal";

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
  onReply?: (data: ComposeInitData) => void;
}

export default function EmailView({ email, onReply }: EmailViewProps) {
  const markAsRead   = useEmailStore(state => state.markEmailAsRead);
  const toggleStar   = useEmailStore(state => state.toggleEmailStar);
  const archiveEmail = useEmailStore(state => state.archiveEmail);

  useEffect(() => {
    if (!email.is_read) {
      markAsRead(email.id);
      api.markEmailAsRead(email.id).catch(err => console.error('Failed to mark as read:', err));
    }
  }, [email.id, email.is_read, markAsRead]);

  const handleToggleStar = async () => {
    try {
      toggleStar(email.id);
      await api.toggleEmailStar(email.id, email.is_starred);
    } catch {
      toast.error('Failed to update email');
      toggleStar(email.id);
    }
  };

  const handleArchive = async () => {
    try {
      archiveEmail(email.id);
      await api.archiveEmail(email.id);
      toast.success('Email archived');
    } catch {
      toast.error('Failed to archive email');
    }
  };

  const handleReply = () => {
    if (!onReply) return;
    const dateStr = format(new Date(email.received_at), 'PPpp');
    const quotedHeader = `\n\n---\nOn ${dateStr}, ${email.from_name ?? email.from_email} <${email.from_email}> wrote:\n`;
    const originalBody = email.body_text || email.body_html?.replace(/<[^>]+>/g, '') || '';
    const quoted = originalBody.split('\n').map(l => `> ${l}`).join('\n');
    const reSubject = email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`;
    onReply({ to: email.from_email, subject: reSubject, body: quotedHeader + quoted });
  };

  const getSanitizedHTML = (html: string) =>
    DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p','br','strong','em','u','a','ul','ol','li','blockquote','h1','h2','h3','h4','h5','h6','div','span','img','table','tr','td','th','thead','tbody'],
      ALLOWED_ATTR: ['href','src','alt','title','class'],
      FORBID_TAGS: ['style','script','iframe','object','embed'],
      FORBID_ATTR: ['style','onclick','onload','onerror'],
    });

  return (
    <div className="flex flex-col bg-background p-2 md:p-4 gap-3">

      {/* Header card */}
      <div className="rounded-2xl shadow-xl p-4 md:p-6 bg-background">
        <div className="flex items-start justify-between mb-4 gap-2">
          <h1 className="text-lg md:text-2xl font-bold flex-1 text-foreground break-words">
            {email.subject || "(No Subject)"}
          </h1>
          <div className="flex gap-1 flex-shrink-0">
            {onReply && (
              <button onClick={handleReply} className="p-2 hover:bg-secondary rounded-md transition-colors" title="Reply">
                <Reply className="w-4 h-4" />
              </button>
            )}
            <button onClick={handleToggleStar} className="p-2 hover:bg-secondary rounded-md transition-colors">
              <Star className={`w-4 h-4 ${email.is_starred ? 'fill-yellow-500 text-yellow-500' : ''}`} />
            </button>
            <button onClick={handleArchive} className="p-2 hover:bg-secondary rounded-md transition-colors" title="Archive">
              <Archive className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-secondary rounded-md transition-colors" title="Delete">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-1 text-sm text-foreground">
          <div className="flex flex-wrap items-center gap-1">
            <span className="font-semibold">From:</span>
            <span>{email.from_name || email.from_email}</span>
            <span className="text-muted-foreground break-all">&lt;{email.from_email}&gt;</span>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <span className="font-semibold">To:</span>
            <span className="break-all">{email.to_email.join(', ')}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold">Date:</span>
            <span>{format(new Date(email.received_at), 'PPpp')}</span>
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div className="rounded-2xl shadow-xl p-4 flex items-center justify-center gap-2 min-h-[56px]">
        <span className="font-semibold text-sm">AI SUMMARY</span>
        <Sparkles className="w-4 h-4" />
      </div>

      {/* Body */}
      <div className="rounded-2xl shadow-xl p-4 md:p-6 bg-background overflow-x-auto">
        {email.body_html ? (
          <div
            className="email-content"
            dangerouslySetInnerHTML={{ __html: getSanitizedHTML(email.body_html) }}
            style={{ fontFamily: 'inherit', fontSize: '14px', lineHeight: '1.6', color: 'inherit' }}
          />
        ) : (
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {email.body_text}
          </div>
        )}
      </div>

      {/* Reply button */}
      {onReply && (
        <div className="pb-4">
          <button
            onClick={handleReply}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          >
            <Reply className="w-4 h-4" />
            Reply to {email.from_name ?? email.from_email}
          </button>
        </div>
      )}
    </div>
  );
}