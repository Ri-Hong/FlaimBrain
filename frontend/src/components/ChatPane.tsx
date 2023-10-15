import React, { useState } from 'react';
import './ChatPane.css';

import axios from 'axios';

const ChatPane = () => {
  const [message, setMessage] = useState<string>('');
  const [responses, setResponses] = useState<string[]>([]);  // Explicit type definition here

  const handleSendMessage = async () => {
    // Call LangChain to process the message
    const langChainResponse = await axios.post('https://langchain-api-url.com/process', {
      text: message,
      // other necessary parameters
    });

    // Assume LangChain returns a processed message to send to Cohere
    const processedMessage = langChainResponse.data.processedMessage;

    // Now send the processed message to Cohere for further processing
    const cohereResponse = await axios.post('https://cohere-api-url.com/summarize', {
      text: processedMessage,
      // other necessary parameters
    });

    // Assume Cohere returns a summary as a response
    const summary = cohereResponse.data.summary;

    // Update the chat with the response
    setResponses(prevResponses => [...prevResponses, summary]);
  };

  return (
    <div className="chat-pane">
      <div className="messages">
        {responses.map((response, index) => (
          <div key={index} className="message">
            {response}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatPane;
