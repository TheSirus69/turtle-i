/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { Turtle } from 'lucide-react';

const AboutPage = ({ isDarkMode }) => {
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-b from-teal-50 to-teal-100 text-gray-800'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center mb-8">
          <Turtle size={64} className={`${isDarkMode ? 'text-teal-400' : 'text-teal-600'} mb-4`} />
          <h1 className="text-4xl font-bold text-center">About Turtle Internet</h1>
        </div>
        
        <div className={`max-w-3xl mx-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-8`}>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="mb-4">
              Turtle Internet is dedicated to providing a fun, safe, and diverse gaming experience for players of all ages. We curate a collection of high-quality games that can be enjoyed directly in your browser, no downloads required.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">What We Offer</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>A wide variety of browser-based games</li>
              <li>Regular updates with new and trending titles</li>
              <li>Community-driven game recommendations</li>
              <li>Safe and secure platform for all ages</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
            <p className="mb-4">
              Turtle Internet was born from a passion for accessible gaming. We believe that great games should be available to everyone, anywhere, at any time. Our team of dedicated gamers and developers work tirelessly to bring you the best browser-based gaming experience possible.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Join Our Community</h2>
            <p className="mb-4">
              We value our players and their feedback. Join our community to suggest new games, share your high scores, and connect with other gamers from around the world.
            </p>
            <div className="flex justify-center space-x-4">
              <a href="https://discord.gg/ay4s5UyDnK" className={`px-4 py-2 rounded-full ${isDarkMode ? 'bg-teal-600 hover:bg-teal-700' : 'bg-teal-500 hover:bg-teal-600'} text-white transition duration-300`}>
                Discord
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;