import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Dashboard() {
  const [username, setUsername] = useState('');
  const [whiteboards, setWhiteboards] = useState([]);
  const [creatorEmail, setEmail] = useState('');
  const [menuOpen, setMenuOpen] = useState(null);
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

  const handleDelete = (boardId) => {
    // Custom confirmation toast
    const confirmDelete = () => {
      toast(
        ({ closeToast }) => (
          <div className="flex flex-col items-center p-4 bg-white border border-gray-200 rounded-lg shadow-md">
            <p className="text-gray-800 font-semibold mb-4">Are you sure you want to delete this whiteboard?</p>
            <div className="flex space-x-4">
              <button
                onClick={async () => {
                  closeToast(); // Close the confirmation toast
                  try {
                    const token = localStorage.getItem('token');
                    console.log('Deleting board with ID:', boardId);
                    const response = await axios.delete(`http://localhost:5001/dashboard/delete/${boardId}`, {
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    setWhiteboards(whiteboards.filter((board) => board._id !== boardId));
                    setMenuOpen(null);
                    toast.success(response.data.message, {
                      position: 'top-right',
                      autoClose: 3000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                    });
                  } catch (error) {
                    console.error('Error deleting whiteboard:', error);
                    toast.error('Failed to delete whiteboard: ' + (error.response?.data?.message || 'Unknown error'), {
                      position: 'top-right',
                      autoClose: 3000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                    });
                  }
                }}
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300"
              >
                Confirm
              </button>
              <button
                onClick={closeToast}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg font-medium transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        ),
        {
          position: 'top-center',
          autoClose: false, // Keep open until user interacts
          closeOnClick: false,
          closeButton: false,
          draggable: false,
          className: 'custom-confirm-toast',
        }
      );
    };

    // Show confirmation toast
    confirmDelete();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const toggleMenu = (boardId) => {
    setMenuOpen(menuOpen === boardId ? null : boardId);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Top Navigation/Header */}
      <header className="bg-white py-4 px-6 flex flex-col sm:flex-row justify-between items-center shadow-md">
        <div className="user-info mb-3 sm:mb-0">
          <Link to="/" className="font-extrabold text-3xl sm:text-4xl text-blue-600 tracking-tight">
            Whiteboard
          </Link>
        </div>
        <div className="header-actions flex space-x-3">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 shadow-sm"
            onClick={() => navigate('/issue')}
          >
            Issues
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 shadow-sm"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-grow p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4 sm:mb-0">
            Welcome, {username}
          </h1>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg font-medium transition-all duration-300 shadow-sm"
            onClick={() => navigate('/join')}
          >
            Join Whiteboard
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 bg-white p-6 rounded-2xl shadow-lg">
          {/* Create Board Button */}
          <button
            className="flex flex-col items-center justify-center h-48 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-6 transition-all duration-300 transform hover:scale-105 shadow-md"
            onClick={() => navigate('/board')}
          >
            <span className="text-6xl font-bold">+</span>
            <span className="text-lg font-semibold mt-2">Create Whiteboard</span>
          </button>
          {/* Existing Boards */}
          {whiteboards.map((board) => (
            <div key={board._id} className="relative group">
              <button
                onClick={() => navigate(`/board/${board._id}`, { state: { creatorEmail: creatorEmail } })}
                className="flex flex-col items-center justify-center h-48 w-full bg-white border-2 border-gray-200 hover:bg-blue-50 rounded-xl p-6 transition-all duration-300 transform hover:scale-105 shadow-md"
              >
                <span className="text-5xl font-bold text-blue-600 border-2 border-blue-200 rounded-lg px-4 py-2">
                  WB
                </span>
                <span className="text-lg font-semibold text-gray-800 mt-2">{board.title}</span>
                <span className="text-sm text-gray-500 mt-1">
                  Created: {new Date(board.createdAt).toLocaleDateString()}
                </span>
              </button>
              {/* Three-Dot Menu */}
              <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={() => toggleMenu(board._id)}
                  className="text-gray-600 hover:text-gray-800 bg-gray-100 rounded-full p-2 focus:outline-none"
                  aria-label="Board options"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01" />
                  </svg>
                </button>
                {menuOpen === board._id && (
                  <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-xl z-30">
                    <button
                      onClick={() => handleDelete(board._id)}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-4">
        <p className="text-sm">© 2025 Whiteboard Application. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Dashboard;