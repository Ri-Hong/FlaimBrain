import React, { useState, useEffect, useCallback, useRef } from "react";
import FolderTree from 'react-folder-tree';
import "react-folder-tree/dist/style.css";

interface DocumentsProps {
  onFileClick: (content: string | null, fileName: string) => void;
}

//const Documents: React.FC = () => {
//const Documents = ({ onFileClick }: { onFileClick: (content: string | null) => void }) => {
const Documents: React.FC<DocumentsProps> = ({ onFileClick }) => {
  interface ITree {
    name: string;
    children?: ITree[]; // Children are optional and are of type ITree as well
  }

  interface IDocument {
    _id: string;
    name: string;
    parentId: string | null;
    children?: IDocument[];
    content: string;
  }

  const prevTreeRef = useRef<ITree | null>(null);
  const defaultTree: ITree = { name: "Loading...", children: [] };
  const [initialTree, setInitialTree] = useState<ITree | null>(null);
  const [nameIdMap, setNameIdMap] = useState<Record<string, string>>({});
  const [nameContentMap, setNameContentMap] = useState<Record<string, string>>({});
  //const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);

  // Populate the hashmap after documents are fetched
  const createNameIdMap = useCallback((documents: IDocument[]) => {
    const newNameIdMap: Record<string, string> = {};
    const newNameContentMap: Record<string, string> = {};
    documents.forEach(doc => {
      newNameIdMap[doc.name] = doc._id;
      newNameContentMap[doc.name] = doc.content;
    });
    setNameIdMap(newNameIdMap);
    setNameContentMap(newNameContentMap);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
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

        const documents: IDocument[] = await response.json();
        createNameIdMap(documents);
        const folders = documents.filter((doc: IDocument) => doc.parentId === null);
        const transformedFolders: ITree[] = folders.map((folder: IDocument) => ({
          name: folder.name,
          children: documents.filter((doc: IDocument) => doc.parentId === folder._id).map((doc: IDocument) => ({ name: doc.name })),
        }));
      
        setInitialTree({ name: "My Notebooks", children: transformedFolders });
      } catch (error) {
        console.error('An error occurred:', error);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this useEffect runs once when component mounts

  const findDeletedNode = (oldTree: ITree, newTree: ITree) => {
    const createMap = (node: ITree, map: Record<string, boolean> = {}) => {
      map[node.name] = true; // we only care about the name, not the whole node
      if (node.children) {
        node.children.forEach(child => createMap(child, map));
      }
      return map;
    };
  
    const oldMap = createMap(oldTree);
    const newMap = createMap(newTree);
    
    // Find nodes present in the old map but not in the new map
    for (const name in oldMap) {
      if (!(name in newMap)) {
        return name; // This is the deleted node.
      }
    }
  
    return null; // No nodes were deleted.
  };
  

  const deepClone = (obj:ITree) => JSON.parse(JSON.stringify(obj));

  const onTreeChange = async (newTree: ITree) => {
    console.log('Tree changed:', newTree);
    
    // We'll use a local variable to keep track of the previous tree before any changes were made.
    const oldTree = prevTreeRef.current;
    console.log("Old tree", JSON.stringify(oldTree));
    console.log("New tree", JSON.stringify(newTree));

    // Skip logic for initial render or if the tree is still loading
    if (!oldTree || newTree.name === "Loading...") {
      prevTreeRef.current = deepClone(newTree);
      return;
    }

    // Next, check if the old tree is not null, indicating this isn't the first render/update.
    if (oldTree) {
      const deletedNodeName = findDeletedNode(oldTree, newTree);

      if (deletedNodeName) {
        const deletedNodeId = nameIdMap[deletedNodeName];
        if (deletedNodeId) {
          try {
            const response = await fetch(`http://127.0.0.1:5000/documents/delete/${deletedNodeId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
            });

            if (!response.ok) {
              throw new Error('Network response was not ok');
            }

            console.log('Document deleted:', await response.json());
            // Handle any additional state updates or cleanup after deletion here
          } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
          }
        } else {
          console.error('Deleted node ID is undefined, probably running on the first render');
        }
      }
    }

    // Now that we're done handling the tree change, we update prevTreeRef to the new tree.
    prevTreeRef.current = deepClone(newTree);
  };
  

  const onNameClick = (opts: any) => {
    opts.defaultOnClick(); // What does defaultOnClick do - opens the edit buttons
    const { nodeData } = opts;
    console.log('Clicked on:', nodeData);
    console.log('nodaData type: ' + nodeData.type);
    if (nodeData.type === 'file') { // Not being detected, need to detect type
      console.log('Clicked on file:', nodeData.name);
    }
    // put content of file clicked into fileContentViewer 
    console.log("docID of file clicked: " + nameIdMap[nodeData.name]);
    console.log("doc contents: " + nameContentMap[nodeData.name]);
    const content = nameContentMap[nodeData.name];
    onFileClick(content, nodeData.name);
    //setSelectedFileContent(content);
  };

  return (
    <section className="file-structure">
      <h2>my files</h2>
      <FolderTree
        data={initialTree || defaultTree}
        showCheckbox={false}
        onChange={onTreeChange}
        onNameClick={onNameClick}
      />
      {/* Add file input for .txt files */}
    </section>
  );
};

export default Documents;
