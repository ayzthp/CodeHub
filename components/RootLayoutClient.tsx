"use client";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/Sidebar";

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  return (
    <div className="flex min-h-screen">
      {user ? <Sidebar /> : null}
      <main className="flex-1 min-h-screen overflow-x-hidden">{children}</main>
    </div>
  );
} 