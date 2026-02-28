import { useState } from "react";
import { X, Minus, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ComposeModal({ isOpen, onClose }: ComposeModalProps) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);

  const handleSend = () => {
    // TODO: Implement send functionality
    console.log("Sending email:", { to, subject, body });
    onClose();
    setTo("");
    setSubject("");
    setBody("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ 
            opacity: 1, 
            y: isMinimized ? "calc(100vh - 48px)" : 0, 
            scale: 1 
          }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-4 right-4 w-[560px] bg-background border border-border rounded-lg shadow-2xl z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-secondary/50 border-b border-border">
            <span className="text-sm font-medium">New Message</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-secondary rounded transition-colors text-muted-foreground hover:text-foreground"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                className="p-1 hover:bg-secondary rounded transition-colors text-muted-foreground hover:text-foreground"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1 hover:bg-secondary rounded transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Form */}
              <div className="p-4 space-y-3">
                <div className="flex items-center border-b border-border pb-3">
                  <label className="text-sm text-muted-foreground w-16">To</label>
                  <input
                    type="email"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="flex-1 bg-transparent text-sm focus:outline-none"
                    placeholder="recipient@email.com"
                  />
                </div>
                <div className="flex items-center border-b border-border pb-3">
                  <label className="text-sm text-muted-foreground w-16">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="flex-1 bg-transparent text-sm focus:outline-none"
                    placeholder="Subject"
                  />
                </div>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full h-64 bg-transparent text-sm focus:outline-none resize-none"
                  placeholder="Compose your email..."
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <button
                  onClick={handleSend}
                  className="px-4 py-2 bg-foreground text-background rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors"
                >
                  Send
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-muted-foreground hover:text-foreground text-sm transition-colors"
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
