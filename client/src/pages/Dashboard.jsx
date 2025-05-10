import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
  const [username, setUsername] = useState('');
  const [whiteboards, setWhiteboards] = useState([]);
  const [creatorEmail, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUsername(decodedToken.username);
        fetchWhiteboards(decodedToken.email);
      } catch (error) {
        setUsername('Invalid Token');
        console.error("Error decoding JWT:", error);
      }
    } else {
      setUsername('Not Logged In');
      console.warn("No JWT token found.");
      navigate('/');
    }
  }, [navigate]);

  const fetchWhiteboards = async (creatorEmail) => {
    try {
      console.log(creatorEmail);
      setEmail(creatorEmail);
      const response = await axios.get('http://localhost:5001/dashboard', {
        params: { creatorEmail }
      });
      console.log(response.data);
      setWhiteboards(response.data);
    } catch (error) {
      console.error('Error fetching whiteboards:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top Navigation/Header */}
      <header className="bg-gray-100 py-3 px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center border-b border-gray-300">
        <div className="user-info mb-2 sm:mb-0">
          <Link to="/" className="font-bold text-2xl sm:text-3xl md:text-4xl cursive2 drop-shadow-xl">
            Whiteboard
          </Link>
        </div>
        <div className="header-actions flex space-x-2">
          <button className="bg-blue-600 hover:bg-blue-800 text-white py-1 px-3 sm:px-4 text-sm sm:text-base rounded-2xl transition duration-200"
            onClick={() => navigate('/issue')}>
            Issues
          </button>
          <button
            className="bg-blue-600 hover:bg-red-700 text-white py-1 px-3 sm:px-4 text-sm sm:text-base rounded-2xl transition duration-200"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-grow p-4 sm:p-6 bg-blue-100">
        <div className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-5 mb-4 sm:mb-5">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-2 sm:mb-0">
            {username}
          </h1>
          <button className="bg-blue-600 hover:bg-blue-800 text-white py-1 px-3 sm:px-4 text-sm sm:text-base rounded-2xl transition duration-200">
            Join
          </button>
        </div>
        <div className="flex flex-wrap p-4 sm:p-5 min-h-[300px] sm:min-h-[400px] bg-white rounded-2xl overflow-auto">
          {/* Create Board Button */}
          <button
            className="flex flex-col items-center justify-center h-32 w-32 sm:h-40 sm:w-40 md:h-48 md:w-48 m-2 p-4 hover:bg-blue-800 rounded-3xl text-white bg-blue-700 cursor-pointer transition duration-200"
            onClick={() => navigate('/board')}
          >
            <span className="text-5xl sm:text-7xl md:text-9xl">+</span>
            <span className="text-base sm:text-lg md:text-xl">Collaboration Create</span>
          </button>
          {/* Existing Boards */}
          {whiteboards.map((board) => (
            <button
              key={board._id}
              onClick={() => navigate(`/board/${board._id}`, { state: { creatorEmail: creatorEmail } })}
              className="flex flex-col items-center justify-center h-32 w-32 sm:h-40 sm:w-40 md:h-48 md:w-48 m-2 p-4 hover:bg-blue-600 rounded-3xl text-black border-2 bg-blue-100 cursor-pointer transition duration-200"
            >
              <span className="cursive2 text-4xl sm:text-5xl md:text-6xl py-4 sm:py-5 px-3 border-2 rounded-2xl">
                WB
              </span>
              <span className="text-base sm:text-lg md:text-xl mt-2">{board.title}</span>
              <span className="text-xs sm:text-sm mt-1">
                Created: {new Date(board.createdAt).toLocaleDateString()}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-300 text-gray-700 text-center p-2 border-t border-gray-400 text-sm sm:text-base">
        <p>© 2025 Whiteboard Application</p>
      </footer>
    </div>
  );
}

export default Dashboard;