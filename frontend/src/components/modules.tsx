import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-modal';
import './modules.css';
import { FolderOpenIcon, PlusCircleIcon, DocumentPlusIcon, FireIcon } from '@heroicons/react/24/solid';
import Alert from '@mui/material/Alert';


// Make sure to bind modal to your app element (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#root');

const Modules: React.FC = () => {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);

  const [folders, setFolders] = useState<{id: string, name: string}[]>([]);
  const selectedFolder = folders.find(folder => folder.id === selectedNotebookId);
  const selectedFolderName = selectedFolder ? selectedFolder.name : 'Unknown'; // Fallback in case the ID is not found  

  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    retrieveFolders();
  }, []);

  const retrieveFolders = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/documents/get', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // if using token-based authentication
        },
      });

      if (!response.ok) {
        console.log('Error: Failed to retrieve documents');
        return;
      }

      const documents = await response.json();
      const folderData = documents
        .filter((doc: any) => doc.parentId === null)
        .map((folder: any) => ({ id: folder._id, name: folder.name }));

        setFolders(folderData);
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  function openModal() {
    setIsOpen(true);
  }

  function closeModal(){
    setIsOpen(false);
    setSelectedNotebookId(null); // Reset selection on close
  }

  const handleNotebookSelection = (notebook: string) => {
    setSelectedNotebookId(notebook); // Set the selected notebook
    // Here, you might want to transition to the file upload step
  };

  const createNewNotebook = () => {
    const folderName = prompt('Please enter the name for the new notebook:');
    if (folderName) {
      // Call your API to create the notebook, or any other logic you need
      console.log('Creating a new notebook:', folderName);
      createDocument('', folderName, 'folder', null); // Passing the folder name to your function
    }
  };

  const createNewNote = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Get the first file from the FileList object, if present
  
    if (file) {
      const reader = new FileReader();
  
      reader.onload = async (e) => {
        const text = e.target?.result as string; // This is your file's text content
  
        const selectedFolder = folders.find(folder => folder.id === selectedNotebookId);
        const selectedFolderName = selectedFolder ? selectedFolder.name : 'Unknown'; // Provide a fallback in case the ID is not found
  
        console.log('Creating a new note:', file.name, 'in notebook:', selectedFolderName);
  
        // Call your function to handle the file content
        createDocument(text, file.name, 'file', selectedNotebookId); // Passing the file content and other details to your function
      };
  
      reader.readAsText(file); // Read the file's content as text
    }
  };
  
  

  const createDocument = async (documentContent: string, fileName: string, fileType: string, parentId: string | null) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/documents/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // if using token-based auth
        },
        body: JSON.stringify({
          name: fileName,
          content: documentContent,
          type: fileType,
          parentId: parentId // Use the passed parentId
        }), 
      });
  
      if (!response.ok) {
        console.log('Error: Failed to create document');
        return;
      }
  
      const data = await response.json();
      console.log('Document created:', data);
      setShowAlert(true);
      renderDocCreation();
      console.log("Alert message sent.")
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  const renderDocCreation = () => {
    return (
      <div>
          <Alert severity="success">Successfully created</Alert>
      </div>
    );
  };

  const renderNotebookSelection = () => {
    return (
      <div>
        <h2>select a notebook</h2>
        <div className="button-container">
          {folders.map(folder => (
            <button className="invisible-button" key={folder.id} onClick={() => handleNotebookSelection(folder.id)}>
              <FolderOpenIcon className="large-icon"/>
              {folder.name}
            </button>
          ))}
          <button className="invisible-button" onClick={createNewNotebook}> 
            <PlusCircleIcon className="large-icon"/>
            New Notebook
          </button>
        </div>
        <div className="button-container-bottom-right">
          <button className="cancel-button" onClick={closeModal}>Cancel</button>
        </div>
      </div>
    );
  };

  const renderFileUpload = () => {
    // Check if a notebook is selected
    if (!selectedNotebookId) return null;

    return (
      <div>
        <div>
          <h2>upload a file to: {selectedFolderName}</h2>
          <label htmlFor="file-upload">
            <DocumentPlusIcon className="large-icon"/>
            Browse Files
          </label>
          <input id="file-upload" type="file" accept=".txt" style={{display:'none'}} onChange={createNewNote} />
        </div>
        <div className="button-container-bottom-right">
          <button className="cancel-button" onClick={closeModal}>Cancel</button>
        </div>
      </div>
    );
  };

  const sendToChat = (moduleAction: string) => {
    // send to chat interface after user clicks module 
    console.log("Sending to chat: " + moduleAction);
  };

  return (
    <div>
      <button className="basic-button" onClick={openModal}>Upload File</button>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="File Upload Modal"
        overlayClassName={"overlay"}
        className={"basic-modal"}
      >
        {!selectedNotebookId ? renderNotebookSelection() : renderFileUpload()}
      </Modal>
      <div className="module-container">
        <div className="inline-container"> 
          <FireIcon className="small-icon"/>
          <span className="invisible-button-label" onClick={() => sendToChat("summarize")}>Summarize</span>
        </div>
        <div className="inline-container"> 
          <FireIcon className="small-icon"/>
          <span className="invisible-button-label" onClick={() => sendToChat("flashcards")}>Flashcards</span>
        </div>
        <div className="inline-container"> 
          <FireIcon className="small-icon"/>
          <span className="invisible-button-label" onClick={() => sendToChat("study guide")}>Create a study guide</span>
        </div>
        <div className="inline-container"> 
          <FireIcon className="small-icon"/>
          <span className="invisible-button-label" onClick={() => sendToChat("mock assessments")}>Create a mock assessment</span>
        </div>
      </div>

    </div>
  );
};

export default Modules;
