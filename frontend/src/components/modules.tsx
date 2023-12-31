import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-modal';
import './modules.css';
import { FolderOpenIcon, PlusCircleIcon, DocumentPlusIcon, FireIcon, DocumentMagnifyingGlassIcon, ArrowLeftOnRectangleIcon, EyeIcon, ArrowUpOnSquareIcon, ArrowUpOnSquareStackIcon } from '@heroicons/react/24/solid';
import Alert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';

// Make sure to bind modal to your app element (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#root');

interface ModulesProps {
  onFileUpload: (content: string | null, fileName: string) => void;
}


const Modules: React.FC<ModulesProps> = ({ onFileUpload }) => {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);

  const [folders, setFolders] = useState<{id: string, name: string}[]>([]);
  const selectedFolder = folders.find(folder => folder.id === selectedNotebookId);
  const selectedFolderName = selectedFolder ? selectedFolder.name : 'Unknown'; // Fallback in case the ID is not found  

  const [showAlert, setShowAlert] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

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
      createDocument(null, null, folderName, 'folder', null); 
    }
  };

  const createNewNote = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("CREATING NEW NOTE");
    const file = event.target.files?.[0]; // Get the first file from the FileList object, if present
    
    if (file) {
      const fileType = file.type;

      if (fileType === 'text/plain' || fileType == 'application/pdf' || fileType === 'image/png' || fileType === 'image/jpeg') {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const text = e.target?.result as string; // This is your file's text content
          const selectedFolder = folders.find(folder => folder.id === selectedNotebookId);
          const selectedFolderName = selectedFolder ? selectedFolder.name : 'Unknown'; // Provide a fallback in case the ID is not found
    
          console.log('Creating a new note:', file.name, 'in notebook:', selectedFolderName, text, file, file.name);

          // console.log('Creating a new note:', file.name, 'in notebook:', selectedFolderName);
          // Call your function to handle the file content
          createDocument(text, file, file.name, 'file', selectedNotebookId as string); // Passing the file content and other details to your function
        };
        reader.readAsText(file); // Read the file's content as text
      }
      else if (fileType === 'image/png' || fileType === 'image/jpeg') {
        console.log("Runs OCR")
        handleButtonClick();
      } else {
        // Unsupported file type
        alert(`Unsupported file type: ${fileType}`);

      }
    }
  };
  
  const createDocument = async (fileContent: string | null, file: File | null, fileName: string, fileOrFolder: string, parentId: string | null) => {
    try {
      // Create a FormData object
      const formData = new FormData();
      if (file !== null) {
        formData.append('file', file);  // Append the file only if it's not null
      }
      formData.append('fileName', fileName);
      formData.append('fileOrFolder', fileOrFolder);
      if (parentId !== null) {
        formData.append('parentId', parentId);
      }

      const response = await fetch('http://127.0.0.1:5000/documents/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // if using token-based auth
        },
        body: formData,  // Use the FormData object as the request body
      });
  
      if (!response.ok) {
        console.log('Error: Failed to create document');
        return;
      }
  
      // Process the response
      const responseData = await response.json();
      console.log('Document created:', responseData);
      onFileUpload(fileContent, fileName); // This is the callback to notify HomePage

      setShowAlert(true);
      renderDocCreation();
      console.log("Alert message sent.")
      closeModal(); // Close the modal
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
        <h2>Select a notebook</h2>
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
          <h2>Upload a file to: {selectedFolderName}</h2>
          <label htmlFor="file-upload">
            <DocumentPlusIcon className="large-icon"/>
            Browse Files
          </label>
          <input id="file-upload" type="file" accept=".txt, .pdf, .png, .jpg" style={{display:'none'}} onChange={createNewNote} />
        </div>
        <div className="button-container-bottom-right">
          <button className="cancel-button" onClick={closeModal}>Cancel</button>
        </div>
      </div>
    );
  };

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
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // if using token-based authentication
        },
        body: imageData,
      });

      const text = await response.text();
      alert(text);
      const selectedFolder = folders.find(folder => folder.id === selectedNotebookId);
      const selectedFolderName = selectedFolder ? selectedFolder.name : 'Unknown'; 
      console.log('Creating a new note:', file.name, 'in notebook:', selectedFolderName, text, file, file.name);
      // Call your function to handle the file content
      createDocument(text as string, file, file.name, 'file', selectedNotebookId as string);
    } 
    catch (error) {
      alert("Error occurred while fetching OCR data.");
      console.error("There was an error with the OCR request:", error);
    }
  };
  
  const sendToChat = (moduleAction: string) => {
    // send to chat interface after user clicks module 
    console.log("Sending to chat: " + moduleAction);
  };


  return (
    <div>
      {/*<button className="basic-button" onClick={openModal}>Upload File</button>*/}
      <div className="button-container">
        <button className="invisible-button2" onClick={openModal}>
          <label className="inline-label2">
            <ArrowUpOnSquareStackIcon className="large-icon"/>
            Upload New File
          </label>
        </button>
        <button className="invisible-button2" onClick={openModal}>
          <label className="inline-label2">
          <EyeIcon className="large-icon"/>
            Choose OCR File
          </label>
        </button>
        {/*<button className="basic-button" onClick={handleButtonClick}>Get OCR Text</button>*/}
        {/* <button className="invisible-button2">
        <label className="inline-label2" htmlFor="file-upload2">
            <EyeIcon className="large-icon"/>
            Choose OCR File
          </label>
          <input id="file-upload2" type="file" style={{display:'none'}} onChange={openModal} ref={fileInputRef} /> 

          <input id="file-upload2" type="file" style={{display:'none'}} onChange={createNewNote} ref={fileInputRef} /> 
        </button> */}
      </div>
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

      <div>
        <ArrowLeftOnRectangleIcon className="logout-icon" onClick={handleLogout}/>
      </div> 

    </div>
  );
};

export default Modules;
