import { useState, useEffect, useRef } from "react";
import { X, Minus, Maximize2, Send, Loader2, AlertCircle} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as api from "@/services/apiClient";
import { toast } from "sonner";

// for drafting(composing) mails
export interface ComposeInitData {
  to?: string;
  subject?: string;
  body?: string;
}

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  // pre fill the fields for 1. reply 2. forward
  initData?: ComposeInitData;
}

// function to handle 
export function ComposeModal({ isOpen, onClose, initData }: ComposeModalProps) {
  // drafting elements
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ui
  const [isMinimized, setIsMinimized] = useState(false);
  
  // auto focus proper fields on opening compose
  //initial value will be null
  const toRef = useRef<HTMLInputElement | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);


  // populate the fields from "initData"
  useEffect(() => {
    if(isOpen){
      setTo(initData?.to ?? "");
      setSubject(initData?.subject ?? "");
      setBody(initData?.body ?? "");  
      setError(null);
      setIsMinimized(false);
      setSending(false);


      setTimeout(() => {
        if(initData?.to){
          bodyRef.current?.focus();
        } else {
          toRef.current?.focus();
        }

      }, 50);
    }
  }, [isOpen, initData]);

  // to reset the content of the fields
  const reset = () => {
    setTo("");
    setSubject("");
    setBody("");  
    setError(null);
    setSending(false);
  };

  // to close the composition pane
  const handleClose = () => {
    reset();
    onClose();
  };

  // some validation logic i found on the internet
  const validate = (): string | null => {
    if (!to.trim()) return "Recipient address is required.";
    // simple RFC-ish check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to.trim())) return "Enter a valid email address.";
    if (!subject.trim()) return "Subject cannot be empty.";
    if (!body.trim()) return "Message body cannot be empty.";
    return null;
  };

// --------------------------------------------------------

  // finally send 
  const handleSend = async () => {
    // handle validation error
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    // ship this today
    // test the error handling here
     try {
      setSending(true);
      setError(null);
      await api.sendEmail(to.trim(), subject.trim(), body.trim());
      toast.success("Email sent!");
      handleClose();
    } catch (err: any) {
      console.error("Send error:", err);
      setError(err.message ?? "Failed to send email. Please try again.");
    } finally {
      setSending(false);
    }
  };


  // KEYDOWN: CTRL/CMD + ENTER  = SEND
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
  };

};


  // FRONTEND
  return (
   <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{
            opacity: 1,
            y: isMinimized ? "calc(100vh - 48px)" : 0,
            scale: 1,
          }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-4 right-4 w-[560px] bg-background border border-border rounded-lg shadow-2xl z-50 overflow-hidden"
          onKeyDown={handleKeyDown}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-4 py-3 bg-secondary/50 border-b border-border">
            <span className="text-sm font-medium">
              {initData?.to ? "Reply" : "New Message"}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized((m) => !m)}
                className="p-1 hover:bg-secondary rounded transition-colors text-muted-foreground hover:text-foreground"
                title={isMinimized ? "Restore" : "Minimise"}
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                className="p-1 hover:bg-secondary rounded transition-colors text-muted-foreground hover:text-foreground"
                title="Expand (coming soon)"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-secondary rounded transition-colors text-muted-foreground hover:text-foreground"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
 
          {!isMinimized && (
            <>
              {/* ── Form ── */}
              <div className="p-4 space-y-0">
                {/* To */}
                <div className="flex items-center border-b border-border pb-3 mb-3">
                  <label className="text-sm text-muted-foreground w-16 shrink-0">To</label>
                  <input
                    ref={toRef}
                    type="email"
                    value={to}
                    onChange={(e) => { setTo(e.target.value); setError(null); }}
                    className="flex-1 bg-transparent text-sm focus:outline-none"
                    placeholder="recipient@example.com"
                    disabled={sending}
                  />
                </div>
 
                {/* Subject */}
                <div className="flex items-center border-b border-border pb-3 mb-3">
                  <label className="text-sm text-muted-foreground w-16 shrink-0">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => { setSubject(e.target.value); setError(null); }}
                    className="flex-1 bg-transparent text-sm focus:outline-none"
                    placeholder="Subject"
                    disabled={sending}
                  />
                </div>
 
                {/* Body */}
                <textarea
                  ref={bodyRef}
                  value={body}
                  onChange={(e) => { setBody(e.target.value); setError(null); }}
                  className="w-full h-56 bg-transparent text-sm focus:outline-none resize-none"
                  placeholder="Compose your message… (Ctrl+Enter to send)"
                  disabled={sending}
                />
 
                {/* Inline error */}
                {error && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-red-600 dark:text-red-400">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
 
              {/* ── Footer ── */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <button
                  onClick={handleSend}
                  disabled={sending}
                  className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send
                    </>
                  )}
                </button>
 
                <button
                  onClick={handleClose}
                  disabled={sending}
                  className="px-4 py-2 text-muted-foreground hover:text-foreground text-sm transition-colors disabled:opacity-50"
                >
                  Discard
                </button>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
    );
  }

