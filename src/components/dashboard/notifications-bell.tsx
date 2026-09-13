"use client";

import { Bell } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Notification = {
  id: string;
  title: string;
  message: string | null;
  isRead: boolean;
  createdAt: string;
};

async function fetchNotifications() {
  const res = await fetch("/api/notifications");
  const json = await res.json();
  return json.data as { notifications: Notification[]; unreadCount: number };
}

export function NotificationsBell() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 60_000,
  });

  async function markAllRead() {
    await fetch("/api/notifications/mark-all-read", { method: "POST" });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }

  const unreadCount = data?.unreadCount ?? 0;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="size-4" />
            {unreadCount > 0 && (
              <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 justify-center rounded-full p-0 text-[10px]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Button>
        }
      />
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-medium">Notifications</span>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-muted-foreground hover:text-foreground">
              Mark all read
            </button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {!data || data.notifications.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>
          ) : (
            <ul className="divide-y">
              {data.notifications.map((n) => (
                <li key={n.id} className={`px-3 py-2.5 text-sm ${!n.isRead ? "bg-primary/5" : ""}`}>
                  <p className="font-medium">{n.title}</p>
                  {n.message && <p className="text-xs text-muted-foreground">{n.message}</p>}
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
