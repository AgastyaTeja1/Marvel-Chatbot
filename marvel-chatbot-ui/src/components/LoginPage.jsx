import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('marvelChatToken');
    if (token) {
      navigate('/heroes');
    }
  }, [navigate]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const body = isLogin 
        ? JSON.stringify({ email, password }) 
        : JSON.stringify({ email, password, username });

      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      localStorage.setItem('marvelChatToken', data.token);
      localStorage.setItem('marvelChatUser', JSON.stringify({
        email,
        username: data.username || username,
      }));

      navigate('/heroes');
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Hero particles configuration - Updated colors to match Marvel palette
  const heroes = [
    { name: 'Iron Man', color: '#e62429', speed: 0.02 }, // Marvel red
    { name: 'Captain America', color: '#0072ce', speed: 0.03 }, // Marvel blue
    { name: 'Thor', color: '#f0db00', speed: 0.025 }, // Gold yellow
    { name: 'Hulk', color: '#5cb85c', speed: 0.015 }, // Hulk green
    { name: 'Black Widow', color: '#1a1a1a', speed: 0.04 }, // Black
    { name: 'Spider-Man', color: '#f94848', speed: 0.035 } // Spider-Man red
  ];

  // Generate particles for animation
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    hero: heroes[i % heroes.length],
    size: Math.random() * 50 + 30,
    top: Math.random() * 100,
    left: Math.random() * 100,
    delay: Math.random() * 5
  }));

  return (
    /* CHANGE: Updated the background container to use backgroundImage with proper Marvel styling */
    <div 
      className="fixed inset-0 overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/marvel-bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Background particles animation - More dramatic Marvel effects */}
      {/* <div className="absolute inset-0 overflow-hidden">
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{ 
              top: `${particle.top}%`,
              left: `${particle.left}%`,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.hero.color,
              boxShadow: `0 0 30px ${particle.hero.color}80`
            }}
            animate={{
              y: [0, -20, 20, 0],
              x: [0, 15, -15, 0],
              scale: [1, 1.2, 0.8, 1],
              opacity: [0.3, 0.6, 0.3, 0.3]
            }}
            transition={{
              duration: 12 + particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
              delay: particle.delay
            }}
          />
        ))}
      </div> */}

      {/* Comic book effect background */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <pattern id="dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="2" fill="#e62429" />
            <circle cx="20" cy="20" r="1" fill="#0072ce" />
          </pattern>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      {/* CHANGE: Marvel logo updated to use actual image */}
      <motion.div
        className="absolute top-10 w-full flex justify-center"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, type: "spring", stiffness: 50 }}
      >
        <img 
          src="/marvel-logo.png" 
          alt="Marvel Logo" 
          className="h-20 object-contain filter drop-shadow-lg"
        />
      </motion.div>

      {/* Main content container - Enhanced Marvel styling */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <motion.div 
          className="w-full max-w-md bg-black bg-opacity-90 backdrop-blur-md p-8 rounded-xl border border-red-600 shadow-2xl shadow-red-600/30"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.h1 
            className="text-4xl font-bold mb-6 text-center text-white"
            style={{
              textShadow: '2px 2px 4px rgba(230, 36, 41, 0.8)',
              fontFamily: '"Roboto Condensed", sans-serif'
            }}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Marvel Chatbot
          </motion.h1>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="flex mb-6">
              <button 
                className={`flex-1 py-2 transition-all font-bold ${
                  isLogin 
                    ? 'text-red-500 border-b-2 border-red-500' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
              <button 
                className={`flex-1 py-2 transition-all font-bold ${
                  !isLogin 
                    ? 'text-red-500 border-b-2 border-red-500' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleAuth}>
              {!isLogin && (
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2 font-bold">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-gray-300 mb-2 font-bold">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-300 mb-2 font-bold">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              {error && (
                <div className="mb-4 text-red-500 text-sm text-center">{error}</div>
              )}

              <motion.button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white font-bold py-3 rounded-lg shadow-lg hover:from-red-700 hover:to-red-900 transition-all transform active:scale-95 disabled:opacity-70"
                disabled={loading}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {loading ? 'Loading...' : isLogin ? 'Login' : 'Create Account'}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      </div>

      {/* Marvel-style animated corner decorations */}
      <div className="absolute top-0 left-0 w-32 h-32 overflow-hidden">
        <motion.div 
          className="w-full h-full"
          animate={{ 
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-full h-full bg-gradient-to-br from-red-600 to-transparent opacity-20"></div>
        </motion.div>
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32 overflow-hidden">
        <motion.div 
          className="w-full h-full"
          animate={{ 
            rotate: [360, 180, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-full h-full bg-gradient-to-tl from-blue-600 to-transparent opacity-20"></div>
        </motion.div>
      </div>
    </div>
  );
}