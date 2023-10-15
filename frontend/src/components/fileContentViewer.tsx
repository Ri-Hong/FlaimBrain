// FileContentViewer.tsx
import React from 'react';

const FileContentViewer: React.FC<{ content?: string | null }> = ({ content }) => {
  return (
    <section className="file-content-viewer">
      <h2>file content</h2>
      <pre>{content}</pre>
    </section>
  );
};

export default FileContentViewer;
