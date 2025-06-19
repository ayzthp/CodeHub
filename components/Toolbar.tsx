export default function Toolbar({ onClear }: { onClear: () => void }) {
  const exportAsImage = () => {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      const link = document.createElement("a");
      link.download = "whiteboard.png";
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div className="mb-4 flex gap-3">
      <button
        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
        onClick={onClear}
      >
        🗑️ Clear Board
      </button>
      <button
        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
        onClick={exportAsImage}
      >
        📥 Export PNG
      </button>
    </div>
  );
} 