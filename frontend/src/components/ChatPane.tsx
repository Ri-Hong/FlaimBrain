import React, { useState, useEffect } from 'react';
import './ChatPane.css';

interface ChatPaneProps {
  fileName: string;
}

interface MessageObject {
  _id: string;
  content: string;
  createdAt: string;
  documentName: string;
  user_id: {
    username: string;
  };
}

const ChatPane: React.FC<ChatPaneProps> = ({ fileName }) => {
  const [message, setMessage] = useState<string>('');
  const [responses, setResponses] = useState<{ sender: string, content: string }[]>([]);

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
          documentName: fileName,
        }),
      });
    } catch (error) {
      console.error('There was a problem with the save message operation:', error);
    }
  };

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();  // Prevent the form from being submitted the traditional way
    setResponses(prevResponses => (prevResponses ? [...prevResponses, { sender: 'user', content: message }] : []));
    saveMessage(message);
    setMessage('');  // Clear the input field

    console.log("the filename: " + fileName);
    
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

      setResponses(prevResponses => (prevResponses ? [...prevResponses, { sender: 'bot', content: message }] : []));
      saveMessage(reply);

    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };
  

  return (
    <div className="chat-pane">
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
      </div>
      <form className="input-area" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button className="basic-button" type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatPane;
