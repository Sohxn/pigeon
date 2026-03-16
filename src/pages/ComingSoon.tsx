import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";

export default function ComingSoon() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </header>

      {/* Content - Centered */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          {/* Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-foreground/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-12 h-12 text-foreground" />
            </div>
            
            <h1 className="text-4xl font-bold mb-3">Coming Soon</h1>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              This feature is currently under development. 
              We're working hard to bring it to you soon!
            </p>
          </div>
          
          {/* Action Button */}
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-foreground text-background rounded-md hover:opacity-90 transition-opacity font-medium"
          >
            Go to Inbox
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            Have feedback? Let us know what features you'd like to see!
          </p>
        </div>
      </footer>
    </div>
  );
}