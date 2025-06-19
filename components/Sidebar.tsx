"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Home,
  User,
  Trophy,
  Users,
  BarChart2,
  BookOpen,
  Settings,
  LogOut,
  MonitorPlay,
  PieChart,
} from "lucide-react";
import { useState } from "react";

const navLinks = [
  { label: "Feed", href: "/blogs", icon: Home },
  { label: "Dashboard", href: "/dashboard", icon: User },
  { label: "Leaderboard", href: "/leaderboard/global", icon: Trophy },
  { label: "Contests", href: "/contests", icon: MonitorPlay },
  { label: "Rooms", href: "/room/new", icon: Users },
  { label: "Analytics", href: "/analytics", icon: PieChart },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    // Use your logout logic here (e.g., Firebase signOut)
    router.push("/login");
  };

  return (
    <aside
      className={`bg-white border-r shadow-md flex flex-col h-screen sticky top-0 z-30 transition-all duration-200 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* User Info */}
      <div className="flex items-center gap-3 px-4 py-6 border-b">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-purple-100 text-purple-600">
            {user?.displayName
              ? user.displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
              : user?.email?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <div>
            <div className="font-semibold text-gray-900 truncate max-w-[120px]">
              {user?.displayName || user?.email || "User"}
            </div>
            <div className="text-xs text-gray-500 truncate max-w-[120px]">
              {user?.email || "-"}
            </div>
          </div>
        )}
        <button
          className="ml-auto text-gray-400 hover:text-purple-600 focus:outline-none"
          onClick={() => setCollapsed((c) => !c)}
          aria-label="Toggle sidebar"
        >
          <BarChart2 className="h-5 w-5" />
        </button>
      </div>
      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 py-4 px-2">
        {navLinks.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors text-gray-700 hover:bg-purple-50 hover:text-purple-700 ${
              (pathname || "").startsWith(href)
                ? "bg-purple-100 text-purple-800 font-semibold"
                : ""
            } ${collapsed ? "justify-center" : ""}`}
          >
            <Icon className="h-5 w-5" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>
      {/* Logout */}
      <div className="p-4 mt-auto">
        <Button
          variant="outline"
          className="w-full flex items-center gap-2 justify-center"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
      {/* Mobile overlay (optional) */}
      <style jsx global>{`
        @media (max-width: 768px) {
          aside {
            position: fixed;
            left: 0;
            top: 0;
            height: 100vh;
            z-index: 40;
          }
        }
      `}</style>
    </aside>
  );
} 