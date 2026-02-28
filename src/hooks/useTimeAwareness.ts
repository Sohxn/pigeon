import { useState, useEffect } from "react";
import { Email, UrgencyLevel } from "@/types/email";
import { differenceInHours, differenceInMinutes, isPast } from "date-fns";

// How long since the last activity on this email
export function getSilenceDuration(email: Email): string {
  const lastActive = email.lastActivity || email.date;
  const now = new Date();
  const hours = differenceInHours(now, lastActive);
  const minutes = differenceInMinutes(now, lastActive);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1d ago";
  return `${days}d ago`;
}

// Compute urgency based on deadline and silence
export function getUrgency(email: Email): UrgencyLevel {
  if (email.deadline && isPast(email.deadline)) return "overdue";
  if (email.deadline) {
    const hoursLeft = differenceInHours(email.deadline, new Date());
    if (hoursLeft <= 48) return "urgent";
  }
  // If no reply in 3+ days on unread important emails
  const lastActive = email.lastActivity || email.date;
  const silenceHours = differenceInHours(new Date(), lastActive);
  if (!email.read && silenceHours > 72) return "urgent";
  if (silenceHours > 168) return "low"; // 7+ days, fading
  return "normal";
}

// Urgency score for sorting (lower = more urgent)
export function getUrgencyScore(email: Email): number {
  const urgency = getUrgency(email);
  const base: Record<UrgencyLevel, number> = { overdue: 0, urgent: 1, normal: 2, low: 3 };
  // Within same urgency, sort by date (newer first)
  return base[urgency] * 1e13 - email.date.getTime();
}

// Sort emails by urgency then recency
export function sortByUrgency(emails: Email[]): Email[] {
  return [...emails].sort((a, b) => getUrgencyScore(a) - getUrgencyScore(b));
}

// Hook that re-ticks every minute so durations stay fresh
export function useTimeTick(intervalMs = 60000) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return tick;
}
