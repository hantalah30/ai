import React from "react";

interface LivePreviewProps {
  code: string;
  language: string;
}

const LivePreview: React.FC<LivePreviewProps> = ({ code, language }) => {
  const getOutput = () => {
    if (language === "html") {
      return (
        <iframe
          srcDoc={code}
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      );
    }
    // For other languages, you can add more sophisticated execution logic here.
    // For now, we'll just display the code itself.
    return (
      <pre>
        <code>{code}</code>
      </pre>
    );
  };

  return (
    <div className="live-preview">
      <h3>Live Preview</h3>
      <div className="preview-canvas">{getOutput()}</div>
    </div>
  );
};

export default LivePreview;
