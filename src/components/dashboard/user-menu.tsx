"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut, Settings, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  name: string | null;
  email: string;
  image: string | null;
  role: "USER" | "ADMIN";
};

function initials(name: string | null, email: string) {
  const base = name?.trim() || email;
  return base
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function UserMenu({ name, email, image, role }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="size-7">
              <AvatarImage src={image ?? undefined} alt={name ?? email} />
              <AvatarFallback className="text-xs">{initials(name, email)}</AvatarFallback>
            </Avatar>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col">
            <span className="truncate text-sm font-medium">{name || "Your account"}</span>
            <span className="truncate text-xs font-normal text-muted-foreground">{email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/settings" />}>
          <Settings className="size-4" /> Settings
        </DropdownMenuItem>
        {role === "ADMIN" && (
          <DropdownMenuItem render={<Link href="/admin" />}>
            <ShieldCheck className="size-4" /> Admin dashboard
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => signOut({ callbackUrl: "/login" })}>
          <LogOut className="size-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
