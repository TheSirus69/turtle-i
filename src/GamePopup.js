import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import EmulatorIframe from './EmulatorIframe';

const GamePopup = ({ game, onClose, isDarkMode }) => {
  console.log('GamePopup render started', { game });

  useEffect(() => {
    console.log('GamePopup useEffect triggered', { game });
    return () => console.log('GamePopup unmounted');
  }, [game]);

  if (!game) {
    console.log('GamePopup: No game provided');
    return null;
  }

  console.log('GamePopup: Preparing to render content', { isEmulator: game.isEmulator });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className={`relative w-11/12 h-5/6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl overflow-hidden`}>
        <button
          onClick={() => {
            console.log('Close button clicked');
            onClose();
          }}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 z-10"
          aria-label="Close"
        >
          <X size={24} />
        </button>
        {game.isEmulator ? (
          <EmulatorIframe game={game} system={game.system} />
        ) : (
          <iframe
            src={game.gameUrl || 'about:blank'}
            title={game.name}
            className="w-full h-full"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
};

export default GamePopup;