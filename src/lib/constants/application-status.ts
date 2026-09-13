import type { ApplicationStatus } from "@prisma/client";

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "WISHLIST",
  "APPLIED",
  "APPLICATION_VIEWED",
  "RECRUITER_CONTACTED",
  "RECRUITER_RESPONDED",
  "HR_SCHEDULED",
  "HR_COMPLETED",
  "TECHNICAL_SCHEDULED",
  "TECHNICAL_COMPLETED",
  "MANAGERIAL_ROUND",
  "FINAL_ROUND",
  "OFFER",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
];

export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  WISHLIST: "Wishlist",
  APPLIED: "Applied",
  APPLICATION_VIEWED: "Application Viewed",
  RECRUITER_CONTACTED: "Recruiter Contacted",
  RECRUITER_RESPONDED: "Recruiter Responded",
  HR_SCHEDULED: "HR Scheduled",
  HR_COMPLETED: "HR Completed",
  TECHNICAL_SCHEDULED: "Technical Scheduled",
  TECHNICAL_COMPLETED: "Technical Completed",
  MANAGERIAL_ROUND: "Managerial Round",
  FINAL_ROUND: "Final Round",
  OFFER: "Offer",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export const APPLICATION_STATUS_COLOR: Record<ApplicationStatus, string> = {
  WISHLIST: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  APPLIED: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  APPLICATION_VIEWED: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  RECRUITER_CONTACTED: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  RECRUITER_RESPONDED: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  HR_SCHEDULED: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  HR_COMPLETED: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",
  TECHNICAL_SCHEDULED: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  TECHNICAL_COMPLETED: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  MANAGERIAL_ROUND: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  FINAL_ROUND: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  OFFER: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  ACCEPTED: "bg-green-500/10 text-green-600 dark:text-green-400",
  REJECTED: "bg-red-500/10 text-red-600 dark:text-red-400",
  WITHDRAWN: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
};

export const JOB_SOURCE_LABEL: Record<string, string> = {
  LINKEDIN: "LinkedIn",
  NAUKRI: "Naukri",
  INDEED: "Indeed",
  COMPANY_WEBSITE: "Company Website",
  REFERRAL: "Referral",
  RECRUITER: "Recruiter",
  WHATSAPP: "WhatsApp",
  INSTAGRAM: "Instagram",
  EMAIL: "Email",
  OTHER: "Other",
};

export const PRIORITY_COLOR: Record<string, string> = {
  LOW: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  MEDIUM: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  HIGH: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  URGENT: "bg-red-500/10 text-red-600 dark:text-red-400",
};
