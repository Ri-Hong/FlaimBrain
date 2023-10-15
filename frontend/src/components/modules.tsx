import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-modal';

// Make sure to bind modal to your app element (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#root');

const Modules: React.FC = () => {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);

  const [folders, setFolders] = useState<{id: string, name: string}[]>([]);
  const selectedFolder = folders.find(folder => folder.id === selectedNotebookId);
  const selectedFolderName = selectedFolder ? selectedFolder.name : 'Unknown'; // Fallback in case the ID is not found  


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
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };
  

  const renderNotebookSelection = () => {
    return (
      <div>
        <h2>Select a Notebook</h2>
        {folders.map(folder => (
          <button key={folder.id} onClick={() => handleNotebookSelection(folder.id)}>
            {folder.name}
          </button>
        ))}
        <button onClick={createNewNotebook}>
          Create New Notebook
        </button>
      </div>
    );
  };

  const renderFileUpload = () => {
    // Check if a notebook is selected
    if (!selectedNotebookId) return null;

    return (
      <div>
        <h2>Upload a file to {selectedFolderName}</h2>
        
        <input type="file" accept=".txt" onChange={createNewNote} />

      </div>
    );
  };

  // const handleButtonClick = async () => {
  //   try {
  //     const response = await fetch("http://127.0.0.1:5000/ocr/ocr", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     });

  //     const text = await response.text();
  //     alert(text);
  //   } 
  //   catch (error) {
  //     alert("Error occurred while fetching OCR data.");
  //     console.error("There was an error with the OCR request:", error);
  //   }
  // }
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = async () => {
    try {
      if (!fileInputRef.current?.files?.length) {
        alert('Please select an image first.');
        return;
      }

      const file = fileInputRef.current.files[0];
      const imageData = new FormData();
      imageData.append('image', file);

      const response = await fetch("http://127.0.0.1:5000/ocr/ocr", {
        method: "POST",
        body: imageData,
      });

      const text = await response.text();
      alert(text);
    } catch (error) {
      alert("Error occurred while fetching OCR data.");
      console.error("There was an error with the OCR request:", error);
    }
  };
  
  return (
    <div>
      <button onClick={openModal}>Upload File</button>
      <input type="file" ref={fileInputRef} /> 
      <button onClick={handleButtonClick}>Get OCR Text</button>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="File Upload Modal"
        // Other modal options as needed
      >
        {!selectedNotebookId ? renderNotebookSelection() : renderFileUpload()}
      </Modal>
    </div>
  );
};

export default Modules;
