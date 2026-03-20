// needed for dev mode
import { Email, EmailFolder } from "@/types/email";

export const folders: EmailFolder[] = [
  { id: "inbox", name: "Inbox", icon: "inbox", count: 12 },
  { id: "starred", name: "Starred", icon: "star" },
  { id: "sent", name: "Sent", icon: "send" },
  { id: "drafts", name: "Drafts", icon: "file-text", count: 2 },
  { id: "archive", name: "Archive", icon: "archive" },
  { id: "trash", name: "Trash", icon: "trash-2" },
];

export const mockEmails: Email[] = [
  {
    id: "1",
    from: { name: "Alex Chen", email: "alex@startup.io" },
    to: { name: "You", email: "you@company.com" },
    subject: "Partnership Opportunity - Q1 2026",
    preview: "Hi, I came across your product and I think there's a great opportunity for us to collaborate...",
    body: `Hi,

I came across your product and I think there's a great opportunity for us to collaborate on the upcoming launch.

We're currently looking for partners who can help us scale our distribution, and your platform seems like a perfect fit.

Would you be open to a 15-minute call this week to discuss?

Best,
Alex Chen
CEO, Startup.io`,
    date: new Date("2026-01-10T09:30:00"),
    read: false,
    starred: true,
    archived: false,
    trashed: false,
    folder: "inbox",
    type: "proposal",
    amount: 25000,
    deadline: new Date("2026-01-20"),
    lastActivity: new Date("2026-01-10T09:30:00"),
    summary: "Partnership proposal from Startup.io CEO for Q1 2026 collaboration. Requesting a call.",
  },
  {
    id: "2",
    from: { name: "GitHub", email: "noreply@github.com" },
    to: { name: "You", email: "you@company.com" },
    subject: "[react-email] New pull request #423",
    preview: "dependabot opened a pull request in react-email/react-email...",
    body: `dependabot opened a pull request in react-email/react-email

#423 Bump @types/node from 20.11.0 to 20.11.5

You can review this pull request at:
https://github.com/react-email/react-email/pull/423

—
GitHub`,
    date: new Date("2026-01-10T08:15:00"),
    read: true,
    starred: false,
    archived: false,
    trashed: false,
    folder: "inbox",
    type: "notification",
    lastActivity: new Date("2026-01-10T08:15:00"),
    summary: "Dependabot PR for @types/node version bump.",
  },
  {
    id: "3",
    from: { name: "Sarah Miller", email: "sarah.miller@enterprise.com" },
    to: { name: "You", email: "you@company.com" },
    subject: "RE: Contract Review - Urgent",
    preview: "Thanks for sending over the updated terms. I've reviewed them with our legal team and we have a few concerns...",
    body: `Thanks for sending over the updated terms.

I've reviewed them with our legal team and we have a few concerns about Section 4.2 regarding data handling.

Could we schedule a call to discuss before Friday? This is blocking our procurement process.

Thanks,
Sarah Miller
VP of Operations, Enterprise Corp`,
    date: new Date("2026-01-10T07:45:00"),
    read: false,
    starred: true,
    archived: false,
    trashed: false,
    folder: "inbox",
    type: "follow-up",
    deadline: new Date("2026-01-12"),
    lastActivity: new Date("2026-01-10T07:45:00"),
    summary: "Legal concerns about Section 4.2. Urgent call requested before Friday.",
  },
  {
    id: "4",
    from: { name: "The Pragmatic Engineer", email: "gergely@pragmaticengineer.com" },
    to: { name: "You", email: "you@company.com" },
    subject: "Issue #203: The State of AI in 2026",
    preview: "This week we dive deep into how AI is reshaping engineering teams across the industry...",
    body: `The Pragmatic Engineer Newsletter
Issue #203

The State of AI in 2026

This week we dive deep into how AI is reshaping engineering teams across the industry. From code assistants to autonomous agents, the landscape has evolved dramatically.

Key takeaways:
• 78% of developers now use AI tools daily
• Code review automation is becoming mainstream
• The rise of "AI-native" development workflows

Read the full issue →

Best,
Gergely`,
    date: new Date("2026-01-09T16:00:00"),
    read: true,
    starred: false,
    archived: false,
    trashed: false,
    folder: "inbox",
    type: "newsletter",
    lastActivity: new Date("2026-01-09T16:00:00"),
    summary: "Newsletter about AI adoption in engineering. 78% of developers use AI tools daily.",
  },
  {
    id: "5",
    from: { name: "Mom", email: "mom@family.com" },
    to: { name: "You", email: "you@company.com" },
    subject: "Sunday dinner?",
    preview: "Hey sweetheart, are you free this Sunday? Your dad wants to try that new Italian place...",
    body: `Hey sweetheart,

Are you free this Sunday? Your dad wants to try that new Italian place downtown.

Let me know by Friday so I can make a reservation.

Love,
Mom`,
    date: new Date("2026-01-09T14:22:00"),
    read: true,
    starred: false,
    archived: false,
    trashed: false,
    folder: "inbox",
    type: "personal",
    deadline: new Date("2026-01-12"),
    lastActivity: new Date("2026-01-09T14:22:00"),
    summary: "Sunday dinner invitation at new Italian restaurant.",
  },
  {
    id: "6",
    from: { name: "Marcus Johnson", email: "marcus@vcfund.com" },
    to: { name: "You", email: "you@company.com" },
    subject: "Investment Discussion - Series A",
    preview: "Our team has been following your progress and we're impressed with your growth metrics...",
    body: `Hi,

Our team has been following your progress and we're impressed with your growth metrics from the past quarter.

We'd love to learn more about your roadmap and discuss potential Series A involvement.

Are you available for a call next week?

Marcus Johnson
Partner, VC Fund`,
    date: new Date("2026-01-09T11:30:00"),
    read: false,
    starred: true,
    archived: false,
    trashed: false,
    folder: "inbox",
    type: "proposal",
    amount: 500000,
    deadline: new Date("2026-01-25"),
    lastActivity: new Date("2026-01-09T11:30:00"),
    summary: "Series A investment interest from VC Fund. Requesting roadmap discussion.",
  },
  {
    id: "7",
    from: { name: "Stripe", email: "notifications@stripe.com" },
    to: { name: "You", email: "you@company.com" },
    subject: "Your January invoice is ready",
    preview: "Your invoice for January 2026 is now available. Total amount: $2,847.00...",
    body: `Stripe

Your January invoice is ready

Invoice #INV-2026-0110
Total: $2,847.00

View and download your invoice in the Dashboard.

— The Stripe Team`,
    date: new Date("2026-01-09T09:00:00"),
    read: true,
    starred: false,
    archived: false,
    trashed: false,
    folder: "inbox",
    type: "invoice",
    amount: 2847,
    lastActivity: new Date("2026-01-09T09:00:00"),
    summary: "January invoice ready. Total: $2,847.00",
  },
  {
    id: "8",
    from: { name: "You", email: "you@company.com" },
    to: { name: "Client", email: "client@bigcorp.com" },
    subject: "Proposal: SwiftMail Enterprise",
    preview: "Hi, please find attached our enterprise proposal as discussed...",
    body: `Hi,

Please find attached our enterprise proposal as discussed on our call last week.

Key highlights:
• Custom domain support
• SSO integration
• Dedicated support team
• 99.99% uptime SLA

Let me know if you have any questions.

Best regards`,
    date: new Date("2026-01-08T15:00:00"),
    read: true,
    starred: false,
    archived: false,
    trashed: false,
    folder: "sent",
    type: "proposal",
    amount: 12000,
    deadline: new Date("2026-01-15"),
    lastActivity: new Date("2026-01-08T15:00:00"),
    summary: "Enterprise proposal sent to BigCorp client.",
  },
];
