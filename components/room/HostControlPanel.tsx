"use client";

import { useState } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Volume2, VolumeX } from "lucide-react";

interface Participant {
  uid: string;
  name: string;
  isHost: boolean;
  hasWriteAccess: boolean;
  isMuted: boolean;
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

interface HostControlPanelProps {
  roomId: string;
  roomData: RoomData;
  isHost: boolean;
}

export default function HostControlPanel({ roomId, roomData, isHost }: HostControlPanelProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  if (!isHost) return null;

  const muteUser = async (participantId: string) => {
    if (!isHost || !db) return;
    setIsUpdating(participantId);
    try {
      const updatedParticipants = roomData.participants.map(p => ({
        ...p,
        isMuted: p.uid === participantId ? true : p.isMuted
      }));
      await updateDoc(doc(db, "rooms", roomId), {
        participants: updatedParticipants,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error muting user:", error);
    } finally {
      setIsUpdating(null);
    }
  };

  const unmuteUser = async (participantId: string) => {
    if (!isHost || !db) return;
    setIsUpdating(participantId);
    try {
      const updatedParticipants = roomData.participants.map(p => ({
        ...p,
        isMuted: p.uid === participantId ? false : p.isMuted
      }));
      await updateDoc(doc(db, "rooms", roomId), {
        participants: updatedParticipants,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error unmuting user:", error);
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          <span>Host Controls</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {roomData.participants.map((participant) => (
            <div key={participant.uid} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{participant.name}</span>
                  {participant.isHost && <Crown className="h-4 w-4 text-yellow-500" />}
                </div>
                <div className="flex space-x-1">
                  {participant.hasWriteAccess && (
                    <Badge variant="default" className="text-xs">
                      Writing
                    </Badge>
                  )}
                  {participant.isMuted && (
                    <Badge variant="destructive" className="text-xs">
                      Muted
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {participant.isMuted ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => unmuteUser(participant.uid)}
                    disabled={isUpdating === participant.uid}
                  >
                    <Volume2 className="h-3 w-3" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => muteUser(participant.uid)}
                    disabled={isUpdating === participant.uid}
                  >
                    <VolumeX className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 