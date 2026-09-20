import { useState, useRef, useEffect } from 'react'

import { MessageSquare, X, Send, Bot, User, Mic, MicOff } from 'lucide-react'

import ReactMarkdown from 'react-markdown'

import remarkGfm from 'remark-gfm'

export default function Chatbot({ onAiBooking }) {

  // Unique ID for the current chat conversation
  const [sessionId] = useState(() => crypto.randomUUID())

  const [isOpen, setIsOpen] = useState(false)

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hi! I am your AI travel assistant. You can ask me about flights, packages, or our travel policies like cancellations or visas!'
    }
  ])

  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [shouldSubmit, setShouldSubmit] = useState(false)
  const [showRobot, setShowRobot] = useState(true)

  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)

  // Robot peek-a-boo animation loop
  useEffect(() => {
    if (isOpen) {
      setShowRobot(false);
      return;
    }
    
    setShowRobot(true);
    const interval = setInterval(() => {
      setShowRobot(false);
      setTimeout(() => setShowRobot(true), 1000); // hide for 1 second
    }, 6000); // stay visible for 5 seconds (5s + 1s = 6s cycle)

    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setInput(currentTranscript);
      };
      
      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => {
        setIsListening(false);
        setShouldSubmit(true);
      };
      recognitionRef.current.onerror = (e) => {
        console.error('Speech recognition error', e.error);
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Your browser does not support voice input.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setInput('');
      recognitionRef.current.start();
    }
  };

  useEffect(() => {
    if (shouldSubmit) {
      setShouldSubmit(false);
      // Let React update the input state from the final onresult event first
      setTimeout(() => {
        const form = document.getElementById('chat-form');
        if (form) form.requestSubmit();
      }, 300);
    }
  }, [shouldSubmit]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e) => {

    e.preventDefault()

    if (!input.trim()) return

    // Add user message
    const newUserMsg = {
      id: Date.now(),
      type: 'user',
      text: input
    }

    setMessages((prev) => [...prev, newUserMsg])

    setInput('')

    // Add a temporary loading message
    const tempId = Date.now() + 1

    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        type: 'bot',
        text: 'Thinking...'
      }
    ])

    try {

      const response = await fetch(
        'https://travel-web-45r8.onrender.com/chat',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          // Send both message and session ID
          body: JSON.stringify({
            message: newUserMsg.text,
            session_id: sessionId
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()

      let finalResponse = data.response

      // Check for $$$BOOKING_INTENT$$$ payload
      const bookingMatch = finalResponse.match(
        /\$\$\$BOOKING_INTENT\$\$\$(.*?)\$\$\$BOOKING_INTENT\$\$\$/s
      )

      if (bookingMatch) {

        try {

          const bookingData = JSON.parse(
            bookingMatch[1].trim()
          )

          if (onAiBooking) {
            onAiBooking(bookingData)
          }

          // Remove the payload from the visible message
          finalResponse = finalResponse.replace(
            /\$\$\$BOOKING_INTENT\$\$\$(.*?)\$\$\$BOOKING_INTENT\$\$\$/s,
            ''
          ).trim()

          if (!finalResponse) {
            finalResponse =
              "Great! I've opened the secure billing window for you to complete your payment."
          }

        } catch (e) {

          console.error(
            "Failed to parse booking intent",
            e
          )

        }
      }

      // Replace loading message with real response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? { ...msg, text: finalResponse }
            : msg
        )
      )

    } catch (error) {

      console.error(
        'Error fetching chat response:',
        error
      )

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                ...msg,
                text: "I'm sorry, I couldn't connect to my AI brain. Please make sure the backend server is running."
              }
            : msg
        )
      )
    }
  }

  return (
    <>
      {/* Chat button and Robot GIF wrapper */}
      <div
        className={`fixed bottom-6 right-6 z-50 flex flex-col items-end transition-all duration-300 ${
          isOpen
            ? 'scale-0 opacity-0 pointer-events-none'
            : 'scale-100 opacity-100'
        }`}
      >
        {/* The Robot GIF */}
        <img 
          src="/robot.gif" 
          alt="AI Assistant" 
          className={`w-64 h-64 object-contain -mb-16 translate-x-6 translate-y-6 cursor-pointer transition-all duration-500 origin-bottom-right ${
            showRobot ? 'scale-100 opacity-100 hover:scale-110' : 'scale-0 opacity-0'
          }`}
          onClick={() => setIsOpen(true)}
        />
        
        <button
          onClick={() => setIsOpen(true)}
          className="bg-violet-600 text-white p-4 rounded-full shadow-lg hover:bg-violet-700 transition-all duration-300 flex items-center justify-center hover:scale-105"
          aria-label="Open chat"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      </div>


      {/* Chat window */}

      <div
        className={`fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-slate-200 overflow-hidden font-sans transition-all duration-300 origin-bottom-right ${
          isOpen
            ? 'scale-100 opacity-100'
            : 'scale-50 opacity-0 pointer-events-none'
        }`}
      >

        {/* Header */}

        <div className="bg-violet-600 text-white p-4 flex justify-between items-center">

          <div className="flex items-center space-x-2">

            <Bot className="h-5 w-5" />

            <span className="font-semibold">
              AI Travel Assistant
            </span>

          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="text-violet-100 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

        </div>


        {/* Messages */}

        <div className="flex-grow p-4 overflow-y-auto bg-slate-50 space-y-4">

          {messages.map((msg) => (

            <div
              key={msg.id}
              className={`flex ${
                msg.type === 'user'
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >

              <div
                className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                  msg.type === 'user'
                    ? 'bg-violet-600 text-white rounded-br-none whitespace-pre-wrap'
                    : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-bl-none overflow-x-auto'
                }`}
              >

                {msg.type === 'user' ? (

                  msg.text

                ) : (

                  <div className="markdown-content">

                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{

                        table: ({ node, ...props }) => (
                          <div className="overflow-x-auto my-2 rounded-lg border border-slate-200">
                            <table
                              className="w-full text-left text-xs"
                              {...props}
                            />
                          </div>
                        ),

                        thead: ({ node, ...props }) => (
                          <thead
                            className="bg-slate-50 text-slate-700"
                            {...props}
                          />
                        ),

                        th: ({ node, ...props }) => (
                          <th
                            className="px-3 py-2 font-semibold border-b border-slate-200"
                            {...props}
                          />
                        ),

                        td: ({ node, ...props }) => (
                          <td
                            className="px-3 py-2 border-b border-slate-100"
                            {...props}
                          />
                        ),

                        p: ({ node, ...props }) => (
                          <p
                            className="mb-2 last:mb-0"
                            {...props}
                          />
                        ),

                        ul: ({ node, ...props }) => (
                          <ul
                            className="list-disc pl-4 mb-2"
                            {...props}
                          />
                        ),

                        ol: ({ node, ...props }) => (
                          <ol
                            className="list-decimal pl-4 mb-2"
                            {...props}
                          />
                        ),

                        li: ({ node, ...props }) => (
                          <li
                            className="mb-1"
                            {...props}
                          />
                        ),

                        a: ({ node, ...props }) => (
                          <a
                            className="text-violet-600 hover:underline font-medium"
                            target="_blank"
                            rel="noopener noreferrer"
                            {...props}
                          />
                        ),

                        strong: ({ node, ...props }) => (
                          <strong
                            className="font-bold text-slate-900"
                            {...props}
                          />
                        ),

                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>

                  </div>

                )}

              </div>

            </div>

          ))}

          <div ref={messagesEndRef} />

        </div>


        {/* Input area */}

        <form
          id="chat-form"
          onSubmit={handleSend}
          className="p-3 bg-white border-t border-slate-200 flex items-center"
        >

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening..." : "Ask about flights or policies..."}
            className={`flex-grow border-transparent focus:bg-white focus:border-violet-500 rounded-full px-4 py-2 text-sm outline-none transition-all ${isListening ? "ring-2 ring-violet-400 bg-violet-50" : "bg-slate-100 focus:ring-2 focus:ring-violet-200"}`}
          />

          <button
            type="button"
            onClick={toggleListening}
            className={`ml-2 p-2 rounded-full transition-colors flex items-center justify-center ${
              isListening 
                ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" 
                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
            }`}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>

          <button
            type="submit"
            disabled={!input.trim()}
            className="ml-2 bg-violet-600 text-white p-2 rounded-full hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <Send className="h-4 w-4" />
          </button>

        </form>

      </div>
    </>
  )
}