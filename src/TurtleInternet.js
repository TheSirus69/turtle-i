import React, { useState, useEffect, useCallback, useRef } from 'react';
import { collection, query, orderBy, limit, startAfter, getDocs, where, updateDoc, doc, increment } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { db } from './firebase';
import { Turtle, Search, Github, Sun, Moon, Lock, Info } from 'lucide-react';
import InfiniteScroll from 'react-infinite-scroll-component';
import AdminLogin from './AdminLogin';
import AdminPage from './AdminPage';
import GameDetails from './GameDetails';
import AboutPage from './AboutPage';
import GameCard from './GameCard';
import Dropdown from './Dropdown';
import GamePopup from './GamePopup';

const GAMES_PER_PAGE = 12;

const TurtleInternet = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('popularity');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [games, setGames] = useState([]);
  const [currentGame, setCurrentGame] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [showAboutPage, setShowAboutPage] = useState(false);
  const [page, setPage] = useState(0);
  const initialFetchRef = useRef(false);

  const sortOptions = [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'addedDate', label: 'Newly Added' }
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...categories.map(category => ({ value: category, label: category }))
  ];

  const fetchGames = useCallback(async (loadMore = false) => {
    console.log('Fetching games, loadMore:', loadMore, 'page:', page);
    if (loading) return;
    setLoading(true);
    try {
      const gamesCollection = collection(db, 'games');
      let q;
  
      if (selectedCategory) {
        if (loadMore && lastVisible) {
          q = query(gamesCollection, where('categories', 'array-contains', selectedCategory), orderBy(sortOption, 'desc'), startAfter(lastVisible), limit(GAMES_PER_PAGE));
        } else {
          q = query(gamesCollection, where('categories', 'array-contains', selectedCategory), orderBy(sortOption, 'desc'), limit(GAMES_PER_PAGE));
        }
      } else {
        if (loadMore && lastVisible) {
          q = query(gamesCollection, orderBy(sortOption, 'desc'), startAfter(lastVisible), limit(GAMES_PER_PAGE));
        } else {
          q = query(gamesCollection, orderBy(sortOption, 'desc'), limit(GAMES_PER_PAGE));
        }
      }
  
      const snapshot = await getDocs(q);
      const storage = getStorage();
  
      const fetchedGames = await Promise.all(snapshot.docs.map(async (doc) => {
        const data = doc.data();
        let imageUrl = data.imageUrl;
        let gameUrl = data.gameUrl;
  
        if (imageUrl && imageUrl.startsWith('gs://')) {
          try {
            const imageRef = ref(storage, imageUrl);
            imageUrl = await getDownloadURL(imageRef);
          } catch (error) {
            console.error("Error fetching image URL:", error);
            imageUrl = '/placeholder-image.jpg'; // Use a placeholder image if fetch fails
          }
        }
  
        if (data.isEmulator && gameUrl && gameUrl.startsWith('gs://')) {
          try {
            const gameRef = ref(storage, gameUrl);
            gameUrl = await getDownloadURL(gameRef);
          } catch (error) {
            console.error("Error fetching game URL:", error);
          }
        }
  
        return {
          id: doc.id,
          ...data,
          imageUrl,
          gameUrl,
          isEmulator: data.isEmulator || false,
          system: data.system || ''
        };
      }));
  
      console.log('Fetched games:', fetchedGames.length);
  
      if (loadMore) {
        setGames(prevGames => {
          const newGames = [...prevGames, ...fetchedGames];
          return Array.from(new Map(newGames.map(game => [game.id, game])).values());
        });
      } else {
        setGames(fetchedGames);
      }
  
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(fetchedGames.length === GAMES_PER_PAGE);
      if (loadMore) {
        setPage(prev => prev + 1);
      }
      console.log('Has more:', fetchedGames.length === GAMES_PER_PAGE);
    } catch (error) {
      console.error("Error fetching games:", error);
      if (error.code === 'permission-denied') {
        console.error("Permission denied. Please check your Firebase security rules.");
      }
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, sortOption, lastVisible, loading, page]);

  useEffect(() => {
    if (!initialFetchRef.current) {
      console.log('Initial fetch triggered');
      fetchGames();
      initialFetchRef.current = true;
    }
  }, [fetchGames]);

  useEffect(() => {
    if (initialFetchRef.current) {
      console.log('Effect triggered, resetting and fetching games');
      setLastVisible(null);
      setGames([]);
      setPage(0);
      fetchGames();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, sortOption]);

  useEffect(() => {
    const fetchCategories = async () => {
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      const categoriesList = categoriesSnapshot.docs.map(doc => doc.data().name);
      setCategories(categoriesList);
    };
    fetchCategories();
  }, []);

  const handlePlayGame = async (game) => {
    console.log('handlePlayGame called', { game });
    setSelectedGame(game);
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

  const handleCloseGameDetails = () => {
    setSelectedGame(null);
    setCurrentGame(null);
  };

  const launchGame = (game) => {
    setCurrentGame(game);
  };

  const handleCloseGamePopup = () => {
    setCurrentGame(null);
    setSelectedGame(null);
  };

  const toggleAboutPage = () => {
    setShowAboutPage(!showAboutPage);
  };

  const fetchMoreGames = () => {
    console.log('Fetching more games');
    if (!loading && hasMore) {
      fetchGames(true);
    }
  };

  const WelcomeContent = () => (
    <div className={`text-center py-8 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
      <h1 className="text-4xl font-bold mb-4">Welcome to Turtle Internet</h1>
      <p className="text-xl mb-6">Your gateway to a world of fun and exciting games!</p>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-3">What We Offer:</h2>
        <ul className="list-disc list-inside text-left">
          <li>A curated collection of high-quality games</li>
          <li>Regular updates with new and trending titles</li>
          <li>Easy-to-use interface for seamless gaming experience</li>
          <li>Community-driven game recommendations</li>
        </ul>
      </div>
    </div>
  );

  const filteredGames = games.filter(game => 
    game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.categories.some(category => category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderMainContent = () => (
    <>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-teal-600'} text-white p-4 shadow-md`}>
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Turtle size={32} />
            <h1 className="text-2xl font-bold">Turtle Internet</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleAboutPage}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-teal-500 text-white'}`}
            >
              <Info size={20} />
            </button>
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
        {showAboutPage ? (
          <AboutPage isDarkMode={isDarkMode} />
        ) : (
          <>
            {games.length === 0 && !loading && <WelcomeContent />}
            
            <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search games or categories..."
                  id="Search"
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
              <div className="w-full sm:w-48">
                <Dropdown
                  options={sortOptions}
                  value={sortOption}
                  onChange={setSortOption}
                  placeholder="Sort by"
                  isDarkMode={isDarkMode}
                />
              </div>
              <div className="w-full sm:w-48">
                <Dropdown
                  options={categoryOptions}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  placeholder="Select category"
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>

            <InfiniteScroll
              dataLength={filteredGames.length}
              next={fetchMoreGames}
              hasMore={hasMore}
              loader={<h4 className="text-center mt-4">Loading more games...</h4>}
              endMessage={
                <div className="text-center mt-8 mb-4">
                  <p className={`font-semibold text-lg ${isDarkMode ? 'text-teal-300' : 'text-teal-600'}`}>
                    You've reached the end of our current game collection.
                  </p>
                  <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Check back soon for new additions or suggest a game you'd like to see!
                  </p>
                </div>
              }
              scrollThreshold={0.9}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-hidden">
                {filteredGames.map((game) => (
                  <GameCard 
                    key={game.id} 
                    game={game}
                    isDarkMode={isDarkMode} 
                    onPlay={handlePlayGame}
                  />
                ))}
              </div>
            </InfiniteScroll>
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
    </>
  );

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-b from-teal-50 to-teal-100'}`}>
      {showAdminLogin && (
        <AdminLogin
          setIsAdmin={setIsAdmin}
          isDarkMode={isDarkMode}
          setShowAdminLogin={setShowAdminLogin}
        />
      )}
      {isAdmin ? (
        <AdminPage
          setIsAdmin={setIsAdmin}
          isDarkMode={isDarkMode}
        />
      ) : (
        renderMainContent()
      )}
      {selectedGame && (
        <GameDetails
          game={selectedGame}
          onPlay={launchGame}
          onClose={handleCloseGameDetails}
          isDarkMode={isDarkMode}
        />
      )}
      {currentGame && (
        <GamePopup 
          game={currentGame} 
          onClose = {handleCloseGamePopup}
          isDarkMode={isDarkMode} 
        />
      )}
    </div>
  );
};

export default TurtleInternet;