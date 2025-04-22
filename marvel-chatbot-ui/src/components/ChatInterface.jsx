import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSend, FiChevronLeft, FiPlus, FiTrash2, FiMenu, FiX } from 'react-icons/fi';

export default function ChatInterface() {
  const { hero } = useParams();
  const [heroData, setHeroData] = useState(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch hero data
  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const heroes = {
          'iron-man': {
            name: 'Iron Man',
            color: 'from-yellow-500 to-red-600',
            image: '/heroes/iron-man.png'
          },
          'spider-man': {
            name: 'Spider-Man',
            color: 'from-blue-600 to-red-600',
            image: '/heroes/spider-man.png'
          },
          'captain-america': {
            name: 'Captain America',
            color: 'from-blue-600 to-red-500',
            image: '/heroes/captain-america.png'
          },
          'thor': {
            name: 'Thor',
            color: 'from-blue-500 to-gray-300',
            image: '/heroes/thor.png'
          },
          'black-widow': {
            name: 'Black Widow',
            color: 'from-red-700 to-black',
            image: '/heroes/black-widow.png'
          },
          'hulk': {
            name: 'Hulk',
            color: 'from-green-500 to-green-800',
            image: '/heroes/hulk.png'
          },
          'doctor-strange': {
            name: 'Doctor Strange',
            color: 'from-blue-400 to-purple-700',
            image: '/heroes/doctor-strange.png'
          },
          'scarlet-witch': {
            name: 'Scarlet Witch',
            color: 'from-red-600 to-purple-700',
            image: '/heroes/scarlet-witch.png'
          }
        };

        if (heroes[hero]) {
          setHeroData(heroes[hero]);
        } else {
          navigate('/heroes');
        }
      } catch (err) {
        console.error('Failed to fetch hero data', err);
      }
    };

    fetchHeroData();
  }, [hero, navigate]);

  // Load conversations from local storage
  useEffect(() => {
    try {
      const savedConversations = localStorage.getItem(`marvel-chat-${hero}-conversations`);
      if (savedConversations) {
        const parsedConversations = JSON.parse(savedConversations);
        setConversations(parsedConversations);
        
        if (parsedConversations.length > 0) {
          const mostRecent = parsedConversations[0];
          setCurrentConversationId(mostRecent.id);
          setMessages(mostRecent.messages);
        } else {
          createNewConversation();
        }
      } else {
        createNewConversation();
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
      createNewConversation();
    }
  }, [hero]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createNewConversation = () => {
    const newConversationId = Date.now().toString();
    const newConversation = {
      id: newConversationId,
      title: `New Chat`,
      timestamp: new Date().toISOString(),
      messages: []
    };
    
    setCurrentConversationId(newConversationId);
    setMessages([]);
    setConversations(prev => [newConversation, ...prev]);
    
    setTimeout(() => {
      saveConversationsToLocalStorage([newConversation, ...conversations]);
    }, 0);
  };

  const loadConversation = (conversationId) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setCurrentConversationId(conversationId);
      setMessages(conversation.messages);
    }
  };

  const deleteConversation = (e, conversationId) => {
    e.stopPropagation();
    
    const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
    setConversations(updatedConversations);
    saveConversationsToLocalStorage(updatedConversations);
    
    if (currentConversationId === conversationId) {
      if (updatedConversations.length > 0) {
        loadConversation(updatedConversations[0].id);
      } else {
        createNewConversation();
      }
    }
  };

  const saveConversationsToLocalStorage = (updatedConversations) => {
    localStorage.setItem(`marvel-chat-${hero}-conversations`, JSON.stringify(updatedConversations));
  };

  const updateConversationTitle = (message) => {
    if (currentConversationId) {
      const updatedConversations = conversations.map(conv => {
        if (conv.id === currentConversationId && conv.title === 'New Chat') {
          const title = message.length > 20 ? `${message.substring(0, 20)}...` : message;
          return { ...conv, title };
        }
        return conv;
      });
      
      setConversations(updatedConversations);
      saveConversationsToLocalStorage(updatedConversations);
    }
  };

  const updateConversationMessages = (updatedMessages) => {
    const updatedConversations = conversations.map(conv => {
      if (conv.id === currentConversationId) {
        return { ...conv, messages: updatedMessages };
      }
      return conv;
    });
    
    setConversations(updatedConversations);
    saveConversationsToLocalStorage(updatedConversations);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    const updatedMessages = [
      ...messages,
      { role: 'user', content: userMessage }
    ];
    
    setMessages(updatedMessages);
    setIsLoading(true);
    
    if (messages.length === 0) {
      updateConversationTitle(userMessage);
    }
    
    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('marvelChatToken')}`
        },
        body: JSON.stringify({
          hero: hero,
          message: userMessage,
          conversation_history: updatedMessages
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      
      const finalMessages = [
        ...updatedMessages,
        { role: 'assistant', content: data.reply }
      ];
      
      setMessages(finalMessages);
      updateConversationMessages(finalMessages);
    } catch (err) {
      console.error('Error sending message', err);
      const errorMessages = [
        ...updatedMessages,
        { role: 'assistant', content: "Sorry, I couldn't process your request. Please try again." }
      ];
      setMessages(errorMessages);
      updateConversationMessages(errorMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Only render when we have hero data
  if (!heroData) return null;

  return (
    /* CHANGE: Updated layout to remove empty space and add Marvel styling */
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 overflow-hidden">
      {/* Sidebar - Marvel-styled conversation history */}
      <motion.div 
        className={`bg-black bg-opacity-80 ${isSidebarOpen ? 'w-64' : 'w-0'} h-full flex flex-col transition-all duration-300 overflow-hidden border-r border-red-600`}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-4 border-b border-red-600 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Conversations</h2>
          <button
            onClick={createNewConversation}
            className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
          >
            <FiPlus className="text-white" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto"> {conversations.map(conv => (
            <div 
              key={conv.id}
              className={`p-3 cursor-pointer border-b border-red-600 hover:bg-red-900 hover:bg-opacity-20 transition-colors flex justify-between items-center ${
                currentConversationId === conv.id ? 'bg-red-900 bg-opacity-30' : ''
              }`}
              onClick={() => loadConversation(conv.id)}
            >
              <div className="truncate flex-1">
                <p className="text-white font-medium">{conv.title}</p>
                <p className="text-xs text-gray-400">
                  {new Date(conv.timestamp).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={(e) => deleteConversation(e, conv.id)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-red-600">
          <button
            onClick={() => navigate('/heroes')}
            className="flex items-center text-gray-300 hover:text-white transition-colors font-bold"
          >
            <FiChevronLeft className="mr-2" />
            Back to Heroes
          </button>
        </div>
      </motion.div>
      
      {/* CHANGE: Main chat area - Fixed to occupy full width */}
      <div className="flex-1 flex flex-col">
        {/* Chat header - Marvel styled */}
        <div className={`p-4 border-b border-red-600 flex items-center bg-gradient-to-r ${heroData.color}`}>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 mr-4 rounded-full bg-black bg-opacity-30 text-white hover:bg-opacity-50 transition-colors"
          >
            {isSidebarOpen ? <FiX /> : <FiMenu />}
          </button>
          
          <img 
            src={heroData.image}
            alt={heroData.name}
            className="h-10 w-10 object-cover rounded-full border-2 border-white shadow-lg"
          />
          
          <h2 className="ml-3 text-xl font-bold text-white drop-shadow-lg">
            {heroData.name}
          </h2>
        </div>
        
        {/* Messages area - Marvel styled background */}
        <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-gray-900 via-black to-gray-900">
          {/* Comic book dots pattern overlay */}
          <div className="fixed inset-0 opacity-5 pointer-events-none" 
               style={{
                 backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
                 backgroundSize: '20px 20px'
               }}>
          </div>

          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center relative z-10">
              <img 
                src={heroData.image}
                alt={heroData.name}
                className="h-32 w-32 object-contain mb-6 drop-shadow-xl"
              />
              <h3 className="text-2xl font-bold text-white mb-2">Chat with {heroData.name}</h3>
              <p className="text-gray-400 max-w-md">
                Ask anything about {heroData.name}'s adventures, powers, or personal story!
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} relative z-10`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div 
                    className={`max-w-3/4 rounded-2xl p-4 ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg' 
                        : `bg-gradient-to-r ${heroData.color} text-white shadow-xl`
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex items-center mb-2">
                        <img 
                          src={heroData.image}
                          alt={heroData.name}
                          className="h-6 w-6 object-cover rounded-full border border-white mr-2"
                        />
                        <span className="font-bold">{heroData.name}</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start mb-4 relative z-10">
                  <div className={`rounded-2xl p-4 bg-gradient-to-r ${heroData.color} text-white shadow-xl`}>
                    <div className="flex items-center">
                      <img 
                        src={heroData.image}
                        alt={heroData.name}
                        className="h-6 w-6 object-cover rounded-full border border-white mr-2"
                      />
                      <span className="font-bold">{heroData.name}</span>
                    </div>
                    <div className="mt-2 flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '600ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        
        {/* Input area - Marvel styled */}
        <div className="border-t border-red-600 p-4 bg-black bg-opacity-80">
          <div className="flex items-center gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`Ask ${heroData.name} anything...`}
              className="flex-1 bg-gray-900 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows="2"
              disabled={isLoading}
            />
            <motion.button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className={`bg-gradient-to-r from-red-600 to-red-800 text-white p-3 rounded-full shadow-lg ${
                !input.trim() || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:from-red-700 hover:to-red-900'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiSend size={20} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}