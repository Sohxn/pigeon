import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import {
  Inbox,
  Star,
  Send,
  FileText,
  Archive,
  Trash2,
  PenSquare,
  Command,
  ExternalLink,
  Settings,
  Mail,
  ChevronRight,
} from "lucide-react";

interface FolderCount {
  inbox: number;
  starred: number;
  sent: number;
  drafts: number;
  archive: number;
  trash: number;
}

interface EmailAccount {
  id: string;
  email_address: string;
  provider: string;
  is_primary: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  inbox: Inbox,
  starred: Star,
  sent: Send,
  drafts: FileText,
  archive: Archive,
  trash: Trash2,
};

const folderConfig = [
  { id: "inbox", name: "Inbox", icon: "inbox" },
  { id: "starred", name: "Starred", icon: "starred" },
  { id: "sent", name: "Sent", icon: "sent" },
  { id: "drafts", name: "Drafts", icon: "drafts" },
  { id: "archive", name: "Archive", icon: "archive" },
  { id: "trash", name: "Trash", icon: "trash" },
];

interface EmailSidebarProps {
  activeFolder: string;
  onFolderChange: (folderId: string) => void;
  onCompose: () => void;
  onOpenSettings: () => void;
  folderCounts: FolderCount;
  accounts: EmailAccount[];
  selectedAccountId: string | null;
  onAccountChange: (accountId: string | null) => void;
}

export default function EmailSidebar({ 
  activeFolder, 
  onFolderChange, 
  onCompose, 
  onOpenSettings, 
  folderCounts,
  accounts,
  selectedAccountId,
  onAccountChange
}: EmailSidebarProps) {
  const navigate = useNavigate();

  return (
    <aside className="w-56 border-r border-border flex flex-col bg-background">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-foreground rounded-md flex items-center justify-center">
            <Command className="w-4 h-4 text-background" />
          </div>
          <span className="font-semibold tracking-tight" style={{ fontFamily: "'Magnolia Script', cursive" }}>Feathermail</span>
        </div>
      </div>

      {/* Account Selector */}
      <div className="border-b border-border p-3">
        <div className="text-xs font-medium text-muted-foreground mb-2 px-1">ACCOUNTS</div>
        
        {/* All Accounts */}
        <button
          onClick={() => onAccountChange(null)}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors mb-1",
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

        {/* Individual Accounts */}
        {accounts.map((account) => (
          <button
            key={account.id}
            onClick={() => onAccountChange(account.id)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors mb-1",
              selectedAccountId === account.id
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-4 h-4 rounded-full bg-foreground/20 flex items-center justify-center flex-shrink-0">
                <span className="text-[8px] font-bold">
                  {account.email_address[0].toUpperCase()}
                </span>
              </div>
              <span className="truncate text-xs">{account.email_address}</span>
            </div>
            {selectedAccountId === account.id && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
          </button>
        ))}
      </div>

      {/* Compose Button */}
      <div className="p-3">
        <button 
          onClick={onCompose}
          className="w-full flex items-center gap-2 px-3 py-2 bg-foreground text-background rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors"
        >
          <PenSquare className="w-4 h-4" />
          Compose
        </button>
      </div>

      {/* Folders */}
      <nav className="flex-1 px-2 py-1">
        {folderConfig.map((folder) => {
          const Icon = iconMap[folder.icon];
          const isActive = activeFolder === folder.id;
          const count = folderCounts[folder.id as keyof FolderCount];

          return (
            <button
              key={folder.id}
              onClick={() => onFolderChange(folder.id)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                {Icon && <Icon className="w-4 h-4" />}
                <span>{folder.name}</span>
              </div>
              {count > 0 && (
                <span className={cn(
                  "text-xs tabular-nums",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Settings & Dashboard */}
      <div className="px-3 pb-2 space-y-1">
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