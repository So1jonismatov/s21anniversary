import React from "react";

interface MessageProps {
  text: string;
}

const Message: React.FC<MessageProps> = ({ text }) => {
  return (
    <div className="p-5 border border-gray-200 rounded-lg my-5">
      <p className="font-sans text-white">{text}</p>
    </div>
  );
};

export default Message;
