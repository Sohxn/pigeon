export type EmailType = "proposal" | "follow-up" | "inquiry" | "invoice" | "personal" | "newsletter" | "notification";

export type UrgencyLevel = "overdue" | "urgent" | "normal" | "low";

export interface EmailAccount {
  id: string;
  user_id: string;
  email_address: string;
  display_name: string | null;
  provider: 'gmail' | 'outlook' | 'yahoo' | 'imap';
  is_primary: boolean;
  is_connected: boolean;
  last_sync: string | null;
  created_at: string;
}

export interface Email {
  id: string;
  user_id: string;
  account_id: string;  // Which email account this belongs to
  gmail_id: string;
  thread_id: string;
  subject: string;
  from_email: string;
  from_name: string | null;
  to_email: string[];
  body_text: string;
  body_html: string | null;
  snippet: string | null;
  received_at: string;
  labels: string[];
  is_read: boolean;
  is_starred: boolean;
  is_archived: boolean;
  is_trashed: boolean;
  created_at: string;
  
  // Joined data
  account?: EmailAccount;  // Which account this email came from
}

export interface EmailFolder {
  id: string;
  name: string;
  icon: string;
  count?: number;
}
