import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Hero data with Marvel-themed styling
const heroes = [
  {
    id: 'iron-man',
    name: 'Iron Man',
    realName: 'Tony Stark',
    color: 'from-yellow-500 to-red-600',
    description: 'Genius. Billionaire. Playboy. Philanthropist. The armored Avenger.',
    image: '/heroes/iron-man.png'
  },
  {
    id: 'spider-man',
    name: 'Spider-Man',
    realName: 'Peter Parker',
    color: 'from-blue-600 to-red-600',
    description: 'Your friendly neighborhood Spider-Man! With great power comes great responsibility.',
    image: '/heroes/spider-man.png'
  },
  {
    id: 'captain-america',
    name: 'Captain America',
    realName: 'Steve Rogers',
    color: 'from-blue-600 to-red-500',
    description: 'Super-soldier and leader with an unbreakable shield and moral compass.',
    image: '/heroes/captain-america.png'
  },
  {
    id: 'thor',
    name: 'Thor',
    realName: 'Thor Odinson',
    color: 'from-blue-500 to-gray-300',
    description: 'God of Thunder from Asgard wielding the mighty hammer Mjölnir.',
    image: '/heroes/thor.png'
  },
  {
    id: 'black-widow',
    name: 'Black Widow',
    realName: 'Natasha Romanoff',
    color: 'from-red-700 to-black',
    description: 'Master spy and elite assassin with a mysterious past.',
    image: '/heroes/black-widow.png'
  },
  {
    id: 'hulk',
    name: 'Hulk',
    realName: 'Bruce Banner',
    color: 'from-green-500 to-green-800',
    description: 'Brilliant scientist who transforms into an unstoppable green powerhouse when angry.',
    image: '/heroes/hulk.png'
  },
  {
    id: 'doctor-strange',
    name: 'Doctor Strange',
    realName: 'Stephen Strange',
    color: 'from-blue-400 to-purple-700',
    description: 'Master of the Mystic Arts and former surgeon who protects reality itself.',
    image: '/heroes/doctor-strange.png'
  },
  {
    id: 'scarlet-witch',
    name: 'Scarlet Witch',
    realName: 'Wanda Maximoff',
    color: 'from-red-600 to-purple-700',
    description: 'Reality-bending sorceress with chaos magic and immense power.',
    image: '/heroes/scarlet-witch.png'
  }
];

export default function HeroSelection() {
  const [hoveredHero, setHoveredHero] = useState(null);
  const [selectedHero, setSelectedHero] = useState(null);
  const navigate = useNavigate();
  const [username, setUsername] = useState('');

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('marvelChatUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUsername(user.username || 'Avenger');
      }
    } catch (err) {
      console.error('Failed to parse user data', err);
    }
  }, []);

  const handleLogout = () => {
    console.log('Logout clicked'); // Add this for debugging
    localStorage.removeItem('marvelChatToken');
    localStorage.removeItem('marvelChatUser');
    navigate('/login');
  };

  const selectHero = (hero) => {
    setSelectedHero(hero);
    setTimeout(() => {
      navigate(`/chat/${hero.id}`);
    }, 1000);
  };

  return (
    /* CHANGE: Updated background to Marvel theme with comic book pattern */
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-red-900 overflow-auto">
      {/* Comic book dots pattern overlay */}
      <div className="absolute inset-0 opacity-5" 
           style={{
             backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
             backgroundSize: '20px 20px'
           }}>
      </div>

      <div className="min-h-screen py-12 px-4">
        {/* Header with Marvel styling */}
        <motion.div 
          className="mb-16 text-center relative z-50"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1 
            className="text-6xl font-extrabold text-white"
            style={{
              textShadow: '3px 3px 6px rgba(230, 36, 41, 0.8)',
              fontFamily: '"Roboto Condensed", sans-serif'
            }}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            CHOOSE YOUR HERO
          </motion.h1>
          <p className="mt-4 text-xl text-gray-300 font-bold">Welcome back, {username}</p>

          <motion.button
            type="button"
            onClick={handleLogout}
            className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm font-bold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Logout
          </motion.button>
        </motion.div>

        {/* Heroes Grid - Updated to fix text cutoff issue */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {heroes.map((hero, index) => (
            <motion.div
              key={hero.id}
              /* CHANGE: Adjusted card height for better content fit */
              className="relative overflow-hidden rounded-xl cursor-pointer border border-gray-700"
              style={{ 
                boxShadow: '0 4px 20px rgba(230, 36, 41, 0.2)' 
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
              whileHover={{ scale: 1.05, y: -5 }}
              onClick={() => selectHero(hero)}
              onMouseEnter={() => setHoveredHero(hero.id)}
              onMouseLeave={() => setHoveredHero(null)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${hero.color} opacity-90 z-0`}></div>
              
              {/* CHANGE: Adjusted card content structure for better text display */}
              <div className="relative z-10 h-96 flex flex-col p-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white drop-shadow-lg">{hero.name}</h3>
                  <p className="text-sm text-gray-200">{hero.realName}</p>
                </div>
                
                <motion.div 
                  className="flex-1 flex items-center justify-center my-4"
                  animate={hoveredHero === hero.id ? {
                    scale: [1, 1.1, 1.05],
                    y: [0, -5, 0],
                    transition: { 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse" 
                    }
                  } : {}}
                >
                  <img 
                    src={hero.image} 
                    alt={hero.name}
                    className="h-48 object-contain drop-shadow-2xl"
                  />
                </motion.div>
                
                {/* CHANGE: Text container with better spacing and no cutoff */}
                <div className="mt-auto">
                  <p className="text-sm text-center text-white font-medium leading-relaxed">
                    {hero.description}
                  </p>
                </div>
              </div>

              {/* Selection animation overlay */}
              {selectedHero?.id === hero.id && (
                <motion.div 
                  className="absolute inset-0 bg-white z-20"
                  initial={{ scale: 0, borderRadius: "100%" }}
                  animate={{ scale: 10, borderRadius: "0%" }}
                  transition={{ duration: 0.8 }}
                />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}