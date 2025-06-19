'use client';

import { useEffect, useRef, useState } from "react";
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Loader2, Crown } from 'lucide-react';
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
  currentCode?: string;
  currentLanguage?: string;
  lastExecution?: {
    output: string;
    executedBy: string;
    executedAt: unknown;
    language: string;
  };
  participants: Record<string, {
    name: string;
    email: string;
    joinedAt: unknown;
    role: string;
  }>;
}

export default function SharedCodeEditor({ 
  roomId, 
  input, 
  setInput, 
  output, 
  setOutput 
}: { 
  roomId: string;
  input?: string;
  setInput?: (value: string) => void;
  output?: string;
  setOutput?: (value: string) => void;
}) {
  const { user } = useAuth();
  const [isEditor, setIsEditor] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [code, setCode] = useState("// Welcome to the collaborative code editor!\n// Start coding with your team...\n\nfunction hello() {\n  console.log('Hello, World!');\n}\n\nhello();");
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[3]); // JavaScript by default
  const [localInput, setLocalInput] = useState("");
  const [localOutput, setLocalOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  
  // Use props if provided, otherwise use local state
  const currentInput = input !== undefined ? input : localInput;
  const updateInput = setInput || setLocalInput;

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
        const data = doc.data() as RoomData;
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
          setLocalOutput(data.lastExecution.output);
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
  }, [user, roomId, setLocalOutput]);

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
      
      // Only update Firestore if user is the current editor
      if (isEditor) {
        console.log('👑 User is editor, updating Firestore...');
        setIsTyping(true);
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

  const runCode = async () => {
    if (!code.trim()) {
      toast.error("Please enter some code to run");
      return;
    }

    setIsRunning(true);
    setLocalOutput("Running code...\n");

    try {
      const response = await axios.post('/api/run', {
        code,
        languageId: selectedLanguage.id,
        stdin: currentInput
      });

      if (response.data.stdout) {
        const result = response.data.stdout;
        setLocalOutput(result);
        
        // Update output in Firestore for other participants
        updateDoc(doc(db, 'rooms', roomId), {
          lastExecution: {
            output: result,
            executedBy: user?.uid,
            executedAt: new Date(),
            language: selectedLanguage.name
          }
        }).catch(console.error);
        
        toast.success("Code executed successfully!");
      } else if (response.data.stderr) {
        const errorResult = `Error: ${response.data.stderr}`;
        setLocalOutput(errorResult);
        toast.error("Code execution failed");
      } else if (response.data.compile_output) {
        const compileError = `Compilation Error: ${response.data.compile_output}`;
        setLocalOutput(compileError);
        toast.error("Compilation failed");
      } else {
        setLocalOutput("No output received");
        toast.error("No output received");
      }
    } catch (error: unknown) {
      console.error('Code execution error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to execute code";
      setLocalOutput(`Error: ${errorMessage}`);
      toast.error("Code execution failed");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-lg overflow-hidden" style={{ minHeight: 400, marginLeft: '-16px', paddingLeft: '0', paddingRight: '0' }}>
      {/* Header with status indicators */}
      <div className="bg-gray-50 border-b px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
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
              onClick={runCode} 
              disabled={isRunning || !isEditor}
              className="bg-green-600 hover:bg-green-700"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Code
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Code Editor - Full height, flush left and down */}
      <div className="flex-1 min-h-[400px]" style={{ padding: 0, margin: 0 }}>
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