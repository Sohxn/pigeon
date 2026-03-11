import { formatDistanceToNow } from "date-fns";

interface EmailListItemProps {
  email: {
    id: string;
    subject: string;
    from_name: string | null;
    from_email: string;
    snippet: string | null;
    received_at: string;
    is_read: boolean;
    is_starred: boolean;
    email_accounts?: {
      email_address: string;
      provider: string;
    };
  };
  isSelected: boolean;
  onClick: () => void;
}

export default function EmailListItem({ email, isSelected, onClick }: EmailListItemProps) {
  return (
    <div
      onClick={onClick}
      className={`
        p-4 border-b border-border cursor-pointer hover:bg-secondary/50 transition-colors
        ${isSelected ? 'bg-secondary' : ''}
        ${!email.is_read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className={`font-medium truncate ${!email.is_read ? 'font-bold' : ''}`}>
            {email.from_name || email.from_email}
          </span>
          {email.is_starred && <span className="text-yellow-500">★</span>}
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
          {formatDistanceToNow(new Date(email.received_at), { addSuffix: true })}
        </span>
      </div>

      <div className={`text-sm mb-1 truncate ${!email.is_read ? 'font-semibold' : ''}`}>
        {email.subject || "(No Subject)"}
      </div>

      <div className="text-xs text-muted-foreground truncate">
        {email.snippet || "No preview available"}
      </div>

      {/* Show which account this email is from */}
      {email.email_accounts && (
        <div className="mt-2">
          <span className="text-xs bg-secondary px-2 py-0.5 rounded">
            {email.email_accounts.email_address}
          </span>
        </div>
      )}
    </div>
  );
}