"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { doc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  MicOff, 
  Volume2, 
  VolumeX,
  Loader2
} from "lucide-react";

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

export default function Codepad() {
  const params = useParams();
  const roomId = params.roomId as string;
  
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [hasWriteAccess, setHasWriteAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = onSnapshot(doc(db, "rooms", roomId), (doc) => {
      if (doc.exists()) {
        const roomData = doc.data() as RoomData;
        setCode(roomData.code || "");
        setLanguage(roomData.language || "javascript");
        setParticipants(roomData.participants || []);
        
        // Check if current user is host or has write access
        const currentUser = roomData.participants?.find(p => p.uid === "current-user-id");
        setIsHost(currentUser?.isHost || false);
        setHasWriteAccess(currentUser?.hasWriteAccess || false);
        
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  const updateCode = async (newCode: string) => {
    if (!roomId || !hasWriteAccess) return;

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
    if (!roomId || !hasWriteAccess) return;

    try {
      await updateDoc(doc(db, "rooms", roomId), {
        language: newLanguage,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating language:", error);
    }
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    
    // Clear existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    // Debounce the update
    debounceTimeout.current = setTimeout(() => {
      updateCode(newCode);
    }, 500);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    updateLanguage(newLanguage);
  };

  const assignWriteAccess = async (participantId: string) => {
    if (!roomId || !isHost) return;

    try {
      const updatedParticipants = participants.map(p => ({
        ...p,
        hasWriteAccess: p.uid === participantId
      }));

      await updateDoc(doc(db, "rooms", roomId), {
        participants: updatedParticipants,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error assigning write access:", error);
    }
  };

  const muteUser = async (participantId: string) => {
    if (!roomId || !isHost) return;

    try {
      const updatedParticipants = participants.map(p => ({
        ...p,
        isMuted: p.uid === participantId ? true : p.isMuted
      }));

      await updateDoc(doc(db, "rooms", roomId), {
        participants: updatedParticipants,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error muting user:", error);
    }
  };

  const unmuteUser = async (participantId: string) => {
    if (!roomId || !isHost) return;

    try {
      const updatedParticipants = participants.map(p => ({
        ...p,
        isMuted: p.uid === participantId ? false : p.isMuted
      }));

      await updateDoc(doc(db, "rooms", roomId), {
        participants: updatedParticipants,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error unmuting user:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Language Selector */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium">Language:</label>
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          disabled={!hasWriteAccess}
          className="px-3 py-1 border rounded-md text-sm"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="c">C</option>
        </select>
        
        {!hasWriteAccess && (
          <Badge variant="secondary" className="ml-2">
            Read Only
          </Badge>
        )}
      </div>

      {/* Code Editor */}
      <div className="border rounded-lg overflow-hidden">
        <textarea
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          disabled={!hasWriteAccess}
          className="w-full h-96 p-4 font-mono text-sm bg-gray-50 border-0 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Start coding here..."
        />
      </div>

      {/* Participants */}
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium">Participants:</span>
        {participants.map((participant) => (
          <div key={participant.uid} className="flex items-center space-x-2">
            <span className="text-sm">
              {participant.name}
              {participant.isHost && <Crown className="inline h-3 w-3 ml-1" />}
            </span>
            {participant.hasWriteAccess && (
              <Badge variant="default" className="text-xs">
                Writing
              </Badge>
            )}
            {participant.isMuted && (
              <MicOff className="h-3 w-3 text-red-500" />
            )}
          </div>
        ))}
      </div>

      {/* Host Controls */}
      {isHost && (
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">Host Controls:</span>
          {participants.map((participant) => (
            <div key={participant.uid} className="flex items-center space-x-2">
              <span className="text-sm">{participant.name}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => assignWriteAccess(participant.uid)}
                disabled={participant.hasWriteAccess}
              >
                Give Write Access
              </Button>
              {participant.isMuted ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => unmuteUser(participant.uid)}
                >
                  <Volume2 className="h-3 w-3" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => muteUser(participant.uid)}
                >
                  <VolumeX className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 