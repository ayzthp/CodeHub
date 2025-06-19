'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Users, MicOff, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';

interface Participant {
  name: string;
  email: string;
  joinedAt: unknown;
  role: string;
  muted?: boolean;
}

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
  lastExecution?: {
    output: string;
    executedBy: string;
    executedAt: unknown;
    language: string;
  };
  participants: Record<string, Participant>;
}

interface RightSidebarProps {
  roomId: string;
  roomData: RoomData;
  isHost: boolean;
  input: string;
  setInput: (value: string) => void;
  output: string;
  setOutput: (value: string) => void;
}

export default function RightSidebar({ 
  roomId, 
  roomData, 
  isHost, 
  input, 
  setInput, 
  output, 
  setOutput 
}: RightSidebarProps) {
  const { user } = useAuth();
  const [isEditor, setIsEditor] = useState(false);

  useEffect(() => {
    if (!user || !roomId) return;

    const roomRef = doc(db, 'rooms', roomId);
    const unsubscribe = onSnapshot(roomRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as RoomData;
        setIsEditor(user.uid === data.currentEditor);
        
        // Update output if someone else executed code
        if (data.lastExecution && data.lastExecution.output) {
          setOutput(data.lastExecution.output);
        }
      }
    });

    return () => unsubscribe();
  }, [user, roomId, setOutput]);

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

  const muteUser = async (userId: string) => {
    if (!roomData || user?.uid !== roomData.hostId) return;
    
    try {
      await updateDoc(doc(db, 'rooms', roomId), {
        [`participants.${userId}.muted`]: true
      });
      toast.success('User muted!');
    } catch (error) {
      console.error('Error muting user:', error);
      toast.error('Failed to mute user');
    }
  };

  const unmuteUser = async (userId: string) => {
    if (!roomData || user?.uid !== roomData.hostId) return;
    
    try {
      await updateDoc(doc(db, 'rooms', roomId), {
        [`participants.${userId}.muted`]: false
      });
      toast.success('User unmuted!');
    } catch (error) {
      console.error('Error unmuting user:', error);
      toast.error('Failed to unmute user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Input and Output Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Code Execution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Input:</label>
            <Textarea
              placeholder="Enter input for your code..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="h-32 resize-none"
              disabled={!isEditor}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Output:</label>
            <Textarea
              placeholder="Output will appear here..."
              value={output}
              readOnly
              className="h-32 resize-none bg-gray-50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Host Control Panel */}
      {isHost && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              <span>Host Controls</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-3">
                {Object.entries(roomData?.participants || {}).map(([userId, participant]: [string, Participant]) => (
                  <div key={userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{participant.name}</p>
                        <p className="text-xs text-gray-500">{participant.role}</p>
                      </div>
                      {userId === roomData?.currentEditor && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          ✏️ Editor
                        </span>
                      )}
                      {userId === roomData?.hostId && (
                        <Crown className="h-4 w-4 text-yellow-500" />
                      )}
                      {participant.muted && (
                        <MicOff className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {userId === user?.uid && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">You</span>
                      )}
                      {userId !== user?.uid && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => transferEditorControl(userId)}
                            disabled={userId === roomData?.currentEditor}
                          >
                            {userId === roomData?.currentEditor ? 'Current' : 'Make Editor'}
                          </Button>
                          {participant.muted ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => unmuteUser(userId)}
                            >
                              <Volume2 className="h-3 w-3" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => muteUser(userId)}
                            >
                              <VolumeX className="h-3 w-3" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Participants List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Participants ({Object.keys(roomData?.participants || {}).length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(roomData?.participants || {}).map(([userId, participant]: [string, Participant]) => (
              <div key={userId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">{participant.name}</span>
                  {userId === roomData?.hostId && (
                    <Crown className="h-3 w-3 text-yellow-500" />
                  )}
                  {userId === roomData?.currentEditor && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                      Editor
                    </span>
                  )}
                </div>
                {userId === user?.uid && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">You</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 