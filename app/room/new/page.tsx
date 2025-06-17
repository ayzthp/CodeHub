'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowLeft, Users, Code } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function CreateRoomPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    maxParticipants: 10,
    isPublic: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsCreating(true);
    try {
      // Generate unique room ID
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create room document in Firestore
      await setDoc(doc(db, 'rooms', roomId), {
        id: roomId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        hostId: user.uid,
        hostName: user.displayName || user.email || 'Anonymous',
        createdAt: serverTimestamp(),
        isPublic: formData.isPublic,
        maxParticipants: formData.maxParticipants,
        currentEditor: user.uid,
        currentCode: "// Welcome to the collaborative code editor!\n// Start coding with your team...\n\nfunction hello() {\n  console.log('Hello, World!');\n}\n\nhello();",
        currentLanguage: "javascript",
        lastUpdated: serverTimestamp(),
        lastUpdatedBy: user.uid,
        participants: {
          [user.uid]: {
            name: user.displayName || user.email || 'Anonymous',
            email: user.email || '',
            joinedAt: serverTimestamp(),
            role: 'host'
          }
        }
      });

      toast.success('Room created successfully!');
      router.push(`/room/${roomId}`);
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Failed to create room');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div className="flex items-center space-x-2">
                <Code className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Create Room</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span>Create a New Collaboration Room</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Room Title</Label>
                    <Input
                      id="title"
                      type="text"
                      placeholder="Enter room title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what this room is for..."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxParticipants">Maximum Participants</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      min="2"
                      max="50"
                      value={formData.maxParticipants}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) || 10 }))}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      id="isPublic"
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="isPublic">Public Room (anyone with link can join)</Label>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isCreating || !formData.title.trim()}
                    className="w-full"
                  >
                    {isCreating ? 'Creating Room...' : 'Create Room'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 