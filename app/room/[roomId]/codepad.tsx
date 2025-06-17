'use client';

import { useEffect, useRef, useState } from "react";
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Loader2, Crown, Users, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  { ssr: false }
);

const LANGUAGES = [
  { id: 54, name: "C++", monaco: "cpp", template: "#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Hello, World!\" << endl;\n    return 0;\n}" },
  { id: 62, name: "Java", monaco: "java", template: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n    }\n}" },
  { id: 71, name: "Python", monaco: "python", template: "print(\"Hello, World!\")\n" },
  { id: 63, name: "JavaScript", monaco: "javascript", template: "console.log(\"Hello, World!\");\n" },
  { id: 50, name: "C", monaco: "c", template: "#include <stdio.h>\n\nint main() {\n    printf(\"Hello, World!\\n\");\n    return 0;\n}" },
  { id: 51, name: "C#", monaco: "csharp", template: "using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine(\"Hello, World!\");\n    }\n}" },
];

export default function SharedCodeEditor({ 
  roomId, 
  onCodeChange, 
  onLanguageChange 
}: { 
  roomId: string;
  onCodeChange?: (code: string) => void;
  onLanguageChange?: (language: any) => void;
}) {
  const { user } = useAuth();
  const [isEditor, setIsEditor] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [roomData, setRoomData] = useState<any>(null);
  const [code, setCode] = useState("// Welcome to the collaborative code editor!\n// Start coding with your team...\n\nfunction hello() {\n  console.log('Hello, World!');\n}\n\nhello();");
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[3]); // JavaScript by default
  const [participantCount, setParticipantCount] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const [lastTypingTime, setLastTypingTime] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  
  // Refs for debouncing
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCodeUpdateRef = useRef<string>("");

  // Debug initial state
  console.log('🎯 Initial component state:', {
    roomId,
    userId: user?.uid,
    initialCode: code.substring(0, 50) + '...',
    selectedLanguage: selectedLanguage.name
  });

  useEffect(() => {
    if (!user || !roomId) return;

    console.log('🔍 Setting up real-time listener for room:', roomId);
    console.log('👤 Current user:', user.uid);
    console.log('🔧 User display name:', user.displayName);
    console.log('📧 User email:', user.email);
    
    // Listen to room data for editor permissions and real-time code changes
    const roomRef = doc(db, 'rooms', roomId);
    const unsubscribe = onSnapshot(roomRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        console.log('📡 Real-time update received:', {
          title: data.title,
          hostId: data.hostId,
          currentEditor: data.currentEditor,
          participants: Object.keys(data.participants || {}),
          hasCurrentCode: !!data.currentCode,
          currentCodeLength: data.currentCode?.length || 0
        });
        
        setRoomData(data);
        setIsEditor(user.uid === data.currentEditor);
        setIsHost(user.uid === data.hostId);
        setParticipantCount(Object.keys(data.participants || {}).length);
        
        console.log('👑 User permissions:', {
          isEditor: user.uid === data.currentEditor,
          isHost: user.uid === data.hostId,
          currentEditor: data.currentEditor,
          userUid: user.uid
        });
        
        // Update code from Firestore if it's different from local state
        if (data.currentCode && data.currentCode !== lastCodeUpdateRef.current) {
          console.log('🔄 Updating code from Firestore:', data.currentCode.substring(0, 50) + '...');
          setCode(data.currentCode);
          lastCodeUpdateRef.current = data.currentCode;
          setLastSyncTime(new Date());
        } else if (data.currentCode) {
          console.log('⏭️ Code exists but unchanged, skipping update');
        } else {
          console.log('⚠️ No currentCode in Firestore');
        }
        
        // Update language if changed
        if (data.currentLanguage) {
          const language = LANGUAGES.find(lang => lang.monaco === data.currentLanguage);
          if (language) {
            console.log('🌐 Language changed to:', language.name);
            setSelectedLanguage(language);
            setLastSyncTime(new Date());
          }
        }
        
        // Update output if someone else executed code
        if (data.lastExecution && data.lastExecution.output) {
          console.log('📤 Updating output from execution:', data.lastExecution.output.substring(0, 50) + '...');
          setLastSyncTime(new Date());
        }
      } else {
        console.log('❌ Room not found in Firestore');
      }
    }, (error) => {
      console.error('🔥 Firestore listener error:', error);
    });

    return () => {
      console.log('🔌 Cleaning up real-time listener');
      unsubscribe();
    };
  }, [user, roomId]);

  // Debounced function to update code in Firestore
  const debouncedUpdateCode = (newCode: string) => {
    console.log('⌨️ Code change detected, debouncing update...');
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      if (newCode !== lastCodeUpdateRef.current) {
        console.log('📤 Sending code update to Firestore:', newCode.substring(0, 50) + '...');
        updateDoc(doc(db, 'rooms', roomId), {
          currentCode: newCode,
          lastUpdated: new Date(),
          lastUpdatedBy: user?.uid
        }).then(() => {
          console.log('✅ Code update sent successfully');
        }).catch((error) => {
          console.error('❌ Failed to update code:', error);
        });
        lastCodeUpdateRef.current = newCode;
        setIsTyping(false);
      } else {
        console.log('⏭️ Skipping update - code unchanged');
      }
    }, 300); // 300ms debounce
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      console.log('✏️ Editor change detected, isEditor:', isEditor);
      setCode(value);
      onCodeChange?.(value);
      
      // Only update Firestore if user is the current editor
      if (isEditor) {
        console.log('👑 User is editor, updating Firestore...');
        setIsTyping(true);
        setLastTypingTime(Date.now());
        debouncedUpdateCode(value);
      } else {
        console.log('👁️ User is not editor, skipping update');
      }
    }
  };

  const handleLanguageChange = (languageId: string) => {
    const language = LANGUAGES.find(lang => lang.id.toString() === languageId);
    if (language && isEditor) {
      setSelectedLanguage(language);
      setCode(language.template);
      onLanguageChange?.(language);
      
      // Update language and code in Firestore
      updateDoc(doc(db, 'rooms', roomId), {
        currentLanguage: language.monaco,
        currentCode: language.template,
        lastUpdated: new Date(),
        lastUpdatedBy: user?.uid
      }).catch(console.error);
      
      lastCodeUpdateRef.current = language.template;
      setLastSyncTime(new Date());
    }
  };

  const transferEditorControl = async (userId: string) => {
    if (!isHost) return;
    
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
    if (!isHost) return;
    
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
    if (!isHost) return;
    
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Collaborative Code Editor</h3>
        <div className="flex items-center space-x-2">
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
            👥 {participantCount} Online
          </span>
          {isHost && (
            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full flex items-center">
              <Crown className="h-3 w-3 mr-1" />
              Host
            </span>
          )}
          {isEditor ? (
            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
              ✏️ Can Edit
            </span>
          ) : (
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
              👁️ View Only
            </span>
          )}
          {isTyping && (
            <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full animate-pulse">
              ✍️ Typing...
            </span>
          )}
          {lastSyncTime && (
            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
              🔄 Synced {lastSyncTime.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Language Selection and Run Button */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Language:</label>
          <Select value={selectedLanguage.id.toString()} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((language) => (
                <SelectItem key={language.id} value={language.id.toString()}>
                  {language.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={() => {
            console.log('🧪 Testing real-time sync...');
            const testCode = `// Test sync at ${new Date().toLocaleTimeString()}\nconsole.log('Real-time sync test!');`;
            updateDoc(doc(db, 'rooms', roomId), {
              currentCode: testCode,
              lastUpdated: new Date(),
              lastUpdatedBy: user?.uid
            }).then(() => {
              console.log('✅ Test update sent');
              toast.success('Test update sent!');
            }).catch((error) => {
              console.error('❌ Test update failed:', error);
              toast.error('Test update failed');
            });
          }}
          variant="outline"
          size="sm"
        >
          🧪 Test Sync
        </Button>
      </div>

      {/* Code Editor - Full height */}
      <div className="h-[calc(100vh-300px)] w-full border rounded-xl shadow-lg overflow-hidden">
        <MonacoEditor
          height="100%"
          language={selectedLanguage.monaco}
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          options={{
            readOnly: !isEditor,
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            cursorStyle: "line",
            automaticLayout: true,
            contextmenu: true,
            mouseWheelZoom: true,
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: "on",
            tabCompletion: "on",
            wordBasedSuggestions: "currentDocument",
          }}
        />
      </div>
    </div>
  );
} 