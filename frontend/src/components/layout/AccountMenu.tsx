"use client";

import { useRouter } from "next/navigation";
import { LogOut, LogIn } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { useLogout } from "@/hooks/useAuth";

interface AccountMenuProps {
  name: string;
  imageUrl?: string | null;
}

export default function AccountMenu({ name, imageUrl }: AccountMenuProps) {
  const router = useRouter();
  const logout = useLogout();

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleGoogleLogin = () => {
    window.location.href = process.env.NEXT_PUBLIC_API_URL + "/api/auth/google";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="cursor-pointer">
          <Avatar className="h-9 w-9">
            <AvatarImage src={imageUrl ?? undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">

        <DropdownMenuItem
          onClick={handleGoogleLogin}
          className="cursor-pointer"
        >
          <LogIn className="mr-2 h-4 w-4" />
          Switch account
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => logout.mutate()}
          className="cursor-pointer text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}
