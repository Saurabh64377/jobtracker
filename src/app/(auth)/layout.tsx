import Link from "next/link";
import { Briefcase } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-muted/30 px-4 py-12">
      <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Briefcase className="size-4.5" />
        </span>
        JobTrack
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
