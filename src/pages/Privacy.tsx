import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
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

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-foreground leading-relaxed mb-6">
            FeatherMail requests access to Gmail in order to allow users
            to read, send, and organize their email through the application.
          </p>

          <p className="text-lg text-foreground leading-relaxed mb-6">
            FeatherMail does not sell or share user data with third parties.
            Email data is only used to provide core functionality such as
            email categorization, labeling, and summarization.
          </p>

          <p className="text-lg text-foreground leading-relaxed mb-6">
            Users can revoke access at any time through their Google account settings.
          </p>
        </div>

        {/* Footer note */}
        <div className="mt-12 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Last updated: March 2026
          </p>
        </div>
      </main>
    </div>
  );
}