import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <FileQuestion className="size-6" />
      </span>
      <div className="space-y-1.5">
        <h1 className="text-lg font-semibold">Page not found</h1>
        <p className="text-sm text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist or was moved.</p>
      </div>
      <Button render={<Link href="/dashboard">Back to dashboard</Link>} />
    </div>
  );
}
