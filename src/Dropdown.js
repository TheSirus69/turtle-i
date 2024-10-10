import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const Dropdown = ({ options, value, onChange, placeholder, isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className={`w-full px-4 py-2 text-left ${
          isDarkMode
            ? 'bg-gray-700 text-white border-gray-600'
            : 'bg-white text-gray-900 border-gray-300'
        } border rounded-lg shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500`}
      >
        <span className={`block truncate ${value ? '' : 'text-gray-500'}`}>
          {options.find(option => option.value === value)?.label || placeholder}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDown
            className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
            aria-hidden="true"
          />
        </span>
      </button>
      {isOpen && (
        <div className={`absolute z-10 w-full mt-1 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm`}>
          {options.map((option) => (
            <div
              key={option.value}
              className={`${
                option.value === value
                  ? isDarkMode
                    ? 'text-white bg-teal-600'
                    : 'text-white bg-teal-600'
                  : isDarkMode
                  ? 'text-white'
                  : 'text-gray-900'
              } cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-teal-600 hover:text-white`}
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;