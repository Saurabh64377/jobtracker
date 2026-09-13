import Link from "next/link";
import { ArrowRight, Briefcase, CalendarClock, KanbanSquare, LineChart, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: KanbanSquare,
    title: "One board for every application",
    description: "Drag applications through 15 stages, from wishlist to offer, with a full history of every change.",
  },
  {
    icon: Users2,
    title: "A CRM for your job search",
    description: "Track recruiters, hiring managers, and every message you've exchanged with each company.",
  },
  {
    icon: CalendarClock,
    title: "Interviews and follow-ups",
    description: "Never miss a round or a recruiter follow-up with a calendar built for job hunting.",
  },
  {
    icon: LineChart,
    title: "Know what's actually working",
    description: "See which source, role, and resume converts best, with real analytics from your own data.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 text-base font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Briefcase className="size-4.5" />
          </span>
          JobTrack
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" render={<Link href="/login">Sign in</Link>} />
          <Button render={<Link href="/register">Get started</Link>} />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-24 px-6 pb-24 pt-12 sm:pt-20">
        <section className="flex flex-col items-center gap-6 text-center">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Replace your spreadsheet with a real job search command center
          </h1>
          <p className="max-w-xl text-balance text-lg text-muted-foreground">
            You apply on LinkedIn, Naukri, or through a referral. JobTrack is where you manage everything that
            happens after — every recruiter, interview, offer, and follow-up.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" render={<Link href="/register">Start tracking for free <ArrowRight className="size-4" /></Link>} />
            <Button size="lg" variant="outline" render={<Link href="/login">I already have an account</Link>} />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="size-4.5" />
              </div>
              <h3 className="mb-1.5 text-sm font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} JobTrack</span>
          <span>Built for job seekers, not recruiters.</span>
        </div>
      </footer>
    </div>
  );
}
