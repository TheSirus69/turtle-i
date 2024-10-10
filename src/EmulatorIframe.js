import React, { useEffect, useRef } from 'react';

const EmulatorIframe = ({ game, system }) => {
  console.log('EmulatorIframe render started', { game, system });
  const iframeRef = useRef(null);

  useEffect(() => {
    console.log('EmulatorIframe useEffect triggered', { gameUrl: game.gameUrl, system });

    const loadEmulator = async () => {
      console.log('loadEmulator function called');
      try {
        // Use the proxy API to fetch the ROM file
        const proxyUrl = `/api/proxy?url=${encodeURIComponent(game.gameUrl)}`;
        console.log('Proxy URL:', proxyUrl);

        const response = await fetch(proxyUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const blob = await response.blob();
        const fileUrl = URL.createObjectURL(blob);
        console.log('File URL created:', fileUrl);

        if (iframeRef.current && iframeRef.current.contentWindow) {
          console.log('Sending message to iframe');
          iframeRef.current.contentWindow.postMessage({ romUrl: fileUrl, system }, '*');
        } else {
          console.error('iframe or contentWindow not available');
        }
      } catch (error) {
        console.error("Error fetching ROM file:", error);
      }
    };

    if (iframeRef.current) {
      console.log('Setting up iframe onload');
      iframeRef.current.onload = () => {
        console.log('iframe loaded, calling loadEmulator');
        loadEmulator();
      };
    } else {
      console.error('iframeRef.current is null');
    }

    return () => {
      console.log('EmulatorIframe useEffect cleanup');
    };
  }, [game.gameUrl, system]);

  console.log('EmulatorIframe rendering iframe');
  return (
    <iframe
      ref={iframeRef}
      src="/emulator.html"
      title="Emulator"
      className="w-full h-full border-0"
      allow="fullscreen; autoplay"
    />
  );
};

export default EmulatorIframe;