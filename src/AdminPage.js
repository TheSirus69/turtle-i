import React, { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, updateDoc, doc, deleteDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { Turtle, Edit, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatisticsPieChart from './StatisticsPieChart';

const GamePreview = ({ game }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <img src={game.imageUrl || 'https://via.placeholder.com/300x200'} alt={game.name} className="w-full h-48 object-cover" />
    <div className="p-4">
      <h3 className="text-lg font-semibold text-center">{game.name || 'Game Name'}</h3>
      <p className="text-center mt-2">Popularity: {game.popularity || 0}</p>
      <div className="mt-2">
        {(game.categories ? (typeof game.categories === 'string' ? game.categories.split(',') : game.categories) : []).map((category, index) => (
          <span key={index} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
            {category.trim()}
          </span>
        ))}
      </div>
    </div>
  </div>
);

const AdminPage = ({ setIsAdmin, isDarkMode }) => {
  const [games, setGames] = useState([]);
  const [editingGame, setEditingGame] = useState(null);
  const [newGame, setNewGame] = useState({ name: '', imageUrl: '', gameUrl: '', categories: '', description: '' });
  const [activeTab, setActiveTab] = useState('games');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [gamesPerPage] = useState(10);
  const [statistics, setStatistics] = useState({
    totalGames: 0,
    totalPlays: 0,
    categoriesDistribution: [],
    topGames: []
  });

  const calculateStatistics = useCallback(() => {
    const totalGames = games.length;
    const totalPlays = games.reduce((sum, game) => sum + (game.playCount || 0), 0);
    
    const categoriesCount = games.reduce((acc, game) => {
      if (Array.isArray(game.categories)) {
        game.categories.forEach(category => {
          acc[category] = (acc[category] || 0) + 1;
        });
      } else if (typeof game.categories === 'string') {
        game.categories.split(',').forEach(category => {
          const trimmedCategory = category.trim();
          acc[trimmedCategory] = (acc[trimmedCategory] || 0) + 1;
        });
      }
      return acc;
    }, {});

    const categoriesDistribution = Object.entries(categoriesCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    const topGames = [...games]
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 10)
      .map(game => ({ name: game.name, popularity: game.popularity || 0 }));

    setStatistics({ totalGames, totalPlays, categoriesDistribution, topGames });
  }, [games]);

  const fetchGames = useCallback(async () => {
    setLoading(true);
    try {
      const gamesCollection = collection(db, 'games');
      const gamesQuery = query(gamesCollection, orderBy('name'));
      const gamesSnapshot = await getDocs(gamesQuery);
      const gamesList = gamesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGames(gamesList);
    } catch (error) {
      setError('Error fetching games: ' + error.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  useEffect(() => {
    calculateStatistics();
  }, [calculateStatistics]);

  const handleInputChange = (e, isEditing = false) => {
    const { name, value } = e.target;
    if (isEditing) {
      setEditingGame(prev => ({
        ...prev,
        [name]: name === 'categories' && Array.isArray(prev.categories)
          ? value
          : value
      }));
    } else {
      setNewGame({ ...newGame, [name]: value });
    }
  };

  const handleAddGame = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const gameToAdd = {
        ...newGame,
        categories: newGame.categories.split(',').map(cat => cat.trim()),
        popularity: 0,
        playCount: 0,
        addedDate: new Date().toISOString()
      };
      await addDoc(collection(db, 'games'), gameToAdd);
      setSuccess('Game added successfully!');
      setNewGame({ name: '', imageUrl: '', gameUrl: '', categories: '', description: '' });
      fetchGames();
    } catch (error) {
      setError('Error adding game: ' + error.message);
    }
    setLoading(false);
  };

  const handleEditGame = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const updatedGame = {
        ...editingGame,
        categories: Array.isArray(editingGame.categories)
          ? editingGame.categories
          : typeof editingGame.categories === 'string'
            ? editingGame.categories.split(',').map(cat => cat.trim())
            : []
      };
      await updateDoc(doc(db, 'games', editingGame.id), updatedGame);
      setSuccess('Game updated successfully!');
      setEditingGame(null);
      fetchGames();
    } catch (error) {
      setError('Error updating game: ' + error.message);
    }
    setLoading(false);
  };

  const handleDeleteGame = async (gameId) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      setLoading(true);
      setError('');
      setSuccess('');
      try {
        await deleteDoc(doc(db, 'games', gameId));
        setSuccess('Game deleted successfully!');
        fetchGames();
      } catch (error) {
        setError('Error deleting game: ' + error.message);
      }
      setLoading(false);
    }
  };
  const renderGameForm = (game, isEditing = false) => (
    <div className="flex space-x-4">
      <form onSubmit={isEditing ? handleEditGame : handleAddGame} className="space-y-4 flex-1">
        <input
          type="text"
          name="name"
          value={game.name}
          onChange={(e) => handleInputChange(e, isEditing)}
          placeholder="Game Name"
          className="w-full p-2 border rounded text-black"
          required
        />
        <input
          type="url"
          name="imageUrl"
          value={game.imageUrl}
          onChange={(e) => handleInputChange(e, isEditing)}
          placeholder="Image URL"
          className="w-full p-2 border rounded text-black"
          required
        />
        <input
          type="url"
          name="gameUrl"
          value={game.gameUrl}
          onChange={(e) => handleInputChange(e, isEditing)}
          placeholder="Game URL"
          className="w-full p-2 border rounded text-black"
          required
        />
        <input
          type="text"
          name="categories"
          value={game.categories}
          onChange={(e) => handleInputChange(e, isEditing)}
          placeholder="Categories (comma-separated)"
          className="w-full p-2 border rounded text-black"
          required
        />
        <textarea
          name="description"
          value={game.description}
          onChange={(e) => handleInputChange(e, isEditing)}
          placeholder="Game Description"
          className="w-full p-2 border rounded text-black"
          rows="4"
          required
        ></textarea>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={loading}
        >
          {loading ? 'Processing...' : (isEditing ? 'Update Game' : 'Add Game')}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={() => setEditingGame(null)}
            className="ml-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Cancel
          </button>
        )}
      </form>
      <div className="w-64">
        <h3 className="text-lg font-semibold mb-2">Preview</h3>
        <GamePreview game={game} />
      </div>
    </div>
  );

  const renderStatistics = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-2">Total Games: {statistics.totalGames}</h3>
          <h3 className="text-xl font-bold mb-4">Total Plays: {statistics.totalPlays}</h3>
          <h3 className="text-xl font-bold mb-2">Top 10 Games by Popularity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statistics.topGames}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="popularity" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-2">Top 10 Categories Distribution</h3>
          <StatisticsPieChart data={statistics.categoriesDistribution} />
        </div>
      </div>
    </div>
  );

  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;
  const currentGames = games.slice(indexOfFirstGame, indexOfLastGame);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-teal-600'} text-white p-4 shadow-md`}>
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Turtle size={32} />
            <h1 className="text-2xl font-bold">Turtle Internet Admin</h1>
          </div>
          <button
            onClick={() => setIsAdmin(false)}
            className={`flex items-center ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-teal-500 hover:bg-teal-400'} px-3 py-1 rounded`}
          >
            <X size={20} className="mr-2" />
            Exit Admin
          </button>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="flex mb-6 space-x-4">
          <button
            onClick={() => setActiveTab('games')}
            className={`px-4 py-2 rounded ${activeTab === 'games' ? 'bg-blue-500 text-white' : isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            Manage Games
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2 rounded ${activeTab === 'add' ? 'bg-blue-500 text-white' : isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            Add New Game
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded ${activeTab === 'stats' ? 'bg-blue-500 text-white' : isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            Statistics
          </button>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{success}</div>}

        {activeTab === 'games' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Manage Games</h2>
            {loading ? (
              <p>Loading games...</p>
            ) : (
              <>
                <ul className="space-y-4">
                  {currentGames.map(game => (
                    <li key={game.id} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded shadow flex justify-between items-center`}>
                      <span>{game.name}</span>
                      <div>
                        <button
                          onClick={() => setEditingGame(game)}
                          className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteGame(game.id)}
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="mr-2 px-4 py-2 bg-blue-500 text-white rounded"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="px-4 py-2">{currentPage}</span>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={indexOfLastGame >= games.length}
                    className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'add' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Add New Game</h2>
            {renderGameForm(newGame)}
          </div>
        )}

        {activeTab === 'stats' && renderStatistics()}

        {editingGame && (
          <div className={`fixed inset-0 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} bg-opacity-75 flex items-center justify-center`}>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg shadow-xl max-w-4xl w-full`}>
              <h2 className="text-2xl font-bold mb-4">Edit Game</h2>
              {renderGameForm(editingGame, true)}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;