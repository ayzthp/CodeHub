import Editor from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";

export function SharedEditor({ socket, roomId }: { socket: any, roomId: string }) {
  const editorRef = useRef<any>(null);
  const [code, setCode] = useState("// Start coding...");

  const handleChange = (value: string | undefined) => {
    setCode(value || "");
    socket.current.emit("code-change", { roomId, code: value });
  };

  useEffect(() => {
    socket.current.on("code-update", (newCode: string) => {
      setCode(newCode);
      if (editorRef.current) {
        editorRef.current.setValue(newCode);
      }
    });
    return () => {
      socket.current.off("code-update");
    };
  }, [socket, roomId]);

  return (
    <Editor
      height="100%"
      defaultLanguage="javascript"
      value={code}
      onChange={handleChange}
      onMount={(editor) => (editorRef.current = editor)}
    />
  );
} 