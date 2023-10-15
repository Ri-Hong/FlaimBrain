// HomePage.tsx
import React, { useState } from 'react';
import './home.css';
import Documents from '../components/documents';
import FileContentViewer from '../components/fileContentViewer'; // Adjust the import
import Modules from '../components/modules'; // Adjust the import
import ChatPane from '../components/ChatPane';


const HomePage: React.FC = () => {
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | undefined>(undefined);
  const [refreshTree, setRefreshTree] = useState<boolean>(false);

  const handleFileContentUpdate = (content: string | null, fileName: string) => {
    setSelectedFileContent(content);
    setSelectedFileName(fileName);
  };

  const handleFileUpload = (content: string | null, fileName: string) => {
    setSelectedFileContent(content);
    setSelectedFileName(fileName);
    setRefreshTree(true); // Set the refresh state
  };

  const handleTreeRefreshed = () => {
    setRefreshTree(false); // Reset the refresh state after it's done
  };

  return (
    <div className="home-container">
      <aside className="sidebar">
        <Documents onFileClick={handleFileContentUpdate} onRefreshed={handleTreeRefreshed} refreshTree={refreshTree} />
        <section className="modules">
          <h2>Modules</h2>
          <Modules onFileUpload={handleFileUpload} />
        </section>
      </aside>
      <section className="file-content">
        <FileContentViewer content={selectedFileContent} fileName={selectedFileName} />
      </section>
      <section className="chat-interface">
        <ChatPane fileName={selectedFileName || ''}/>
      </section>
    </div>
  );
};

export default HomePage;
