import React, { useState, useEffect } from 'react';
import './ChatPane.css';

import axios from 'axios';

const ChatPane = () => {
  const [message, setMessage] = useState<string>('');
  const [responses, setResponses] = useState<{ sender: string, content: string }[]>([]);

  const [currentOpenFileName, setCurrentOpenFileName] = useState<string>('sampleOpen.txt');

  const getChatHistory = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/chatHistory/get-chat-history/` + currentOpenFileName, {
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
  
      setResponses(responseData.chatHistory);
    
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  useEffect(() => {
    console.log('File changed to:', currentOpenFileName);
    getChatHistory();
  }, [currentOpenFileName]);


  const saveMessage = async (content: string) => {
    try {
      await fetch(`http://127.0.0.1:5000/chatHistory/save-message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content,
          documentName: currentOpenFileName,
        }),
      });
    } catch (error) {
      console.error('There was a problem with the save message operation:', error);
    }
  };

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();  // Prevent the form from being submitted the traditional way
    setResponses(prevResponses => [...prevResponses, { sender: 'user', content: message }]);
    saveMessage(message);
    setMessage('');  // Clear the input field

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
  
      setResponses(prevResponses => [...prevResponses, { sender: 'bot', content: reply }]);
      saveMessage(reply);

    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };
  

  return (
    <div className="chat-pane">
      <div className="messages">
        {responses.map((response, index) => (
          <div key={index} className={`message ${response.sender}`}>
            {response.content}
          </div>
        ))}
      </div>
      <form className="input-area" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatPane;
