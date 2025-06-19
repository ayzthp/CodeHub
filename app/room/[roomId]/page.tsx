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
import { ArrowLeft, Copy, Share } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import SharedCodeEditor from './codepad';
import RightSidebar from '@/components/room/RightSidebar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Whiteboard from '@/components/Whiteboard';
import { RoomProvider } from '@liveblocks/react';
import LiveblocksWrapper from '@/components/LiveblocksWrapper';

interface RoomData {
  id: string;
  title: string;
  description: string;
  hostId: string;
  hostName: string;
  createdAt: unknown;
  isPublic: boolean;
  maxParticipants: number;
  currentEditor: string;
  participants: Record<string, {
    name: string;
    email: string;
    joinedAt: unknown;
    role: string;
  }>;
}

export default function RoomPage() {
  const { user } = useAuth();
  const params = useParams();
  const roomId = params?.roomId as string || "";
  
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [roomLoading, setRoomLoading] = useState(true);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [activeTab, setActiveTab] = useState<'code' | 'whiteboard'>('code');

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
              <p className="text-gray-600 mb-4">This room doesn&apos;t exist or has been deleted</p>
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

        {/* Main Content - Full height layout */}
        <main className="h-[calc(100vh-80px)] flex">
          <LiveblocksWrapper>
            <RoomProvider id={roomId}>
              <div className="flex-1 p-4 flex flex-col">
                <Tabs value={activeTab} onValueChange={v => setActiveTab(v as 'code' | 'whiteboard')} className="mb-4">
                  <TabsList>
                    <TabsTrigger value="code">Code</TabsTrigger>
                    <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>
                  </TabsList>
                  <TabsContent value="code">
                    <SharedCodeEditor 
                      roomId={roomId} 
                      input={input}
                      setInput={setInput}
                      output={output}
                      setOutput={setOutput}
                    />
                  </TabsContent>
                  <TabsContent value="whiteboard">
                    <Whiteboard isHost={isHost} />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Right Side - Controls and I/O (Fixed width) */}
              <div className="w-96 bg-white border-l border-gray-200 p-4 overflow-y-auto">
                <RightSidebar 
                  roomId={roomId} 
                  roomData={roomData} 
                  isHost={isHost}
                  input={input}
                  setInput={setInput}
                  output={output}
                  setOutput={setOutput}
                />
              </div>
            </RoomProvider>
          </LiveblocksWrapper>
        </main>
      </div>
    </ProtectedRoute>
  );
} 