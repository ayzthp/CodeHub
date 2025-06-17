'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface InputOutputPanelProps {
  isEditor: boolean;
  selectedLanguage: string;
  code: string;
}

export default function InputOutputPanel({ 
  isEditor, 
  selectedLanguage, 
  code 
}: InputOutputPanelProps) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const runCode = async () => {
    if (!code.trim()) return;

    setIsRunning(true);
    setOutput("Running...");

    try {
      const response = await fetch("/api/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source_code: code,
          language_id: getLanguageId(selectedLanguage),
          stdin: input,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setOutput(result.output || "No output");
      } else {
        setOutput(`Error: ${result.error}`);
      }
    } catch {
      setOutput("Error: Failed to execute code");
    } finally {
      setIsRunning(false);
    }
  };

  const getLanguageId = (lang: string): number => {
    const languageMap: Record<string, number> = {
      javascript: 63,
      python: 71,
      java: 62,
      cpp: 54,
      c: 50,
    };
    return languageMap[lang] || 63;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Input/Output</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Input:</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-20 p-2 text-sm border rounded resize-none"
            placeholder="Enter input here..."
          />
        </div>
        <div>
          <label className="text-sm font-medium">Output:</label>
          <textarea
            value={output}
            readOnly
            className="w-full h-32 p-2 text-sm border rounded resize-none bg-gray-50"
            placeholder="Output will appear here..."
          />
        </div>
        <Button
          onClick={runCode}
          disabled={isRunning || !isEditor}
          className="w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Running...
            </>
          ) : (
            "Run Code"
          )}
        </Button>
      </CardContent>
    </Card>
  );
} 