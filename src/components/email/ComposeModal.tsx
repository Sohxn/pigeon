import { useState, useEffect, useRef } from "react";
import { X, Minus, Maximize2, Send, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as api from "@/services/apiClient";
import { toast } from "sonner";

export interface ComposeInitData {
  to?: string;
  subject?: string;
  body?: string;
}

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initData?: ComposeInitData;
}

export function ComposeModal({ isOpen, onClose, initData }: ComposeModalProps) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const toRef   = useRef<HTMLInputElement | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTo(initData?.to ?? "");
      setSubject(initData?.subject ?? "");
      setBody(initData?.body ?? "");
      setError(null);
      setIsMinimized(false);
      setSending(false);
      setTimeout(() => {
        if (initData?.to) bodyRef.current?.focus();
        else toRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initData]);

  const reset = () => { setTo(""); setSubject(""); setBody(""); setError(null); setSending(false); };
  const handleClose = () => { reset(); onClose(); };

  const validate = (): string | null => {
    if (!to.trim()) return "Recipient address is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to.trim())) return "Enter a valid email address.";
    if (!subject.trim()) return "Subject cannot be empty.";
    if (!body.trim()) return "Message body cannot be empty.";
    return null;
  };

  const handleSend = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    try {
      setSending(true);
      setError(null);
      await api.sendEmail(to.trim(), subject.trim(), body.trim());
      toast.success("Email sent!");
      handleClose();
    } catch (e: any) {
      setError(e.message ?? "Failed to send. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── MOBILE: full-screen overlay ── */}
          <motion.div
            key="mobile-compose"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="md:hidden fixed inset-0 z-50 bg-background flex flex-col"
            onKeyDown={handleKeyDown}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
              <button onClick={handleClose} className="p-1 hover:bg-secondary rounded transition-colors text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium">{initData?.to ? "Reply" : "New Message"}</span>
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background rounded-md text-sm font-medium hover:bg-foreground/90 disabled:opacity-60"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send
              </button>
            </div>

            {/* Form */}
            <div className="flex flex-col flex-1 min-h-0 px-4 pt-2">
              <div className="flex items-center border-b border-border py-3">
                <label className="text-sm text-muted-foreground w-16 shrink-0">To</label>
                <input
                  ref={toRef}
                  type="email"
                  value={to}
                  onChange={e => { setTo(e.target.value); setError(null); }}
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                  placeholder="recipient@example.com"
                  disabled={sending}
                />
              </div>
              <div className="flex items-center border-b border-border py-3">
                <label className="text-sm text-muted-foreground w-16 shrink-0">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => { setSubject(e.target.value); setError(null); }}
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                  placeholder="Subject"
                  disabled={sending}
                />
              </div>
              <textarea
                ref={bodyRef}
                value={body}
                onChange={e => { setBody(e.target.value); setError(null); }}
                className="flex-1 w-full bg-transparent text-sm focus:outline-none resize-none pt-3 pb-2"
                placeholder="Compose your message…"
                disabled={sending}
              />
              {error && (
                <div className="flex items-center gap-2 pb-2 text-xs text-red-600 dark:text-red-400 shrink-0">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* ── DESKTOP: floating card (bottom-right) ── */}
          <motion.div
            key="desktop-compose"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: isMinimized ? "calc(100vh - 48px)" : 0,
              scale: 1,
            }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="hidden md:flex md:flex-col fixed bottom-4 right-4 w-[560px] h-[520px] bg-background border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
            onKeyDown={handleKeyDown}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/50 border-b border-border flex-shrink-0">
              <span className="text-sm font-medium">{initData?.to ? "Reply" : "New Message"}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setIsMinimized(m => !m)} className="p-1 hover:bg-secondary rounded transition-colors text-muted-foreground hover:text-foreground" title={isMinimized ? "Restore" : "Minimise"}>
                  <Minus className="w-4 h-4" />
                </button>
                <button className="p-1 hover:bg-secondary rounded transition-colors text-muted-foreground hover:text-foreground" title="Expand (coming soon)">
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button onClick={handleClose} className="p-1 hover:bg-secondary rounded transition-colors text-muted-foreground hover:text-foreground" title="Close">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <div className="flex flex-col flex-1 min-h-0 px-4 pt-4">
                <div className="flex items-center border-b border-border pb-3 mb-3 shrink-0">
                  <label className="text-sm text-muted-foreground w-16 shrink-0">To</label>
                  <input
                    ref={toRef}
                    type="email"
                    value={to}
                    onChange={e => { setTo(e.target.value); setError(null); }}
                    className="flex-1 bg-transparent text-sm focus:outline-none"
                    placeholder="recipient@example.com"
                    disabled={sending}
                  />
                </div>
                <div className="flex items-center border-b border-border pb-3 mb-3 shrink-0">
                  <label className="text-sm text-muted-foreground w-16 shrink-0">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => { setSubject(e.target.value); setError(null); }}
                    className="flex-1 bg-transparent text-sm focus:outline-none"
                    placeholder="Subject"
                    disabled={sending}
                  />
                </div>
                <textarea
                  ref={bodyRef}
                  value={body}
                  onChange={e => { setBody(e.target.value); setError(null); }}
                  className="flex-1 w-full bg-transparent text-sm focus:outline-none resize-none pb-2"
                  placeholder="Compose your message… (Ctrl+Enter to send)"
                  disabled={sending}
                />
                {error && (
                  <div className="flex items-center gap-2 pb-2 text-xs text-red-600 dark:text-red-400 shrink-0">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex items-center justify-between py-3 border-t border-border shrink-0">
                  <button
                    onClick={handleSend}
                    disabled={sending}
                    className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {sending ? <><Loader2 className="w-4 h-4 animate-spin" />Sending…</> : <><Send className="w-4 h-4" />Send</>}
                  </button>
                  <button onClick={handleClose} disabled={sending} className="px-4 py-2 text-muted-foreground hover:text-foreground text-sm transition-colors disabled:opacity-50">
                    Discard
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}