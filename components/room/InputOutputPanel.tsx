'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Loader2, Terminal, FileText } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface InputOutputPanelProps {
  roomId: string;
  roomData: any;
  isEditor: boolean;
  selectedLanguage: any;
  code: string;
}

export default function InputOutputPanel({ 
  roomId, 
  roomData, 
  isEditor, 
  selectedLanguage, 
  code 
}: InputOutputPanelProps) {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const runCode = async () => {
    if (!code.trim()) {
      toast.error("Please enter some code to run");
      return;
    }

    if (!isEditor) {
      toast.error("Only the current editor can run code");
      return;
    }

    setIsRunning(true);
    setOutput("Running code...");

    try {
      const response = await axios.post("/api/run", {
        code,
        languageId: selectedLanguage.id,
        stdin: input,
      });

      const result = response.data;
      let outputText = "";
      
      if (result.stdout) {
        outputText = result.stdout;
      } else if (result.stderr) {
        outputText = `Error: ${result.stderr}`;
      } else if (result.compile_output) {
        outputText = `Compilation Error: ${result.compile_output}`;
      } else {
        outputText = "No output";
      }

      setOutput(outputText);
      
      // Update output in Firestore for other users to see
      updateDoc(doc(db, 'rooms', roomId), {
        lastExecution: {
          output: outputText,
          executedBy: user?.displayName || user?.email || 'Anonymous',
          timestamp: new Date(),
          language: selectedLanguage.name
        }
      }).catch(console.error);

      toast.success("Code executed successfully!");
    } catch (error) {
      console.error('Code execution error:', error);
      setOutput("Error: Failed to execute code");
      toast.error("Failed to execute code");
    } finally {
      setIsRunning(false);
    }
  };

  // Listen for real-time output updates
  useEffect(() => {
    if (!roomId) return;

    const roomRef = doc(db, 'rooms', roomId);
    const unsubscribe = onSnapshot(roomRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.lastExecution && data.lastExecution.output) {
          setOutput(data.lastExecution.output);
        }
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  return (
    <div className="space-y-4">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Input</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter input for your code..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="h-32 resize-none"
            disabled={!isEditor}
          />
        </CardContent>
      </Card>

      {/* Output Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Terminal className="h-5 w-5 text-green-600" />
            <span>Output</span>
            <Button 
              onClick={runCode} 
              disabled={isRunning || !isEditor}
              size="sm"
              className="ml-auto bg-green-600 hover:bg-green-700"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Output will appear here..."
            value={output}
            readOnly
            className="h-32 resize-none bg-gray-50 font-mono text-sm"
          />
        </CardContent>
      </Card>
    </div>
  );
} 