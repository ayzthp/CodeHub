'use client';

import { LiveblocksProvider } from "@liveblocks/react";

interface LiveblocksWrapperProps {
  children: React.ReactNode;
}

const publicApiKey = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;

export default function LiveblocksWrapper({ children }: LiveblocksWrapperProps) {
  if (!publicApiKey) {
    throw new Error("Liveblocks public API key is missing. Please set NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY in your .env.local file.");
  }
  return (
    <LiveblocksProvider publicApiKey={publicApiKey}>
      {children}
    </LiveblocksProvider>
  );
} 