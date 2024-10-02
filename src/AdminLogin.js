import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import { Turtle, Lock, ArrowLeft } from 'lucide-react';

const AdminLogin = ({ setIsAdmin, isDarkMode, setShowAdminLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsAdmin(true);
      setShowAdminLogin(false);
    } catch (error) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className={`max-w-md w-full space-y-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-10 rounded-lg shadow-lg`}>
        <div className="flex flex-col items-center">
          <Turtle size={48} className={`${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} />
          <h2 className={`mt-6 text-center text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Admin Login
          </h2>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  isDarkMode ? 'border-gray-700 bg-gray-700 text-white' : 'border-gray-300 text-gray-900'
                } placeholder-gray-500 rounded-t-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm`}
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  isDarkMode ? 'border-gray-700 bg-gray-700 text-white' : 'border-gray-300 text-gray-900'
                } placeholder-gray-500 rounded-b-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm`}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-teal-500 group-hover:text-teal-400" aria-hidden="true" />
              </span>
              Sign in
            </button>
          </div>
        </form>
        <button
          onClick={() => setShowAdminLogin(false)}
          className={`mt-4 w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md ${
            isDarkMode
              ? 'text-teal-400 bg-gray-700 hover:bg-gray-600'
              : 'text-teal-600 bg-white hover:bg-gray-50'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500`}
        >
          <ArrowLeft className="mr-2 h-5 w-5" aria-hidden="true" />
          Back to Main Page
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;