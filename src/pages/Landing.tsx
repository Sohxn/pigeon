import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between p-6 max-w-6xl mx-auto">
        <h1 className="text-xl font-bold">MailApp</h1>
        <div className="flex gap-3">

          {/* login route */}
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 text-sm border border-border rounded-md hover:bg-secondary transition-colors">
            Log in
          </button>

          {/* signup route */}
          <button
            onClick={() => navigate("/signup")}
            className="px-4 py-2 text-sm bg-foreground text-background rounded-md hover:opacity-90 transition-colors">
            Sign up
          </button>


        </div>
      </header>

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold mb-4">
          Email, simplified.
        </h2>
        <p className="text-muted-foreground text-lg mb-12 max-w-xl mx-auto">
          A clean, fast email client that helps you focus on what matters.
        </p>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {/* Free Plan */}
          <div className="border border-border rounded-lg p-6 text-left hover:border-foreground/50 transition-colors">
            <h3 className="font-semibold mb-2">Free</h3>
            <p className="text-2xl font-bold mb-4">$0<span className="text-sm text-muted-foreground font-normal">/mo</span></p>
            <ul className="text-sm text-muted-foreground space-y-2 mb-6">
              <li>• 1 email account</li>
              <li>• 1GB storage</li>
              <li>• Basic features</li>
            </ul>
            <button
              onClick={() => navigate("/Signup")}
              className="w-full py-2 text-sm border border-border rounded-md hover:bg-secondary transition-colors"
            >
              Get started
            </button>
          </div>

          {/* Pro Plan */}
          <div className="border-2 border-foreground rounded-lg p-6 text-left relative">
            <span className="absolute -top-3 left-4 bg-foreground text-background text-xs px-2 py-1 rounded">
              Popular
            </span>
            <h3 className="font-semibold mb-2">Pro</h3>
            <p className="text-2xl font-bold mb-4">$9<span className="text-sm text-muted-foreground font-normal">/mo</span></p>
            <ul className="text-sm text-muted-foreground space-y-2 mb-6">
              <li>• 5 email accounts</li>
              <li>• 15GB storage</li>
              <li>• AI summaries</li>
            </ul>
            <button
              onClick={() => navigate("/Signup")}
              className="w-full py-2 text-sm bg-foreground text-background rounded-md hover:opacity-90 transition-colors"
            >
              Get started
            </button>
          </div>

          {/* Team Plan */}
          <div className="border border-border rounded-lg p-6 text-left hover:border-foreground/50 transition-colors">
            <h3 className="font-semibold mb-2">Team</h3>
            <p className="text-2xl font-bold mb-4">$29<span className="text-sm text-muted-foreground font-normal">/mo</span></p>
            <ul className="text-sm text-muted-foreground space-y-2 mb-6">
              <li>• Unlimited accounts</li>
              <li>• 100GB storage</li>
              <li>• Priority support</li>
            </ul>
            <button
              onClick={() => navigate("/Signup")}
              className="w-full py-2 text-sm border border-border rounded-md hover:bg-secondary transition-colors"
            >
              Contact us
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-sm text-muted-foreground py-12">
        © 2026 PigeonMailApp. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;
