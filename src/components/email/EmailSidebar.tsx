import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import {
  Inbox, Star, Send, FileText, Archive, Trash2,
  PenSquare, ExternalLink, Settings, Mail, ChevronRight, X,
} from "lucide-react";

interface FolderCount {
  inbox: number; starred: number; sent: number;
  drafts: number; archive: number; trash: number;
}
interface EmailAccount {
  id: string; email_address: string; provider: string; is_primary: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  inbox: Inbox, starred: Star, sent: Send,
  drafts: FileText, archive: Archive, trash: Trash2,
};
const folderConfig = [
  { id: "inbox",   name: "Inbox",   icon: "inbox"   },
  { id: "starred", name: "Starred", icon: "starred" },
  { id: "sent",    name: "Sent",    icon: "sent"    },
  { id: "drafts",  name: "Drafts",  icon: "drafts"  },
  { id: "archive", name: "Archive", icon: "archive" },
  { id: "trash",   name: "Trash",   icon: "trash"   },
];

interface EmailSidebarProps {
  activeFolder: string;
  onFolderChange: (id: string) => void;
  onCompose: () => void;
  onOpenSettings: () => void;
  folderCounts: FolderCount;
  accounts: EmailAccount[];
  selectedAccountId: string | null;
  onAccountChange: (id: string | null) => void;
  /** optional — called when mobile X button is tapped */
  onClose?: () => void;
}

export default function EmailSidebar({
  activeFolder, onFolderChange, onCompose, onOpenSettings,
  folderCounts, accounts, selectedAccountId, onAccountChange, onClose,
}: EmailSidebarProps) {
  const navigate = useNavigate();

  return (
    <aside className="w-full md:w-56 flex flex-col bg-transparent h-full">

      {/* Logo row */}
      <div className="h-14 rounded-2xl m-2 flex items-center justify-between px-4 flex-shrink-0">
        <span
          className="font-semibold tracking-tight text-[5vh] text-white"
          style={{ fontFamily: "'Magnolia Script', cursive" }}
        >
          Feathermail
        </span>
        {/* Close button — mobile only */}
        {onClose && (
          <button onClick={onClose} className="md:hidden p-1 hover:bg-secondary rounded-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Account Selector */}
      <div className="p-3 flex-shrink-0">
        <div className="text-xs font-medium text-muted-foreground mb-2 px-1">ACCOUNTS</div>

        <button
          onClick={() => onAccountChange(null)}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors mb-1 glass",
            selectedAccountId === null
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">All Accounts</span>
          </div>
          {selectedAccountId === null && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
        </button>

        {accounts.map(account => (
          <button
            key={account.id}
            onClick={() => onAccountChange(account.id)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors mb-1",
              selectedAccountId === account.id
                ? "bg-secondary text-foreground"
                : "text-muted-foreground"
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-4 h-4 rounded-full glass flex items-center justify-center flex-shrink-0 p-2">
                <span className="text-[8px] font-bold">{account.email_address[0].toUpperCase()}</span>
              </div>
              <span className="truncate text-xs">{account.email_address}</span>
            </div>
            {selectedAccountId === account.id && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
          </button>
        ))}
      </div>

      {/* Compose */}
      <div className="p-3 flex-shrink-0">
        <button
          onClick={onCompose}
          className="w-full flex items-center gap-2 px-3 py-2 text-background rounded-xl text-sm font-medium hover:bg-foreground/90 transition-colors glass"
        >
          <PenSquare className="w-4 h-4" />
          Compose
        </button>
      </div>

      {/* Folders */}
      <nav className="flex-1 px-2 py-1 overflow-y-auto">
        {folderConfig.map(folder => {
          const Icon = iconMap[folder.icon];
          const isActive = activeFolder === folder.id;
          const count = folderCounts[folder.id as keyof FolderCount];
          return (
            <button
              key={folder.id}
              onClick={() => onFolderChange(folder.id)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 text-sm transition-colors",
                isActive
                  ? "glass rounded-xl text-foreground"
                  : "text-muted-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                {Icon && <Icon className="w-4 h-4" />}
                <span>{folder.name}</span>
              </div>
              {count > 0 && (
                <span className={cn("text-xs tabular-nums", isActive ? "text-foreground" : "text-muted-foreground")}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Settings & Dashboard */}
      <div className="px-3 pb-4 space-y-1 flex-shrink-0">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/50 rounded-md transition-colors"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/50 rounded-md transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Manage Accounts
        </button>
      </div>
    </aside>
  );
}