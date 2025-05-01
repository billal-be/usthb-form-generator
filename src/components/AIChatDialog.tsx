"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function AIChatDialog() {
  const [messages, setMessages] = useState([
    { sender: 'AI', text: 'Hello! Tell me what type of form you need.' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    setMessages([...messages, { sender: 'User', text: input }]);
    setInput('');

    // AI integration will be added here later
  };

  return (
    <div className="border rounded-lg p-4 w-full  mx-auto">
      {/* Display messages */}
      <div className="space-y-2 mb-4 h-64 overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.sender === 'AI' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`p-3 rounded-lg max-w-xs break-words ${msg.sender === 'AI' ? 'bg-gray-100 text-left' : 'bg-blue-100 text-right'
                }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Text input area */}
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message here..."
      />
      <Button
        onClick={handleSend}
        className="mt-2 bg-blue-600 hover:bg-blue-700 w-full"
      >
        Send
      </Button>
    </div>
  );
}