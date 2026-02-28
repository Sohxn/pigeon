-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Gmail tokens
CREATE TABLE user_gmail_tokens (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expiry TIMESTAMPTZ,
  gmail_email TEXT,
  is_connected BOOLEAN DEFAULT true,
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emails table (simplified - no AI fields)
CREATE TABLE emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  gmail_id TEXT UNIQUE NOT NULL,
  thread_id TEXT NOT NULL,
  
  -- Email metadata
  subject TEXT,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_email TEXT[],
  cc_email TEXT[],
  bcc_email TEXT[],
  reply_to TEXT,
  
  -- Content
  body_text TEXT,
  body_html TEXT,
  snippet TEXT,
  
  -- Timestamps
  received_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  
  -- Gmail labels
  labels TEXT[],
  is_read BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  is_trashed BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_emails_user_id ON emails(user_id);
CREATE INDEX idx_emails_received ON emails(user_id, received_at DESC);
CREATE INDEX idx_emails_gmail_id ON emails(gmail_id);
CREATE INDEX idx_emails_thread_id ON emails(thread_id);
CREATE INDEX idx_emails_labels ON emails USING GIN(labels);

-- Row Level Security (RLS)
ALTER TABLE user_gmail_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_gmail_tokens
CREATE POLICY "Users can view their own tokens"
  ON user_gmail_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens"
  ON user_gmail_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tokens"
  ON user_gmail_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for emails
CREATE POLICY "Users can view their own emails"
  ON emails FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own emails"
  ON emails FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emails"
  ON emails FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emails"
  ON emails FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_user_gmail_tokens_updated_at 
  BEFORE UPDATE ON user_gmail_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emails_updated_at 
  BEFORE UPDATE ON emails
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Database Diagram
```
┌─────────────────────────────────────────────────────────────────────┐
│                          auth.users (Supabase)                      │
│─────────────────────────────────────────────────────────────────────│
│ • id (UUID, PK)                                                     │
│ • email                                                             │
│ • created_at                                                        │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ (one-to-one)
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        user_gmail_tokens                            │
│─────────────────────────────────────────────────────────────────────│
│ • user_id (UUID, PK, FK → auth.users.id)                           │
│ • access_token (TEXT)                                               │
│ • refresh_token (TEXT)                                              │
│ • token_expiry (TIMESTAMPTZ)                                        │
│ • gmail_email (TEXT)                                                │
│ • is_connected (BOOLEAN)                                            │
│ • last_sync (TIMESTAMPTZ)                                           │
│ • created_at (TIMESTAMPTZ)                                          │
│ • updated_at (TIMESTAMPTZ)                                          │
└─────────────────────────────────────────────────────────────────────┘

                        
┌─────────────────────────────────────────────────────────────────────┐
│                          auth.users (Supabase)                      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ (one-to-many)
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                              emails                                 │
│─────────────────────────────────────────────────────────────────────│
│ • id (UUID, PK)                                                     │
│ • user_id (UUID, FK → auth.users.id)                               │
│ • gmail_id (TEXT, UNIQUE) ─────── [Gmail Message ID]               │
│ • thread_id (TEXT) ───────────── [Gmail Thread ID]                 │
│                                                                     │
│ ─── Email Metadata ───                                             │
│ • subject (TEXT)                                                    │
│ • from_email (TEXT)                                                 │
│ • from_name (TEXT)                                                  │
│ • to_email (TEXT[])                                                 │
│ • cc_email (TEXT[])                                                 │
│ • bcc_email (TEXT[])                                                │
│ • reply_to (TEXT)                                                   │
│                                                                     │
│ ─── Content ───                                                     │
│ • body_text (TEXT)                                                  │
│ • body_html (TEXT)                                                  │
│ • snippet (TEXT)                                                    │
│                                                                     │
│ ─── Timestamps ───                                                  │
│ • received_at (TIMESTAMPTZ)                                         │
│ • sent_at (TIMESTAMPTZ)                                             │
│ • created_at (TIMESTAMPTZ)                                          │
│ • updated_at (TIMESTAMPTZ)                                          │
│                                                                     │
│ ─── Gmail Labels/Status ───                                         │
│ • labels (TEXT[]) ────────────── ['INBOX', 'UNREAD', 'STARRED']    │
│ • is_read (BOOLEAN)                                                 │
│ • is_starred (BOOLEAN)                                              │
│ • is_archived (BOOLEAN)                                             │
│ • is_trashed (BOOLEAN)                                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Relationships Explained
```
auth.users (1) ←──→ (1) user_gmail_tokens
  │
  │ One user has ONE set of Gmail tokens
  │
  └──→ (∞) emails
       
       One user has MANY emails
```

---

## Visual Schema Diagram
```
                    ┌──────────────┐
                    │  auth.users  │
                    │──────────────│
                    │ id (PK)      │
                    │ email        │
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
    ┌─────────────────────┐   ┌──────────────────┐
    │ user_gmail_tokens   │   │     emails       │
    │─────────────────────│   │──────────────────│
    │ user_id (PK, FK)    │   │ id (PK)          │
    │ access_token        │   │ user_id (FK)     │
    │ refresh_token       │   │ gmail_id (UNQ)   │
    │ token_expiry        │   │ thread_id        │
    │ gmail_email         │   │ subject          │
    │ is_connected        │   │ from_email       │
    │ last_sync           │   │ from_name        │
    └─────────────────────┘   │ to_email[]       │
                              │ body_text        │
                              │ body_html        │
                              │ snippet          │
                              │ received_at      │
                              │ labels[]         │
                              │ is_read          │
                              │ is_starred       │
                              │ is_archived      │
                              │ is_trashed       │
                              └──────────────────┘