import React from 'react';

const GameCard = ({ game, isDarkMode, onPlay }) => (
  <div className="group cursor-pointer perspective-1000 transform-gpu" onClick={() => onPlay(game)}>
    <div className={`
      ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} 
      rounded-lg shadow-md overflow-hidden 
      transition-all duration-300 
      group-hover:shadow-xl group-hover:scale-[1.02] group-hover:-rotate-1
      relative z-10
    `}>
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-hover:opacity-50 transition-opacity duration-300 rounded-lg"></div>
      <img src={game.imageUrl} alt={game.name} className="w-full h-48 object-cover" />
      <div className="p-4 relative z-10">
        <h3 className="text-lg font-semibold text-center group-hover:text-white transition-colors duration-300">{game.name}</h3>
        <p className="text-center mt-2 group-hover:text-white transition-colors duration-300">Popularity: {game.popularity}</p>
        <div className="flex flex-wrap justify-center mt-2">
          {game.categories.map(category => (
            <span key={category} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 group-hover:bg-white group-hover:text-purple-600 transition-colors duration-300">
              {category}
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default GameCard;