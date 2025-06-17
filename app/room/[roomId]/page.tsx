"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Crown, 
  Loader2
} from "lucide-react";
import Link from "next/link";

interface Participant {
  uid: string;
  name: string;
  isHost: boolean;
  hasWriteAccess: boolean;
  isMuted: boolean;
  isTyping: boolean;
  lastSeen: unknown;
}

interface RoomData {
  id: string;
  name: string;
  hostId: string;
  participants: Participant[];
  code: string;
  language: string;
  createdAt: unknown;
  updatedAt: unknown;
}

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = onSnapshot(doc(db, "rooms", roomId), (doc) => {
      if (doc.exists()) {
        const data = doc.data() as RoomData;
        setRoomData(data);
        setCode(data.code || "");
        setLanguage(data.language || "javascript");
        setIsLoading(false);
      } else {
        router.push("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [roomId, router]);

  const updateCode = async (newCode: string) => {
    if (!roomId) return;

    try {
      await updateDoc(doc(db, "rooms", roomId), {
        code: newCode,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating code:", error);
    }
  };

  const updateLanguage = async (newLanguage: string) => {
    if (!roomId) return;

    try {
      await updateDoc(doc(db, "rooms", roomId), {
        language: newLanguage,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating language:", error);
    }
  };

  const runCode = async () => {
    if (!code.trim()) return;

    setIsRunning(true);
    setOutput("Running...");

    try {
      const response = await fetch("/api/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source_code: code,
          language_id: getLanguageId(language),
          stdin: input,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setOutput(result.output || "No output");
      } else {
        setOutput(`Error: ${result.error}`);
      }
    } catch {
      setOutput("Error: Failed to execute code");
    } finally {
      setIsRunning(false);
    }
  };

  const getLanguageId = (lang: string): number => {
    const languageMap: Record<string, number> = {
      javascript: 63,
      python: 71,
      java: 62,
      cpp: 54,
      c: 50,
    };
    return languageMap[lang] || 63;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Room not found</h2>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{roomData.name}</h1>
                <p className="text-sm text-gray-500">Collaborative coding room</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {roomData.participants.length} participants
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Code Editor - 3/5 width */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Code Editor</span>
                  <div className="flex items-center space-x-2">
                    <select
                      value={language}
                      onChange={(e) => updateLanguage(e.target.value)}
                      className="px-2 py-1 text-sm border rounded"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                      <option value="c">C</option>
                    </select>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={code}
                  onChange={(e) => updateCode(e.target.value)}
                  className="w-full h-96 p-4 font-mono text-sm bg-gray-50 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Start coding here..."
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 2/5 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Input/Output Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Input/Output</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Input:</label>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full h-20 p-2 text-sm border rounded resize-none"
                    placeholder="Enter input here..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Output:</label>
                  <textarea
                    value={output}
                    readOnly
                    className="w-full h-32 p-2 text-sm border rounded resize-none bg-gray-50"
                    placeholder="Output will appear here..."
                  />
                </div>
                <Button
                  onClick={runCode}
                  disabled={isRunning}
                  className="w-full"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Running...
                    </>
                  ) : (
                    "Run Code"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Participants */}
            <Card>
              <CardHeader>
                <CardTitle>Participants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {roomData.participants.map((participant) => (
                    <div key={participant.uid} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{participant.name}</span>
                        {participant.isHost && <Crown className="h-3 w-3 text-yellow-500" />}
                        {participant.hasWriteAccess && (
                          <Badge variant="default" className="text-xs">
                            Writing
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 