import { Email, EmailType } from "@/types/email";
import { Star, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";
import { getUrgency, getSilenceDuration } from "@/hooks/useTimeAwareness";

interface EmailListItemProps {
  email: Email;
  isSelected: boolean;
  onClick: () => void;
  onToggleStar: (e: React.MouseEvent) => void;
}

function formatEmailDate(date: Date): string {
  if (isToday(date)) {
    return format(date, "h:mm a");
  }
  if (isYesterday(date)) {
    return "Yesterday";
  }
  return format(date, "MMM d");
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// iOS-inspired badge styles using design tokens
function getTypeBadgeClasses(type: EmailType): string {
  const styles: Record<EmailType, string> = {
    proposal: "bg-badge-proposal-bg text-badge-proposal",
    "follow-up": "bg-badge-followup-bg text-badge-followup",
    inquiry: "bg-badge-inquiry-bg text-badge-inquiry",
    invoice: "bg-badge-invoice-bg text-badge-invoice",
    personal: "bg-badge-personal-bg text-badge-personal",
    newsletter: "bg-badge-newsletter-bg text-badge-newsletter",
    notification: "bg-badge-notification-bg text-badge-notification",
  };
  return styles[type] || "bg-muted text-muted-foreground";
}

export function EmailListItem({ email, isSelected, onClick, onToggleStar }: EmailListItemProps) {
  const hasDetails = email.type || email.amount || email.deadline;
  const urgency = getUrgency(email);
  const silence = getSilenceDuration(email);

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3 email-item border-b border-border",
        isSelected && "selected",
        !email.read && "bg-secondary/30",
        urgency === "overdue" && "border-l-2 border-l-[hsl(var(--badge-overdue))]",
        urgency === "urgent" && "border-l-2 border-l-[hsl(var(--badge-urgent))]"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Unread indicator / Star */}
        <div className="flex flex-col items-center gap-1 pt-1">
          {!email.read && (
            <div className="w-2 h-2 rounded-full bg-foreground" />
          )}
          {email.read && (
            <button
              onClick={onToggleStar}
              className={cn(
                "p-0.5 hover:bg-muted rounded transition-colors",
                email.starred ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Star className={cn("w-3.5 h-3.5", email.starred && "fill-current")} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className={cn(
              "text-sm truncate",
              !email.read && "font-semibold"
            )}>
              {email.from.name}
            </span>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {formatEmailDate(email.date)}
            </span>
          </div>

          <div className="mb-1">
            <span className={cn(
              "text-sm truncate block",
              !email.read ? "text-foreground" : "text-muted-foreground"
            )}>
              {email.subject}
            </span>
          </div>

          <p className="text-xs text-muted-foreground truncate mb-2">
            {email.preview}
          </p>

          {/* Badges row: urgency + type + amount + deadline + silence */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Urgency badge */}
            {urgency === "overdue" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-badge-overdue-bg text-badge-overdue">
                <AlertTriangle className="w-3 h-3" />
                Overdue
              </span>
            )}
            {urgency === "urgent" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-badge-urgent-bg text-badge-urgent">
                <AlertTriangle className="w-3 h-3" />
                Urgent
              </span>
            )}

            {/* Type badge */}
            {email.type && (
              <span className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium capitalize",
                getTypeBadgeClasses(email.type)
              )}>
                {email.type}
              </span>
            )}

            {/* Amount badge */}
            {email.amount && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-badge-amount-bg text-badge-amount">
                {formatAmount(email.amount)}
              </span>
            )}

            {/* Deadline badge */}
            {email.deadline && (
              <span className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium",
                urgency === "overdue" ? "bg-badge-overdue-bg text-badge-overdue" : "bg-badge-deadline-bg text-badge-deadline"
              )}>
                Due {format(email.deadline, "MMM d")}
              </span>
            )}

            {/* Silence duration */}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-muted-foreground ml-auto">
              <Clock className="w-3 h-3" />
              {silence}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
