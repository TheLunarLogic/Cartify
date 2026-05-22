import React, { useState, useRef, useEffect } from 'react';
import { X, Send, ShoppingBag, ShoppingCart, Package, Gift } from 'lucide-react';
import { api } from '../services/api';

const Chatbot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! How can I help you today?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: 'user',
      content: inputMessage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const payload = {
        message: userMessage.content,
        username: "n@12.com"
      };
      console.log('[Chatbot] POST /chat', payload);
      const data = await api.chat(payload);
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.bot
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className={`fixed bottom-18 right-18 h-[60vh] w-[30vw] bg-white shadow-lg transform transition-all duration-500 ease-in-out z-50 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl ${
        isOpen ? 'translate-x-0 translate-y-0' : 'translate-x-[120%] translate-y-[120%]'
      }`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-50 overflow-hidden bg-gray-200 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl">
        <div className="grid grid-cols-4 gap-4 p-4">
          {[...Array(40)].map((_, i) => (
            <div key={i} className="flex items-center justify-center">
              {i % 4 === 0 && <ShoppingBag className="w-6 h-6 text-gray-300" />}
              {i % 4 === 1 && <ShoppingCart className="w-6 h-6 text-gray-300" />}
              {i % 4 === 2 && <Package className="w-6 h-6 text-gray-300" />}
              {i % 4 === 3 && <Gift className="w-6 h-6 text-gray-300" />}
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex justify-between items-center bg-gray-500 relative z-10 rounded-tl-2xl rounded-tr-2xl">
        <h2 className="text-lg font-semibold">Shopping Assistant</h2>
        <button
          onClick={onClose}
          className="text-gray-800 hover:text-black cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex flex-col h-[calc(100%-8rem)] overflow-y-auto p-4 bg-transparent relative z-10">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-black text-white rounded-br-none'
                  : 'bg-white text-black rounded-bl-none shadow-sm'
              }`}
            >
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-white text-black rounded-lg rounded-bl-none shadow-sm p-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form 
        onSubmit={handleSendMessage}
        className="absolute bottom-0 left-0 right-0 p-4 bg-gray-300 border-t border-gray-200 z-10 rounded-bl-2xl"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border border-gray-400 rounded-lg focus:outline-none focus:border-black"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className={`p-2 rounded-lg ${
              isLoading || !inputMessage.trim()
                ? 'bg-gray-100 text-gray-400'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chatbot;