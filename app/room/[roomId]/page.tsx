'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowLeft, Users, Copy, Share, Code, Crown } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import SharedCodeEditor from './codepad';
import HostControlPanel from '@/components/room/HostControlPanel';
import InputOutputPanel from '@/components/room/InputOutputPanel';

interface RoomData {
  id: string;
  title: string;
  description: string;
  hostId: string;
  hostName: string;
  createdAt: any;
  isPublic: boolean;
  maxParticipants: number;
  currentEditor: string;
  participants: Record<string, {
    name: string;
    email: string;
    joinedAt: any;
    role: string;
  }>;
}

export default function RoomPage() {
  const { user } = useAuth();
  const params = useParams();
  const roomId = params.roomId as string;
  
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [roomLoading, setRoomLoading] = useState(true);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [currentCode, setCurrentCode] = useState("");
  const [currentLanguage, setCurrentLanguage] = useState<any>(null);

  useEffect(() => {
    if (!user || !roomId) return;

    console.log('Loading room:', roomId);
    
    const roomRef = doc(db, 'rooms', roomId);
    
    const unsubscribe = onSnapshot(roomRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as RoomData;
        console.log('Room data found:', data);
        setRoomData(data);
        
        // Add current user to participants if not already present
        if (!data.participants[user.uid]) {
          updateDoc(roomRef, {
            [`participants.${user.uid}`]: {
              name: user.displayName || user.email || 'Anonymous',
              email: user.email || '',
              joinedAt: new Date(),
              role: 'participant'
            }
          }).catch((error) => {
            console.error('Error joining room:', error);
          });
        }
      } else {
        console.log('Room not found');
        setRoomError('Room not found');
      }
      setRoomLoading(false);
    }, (error) => {
      console.error('Firestore error:', error);
      setRoomError('Error loading room');
      setRoomLoading(false);
    });

    return () => unsubscribe();
  }, [user, roomId]);

  const copyRoomLink = () => {
    const roomLink = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(roomLink);
    toast.success('Room link copied to clipboard!');
  };

  const shareRoom = async () => {
    const roomLink = `${window.location.origin}/room/${roomId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: roomData?.title || 'Join my room',
          text: roomData?.description || 'Join this collaboration room',
          url: roomLink,
        });
      } catch {
        copyRoomLink();
      }
    } else {
      copyRoomLink();
    }
  };

  const transferEditorControl = async (userId: string) => {
    if (!roomData || user?.uid !== roomData.hostId) return;
    
    try {
      await updateDoc(doc(db, 'rooms', roomId), {
        currentEditor: userId
      });
      toast.success('Editor control transferred!');
    } catch (error) {
      console.error('Error transferring editor control:', error);
      toast.error('Failed to transfer editor control');
    }
  };

  if (roomLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading room...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (roomError || !roomData) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-red-600">Room Not Found</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">This room doesn't exist or has been deleted</p>
              <Button asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  const isHost = user?.uid === roomData.hostId;
  const isCurrentEditor = user?.uid === roomData.currentEditor;
  const participantCount = Object.keys(roomData.participants).length;

  return (
    <ProtectedRoute>
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
                  <h1 className="text-xl font-bold text-gray-900">{roomData.title}</h1>
                  <p className="text-sm text-gray-500">
                    {participantCount} participant{participantCount !== 1 ? 's' : ''} • 
                    Host: {roomData.hostName}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button onClick={shareRoom} variant="outline" size="sm">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button onClick={copyRoomLink} variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Code Editor - Takes up most of the space */}
            <div className="lg:col-span-3">
              <SharedCodeEditor 
                roomId={roomId} 
                onCodeChange={setCurrentCode}
                onLanguageChange={setCurrentLanguage}
              />
            </div>

            {/* Right Sidebar - Input/Output and Host Controls */}
            <div className="lg:col-span-2 space-y-6">
              {/* Input/Output Panel */}
              <InputOutputPanel 
                roomId={roomId}
                roomData={roomData}
                isEditor={isCurrentEditor}
                selectedLanguage={currentLanguage}
                code={currentCode}
              />

              {/* Host Control Panel */}
              <HostControlPanel 
                roomId={roomId} 
                roomData={roomData} 
                isHost={isHost} 
              />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 