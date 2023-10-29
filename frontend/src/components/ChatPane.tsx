import React, { useState, useEffect } from 'react';
import './ChatPane.css';
import { BsTrash3Fill } from 'react-icons/bs';
import { PiPaperPlaneTiltFill } from 'react-icons/pi';


interface ChatPaneProps {
  fileName: string;
}

const ChatPane: React.FC<ChatPaneProps> = ({ fileName }) => {
  const [message, setMessage] = useState<string>('');
  const [responses, setResponses] = useState<{ sender: string, content: string | React.JSX.Element }[]>([]);

  const handleClearConversation = async () => {
    setResponses([]);  // Clear the responses state

    try {
        // Request to delete conversation from MongoDB
        const deleteResponse = await fetch(`http://127.0.0.1:5000/chatHistory/delete-conversation/` + fileName, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        });
    
        if (!deleteResponse.ok) {
            throw new Error('Network response was not ok ' + deleteResponse.statusText);
        }

        console.log('Conversation deleted from MongoDB');

        // Request to clear Langchain memory
        const clearMemoryResponse = await fetch(`http://127.0.0.1:5000/chat/clear-memory`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        });
    
        if (!clearMemoryResponse.ok) {
            throw new Error('Network response was not ok ' + clearMemoryResponse.statusText);
        }

        console.log('Langchain memory cleared');

    } catch (error) {
        console.error('There was a problem with the delete operation:', error);
    }
  };

  const getChatHistory = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/chatHistory/get-chat-history/` + fileName, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        }
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const responseData = await response.json();
      console.log("Response chat history", responseData);  // Log the response data to the console
  
      // Since responseData is an array, map over it directly
      const formattedResponses = responseData.map((message: any, index: number) => {
        const sender = index % 2 === 0 ? 'user' : 'bot';  // Alternate between 'user' and 'bot'
        return { sender, content: message.content };
      });
  
      setResponses(formattedResponses);
    
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };
  

  useEffect(() => {
    console.log('File changed to:', fileName);
    setResponses([]);  // Clear the messages
    getChatHistory();
  }, [fileName]);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [responses]);

  const saveMessage = async (messageObj: { sender: string, content: string | React.JSX.Element }) => {
    console.log('saveMessage called with:', messageObj);  // Add this line
    if (typeof messageObj.content !== 'string') return;
    try {
      await fetch(`http://127.0.0.1:5000/chatHistory/save-message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: messageObj.content,
          documentName: fileName,
        }),
      });
    } catch (error) {
      console.error('There was a problem with the save message operation:', error);
    }
  };
  

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    const userMessage = { sender: 'user', content: message };
    setResponses(prevResponses => [...prevResponses, userMessage]);
    saveMessage(userMessage);
    setMessage('');
    
    console.log("the filename: " + fileName);
    
    // Add a loading message
    const loadingMessage = { sender: 'bot', content: 
      <div className="typing-indicator">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div> };
    setResponses(prevResponses => [...prevResponses, loadingMessage]);
    
    try {
      const response = await fetch(`http://127.0.0.1:5000/chat/get-response`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: message,
        }),
      });
    
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
    
      const responseData = await response.json();
      const reply = responseData.response;
    
      // Remove the loading message and add the bot's response
      setResponses(prevResponses => {
        const updatedResponses = prevResponses.slice(0, -1);  // Remove the last message (loading message)
        updatedResponses.push({ sender: 'bot', content: reply });  // Add the bot's response
        return updatedResponses;
      });
      saveMessage({ sender: 'bot', content: reply });
    
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };
  

  return (
    <div className="chat-pane">
      <div className="action-bar">
        <button onClick={handleClearConversation} className="clear-button">
          <BsTrash3Fill size={24} />  {/* Render the BsTrash3Fill icon */}
        </button>      
      </div>

      <div className="messages">
        {responses && responses.map((response, index) => (
          <div key={index} className={`message ${response.sender}`}>
            <span className="messenger-name">
              {response.sender === 'bot' ? 'FlaimeBrain Bot' : 'You'}
            </span>
            <br /> {/* Add a line break */}
            {response.content}
          </div>
        ))}
        <div ref={messagesEndRef}></div> {/* This is the dummy div */}
      </div>
      <form className="input-area" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button className="basic-button" type="submit">
            <PiPaperPlaneTiltFill size={24} />
        </button>
      </form>
    </div>
  );
};

export default ChatPane;
