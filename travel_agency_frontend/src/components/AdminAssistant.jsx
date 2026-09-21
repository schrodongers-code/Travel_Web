import React, { useState, useRef, useEffect } from 'react';
import { Terminal, X, Send, ShieldAlert } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AdminAssistant() {
  const [sessionId] = useState(() => crypto.randomUUID());
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'SYSTEM ONLINE. I am the internal Staff AI. How can I assist you with agency operations today?'
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newUserMsg = { id: Date.now(), type: 'user', text: input };
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');

    const tempId = Date.now() + 1;
    setMessages(prev => [...prev, { id: tempId, type: 'bot', text: 'Processing...' }]);

    try {
      const response = await fetch('https://travel-web-45r8.onrender.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newUserMsg.text, session_id: sessionId }),
      });

      if (!response.ok) throw new Error('Network error');

      const data = await response.json();
      setMessages(prev => prev.map(msg => msg.id === tempId ? { ...msg, text: data.response } : msg));
    } catch (error) {
      setMessages(prev => prev.map(msg => msg.id === tempId ? { ...msg, text: "Error connecting to AI Backend." } : msg));
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 bg-slate-900 text-emerald-400 p-4 rounded-full shadow-lg hover:bg-slate-800 border border-slate-700 transition-all duration-300 z-50 flex items-center justify-center ${
          isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100 hover:scale-105'
        }`}
      >
        <Terminal className="h-6 w-6" />
      </button>

      <div
        className={`fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] max-h-[80vh] bg-slate-900 rounded-2xl shadow-2xl flex flex-col z-50 border border-slate-700 overflow-hidden font-mono transition-all duration-300 origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100' : 'scale-50 opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-slate-950 text-emerald-400 p-4 flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-5 w-5 text-red-500" />
            <span className="font-bold text-sm tracking-widest">STAFF_AI_TERMINAL</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-grow p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
                msg.type === 'user'
                  ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-800/50'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                  p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />
                }}>
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center">
          <span className="text-emerald-500 mr-2">{'>'}</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter command..."
            className="flex-grow bg-transparent border-none text-emerald-400 focus:ring-0 text-sm outline-none placeholder-slate-600 font-mono"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="ml-2 text-emerald-500 hover:text-emerald-400 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </>
  );
}
