import { useState, useEffect, useRef } from 'react';
import { Interview } from '@shared/types';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useNavigate } from 'react-router-dom';

interface InterviewStepProps {
  profileName: string; // TODO: Get this from profile data
  onComplete: () => void;
  onBack?: () => void;
}

const InterviewStep = ({ profileName = 'Test Name' }: InterviewStepProps) => {
  const { onboardingState, setOnboardingState } = useOnboarding();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8347';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [interview?.messages]);

  // Initialize interview from context or start new one
  useEffect(() => {
    if (onboardingState?.interview) {
      // Use existing interview from context
      setInterview(onboardingState.interview);
    } else {
      // Start new interview
      startInterview();
    }
    
    // Cleanup function to abort any pending requests
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [onboardingState?.interview]);
  
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
      
      // Set the complete interview from the response
      setInterview(data.interview);
      
      // Update the context with the new interview
      if (onboardingState && setOnboardingState) {
        setOnboardingState({
          ...onboardingState,
          interview: data.interview
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }
      console.error('Failed to get initial message:', error);
      // Add error message to conversation
      setInterview({
        createdAt: new Date().toISOString(),
        messages: [{ 
          role: 'assistant', 
          content: 'Sorry, I encountered an error starting the interview. Please try again.' 
        }]
      });
    }
  }
  


  const startInterview = async () => {
    setIsLoading(true);
    await getFirstMessage();
    setIsLoading(false);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading || !interview) return;

    const userMessage = inputValue;
    setInputValue('');
    
    // Create updated interview with new user message
    const updatedInterview: Interview = {
      ...interview,
      messages: [...interview.messages, { role: 'user' as const, content: userMessage }]
    };
    setInterview(updatedInterview);
    setIsLoading(true);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`${API_URL}/api/interview/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          interview: updatedInterview
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Update with the complete interview from the response
      setInterview(data.interview);
      
      // Update the context with the updated interview
      if (onboardingState && setOnboardingState) {
        setOnboardingState({
          ...onboardingState,
          interview: data.interview
        });
      }
      
      // Check if interview is finished
      if (data.isComplete) {
        console.log('Interview completed');
        setIsInterviewComplete(true);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }
      console.error('Failed to send message:', error);
      // Add error message to conversation
      setInterview(prev => prev ? {
        ...prev,
        messages: [...prev.messages, { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error processing your message. Please try again.' 
        }]
      } : null);
    } finally {
      setIsLoading(false);
    }
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
            {interview?.messages.map((msg, index) => (
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
   
          <div className="flex gap-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isInterviewComplete ? "Interview completed" : "Type your response..."}
              className="flex-1 p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
              rows={2}
              disabled={isLoading || isInterviewComplete}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !inputValue.trim() || isInterviewComplete}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed disabled:opacity-50 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none"
            >
              {isInterviewComplete ? "Completed" : "Send"}
            </button>
          </div>
          
          {isInterviewComplete && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => navigate('/home')}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewStep;
