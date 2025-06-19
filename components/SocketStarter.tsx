"use client";
import { useEffect } from "react";

export default function SocketStarter() {
  useEffect(() => {
    fetch("/api/socket");
  }, []);
  return null;
} 