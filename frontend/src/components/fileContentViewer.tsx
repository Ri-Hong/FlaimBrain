// FileContentViewer.tsx
import React from 'react';
import './fileContentViewer.css';

const FileContentViewer: React.FC<{ content?: string | null; fileName?: string }> = ({ content, fileName }) => {
  return (
    <section className="file-content-viewer">
      <h2>{fileName}</h2>
      <pre className="content-format">{content}</pre>
    </section>
  );
};

export default FileContentViewer;
