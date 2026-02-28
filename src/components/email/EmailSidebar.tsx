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
} from "lucide-react";
interface FolderCount {
  inbox: number;
  starred: number;
  sent: number;
  drafts: number;
  archive: number;
  trash: number;
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
}

export function EmailSidebar({ activeFolder, onFolderChange, onCompose, onOpenSettings, folderCounts }: EmailSidebarProps) {
  const navigate = useNavigate();

  return (
    <aside className="w-56 border-r border-border flex flex-col bg-background">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-foreground rounded-md flex items-center justify-center">
            <Command className="w-4 h-4 text-background" />
          </div>
          <span className="font-semibold tracking-tight">swiftmail</span>
        </div>
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

      {/* Settings & Landing Page */}
      <div className="px-3 pb-2 space-y-1">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/50 rounded-md transition-colors"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
        <button
          onClick={() => navigate("/landing")}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/50 rounded-md transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          View Landing Page
        </button>
      </div>

      {/* Account Section */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-secondary/50 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-medium">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">John Doe</p>
            <p className="text-xs text-muted-foreground truncate">john@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
