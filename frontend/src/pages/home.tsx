// HomePage.tsx
import React, { useState } from 'react';
import './home.css';
import Documents from '../components/documents';
import FileContentViewer from '../components/fileContentViewer'; // Adjust the import
import Modules from '../components/modules'; // Adjust the import
import ChatPane from '../components/ChatPane';

const HomePage: React.FC = () => {
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);

  // const handleFileSelect = (content: string) => {
  //   setSelectedFileContent(content);
  // };

  const handleFileContentUpdate = (content: string | null) => {
    setSelectedFileContent(content);
  };

  return (
    <div className="home-container">
      <aside className="sidebar">
        <Documents onFileClick={handleFileContentUpdate}/>
        <section className="modules">
          <h2>modules</h2>
          <Modules></Modules>
        </section>
      </aside>
      <section className="file-content">
        <FileContentViewer content={selectedFileContent} />
      </section>
      <section className="chat-interface">
        <ChatPane/>
      </section>
    </div>
  );
};

export default HomePage;
