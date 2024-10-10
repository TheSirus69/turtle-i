import React from 'react';
import { Star, Clock, Tag, X } from 'lucide-react';

const GameDetails = ({ game, onPlay, onClose, isDarkMode }) => {
  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${isDarkMode ? 'bg-gray-900 bg-opacity-75' : 'bg-gray-100 bg-opacity-75'}`}>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className={`inline-block align-bottom ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}>
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className={`bg-transparent rounded-md text-2xl font-semibold ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-400 hover:text-gray-500'}`}
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <X size={24} />
            </button>
          </div>
          
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} px-4 pt-5 pb-4 sm:p-6 sm:pb-4`}>
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className={`text-2xl leading-6 font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                  {game.name}
                </h3>
                <div className="mb-4">
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    {game.description}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className={`flex items-center ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`}>
                    <Star className="mr-2" size={20} />
                    <span className="text-sm font-semibold">Popularity: {game.popularity}</span>
                  </div>
                  <div className={`flex items-center ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>
                    <Clock className="mr-2" size={20} />
                    <span className="text-sm font-semibold">Added: {new Date(game.addedDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center mb-4">
                  <Tag className={`mr-2 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} size={20} />
                  {game.categories.map((category, index) => (
                    <span key={index} className={`text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} px-2 py-1 rounded-full mr-2 mb-2`}>
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse`}>
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm transition duration-150 ease-in-out"
              onClick={() => onPlay(game)}
            >
              Play Game
            </button>
            <button
              type="button"
              className={`mt-3 w-full inline-flex justify-center rounded-md border ${isDarkMode ? 'border-gray-600 hover:bg-gray-600' : 'border-gray-300 hover:bg-gray-50'} shadow-sm px-4 py-2 ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700'} text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition duration-150 ease-in-out`}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetails;