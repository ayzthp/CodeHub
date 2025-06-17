'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Users, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Edit3, 
  Eye,
  Settings,
  UserCheck,
  UserX,
  Shield,
  Lock,
  Unlock
} from 'lucide-react';
import { toast } from 'sonner';

interface Participant {
  name: string;
  email: string;
  role: string;
  muted?: boolean;
  joinedAt: any;
}

interface HostControlPanelProps {
  roomId: string;
  roomData: any;
  isHost: boolean;
}

export default function HostControlPanel({ roomId, roomData, isHost }: HostControlPanelProps) {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  if (!isHost) return null;

  const participants = roomData?.participants || {};
  const currentEditor = roomData?.currentEditor;

  const transferEditorControl = async (userId: string) => {
    if (!isHost) return;
    
    setIsUpdating(userId);
    try {
      await updateDoc(doc(db, 'rooms', roomId), {
        currentEditor: userId
      });
      toast.success('Editor control transferred!');
    } catch (error) {
      console.error('Error transferring editor control:', error);
      toast.error('Failed to transfer editor control');
    } finally {
      setIsUpdating(null);
    }
  };

  const muteUser = async (userId: string) => {
    if (!isHost) return;
    
    setIsUpdating(userId);
    try {
      await updateDoc(doc(db, 'rooms', roomId), {
        [`participants.${userId}.muted`]: true
      });
      toast.success('User muted!');
    } catch (error) {
      console.error('Error muting user:', error);
      toast.error('Failed to mute user');
    } finally {
      setIsUpdating(null);
    }
  };

  const unmuteUser = async (userId: string) => {
    if (!isHost) return;
    
    setIsUpdating(userId);
    try {
      await updateDoc(doc(db, 'rooms', roomId), {
        [`participants.${userId}.muted`]: false
      });
      toast.success('User unmuted!');
    } catch (error) {
      console.error('Error unmuting user:', error);
      toast.error('Failed to unmute user');
    } finally {
      setIsUpdating(null);
    }
  };

  const removeUser = async (userId: string) => {
    if (!isHost) return;
    
    if (userId === roomData?.hostId) {
      toast.error('Cannot remove the host from the room');
      return;
    }
    
    setIsUpdating(userId);
    try {
      const updatedParticipants = { ...participants };
      delete updatedParticipants[userId];
      
      await updateDoc(doc(db, 'rooms', roomId), {
        participants: updatedParticipants,
        currentEditor: userId === currentEditor ? roomData?.hostId : currentEditor
      });
      toast.success('User removed from room!');
    } catch (error) {
      console.error('Error removing user:', error);
      toast.error('Failed to remove user');
    } finally {
      setIsUpdating(null);
    }
  };

  const toggleRoomPrivacy = async () => {
    if (!isHost) return;
    
    try {
      await updateDoc(doc(db, 'rooms', roomId), {
        isPublic: !roomData?.isPublic
      });
      toast.success(`Room is now ${roomData?.isPublic ? 'private' : 'public'}!`);
    } catch (error) {
      console.error('Error toggling room privacy:', error);
      toast.error('Failed to update room privacy');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Crown className="h-5 w-5 text-yellow-600" />
          <span>Host Controls</span>
          <Badge variant="secondary" className="ml-auto">
            {Object.keys(participants).length} Participants
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Room Settings */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Room Settings</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={toggleRoomPrivacy}
              className="flex items-center space-x-1"
            >
              {roomData?.isPublic ? (
                <>
                  <Lock className="h-3 w-3" />
                  <span>Make Private</span>
                </>
              ) : (
                <>
                  <Unlock className="h-3 w-3" />
                  <span>Make Public</span>
                </>
              )}
            </Button>
          </div>

          {/* Participants List */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>Participants</span>
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {Object.entries(participants).map(([userId, participant]: [string, any]) => (
                <div key={userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 text-sm">
                          {participant.name}
                        </span>
                        {userId === roomData?.hostId && (
                          <Crown className="h-3 w-3 text-yellow-500" />
                        )}
                        {userId === currentEditor && (
                          <Edit3 className="h-3 w-3 text-blue-500" />
                        )}
                        {participant.muted && (
                          <MicOff className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{participant.email}</span>
                      <div className="flex items-center space-x-1 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {participant.role}
                        </Badge>
                        {userId === user?.uid && (
                          <Badge variant="secondary" className="text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {userId !== user?.uid && (
                      <>
                        {/* Editor Control */}
                        <Button
                          size="sm"
                          variant={userId === currentEditor ? "default" : "outline"}
                          onClick={() => transferEditorControl(userId)}
                          disabled={isUpdating === userId || userId === currentEditor}
                          className="flex items-center space-x-1"
                        >
                          {userId === currentEditor ? (
                            <>
                              <Eye className="h-3 w-3" />
                              <span>Current</span>
                            </>
                          ) : (
                            <>
                              <Edit3 className="h-3 w-3" />
                              <span>Make Editor</span>
                            </>
                          )}
                        </Button>

                        {/* Mute/Unmute */}
                        {participant.muted ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => unmuteUser(userId)}
                            disabled={isUpdating === userId}
                            className="flex items-center space-x-1"
                          >
                            <Volume2 className="h-3 w-3" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => muteUser(userId)}
                            disabled={isUpdating === userId}
                            className="flex items-center space-x-1"
                          >
                            <VolumeX className="h-3 w-3" />
                          </Button>
                        )}

                        {/* Remove User */}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeUser(userId)}
                          disabled={isUpdating === userId}
                          className="flex items-center space-x-1"
                        >
                          <UserX className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-2 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => transferEditorControl(roomData?.hostId)}
                disabled={currentEditor === roomData?.hostId}
                className="flex items-center space-x-1"
              >
                <Shield className="h-3 w-3" />
                <span>Take Editor Control</span>
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  // Mute all participants except host
                  Object.keys(participants).forEach(userId => {
                    if (userId !== roomData?.hostId && !participants[userId].muted) {
                      muteUser(userId);
                    }
                  });
                }}
                className="flex items-center space-x-1"
              >
                <MicOff className="h-3 w-3" />
                <span>Mute All</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 