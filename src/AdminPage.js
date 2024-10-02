import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { Turtle, Home, Gamepad, Tag, BarChart2, LogOut } from 'lucide-react';
import Statistics from './Statistics';

const GamePreview = ({ game, isDarkMode }) => (
  <div className={`w-64 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-md overflow-hidden`}>
    <img src={game.imageUrl || 'https://via.placeholder.com/300x200'} alt={game.name} className="w-full h-48 object-cover" />
    <div className="p-4">
      <h3 className="text-lg font-semibold text-center">{game.name || 'Game Name'}</h3>
      <p className="text-center mt-2">Popularity: {game.popularity || 0}</p>
      <div className="mt-2">
        {(game.categories ? game.categories.split(',') : []).map((category, index) => (
          <span key={index} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
            {category.trim()}
          </span>
        ))}
      </div>
    </div>
  </div>
);

const AdminPage = ({ setIsAdmin, isDarkMode }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newGame, setNewGame] = useState({ name: '', imageUrl: '', gameUrl: '', categories: '' });
  const [games, setGames] = useState([]);
  const [editingGame, setEditingGame] = useState(null);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    fetchGames();
    fetchCategories();
  }, []);

  const fetchGames = async () => {
    const gamesCollection = collection(db, 'games');
    const gamesQuery = query(gamesCollection, orderBy('name'));
    const gamesSnapshot = await getDocs(gamesQuery);
    const gamesList = gamesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setGames(gamesList);
  };

  const fetchCategories = async () => {
    const categoriesCollection = collection(db, 'categories');
    const categoriesSnapshot = await getDocs(categoriesCollection);
    const categoriesList = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCategories(categoriesList);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingGame) {
      setEditingGame({ ...editingGame, [name]: value });
    } else {
      setNewGame({ ...newGame, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const gameData = editingGame || newGame;
    const gameToAdd = {
      ...gameData,
      popularity: gameData.popularity || 0,
      playCount: gameData.playCount || 0,
      addedDate: gameData.addedDate || new Date().toISOString(),
      categories: gameData.categories.split(',').map(cat => cat.trim())
    };

    try {
      if (editingGame) {
        await updateDoc(doc(db, 'games', editingGame.id), gameToAdd);
      } else {
        await addDoc(collection(db, 'games'), gameToAdd);
      }
      setNewGame({ name: '', imageUrl: '', gameUrl: '', categories: '' });
      setEditingGame(null);
      fetchGames();
    } catch (error) {
      console.error("Error adding/updating game: ", error);
    }
  };

  const handleEdit = (game) => {
    setEditingGame(game);
    setActiveTab('addGame');
  };

  const handleDelete = async (gameId) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      try {
        await deleteDoc(doc(db, 'games', gameId));
        fetchGames();
      } catch (error) {
        console.error("Error deleting game: ", error);
      }
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (newCategory.trim() === '') return;
    try {
      await addDoc(collection(db, 'categories'), { name: newCategory.trim() });
      setNewCategory('');
      fetchCategories();
    } catch (error) {
      console.error("Error adding category: ", error);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteDoc(doc(db, 'categories', categoryId));
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category: ", error);
      }
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
            <p>Welcome to the Turtle Internet Admin Dashboard!</p>
            <p>Total Games: {games.length}</p>
            <p>Total Categories: {categories.length}</p>
          </div>
        );
      case 'addGame':
        return (
          <div className="flex">
            <div className="w-2/3 pr-8">
              <h2 className="text-2xl font-bold mb-4">{editingGame ? 'Edit Game' : 'Add New Game'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  value={editingGame ? editingGame.name : newGame.name}
                  onChange={handleInputChange}
                  placeholder="Game Name"
                  className="w-full p-2 border rounded text-black"
                  required
                />
                <input
                  type="text"
                  name="imageUrl"
                  value={editingGame ? editingGame.imageUrl : newGame.imageUrl}
                  onChange={handleInputChange}
                  placeholder="Image URL"
                  className="w-full p-2 border rounded text-black"
                  required
                />
                <input
                  type="text"
                  name="gameUrl"
                  value={editingGame ? editingGame.gameUrl : newGame.gameUrl}
                  onChange={handleInputChange}
                  placeholder="Game URL"
                  className="w-full p-2 border rounded text-black"
                  required
                />
                <input
                  type="text"
                  name="categories"
                  value={editingGame ? editingGame.categories.join(', ') : newGame.categories}
                  onChange={handleInputChange}
                  placeholder="Categories (comma-separated)"
                  className="w-full p-2 border rounded text-black"
                  required
                />
                <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                  {editingGame ? 'Update Game' : 'Add Game'}
                </button>
                {editingGame && (
                  <button 
                    type="button" 
                    onClick={() => setEditingGame(null)} 
                    className="ml-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Cancel Edit
                  </button>
                )}
              </form>
            </div>
            <div className="w-1/3">
              <h3 className="text-xl font-bold mb-4">Preview</h3>
              <GamePreview game={editingGame || newGame} isDarkMode={isDarkMode} />
            </div>
          </div>
        );
      case 'manageGames':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Manage Games</h2>
            <ul className="space-y-2">
              {games.map(game => (
                <li key={game.id} className="bg-gray-200 p-2 rounded text-black flex justify-between items-center">
                  <span>{game.name} - Popularity: {game.popularity}, Plays: {game.playCount}</span>
                  <div>
                    <button 
                      onClick={() => handleEdit(game)} 
                      className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(game.id)} 
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      case 'categories':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Manage Categories</h2>
            <form onSubmit={handleAddCategory} className="flex space-x-2 mb-4">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New Category"
                className="flex-grow p-2 border rounded text-black"
                required
              />
              <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Add Category
              </button>
            </form>
            <ul className="space-y-2">
              {categories.map(category => (
                <li key={category.id} className="flex justify-between items-center bg-gray-200 p-2 rounded text-black">
                  <span>{category.name}</span>
                  <button 
                    onClick={() => handleDeleteCategory(category.id)} 
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      case 'statistics':
        return <Statistics isDarkMode={isDarkMode} />;
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
      <aside className={`w-64 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4`}>
        <div className="flex items-center mb-8">
          <Turtle size={32} className="mr-2" />
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>
        <nav>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full text-left py-2 px-4 rounded ${activeTab === 'dashboard' ? 'bg-blue-500 text-white' : ''}`}
              >
                <Home size={20} className="inline mr-2" /> Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('addGame')}
                className={`w-full text-left py-2 px-4 rounded ${activeTab === 'addGame' ? 'bg-blue-500 text-white' : ''}`}
              >
                <Gamepad size={20} className="inline mr-2" /> Add Game
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('manageGames')}
                className={`w-full text-left py-2 px-4 rounded ${activeTab === 'manageGames' ? 'bg-blue-500 text-white' : ''}`}
              >
                <Gamepad size={20} className="inline mr-2" /> Manage Games
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('categories')}
                className={`w-full text-left py-2 px-4 rounded ${activeTab === 'categories' ? 'bg-blue-500 text-white' : ''}`}
              >
                <Tag size={20} className="inline mr-2" /> Categories
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('statistics')}
                className={`w-full text-left py-2 px-4 rounded ${activeTab === 'statistics' ? 'bg-blue-500 text-white' : ''}`}
              >
                <BarChart2 size={20} className="inline mr-2" /> Statistics
              </button>
            </li>
          </ul>
        </nav>
        <button
          onClick={() => setIsAdmin(false)}
          className="mt-8 w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
        >
          <LogOut size={20} className="mr-2" /> Logout
        </button>
      </aside>
      <main className="flex-grow p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminPage;