import { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface InterviewStepProps {
  profileName: string; // TODO: Get this from profile data
  onComplete: () => void;
  onBack?: () => void;
}

const InterviewStep = ({ profileName = 'Test Name', onComplete, onBack }: InterviewStepProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8347';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start the interview automatically when component mounts
  useEffect(() => {
    startInterview();
    
    // Cleanup function to abort any pending requests
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  
  const getFirstMessage = async () => {
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await fetch(`${API_URL}/api/interview/initial`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: profileName
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Add the initial message as the first assistant message
      setMessages([{ role: 'assistant', content: data.message }]);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }
      console.error('Failed to get initial message:', error);
      // Add error message to conversation
      setMessages([{ 
        role: 'assistant', 
        content: 'Sorry, I encountered an error starting the interview. Please try again.' 
      }]);
    }
  }
  


  const startInterview = async () => {
    setIsLoading(true);
    await getFirstMessage();
    setIsLoading(false);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading || isComplete) return;

    const userMessage = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    // TODO: Implement sendMessage functionality
    // This will need to call the /api/claude endpoint with the conversation history
    console.log('Send message functionality not yet implemented');
    
    // For now, just simulate a response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Thanks for your message! The full conversation functionality will be implemented next.' 
      }]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-6">
      <div className="max-w-2xl mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 shadow-2xl p-6">
        <div className="flex flex-col h-[600px]">
          <h2 className="text-2xl font-medium text-white mb-6">Professional Interview</h2>
        
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 scrollbar-thin scrollbar-thumb-gray-600">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-100'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-700 text-gray-100 p-4 rounded-lg">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {isComplete ? (
          <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
            <p className="text-green-400 text-center">
              Interview completed successfully! ✨
            </p>
          </div>
        ) : (
          <div className="flex gap-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your response..."
              className="flex-1 p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
              rows={2}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
            >
              Send
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default InterviewStep;
