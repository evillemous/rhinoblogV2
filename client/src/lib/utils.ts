import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getRandomAvatar(username: string): string {
  const seed = username.toLowerCase().trim();
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

export function getTagColor(tag: string): string {
  // Generate predictable color based on tag name
  const tagColors = {
    closedrhinoplasty: "blue",
    openrhinoplasty: "indigo",
    recovery: "green",
    day1: "red",
    beforeafter: "yellow",
    revision: "red",
    guide: "blue",
    tipplasty: "gray",
    ethnicrhinoplasty: "pink",
    surgeonadvice: "blue",
    castremoval: "orange",
    "1month": "purple",
  };
  
  // Match tag name without hashtag, case insensitive
  const normalizedTag = tag.replace(/^#/, "").toLowerCase();
  return tagColors[normalizedTag as keyof typeof tagColors] || "gray";
}

export function getRelativeTimeString(date: Date | string | number): string {
  const now = new Date();
  const targetDate = new Date(date);
  const diffMs = now.getTime() - targetDate.getTime();
  
  // Convert to seconds, minutes, hours, days
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);
  
  if (diffSec < 60) {
    return "just now";
  } else if (diffMin < 60) {
    return `${diffMin}m ago`;
  } else if (diffHr < 24) {
    return `${diffHr}h ago`;
  } else if (diffDays < 30) {
    return `${diffDays}d ago`;
  } else {
    // Format date for older posts
    return targetDate.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      year: targetDate.getFullYear() !== now.getFullYear() ? "numeric" : undefined
    });
  }
}
