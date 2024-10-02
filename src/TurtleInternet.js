/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, startAfter, getDocs, where, updateDoc, doc, increment } from 'firebase/firestore';
import { db } from './firebase';
import { Turtle, Search, ChevronDown, Github, Sun, Moon, Lock, X } from 'lucide-react';
import AdminLogin from './AdminLogin';
import AdminPage from './AdminPage';

const GameCard = ({ game, isDarkMode, onPlay }) => (
  <div className="group cursor-pointer" onClick={() => onPlay(game)}>
    <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-md overflow-hidden transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl`}>
      <img src={game.imageUrl} alt={game.name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-center">{game.name}</h3>
        <p className="text-center mt-2">Popularity: {game.popularity}</p>
        {game.categories.map(category => (
          <span key={category} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
            {category}
          </span>
        ))}
      </div>
    </div>
  </div>
);

const GamePopup = ({ game, onClose, isDarkMode }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className={`relative w-11/12 h-5/6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl`}>
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        aria-label="Close"
      >
        <X size={24} />
      </button>
      <iframe
        src={game.gameUrl || 'about:blank'}
        title={game.name}
        className="w-full h-full rounded-lg"
        allowFullScreen
      ></iframe>
    </div>
  </div>
);

const TurtleInternet = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('popularity');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [games, setGames] = useState([]);
  const [currentGame, setCurrentGame] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchGames = async () => {
    setLoading(true);
    const gamesCollection = collection(db, 'games');
    let q;
    
    if (selectedCategory) {
      q = query(gamesCollection, where('categories', 'array-contains', selectedCategory), orderBy(sortOption, 'desc'), limit(10));
    } else {
      q = query(gamesCollection, orderBy(sortOption, 'desc'), limit(10));
    }

    try {
      const snapshot = await getDocs(q);
      const fetchedGames = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      setGames(fetchedGames);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === 10);
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMoreGames = async () => {
    if (!lastVisible) return;
    setLoading(true);
    const gamesCollection = collection(db, 'games');
    let q;
    
    if (selectedCategory) {
      q = query(gamesCollection, where('categories', 'array-contains', selectedCategory), orderBy(sortOption, 'desc'), startAfter(lastVisible), limit(10));
    } else {
      q = query(gamesCollection, orderBy(sortOption, 'desc'), startAfter(lastVisible), limit(10));
    }

    try {
      const snapshot = await getDocs(q);
      const fetchedGames = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      setGames(prevGames => [...prevGames, ...fetchedGames]);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === 10);
    } catch (error) {
      console.error("Error fetching more games:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const categoriesCollection = collection(db, 'categories');
    try {
      const snapshot = await getDocs(categoriesCollection);
      const fetchedCategories = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      setCategories(fetchedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchGames();
  }, [fetchGames, selectedCategory, sortOption]);

  const handlePlayGame = async (game) => {
    setCurrentGame(game);
    const gameRef = doc(db, 'games', game.id);
    try {
      await updateDoc(gameRef, {
        popularity: increment(1),
        playCount: increment(1)
      });
    } catch (error) {
      console.error("Error updating game popularity:", error);
    }
  };

  const filteredGames = games.filter(game => 
    game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.categories.some(category => category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (showAdminLogin) {
    return <AdminLogin setIsAdmin={setIsAdmin} isDarkMode={isDarkMode} setShowAdminLogin={setShowAdminLogin} />;
  }

  if (isAdmin) {
    return <AdminPage setIsAdmin={setIsAdmin} isDarkMode={isDarkMode} />;
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-b from-teal-50 to-teal-100'}`}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-teal-600'} text-white p-4 shadow-md`}>
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3235385359348292"
      crossorigin="anonymous"></script>
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Turtle size={32} />
            <h1 className="text-2xl font-bold">Turtle Internet</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-teal-500 text-white'}`}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setShowAdminLogin(true)}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-teal-500 text-white'}`}
            >
              <Lock size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 flex-grow">
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search games or categories..."
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
          <div className="relative w-full sm:w-48">
            <select
              className={`w-full appearance-none ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-teal-500`}
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="popularity">Most Popular</option>
              <option value="name">Name (A-Z)</option>
              <option value="addedDate">Newly Added</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
          <div className="relative w-full sm:w-48">
            <select
              className={`w-full appearance-none ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-teal-500`}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>

        {loading && games.length === 0 ? (
          <p className="text-center mt-4">Loading...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGames.map((game) => (
                <GameCard 
                  key={game.id} 
                  game={game}
                  isDarkMode={isDarkMode} 
                  onPlay={handlePlayGame}
                />
              ))}
            </div>
            
            {hasMore && (
              <button onClick={fetchMoreGames} className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-auto block">
                Load More
              </button>
            )}
          </>
        )}
      </main>

      <footer className={`${isDarkMode ? 'bg-gray-800' : 'bg-[#9E9E9E]'} text-white py-6`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4 md:mb-0">
              <a href="https://github.com/TheSirus69/turtle-i" className={`hover:text-teal-200 transition-colors flex items-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-600'} px-3 py-1 rounded`}>
                <Github className="mr-2" size={20} />
                GitHub
              </a>
              <a href="https://buymeacoffee.com/thesirus69" className={`hover:text-teal-200 transition-colors ${isDarkMode ? 'bg-gray-700' : 'bg-gray-600'} px-3 py-1 rounded`}>
                Support the Project
              </a>
            </div>
            <div>
              <a href="https://forms.gle/j8jdAKeeEyZZPjQd6" className={`hover:text-teal-200 transition-colors ${isDarkMode ? 'bg-gray-700' : 'bg-gray-600'} px-3 py-1 rounded`}>
                Suggest a Game
              </a>
            </div>
          </div>
        </div>
      </footer>

      {currentGame && (
        <GamePopup 
          game={currentGame} 
          onClose={() => setCurrentGame(null)} 
          isDarkMode={isDarkMode} 
        />
      )}
    </div>
  );
};

export default TurtleInternet;