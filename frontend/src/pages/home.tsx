// HomePage.tsx
import React, { useState } from 'react';
import './home.css';
import Documents from '../components/documents';
import FileContentViewer from '../components/fileContentViewer'; // Adjust the import
import Modules from '../components/modules'; // Adjust the import

const HomePage: React.FC = () => {
  const [selectedFileContent, setSelectedFileContent] = useState('');

  const handleFileSelect = (content: string) => {
    setSelectedFileContent(content);
  };

  return (
    <div className="home-container">
      <aside className="sidebar">
        <Documents/>
        <section className="modules">
          <h2>modules</h2>
          <Modules></Modules>
        </section>
      </aside>
      <section className="file-content">
        <FileContentViewer content={selectedFileContent} />
      </section>
      <section className="chat-interface">
      <h2>chat interface</h2>
      </section>
    </div>
  );
};

export default HomePage;
