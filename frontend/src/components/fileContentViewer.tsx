// FileContentViewer.tsx
import React from 'react';

const FileContentViewer: React.FC<{ content: string }> = ({ content }) => {
  return (
    <section className="file-content-viewer">
      <h2>File Content</h2>
      <div>{content}</div>
    </section>
  );
};

export default FileContentViewer;
