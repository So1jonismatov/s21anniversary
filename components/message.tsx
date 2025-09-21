import React from 'react';
import './message.css';

interface MessageProps {
  text: string;
}

const Message: React.FC<MessageProps> = ({ text }) => {
  return (
    <div className="message-container">
      <p className="message-text">{text}</p>
    </div>
  );
};

export default Message;
