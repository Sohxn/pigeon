import { Email, EmailType } from "@/types/email";
import { format } from "date-fns";
import {
  Star,
  Reply,
  Forward,
  MoreHorizontal,
  Archive,
  Trash2,
  Sparkles,
  RotateCcw,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getUrgency, getSilenceDuration } from "@/hooks/useTimeAwareness";

interface EmailViewProps {
  email: Email | null;
  onArchive: () => void;
  onTrash: () => void;
  onToggleStar: () => void;
  onRestore: () => void;
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

export function EmailView({ email, onArchive, onTrash, onToggleStar, onRestore }: EmailViewProps) {
  if (!email) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Select an email to read</p>
          <p className="text-xs mt-1">Use ↑↓ to navigate</p>
        </div>
      </div>
    );
  }

  const isInTrash = email.trashed;
  const hasDetails = email.type || email.amount || email.deadline;
  const urgency = getUrgency(email);
  const silence = getSilenceDuration(email);

  return (
    <motion.div
      key={email.id}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col bg-background overflow-hidden"
    >
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-6 border-b border-border">
        <div className="flex items-center gap-2">
          {isInTrash ? (
            <button 
              onClick={onRestore}
              className="p-2 hover:bg-secondary rounded-md transition-colors"
              title="Restore"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={onArchive}
              className="p-2 hover:bg-secondary rounded-md transition-colors"
              title="Archive"
            >
              <Archive className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={onTrash}
            className="p-2 hover:bg-secondary rounded-md transition-colors"
            title={isInTrash ? "Delete permanently" : "Trash"}
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button 
            onClick={onToggleStar}
            className={cn(
              "p-2 hover:bg-secondary rounded-md transition-colors",
              email.starred && "text-foreground"
            )}
            title={email.starred ? "Unstar" : "Star"}
          >
            <Star className={cn("w-4 h-4", email.starred && "fill-foreground")} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-secondary rounded-md transition-colors">
            <Reply className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-secondary rounded-md transition-colors">
            <Forward className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-secondary rounded-md transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Email Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
        {/* Subject */}
        <h1 className="text-xl font-semibold leading-tight mb-4">{email.subject}</h1>

        {/* Badges: urgency + type + amount + deadline + silence */}
        {(hasDetails || urgency !== "normal") && (
          <div className="flex items-center gap-2 flex-wrap mb-6 pb-4 border-b border-border">
            {urgency === "overdue" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-badge-overdue-bg text-badge-overdue">
                <AlertTriangle className="w-3.5 h-3.5" />
                Overdue
              </span>
            )}
            {urgency === "urgent" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-badge-urgent-bg text-badge-urgent">
                <AlertTriangle className="w-3.5 h-3.5" />
                Urgent
              </span>
            )}
            {email.type && (
              <span className={cn(
                "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize",
                getTypeBadgeClasses(email.type)
              )}>
                {email.type}
              </span>
            )}
            {email.amount && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-badge-amount-bg text-badge-amount">
                {formatAmount(email.amount)}
              </span>
            )}
            {email.deadline && (
              <span className={cn(
                "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                urgency === "overdue" ? "bg-badge-overdue-bg text-badge-overdue" : "bg-badge-deadline-bg text-badge-deadline"
              )}>
                Due {format(email.deadline, "MMM d, yyyy")}
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-secondary text-muted-foreground ml-auto">
              <Clock className="w-3.5 h-3.5" />
              {silence}
            </span>
          </div>
        )}

        {/* AI Summary */}
        {email.summary && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 p-4 bg-secondary/50 rounded-lg border border-border"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                AI Summary
              </span>
            </div>
            <p className="text-sm text-foreground">{email.summary}</p>
          </motion.div>
        )}

        {/* Sender Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-medium">
              {email.from.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium">{email.from.name}</div>
              <div className="text-sm text-muted-foreground">{email.from.email}</div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {format(email.date, "MMM d, yyyy 'at' h:mm a")}
          </div>
        </div>

        {/* Body */}
        <div className="prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground bg-transparent p-0 m-0">
            {email.body}
          </pre>
        </div>

        {/* Quick Actions for proposals */}
        {email.type === "proposal" && !isInTrash && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 pt-6 border-t border-border"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
              Quick Actions
            </p>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-foreground text-background rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors">
                Reply with Interest
              </button>
              <button className="px-4 py-2 bg-secondary text-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors">
                Schedule Meeting
              </button>
              <button className="px-4 py-2 bg-secondary text-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors">
                Mark as Not Interested
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
